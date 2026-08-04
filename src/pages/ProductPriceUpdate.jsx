import React, { useState, useEffect } from "react";
import {
  fetchStates,
  fetchCampaignLocations,
  fetchOutletDetailsById,
  updateOutletProducts,
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
  const [adjustmentType, setAdjustmentType] = useState("percentage");
  const [adjustmentValue, setAdjustmentValue] = useState("");

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

  // Price States
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
  }, [selectedState, selectedCity, selectedArea]);

  const loadCampaignLocationData = async (stateId, cityId, areaId) => {
    setLoadingOutlets(true);
    try {
      const data = await fetchCampaignLocations(stateId, cityId, areaId);

      // Only overwrite cities list if new cities are returned
      if (Array.isArray(data?.cities) && data.cities.length > 0) {
        setCitiesList(data.cities);
      }
      
      // Only overwrite areas list if new areas are returned
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
  };

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
  const totalPages = Math.ceil(outlets.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOutlets = outlets.slice(indexOfFirstItem, indexOfLastItem);

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
      const outletData = await fetchOutletDetailsById(outlet.outletId);
      setActiveOutlet(outletData);

      if (!selectedOutletIds.includes(outlet.outletId)) {
        setSelectedOutletIds((prev) => [...prev, outlet.outletId]);
      }

      const initialPrices = {};
      outletData.categories?.forEach((cat) => {
        cat.products?.forEach((prod) => {
          if (prod.hasProductVariants && prod.variants) {
            prod.variants.forEach((v) => {
              initialPrices[`v_${v.variantId}`] = v.price ?? 0;
            });
          } else {
            initialPrices[`p_${prod.productId}`] = prod.price ?? 0;
          }
        });
      });
      setNewPrices(initialPrices);
    } catch (error) {
      console.error("Error fetching outlet details:", error);
      alert("Failed to load outlet product details.");
    } finally {
      setLoadingProducts(false);
    }
  };

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
      const outletDetailsList = await Promise.all(
        selectedOutletIds.map((id) => fetchOutletDetailsById(id))
      );

      const updatePromises = outletDetailsList.map((outletData) => {
        const updatedCategories = outletData.categories?.map((cat) => ({
          ...cat,
          products: cat.products?.map((prod) => {
            if (prod.hasProductVariants && prod.variants) {
              const updatedVariants = prod.variants.map((v) => {
                const currentPrice = v.price ?? 0;
                let calculatedPrice = currentPrice;

                if (adjustmentType === "percentage") {
                  calculatedPrice = currentPrice + (currentPrice * val) / 100;
                } else {
                  calculatedPrice = currentPrice + val;
                }

                return {
                  ...v,
                  price: Math.max(0, Math.round(calculatedPrice)),
                };
              });
              return { ...prod, variants: updatedVariants };
            }

            const currentPrice = prod.price ?? 0;
            let calculatedPrice = currentPrice;

            if (adjustmentType === "percentage") {
              calculatedPrice = currentPrice + (currentPrice * val) / 100;
            } else {
              calculatedPrice = currentPrice + val;
            }

            return {
              ...prod,
              price: Math.max(0, Math.round(calculatedPrice)),
            };
          }),
        }));

        const payload = {
          ...outletData,
          categories: updatedCategories,
        };

        return updateOutletProducts(outletData.outletId, payload, "MERCHANT");
      });

      await Promise.all(updatePromises);

      alert(`Successfully updated product prices for ${selectedOutletIds.length} outlet(s)!`);

      if (activeOutlet && selectedOutletIds.includes(activeOutlet.outletId)) {
        handleSelectOutlet(activeOutlet);
      }
    } catch (error) {
      console.error("Error applying bulk price adjustment:", error);
      alert("Failed to update product prices for selected outlets.");
    } finally {
      setUpdatingPrices(false);
    }
  };

  const handlePriceChange = (key, value) => {
    setNewPrices((prev) => ({
      ...prev,
      [key]: value === "" ? "" : Number(value),
    }));
  };

  const handleSavePrices = async () => {
    if (selectedOutletIds.length === 0) {
      alert("Please select at least one outlet checkbox.");
      return;
    }

    try {
      const updatedCategories = activeOutlet.categories?.map((cat) => ({
        ...cat,
        products: cat.products?.map((prod) => {
          if (prod.hasProductVariants && prod.variants) {
            const updatedVariants = prod.variants.map((v) => ({
              ...v,
              price:
                newPrices[`v_${v.variantId}`] !== ""
                  ? newPrices[`v_${v.variantId}`]
                  : v.price,
            }));
            return { ...prod, variants: updatedVariants };
          }

          return {
            ...prod,
            price:
              newPrices[`p_${prod.productId}`] !== ""
                ? newPrices[`p_${prod.productId}`]
                : prod.price,
          };
        }),
      }));

      const payload = {
        ...activeOutlet,
        categories: updatedCategories,
      };

      await Promise.all(
        selectedOutletIds.map((id) =>
          updateOutletProducts(id, payload, "MERCHANT")
        )
      );

      alert(`Successfully updated product prices for ${selectedOutletIds.length} outlet(s)!`);
    } catch (error) {
      console.error("Error updating prices:", error);
      alert("Failed to update product prices.");
    }
  };

  const allProducts = [];
  activeOutlet?.categories?.forEach((cat) => {
    cat.products?.forEach((prod) => {
      if (prod.hasProductVariants && prod.variants) {
        prod.variants.forEach((v) => {
          allProducts.push({
            key: `v_${v.variantId}`,
            name: `${prod.productName} (${v.variantName})`,
            merchantPrice: v.merchantPrice ?? 0,
            currentPrice: v.price ?? 0,
          });
        });
      } else {
        allProducts.push({
          key: `p_${prod.productId}`,
          name: prod.productName,
          merchantPrice: prod.merchantPrice ?? 0,
          currentPrice: prod.price ?? 0,
        });
      }
    });
  });

  const filteredProducts = allProducts.filter((p) =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                          disabled={currentPage === 1}
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
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </button>
                      </div>
                    </div>

                    <div className="bottom-bulk-adjustment-container">
                      <div className="bulk-adjustment-bar">
                        <label>Increase By:</label>
                        <select
                          value={adjustmentType}
                          onChange={(e) => setAdjustmentType(e.target.value)}
                          disabled={updatingPrices}
                        >
                          <option value="percentage">Percentage (%)</option>
                          <option value="flat">Flat Amount (₹)</option>
                        </select>

                        <input
                          type="number"
                          placeholder={
                            adjustmentType === "percentage" ? "e.g. 10" : "e.g. 20"
                          }
                          value={adjustmentValue}
                          onChange={(e) => setAdjustmentValue(e.target.value)}
                          disabled={updatingPrices}
                        />

                        <button
                          type="button"
                          className="apply-bulk-btn"
                          onClick={handleApplyOutletBulkAdjustment}
                          disabled={
                            updatingPrices ||
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
                    Managing menu product pricing for {selectedOutletIds.length}{" "}
                    outlet(s)
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
                    Loading outlet products...
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
                            No products found.
                          </td>
                        </tr>
                      ) : (
                        filteredProducts.map((prod) => {
                          const userPrice = newPrices[prod.key];
                          const diff =
                            userPrice !== "" && !isNaN(userPrice)
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