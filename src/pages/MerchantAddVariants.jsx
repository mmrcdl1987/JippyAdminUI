import React, { useState, useEffect } from "react";
import {
  FiSearch,
  FiArrowLeft,
  FiPlus,
  FiShoppingBag,
  FiPhone,
  FiMail,
  FiTrash2,
  FiEdit2,
  FiChevronLeft,
  FiChevronRight,
  FiMapPin,
  FiBox,
  FiLayers,
  FiCheck,
  FiSave,
  FiDollarSign,
  FiZap,
} from "react-icons/fi";
import {
  getAllMerchants,
  getOutletsByMerchant,
  getProductsByOutlet,
} from "../services/merchantService";
import "../styles/MerchantAddVariants.css";

const MerchantAddVariants = () => {
  // Server State - Merchants
  const [allMerchants, setAllMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination & Search State
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");

  // Server State - Outlets for Selected Merchant
  const [selectedMerchant, setSelectedMerchant] = useState(null);
  const [outletsList, setOutletsList] = useState([]);
  const [loadingOutlets, setLoadingOutlets] = useState(false);
  const [outletsError, setOutletsError] = useState(null);

  // Server State - Products for Selected Outlet
  const [selectedOutlet, setSelectedOutlet] = useState(null);
  const [productsList, setProductsList] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productsError, setProductsError] = useState(null);

  // Selection State for Product Checkboxes
  const [selectedProducts, setSelectedProducts] = useState([]);

  // State to store custom editable variant prices, merchant prices, online prices, and DB schema attributes in side panel
  const [selectedProductConfigs, setSelectedProductConfigs] = useState({});

  // Modal State for Single Item Add Variant
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newVariant, setNewVariant] = useState({
    name: "",
    productVariantGroupsId: "",
    productVariantGroupValuesId: "",
    variantPrice: "",
    merchantPrice: "",
    onlinePrice: "",
    priceType: "FIXED",
  });

  // Bulk Master Inputs at the top of the side drawer
  const [bulkVariantPrice, setBulkVariantPrice] = useState("");
  const [bulkMerchantPrice, setBulkMerchantPrice] = useState("");
  const [bulkOnlinePrice, setBulkOnlinePrice] = useState("");
  const [bulkProductVariantGroupsId, setBulkProductVariantGroupsId] = useState("");
  const [bulkProductVariantGroupValuesId, setBulkProductVariantGroupValuesId] = useState("");

  // Master Lists matching DB Schema tables: product_variant_groups & product_variant_group_values
  const [variantGroups] = useState([
    { productVariantGroupsId: 1, group_name: "Size", selection_type: "SINGLE" },
    { productVariantGroupsId: 2, group_name: "Flavor", selection_type: "SINGLE" },
    { productVariantGroupsId: 3, group_name: "Portion", selection_type: "SINGLE" },
    { productVariantGroupsId: 4, group_name: "Add-ons", selection_type: "MULTIPLE" },
  ]);

  const [variantGroupValues] = useState([
    { productVariantGroupValuesId: 101, productVariantGroupsId: 1, variant_name: "Small" },
    { productVariantGroupValuesId: 102, productVariantGroupsId: 1, variant_name: "Medium" },
    { productVariantGroupValuesId: 103, productVariantGroupsId: 1, variant_name: "Large" },
    { productVariantGroupValuesId: 201, productVariantGroupsId: 2, variant_name: "Mango" },
    { productVariantGroupValuesId: 202, productVariantGroupsId: 2, variant_name: "Vanilla" },
    { productVariantGroupValuesId: 301, productVariantGroupsId: 3, variant_name: "Regular" },
    { productVariantGroupValuesId: 302, productVariantGroupsId: 3, variant_name: "Family Pack" },
    { productVariantGroupValuesId: 401, productVariantGroupsId: 4, variant_name: "Extra Cheese" },
  ]);

  // Helper function to allow only valid numeric / decimal input values
  const handleNumericInput = (value) => {
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      return value;
    }
    return null;
  };

  // Fetch all merchants on initial load
  const loadMerchants = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllMerchants();
      let list = [];
      if (Array.isArray(data)) {
        list = data;
      } else if (Array.isArray(data?.data)) {
        list = data.data;
      } else if (Array.isArray(data?.content)) {
        list = data.content;
      }
      setAllMerchants(list);
    } catch (err) {
      console.error("Fetch Merchants Error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch merchants from server."
      );
      setAllMerchants([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMerchants();
  }, []);

  // Fetch Outlets by Selected Merchant ID
  const handleSelectMerchant = async (merchant) => {
    setSelectedMerchant(merchant);
    setSelectedOutlet(null);
    setOutletsList([]);
    setLoadingOutlets(true);
    setOutletsError(null);

    try {
      const data = await getOutletsByMerchant(merchant.merchantId);
      let list = [];
      if (Array.isArray(data)) {
        list = data;
      } else if (Array.isArray(data?.data)) {
        list = data.data;
      } else if (Array.isArray(data?.outlets)) {
        list = data.outlets;
      } else if (Array.isArray(data?.content)) {
        list = data.content;
      }
      setOutletsList(list);
    } catch (err) {
      console.error("Failed to load outlets:", err);
      setOutletsError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load outlets for this merchant."
      );
    } finally {
      setLoadingOutlets(false);
    }
  };

  // Fetch Products by Selected Outlet ID
  const handleSelectOutlet = async (outlet) => {
    const outletId = outlet.outletId || outlet.id;
    setSelectedOutlet(outlet);
    setProductsList([]);
    setSelectedProducts([]);
    setSelectedProductConfigs({});
    setLoadingProducts(true);
    setProductsError(null);

    try {
      const data = await getProductsByOutlet(outletId);
      let list = [];
      if (Array.isArray(data)) {
        list = data;
      } else if (Array.isArray(data?.data)) {
        list = data.data;
      } else if (Array.isArray(data?.products)) {
        list = data.products;
      } else if (Array.isArray(data?.content)) {
        list = data.content;
      }

      const formattedList = list.map((item, idx) => ({
        ...item,
        productVariantOptionsId: item.productVariantOptionsId || item.id || idx + 1,
        product_id: item.product_id || item.productId || item.id || 1,
        productVariantGroupsId: item.productVariantGroupsId || item.group_id || "",
        productVariantGroupValuesId: item.productVariantGroupValuesId || item.variant_value_id || "",
        variantPrice: item.variantPrice ?? item.price ?? 0,
        merchantPrice: item.merchantPrice ?? item.basePrice ?? 0,
        onlinePrice: item.onlinePrice ?? item.digitalPrice ?? 0,
        priceType: item.priceType || "FIXED",
        is_active: item.is_active ?? true,
      }));

      setProductsList(formattedList);
    } catch (err) {
      console.error("Failed to load products:", err);
      setProductsError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load products for this outlet."
      );
    } finally {
      setLoadingProducts(false);
    }
  };

  // Checkbox Handlers
  const handleSelectAllProducts = (e) => {
    if (e.target.checked) {
      const allKeys = productsList.map((product, index) => {
        const productId = product.product_id || product.productId || product.id;
        const optionId = product.productVariantOptionsId;
        return optionId ? `${productId}-${optionId}` : `${productId}-${index}`;
      });
      setSelectedProducts(allKeys);

      const newConfigs = {};
      productsList.forEach((product, index) => {
        const productId = product.product_id || product.productId || product.id;
        const optionId = product.productVariantOptionsId;
        const uniqueKey = optionId ? `${productId}-${optionId}` : `${productId}-${index}`;
        newConfigs[uniqueKey] = {
          productVariantGroupsId: product.productVariantGroupsId || "",
          productVariantGroupValuesId: product.productVariantGroupValuesId || "",
          variantPrice: product.variantPrice ?? "",
          merchantPrice: product.merchantPrice ?? "",
          onlinePrice: product.onlinePrice ?? "",
          priceType: product.priceType || "FIXED",
        };
      });
      setSelectedProductConfigs(newConfigs);
    } else {
      setSelectedProducts([]);
      setSelectedProductConfigs({});
    }
  };

  const handleSelectProductCheckbox = (e, product, uniqueKey) => {
    e.stopPropagation();
    const isChecked = e.target.checked;

    setSelectedProducts((prev) => {
      return isChecked ? [...prev, uniqueKey] : prev.filter((key) => key !== uniqueKey);
    });

    setSelectedProductConfigs((prev) => {
      const updated = { ...prev };
      if (isChecked) {
        updated[uniqueKey] = {
          productVariantGroupsId: product.productVariantGroupsId || "",
          productVariantGroupValuesId: product.productVariantGroupValuesId || "",
          variantPrice: product.variantPrice ?? "",
          merchantPrice: product.merchantPrice ?? "",
          onlinePrice: product.onlinePrice ?? "",
          priceType: product.priceType || "FIXED",
        };
      } else {
        delete updated[uniqueKey];
      }
      return updated;
    });
  };

  const handleConfigChange = (uniqueKey, field, value) => {
    if (["variantPrice", "merchantPrice", "onlinePrice"].includes(field)) {
      const validatedVal = handleNumericInput(value);
      if (validatedVal === null) return;
      value = validatedVal;
    }

    setSelectedProductConfigs((prev) => ({
      ...prev,
      [uniqueKey]: {
        ...prev[uniqueKey],
        [field]: value,
      },
    }));
  };

  const handleBulkChange = (field, value) => {
    if (["variantPrice", "merchantPrice", "onlinePrice"].includes(field)) {
      const validatedVal = handleNumericInput(value);
      if (validatedVal === null) return;
      value = validatedVal;
    }

    if (field === "variantPrice") setBulkVariantPrice(value);
    if (field === "merchantPrice") setBulkMerchantPrice(value);
    if (field === "onlinePrice") setBulkOnlinePrice(value);
    if (field === "productVariantGroupsId") setBulkProductVariantGroupsId(value);
    if (field === "productVariantGroupValuesId") setBulkProductVariantGroupValuesId(value);
  };

  const filteredMerchants = allMerchants.filter((merchant) => {
    const term = searchQuery.toLowerCase();
    const name = (merchant.merchantName || "").toLowerCase();
    const email = (merchant.merchantEmail || "").toLowerCase();
    const phone = (merchant.merchantPhone || "").toLowerCase();
    const type = (merchant.merchantBusinessType || "").toLowerCase();
    const id = String(merchant.merchantId || "");

    return (
      name.includes(term) ||
      email.includes(term) ||
      phone.includes(term) ||
      type.includes(term) ||
      id.includes(term)
    );
  });

  const totalPages = Math.ceil(filteredMerchants.length / pageSize) || 1;
  const startIndex = currentPage * pageSize;
  const currentMerchants = filteredMerchants.slice(
    startIndex,
    startIndex + pageSize
  );

  const handleAddVariantSubmit = (e) => {
    e.preventDefault();
    if (!newVariant.name || !newVariant.variantPrice) return;

    setProductsList((prev) => [
      ...prev,
      {
        productVariantOptionsId: Date.now(),
        product_id: Date.now() + 1,
        productName: newVariant.name,
        productVariantGroupsId: newVariant.productVariantGroupsId
          ? Number(newVariant.productVariantGroupsId)
          : null,
        productVariantGroupValuesId: newVariant.productVariantGroupValuesId
          ? Number(newVariant.productVariantGroupValuesId)
          : null,
        variantPrice: parseFloat(newVariant.variantPrice),
        merchantPrice: newVariant.merchantPrice ? parseFloat(newVariant.merchantPrice) : 0,
        onlinePrice: newVariant.onlinePrice ? parseFloat(newVariant.onlinePrice) : 0,
        priceType: newVariant.priceType,
        is_active: true,
      },
    ]);

    setNewVariant({
      name: "",
      productVariantGroupsId: "",
      productVariantGroupValuesId: "",
      variantPrice: "",
      merchantPrice: "",
      onlinePrice: "",
      priceType: "FIXED",
    });
    setIsModalOpen(false);
  };

  // Applies Master Fill to Input Drafts
  const handleApplyBulkValues = () => {
    setSelectedProductConfigs((prev) => {
      const updated = { ...prev };
      selectedProducts.forEach((key) => {
        const currentConfig = updated[key] || {};
        updated[key] = {
          productVariantGroupsId:
            bulkProductVariantGroupsId !== ""
              ? bulkProductVariantGroupsId
              : currentConfig.productVariantGroupsId || "",
          productVariantGroupValuesId:
            bulkProductVariantGroupValuesId !== ""
              ? bulkProductVariantGroupValuesId
              : currentConfig.productVariantGroupValuesId || "",
          variantPrice:
            bulkVariantPrice !== "" ? bulkVariantPrice : currentConfig.variantPrice || "",
          merchantPrice:
            bulkMerchantPrice !== "" ? bulkMerchantPrice : currentConfig.merchantPrice || "",
          onlinePrice:
            bulkOnlinePrice !== "" ? bulkOnlinePrice : currentConfig.onlinePrice || "",
          priceType: currentConfig.priceType || "FIXED",
        };
      });
      return updated;
    });
  };

  // Bulk Preview & Update Button: Commits all configurations at once
  const handleCommitConfigurations = (e) => {
    e.preventDefault();
    if (selectedProducts.length === 0) return;

    setProductsList((prevList) =>
      prevList.map((product, index) => {
        const productId = product.product_id || product.productId || product.id;
        const optionId = product.productVariantOptionsId;
        const uniqueKey = optionId ? `${productId}-${optionId}` : `${productId}-${index}`;

        if (selectedProducts.includes(uniqueKey) && selectedProductConfigs[uniqueKey]) {
          const config = selectedProductConfigs[uniqueKey];
          return {
            ...product,
            productVariantGroupsId:
              config.productVariantGroupsId !== ""
                ? Number(config.productVariantGroupsId)
                : product.productVariantGroupsId,
            productVariantGroupValuesId:
              config.productVariantGroupValuesId !== ""
                ? Number(config.productVariantGroupValuesId)
                : product.productVariantGroupValuesId,
            variantPrice:
              config.variantPrice !== ""
                ? parseFloat(config.variantPrice)
                : product.variantPrice,
            merchantPrice:
              config.merchantPrice !== ""
                ? parseFloat(config.merchantPrice)
                : product.merchantPrice,
            onlinePrice:
              config.onlinePrice !== ""
                ? parseFloat(config.onlinePrice)
                : product.onlinePrice,
          };
        }
        return product;
      })
    );

    setSelectedProducts([]);
    setSelectedProductConfigs({});
    setBulkVariantPrice("");
    setBulkMerchantPrice("");
    setBulkOnlinePrice("");
    setBulkProductVariantGroupsId("");
    setBulkProductVariantGroupValuesId("");
  };

  const handleDeleteOutlet = (outletId) => {
    setOutletsList((prev) =>
      prev.filter((item) => (item.outletId || item.id) !== outletId)
    );
  };

  return (
    <div className="add-variants-container" style={{ background: "#f8fafc", minHeight: "100vh", padding: "24px" }}>
      {/* VIEW 1: MERCHANT SELECTION */}
      {!selectedMerchant ? (
        <div className="merchant-selection-view">
          <div className="page-header" style={{ marginBottom: "20px" }}>
            <div>
              <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#0f172a" }}>
                Add Merchant Variants
              </h2>
              <p className="subtitle" style={{ color: "#64748b", fontSize: "14px" }}>
                Select a merchant to configure item variant options, merchant prices, and online prices.
              </p>
            </div>
          </div>

          <div className="search-bar-wrapper" style={{ position: "relative", marginBottom: "20px" }}>
            <FiSearch className="search-icon" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
            <input
              type="text"
              placeholder="Search by ID, Name, Email, Phone, or Business Type..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(0);
              }}
              style={{ width: "100%", padding: "10px 14px 10px 40px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none" }}
            />
          </div>

          <div className="merchants-table-container" style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
            {loading ? (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <p>Loading merchants from server...</p>
              </div>
            ) : error ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#ef4444" }}>
                <p>{error}</p>
                <button
                  className="btn-primary"
                  onClick={loadMerchants}
                  style={{ marginTop: "12px", padding: "8px 16px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "6px" }}
                >
                  Retry
                </button>
              </div>
            ) : (
              <>
                <table className="variants-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f1f5f9", textAlign: "left", fontSize: "13px", color: "#475569" }}>
                      <th style={{ padding: "12px 16px" }}>Merchant</th>
                      <th style={{ padding: "12px 16px" }}>ID</th>
                      <th style={{ padding: "12px 16px" }}>Email</th>
                      <th style={{ padding: "12px 16px" }}>Phone</th>
                      <th style={{ padding: "12px 16px" }}>Business Type</th>
                      <th style={{ padding: "12px 16px" }}>Status</th>
                      <th style={{ padding: "12px 16px" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentMerchants.length > 0 ? (
                      currentMerchants.map((merchant) => (
                        <tr key={merchant.merchantId} style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "12px 16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              {merchant.profilePicUrl ? (
                                <img
                                  src={merchant.profilePicUrl}
                                  alt={merchant.merchantName}
                                  style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" }}
                                  onError={(e) => {
                                    e.target.style.display = "none";
                                  }}
                                />
                              ) : (
                                <div className="store-avatar" style={{ width: "32px", height: "32px", background: "#e2e8f0", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>
                                  <FiShoppingBag />
                                </div>
                              )}
                              <strong>{merchant.merchantName?.trim() || "N/A"}</strong>
                            </div>
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <span className="merchant-code" style={{ background: "#e0f2fe", color: "#0369a1", padding: "2px 8px", borderRadius: "4px", fontSize: "12px" }}>#{merchant.merchantId}</span>
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <FiMail style={{ color: "#94a3b8" }} /> <span>{merchant.merchantEmail || "N/A"}</span>
                            </div>
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <FiPhone style={{ color: "#94a3b8" }} /> <span>{merchant.merchantPhone || "N/A"}</span>
                            </div>
                          </td>
                          <td style={{ padding: "12px 16px", textTransform: "capitalize", fontWeight: "500" }}>
                            {merchant.merchantBusinessType || "N/A"}
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <span style={{ padding: "2px 8px", borderRadius: "4px", fontSize: "12px", background: merchant.status === "ACTIVE" ? "#dcfce7" : "#fee2e2", color: merchant.status === "ACTIVE" ? "#15803d" : "#b91c1c" }}>
                              {merchant.status || "PENDING"}
                            </span>
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <button
                              className="btn-select-merchant"
                              onClick={() => handleSelectMerchant(merchant)}
                              style={{ display: "flex", alignItems: "center", gap: "6px", background: "#10b981", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontWeight: "500" }}
                            >
                              <FiPlus /> View Outlets
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" style={{ textAlign: "center", padding: "24px" }}>
                          No merchants found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {/* Pagination Controls */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", background: "#f8fafc", borderTop: "1px solid #e2e8f0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px" }}>
                    <span>Rows per page:</span>
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setCurrentPage(0);
                      }}
                      style={{ padding: "4px 8px", borderRadius: "4px", border: "1px solid #cbd5e1" }}
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "14px" }}>
                    <span>
                      Page <strong>{currentPage + 1}</strong> of <strong>{totalPages}</strong>
                    </span>

                    <div style={{ display: "flex", gap: "4px" }}>
                      <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
                        disabled={currentPage === 0}
                        style={{ padding: "6px 12px", border: "1px solid #cbd5e1", background: "#fff", borderRadius: "4px", cursor: currentPage === 0 ? "not-allowed" : "pointer" }}
                      >
                        <FiChevronLeft /> Previous
                      </button>
                      <button
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))}
                        disabled={currentPage >= totalPages - 1}
                        style={{ padding: "6px 12px", border: "1px solid #cbd5e1", background: "#fff", borderRadius: "4px", cursor: currentPage >= totalPages - 1 ? "not-allowed" : "pointer" }}
                      >
                        Next <FiChevronRight />
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      ) : !selectedOutlet ? (
        /* VIEW 2: OUTLETS LIST FOR SELECTED MERCHANT */
        <div className="variant-management-view">
          <button
            onClick={() => {
              setSelectedMerchant(null);
              setOutletsList([]);
            }}
            style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", color: "#2563eb", fontWeight: "600", cursor: "pointer", marginBottom: "16px" }}
          >
            <FiArrowLeft /> Back to Merchants List
          </button>

          <div style={{ background: "#fff", padding: "16px 20px", borderRadius: "10px", border: "1px solid #e2e8f0", marginBottom: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ width: "48px", height: "48px", background: "#dbeafe", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563eb", fontSize: "20px" }}>
              <FiShoppingBag />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: "18px", color: "#0f172a" }}>{selectedMerchant.merchantName}</h2>
              <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#64748b" }}>
                ID: <strong>#{selectedMerchant.merchantId}</strong> | Email: {selectedMerchant.merchantEmail}
              </p>
            </div>
          </div>

          <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
            {loadingOutlets ? (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <p>Loading outlets...</p>
              </div>
            ) : outletsError ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#ef4444" }}>
                <p>{outletsError}</p>
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f1f5f9", textAlign: "left", fontSize: "13px", color: "#475569" }}>
                    <th style={{ padding: "12px 16px" }}>Outlet ID</th>
                    <th style={{ padding: "12px 16px" }}>Outlet Name</th>
                    <th style={{ padding: "12px 16px" }}>Address / Location</th>
                    <th style={{ padding: "12px 16px" }}>Contact Phone</th>
                    <th style={{ padding: "12px 16px" }}>Status</th>
                    <th style={{ padding: "12px 16px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {outletsList.length > 0 ? (
                    outletsList.map((item) => {
                      const outletId = item.outletId || item.id;
                      return (
                        <tr key={outletId} style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "12px 16px" }}>#{outletId}</td>
                          <td style={{ padding: "12px 16px", fontWeight: "600" }}>{item.outletName || item.name || "N/A"}</td>
                          <td style={{ padding: "12px 16px" }}>{item.address || item.location || "N/A"}</td>
                          <td style={{ padding: "12px 16px" }}>{item.phone || item.contactNumber || "N/A"}</td>
                          <td style={{ padding: "12px 16px" }}>
                            <span style={{ padding: "2px 8px", borderRadius: "4px", fontSize: "12px", background: "#dcfce7", color: "#15803d" }}>Active</span>
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <button
                              onClick={() => handleSelectOutlet(item)}
                              style={{ display: "flex", alignItems: "center", gap: "6px", background: "#2563eb", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer" }}
                            >
                              <FiBox /> View Products
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ textAlign: "center", padding: "24px" }}>
                        No outlets found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ) : (
        /* VIEW 3: PRODUCT VARIANT OPTIONS LIST + BULK UPDATE PANEL */
        <div className="variant-management-view">
          <button
            onClick={() => {
              setSelectedOutlet(null);
              setProductsList([]);
              setSelectedProducts([]);
              setSelectedProductConfigs({});
            }}
            style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", color: "#2563eb", fontWeight: "600", cursor: "pointer", marginBottom: "16px" }}
          >
            <FiArrowLeft /> Back to Outlets List
          </button>

          <div style={{ background: "#fff", padding: "16px 20px", borderRadius: "10px", border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ width: "48px", height: "48px", background: "#dcfce7", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#16a34a", fontSize: "20px" }}>
                <FiBox />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: "18px", color: "#0f172a" }}>{selectedOutlet.outletName || selectedOutlet.name || "Outlet Products"}</h2>
                <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#64748b" }}>
                  Outlet ID: <strong>#{selectedOutlet.outletId || selectedOutlet.id}</strong> | Merchant: <strong>{selectedMerchant.merchantName}</strong>
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              style={{ display: "flex", alignItems: "center", gap: "6px", background: "#10b981", color: "#fff", border: "none", padding: "10px 16px", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}
            >
              <FiPlus /> Add Variant Option
            </button>
          </div>

          {/* MAIN LAYOUT */}
          <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
            {/* LEFT TABLE */}
            <div style={{ flex: 1, background: "#fff", borderRadius: "10px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
              {loadingProducts ? (
                <div style={{ textAlign: "center", padding: "40px" }}>
                  <p>Loading products...</p>
                </div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f1f5f9", textAlign: "left", fontSize: "12px", color: "#475569" }}>
                      <th style={{ padding: "12px", textAlign: "center" }}>
                        <input
                          type="checkbox"
                          onChange={handleSelectAllProducts}
                          checked={productsList.length > 0 && selectedProducts.length === productsList.length}
                        />
                      </th>
                      <th style={{ padding: "12px" }}>Option ID</th>
                      <th style={{ padding: "12px" }}>Product Name</th>
                      <th style={{ padding: "12px" }}>Group</th>
                      <th style={{ padding: "12px" }}>Variant Value</th>
                      <th style={{ padding: "12px" }}>Variant Price</th>
                      <th style={{ padding: "12px" }}>Merchant Price</th>
                      <th style={{ padding: "12px" }}>Online Price</th>
                      <th style={{ padding: "12px" }}>Status</th>
                      <th style={{ padding: "12px" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productsList.length > 0 ? (
                      productsList.map((product, index) => {
                        const productId = product.product_id || product.productId || product.id;
                        const optionId = product.productVariantOptionsId;
                        const uniqueKey = optionId ? `${productId}-${optionId}` : `${productId}-${index}`;
                        const isChecked = selectedProducts.includes(uniqueKey);

                        const variantPriceVal = product.variantPrice != null ? Number(product.variantPrice).toFixed(2) : "0.00";
                        const merchantPriceVal = product.merchantPrice != null ? Number(product.merchantPrice).toFixed(2) : "0.00";
                        const onlinePriceVal = product.onlinePrice != null ? Number(product.onlinePrice).toFixed(2) : "0.00";

                        const matchedGroup = variantGroups.find(
                          (g) => g.productVariantGroupsId === Number(product.productVariantGroupsId)
                        );
                        const matchedVal = variantGroupValues.find(
                          (v) => v.productVariantGroupValuesId === Number(product.productVariantGroupValuesId)
                        );

                        return (
                          <tr key={uniqueKey} style={{ borderBottom: "1px solid #f1f5f9", background: isChecked ? "#f0f7ff" : "transparent" }}>
                            <td style={{ padding: "12px", textAlign: "center" }}>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => handleSelectProductCheckbox(e, product, uniqueKey)}
                              />
                            </td>
                            <td style={{ padding: "12px", fontSize: "13px" }}>#{optionId}</td>
                            <td style={{ padding: "12px", fontWeight: "600", fontSize: "13px" }}>{product.productName || product.name || "N/A"}</td>
                            <td style={{ padding: "12px", fontSize: "12px" }}>{matchedGroup ? matchedGroup.group_name : "N/A"}</td>
                            <td style={{ padding: "12px", fontSize: "12px", color: "#2563eb", fontWeight: "500" }}>{matchedVal ? matchedVal.variant_name : "N/A"}</td>
                            <td style={{ padding: "12px", fontWeight: "600", fontSize: "13px", color: "#0f172a" }}>${variantPriceVal}</td>
                            <td style={{ padding: "12px", fontWeight: "600", fontSize: "13px", color: "#475569" }}>${merchantPriceVal}</td>
                            <td style={{ padding: "12px", fontWeight: "600", fontSize: "13px", color: "#16a34a" }}>${onlinePriceVal}</td>
                            <td style={{ padding: "12px" }}>
                              <span style={{ padding: "2px 8px", borderRadius: "4px", fontSize: "11px", background: product.is_active ? "#dcfce7" : "#fee2e2", color: product.is_active ? "#15803d" : "#b91c1c" }}>
                                {product.is_active ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td style={{ padding: "12px" }}>
                              <button
                                style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}
                                onClick={() => {
                                  setProductsList((prev) => prev.filter((_, idx) => idx !== index));
                                  setSelectedProducts((prev) => prev.filter((k) => k !== uniqueKey));
                                }}
                              >
                                <FiTrash2 />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="10" style={{ textAlign: "center", padding: "24px" }}>
                          No variants found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {/* RIGHT SIDE PANEL FOR BULK UPDATES */}
            <div
              style={{
                width: "420px",
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "16px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                position: "sticky",
                top: "20px",
                maxHeight: "85vh",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <FiLayers style={{ color: "#2563eb", fontSize: "20px" }} />
                <h3 style={{ margin: 0, fontSize: "16px", color: "#0f172a" }}>Bulk Update Prices & Attributes</h3>
              </div>
              <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "12px" }}>
                {selectedProducts.length} option(s) selected for update
              </p>

              {/* Master Bulk Fill Dropdowns & Inputs */}
              {selectedProducts.length > 0 && (
                <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px", marginBottom: "12px", border: "1px dashed #cbd5e1" }}>
                  <span style={{ fontSize: "11px", fontWeight: "700", color: "#475569", display: "block", marginBottom: "8px", textTransform: "uppercase" }}>
                    Master Fill (Applies to selected)
                  </span>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginBottom: "8px" }}>
                    <select
                      value={bulkProductVariantGroupsId}
                      onChange={(e) => handleBulkChange("productVariantGroupsId", e.target.value)}
                      style={{ padding: "6px", fontSize: "12px", borderRadius: "4px", border: "1px solid #cbd5e1" }}
                    >
                      <option value="">Group</option>
                      {variantGroups.map((g) => (
                        <option key={g.productVariantGroupsId} value={g.productVariantGroupsId}>{g.group_name}</option>
                      ))}
                    </select>

                    <select
                      value={bulkProductVariantGroupValuesId}
                      onChange={(e) => handleBulkChange("productVariantGroupValuesId", e.target.value)}
                      style={{ padding: "6px", fontSize: "12px", borderRadius: "4px", border: "1px solid #cbd5e1" }}
                    >
                      <option value="">Variant Value</option>
                      {variantGroupValues
                        .filter((v) => !bulkProductVariantGroupsId || v.productVariantGroupsId === Number(bulkProductVariantGroupsId))
                        .map((v) => (
                          <option key={v.productVariantGroupValuesId} value={v.productVariantGroupValuesId}>{v.variant_name}</option>
                        ))}
                    </select>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px", marginBottom: "8px" }}>
                    <div>
                      <label style={{ fontSize: "10px", color: "#64748b" }}>Variant Price</label>
                      <input
                        type="text"
                        placeholder="0.00"
                        value={bulkVariantPrice}
                        onChange={(e) => handleBulkChange("variantPrice", e.target.value)}
                        style={{ width: "100%", padding: "6px", fontSize: "12px", borderRadius: "4px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "10px", color: "#64748b" }}>Merchant Price</label>
                      <input
                        type="text"
                        placeholder="0.00"
                        value={bulkMerchantPrice}
                        onChange={(e) => handleBulkChange("merchantPrice", e.target.value)}
                        style={{ width: "100%", padding: "6px", fontSize: "12px", borderRadius: "4px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "10px", color: "#64748b" }}>Online Price</label>
                      <input
                        type="text"
                        placeholder="0.00"
                        value={bulkOnlinePrice}
                        onChange={(e) => handleBulkChange("onlinePrice", e.target.value)}
                        style={{ width: "100%", padding: "6px", fontSize: "12px", borderRadius: "4px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleApplyBulkValues}
                    style={{ width: "100%", fontSize: "12px", padding: "6px", background: "#e2e8f0", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "600", color: "#334155" }}
                  >
                    Fill Fields Below
                  </button>
                </div>
              )}

              {/* Individual Editable Cards */}
              <div style={{ flex: 1, overflowY: "auto", paddingRight: "4px", marginBottom: "12px" }}>
                {selectedProducts.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "30px 10px", color: "#94a3b8", fontSize: "13px" }}>
                    Select variant option rows from the table on the left to perform bulk preview & edits.
                  </div>
                ) : (
                  selectedProducts.map((uniqueKey) => {
                    const foundProduct = productsList.find((p, idx) => {
                      const pId = p.product_id || p.productId || p.id;
                      const optId = p.productVariantOptionsId;
                      return (optId ? `${pId}-${optId}` : `${pId}-${idx}`) === uniqueKey;
                    });

                    if (!foundProduct) return null;
                    const config = selectedProductConfigs[uniqueKey] || {};

                    return (
                      <div
                        key={uniqueKey}
                        style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "6px", padding: "10px", marginBottom: "8px" }}
                      >
                        <div style={{ fontSize: "12px", fontWeight: "600", color: "#0f172a", marginBottom: "6px", display: "flex", justifyContent: "space-between" }}>
                          <span>{foundProduct.productName || `Product #${foundProduct.product_id}`}</span>
                          <span style={{ color: "#64748b", fontWeight: "normal" }}>Option #{foundProduct.productVariantOptionsId}</span>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginBottom: "6px" }}>
                          <select
                            value={config.productVariantGroupsId ?? ""}
                            onChange={(e) => handleConfigChange(uniqueKey, "productVariantGroupsId", e.target.value)}
                            style={{ padding: "4px", fontSize: "11px", borderRadius: "4px", border: "1px solid #cbd5e1" }}
                          >
                            <option value="">Select Group</option>
                            {variantGroups.map((g) => (
                              <option key={g.productVariantGroupsId} value={g.productVariantGroupsId}>{g.group_name}</option>
                            ))}
                          </select>

                          <select
                            value={config.productVariantGroupValuesId ?? ""}
                            onChange={(e) => handleConfigChange(uniqueKey, "productVariantGroupValuesId", e.target.value)}
                            style={{ padding: "4px", fontSize: "11px", borderRadius: "4px", border: "1px solid #cbd5e1" }}
                          >
                            <option value="">Select Value</option>
                            {variantGroupValues
                              .filter((v) => !config.productVariantGroupsId || v.productVariantGroupsId === Number(config.productVariantGroupsId))
                              .map((v) => (
                                <option key={v.productVariantGroupValuesId} value={v.productVariantGroupValuesId}>{v.variant_name}</option>
                              ))}
                          </select>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px" }}>
                          <div>
                            <label style={{ fontSize: "9px", color: "#64748b" }}>Variant ($)</label>
                            <input
                              type="text"
                              value={config.variantPrice ?? ""}
                              onChange={(e) => handleConfigChange(uniqueKey, "variantPrice", e.target.value)}
                              style={{ width: "100%", padding: "4px", fontSize: "11px", borderRadius: "4px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: "9px", color: "#64748b" }}>Merchant ($)</label>
                            <input
                              type="text"
                              value={config.merchantPrice ?? ""}
                              onChange={(e) => handleConfigChange(uniqueKey, "merchantPrice", e.target.value)}
                              style={{ width: "100%", padding: "4px", fontSize: "11px", borderRadius: "4px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: "9px", color: "#64748b" }}>Online ($)</label>
                            <input
                              type="text"
                              value={config.onlinePrice ?? ""}
                              onChange={(e) => handleConfigChange(uniqueKey, "onlinePrice", e.target.value)}
                              style={{ width: "100%", padding: "4px", fontSize: "11px", borderRadius: "4px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* SINGLE BULK PREVIEW & UPDATE BUTTON */}
              <button
                type="button"
                disabled={selectedProducts.length === 0}
                onClick={handleCommitConfigurations}
                style={{
                  width: "100%",
                  padding: "12px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "8px",
                  background: selectedProducts.length === 0 ? "#cbd5e1" : "#10b981",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: "700",
                  cursor: selectedProducts.length === 0 ? "not-allowed" : "pointer",
                  boxShadow: selectedProducts.length === 0 ? "none" : "0 4px 6px -1px rgba(16, 185, 129, 0.3)",
                }}
              >
                <FiZap /> Bulk Preview & Update All ({selectedProducts.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW VARIANT MODAL */}
      {isModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", width: "420px", borderRadius: "10px", padding: "20px" }}>
            <h3 style={{ marginTop: 0, fontSize: "16px", color: "#0f172a" }}>Add Product Variant Option</h3>
            <form onSubmit={handleAddVariantSubmit}>
              <div style={{ marginBottom: "12px" }}>
                <label style={{ fontSize: "12px", color: "#475569", display: "block", marginBottom: "4px" }}>Product Name</label>
                <input
                  type="text"
                  placeholder="e.g. Chicken Biryani"
                  value={newVariant.name}
                  onChange={(e) => setNewVariant({ ...newVariant, name: e.target.value })}
                  required
                  style={{ width: "100%", padding: "8px", border: "1px solid #cbd5e1", borderRadius: "6px", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label style={{ fontSize: "12px", color: "#475569", display: "block", marginBottom: "4px" }}>Variant Group</label>
                <select
                  value={newVariant.productVariantGroupsId}
                  onChange={(e) => setNewVariant({ ...newVariant, productVariantGroupsId: e.target.value, productVariantGroupValuesId: "" })}
                  required
                  style={{ width: "100%", padding: "8px", border: "1px solid #cbd5e1", borderRadius: "6px", boxSizing: "border-box" }}
                >
                  <option value="">Select Group</option>
                  {variantGroups.map((g) => (
                    <option key={g.productVariantGroupsId} value={g.productVariantGroupsId}>{g.group_name}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label style={{ fontSize: "12px", color: "#475569", display: "block", marginBottom: "4px" }}>Variant Value</label>
                <select
                  value={newVariant.productVariantGroupValuesId}
                  onChange={(e) => setNewVariant({ ...newVariant, productVariantGroupValuesId: e.target.value })}
                  required
                  style={{ width: "100%", padding: "8px", border: "1px solid #cbd5e1", borderRadius: "6px", boxSizing: "border-box" }}
                >
                  <option value="">Select Value</option>
                  {variantGroupValues
                    .filter((v) => !newVariant.productVariantGroupsId || v.productVariantGroupsId === Number(newVariant.productVariantGroupsId))
                    .map((v) => (
                      <option key={v.productVariantGroupValuesId} value={v.productVariantGroupValuesId}>{v.variant_name}</option>
                    ))}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "16px" }}>
                <div>
                  <label style={{ fontSize: "11px", color: "#64748b" }}>Variant Price</label>
                  <input
                    type="text"
                    placeholder="0.00"
                    value={newVariant.variantPrice}
                    onChange={(e) => {
                      const val = handleNumericInput(e.target.value);
                      if (val !== null) setNewVariant({ ...newVariant, variantPrice: val });
                    }}
                    required
                    style={{ width: "100%", padding: "6px", border: "1px solid #cbd5e1", borderRadius: "4px", boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "11px", color: "#64748b" }}>Merchant Price</label>
                  <input
                    type="text"
                    placeholder="0.00"
                    value={newVariant.merchantPrice}
                    onChange={(e) => {
                      const val = handleNumericInput(e.target.value);
                      if (val !== null) setNewVariant({ ...newVariant, merchantPrice: val });
                    }}
                    style={{ width: "100%", padding: "6px", border: "1px solid #cbd5e1", borderRadius: "4px", boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "11px", color: "#64748b" }}>Online Price</label>
                  <input
                    type="text"
                    placeholder="0.00"
                    value={newVariant.onlinePrice}
                    onChange={(e) => {
                      const val = handleNumericInput(e.target.value);
                      if (val !== null) setNewVariant({ ...newVariant, onlinePrice: val });
                    }}
                    style={{ width: "100%", padding: "6px", border: "1px solid #cbd5e1", borderRadius: "4px", boxSizing: "border-box" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: "8px 14px", border: "1px solid #cbd5e1", background: "#fff", borderRadius: "6px", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: "8px 14px", border: "none", background: "#2563eb", color: "#fff", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}
                >
                  Save Option
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MerchantAddVariants;