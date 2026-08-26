import "../../styles/Merchants/Merchants.css";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FM_API } from "../../services/api";
import { FaStore } from "react-icons/fa";

function Merchants() {
  const navigate = useNavigate();
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [expandedRow, setExpandedRow] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(30);

  useEffect(() => {
    fetchMerchants();
  }, []);

  const openOutlets = (merchant) => {
    console.log("Saving merchantId to localStorage:", merchant.merchantId);
    localStorage.setItem("merchantId", merchant.merchantId);
    
    // Navigates to outlets page. Ensure this route matches your Dashboard subroute configuration.
    navigate("/dashboard/view-outlets"); 
  };

  const handleCreateMerchant = () => {
    navigate("/dashboard/create-merchant"); // Make sure this matches your router path
  };

  const fetchMerchants = async () => {
    try {
      setLoading(true);

      const response = await FM_API.get("/api/fm/merchants");

      if (response.data.success) {
        setMerchants(response.data.data);
      } else {
        setMerchants([]);
      }
    } catch (error) {
      console.error("Error fetching merchants:", error);
      setMerchants([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredMerchants = merchants.filter((merchant) => {
    const keyword = search.toLowerCase();

    return (
      merchant.merchantName?.toLowerCase().includes(keyword) ||
      merchant.firstName?.toLowerCase().includes(keyword) ||
      merchant.lastName?.toLowerCase().includes(keyword) ||
      merchant.merchantEmail?.toLowerCase().includes(keyword) ||
      merchant.merchantPhone?.toLowerCase().includes(keyword) ||
      merchant.area?.toLowerCase().includes(keyword) ||
      merchant.city?.toLowerCase().includes(keyword) ||
      merchant.state?.toLowerCase().includes(keyword) ||
      merchant.merchantBusinessType?.toLowerCase().includes(keyword) ||
      merchant.status?.toLowerCase().includes(keyword)
    );
  });

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMerchants = filteredMerchants.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredMerchants.length / itemsPerPage) || 1;

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleEntriesChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  return (
    <div className="merchant-list-page">
      {/* Header */}
      <div className="merchant-list-header">
        <div>
          <h2>Merchants</h2>
        </div>
        <div className="merchant-list-breadcrumb">
          Dashboard &gt; Merchants &gt; Merchants List
        </div>
      </div>

      {/* Toolbar */}
      <div className="merchant-list-toolbar">
        <div className="merchant-list-title">
          <span className="merchant-list-shop-icon">🏪</span>
          <h2>
            Merchants
            <span className="merchant-list-count-badge">
              {merchants.length}
            </span>
          </h2>
        </div>

        <div className="merchant-list-filters">
          <select>
            <option>Merchant Type</option>
          </select>
          <select>
            <option>Business Model</option>
          </select>
          <select>
            <option>Select City</option>
          </select>
          <select>
            <option>Best Merchants</option>
          </select>
        </div>
      </div>

      {/* Statistics */}
      <div className="merchant-list-stats-row">
        <div className="merchant-list-stat-card merchant-list-total-card">
          <h1>{merchants.length}</h1>
          <p>Total Merchants</p>
        </div>

        <div className="merchant-list-stat-card merchant-list-active-card">
          <h1>
            {
              merchants.filter(
                (m) => m.isActive === "Y" || m.isActive === true
              ).length
            }
          </h1>
          <p>Active Merchants</p>
        </div>

        <div className="merchant-list-stat-card merchant-list-inactive-card">
          <h1>
            {
              merchants.filter(
                (m) => m.isActive === "N" || m.isActive === false
              ).length
            }
          </h1>
          <p>Inactive Merchants</p>
        </div>

        <div className="merchant-list-stat-card merchant-list-new-card">
          <h1>{merchants.filter((m) => m.isApproved).length}</h1>
          <p>Newly Joined Merchants</p>
        </div>
      </div>

      {/* Bulk Import Section */}
      <div className="merchant-list-bulk-import-card">
        <div className="merchant-list-bulk-left">
          <h2>Bulk Import / Update Merchants</h2>
          <p>
            Upload Excel file to import or update multiple merchants at once
          </p>
        </div>

        <div className="merchant-list-bulk-middle">
          <button className="merchant-list-download-btn">
            ⬇ Download Template
          </button>
        </div>

        <div className="merchant-list-bulk-right">
          <label>Select Excel File (.xls/.xlsx)</label>
          <input type="file" className="merchant-list-file-input" />
          <small>
            File should contain Merchant Name, Email, Mobile, Address, Area,
            City, State, Business Model, Merchant Type and Merchant Id (for updates).
          </small>
          <button className="merchant-list-update-btn">⬆ Bulk Update</button>
        </div>
      </div>

      {/* Global Merchant Status */}
      <div className="merchant-list-global-status-card">
        <div className="merchant-list-status-left">
          <h3>Global Merchant Status</h3>
          <p>Override all merchants open / closed status.</p>
        </div>

        <div className="merchant-list-status-right">
          <span className="merchant-list-status-open">🟢 All Open</span>
          <button className="merchant-list-apply-btn">
            ✔ Apply to All Merchants
          </button>
        </div>
      </div>

      {/* Merchant List */}
      <div className="merchant-list-container">
        <div className="merchant-list-heading">
          <div>
            <h2>Merchants List</h2>
            <p>View and manage all the merchants</p>
          </div>

          <div className="merchant-list-actions">
            <button className="merchant-list-columns-btn">Columns ▼</button>
            <button 
              className="merchant-list-create-btn"
              onClick={handleCreateMerchant}
            >
              + Create Merchant
            </button>
          </div>
        </div>

        <div className="merchant-list-toolbar-bottom">
          <div className="merchant-list-entries">
            <span>Show</span>
            <select value={itemsPerPage} onChange={handleEntriesChange}>
              <option value={10}>10</option>
              <option value={30}>30</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>entries</span>
          </div>

          <div className="merchant-list-search-export">
            <input
              type="text"
              placeholder="Search merchants..."
              className="merchant-list-search-box"
              value={search}
              onChange={handleSearchChange}
            />
            <button className="merchant-list-export-btn">Export as ▼</button>
          </div>
        </div>

        <table className="merchant-list-table">
          <thead>
            <tr>
              <th>
                <input type="checkbox" />
              </th>
              <th>Merchant Info</th>
              <th>Owner Info</th>
              <th>State</th>
              <th>Status</th>
              <th>Approved</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="7"
                  style={{
                    textAlign: "center",
                    padding: "20px",
                  }}
                >
                  Loading...
                </td>
              </tr>
            ) : currentMerchants.length > 0 ? (
              currentMerchants.map((merchant) => (
                <React.Fragment key={merchant.merchantId}>
                  <tr>
                    <td>
                      <button
                        className="merchant-list-expand-btn"
                        onClick={() =>
                          setExpandedRow(
                            expandedRow === merchant.merchantId
                              ? null
                              : merchant.merchantId
                          )
                        }
                      >
                        {expandedRow === merchant.merchantId ? "−" : "+"}
                      </button>
                      <input type="checkbox" />
                    </td>

                    <td>
                      <div className="merchant-list-info">
                        <img
                          src={merchant.profilePicUrl || "/default-shop.png"}
                          alt={merchant.merchantName}
                        />
                        <div>
                          <strong>{merchant.merchantName}</strong>
                          <br />
                          <small>{merchant.merchantBusinessType}</small>
                        </div>
                      </div>
                    </td>

                    <td>
                      {merchant.firstName} {merchant.lastName}
                      <br />
                      {merchant.merchantPhone}
                      <br />
                      <small>{merchant.merchantEmail}</small>
                    </td>

                    <td>{merchant.state || "N/A"}</td>
                    <td>{merchant.status || "N/A"}</td>
                    <td>{merchant.isApproved ? "Yes" : "No"}</td>

                    <td>
                      {merchant.createdAt ? new Date(merchant.createdAt).toLocaleDateString() : "N/A"}
                    </td>
                  </tr>

                  {/* Expanded Row showing full dynamic details & single View All Outlets button */}
                  {expandedRow === merchant.merchantId && (
                    <tr className="merchant-list-expanded-row">
                      <td colSpan="7">
                        <div className="merchant-list-expand-container">
                          {/* Left Panel: All Dynamic Merchant Details */}
                          <div className="merchant-list-left" style={{ flex: 1 }}>
                            <div className="merchant-list-item">
                              <span>Merchant ID</span>
                              <strong>{merchant.merchantId || "N/A"}</strong>
                            </div>

                            <div className="merchant-list-item">
                              <span>Owner Name</span>
                              <strong>
                                {merchant.firstName} {merchant.lastName}
                              </strong>
                            </div>

                            <div className="merchant-list-item">
                              <span>Business Type</span>
                              <strong>
                                {merchant.merchantBusinessType || "N/A"}
                              </strong>
                            </div>

                            <div className="merchant-list-item">
                              <span>Email</span>
                              <strong>{merchant.merchantEmail || "N/A"}</strong>
                            </div>

                            <div className="merchant-list-item">
                              <span>Phone Number</span>
                              <strong>{merchant.merchantPhone || "N/A"}</strong>
                            </div>

                            <div className="merchant-list-item">
                              <span>Area</span>
                              <strong>{merchant.area || "N/A"}</strong>
                            </div>

                            <div className="merchant-list-item">
                              <span>City</span>
                              <strong>{merchant.city || "N/A"}</strong>
                            </div>

                            <div className="merchant-list-item">
                              <span>State</span>
                              <strong>{merchant.state || "N/A"}</strong>
                            </div>

                            <div className="merchant-list-item">
                              <span>API Status</span>
                              <strong>{merchant.status || "N/A"}</strong>
                            </div>

                            <div className="merchant-list-item">
                              <span>Is Approved</span>
                              <strong>{merchant.isApproved ? "True" : "False"}</strong>
                            </div>

                            <div className="merchant-list-item">
                              <span>Active Status</span>
                              <span
                                className={
                                  merchant.isActive === "Y" ||
                                  merchant.isActive === true
                                    ? "merchant-list-plan-badge"
                                    : "merchant-list-expired-badge"
                                }
                              >
                                {merchant.isActive === "Y" ||
                                merchant.isActive === true
                                  ? "Active"
                                  : "Inactive"}
                              </span>
                            </div>
                          </div>

                          {/* Right Panel: Single View All Outlets Button */}
                          <div
                            className="merchant-list-right"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flex: "0 0 250px",
                              padding: "20px",
                            }}
                          >
                            <button
                              onClick={() => openOutlets(merchant)}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                backgroundColor: "#FF6A00",
                                color: "#ffffff",
                                border: "none",
                                padding: "12px 20px",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontWeight: "bold",
                                fontSize: "14px",
                              }}
                            >
                              <FaStore /> View All Outlets
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td
                  colSpan="7"
                  style={{
                    textAlign: "center",
                    padding: "20px",
                  }}
                >
                  No Merchants Found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination Footer Controls */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px 20px" }}>
          <div>
            Showing {filteredMerchants.length > 0 ? indexOfFirstItem + 1 : 0} to{" "}
            {Math.min(indexOfLastItem, filteredMerchants.length)} of {filteredMerchants.length} entries
          </div>

          <div style={{ display: "flex", gap: "5px" }}>
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              style={{ padding: "6px 12px", cursor: currentPage === 1 ? "not-allowed" : "pointer" }}
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index + 1}
                onClick={() => setCurrentPage(index + 1)}
                style={{
                  padding: "6px 12px",
                  backgroundColor: currentPage === index + 1 ? "#FF6A00" : "#f0f0f0",
                  color: currentPage === index + 1 ? "#fff" : "#000",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                {index + 1}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              style={{ padding: "6px 12px", cursor: currentPage === totalPages ? "not-allowed" : "pointer" }}
            >
              Next
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Merchants;