import "../../styles/Merchants/Merchants.css";
import React, { useEffect, useState } from "react";
import { FM_API } from "../../services/api";

import {
  FaChartBar,
  FaClipboardList,
  FaFileAlt,
  FaEye,
  FaPen,
  FaUsers,
  FaTrash,
  FaStar,
} from "react-icons/fa";

function Merchants({ setActivePage }) {
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [expandedRow, setExpandedRow] = useState(null);

  useEffect(() => {
    fetchMerchants();
  }, []);

  const openEdit = (merchant) => {
    localStorage.setItem("merchantId", merchant.merchantId);
    setActivePage("editMerchant");
  };

  const openView = (merchant) => {
    localStorage.setItem("merchantId", merchant.merchantId);
    setActivePage("viewMerchant");
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
      merchant.state?.toLowerCase().includes(keyword) ||
      merchant.merchantBusinessType?.toLowerCase().includes(keyword)
    );
  });

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
            <option>Select Zone</option>
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

          <h1>
            {
              merchants.filter((m) => m.isApproved).length
            }
          </h1>

          <p>Newly Joined Merchants</p>

        </div>

      </div>

      {/* ================= Bulk Import ================= */}

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

          <label>
            Select Excel File (.xls/.xlsx)
          </label>

          <input
            type="file"
            className="merchant-list-file-input"
          />

          <small>
            File should contain Merchant Name, Email, Mobile,
            Address, Zone, Business Model, Merchant Type and
            Merchant Id (for updates).
          </small>

          <button className="merchant-list-update-btn">
            ⬆ Bulk Update
          </button>

        </div>

      </div>

      {/* Global Merchant Status */}

      <div className="merchant-list-global-status-card">

        <div className="merchant-list-status-left">

          <h3>Global Merchant Status</h3>

          <p>
            Override all merchants open / closed status.
          </p>

        </div>

        <div className="merchant-list-status-right">

          <span className="merchant-list-status-open">
            🟢 All Open
          </span>

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

            <button className="merchant-list-columns-btn">
              Columns ▼
            </button>

            <button className="merchant-list-create-btn">
              + Create Merchant
            </button>

          </div>

        </div>

        <div className="merchant-list-toolbar-bottom">

          <div className="merchant-list-entries">

            <span>Show</span>

            <select>
              <option>30</option>
              <option>50</option>
            </select>

            <span>entries</span>

          </div>

          <div className="merchant-list-search-export">

            <input
              type="text"
              placeholder="Search merchants..."
              className="merchant-list-search-box"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <button className="merchant-list-export-btn">
              Export as ▼
            </button>

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

              <th>Zone</th>

              <th>Admin Commission</th>

              <th>Date</th>

            </tr>

          </thead>

          <tbody>

            {loading ? (
                            <tr>

                <td
                  colSpan="6"
                  style={{
                    textAlign: "center",
                    padding: "20px",
                  }}
                >
                  Loading...
                </td>

              </tr>

            ) : filteredMerchants.length > 0 ? (

              filteredMerchants.map((merchant) => (

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
                          src={
                            merchant.profilePicUrl ||
                            "/default-shop.png"
                          }
                          alt={merchant.merchantName}
                        />

                        <div>

                          <strong>
                            {merchant.merchantName}
                          </strong>

                          <br />

                          <small>
                            {merchant.merchantBusinessType}
                          </small>

                        </div>

                      </div>

                    </td>

                    <td>

                      {merchant.firstName} {merchant.lastName}

                      <br />

                      {merchant.merchantPhone}

                      <br />

                      <small>
                        {merchant.merchantEmail}
                      </small>

                    </td>

                    <td>
                      {merchant.state}
                    </td>

                    <td>
                      {merchant.status}
                    </td>

                    <td>
                      {new Date(
                        merchant.createdAt
                      ).toLocaleDateString()}
                    </td>

                  </tr>

                  {expandedRow === merchant.merchantId && (

                    <tr className="merchant-list-expanded-row">

                      <td colSpan="6">

                        <div className="merchant-list-expand-container">

    <div className="merchant-list-left">

        <div className="merchant-list-item">
            <span>Wallet History</span>
            <strong>-</strong>
        </div>

        <div className="merchant-list-item">
            <span>Plan Name</span>

            <span className="merchant-list-plan-badge">
                Commission Plan
            </span>
        </div>

        <div className="merchant-list-item">
            <span>Plan Commission</span>
            <strong>N/A</strong>
        </div>

        <div className="merchant-list-item">
            <span>Plan Expiry Date</span>

            <span className="merchant-list-expired-badge">
                Expired
            </span>
        </div>

        <div className="merchant-list-item">
            <span>Best</span>
            <FaStar style={{ color: "#ffb400" }} />
        </div>

        <div className="merchant-list-item">
            <span>GST</span>

            <label className="merchant-list-switch">
                <input
                    type="checkbox"
                    checked
                    readOnly
                />
                <span className="merchant-list-slider"></span>
            </label>

        </div>

        <div className="merchant-list-item">
            <span>Publish</span>

            <label className="merchant-list-switch">
                <input
                    type="checkbox"
                    checked
                    readOnly
                />
                <span className="merchant-list-slider"></span>
            </label>

        </div>

    </div>

    <div className="merchant-list-right">

        <h4>Actions</h4>

        <div className="merchant-list-action-icons">

    <div className="merchant-list-action-item">
        <FaChartBar color="#19b44b" />
        <span>Analytics</span>
    </div>

    <div className="merchant-list-action-item">
        <FaClipboardList color="#ff6b35" />
        <span>Orders</span>
    </div>

    <div className="merchant-list-action-item">
        <FaFileAlt color="#8d6e63" />
        <span>Documents</span>
    </div>

    <div
        className="merchant-list-action-item"
        onClick={() => openView(merchant)}
    >
        <FaEye color="#7b1fa2" />
        <span>View</span>
    </div>

    <div
        className="merchant-list-action-item"
        onClick={() => openEdit(merchant)}
    >
        <FaPen color="#1565c0" />
        <span>Edit</span>
    </div>

    <div className="merchant-list-action-item">
        <FaUsers color="#1565c0" />
        <span>Users</span>
    </div>

    <div className="merchant-list-action-item">
        <FaTrash color="#f44336" />
        <span>Delete</span>
    </div>

</div>

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
                  colSpan="6"
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

      </div>

    </div>

  );
}

export default Merchants;