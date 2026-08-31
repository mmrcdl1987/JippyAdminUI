import { useEffect, useState } from "react";
import "../styles/ApprovalRequests.css";
import {
  getPendingApprovalRequests,
  getAllPendingApprovals,
  updateApprovalRequestsToApproved,
  triggerAutoApprovalTestProcess,
  getPendingApprovalTransactions,
  getAllRejectedApprovals,
  updateRejectedApprovalsToPending,
} from "../services/approvalService";
import { isSuperAdmin, isFleetManager } from "../utils/permissionUtils";
import { fetchOutletDetailsById } from "../services/outletPriceService";
import { getAllMerchants } from "../services/merchantService";
import { FM_API } from "../services/api";

// Top-level Helper to extract approval request ID safely across all backend DTO aliases
export const getReqId = (item) => {
  if (!item) return null;
  return (
    item.approvalRequestId ??
    item.approval_request_id ??
    item.id ??
    item.approvalTransactionsId ??
    item.approval_transactions_id
  );
};

// Top-level Recursive helper to check if any property in item indicates Level 2, 3, 4, 5
export const isLevel2OrHigher = (obj) => {
  if (!obj) return false;

  const isLvl2OrHigherVal = (val) => {
    if (val === null || val === undefined) return false;
    const str = String(val).trim();
    const lower = str.toLowerCase();

    return (
      str === "Level 2" || str === "Level 3" || str === "Level 4" || str === "Level 5" ||
      str === "2" || str === "3" || str === "4" || str === "5" ||
      lower === "level 2" || lower === "level 3" || lower === "level 4" || lower === "level 5" ||
      lower === "level-2" || lower === "level-3" || lower === "level_2" || lower === "level_3" ||
      lower === "level2" || lower === "level3" || lower === "2" || lower === "3" ||
      lower.includes("level 2") || lower.includes("level 3") || lower.includes("level-2") ||
      lower.includes("level-3") || lower.includes("level_2") || lower.includes("level_3") ||
      lower.includes("level2") || lower.includes("level3")
    );
  };

  if (typeof obj !== "object") {
    return isLvl2OrHigherVal(obj);
  }

  for (const k of Object.keys(obj)) {
    const v = obj[k];
    if (v === null || v === undefined) continue;

    const lowerK = k.toLowerCase();
    if (lowerK.includes("level")) {
      if (isLvl2OrHigherVal(v)) return true;
    }

    if (typeof v === "object" && isLevel2OrHigher(v)) {
      return true;
    }
  }

  return false;
};

// Top-level Helper to verify if request is pending Level 1 approval and can be approved by Level-1 approver / Fleet Manager
export const canApproveLevel1 = (item, isSuper = false) => {
  if (!item) return false;

  const status = String(
    item.status ??
    item.approvalStatus ??
    item.requestStatus ??
    item.approvalRequest?.status ??
    ""
  )
    .trim()
    .toUpperCase();

  const level = String(
    item.currentLevel ??
    item.current_level ??
    item.approvalLevel ??
    item.approval_level ??
    item.level ??
    item.pendingLevel ??
    item.pending_level ??
    item.requestLevel ??
    item.levelName ??
    item.approvalRequest?.currentLevel ??
    item.approvalRequest?.approvalLevel ??
    ""
  )
    .trim()
    .toUpperCase();

  const entityType = String(
    item.entityType ??
    item.entity_type ??
    item.approvalRequest?.entityType ??
    ""
  )
    .trim()
    .toUpperCase();

  // Must be PENDING status
  if (status !== "PENDING" && status !== "") {
    return false;
  }

  // Super Admin can see ALL pending requests (Level 1, Level 2, Level 3)
  if (isSuper) {
    return true;
  }

  // Fleet Manager can see Level 1 and Level 2 (Reject Level 3, Level 4, Level 5)

  // Fleet Manager can approve only DRIVER, MERCHANT, OUTLET entities
  // if (entityType && !["DRIVER", "MERCHANT", "OUTLET"].includes(entityType)) {
  //   return false;
  // }

  return true;
};

function PendingApprovals() {
  const storedApproverId = localStorage.getItem("approverId") || localStorage.getItem("userId");
  const userRole = (localStorage.getItem("role") || "").trim().toUpperCase();
  const isSuper = isSuperAdmin();
  const isFM = isFleetManager() || userRole === "ROLE_FLEET_MANAGER" || userRole === "FLEET_MANAGER";

  const [approverIdInput, setApproverIdInput] = useState(storedApproverId);
  const [activeApproverId, setActiveApproverId] = useState(Number(storedApproverId));
  const [pendingList, setPendingList] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [testingScheduler, setTestingScheduler] = useState(false);
  const [search, setSearch] = useState("");

  // Checkbox Selection for Batch Processing
  const [selectedIds, setSelectedIds] = useState([]);

  // Modal State for Entity Detail Popup
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDetailItem, setSelectedDetailItem] = useState(null);

  // Modal State for Rejection Reason
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [targetRejectIds, setTargetRejectIds] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // ── Rejected Approvals section state ──────────────────────────────────────
  const [rejectedList, setRejectedList] = useState([]);
  const [fetchingRejected, setFetchingRejected] = useState(false);
  const [rejectedSearch, setRejectedSearch] = useState("");

  // Rejected entity detail popup
  const [showRejectedDetailModal, setShowRejectedDetailModal] = useState(false);
  const [selectedRejectedItem, setSelectedRejectedItem] = useState(null);

  // Re-open to Pending modal
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [reopenTarget, setReopenTarget] = useState(null);
  const [reopenUpdatedBy, setReopenUpdatedBy] = useState(
    localStorage.getItem("userId") || "1"
  );
  const [reopening, setReopening] = useState(false);

  useEffect(() => {
    fetchPendingApprovals(storedApproverId);
    fetchRejectedApprovals();
  }, []);

  const fetchPendingApprovals = async (approverId) => {
    try {
      setFetching(true);
      setSelectedIds([]);

      let dataList = [];
      const numId = approverId && !isNaN(Number(approverId)) ? Number(approverId) : 1;
      setActiveApproverId(numId);

      // ── 1. Try the primary approval-requests endpoint ────────────────
      try {
        const res = await getPendingApprovalRequests(numId);
        console.log("Pending Approval Requests Response:", res);
        console.log("First item keys:", Array.isArray(res) && res.length > 0 ? Object.keys(res[0]) : "N/A");

        if (Array.isArray(res)) {
          dataList = res;
        } else if (res && Array.isArray(res.data)) {
          dataList = res.data;
        } else if (res && Array.isArray(res.content)) {
          dataList = res.content;
        } else if (res && typeof res === "object") {
          dataList = res.data || res.pendingRequests || [];
        }
      } catch (levelErr) {
        console.log("Pending Approvals fetch error:", levelErr);
      }

      // ── 2. Fallback to transactions endpoint ─────────────────────────
      let usedTransactionsFallback = false;
      if (!Array.isArray(dataList) || dataList.length === 0) {
        try {
          const txRes = await getPendingApprovalTransactions();
          console.log("Pending Transactions Response:", txRes);
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
            dataList = txList;
            usedTransactionsFallback = true;
          }
        } catch (txErr) {
          console.log("No extra pending transactions found:", txErr);
        }
      }

      // ── 3. Enrich items with entity details if they are missing ──────
      // Check first item to see if entity detail fields are already present
      const firstItem = Array.isArray(dataList) && dataList.length > 0 ? dataList[0] : null;
      const needsEnrichment = firstItem && !firstItem.outletName && !firstItem.merchantName && !firstItem.firstName;

      if (needsEnrichment && Array.isArray(dataList) && dataList.length > 0) {
        console.log("Enriching pending items with entity details...");
        try {
          // Collect unique entity IDs by type
          const outletIds = [...new Set(dataList.filter(i => (i.entityType || "").toUpperCase() === "OUTLET").map(i => i.entityId).filter(Boolean))];
          const merchantIds = [...new Set(dataList.filter(i => (i.entityType || "").toUpperCase() === "MERCHANT").map(i => i.entityId).filter(Boolean))];
          const driverIds = [...new Set(dataList.filter(i => (i.entityType || "").toUpperCase() === "DRIVER").map(i => i.entityId).filter(Boolean))];

          // Build lookup maps in parallel
          const [outletMap, merchantMap, driverMap] = await Promise.all([
            // Fetch outlets individually
            (async () => {
              const map = {};
              await Promise.allSettled(
                outletIds.map(async (id) => {
                  try {
                    const data = await fetchOutletDetailsById(id);
                    const outlet = data?.data || data;
                    map[id] = outlet;
                  } catch (e) { console.log(`Could not fetch outlet ${id}:`, e.message); }
                })
              );
              return map;
            })(),
            // Fetch all merchants and index by ID
            (async () => {
              const map = {};
              try {
                const res = await getAllMerchants();
                const list = Array.isArray(res) ? res : (res?.data || res?.content || []);
                (Array.isArray(list) ? list : []).forEach(m => {
                  const mId = m.merchantId || m.id;
                  if (mId) map[mId] = m;
                });
              } catch (e) { console.log("Could not fetch merchants:", e.message); }
              return map;
            })(),
            // Fetch drivers individually
            (async () => {
              const map = {};
              await Promise.allSettled(
                driverIds.map(async (id) => {
                  try {
                    const res = await FM_API.get(`/api/driver/${id}`);
                    const driver = res?.data?.data || res?.data || {};
                    map[id] = driver;
                  } catch (e) { console.log(`Could not fetch driver ${id}:`, e.message); }
                })
              );
              return map;
            })(),
          ]);

          console.log("Outlet map:", Object.keys(outletMap).length, "Merchant map:", Object.keys(merchantMap).length, "Driver map:", Object.keys(driverMap).length);

          // Merge entity details into each item
          dataList = dataList.map((item) => {
            const type = (item.entityType || "").toUpperCase();
            const eId = item.entityId;
            if (!eId) return item;

            if (type === "OUTLET" && outletMap[eId]) {
              const o = outletMap[eId];
              return {
                ...item,
                outletId: o.outletId || o.id || eId,
                outletName: o.outletName || o.name,
                outletPhone: o.outletPhone || o.phone,
                outletEmail: o.outletEmail || o.email,
                outletImage: o.outletImage || o.image,
                merchantId: o.merchantId,
                merchantName: o.merchantName,
                cuisineType: o.cuisineType,
                latitude: o.latitude,
                longitude: o.longitude,
                fssaiNumber: o.fssaiNumber,
                gstNumber: o.gstNumber,
                outletApproved: o.outletApproved ?? o.approved,
              };
            }

            if (type === "MERCHANT" && merchantMap[eId]) {
              const m = merchantMap[eId];
              return {
                ...item,
                merchantName: m.merchantName || m.name || m.firstName,
                merchantEmail: m.merchantEmail || m.email,
                merchantPhone: m.merchantPhone || m.phone || m.phoneNumber,
                merchantBusinessType: m.merchantBusinessType || m.businessType,
                merchantProfilePicUrl: m.merchantProfilePicUrl || m.profilePicUrl || m.profileImage,
                merchantApproved: m.merchantApproved ?? m.approved,
                aadhaarNumber: m.aadhaarNumber,
                panNumber: m.panNumber,
              };
            }

            if (type === "DRIVER" && driverMap[eId]) {
              const dr = driverMap[eId];
              return {
                ...item,
                firstName: dr.firstName,
                lastName: dr.lastName,
                phoneNumber: dr.phoneNumber || dr.phone,
                email: dr.email,
                profilePicUrl: dr.profilePicUrl || dr.profileImage,
                driverId: dr.driverId || dr.id || eId,
                nomineeName: dr.nomineeName,
                nomineePhoneNumber: dr.nomineePhoneNumber,
              };
            }

            return item;
          });
        } catch (enrichErr) {
          console.warn("Entity enrichment failed (non-fatal):", enrichErr);
        }
      }

      // ── 4. Access Boundary ───────────────────────────────────────────
      let finalPendingList = (Array.isArray(dataList) ? dataList : []).filter((item) => canApproveLevel1(item, isSuper));

      setPendingList(finalPendingList);
    } catch (error) {
      console.error("Error fetching pending approvals:", error);
      setPendingList([]);
    } finally {
      setFetching(false);
    }
  };

  const handleFetchClick = () => {
    fetchPendingApprovals(approverIdInput);
  };

  // Selection handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = filteredList
        .map((item) => item.approvalRequestId || item.approval_request_id || item.id || item.approvalTransactionsId)
        .filter(Boolean);
      setSelectedIds(allIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Approve action handler
  const handleApprove = async (idsToApprove) => {
    if (!idsToApprove || idsToApprove.length === 0) return;

    if (!window.confirm(`Are you sure you want to APPROVE ${idsToApprove.length} request(s)?`)) {
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        approvalRequestIds: idsToApprove.map((id) => Number(id)),
        status: "APPROVED",
        rejectedReason: null,
        approverId: Number(activeApproverId) || Number(approverIdInput) || 1,
      };

      const res = await updateApprovalRequestsToApproved(payload);
      console.log("Approve Response:", res);

      alert(`Successfully APPROVED ${idsToApprove.length} request(s).`);

      // Remove approved items from local list matching any ID field
      setPendingList((prev) =>
        prev.filter((item) => {
          const itemId = item.approvalRequestId ?? item.approval_request_id ?? item.id ?? item.approvalTransactionsId;
          return !idsToApprove.includes(Number(itemId));
        })
      );
      setSelectedIds((prev) => prev.filter((id) => !idsToApprove.includes(id)));
    } catch (error) {
      console.error("Approve Error:", error);
      const errMsg =
        error.response?.data?.errorMessage ||
        error.response?.data?.message ||
        "Failed to approve request(s).";
      alert(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Reject action modal opener
  const openRejectModal = (idsToReject) => {
    if (!idsToReject || idsToReject.length === 0) return;
    setTargetRejectIds(idsToReject);
    setRejectionReason("");
    setShowRejectModal(true);
  };

  // Reject submission handler
  const handleConfirmReject = async () => {
    if (!rejectionReason.trim()) {
      alert("Please provide a rejection reason.");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        approvalRequestIds: targetRejectIds.map((id) => Number(id)),
        status: "REJECTED",
        rejectedReason: rejectionReason.trim(),
        approverId: Number(activeApproverId) || Number(approverIdInput) || 1,
      };

      const res = await updateApprovalRequestsToApproved(payload);
      console.log("Reject Response:", res);

      alert(`Successfully REJECTED ${targetRejectIds.length} request(s).`);

      // Remove rejected items from local pending list matching any ID field
      setPendingList((prev) =>
        prev.filter((item) => {
          const itemId = item.approvalRequestId ?? item.approval_request_id ?? item.id ?? item.approvalTransactionsId;
          return !targetRejectIds.includes(Number(itemId));
        })
      );
      setSelectedIds((prev) => prev.filter((id) => !targetRejectIds.includes(id)));
      setShowRejectModal(false);
    } catch (error) {
      console.error("Reject Error:", error);
      const errMsg =
        error.response?.data?.errorMessage ||
        error.response?.data?.message ||
        "Failed to reject request(s).";
      alert(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Helper function to extract name from DTO
  const getEntityName = (item) => {
    return (
      item.outletName ||
      item.merchantName ||
      item.entityName ||
      (item.firstName ? `${item.firstName} ${item.lastName || ""}`.trim() : null) ||
      (item.driverFirstName ? `${item.driverFirstName} ${item.driverLastName || ""}`.trim() : null) ||
      `Entity #${item.entityId}`
    );
  };

  // Helper function to extract phone/email from DTO
  const getEntityContact = (item) => {
    const phone = item.outletPhone || item.merchantPhone || item.phoneNumber || item.driverPhoneNumber || item.phone || "";
    const email = item.outletEmail || item.merchantEmail || item.email || item.driverEmail || "";
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

  // Helper to render a value (handles null/undefined gracefully)
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

  // Render a single labelled field
  const DetailField = ({ label, value }) => (
    <div className="req-detail-field">
      <span className="req-detail-label">{label}</span>
      {renderVal(value)}
    </div>
  );

  // Renders the full entity details modal
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
          <div className="req-detail-modal-header">
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
                <span className="req-detail-modal-badge">{d.status || "PENDING"}</span>
                {d.entityId && <span className="req-detail-modal-badge">ID #{d.entityId}</span>}
              </div>
            </div>
            <button className="req-detail-modal-close" onClick={() => setShowDetailModal(false)}>✕</button>
          </div>

          {/* Scrollable Body */}
          <div className="req-detail-modal-body">

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
            {(d.firstName || d.phoneNumber || d.email) && (
              <div className="req-detail-section">
                <p className="req-detail-section-title">🚗 Driver Details</p>
                <div className="req-detail-grid">
                  <DetailField label="Driver ID" value={d.driverId} />
                  <DetailField label="First Name" value={d.firstName} />
                  <DetailField label="Last Name" value={d.lastName} />
                  <DetailField label="Phone" value={d.phoneNumber} />
                  <DetailField label="Email" value={d.email} />
                  <DetailField label="Nominee Name" value={d.nomineeName} />
                  <DetailField label="Nominee Phone" value={d.nomineePhoneNumber} />
                  <DetailField label="Nominee Verified" value={d.nomineeVerified} />
                  <DetailField label="Family Member" value={d.familyMemberName} />
                  <DetailField label="Family Phone" value={d.familyMemberPhoneNumber} />
                  <DetailField label="Family Verified" value={d.familyMemberVerified} />
                  {d.profilePicUrl && (
                    <div className="req-detail-field">
                      <span className="req-detail-label">Profile Picture</span>
                      <span className="req-detail-value">
                        <a href={d.profilePicUrl} target="_blank" rel="noreferrer">View Image ↗</a>
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

  const filteredList = pendingList.filter((item) => {
    // Access Boundary: SuperAdmin sees all levels, Fleet Manager sees Level 1 only
    if (!canApproveLevel1(item, isSuper)) return false;

    const q = search.toLowerCase();
    const name = getEntityName(item).toLowerCase();
    const contact = getEntityContact(item).toLowerCase();
    const type = (item.entityType || "").toLowerCase();
    const level = String(item.currentLevel || item.current_level || item.approvalLevel || item.approval_level || "").toLowerCase();
    const reqId = String(item.approvalRequestId || "");

    return (
      name.includes(q) ||
      contact.includes(q) ||
      type.includes(q) ||
      level.includes(q) ||
      reqId.includes(q)
    );
  });

  const handleRunAutoApprovalTest = async () => {
    try {
      setTestingScheduler(true);
      const res = await triggerAutoApprovalTestProcess();
      console.log("Auto Approval Scheduler Test Response:", res);
      const message = typeof res === "string" ? res : res?.message || "Auto Approval Scheduler Executed Successfully.";
      alert(`⚡ ${message}`);
      fetchPendingApprovals(activeApproverId);
    } catch (error) {
      console.error("Auto Approval Test Error:", error);
      const errMsg =
        error.response?.data?.errorMessage ||
        error.response?.data?.message ||
        "Failed to execute Auto Approval Scheduler.";
      alert(errMsg);
    } finally {
      setTestingScheduler(false);
    }
  };

  // ── Rejected Approvals helpers ────────────────────────────────────────────

  const fetchRejectedApprovals = async () => {
    try {
      setFetchingRejected(true);
      const res = await getAllRejectedApprovals();
      console.log("Rejected Approvals Response:", res);
      let data = [];
      if (Array.isArray(res)) data = res;
      else if (res && Array.isArray(res.data)) data = res.data;
      else if (res && Array.isArray(res.content)) data = res.content;
      else if (res && typeof res === "object") data = res.data || res.rejectedApprovals || [];
      setRejectedList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching rejected approvals:", err);
      setRejectedList([]);
    } finally {
      setFetchingRejected(false);
    }
  };

  const getRejectedEntityName = (item) =>
    item.entityName ||
    item.outletName ||
    item.merchantName ||
    (item.firstName ? `${item.firstName} ${item.lastName || ""}`.trim() : null) ||
    `Entity #${item.entityId}`;

  const getRejectedEntityContact = (item) => {
    const phone = item.phone || item.outletPhone || item.merchantPhone || item.phoneNumber || "";
    const alt   = item.alternatePhone ? ` / ${item.alternatePhone}` : "";
    const email = item.email || item.outletEmail || item.merchantEmail || "";
    return `${phone}${alt}${email ? " • " + email : ""}`;
  };

  const getRejectedEntityImage = (item) =>
    item.profilePicUrl || item.outletImage || item.profileImage || item.driverProfileImage || null;

  const openReopenModal = (item) => {
    setReopenTarget(item);
    setShowReopenModal(true);
  };

  const handleReopenToPending = async () => {
    if (!reopenTarget?.approvalRequestId) return;
    try {
      setReopening(true);
      const payload = {
        approvalRequestId: Number(reopenTarget.approvalRequestId),
        updatedBy: Number(reopenUpdatedBy) || 1,
      };
      const res = await updateRejectedApprovalsToPending(payload);
      console.log("Re-open Response:", res);
      alert(`Approval Request #${reopenTarget.approvalRequestId} re-opened to PENDING successfully.`);
      // Remove from local rejected list
      setRejectedList((prev) =>
        prev.filter((i) => i.approvalRequestId !== reopenTarget.approvalRequestId)
      );
      setShowReopenModal(false);
      setReopenTarget(null);
      // Refresh pending list so the re-opened item appears
      fetchPendingApprovals(activeApproverId || approverIdInput);
    } catch (err) {
      console.error("Re-open Error:", err);
      const errMsg =
        err.response?.data?.errorMessage ||
        err.response?.data?.message ||
        "Failed to re-open request.";
      alert(errMsg);
    } finally {
      setReopening(false);
    }
  };

  // Renders a full detail popup for FmRejectedApprovalResponseDTO
  const renderRejectedDetailModal = () => {
    const d = selectedRejectedItem;
    if (!d) return null;
    const imgUrl     = getRejectedEntityImage(d);
    const entityName = getRejectedEntityName(d);
    const entityType = d.entityType || "UNKNOWN";

    const renderVal = (val) => {
      if (val === null || val === undefined || val === "")
        return <span className="req-detail-value empty">—</span>;
      if (typeof val === "boolean")
        return val
          ? <span className="req-detail-bool-yes">Yes</span>
          : <span className="req-detail-bool-no">No</span>;
      return <span className="req-detail-value">{String(val)}</span>;
    };
    const RDF = ({ label, value }) => (
      <div className="req-detail-field">
        <span className="req-detail-label">{label}</span>
        {renderVal(value)}
      </div>
    );

    return (
      <div className="req-modal-overlay" onClick={() => setShowRejectedDetailModal(false)}>
        <div className="req-detail-modal" onClick={(e) => e.stopPropagation()}>

          {/* Header — red theme */}
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
              <p>Tx #{d.approvalTransactionsId} &nbsp;•&nbsp; Req #{d.approvalRequestId} &nbsp;•&nbsp; {entityType}</p>
              <div className="req-detail-modal-badges">
                <span className="req-detail-modal-badge">{d.approvalLevel || "Level 1"}</span>
                <span className="req-detail-modal-badge" style={{ background: "rgba(239,68,68,0.4)" }}>REJECTED</span>
                {d.entityId && <span className="req-detail-modal-badge">Entity #{d.entityId}</span>}
              </div>
            </div>
            <button className="req-detail-modal-close" onClick={() => setShowRejectedDetailModal(false)}>✕</button>
          </div>

          <div className="req-detail-modal-body">

            {/* Rejection Reason */}
            {d.rejectedReason && (
              <div className="req-detail-section">
                <p className="req-detail-section-title">❌ Rejection Details</p>
                <div style={{ background: "#fff5f5", borderLeft: "4px solid #ef4444", padding: "10px 14px", borderRadius: "4px", fontSize: "13px", color: "#7f1d1d", marginBottom: "4px" }}>
                  {d.rejectedReason}
                </div>
                <div className="req-detail-grid" style={{ marginTop: "10px" }}>
                  <RDF label="Rejected By (User ID)" value={d.rejectedBy} />
                  <RDF label="Rejected At" value={d.rejectedAt ? new Date(d.rejectedAt).toLocaleString() : null} />
                </div>
              </div>
            )}

            {/* Transaction / Request Info */}
            <div className="req-detail-section">
              <p className="req-detail-section-title">📋 Approval Info</p>
              <div className="req-detail-grid">
                <RDF label="Transaction ID" value={d.approvalTransactionsId} />
                <RDF label="Request ID" value={d.approvalRequestId} />
                <RDF label="Entity Type" value={d.entityType} />
                <RDF label="Entity ID" value={d.entityId} />
                <RDF label="Approval Level" value={d.approvalLevel} />
                <RDF label="Status" value={d.status} />
              </div>
            </div>

            {/* Entity Details */}
            <div className="req-detail-section">
              <p className="req-detail-section-title">🏷️ Entity Details</p>
              <div className="req-detail-grid">
                <RDF label="Name" value={d.entityName} />
                <RDF label="Email" value={d.email} />
                <RDF label="Phone" value={d.phone} />
                <RDF label="Alternate Phone" value={d.alternatePhone} />
                <RDF label="Approved" value={d.approved} />
                {d.profilePicUrl && (
                  <div className="req-detail-field">
                    <span className="req-detail-label">Profile Picture</span>
                    <span className="req-detail-value">
                      <a href={d.profilePicUrl} target="_blank" rel="noreferrer">View Image ↗</a>
                    </span>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  };

  // ── Filtered rejected list (access boundary + search) ─────────────────────
  const filteredRejectedList = rejectedList.filter((item) => {
    // Access Boundary: Fleet Manager only sees rejections they handled
    if (!isSuper) {
      const myId = Number(activeApproverId || storedApproverId);
      if (myId && item.rejectedBy && Number(item.rejectedBy) !== myId) {
        return false;
      }
    }
    // Search filter
    const q = rejectedSearch.toLowerCase();
    return (
      (item.entityName || "").toLowerCase().includes(q) ||
      (item.email || "").toLowerCase().includes(q) ||
      (item.phone || "").toLowerCase().includes(q) ||
      (item.entityType || "").toLowerCase().includes(q) ||
      (item.rejectedReason || "").toLowerCase().includes(q) ||
      String(item.approvalRequestId || "").includes(q)
    );
  });

  return (
    <div className="req-page-wrapper">
      <div className="req-header-flex">
        <div>
          <h2 className="req-page-title">Pending Approvals</h2>
          <p className="req-subtitle">
            Review and process pending approval requests assigned to your configured approval levels.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <label style={{ fontSize: "13px", fontWeight: "600", color: "#475569" }}>
              Approver ID:
            </label>
            <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
              <input
                type="number"
                value={approverIdInput}
                onChange={(e) => setApproverIdInput(e.target.value)}
                disabled={!isSuper}
                readOnly={!isSuper}
                placeholder="e.g. 14"
                style={{
                  width: "80px",
                  padding: "6px 10px",
                  paddingRight: !isSuper ? "22px" : "10px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  fontSize: "13px",
                  backgroundColor: !isSuper ? "#f1f5f9" : "#ffffff",
                  color: !isSuper ? "#334155" : "#0f172a",
                  fontWeight: "600",
                  cursor: !isSuper ? "not-allowed" : "text",
                }}
                title={
                  !isSuper
                    ? "Approver ID is locked to your user account."
                    : "SuperAdmin mode: Enter any Approver ID to inspect pending requests."
                }
              />
              {!isSuper && (
                <span
                  style={{
                    position: "absolute",
                    right: "6px",
                    fontSize: "11px",
                    color: "#64748b",
                    pointerEvents: "none",
                  }}
                >
                  🔒
                </span>
              )}
            </div>
            <button
              className="req-refresh-btn"
              onClick={handleFetchClick}
              disabled={fetching}
              style={{ padding: "6px 12px" }}
            >
              Fetch Requests
            </button>
          </div>
          <button
            className="req-refresh-btn"
            style={{ background: "#eff6ff", borderColor: "#bfdbfe", color: "#1d4ed8" }}
            onClick={handleRunAutoApprovalTest}
            disabled={testingScheduler}
            title="Execute Auto Approval Scheduler manually for testing"
          >
            {testingScheduler ? "Executing Scheduler..." : "⚡ Run Auto-Approval Test"}
          </button>
          <button
            className="req-refresh-btn"
            onClick={() => fetchPendingApprovals(activeApproverId || approverIdInput)}
            disabled={fetching}
          >
            {fetching ? "Refreshing..." : "🔄 Refresh Pending"}
          </button>
          <button
            className="req-refresh-btn"
            style={{ background: "#fff1f2", borderColor: "#fecdd3", color: "#be123c" }}
            onClick={fetchRejectedApprovals}
            disabled={fetchingRejected}
          >
            {fetchingRejected ? "Refreshing..." : "🔄 Refresh Rejected"}
          </button>
        </div>
      </div>


      {/* Batch Action Bar */}
      {selectedIds.length > 0 && (
        <div className="req-batch-bar">
          <span className="req-batch-count">
            Selected: {selectedIds.length} request(s)
          </span>
          <div className="req-batch-actions">
            <button
              className="req-btn-approve-batch"
              onClick={() => handleApprove(selectedIds)}
              disabled={submitting}
            >
              ✓ Approve Selected ({selectedIds.length})
            </button>
            <button
              className="req-btn-reject-batch"
              onClick={() => openRejectModal(selectedIds)}
              disabled={submitting}
            >
              ✕ Reject Selected ({selectedIds.length})
            </button>
          </div>
        </div>
      )}

      {/* Main Table Card */}
      <div className="req-card">
        <div className="req-card-header">PENDING REQUESTS</div>

        <div className="req-table-toolbar">
          <div className="req-search-box">
            <input
              type="text"
              placeholder="Search by name, contact, entity type, level, ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <span className="req-batch-count" style={{ fontSize: "13px", color: "#475569" }}>
            Total Pending: {filteredList.length}
          </span>
        </div>

        <div className="req-table-wrapper">
          <table className="req-table">
            <thead>
              <tr>
                <th style={{ width: "40px" }}>
                  <input
                    type="checkbox"
                    checked={
                      filteredList.length > 0 &&
                      selectedIds.length === filteredList.length
                    }
                    onChange={handleSelectAll}
                  />
                </th>
                <th>Request ID</th>
                <th>Entity Details</th>
                <th>Entity Type</th>
                <th>Entity ID</th>
                <th>Current Level</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {fetching ? (
                <tr>
                  <td colSpan="8" className="req-empty-row">
                    Loading Pending Approval Requests...
                  </td>
                </tr>
              ) : filteredList.length > 0 ? (
                filteredList.map((item) => {
                  const reqId = item.approvalRequestId;
                  const isSelected = selectedIds.includes(reqId);
                  const imgUrl = getEntityImage(item);
                  const entityName = getEntityName(item);

                  return (
                    <tr key={reqId || Math.random()}>
                      <td>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectOne(reqId)}
                        />
                      </td>
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
                      <td>
                        <strong>{item.currentLevel || item.current_level || item.approvalLevel || item.approval_level || "Level 1"}</strong>
                      </td>
                      <td>
                        <span className="req-status-pending">PENDING</span>
                      </td>
                      <td>
                        <div className="req-actions-cell">
                          <button
                            className="req-btn-approve"
                            onClick={() => handleApprove([reqId])}
                            disabled={submitting}
                          >
                            ✓ Approve
                          </button>
                          <button
                            className="req-btn-reject"
                            onClick={() => openRejectModal([reqId])}
                            disabled={submitting}
                          >
                            ✕ Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="req-empty-row">
                    {activeApproverId
                      ? `No Pending Approval Requests found for Approver #${activeApproverId}.`
                      : "No Pending Approval Requests found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Entity Detail Modal (Pending) */}
      {showDetailModal && selectedDetailItem && renderEntityDetailModal()}

      {/* ================================================================
          REJECTED APPROVALS SECTION
          ================================================================ */}
      <div className="req-card" style={{ marginTop: "12px" }}>
        <div className="req-card-header red">REJECTED APPROVALS</div>

        <div className="req-table-toolbar">
          <div className="req-search-box">
            <input
              type="text"
              placeholder="Search by name, contact, entity type, reason, ID..."
              value={rejectedSearch}
              onChange={(e) => setRejectedSearch(e.target.value)}
            />
          </div>
          <span className="req-batch-count" style={{ fontSize: "13px", color: "#475569" }}>
            Total Rejected: {filteredRejectedList.length}
          </span>
        </div>

        <div className="req-table-wrapper">
          <table className="req-table">
            <thead>
              <tr>
                <th>Tx ID</th>
                <th>Request ID</th>
                <th>Entity Details</th>
                <th>Entity Type</th>
                <th>Entity ID</th>
                <th>Level</th>
                <th>Rejection Reason</th>
                <th>Rejected At</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {fetchingRejected ? (
                <tr>
                  <td colSpan="10" className="req-empty-row">
                    Loading Rejected Approvals...
                  </td>
                </tr>
              ) : filteredRejectedList.length > 0 ? (
                filteredRejectedList.map((item) => {
                      const imgUrl = getRejectedEntityImage(item);
                      const entityName = getRejectedEntityName(item);
                      return (
                        <tr key={item.approvalTransactionsId || item.approvalRequestId || Math.random()}>
                          <td><strong>#{item.approvalTransactionsId || "—"}</strong></td>
                          <td><code>#{item.approvalRequestId || "—"}</code></td>
                          <td>
                            <div
                              className="req-entity-cell req-entity-cell-clickable"
                              onClick={() => {
                                setSelectedRejectedItem(item);
                                setShowRejectedDetailModal(true);
                              }}
                              title="Click to view full entity details"
                            >
                              {imgUrl ? (
                                <img src={imgUrl} alt={entityName} className="req-avatar-img"
                                  onError={(e) => { e.target.style.display = "none"; }} />
                              ) : (
                                <div className="req-avatar-fallback">
                                  {entityName.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div className="req-entity-info">
                                <span className="req-entity-name">{entityName}</span>
                                <span className="req-entity-meta">{getRejectedEntityContact(item)}</span>
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
                          <td><code>ID #{item.entityId}</code></td>
                          <td><strong>{item.approvalLevel || "—"}</strong></td>
                          <td style={{ maxWidth: "220px" }}>
                            <div className="req-reason-box">
                              {item.rejectedReason || "No reason provided"}
                            </div>
                          </td>
                          <td style={{ whiteSpace: "nowrap", fontSize: "12px", color: "#64748b" }}>
                            {item.rejectedAt
                              ? new Date(item.rejectedAt).toLocaleString()
                              : "—"}
                          </td>
                          <td>
                            <span className="req-status-rejected">REJECTED</span>
                          </td>
                          <td>
                            <button
                              className="req-btn-reopen"
                              onClick={() => openReopenModal(item)}
                              title="Re-open this rejected request back to PENDING"
                            >
                              ↩ Re-open to Pending
                            </button>
                          </td>
                        </tr>
                      );
                    })
              ) : (
                <tr>
                  <td colSpan="10" className="req-empty-row">
                    {!isSuper && (activeApproverId || storedApproverId)
                      ? `No Rejected Approval Requests found for Approver #${activeApproverId || storedApproverId}.`
                      : "No Rejected Approval Requests found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rejected Entity Detail Modal */}
      {showRejectedDetailModal && selectedRejectedItem && renderRejectedDetailModal()}

      {/* Re-open to Pending Modal */}
      {showReopenModal && reopenTarget && (
        <div className="req-modal-overlay">
          <div className="req-modal">
            <div className="req-modal-header" style={{ background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)" }}>
              <h3>Re-open Request #{reopenTarget.approvalRequestId} to PENDING</h3>
              <button
                className="req-modal-close"
                onClick={() => { setShowReopenModal(false); setReopenTarget(null); }}
              >
                ✕
              </button>
            </div>

            <div className="req-modal-body">
              <div style={{ background: "#f0f9ff", borderLeft: "4px solid #0284c7", padding: "12px", borderRadius: "4px", fontSize: "13px", color: "#0369a1", marginBottom: "16px" }}>
                <strong>Business Rule:</strong> Updating this request will change its status from{" "}
                <strong>REJECTED</strong> back to <strong>PENDING</strong>. Entity ID, Entity Type, and Current Level will remain unchanged.
              </div>
              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "6px", padding: "12px", marginBottom: "16px", fontSize: "13px" }}>
                <strong>Entity:</strong> {reopenTarget.entityName || `#${reopenTarget.entityId}`}&emsp;
                <strong>Type:</strong> {reopenTarget.entityType}&emsp;
                <strong>Level:</strong> {reopenTarget.approvalLevel}
              </div>
              <div className="req-form-group">
                <label className="req-form-label">Updated By (User ID)</label>
                <input
                  type="number"
                  className="req-form-input"
                  value={reopenUpdatedBy}
                  onChange={(e) => setReopenUpdatedBy(e.target.value)}
                  placeholder="Enter User / Admin ID"
                />
              </div>
            </div>

            <div className="req-modal-footer">
              <button
                className="req-modal-cancel-btn"
                onClick={() => { setShowReopenModal(false); setReopenTarget(null); }}
                disabled={reopening}
              >
                Cancel
              </button>
              <button
                className="req-modal-submit-btn"
                style={{ background: "#0284c7" }}
                onClick={handleReopenToPending}
                disabled={reopening}
              >
                {reopening ? "Re-opening..." : "↩ Re-open to Pending"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal (for pending items) */}
      {showRejectModal && (
        <div className="req-modal-overlay">
          <div className="req-modal">
            <div className="req-modal-header">
              <h3>Reject Approval Request ({targetRejectIds.length} item(s))</h3>
              <button
                className="req-modal-close"
                onClick={() => setShowRejectModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="req-modal-body">
              <p style={{ fontSize: "14px", color: "#334155", marginTop: 0 }}>
                Please specify the reason for rejecting request ID(s):{" "}
                <strong>{targetRejectIds.map((id) => `#${id}`).join(", ")}</strong>
              </p>

              <div className="req-form-group">
                <label className="req-form-label">
                  Rejection Reason <span className="req-required">*</span>
                </label>
                <textarea
                  className="req-form-input"
                  style={{ height: "90px", padding: "10px" }}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Provide detailed explanation for rejection..."
                />
              </div>
            </div>

            <div className="req-modal-footer">
              <button
                className="req-modal-cancel-btn"
                onClick={() => setShowRejectModal(false)}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                className="req-modal-submit-btn"
                onClick={handleConfirmReject}
                disabled={submitting}
              >
                {submitting ? "Rejecting..." : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PendingApprovals;
