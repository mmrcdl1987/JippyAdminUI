import { useState, useEffect } from "react";
import {
  FiSearch,
  FiEdit2,
  FiX,
  FiPlus,
  FiRefreshCw,
  FiCreditCard,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";
import Swal from "sweetalert2";
import "../styles/PaymentModes.css";

import {
  getAllPaymentModes,
  createPaymentMode,
  updatePaymentMode,
  deletePaymentMode,
} from "../services/orderSettingsService";

export default function PaymentModes() {
  const [paymentModes, setPaymentModes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Form & Selection States
  const [paymentModeInput, setPaymentModeInput] = useState("");
  const [isEditActive, setIsEditActive] = useState(true);
  const [selectedMode, setSelectedMode] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch All Payment Modes (Active & Inactive)
  const fetchModes = async () => {
    try {
      setLoading(true);
      const response = await getAllPaymentModes();
      // Handle response.data being array directly or wrapped in data property
      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];
      setPaymentModes(data);
    } catch (error) {
      console.error("Error fetching payment modes:", error);
      Swal.fire({
        icon: "error",
        title: "Failed to Fetch Data",
        text:
          error.response?.data?.errorMessage ||
          "Unable to load payment modes from server.",
        confirmButtonColor: "#ff6b35",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModes();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  // Filtering Logic
  const filteredModes = paymentModes.filter((item) => {
    const matchesSearch =
      item.paymentMode?.toLowerCase().includes(search.toLowerCase()) ||
      item.paymentModeId?.toString().includes(search);

    const isModeActive =
      item.isActive === "Y" ||
      item.isActive === "1" ||
      item.isActive === "true" ||
      item.isActive === true;

    if (statusFilter === "ACTIVE") {
      return matchesSearch && isModeActive;
    }
    if (statusFilter === "INACTIVE") {
      return matchesSearch && !isModeActive;
    }
    return matchesSearch;
  });

  // Pagination Calculations
  const totalPages = Math.ceil(filteredModes.length / entriesPerPage) || 1;
  const startIndex = (currentPage - 1) * entriesPerPage;
  const currentTableData = filteredModes.slice(
    startIndex,
    startIndex + entriesPerPage
  );

  // Stat Counters
  const totalCount = paymentModes.length;
  const activeCount = paymentModes.filter(
    (m) =>
      m.isActive === "Y" ||
      m.isActive === "1" ||
      m.isActive === "true" ||
      m.isActive === true
  ).length;
  const inactiveCount = totalCount - activeCount;

  // Open Create Modal
  const handleOpenCreate = () => {
    setPaymentModeInput("");
    setShowCreateModal(true);
  };

  // Submit Create
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!paymentModeInput.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Payment mode name is required.",
        confirmButtonColor: "#ff6b35",
      });
      return;
    }

    if (paymentModeInput.trim().length > 50) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Payment mode cannot exceed 50 characters.",
        confirmButtonColor: "#ff6b35",
      });
      return;
    }

    try {
      setSubmitting(true);
      await createPaymentMode({
        paymentMode: paymentModeInput.trim(),
        isActive: "Y",
      });
      Swal.fire({
        icon: "success",
        title: "Created Successfully",
        text: `Payment mode "${paymentModeInput.trim()}" has been created.`,
        timer: 2000,
        showConfirmButton: false,
      });
      setShowCreateModal(false);
      setPaymentModeInput("");
      fetchModes();
    } catch (error) {
      console.error("Error creating payment mode:", error);
      Swal.fire({
        icon: "error",
        title: "Creation Failed",
        text:
          error.response?.data?.errorMessage ||
          error.response?.data?.message ||
          "Failed to create payment mode.",
        confirmButtonColor: "#ff6b35",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (mode) => {
    setSelectedMode(mode);
    setPaymentModeInput(mode.paymentMode || "");
    const activeBool =
      mode.isActive === "Y" ||
      mode.isActive === "1" ||
      mode.isActive === "true" ||
      mode.isActive === true;
    setIsEditActive(activeBool);
    setShowEditModal(true);
  };

  // Submit Edit (Update Name and Active/Inactive status in CoPaymentRequest)
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!paymentModeInput.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Payment mode name is required.",
        confirmButtonColor: "#ff6b35",
      });
      return;
    }

    if (paymentModeInput.trim().length > 50) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Payment mode cannot exceed 50 characters.",
        confirmButtonColor: "#ff6b35",
      });
      return;
    }

    try {
      setSubmitting(true);
      // Update payment mode with name and isActive ("Y" / "N")
      await updatePaymentMode(selectedMode.paymentModeId, {
        paymentMode: paymentModeInput.trim(),
        isActive: isEditActive ? "Y" : "N",
      });

      Swal.fire({
        icon: "success",
        title: "Updated Successfully",
        text: "Payment mode updated successfully.",
        timer: 2000,
        showConfirmButton: false,
      });
      setShowEditModal(false);
      setSelectedMode(null);
      setPaymentModeInput("");
      fetchModes();
    } catch (error) {
      console.error("Error updating payment mode:", error);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text:
          error.response?.data?.errorMessage ||
          error.response?.data?.message ||
          "Failed to update payment mode.",
        confirmButtonColor: "#ff6b35",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Helper for Formatting Date
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="pm-page">
      {/* Top Header */}
      <div className="pm-top-header">
        <div>
          <h2 className="pm-title">Payment Modes</h2>
          <p className="pm-subtitle">
            Configure and manage available payment methods for order checkout
          </p>
        </div>
        <button className="pm-create-btn" onClick={handleOpenCreate}>
          <FiPlus size={18} /> Add Payment Mode
        </button>
      </div>

      {/* Summary Cards */}
      <div className="pm-stats-grid">
        <div className="pm-stat-card">
          <div className="pm-stat-info">
            <p>Total Modes</p>
            <h3>{totalCount}</h3>
          </div>
          <div className="pm-stat-icon total">
            <FiCreditCard />
          </div>
        </div>

        <div className="pm-stat-card">
          <div className="pm-stat-info">
            <p>Active Modes</p>
            <h3>{activeCount}</h3>
          </div>
          <div className="pm-stat-icon active">
            <FiCheckCircle />
          </div>
        </div>

        <div className="pm-stat-card">
          <div className="pm-stat-info">
            <p>Inactive Modes</p>
            <h3>{inactiveCount}</h3>
          </div>
          <div className="pm-stat-icon inactive">
            <FiXCircle />
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="pm-card">
        {/* Toolbar */}
        <div className="pm-toolbar">
          <div className="pm-search">
            <input
              type="text"
              placeholder="Search by Payment Mode name or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <FiSearch className="pm-search-icon" />
          </div>

          <div className="pm-filter-right">
            <select
              className="pm-filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Only</option>
              <option value="INACTIVE">Inactive Only</option>
            </select>

            <button
              className="pm-refresh-btn"
              onClick={fetchModes}
              title="Refresh List"
            >
              <FiRefreshCw className={loading ? "spin" : ""} /> Refresh
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="pm-table-wrapper">
          <table className="pm-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Payment Mode</th>
                <th>Status</th>
                <th>Updated By</th>
                <th>Updated At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="pm-empty">
                    Loading payment modes...
                  </td>
                </tr>
              ) : currentTableData.length > 0 ? (
                currentTableData.map((mode, index) => {
                  const isActive =
                    mode.isActive === "Y" ||
                    mode.isActive === "1" ||
                    mode.isActive === "true" ||
                    mode.isActive === true;

                  return (
                    <tr key={mode.paymentModeId || index}>
                      <td className="pm-id">#{mode.paymentModeId}</td>
                      <td className="pm-name">{mode.paymentMode}</td>
                      <td>
                        <span
                          className={`pm-badge ${
                            isActive ? "active" : "inactive"
                          }`}
                        >
                          {isActive ? (
                            <>
                              <FiCheckCircle size={12} /> Active
                            </>
                          ) : (
                            <>
                              <FiXCircle size={12} /> Inactive
                            </>
                          )}
                        </span>
                      </td>
                      <td>{mode.updatedBy ?? mode.createdBy ?? "System"}</td>
                      <td>{formatDate(mode.updatedAt || mode.createdAt)}</td>
                      <td>
                        <div className="pm-actions">
                          <button
                            type="button"
                            className="pm-action-btn edit"
                            title="Edit Payment Mode"
                            onClick={() => handleOpenEdit(mode)}
                          >
                            <FiEdit2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="pm-empty">
                    No payment modes found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer & Pagination */}
        <div className="pm-footer">
          <span>
            Showing {filteredModes.length > 0 ? startIndex + 1 : 0} to{" "}
            {Math.min(startIndex + entriesPerPage, filteredModes.length)} of{" "}
            {filteredModes.length} entries
          </span>

          <div className="pagination-controls">
            <button
              className="page-btn"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              &lt;
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (pageNumber) => (
                <button
                  key={pageNumber}
                  className={`page-btn ${
                    currentPage === pageNumber ? "active" : ""
                  }`}
                  onClick={() => setCurrentPage(pageNumber)}
                >
                  {pageNumber}
                </button>
              )
            )}

            <button
              className="page-btn"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              &gt;
            </button>
          </div>
        </div>
      </div>

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="pm-modal-overlay">
          <div className="pm-modal-box">
            <div className="pm-modal-header">
              <h3>Add Payment Mode</h3>
              <button
                className="pm-close-btn"
                onClick={() => setShowCreateModal(false)}
              >
                <FiX />
              </button>
            </div>
            <form onSubmit={handleCreateSubmit}>
              <div className="pm-form-group">
                <label className="pm-form-label">
                  Payment Mode Name <span>*</span>
                </label>
                <input
                  type="text"
                  className="pm-form-input"
                  placeholder="e.g. Credit Card, UPI, NetBanking, COD"
                  value={paymentModeInput}
                  onChange={(e) => setPaymentModeInput(e.target.value)}
                  maxLength={50}
                  autoFocus
                />
                <span className="pm-form-hint">
                  Max 50 characters. Required.
                </span>
              </div>
              <div className="pm-modal-footer">
                <button
                  type="button"
                  className="pm-cancel-btn"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="pm-submit-btn"
                  disabled={submitting}
                >
                  {submitting ? "Saving..." : "Save Payment Mode"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && selectedMode && (
        <div className="pm-modal-overlay">
          <div className="pm-modal-box">
            <div className="pm-modal-header">
              <h3>Edit Payment Mode</h3>
              <button
                className="pm-close-btn"
                onClick={() => setShowEditModal(false)}
              >
                <FiX />
              </button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="pm-form-group">
                <label className="pm-form-label">Payment Mode ID</label>
                <input
                  type="text"
                  className="pm-form-input"
                  value={`#${selectedMode.paymentModeId}`}
                  disabled
                  style={{ background: "#f1f5f9", cursor: "not-allowed" }}
                />
              </div>

              <div className="pm-form-group">
                <label className="pm-form-label">
                  Payment Mode Name <span>*</span>
                </label>
                <input
                  type="text"
                  className="pm-form-input"
                  placeholder="Enter updated payment mode name"
                  value={paymentModeInput}
                  onChange={(e) => setPaymentModeInput(e.target.value)}
                  maxLength={50}
                  autoFocus
                />
                <span className="pm-form-hint">
                  Max 50 characters. Required.
                </span>
              </div>

              {/* Status Toggle Section in Edit Modal */}
              <div className="pm-form-group">
                <label className="pm-form-label">Payment Mode Status</label>
                <div className="pm-toggle-box">
                  <div className="pm-toggle-info">
                    <span
                      className={`pm-badge ${
                        isEditActive ? "active" : "inactive"
                      }`}
                    >
                      {isEditActive ? (
                        <>
                          <FiCheckCircle size={12} /> Active
                        </>
                      ) : (
                        <>
                          <FiXCircle size={12} /> Inactive
                        </>
                      )}
                    </span>
                    <span style={{ fontSize: "13px", color: "#64748b" }}>
                      {isEditActive
                        ? "Active for checkout"
                        : "Deactivated / Inactive"}
                    </span>
                  </div>

                  <label className="pm-toggle-switch">
                    <input
                      type="checkbox"
                      checked={isEditActive}
                      onChange={(e) => setIsEditActive(e.target.checked)}
                    />
                    <span className="pm-toggle-slider"></span>
                  </label>
                </div>
              </div>

              <div className="pm-modal-footer">
                <button
                  type="button"
                  className="pm-cancel-btn"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="pm-submit-btn"
                  disabled={submitting}
                >
                  {submitting ? "Updating..." : "Update Payment Mode"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}