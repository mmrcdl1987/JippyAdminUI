import { useEffect, useState } from "react";
import "../styles/ApprovalRequests.css";
import { getAllApprovalTransactions } from "../services/approvalService";
import { isSuperAdmin, isFleetManager } from "../utils/permissionUtils";

function ApprovalTransactions() {
  const storedApproverId = localStorage.getItem("approverId") || localStorage.getItem("userId");
  const userRole = (localStorage.getItem("role") || "").trim().toUpperCase();
  const isSuper = isSuperAdmin();
  const isFM = isFleetManager() || userRole === "ROLE_FLEET_MANAGER" || userRole === "FLEET_MANAGER";

  const [approverIdInput, setApproverIdInput] = useState(storedApproverId || "");
  const [activeApproverId, setActiveApproverId] = useState(storedApproverId ? Number(storedApproverId) : null);
  const [transactionList, setTransactionList] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [entityFilter, setEntityFilter] = useState("ALL");

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setFetching(true);
      const res = await getAllApprovalTransactions();
      console.log("All Approval Transactions Response:", res);

      let dataList = [];
      if (Array.isArray(res)) {
        dataList = res;
      } else if (res && Array.isArray(res.data)) {
        dataList = res.data;
      } else if (res && Array.isArray(res.content)) {
        dataList = res.content;
      } else if (res && typeof res === "object") {
        dataList = res.data || res.approvalTransactions || [];
      }

      setTransactionList(Array.isArray(dataList) ? dataList : []);
    } catch (error) {
      console.error("Error fetching approval transactions:", error);
      setTransactionList([]);
    } finally {
      setFetching(false);
    }
  };

  const handleFetchClick = () => {
    if (approverIdInput && !isNaN(Number(approverIdInput))) {
      setActiveApproverId(Number(approverIdInput));
    } else {
      setActiveApproverId(null);
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch (e) {
      return dateStr;
    }
  };

  const isHandledByApprover = (item, approverId) => {
    if (!approverId) return true;
    const targetId = Number(approverId);

    const handledByList = [
      item.approvedBy,
      item.approved_by,
      item.updatedBy,
      item.updated_by,
      item.approverId,
      item.approver_id,
      item.createdBy,
      item.created_by,
    ]
      .filter((v) => v !== null && v !== undefined && v !== "")
      .map(Number);

    return handledByList.includes(targetId);
  };

  const filteredTransactions = transactionList.filter((item) => {
    // Access Boundary: Fleet Manager (or when activeApproverId is set) sees only transactions handled by him
    if (!isSuper || activeApproverId) {
      if (!isHandledByApprover(item, activeApproverId || Number(storedApproverId))) {
        return false;
      }
    }

    const q = search.toLowerCase();
    const type = (item.entityType || "").toLowerCase();
    const level = (item.approvalLevel || item.currentLevel || "").toLowerCase();
    const status = (item.status || "").toLowerCase();
    const reason = (item.rejectedReason || "").toLowerCase();
    const id = String(item.approvalTransactionsId || item.approvalRequestId || "");

    const matchesSearch =
      type.includes(q) ||
      level.includes(q) ||
      status.includes(q) ||
      reason.includes(q) ||
      id.includes(q) ||
      String(item.entityId || "").includes(q);

    const matchesStatus =
      statusFilter === "ALL" ||
      item.status?.toUpperCase() === statusFilter.toUpperCase();

    const matchesEntity =
      entityFilter === "ALL" ||
      item.entityType?.toUpperCase() === entityFilter.toUpperCase();

    return matchesSearch && matchesStatus && matchesEntity;
  });

  return (
    <div className="req-page-wrapper">
      <div className="req-header-flex">
        <div>
          <h2 className="req-page-title">Approval Transactions History</h2>
          <p className="req-subtitle">
            View complete audit history of all approval actions, approvals, and rejections.
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
                placeholder="All"
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
                    ? "Approver ID is locked to your Fleet Manager user account."
                    : "SuperAdmin mode: Enter Approver ID to filter transactions or leave blank for all."
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
            {isSuper && (
              <button
                className="req-refresh-btn"
                onClick={handleFetchClick}
                disabled={fetching}
                style={{ padding: "6px 12px" }}
              >
                Filter
              </button>
            )}
          </div>

          <button
            className="req-refresh-btn"
            onClick={fetchTransactions}
            disabled={fetching}
          >
            {fetching ? "Refreshing..." : "🔄 Refresh Transactions"}
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="req-card">
        <div className="req-card-header">APPROVAL TRANSACTIONS LOG</div>

        <div className="req-table-toolbar">
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <div className="req-search-box">
              <input
                type="text"
                placeholder="Search by ID, Entity, Level, Reason..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              className="req-form-select"
              style={{ width: "160px" }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="APPROVED">APPROVED</option>
              <option value="REJECTED">REJECTED</option>
              <option value="PENDING">PENDING</option>
            </select>

            <select
              className="req-form-select"
              style={{ width: "160px" }}
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
            >
              <option value="ALL">All Entities</option>
              <option value="OUTLET">OUTLET</option>
              <option value="MERCHANT">MERCHANT</option>
              <option value="DRIVER">DRIVER</option>
            </select>
          </div>

          <span className="req-batch-count" style={{ fontSize: "13px", color: "#475569" }}>
            Total Found: {filteredTransactions.length}
          </span>
        </div>

        <div className="req-table-wrapper">
          <table className="req-table">
            <thead>
              <tr>
                <th>Tx ID</th>
                <th>Entity Type</th>
                <th>Entity ID</th>
                <th>Approval Level</th>
                <th>Status</th>
                <th>Handled By</th>
                <th>Date & Time</th>
                <th>Rejection Reason</th>
              </tr>
            </thead>
            <tbody>
              {fetching ? (
                <tr>
                  <td colSpan="8" className="req-empty-row">
                    Loading Approval Transactions...
                  </td>
                </tr>
              ) : filteredTransactions.length > 0 ? (
                filteredTransactions.map((item) => {
                  const txId = item.approvalTransactionsId || item.approvalRequestId;
                  const status = (item.status || "PENDING").toUpperCase();
                  const handledByUser = item.approvedBy || item.updatedBy || item.approverId || item.createdBy || "-";

                  return (
                    <tr key={txId || Math.random()}>
                      <td>
                        <strong>#{txId}</strong>
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
                        <strong>{item.approvalLevel || item.currentLevel || "Level 1"}</strong>
                      </td>
                      <td>
                        <span
                          className={
                            status === "APPROVED"
                              ? "req-status-approved"
                              : status === "REJECTED"
                              ? "req-status-rejected"
                              : "req-status-pending"
                          }
                        >
                          {status}
                        </span>
                      </td>
                      <td>
                        User #{handledByUser}
                      </td>
                      <td>{formatDateTime(item.approvedAt || item.updatedAt || item.createdAt)}</td>
                      <td style={{ maxWidth: "240px" }}>
                        {status === "REJECTED" ? (
                          <div className="req-reason-box">
                            {item.rejectedReason || "No reason specified"}
                          </div>
                        ) : (
                          <span style={{ color: "#94a3b8" }}>-</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="req-empty-row">
                    {!isSuper && (activeApproverId || storedApproverId)
                      ? `No Approval Transactions found performed by Fleet Manager #${activeApproverId || storedApproverId}.`
                      : "No Approval Transactions found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ApprovalTransactions;
