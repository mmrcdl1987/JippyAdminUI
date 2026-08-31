import { useEffect, useState } from "react";
import "../styles/ApprovalRequests.css";
import {
  getAllRejectedApprovals,
  updateRejectedApprovalsToPending,
  getRejectedApprovalTransactions,
} from "../services/approvalService";

function RejectedApprovals() {
  const [rejectedList, setRejectedList] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState("");

  // Re-open (Update to PENDING) Modal State
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [targetItem, setTargetItem] = useState(null);
  const [updatedByInput, setUpdatedByInput] = useState(1);
  const [updating, setUpdating] = useState(false);

  // Entity Detail Popup
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDetailItem, setSelectedDetailItem] = useState(null);

  useEffect(() => {
    fetchRejectedApprovals();
  }, []);

  const fetchRejectedApprovals = async () => {
    try {
      setFetching(true);
      const res = await getAllRejectedApprovals();
      console.log("Rejected Approvals Response:", res);

      let dataList = [];
      if (Array.isArray(res)) {
        dataList = res;
      } else if (res && Array.isArray(res.data)) {
        dataList = res.data;
      } else if (res && Array.isArray(res.content)) {
        dataList = res.content;
      } else if (res && typeof res === "object") {
        dataList = res.data || res.rejectedApprovals || [];
      }

      // Fetch from transaction endpoint as well if needed
      try {
        const txRes = await getRejectedApprovalTransactions();
        console.log("Rejected Transactions Response:", txRes);
        let txList = [];
        if (Array.isArray(txRes)) {
          txList = txRes;
        } else if (txRes && Array.isArray(txRes.data)) {
          txList = txRes.data;
        } else if (txRes && Array.isArray(txRes.content)) {
          txList = txRes.content;
        } else if (txRes && typeof txRes === "object") {
          txList = txRes.data || txRes.approvalTransactions || [];
        }

        if (Array.isArray(txList) && txList.length > 0) {
          // Merge items that are not already present
          const existingIds = new Set(dataList.map((d) => d.approvalRequestId || d.approvalTransactionsId));
          for (const item of txList) {
            const itemId = item.approvalRequestId || item.approvalTransactionsId;
            if (itemId && !existingIds.has(itemId)) {
              dataList.push(item);
            }
          }
        }
      } catch (txErr) {
        console.log("No extra rejected transaction details found:", txErr);
      }

      setRejectedList(Array.isArray(dataList) ? dataList : []);
    } catch (error) {
      console.error("Error fetching rejected approvals:", error);
      setRejectedList([]);
    } finally {
      setFetching(false);
    }
  };

  const openReopenModal = (item) => {
    setTargetItem(item);
    setUpdatedByInput(1);
    setShowReopenModal(true);
  };

  const handleConfirmReopen = async () => {
    if (!targetItem || !targetItem.approvalRequestId) return;

    try {
      setUpdating(true);
      const payload = {
        approvalRequestId: Number(targetItem.approvalRequestId),
        updatedBy: Number(updatedByInput) || 1,
      };

      const res = await updateRejectedApprovalsToPending(payload);
      console.log("Update Rejected to Pending Response:", res);

      alert(
        `Approval Request #${targetItem.approvalRequestId} updated to PENDING successfully.`
      );

      // Remove updated item from rejected list
      setRejectedList((prev) =>
        prev.filter((item) => item.approvalRequestId !== targetItem.approvalRequestId)
      );

      setShowReopenModal(false);
      setTargetItem(null);
    } catch (error) {
      console.error("Reopen Error:", error);
      const errMsg =
        error.response?.data?.errorMessage ||
        error.response?.data?.message ||
        "Failed to update Rejected Request to PENDING.";
      alert(errMsg);
    } finally {
      setUpdating(false);
    }
  };

  // Helper function to extract name from DTO
  const getEntityName = (item) => {
    return (
      item.outletName ||
      item.merchantName ||
      (item.driverFirstName ? `${item.driverFirstName} ${item.driverLastName || ""}` : null) ||
      `Entity #${item.entityId}`
    );
  };

  // Helper function to extract phone/email from DTO
  const getEntityContact = (item) => {
    const phone = item.outletPhone || item.merchantPhone || item.driverPhoneNumber || "";
    const email = item.outletEmail || item.merchantEmail || item.driverEmail || "";
    return `${phone} ${email ? "• " + email : ""}`;
  };

  // Helper function to extract image from DTO
  const getEntityImage = (item) => {
    return (
      item.outletImage ||
      item.profileImage ||
      item.driverProfileImage ||
      item.profilePicUrl ||
      item.merchantProfilePicUrl ||
      null
    );
  };

  // Open entity detail popup
  const openDetailModal = (item) => {
    setSelectedDetailItem(item);
    setShowDetailModal(true);
  };

  // Helper to render a value gracefully
  const renderVal = (val) => {
    if (val === null || val === undefined || val === "") {
      return <span className="req-detail-value empty">—</span>;
    }
    if (typeof val === "boolean") {
      return val
        ? <span className="req-detail-bool-yes">Yes</span>
        : <span className="req-detail-bool-no">No</span>;
    }
    return <span className="req-detail-value">{String(val)}</span>;
  };

  const DetailField = ({ label, value }) => (
    <div className="req-detail-field">
      <span className="req-detail-label">{label}</span>
      {renderVal(value)}
    </div>
  );

  const renderEntityDetailModal = () => {
    const d = selectedDetailItem;
    if (!d) return null;

    const imgUrl = getEntityImage(d);
    const entityName = getEntityName(d);
    const entityType = d.entityType || "UNKNOWN";

    return (
      <div className="req-modal-overlay" onClick={() => setShowDetailModal(false)}>
        <div className="req-detail-modal" onClick={(e) => e.stopPropagation()}>

          {/* Header */}
          <div className="req-detail-modal-header" style={{ background: "linear-gradient(135deg, #7f1d1d 0%, #b91c1c 100%)" }}>
            {imgUrl ? (
              <img src={imgUrl} alt={entityName} className="req-detail-modal-avatar"
                onError={(e) => { e.target.style.display = "none"; }} />
            ) : (
              <div className="req-detail-modal-avatar-fallback">
                {entityName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="req-detail-modal-title">
              <h3>{entityName}</h3>
              <p>Request #{d.approvalRequestId} &nbsp;•&nbsp; {entityType}</p>
              <div className="req-detail-modal-badges">
                <span className="req-detail-modal-badge">{d.currentLevel || "Level 1"}</span>
                <span className="req-detail-modal-badge" style={{ background: "rgba(239,68,68,0.35)" }}>REJECTED</span>
                {d.entityId && <span className="req-detail-modal-badge">ID #{d.entityId}</span>}
              </div>
            </div>
            <button className="req-detail-modal-close" onClick={() => setShowDetailModal(false)}>✕</button>
          </div>

          {/* Scrollable Body */}
          <div className="req-detail-modal-body">

            {/* === Rejection Info === */}
            {d.rejectedReason && (
              <div className="req-detail-section">
                <p className="req-detail-section-title">❌ Rejection Details</p>
                <div style={{ background: "#fff5f5", borderLeft: "4px solid #ef4444", padding: "10px 14px", borderRadius: "4px", fontSize: "13px", color: "#7f1d1d" }}>
                  {d.rejectedReason}
                </div>
              </div>
            )}

            {/* === Approval Request === */}
            <div className="req-detail-section">
              <p className="req-detail-section-title">📋 Approval Request</p>
              <div className="req-detail-grid">
                <DetailField label="Request ID" value={d.approvalRequestId} />
                <DetailField label="Entity Type" value={d.entityType} />
                <DetailField label="Entity ID" value={d.entityId} />
                <DetailField label="Current Level" value={d.currentLevel} />
                <DetailField label="Status" value={d.status} />
                <DetailField label="Created At" value={d.requestCreatedAt ? new Date(d.requestCreatedAt).toLocaleString() : null} />
              </div>
            </div>

            {/* === Outlet Details === */}
            {(d.outletId || d.outletName || d.outletPhone || d.outletEmail) && (
              <div className="req-detail-section">
                <p className="req-detail-section-title">🏪 Outlet Details</p>
                <div className="req-detail-grid">
                  <DetailField label="Outlet ID" value={d.outletId} />
                  <DetailField label="Outlet Name" value={d.outletName} />
                  <DetailField label="Merchant ID" value={d.merchantId} />
                  <DetailField label="Merchant Name" value={d.merchantName} />
                  <DetailField label="Cuisine Type" value={d.cuisineType} />
                  <DetailField label="Phone" value={d.outletPhone} />
                  <DetailField label="Email" value={d.outletEmail} />
                  <DetailField label="Alternate Phone" value={d.alternatePhone} />
                  <DetailField label="Latitude" value={d.latitude} />
                  <DetailField label="Longitude" value={d.longitude} />
                  <DetailField label="FSSAI Number" value={d.fssaiNumber} />
                  <DetailField label="GST Number" value={d.gstNumber} />
                  <DetailField label="Outlet Approved" value={d.outletApproved} />
                </div>
              </div>
            )}

            {/* === Merchant Details === */}
            {(d.merchantEmail || d.merchantPhone || d.merchantBusinessType) && (
              <div className="req-detail-section">
                <p className="req-detail-section-title">🏬 Merchant Details</p>
                <div className="req-detail-grid">
                  <DetailField label="Merchant Name" value={d.merchantName} />
                  <DetailField label="Email" value={d.merchantEmail} />
                  <DetailField label="Phone" value={d.merchantPhone} />
                  <DetailField label="Business Type" value={d.merchantBusinessType} />
                  <DetailField label="Aadhaar Number" value={d.aadhaarNumber} />
                  <DetailField label="PAN Number" value={d.panNumber} />
                  <DetailField label="Merchant Approved" value={d.merchantApproved} />
                  {d.merchantProfilePicUrl && (
                    <div className="req-detail-field">
                      <span className="req-detail-label">Profile Picture</span>
                      <span className="req-detail-value">
                        <a href={d.merchantProfilePicUrl} target="_blank" rel="noreferrer">View Image ↗</a>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* === Driver Details === */}
            {(d.firstName || d.phoneNumber || d.email || d.driverFirstName) && (
              <div className="req-detail-section">
                <p className="req-detail-section-title">🚗 Driver Details</p>
                <div className="req-detail-grid">
                  <DetailField label="Driver ID" value={d.driverId} />
                  <DetailField label="First Name" value={d.firstName || d.driverFirstName} />
                  <DetailField label="Last Name" value={d.lastName || d.driverLastName} />
                  <DetailField label="Phone" value={d.phoneNumber || d.driverPhoneNumber} />
                  <DetailField label="Email" value={d.email || d.driverEmail} />
                  <DetailField label="Nominee Name" value={d.nomineeName} />
                  <DetailField label="Nominee Phone" value={d.nomineePhoneNumber} />
                  <DetailField label="Nominee Verified" value={d.nomineeVerified} />
                  <DetailField label="Family Member" value={d.familyMemberName} />
                  <DetailField label="Family Phone" value={d.familyMemberPhoneNumber} />
                  <DetailField label="Family Verified" value={d.familyMemberVerified} />
                  {(d.profilePicUrl || d.driverProfileImage) && (
                    <div className="req-detail-field">
                      <span className="req-detail-label">Profile Picture</span>
                      <span className="req-detail-value">
                        <a href={d.profilePicUrl || d.driverProfileImage} target="_blank" rel="noreferrer">View Image ↗</a>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* === Driver KYC === */}
            {(d.driverKycId || d.driverAadhaarNumber || d.drivingLicenseNumber) && (
              <div className="req-detail-section">
                <p className="req-detail-section-title">🪪 Driver KYC</p>
                <div className="req-detail-grid">
                  <DetailField label="KYC ID" value={d.driverKycId} />
                  <DetailField label="Aadhaar Number" value={d.driverAadhaarNumber} />
                  <DetailField label="Driving License" value={d.drivingLicenseNumber} />
                  <DetailField label="RC Copy" value={d.rcCopy} />
                </div>
              </div>
            )}

            {/* === Address === */}
            {(d.addressId || d.cityName || d.stateName) && (
              <div className="req-detail-section">
                <p className="req-detail-section-title">📍 Address</p>
                <div className="req-detail-grid">
                  <DetailField label="Address ID" value={d.addressId} />
                  <DetailField label="Building No." value={d.buildingNumber} />
                  <DetailField label="Road" value={d.road} />
                  <DetailField label="Landmark" value={d.landmark} />
                  <DetailField label="Area" value={d.areaName} />
                  <DetailField label="City" value={d.cityName} />
                  <DetailField label="State" value={d.stateName} />
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    );
  };

  const filteredList = rejectedList.filter((item) => {
    const q = search.toLowerCase();
    const name = getEntityName(item).toLowerCase();
    const contact = getEntityContact(item).toLowerCase();
    const type = (item.entityType || "").toLowerCase();
    const reason = (item.rejectedReason || "").toLowerCase();
    const reqId = String(item.approvalRequestId || "");

    return (
      name.includes(q) ||
      contact.includes(q) ||
      type.includes(q) ||
      reason.includes(q) ||
      reqId.includes(q)
    );
  });

  return (
    <div className="req-page-wrapper">
      <div className="req-header-flex">
        <div>
          <h2 className="req-page-title">Rejected Approvals</h2>
          <p className="req-subtitle">
            View all rejected approval transactions and re-open eligible requests back to PENDING.
          </p>
        </div>
        <button
          className="req-refresh-btn"
          onClick={fetchRejectedApprovals}
          disabled={fetching}
        >
          {fetching ? "Refreshing..." : "🔄 Refresh Rejected"}
        </button>
      </div>

      {/* Main Table Card */}
      <div className="req-card">
        <div className="req-card-header red">REJECTED APPROVAL REQUESTS</div>

        <div className="req-table-toolbar">
          <div className="req-search-box">
            <input
              type="text"
              placeholder="Search by name, contact, entity type, reason, ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <span className="req-batch-count" style={{ fontSize: "13px", color: "#475569" }}>
            Total Rejected: {filteredList.length}
          </span>
        </div>

        <div className="req-table-wrapper">
          <table className="req-table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Entity Details</th>
                <th>Entity Type</th>
                <th>Entity ID</th>
                <th>Rejection Reason</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {fetching ? (
                <tr>
                  <td colSpan="7" className="req-empty-row">
                    Loading Rejected Approvals...
                  </td>
                </tr>
              ) : filteredList.length > 0 ? (
                filteredList.map((item) => {
                  const reqId = item.approvalRequestId;
                  const imgUrl = getEntityImage(item);
                  const entityName = getEntityName(item);

                  return (
                    <tr key={reqId || Math.random()}>
                      <td>
                        <strong>#{reqId}</strong>
                      </td>
                      <td>
                        <div
                          className="req-entity-cell req-entity-cell-clickable"
                          onClick={() => openDetailModal(item)}
                          title="Click to view full entity details"
                        >
                          {imgUrl ? (
                            <img
                              src={imgUrl}
                              alt={entityName}
                              className="req-avatar-img"
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="req-avatar-fallback">
                              {entityName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="req-entity-info">
                            <span className="req-entity-name">{entityName}</span>
                            <span className="req-entity-meta">{getEntityContact(item)}</span>
                            <span className="req-detail-view-hint">👁 Click to view all details</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          className={
                            item.entityType === "OUTLET"
                              ? "req-badge-outlet"
                              : item.entityType === "MERCHANT"
                              ? "req-badge-merchant"
                              : "req-badge-driver"
                          }
                        >
                          {item.entityType || "UNKNOWN"}
                        </span>
                      </td>
                      <td>
                        <code>ID #{item.entityId}</code>
                      </td>
                      <td style={{ maxWidth: "250px" }}>
                        <div className="req-reason-box">
                          {item.rejectedReason || "No reason provided"}
                        </div>
                      </td>
                      <td>
                        <span className="req-status-rejected">REJECTED</span>
                      </td>
                      <td>
                        <button
                          className="req-btn-reopen"
                          onClick={() => openReopenModal(item)}
                          title="Change status from REJECTED back to PENDING"
                        >
                          ↩ Re-open to Pending
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="req-empty-row">
                    No Rejected Approval Requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Entity Detail Modal */}
      {showDetailModal && selectedDetailItem && renderEntityDetailModal()}

      {/* Re-open Modal */}
      {showReopenModal && targetItem && (
        <div className="req-modal-overlay">
          <div className="req-modal">
            <div
              className="req-modal-header"
              style={{ background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)" }}
            >
              <h3>Re-open Request #{targetItem.approvalRequestId} to PENDING</h3>
              <button
                className="req-modal-close"
                onClick={() => {
                  setShowReopenModal(false);
                  setTargetItem(null);
                }}
              >
                ✕
              </button>
            </div>

            <div className="req-modal-body">
              <div
                style={{
                  background: "#f0f9ff",
                  borderLeft: "4px solid #0284c7",
                  padding: "12px",
                  borderRadius: "4px",
                  fontSize: "13px",
                  color: "#0369a1",
                  marginBottom: "16px",
                }}
              >
                <strong>Business Rule:</strong> Updating this request will change its status from{" "}
                <strong>REJECTED</strong> back to <strong>PENDING</strong>. Entity ID, Entity Type, and Current Level will remain unchanged.
              </div>

              <div className="req-form-group">
                <label className="req-form-label">Updated By (User ID)</label>
                <input
                  type="number"
                  className="req-form-input"
                  value={updatedByInput}
                  onChange={(e) => setUpdatedByInput(e.target.value)}
                  placeholder="Enter User / Admin ID"
                />
              </div>
            </div>

            <div className="req-modal-footer">
              <button
                className="req-modal-cancel-btn"
                onClick={() => {
                  setShowReopenModal(false);
                  setTargetItem(null);
                }}
                disabled={updating}
              >
                Cancel
              </button>
              <button
                className="req-modal-submit-btn"
                style={{ background: "#0284c7" }}
                onClick={handleConfirmReopen}
                disabled={updating}
              >
                {updating ? "Updating..." : "Update to PENDING"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RejectedApprovals;
