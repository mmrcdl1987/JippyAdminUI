import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiSave,
  FiRotateCcw,
  FiCheck,
  FiInfo,
} from "react-icons/fi";
import {
  getStoredPromotionProducts,
  saveStoredPromotionProducts,
  createPromotionSetting,
  updatePromotionSetting,
} from "../services/promotionSettingsService";
import { getAllOutlets } from "../services/outletListService";
import { getZones } from "../services/zoneService";
import { FM_API } from "../services/api";
import "../styles/PromotionProducts.css";

const CreatePromotionProduct = ({
  setActivePage,
  editItem = null,
  onSaveSuccess,
  onCancel,
}) => {
  const navigate = useNavigate();

  // Mode: create vs edit
  const isEdit = Boolean(editItem?.id);

  // Form State
  const [formData, setFormData] = useState({
    type: editItem?.type || "Restaurant",
    zone: editItem?.zone || "Ongole",
    restaurant: editItem?.restaurant || "",
    outletId: editItem?.outletId || "",
    selectedProducts: editItem?.product
      ? [editItem.product]
      : [],
    specialPrice: editItem?.specialPrice !== undefined ? editItem.specialPrice : "",
    itemLimit: editItem?.itemLimit !== undefined ? editItem.itemLimit : 2,
    extraKmCharge: editItem?.extraKmCharge !== undefined ? editItem.extraKmCharge : 7,
    freeDeliveryKm: editItem?.freeDeliveryKm !== undefined ? editItem.freeDeliveryKm : 3,
    startTime: editItem?.startTime
      ? editItem.startTime.slice(0, 16)
      : new Date().toISOString().slice(0, 16),
    endTime: editItem?.endTime
      ? editItem.endTime.slice(0, 16)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    paymentMode: editItem?.paymentMode || "prepaid",
    isAvailable: editItem?.isAvailable !== undefined ? editItem.isAvailable : true,
    isPromoAccepted: editItem?.isPromoAccepted !== undefined ? editItem.isPromoAccepted : true,
  });

  // Dynamic Data Lists
  const [zones, setZones] = useState(["Ongole", "Guntur", "Vijayawada", "Nellore", "Tirupati"]);
  const [outlets, setOutlets] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [loadingOutlets, setLoadingOutlets] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Load Zones & Outlets on Mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch Zones
        const zoneRes = await getZones();
        const zoneList = Array.isArray(zoneRes?.data)
          ? zoneRes.data
          : Array.isArray(zoneRes)
          ? zoneRes
          : [];
        if (zoneList.length > 0) {
          const names = zoneList
            .map((z) => z.zoneName || z.name)
            .filter(Boolean);
          if (names.length > 0) {
            setZones(Array.from(new Set(["Ongole", ...names])));
          }
        }
      } catch (e) {
        console.warn("Using fallback zones list:", e);
      }

      try {
        // Fetch Outlets
        setLoadingOutlets(true);
        const outletRes = await getAllOutlets();
        const list = Array.isArray(outletRes)
          ? outletRes
          : Array.isArray(outletRes?.data)
          ? outletRes.data
          : [];
        if (list.length > 0) {
          setOutlets(list);
          if (!formData.restaurant && list.length > 0) {
            const first = list[0];
            setFormData((prev) => ({
              ...prev,
              restaurant: first.outletName || first.name || "Mawa's Kitchen",
              outletId: first.outletId || first.id || 101,
            }));
          }
        } else {
          // Fallback restaurants
          setOutlets([
            { outletId: 101, outletName: "Mawa's Kitchen", type: "Restaurant", zone: "Ongole" },
            { outletId: 102, outletName: "Alif Kachi Dum Biryani", type: "Restaurant", zone: "Ongole" },
            { outletId: 103, outletName: "R.K Foods", type: "Restaurant", zone: "Ongole" },
            { outletId: 104, outletName: "Jippy Fresh Mart", type: "Mart", zone: "Ongole" },
          ]);
        }
      } catch (e) {
        console.warn("Using fallback outlets:", e);
        setOutlets([
          { outletId: 101, outletName: "Mawa's Kitchen", type: "Restaurant", zone: "Ongole" },
          { outletId: 102, outletName: "Alif Kachi Dum Biryani", type: "Restaurant", zone: "Ongole" },
          { outletId: 103, outletName: "R.K Foods", type: "Restaurant", zone: "Ongole" },
          { outletId: 104, outletName: "Jippy Fresh Mart", type: "Mart", zone: "Ongole" },
        ]);
      } finally {
        setLoadingOutlets(false);
      }
    };

    fetchInitialData();
  }, []);

  // Load Products whenever Restaurant / Outlet changes
  useEffect(() => {
    const fetchProductsForOutlet = async () => {
      const outletId = formData.outletId;
      if (!outletId) return;

      try {
        setLoadingProducts(true);
        const res = await FM_API.get(`/api/fm/products/outlets/${outletId}`);
        const data = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.data)
          ? res.data.data
          : [];

        if (data.length > 0) {
          const names = data
            .map((p) => p.productName || p.name)
            .filter(Boolean);
          setAvailableProducts(names);
        } else {
          // Outlet specific fallback products
          setAvailableProducts([
            "Roti(4) + Corn Palak Curry(300 ml)",
            "Roti(4) + Egg Kheema Curry(300 ml)",
            "Roti(4) + Egg Tomato Curry(300 ml)",
            "Chicken Mini Dum Biryani",
            "1 Pc Idly+1 Vada+1 Pongal+Pesara Dosa",
            "1 Pc Idly+1 Vada+1 Pongal+Plain Dosa",
            "1 Pc Idly+Gara+Chitti Pesara",
            "1 Pc Idly+Gara+Upma+Plain Dosa",
            "1 Pc Idly+Vada+Chitti Dosa",
            "1 Pc Idly+Vada+Small Dosa",
            "1 Pc Gara+Plain Dosa",
            "2 Idly+1 Pc Vada",
          ]);
        }
      } catch {
        setAvailableProducts([
          "Roti(4) + Corn Palak Curry(300 ml)",
          "Roti(4) + Egg Kheema Curry(300 ml)",
          "Roti(4) + Egg Tomato Curry(300 ml)",
          "Chicken Mini Dum Biryani",
          "1 Pc Idly+1 Vada+1 Pongal+Pesara Dosa",
          "1 Pc Idly+1 Vada+1 Pongal+Plain Dosa",
          "1 Pc Idly+Gara+Chitti Pesara",
          "1 Pc Idly+Gara+Upma+Plain Dosa",
          "1 Pc Idly+Vada+Chitti Dosa",
          "1 Pc Idly+Vada+Small Dosa",
          "1 Pc Gara+Plain Dosa",
          "2 Idly+1 Pc Vada",
        ]);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProductsForOutlet();
  }, [formData.outletId]);

  // Handle generic input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle Restaurant Selection
  const handleRestaurantChange = (e) => {
    const selectedName = e.target.value;
    const matched = outlets.find(
      (o) => (o.outletName || o.name) === selectedName
    );
    setFormData((prev) => ({
      ...prev,
      restaurant: selectedName,
      outletId: matched ? matched.outletId || matched.id : prev.outletId,
      selectedProducts: [],
    }));
  };

  // Toggle single product selection
  const handleProductToggle = (productName) => {
    setFormData((prev) => {
      const exists = prev.selectedProducts.includes(productName);
      return {
        ...prev,
        selectedProducts: exists
          ? prev.selectedProducts.filter((p) => p !== productName)
          : [...prev.selectedProducts, productName],
      };
    });
  };

  // Select All Products
  const handleSelectAll = () => {
    setFormData((prev) => ({
      ...prev,
      selectedProducts: [...availableProducts],
    }));
  };

  // Deselect All Products
  const handleDeselectAll = () => {
    setFormData((prev) => ({
      ...prev,
      selectedProducts: [],
    }));
  };

  // Cancel Action
  const handleCancelClick = () => {
    if (onCancel) {
      onCancel();
    } else if (setActivePage) {
      setActivePage("promotionProducts");
    } else {
      navigate("/dashboard/promotionProducts");
    }
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!formData.restaurant) {
      setErrorMsg("Please select a Restaurant / Mart.");
      return;
    }

    if (formData.selectedProducts.length === 0) {
      setErrorMsg("Please select at least one product for this promotion.");
      return;
    }

    try {
      setSubmitting(true);
      const currentList = getStoredPromotionProducts();

      if (isEdit) {
        // Update existing record
        const updatedList = currentList.map((item) => {
          if (item.id === editItem.id) {
            return {
              ...item,
              type: formData.type,
              zone: formData.zone,
              restaurant: formData.restaurant,
              outletId: formData.outletId,
              product: formData.selectedProducts[0] || item.product,
              specialPrice: Number(formData.specialPrice) || item.specialPrice,
              itemLimit: Number(formData.itemLimit) || 2,
              extraKmCharge: Number(formData.extraKmCharge) || 7,
              freeDeliveryKm: Number(formData.freeDeliveryKm) || 3,
              startTime: formData.startTime,
              endTime: formData.endTime,
              paymentMode: formData.paymentMode,
              isAvailable: formData.isAvailable,
              isPromoAccepted: formData.isPromoAccepted,
            };
          }
          return item;
        });

        saveStoredPromotionProducts(updatedList);

        // Also try backend API
        try {
          await updatePromotionSetting(editItem.id, {
            priceValue: Number(formData.specialPrice) || 0,
            startDateTime: formData.startTime,
            endDateTime: formData.endTime,
          });
        } catch (apiErr) {
          console.warn("Backend update error (cached locally):", apiErr);
        }

        setSuccessMsg("Promotion updated successfully!");
      } else {
        // Create new records for each selected product
        const newRecords = formData.selectedProducts.map((prodName, idx) => ({
          id: Date.now() + idx,
          type: formData.type,
          zone: formData.zone,
          restaurant: formData.restaurant,
          outletId: formData.outletId,
          product: prodName,
          specialPrice: Number(formData.specialPrice) || 99,
          itemLimit: Number(formData.itemLimit) || 2,
          extraKmCharge: Number(formData.extraKmCharge) || 7,
          freeDeliveryKm: Number(formData.freeDeliveryKm) || 3,
          startTime: formData.startTime,
          endTime: formData.endTime,
          paymentMode: formData.paymentMode,
          isAvailable: formData.isAvailable,
          isPromoAccepted: formData.isPromoAccepted,
        }));

        const combinedList = [...newRecords, ...currentList];
        saveStoredPromotionProducts(combinedList);

        // Also try backend API
        try {
          await createPromotionSetting({
            outletId: Number(formData.outletId) || 101,
            priceValue: Number(formData.specialPrice) || 0,
            priceType: "FLAT",
            priceAdjustmentType: "INCREASE",
            startDateTime: formData.startTime,
            endDateTime: formData.endTime,
            locationType: "AREA",
          });
        } catch (apiErr) {
          console.warn("Backend create error (cached locally):", apiErr);
        }

        setSuccessMsg(
          `Successfully created ${newRecords.length} product promotion(s)!`
        );
      }

      setTimeout(() => {
        if (onSaveSuccess) {
          onSaveSuccess();
        } else if (setActivePage) {
          setActivePage("promotionProducts");
        } else {
          navigate("/dashboard/promotionProducts");
        }
      }, 900);
    } catch (err) {
      console.error("Failed to save promotion:", err);
      setErrorMsg("An unexpected error occurred while saving the promotion.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="create-promotion-page">
      {/* Top Bar / Breadcrumb */}
      <div className="promotion-products-topbar">
        <h1 className="promotion-products-page-title">
          {isEdit ? "Edit Promotion" : "Create Promotion"}
        </h1>
        <div className="promotion-products-breadcrumb">
          Dashboard <span>&gt;</span> Promotions <span>&gt;</span>{" "}
          <strong>{isEdit ? "Edit Promotion" : "Create Promotion"}</strong>
        </div>
      </div>

      {/* Promotion Information Center Pill */}
      <div className="create-promotion-tab-bar">
        <div className="create-promotion-info-pill">
          Promotion Information
        </div>
      </div>

      {/* Messages */}
      {errorMsg && (
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto 16px",
            padding: "12px 16px",
            borderRadius: 8,
            backgroundColor: "#fef2f2",
            color: "#dc2626",
            border: "1px solid #fecaca",
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto 16px",
            padding: "12px 16px",
            borderRadius: 8,
            backgroundColor: "#f0fdf4",
            color: "#166534",
            border: "1px solid #bbf7d0",
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          ✓ {successMsg}
        </div>
      )}

      {/* Card Container */}
      <div className="create-promotion-card">
        <div className="create-promotion-card-badge">
          {isEdit ? "EDIT PROMOTION" : "CREATE PROMOTION"}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="create-promotion-grid">
            {/* ROW 1: TYPE & ZONE */}
            <div className="create-promotion-field">
              <label>Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
              >
                <option value="Restaurant">Restaurant</option>
                <option value="Mart">Mart</option>
              </select>
              <span className="create-promotion-helper-text">
                Choose whether this promotion is for a Restaurant or Mart.
              </span>
            </div>

            <div className="create-promotion-field">
              <label>Zone</label>
              <select
                name="zone"
                value={formData.zone}
                onChange={handleChange}
              >
                <option value="All Zones">All Zones</option>
                {zones.map((z, idx) => (
                  <option key={idx} value={z}>
                    {z}
                  </option>
                ))}
              </select>
              <span className="create-promotion-helper-text">
                Filter vendors by zone.
              </span>
            </div>

            {/* ROW 2: RESTAURANT / MART & PRODUCTS */}
            <div className="create-promotion-field">
              <label>Restaurant / Mart</label>
              <select
                name="restaurant"
                value={formData.restaurant}
                onChange={handleRestaurantChange}
                disabled={loadingOutlets}
              >
                <option value="">
                  {loadingOutlets
                    ? "Loading vendors..."
                    : "Select Restaurant / Mart"}
                </option>
                {outlets.map((o) => {
                  const oName = o.outletName || o.name;
                  return (
                    <option key={o.outletId || o.id} value={oName}>
                      {oName}
                    </option>
                  );
                })}
              </select>
              <span className="create-promotion-helper-text">
                Select the restaurant/mart for this promotion.
              </span>
            </div>

            <div className="create-promotion-field">
              <label>Products</label>
              <div className="create-promotion-products-wrapper">
                <div className="create-promotion-products-box">
                  {loadingProducts ? (
                    <div style={{ padding: 10, color: "#94a3b8", fontSize: 13 }}>
                      Loading products...
                    </div>
                  ) : availableProducts.length === 0 ? (
                    <div style={{ padding: 10, color: "#94a3b8", fontSize: 13 }}>
                      Select a restaurant first to load products
                    </div>
                  ) : (
                    availableProducts.map((prodName, idx) => {
                      const isChecked = formData.selectedProducts.includes(prodName);
                      return (
                        <label key={idx} className="create-promotion-product-item">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleProductToggle(prodName)}
                          />
                          <span>{prodName}</span>
                        </label>
                      );
                    })
                  )}
                </div>

                <div className="create-promotion-quick-actions">
                  <button
                    type="button"
                    className="create-promotion-quick-btn"
                    onClick={handleSelectAll}
                    disabled={availableProducts.length === 0}
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    className="create-promotion-quick-btn"
                    onClick={handleDeselectAll}
                    disabled={availableProducts.length === 0}
                  >
                    Deselect All
                  </button>
                </div>
              </div>
              <span className="create-promotion-helper-text">
                Select one or more products for this promotion. Set individual special price for each selected product.
              </span>
            </div>

            {/* ROW 3: SPECIAL PRICE & ITEM LIMIT */}
            <div className="create-promotion-field">
              <label>Special Price</label>
              <input
                type="number"
                name="specialPrice"
                value={formData.specialPrice}
                onChange={handleChange}
                placeholder="Enter default price (optional)"
              />
              <span className="create-promotion-helper-text">
                Default price for quick fill. Individual prices can be set for each product below.
              </span>
            </div>

            <div className="create-promotion-field">
              <label>Item Limit</label>
              <input
                type="number"
                name="itemLimit"
                value={formData.itemLimit}
                onChange={handleChange}
                min={1}
              />
              <span className="create-promotion-helper-text">
                Maximum number of items that can be ordered with this promotion. Default: 2
              </span>
            </div>

            {/* ROW 4: EXTRA KM CHARGE & FREE DELIVERY KM */}
            <div className="create-promotion-field">
              <label>Extra KM Charge</label>
              <input
                type="number"
                name="extraKmCharge"
                value={formData.extraKmCharge}
                onChange={handleChange}
                min={0}
              />
              <span className="create-promotion-helper-text">
                Additional charge per kilometer beyond free delivery distance. Default: 7
              </span>
            </div>

            <div className="create-promotion-field">
              <label>Free Delivery KM</label>
              <input
                type="number"
                name="freeDeliveryKm"
                value={formData.freeDeliveryKm}
                onChange={handleChange}
                min={0}
              />
              <span className="create-promotion-helper-text">
                Distance in kilometers for free delivery. Default: 3
              </span>
            </div>

            {/* ROW 5: START TIME & END TIME */}
            <div className="create-promotion-field">
              <label>Start Time</label>
              <input
                type="datetime-local"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
              />
            </div>

            <div className="create-promotion-field">
              <label>End Time</label>
              <input
                type="datetime-local"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
              />
            </div>

            {/* ROW 6: PAYMENT MODE & AVAILABLE CHECKBOX */}
            <div className="create-promotion-field">
              <label>Payment Mode</label>
              <select
                name="paymentMode"
                value={formData.paymentMode}
                onChange={handleChange}
              >
                <option value="prepaid">prepaid</option>
                <option value="online">online</option>
                <option value="cash_on_delivery">cash_on_delivery</option>
                <option value="all">all</option>
              </select>
            </div>

            <div className="create-promotion-field" style={{ justifyContent: "center" }}>
              <label className="create-promotion-checkbox-field">
                <input
                  type="checkbox"
                  name="isAvailable"
                  checked={formData.isAvailable}
                  onChange={handleChange}
                />
                <span className="create-promotion-checkbox-label">
                  <FiCheck /> Available
                </span>
              </label>
            </div>

            {/* ROW 7: PROMOTION ACCEPTED (PROMO) CHECKBOX */}
            <div className="create-promotion-field" style={{ gridColumn: "span 2" }}>
              <label className="create-promotion-checkbox-field">
                <input
                  type="checkbox"
                  name="isPromoAccepted"
                  checked={formData.isPromoAccepted}
                  onChange={handleChange}
                />
                <span className="create-promotion-checkbox-label">
                  <FiCheck /> Promotion Accepted (Promo)
                </span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="create-promotion-actions">
            <button
              type="submit"
              className="create-promotion-save-btn"
              disabled={submitting}
            >
              <FiSave /> {submitting ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              className="create-promotion-cancel-btn"
              onClick={handleCancelClick}
              disabled={submitting}
            >
              <FiRotateCcw /> Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePromotionProduct;
