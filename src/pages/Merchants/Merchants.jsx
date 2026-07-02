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

    localStorage.setItem(
        "merchantId",
        merchant.merchantId
    );

    setActivePage("editMerchant");

};
const openView = (merchant) => {

    localStorage.setItem(
        "merchantId",
        merchant.merchantId
    );

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
    <div className="merchant-page">

      {/* Header */}
      <div className="merchant-header">
        <div>
          <h2>Merchants</h2>
        </div>

        <div className="breadcrumb">
          Dashboard &gt; Merchants &gt; Merchants List
        </div>
      </div>

      {/* Top Title & Filters */}
      <div className="merchant-toolbar">

        <div className="merchant-title">
          <span className="shop-icon">🏪</span>
          <h2>
            Merchants
            <span className="count-badge">
  {merchants.length}
</span>
          </h2>
        </div>

        <div className="merchant-filters">

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
      <div className="stats-row">

        <div className="card total">
         <h1>{merchants.length}</h1>
          <p>Total Merchants</p>
        </div>

        <div className="card active">
          <h1>
  {merchants.filter(m => m.isActive === "Y" || m.isActive === true).length}
</h1>
          <p>Active Merchants</p>
        </div>

        <div className="card inactive">
          <h1>
  {merchants.filter(m => m.isActive === "N" || m.isActive === false).length}
</h1>
          <p>Inactive Merchants</p>
        </div>

        <div className="card new">
          <h1>
  {merchants.filter(m => m.isApproved).length}
</h1>
          <p>Newly Joined Merchants</p>
        </div>

      </div>
      {/* ================= Bulk Import ================= */}

{/* Bulk Import */}

<div className="bulk-import-card">

  <div className="bulk-left">

    <h2>Bulk Import / Update Merchants</h2>

    <p>
      Upload Excel file to import or update multiple merchants at once
    </p>

  </div>

  <div className="bulk-middle">

    <button className="download-btn">
      ⬇ Download Template
    </button>

  </div>

  <div className="bulk-right">

    <label>
      Select Excel File (.xls/.xlsx)
    </label>

    <input
      type="file"
      className="bulk-file"
    />

    <small>
      File should contain Merchant Name, Email, Mobile,
      Address, Zone, Business Model, Merchant Type and
      Merchant Id (for updates).
    </small>

    <button className="bulk-update-btn">
      ⬆ Bulk Update
    </button>

  </div>

</div>
      {/* Global Merchant Status */}
     {/* Global Merchant Status */}

<div className="global-status-card">

  <div className="status-left">
    <h3>Global Merchant Status</h3>
    <p>Override all merchants open / closed status.</p>
  </div>

  <div className="status-right">

    <span className="status-open">
      🟢 All Open
    </span>

    <button className="apply-btn">
      ✔ Apply to All Merchants
    </button>

  </div>

</div>

      {/* Merchant List */}

      <div className="merchant-list-card">

        <div className="merchant-list-header">

          <div>
            <h2>Merchants List</h2>
            <p>View and manage all the merchants</p>
          </div>

          <div className="merchant-actions">

            <button className="columns-btn">
              Columns ▼
            </button>

            <button className="create-btn">
              + Create Merchant
            </button>

          </div>

        </div>

        <div className="merchant-toolbar2">

          <div className="entries">

            <span>Show</span>

            <select>
              <option>30</option>
              <option>50</option>
            </select>

            <span>entries</span>

          </div>

          <div className="search-export">

        <input
  type="text"
  placeholder="Search merchants..."
  className="search-box"
  value={search}
  onChange={(e) => setSearch(e.target.value)}
/>
            <button className="export-btn">
              Export as ▼
            </button>

          </div>

        </div>

      <table className="merchant-table">

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
      <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
        Loading...
      </td>
    </tr>

  ) : filteredMerchants.length > 0 ? (

   filteredMerchants.map((merchant) => (
  <React.Fragment key={merchant.merchantId}>

    <tr>

      <td>
        <button
          className="expand-btn"
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
        <div className="merchant-info">
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

      <td>{merchant.state}</td>

      <td>{merchant.status}</td>

      <td>{new Date(merchant.createdAt).toLocaleDateString()}</td>

    </tr>

    {expandedRow === merchant.merchantId && (
      <tr className="expanded-row">
        <td colSpan="6">

          <table className="merchant-details-table">

  <tbody>

    <tr>
      <td><strong>Wallet History</strong></td>
      <td>-</td>
    </tr>

    <tr>
      <td><strong>Plan Name</strong></td>
      <td>
        <span className="plan-badge">
          Commission Plan
        </span>
      </td>
    </tr>

    <tr>
      <td><strong>Plan Commission</strong></td>
      <td>N/A</td>
    </tr>

    <tr>
      <td><strong>Plan Expiry Date</strong></td>
      <td>
        <span className="expired-badge">
          Expired
        </span>
      </td>
    </tr>

    <tr>
      <td><strong>Best</strong></td>
      <td>
  <FaStar style={{ color: "#ffb400" }} />
</td>
    </tr>

    <tr>
      <td><strong>GST</strong></td>
      <td>
        <label className="switch">
          <input
    type="checkbox"
    checked={merchant.isActive === "Y"}
    readOnly
/>
          <span className="slider"></span>
        </label>
      </td>
    </tr>

    <tr>
      <td><strong>Publish</strong></td>
      <td>
        <label className="switch">
          <input type="checkbox" checked readOnly />
          <span className="slider"></span>
        </label>
      </td>
    </tr>

    <tr>
      <td><strong>Actions</strong></td>

  <td className="action-icons">

  <FaChartBar
    title="Analytics"
    style={{ cursor: "pointer" }}
  />

  <FaClipboardList
    title="Orders"
    style={{ cursor: "pointer" }}
  />

  <FaFileAlt
    title="Documents"
    style={{ cursor: "pointer" }}
  />

  <FaEye
    title="View"
    style={{ cursor: "pointer", color: "#7b1fa2" }}
    onClick={() => openView(merchant)}
  />

  <FaPen
    title="Edit"
    style={{ cursor: "pointer", color: "#2196f3" }}
    onClick={() => openEdit(merchant)}
  />

  <FaUsers
    title="Users"
    style={{ cursor: "pointer" }}
  />

  <FaTrash
    title="Delete"
    style={{ cursor: "pointer", color: "red" }}
  />

</td>
    </tr>

  </tbody>

</table>

        </td>
      </tr>
    )}

  </React.Fragment>
))

  ) : (

    <tr>

      <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
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