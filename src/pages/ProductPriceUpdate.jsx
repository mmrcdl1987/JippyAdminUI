import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  fetchStates,
  fetchCampaignLocations,
  fetchOutletProductsForUpdate,
  updateOutletPricing,
  bulkUpdateOutletPricing,
} from "../services/outletPriceService";
import "../styles/ProductPriceUpdate.css";

export default function ProductPriceUpdate() {
  // Outlets & Multi-Selection
  const [outlets, setOutlets] = useState([]);
  const [selectedOutletIds, setSelectedOutletIds] = useState([]);
  const [activeOutlet, setActiveOutlet] = useState(null);
  const [loadingOutlets, setLoadingOutlets] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [updatingPrices, setUpdatingPrices] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Outlet-Level Bulk Price Adjustment State
  const [adjustmentType, setAdjustmentType] = useState("percentage"); // "percentage" or "flat"
  const [adjustmentValue, setAdjustmentValue] = useState("");
  const [operationDirection, setOperationDirection] = useState("INCREASE"); // "INCREASE" or "DECREASE"

  // Dynamic Location Lists
  const [statesList, setStatesList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);
  const [areasList, setAreasList] = useState([]);

  // Filter Selections
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedArea, setSelectedArea] = useState("");

  // UI & Search States
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Price States for Individual Products
  const [newPrices, setNewPrices] = useState({});

  useEffect(() => {
    loadStates();
  }, []);

  const loadStates = async () => {
    try {
      const data = await fetchStates();
      setStatesList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching states:", error);
    }
  };

  const loadCampaignLocationData = useCallback(async (stateId, cityId, areaId) => {
    setLoadingOutlets(true);
    try {
      const data = await fetchCampaignLocations(stateId, cityId, areaId);

      if (Array.isArray(data?.cities) && data.cities.length > 0) {
        setCitiesList(data.cities);
      }

      if (Array.isArray(data?.areas) && data.areas.length > 0) {
        setAreasList(data.areas);
      }

      const outletData =
        data.outlets || data.cityOutlets || data.areaOutlets || data.stateOutlets || [];
      setOutlets(Array.isArray(outletData) ? outletData : []);
      setSelectedOutletIds([]);
      setActiveOutlet(null);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching campaign location data:", error);
      setOutlets([]);
    } finally {
      setLoadingOutlets(false);
    }
  }, []);

  useEffect(() => {
    if (!selectedState) {
      setCitiesList([]);
      setAreasList([]);
      setOutlets([]);
      setSelectedCity("");
      setSelectedArea("");
      setSelectedOutletIds([]);
      setActiveOutlet(null);
      setCurrentPage(1);
      return;
    }

    loadCampaignLocationData(selectedState, selectedCity, selectedArea);
  }, [selectedState, selectedCity, selectedArea, loadCampaignLocationData]);

  const handleStateChange = (e) => {
    setSelectedState(e.target.value);
    setSelectedCity("");
    setSelectedArea("");
    setCitiesList([]);
    setAreasList([]);
  };

  const handleCityChange = (e) => {
    setSelectedCity(e.target.value);
    setSelectedArea("");
    setAreasList([]);
  };

  const handleAreaChange = (e) => {
    setSelectedArea(e.target.value);
  };

  // Pagination Calculation
  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(outlets.length / itemsPerPage));
  }, [outlets.length, itemsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOutlets = useMemo(() => {
    return outlets.slice(indexOfFirstItem, indexOfLastItem);
  }, [outlets, indexOfFirstItem, indexOfLastItem]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleSelectAllOutlets = (e) => {
    if (e.target.checked) {
      setSelectedOutletIds(outlets.map((o) => o.outletId));
    } else {
      setSelectedOutletIds([]);
    }
  };

  const handleToggleOutletCheckbox = (outletId) => {
    setSelectedOutletIds((prev) =>
      prev.includes(outletId)
        ? prev.filter((id) => id !== outletId)
        : [...prev, outletId]
    );
  };

  const handleSelectOutlet = async (outlet) => {
    setOpenDropdownId(null);
    setLoadingProducts(true);

    try {
      const response = await fetchOutletProductsForUpdate(outlet.outletId);
      const rawData = response?.data || response;
      const productsList = Array.isArray(rawData) ? rawData : (rawData?.products || []);

      setActiveOutlet({
        ...outlet,
        products: productsList,
      });

      if (!selectedOutletIds.includes(outlet.outletId)) {
        setSelectedOutletIds((prev) => [...prev, outlet.outletId]);
      }

      const initialPrices = {};
      productsList.forEach((prod, index) => {
        const key = `p_${prod.productId}_${index}`;
        initialPrices[key] = prod.onlinePrice ?? prod.price ?? 0;
      });

      setNewPrices(initialPrices);
    } catch (error) {
      console.error("Error fetching outlet products pricing:", error);
      alert("Failed to load outlet product pricing details.");
    } finally {
      setLoadingProducts(false);
    }
  };

  // Triggered when clicking "Apply" for bulk update on selected outlets
  const handleApplyOutletBulkAdjustment = async () => {
    if (selectedOutletIds.length === 0) {
      alert("Please select at least one outlet.");
      return;
    }

    if (!adjustmentValue || isNaN(adjustmentValue)) {
      alert("Please enter a valid numeric value.");
      return;
    }

    const val = Number(adjustmentValue);
    setUpdatingPrices(true);

    try {
      const payload = {
        outletIds: selectedOutletIds,
        priceModel: adjustmentType === "percentage" ? "PERCENTAGE" : "FLAT",
        value: val,
        priceType: adjustmentType === "percentage" ? "PERCENTAGE" : "FLAT",
        locationType: "OUTLET",
        operationType: operationDirection, // "INCREASE" or "DECREASE"
      };

      await bulkUpdateOutletPricing(payload, true);

      alert(`Successfully performed bulk price update for ${selectedOutletIds.length} outlet(s)!`);
    } catch (error) {
      console.error("Error applying bulk price adjustment:", error);
      alert("Failed to apply bulk update for selected outlets.");
    } finally {
      setUpdatingPrices(false);
    }
  };

  const handlePriceChange = (key, value) => {
    setNewPrices((prev) => ({
      ...prev,
      [key]: value === "" ? "" : isNaN(Number(value)) ? prev[key] : Number(value),
    }));
  };

  const handleSavePrices = async () => {
    if (!activeOutlet || !activeOutlet.products) {
      alert("No active outlet product details found.");
      return;
    }

    if (selectedOutletIds.length === 0) {
      alert("Please select at least one outlet.");
      return;
    }

    try {
      const changedItems = [];

      activeOutlet.products.forEach((prod, index) => {
        const key = `p_${prod.productId}_${index}`;
        const val = newPrices[key];
        const currentPrice = prod.onlinePrice ?? prod.price ?? 0;

        if (val !== "" && val !== undefined && !isNaN(val)) {
          const numericVal = Number(val);
          if (numericVal !== currentPrice) {
            changedItems.push({
              productId: prod.productId,
              productVariantId: prod.productVariantId ?? null,
              newPrice: numericVal,
            });
          }
        }
      });

      if (changedItems.length === 0) {
        alert("No price changes detected to save.");
        return;
      }

      const payload = {
        outletIds: selectedOutletIds,
        items: changedItems,
      };

      await updateOutletPricing(payload, true);

      alert(`Successfully updated ${changedItems.length} changed product price(s) across ${selectedOutletIds.length} outlet(s)!`);
    } catch (error) {
      console.error("Error updating prices:", error);
      alert("Failed to update product prices.");
    }
  };

  const allProducts = useMemo(() => {
    const products = [];
    if (!activeOutlet || !Array.isArray(activeOutlet.products)) return products;

    activeOutlet.products.forEach((prod, index) => {
      const key = `p_${prod.productId}_${index}`;
      products.push({
        key,
        name: prod.productName || prod.name || "Unnamed Product",
        merchantPrice: prod.merchantPrice ?? prod.mrp ?? 0,
        currentPrice: prod.onlinePrice ?? prod.price ?? 0,
      });
    });

    return products;
  }, [activeOutlet]);

  const filteredProducts = useMemo(() => {
    return allProducts.filter((p) =>
      p.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allProducts, searchQuery]);

  return (
    <div className="price-update-page">
      <div className="page-header">
        <h2>Product Price Update</h2>
        <p>Dashboard / Price Management / Product Price Update</p>
      </div>

      <div className="filter-card">
        <div className="filter-grid">
          <div>
            <label>State</label>
            <select value={selectedState} onChange={handleStateChange}>
              <option value="">Select State</option>
              {statesList.map((st) => (
                <option key={st.stateId || st.id} value={st.stateId || st.id}>
                  {st.stateName || st.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>City</label>
            <select
              value={selectedCity}
              onChange={handleCityChange}
              disabled={!selectedState}
            >
              <option value="">Select City</option>
              {citiesList.map((ct) => (
                <option key={ct.cityId || ct.id} value={ct.cityId || ct.id}>
                  {ct.cityName || ct.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Area</label>
            <select
              value={selectedArea}
              onChange={handleAreaChange}
              disabled={!selectedCity && citiesList.length > 0}
            >
              <option value="">Select Area</option>
              {areasList.map((ar) => (
                <option key={ar.areaId || ar.id} value={ar.areaId || ar.id}>
                  {ar.areaName || ar.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="main-content-grid">
        <div className={`outlets-section ${activeOutlet ? "split-view" : ""}`}>
          <div className="table-card">
            <div className="table-header-bar">
              <h3>Outlets List</h3>
              <span className="badge">
                {selectedOutletIds.length} / {outlets.length} Selected
              </span>
            </div>

            {loadingOutlets ? (
              <div style={{ padding: "20px", textAlign: "center" }}>
                Loading outlets...
              </div>
            ) : (
              <>
                <table>
                  <thead>
                    <tr>
                      <th style={{ width: "40px" }}>
                        <input
                          type="checkbox"
                          checked={
                            outlets.length > 0 &&
                            selectedOutletIds.length === outlets.length
                          }
                          onChange={handleSelectAllOutlets}
                          disabled={outlets.length === 0}
                        />
                      </th>
                      <th>Outlet Name</th>
                      <th>Area</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {outlets.length === 0 ? (
                      <tr>
                        <td
                          colSpan="4"
                          style={{ textAlign: "center", padding: "20px" }}
                        >
                          Select State, City, and Area to fetch outlets.
                        </td>
                      </tr>
                    ) : (
                      currentOutlets.map((outlet) => {
                        const isChecked = selectedOutletIds.includes(
                          outlet.outletId
                        );
                        const isSelected =
                          activeOutlet?.outletId === outlet.outletId;
                        const isDropdownOpen =
                          openDropdownId === outlet.outletId;

                        return (
                          <tr
                            key={outlet.outletId}
                            className={isSelected ? "selected-row" : ""}
                          >
                            <td>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() =>
                                  handleToggleOutletCheckbox(outlet.outletId)
                                }
                              />
                            </td>
                            <td>
                              <strong>{outlet.outletName}</strong>
                            </td>
                            <td>{outlet.areaName || "N/A"}</td>
                            <td style={{ textAlign: "right" }}>
                              <div className="dropdown-wrapper">
                                <button
                                  type="button"
                                  className="options-btn"
                                  onClick={() =>
                                    setOpenDropdownId(
                                      isDropdownOpen ? null : outlet.outletId
                                    )
                                  }
                                >
                                  Options ▼
                                </button>

                                {isDropdownOpen && (
                                  <div className="dropdown-menu">
                                    <button
                                      type="button"
                                      className="dropdown-item"
                                      onClick={() => handleSelectOutlet(outlet)}
                                    >
                                      ✏️ Update Product Prices
                                    </button>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>

                {outlets.length > 0 && (
                  <>
                    <div className="pagination-container">
                      <div className="pagination-info">
                        Showing {indexOfFirstItem + 1} to{" "}
                        {Math.min(indexOfLastItem, outlets.length)} of{" "}
                        {outlets.length} entries
                      </div>

                      <div className="pagination-controls">
                        <div className="rows-per-page">
                          <label>Rows per page:</label>
                          <select
                            value={itemsPerPage}
                            onChange={(e) => {
                              setItemsPerPage(Number(e.target.value));
                              setCurrentPage(1);
                            }}
                          >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                          </select>
                        </div>

                        <button
                          type="button"
                          className="page-btn"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage <= 1}
                        >
                          Previous
                        </button>

                        <span className="page-number">
                          Page {currentPage} of {totalPages}
                        </span>

                        <button
                          type="button"
                          className="page-btn"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage >= totalPages}
                        >
                          Next
                        </button>
                      </div>
                    </div>

                    <div className="bottom-bulk-adjustment-container">
                      <div className="bulk-adjustment-bar">
                        <label>Action:</label>
                        <select
                          value={operationDirection}
                          onChange={(e) => setOperationDirection(e.target.value)}
                          disabled={updatingPrices || activeOutlet !== null}
                        >
                          <option value="INCREASE">Increase By</option>
                          <option value="DECREASE">Decrease By</option>
                        </select>

                        <label>Type:</label>
                        <select
                          value={adjustmentType}
                          onChange={(e) => setAdjustmentType(e.target.value)}
                          disabled={updatingPrices || activeOutlet !== null}
                        >
                          <option value="percentage">Percentage (%)</option>
                          <option value="flat">Flat Amount (₹)</option>
                        </select>

                        <input
                          type="number"
                          placeholder={
                            adjustmentType === "percentage" ? "e.g. 20" : "e.g. 50"
                          }
                          value={adjustmentValue}
                          onChange={(e) => setAdjustmentValue(e.target.value)}
                          disabled={updatingPrices || activeOutlet !== null}
                        />

                        <button
                          type="button"
                          className="apply-bulk-btn"
                          onClick={handleApplyOutletBulkAdjustment}
                          disabled={
                            updatingPrices ||
                            activeOutlet !== null ||
                            selectedOutletIds.length === 0 ||
                            !adjustmentValue
                          }
                        >
                          {updatingPrices ? "Applying..." : "Apply"}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {activeOutlet && (
          <div className="products-panel-section">
            <div className="panel-card">
              <div className="panel-header">
                <div>
                  <p className="outlet-count-tag">
                    Managing menu pricing for <strong>{activeOutlet.outletName || ""}</strong>
                  </p>
                </div>
                <button
                  type="button"
                  className="close-btn"
                  onClick={() => setActiveOutlet(null)}
                >
                  ✕ Close
                </button>
              </div>

              <div className="search-box">
                <input
                  type="text"
                  placeholder="Search Product..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="table-card">
                {loadingProducts ? (
                  <div style={{ padding: "20px", textAlign: "center" }}>
                    Loading products...
                  </div>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>Product / Variant</th>
                        <th>Merchant Price</th>
                        <th>Current Price</th>
                        <th>New Price</th>
                        <th style={{ textAlign: "right" }}>Difference</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.length === 0 ? (
                        <tr>
                          <td
                            colSpan="5"
                            style={{ textAlign: "center", padding: "20px" }}
                          >
                            No products found in the response.
                          </td>
                        </tr>
                      ) : (
                        filteredProducts.map((prod) => {
                          const userPrice = newPrices[prod.key];
                          const diff =
                            userPrice !== "" && userPrice !== undefined && !isNaN(userPrice)
                              ? userPrice - prod.currentPrice
                              : 0;

                          return (
                            <tr key={prod.key}>
                              <td>
                                <strong>{prod.name}</strong>
                              </td>
                              <td>₹ {prod.merchantPrice}</td>
                              <td>₹ {prod.currentPrice}</td>
                              <td>
                                <input
                                  type="number"
                                  value={userPrice ?? ""}
                                  onChange={(e) =>
                                    handlePriceChange(prod.key, e.target.value)
                                  }
                                />
                              </td>
                              <td
                                style={{ textAlign: "right" }}
                                className={
                                  diff >= 0
                                    ? "difference-positive"
                                    : "difference-negative"
                                }
                              >
                                {diff >= 0
                                  ? `+₹ ${diff}`
                                  : `-₹ ${Math.abs(diff)}`}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="footer-buttons">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setActiveOutlet(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="save-btn"
                  onClick={handleSavePrices}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}