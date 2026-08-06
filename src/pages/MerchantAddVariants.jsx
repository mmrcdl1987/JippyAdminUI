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

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newVariant, setNewVariant] = useState({
    name: "",
    variantName: "",
    merchantPrice: "",
    onlinePrice: "",
  });

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
    setLoadingProducts(true);
    setProductsError(null);

    try {
      const data = await getProductsByOutlet(outletId);
      console.log("Products API Response:", data);

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

      setProductsList(list);
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

  // Filter Merchants by Search Input
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
    if (!newVariant.name || !newVariant.onlinePrice) return;

    setProductsList((prev) => [
      ...prev,
      {
        productId: Date.now(),
        productName: newVariant.name,
        variantName: newVariant.variantName || null,
        merchantPrice: parseFloat(newVariant.merchantPrice || 0),
        onlinePrice: parseFloat(newVariant.onlinePrice),
        status: "ACTIVE",
      },
    ]);

    setNewVariant({ name: "", variantName: "", merchantPrice: "", onlinePrice: "" });
    setIsModalOpen(false);
  };

  const handleDeleteOutlet = (outletId) => {
    setOutletsList((prev) =>
      prev.filter((item) => (item.outletId || item.id) !== outletId)
    );
  };

  return (
    <div className="add-variants-container">
      {/* VIEW 1: MERCHANT SELECTION */}
      {!selectedMerchant ? (
        <div className="merchant-selection-view">
          <div className="page-header">
            <div>
              <h2>Add Merchant Variants</h2>
              <p className="subtitle">
                Select a merchant from the table below to configure item variants and outlets.
              </p>
            </div>
          </div>

          <div className="search-bar-wrapper">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by ID, Name, Email, Phone, or Business Type..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(0);
              }}
            />
          </div>

          <div className="merchants-table-container">
            {loading ? (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <p>Loading merchants from server...</p>
              </div>
            ) : error ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#d9534f" }}>
                <p>{error}</p>
                <button
                  className="btn-primary"
                  onClick={loadMerchants}
                  style={{ marginTop: "12px" }}
                >
                  Retry
                </button>
              </div>
            ) : (
              <>
                <table className="variants-table">
                  <thead>
                    <tr>
                      <th>Merchant</th>
                      <th>ID</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Business Type</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentMerchants.length > 0 ? (
                      currentMerchants.map((merchant) => (
                        <tr key={merchant.merchantId}>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              {merchant.profilePicUrl ? (
                                <img
                                  src={merchant.profilePicUrl}
                                  alt={merchant.merchantName}
                                  style={{
                                    width: "32px",
                                    height: "32px",
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                  }}
                                  onError={(e) => {
                                    e.target.style.display = "none";
                                  }}
                                />
                              ) : (
                                <div className="store-avatar" style={{ width: "32px", height: "32px", fontSize: "16px" }}>
                                  <FiShoppingBag />
                                </div>
                              )}
                              <strong>{merchant.merchantName?.trim() || "N/A"}</strong>
                            </div>
                          </td>
                          <td>
                            <span className="merchant-code">#{merchant.merchantId}</span>
                          </td>
                          <td>
                            <div className="info-line" style={{ margin: 0 }}>
                              <FiMail /> <span>{merchant.merchantEmail || "N/A"}</span>
                            </div>
                          </td>
                          <td>
                            <div className="info-line" style={{ margin: 0 }}>
                              <FiPhone /> <span>{merchant.merchantPhone || "N/A"}</span>
                            </div>
                          </td>
                          <td>
                            <span style={{ textTransform: "capitalize", fontWeight: "500" }}>
                              {merchant.merchantBusinessType || "N/A"}
                            </span>
                          </td>
                          <td>
                            <span className={`status-badge ${(merchant.status || "PENDING").toLowerCase()}`}>
                              {merchant.status || "PENDING"}
                            </span>
                          </td>
                          <td>
                            <button
                              className="btn-select-merchant"
                              onClick={() => handleSelectMerchant(merchant)}
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

                <div
                  style={{
                    display: "flex",
                    justify: "space-between",
                    alignItems: "center",
                    padding: "16px",
                    borderTop: "1px solid #eee",
                    backgroundColor: "#fafafa",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px" }}>
                    <span>Rows per page:</span>
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setCurrentPage(0);
                      }}
                      style={{ padding: "4px 8px", borderRadius: "4px", border: "1px solid #ccc" }}
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
                        className="btn-secondary"
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
                        disabled={currentPage === 0}
                        style={{ padding: "6px 12px", display: "flex", alignItems: "center" }}
                      >
                        <FiChevronLeft /> Previous
                      </button>
                      <button
                        className="btn-secondary"
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))}
                        disabled={currentPage >= totalPages - 1}
                        style={{ padding: "6px 12px", display: "flex", alignItems: "center" }}
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
            className="btn-back"
            onClick={() => {
              setSelectedMerchant(null);
              setOutletsList([]);
            }}
          >
            <FiArrowLeft /> Back to Merchants List
          </button>

          <div className="selected-merchant-header">
            <div className="selected-info">
              {selectedMerchant.profilePicUrl ? (
                <img
                  src={selectedMerchant.profilePicUrl}
                  alt={selectedMerchant.merchantName}
                  style={{ width: "48px", height: "48px", borderRadius: "50%", objectFit: "cover" }}
                />
              ) : (
                <div className="store-avatar-large">
                  <FiShoppingBag />
                </div>
              )}
              <div>
                <h2>{selectedMerchant.merchantName}</h2>
                <p>
                  ID: <strong>#{selectedMerchant.merchantId}</strong> | Email: {selectedMerchant.merchantEmail} | Type:{" "}
                  <span style={{ textTransform: "capitalize" }}>{selectedMerchant.merchantBusinessType}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="variants-table-container">
            {loadingOutlets ? (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <p>Loading outlets for Merchant #{selectedMerchant.merchantId}...</p>
              </div>
            ) : outletsError ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#d9534f" }}>
                <p>{outletsError}</p>
                <button
                  className="btn-primary"
                  onClick={() => handleSelectMerchant(selectedMerchant)}
                  style={{ marginTop: "12px" }}
                >
                  Retry
                </button>
              </div>
            ) : (
              <table className="variants-table">
                <thead>
                  <tr>
                    <th>Outlet ID</th>
                    <th>Outlet Name</th>
                    <th>Address / Location</th>
                    <th>Contact Phone</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {outletsList.length > 0 ? (
                    outletsList.map((item) => {
                      const outletId = item.outletId || item.id;
                      return (
                        <tr key={outletId}>
                          <td>#{outletId}</td>
                          <td>
                            <strong>{item.outletName || item.name || "N/A"}</strong>
                          </td>
                          <td>
                            <div className="info-line" style={{ margin: 0 }}>
                              <FiMapPin />{" "}
                              <span>
                                {item.address || item.location || item.outletAddress || "N/A"}
                              </span>
                            </div>
                          </td>
                          <td>
                            <div className="info-line" style={{ margin: 0 }}>
                              <FiPhone />{" "}
                              <span>
                                {item.phone || item.contactNumber || item.contact || "N/A"}
                              </span>
                            </div>
                          </td>
                          <td>
                            <span className={`status-badge ${(item.status || "active").toLowerCase()}`}>
                              {item.status || "Active"}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button
                                className="btn-select-merchant"
                                onClick={() => handleSelectOutlet(item)}
                              >
                                <FiBox /> View Products
                              </button>
                              <button
                                className="btn-icon text-delete"
                                title="Delete"
                                onClick={() => handleDeleteOutlet(outletId)}
                              >
                                <FiTrash2 />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ textAlign: "center", padding: "24px" }}>
                        No outlets found for Merchant #{selectedMerchant.merchantId}.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ) : (
        /* VIEW 3: PRODUCTS LIST FOR SELECTED OUTLET */
        <div className="variant-management-view">
          <button
            className="btn-back"
            onClick={() => {
              setSelectedOutlet(null);
              setProductsList([]);
            }}
          >
            <FiArrowLeft /> Back to Outlets List
          </button>

          <div className="selected-merchant-header">
            <div className="selected-info">
              <div className="store-avatar-large">
                <FiBox />
              </div>
              <div>
                <h2>{selectedOutlet.outletName || selectedOutlet.name || "Outlet Products"}</h2>
                <p>
                  Outlet ID: <strong>#{selectedOutlet.outletId || selectedOutlet.id}</strong> | Merchant:{" "}
                  <strong>{selectedMerchant.merchantName}</strong>
                </p>
              </div>
            </div>

            <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
              <FiPlus /> Add Variant / Product
            </button>
          </div>

          <div className="variants-table-container">
            {loadingProducts ? (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <p>Loading products for Outlet #{selectedOutlet.outletId || selectedOutlet.id}...</p>
              </div>
            ) : productsError ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#d9534f" }}>
                <p>{productsError}</p>
                <button
                  className="btn-primary"
                  onClick={() => handleSelectOutlet(selectedOutlet)}
                  style={{ marginTop: "12px" }}
                >
                  Retry
                </button>
              </div>
            ) : (
              <table className="variants-table">
                <thead>
                  <tr>
                    <th>Product ID</th>
                    <th>Product Name</th>
                    <th>Category / Attribute</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {productsList.length > 0 ? (
                    productsList.map((product, index) => {
                      const productId = product.productId || product.id;
                      const variantId = product.variantId;
                      const uniqueKey = variantId ? `${productId}-${variantId}` : `${productId}-${index}`;

                      // Extract prices (fallback to product.price if necessary)
                      const displayPrice = product.onlinePrice != null 
                        ? Number(product.onlinePrice).toFixed(2)
                        : product.merchantPrice != null 
                        ? Number(product.merchantPrice).toFixed(2)
                        : product.price != null 
                        ? Number(product.price).toFixed(2) 
                        : "0.00";

                      // Extract category/attribute display string
                      const displayAttribute = product.variantName || product.category || product.attribute || "N/A";

                      return (
                        <tr key={uniqueKey}>
                          <td>#{productId}</td>
                          <td>
                            <strong>{product.productName || product.name || "N/A"}</strong>
                          </td>
                          <td>{displayAttribute}</td>
                          <td>${displayPrice}</td>
                          <td>
                            <span className={`status-badge ${(product.status || "active").toLowerCase()}`}>
                              {product.status || "Active"}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button className="btn-icon text-edit" title="Edit">
                                <FiEdit2 />
                              </button>
                              <button
                                className="btn-icon text-delete"
                                title="Delete"
                                onClick={() =>
                                  setProductsList((prev) =>
                                    prev.filter((_, idx) => idx !== index)
                                  )
                                }
                              >
                                <FiTrash2 />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ textAlign: "center", padding: "24px" }}>
                        No products found for Outlet #{selectedOutlet.outletId || selectedOutlet.id}.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* NEW VARIANT / PRODUCT MODAL */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Add Product Variant for Outlet #{selectedOutlet?.outletId || selectedOutlet?.id}</h3>
            <form onSubmit={handleAddVariantSubmit}>
              <div className="form-group">
                <label>Product Name</label>
                <input
                  type="text"
                  placeholder="e.g. Veg Pizza"
                  value={newVariant.name}
                  onChange={(e) => setNewVariant({ ...newVariant, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Variant / Attribute Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Medium / Extra Cheese"
                  value={newVariant.variantName}
                  onChange={(e) => setNewVariant({ ...newVariant, variantName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Merchant Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 349.00"
                  value={newVariant.merchantPrice}
                  onChange={(e) => setNewVariant({ ...newVariant, merchantPrice: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Online Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 419.00"
                  value={newVariant.onlinePrice}
                  onChange={(e) => setNewVariant({ ...newVariant, onlinePrice: e.target.value })}
                  required
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Variant
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
