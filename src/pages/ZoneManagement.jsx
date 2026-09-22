import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { useJsApiLoader } from "@react-google-maps/api";
import {
  FiMapPin,
  FiSearch,
  FiEdit2,
  FiEye,
  FiRefreshCw,
  FiPlus,
  FiX,
  FiCheckCircle,
  FiAlertCircle,
  FiCheck,
  FiLayers,
} from "react-icons/fi";
import API from "../services/api";
import ZoneStatusDialog from "../components/zones/ZoneStatusDialog";
import ZoneDetailsModal from "../components/zones/ZoneDetailsModal";
import "../styles/ZoneManagement.css";

const mapLibraries = ["places", "geometry"];

// Helper to normalize zone active status
export const isZoneActive = (status) => {
  if (typeof status === "string") {
    const s = status.toUpperCase().trim();
    return s === "ACTIVE" || s === "Y" || s === "TRUE" || s === "1";
  }
  return Boolean(status);
};

function ZoneManagement({ setActivePage }) {
  const navigate = useNavigate();

  // Load Google Maps API for read-only zone preview in details modal
  const { isLoaded: isMapLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: mapLibraries,
  });

  // =========================================================
  // STATE
  // =========================================================
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingZoneId, setUpdatingZoneId] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState(null);

  // Status confirmation dialog state
  const [statusDialog, setStatusDialog] = useState({
    isOpen: false,
    zone: null,
    targetStatus: "INACTIVE",
  });

  // Zone details modal state
  const [detailsZone, setDetailsZone] = useState(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // =========================================================
  // LOAD ALL ZONES
  // GET /api/driver/zones
  // =========================================================
  const loadZones = useCallback(async () => {
    try {
      setLoading(true);
      const response = await API.get("/api/driver/zones");

      console.log("=================================");
      console.log("GET ALL ZONES RESPONSE (/api/driver/zones)");
      console.log("FULL RESPONSE:", response);
      console.log("RESPONSE DATA:", response.data);
      console.log("=================================");

      let zoneList = [];
      if (Array.isArray(response.data)) {
        zoneList = response.data;
      } else if (Array.isArray(response.data?.data)) {
        zoneList = response.data.data;
      } else if (Array.isArray(response.data?.zones)) {
        zoneList = response.data.zones;
      } else if (Array.isArray(response.data?.content)) {
        zoneList = response.data.content;
      } else if (Array.isArray(response.data?.result)) {
        zoneList = response.data.result;
      } else if (Array.isArray(response.data?.data?.content)) {
        zoneList = response.data.data.content;
      } else if (Array.isArray(response.data?.data?.zones)) {
        zoneList = response.data.data.zones;
      } else if (Array.isArray(response.data?.payload)) {
        zoneList = response.data.payload;
      }

      setZones(zoneList);
    } catch (error) {
      console.error("Error loading zones:", error);
      console.error("Error response:", error?.response?.data);
      setZones([]);
      setToast({
        type: "error",
        message: error?.response?.data?.message || "Failed to load zones from server.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadZones();
  }, [loadZones]);

  // Reset pagination when search, filter, or entries change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, entriesPerPage]);

  // =========================================================
  // STATS METRICS
  // =========================================================
  const stats = useMemo(() => {
    const total = zones.length;
    const active = zones.filter((z) => isZoneActive(z.status)).length;
    const inactive = total - active;

    return { total, active, inactive };
  }, [zones]);

  // =========================================================
  // FILTERED & SEARCHED ZONES
  // =========================================================
  const filteredZones = useMemo(() => {
    const term = search.trim().toLowerCase();

    return zones.filter((zone) => {
      const name = String(zone.zoneName || "").toLowerCase();
      const id = String(zone.zoneId || "").toLowerCase();
      const matchesSearch = !term || name.includes(term) || id.includes(term);

      const isActive = isZoneActive(zone.status);

      if (statusFilter === "ACTIVE") {
        return matchesSearch && isActive;
      }
      if (statusFilter === "INACTIVE") {
        return matchesSearch && !isActive;
      }

      return matchesSearch;
    });
  }, [zones, search, statusFilter]);

  // =========================================================
  // PAGINATION CALCULATIONS
  // =========================================================
  const totalPages = useMemo(() => {
    return Math.ceil(filteredZones.length / entriesPerPage) || 1;
  }, [filteredZones.length, entriesPerPage]);

  const startIndex = (currentPage - 1) * entriesPerPage;
  const currentTableData = useMemo(() => {
    return filteredZones.slice(startIndex, startIndex + entriesPerPage);
  }, [filteredZones, startIndex, entriesPerPage]);

  // =========================================================
  // STATUS CONFIRMATION DIALOG INITIATION
  // =========================================================
  const initiateStatusToggle = (zone) => {
    if (updatingZoneId === zone.zoneId) {
      return;
    }

    const currentActive = isZoneActive(zone.status);
    const targetStatus = currentActive ? "INACTIVE" : "ACTIVE";

    setStatusDialog({
      isOpen: true,
      zone,
      targetStatus,
    });
  };

  // =========================================================
  // CONFIRM & UPDATE ZONE ACTIVE / INACTIVE STATUS
  // PATCH /api/driver/zones/{zoneId}/status?status=ACTIVE|INACTIVE
  // =========================================================
  const confirmStatusToggle = async () => {
    if (!statusDialog.zone) return;

    const { zone, targetStatus } = statusDialog;
    const willBeActive = targetStatus === "ACTIVE";

    try {
      setUpdatingZoneId(zone.zoneId);

      console.log("=================================");
      console.log("CONFIRMED ZONE STATUS UPDATE (PATCH /api/driver/zones/{zoneId}/status)");
      console.log("Zone ID:", zone.zoneId);
      console.log("Zone Name:", zone.zoneName);
      console.log("New Status:", targetStatus);
      console.log("=================================");

      const response = await API.patch(
        `/api/driver/zones/${zone.zoneId}/status`,
        {
          status: targetStatus,
          active: willBeActive,
        },
        {
          params: {
            status: targetStatus,
          },
        }
      );

      console.log("UPDATE STATUS RESPONSE:", response.data);

      setZones((prevZones) =>
        prevZones.map((z) =>
          z.zoneId === zone.zoneId
            ? {
                ...z,
                status: targetStatus,
                active: willBeActive,
              }
            : z
        )
      );

      // Sync details modal if currently open for this zone
      setDetailsZone((prev) =>
        prev && prev.zoneId === zone.zoneId
          ? { ...prev, status: targetStatus, active: willBeActive }
          : prev
      );

      setToast({
        type: "success",
        message: `Zone "${zone.zoneName}" is now ${
          willBeActive ? "Active" : "Inactive"
        }.`,
      });
    } catch (error) {
      console.error("Error updating zone status:", error);
      console.error("API ERROR RESPONSE:", error?.response?.data);

      setToast({
        type: "error",
        message:
          error?.response?.data?.message ||
          "Failed to update zone status. Please try again.",
      });
    } finally {
      setUpdatingZoneId(null);
      setStatusDialog({
        isOpen: false,
        zone: null,
        targetStatus: "INACTIVE",
      });
    }
  };

  // =========================================================
  // VIEW ZONE DETAILS MODAL
  // =========================================================
  const handleViewZone = (zone) => {
    setDetailsZone(zone);
  };

  // =========================================================
  // NAVIGATION HANDLERS
  // =========================================================
  const handleCreateZone = () => {
    localStorage.removeItem("editZoneId");

    if (typeof setActivePage === "function") {
      setActivePage("createZone");
    } else {
      navigate("/dashboard/createZone");
    }
  };

  const handleEditZone = (zone) => {
    localStorage.setItem("editZoneId", String(zone.zoneId));

    if (typeof setActivePage === "function") {
      setActivePage("createZone");
    } else {
      navigate("/dashboard/createZone");
    }
  };

  return (
    <div className="zone-page">
      {/* =====================================================
          FLOATING TOAST NOTIFICATION
      ====================================================== */}
      {toast && (
        <div
          className={`zone-toast ${
            toast.type === "success" ? "zone-toast-success" : "zone-toast-error"
          }`}
        >
          {toast.type === "success" ? (
            <FiCheck size={18} />
          ) : (
            <FiAlertCircle size={18} />
          )}
          <span>{toast.message}</span>
          <button
            type="button"
            className="zone-toast-close"
            onClick={() => setToast(null)}
            title="Dismiss notification"
          >
            <FiX />
          </button>
        </div>
      )}

      {/* =====================================================
          PAGE HEADER
      ====================================================== */}
      <div className="zone-header">
        <div className="zone-header-left">
          <div className="zone-header-icon-box">
            <FiMapPin />
          </div>

          <div className="zone-title">
            <span className="zone-eyebrow">Outlets & Logistics</span>
            <h2>Zone Management</h2>
            <p>
              Configure geographic delivery coverage, monitor zone statuses, and edit delivery polygons.
            </p>
          </div>
        </div>

        <div className="zone-header-actions">
          <button
            type="button"
            className="zone-refresh-btn"
            onClick={loadZones}
            disabled={loading}
            title="Refresh zone data"
          >
            <FiRefreshCw className={loading ? "zone-spin" : ""} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            className="zone-btn"
            onClick={handleCreateZone}
            title="Create a new zone"
          >
            <FiPlus size={16} />
            <span>Create Zone</span>
          </button>
        </div>
      </div>

      {/* =====================================================
          KPI STAT METRIC CARDS
      ====================================================== */}
      <div className="zone-stats-grid">
        {/* TOTAL */}
        <div
          className={`zone-stat-card zone-stat-purple ${
            statusFilter === "ALL" ? "selected" : ""
          }`}
          onClick={() => setStatusFilter("ALL")}
          title="Filter: All Zones"
        >
          <div className="zone-stat-icon">
            <FiLayers />
          </div>

          <div className="zone-stat-content">
            <span>Total Zones</span>
            <strong>{stats.total}</strong>
            <small>All registered delivery areas</small>
          </div>
        </div>

        {/* ACTIVE */}
        <div
          className={`zone-stat-card zone-stat-green ${
            statusFilter === "ACTIVE" ? "selected" : ""
          }`}
          onClick={() => setStatusFilter("ACTIVE")}
          title="Filter: Active Zones Only"
        >
          <div className="zone-stat-icon">
            <FiCheckCircle />
          </div>

          <div className="zone-stat-content">
            <span>Active Zones</span>
            <strong>{stats.active}</strong>
            <small>
              <span className="zone-pulse-dot" /> Currently taking orders
            </small>
          </div>
        </div>

        {/* INACTIVE */}
        <div
          className={`zone-stat-card zone-stat-amber ${
            statusFilter === "INACTIVE" ? "selected" : ""
          }`}
          onClick={() => setStatusFilter("INACTIVE")}
          title="Filter: Inactive Zones Only"
        >
          <div className="zone-stat-icon">
            <FiAlertCircle />
          </div>

          <div className="zone-stat-content">
            <span>Inactive Zones</span>
            <strong>{stats.inactive}</strong>
            <small>Delivery service paused</small>
          </div>
        </div>
      </div>

      {/* =====================================================
          MAIN CARD & TABLE
      ====================================================== */}
      <div className="zone-card">
        {/* TOOLBAR */}
        <div className="zone-toolbar">
          {/* Search Box */}
          <div className="zone-search-wrapper">
            <FiSearch className="zone-search-icon" />
            <input
              type="text"
              className="zone-search-input"
              placeholder="Search zones by name or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                className="zone-search-clear"
                onClick={() => setSearch("")}
                title="Clear search"
              >
                <FiX />
              </button>
            )}
          </div>

          {/* Right Controls */}
          <div className="zone-toolbar-right">
            <div className="zone-results-pill">
              <strong>{filteredZones.length}</strong> Zones
            </div>

            {/* Status Filter */}
            <select
              className="zone-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              title="Filter by status"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Only</option>
              <option value="INACTIVE">Inactive Only</option>
            </select>

            {/* Page Size */}
            <select
              className="zone-select"
              value={entriesPerPage}
              onChange={(e) => setEntriesPerPage(Number(e.target.value))}
              title="Zones per page"
            >
              <option value={10}>10 / page</option>
              <option value={25}>25 / page</option>
              <option value={50}>50 / page</option>
            </select>
          </div>
        </div>

        {/* TABLE WRAPPER */}
        <div className="zone-table-wrapper">
          <table className="zone-table">
            <thead>
              <tr>
                <th className="zone-col-num">#</th>
                <th className="zone-col-name">Zone Details</th>
                <th className="zone-col-status">Status</th>
                <th className="zone-col-actions">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                /* LOADING SKELETON ROWS */
                Array.from({ length: Math.min(entriesPerPage, 5) }).map(
                  (_, idx) => (
                    <tr key={`skeleton-${idx}`}>
                      <td className="zone-cell-num">
                        <div
                          className="zone-skeleton-line"
                          style={{ width: "20px", margin: "0 auto" }}
                        />
                      </td>
                      <td>
                        <div className="zone-info-cell">
                          <div
                            className="zone-skeleton-line"
                            style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: "12px",
                              flexShrink: 0,
                            }}
                          />
                          <div style={{ flex: 1 }}>
                            <div
                              className="zone-skeleton-line"
                              style={{ width: "45%", height: "16px" }}
                            />
                            <div
                              className="zone-skeleton-line"
                              style={{
                                width: "25%",
                                height: "12px",
                                marginTop: "6px",
                              }}
                            />
                          </div>
                        </div>
                      </td>
                      <td>
                        <div
                          className="zone-skeleton-line"
                          style={{
                            width: "110px",
                            height: "26px",
                            margin: "0 auto",
                            borderRadius: "20px",
                          }}
                        />
                      </td>
                      <td>
                        <div
                          className="zone-skeleton-line"
                          style={{
                            width: "36px",
                            height: "36px",
                            margin: "0 auto",
                            borderRadius: "10px",
                          }}
                        />
                      </td>
                    </tr>
                  )
                )
              ) : currentTableData.length > 0 ? (
                /* DATA ROWS */
                currentTableData.map((zone, index) => {
                  const isActive = isZoneActive(zone.status);
                  const isUpdating = updatingZoneId === zone.zoneId;

                  const initial =
                    zone.zoneName && zone.zoneName.trim().length > 0
                      ? zone.zoneName.trim().charAt(0).toUpperCase()
                      : "Z";

                  return (
                    <tr key={zone.zoneId ?? index}>
                      {/* NUMBER */}
                      <td className="zone-cell-num">
                        {startIndex + index + 1}
                      </td>

                      {/* ZONE DETAILS */}
                      <td>
                        <div className="zone-info-cell">
                          <div className="zone-pin-avatar">{initial}</div>

                          <div>
                            <div
                              className="zone-name-primary"
                              title={zone.zoneName}
                            >
                              {zone.zoneName || "Unnamed Zone"}
                            </div>

                            <div className="zone-id-tag">
                              <span>Zone ID:</span>
                              <span className="zone-id-pill">
                                #{zone.zoneId}
                              </span>
                              {Array.isArray(zone.boundary) && zone.boundary.length > 0 && (
                                <span className="zone-geo-pill" title="Geographic boundary polygon configured">
                                  <FiLayers size={10} /> {zone.boundary.length} {zone.boundary.length === 1 ? "Area" : "Areas"}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* STATUS SWITCH & BADGE */}
                      <td>
                        <div className="zone-status-wrapper">
                          <label className="switch">
                            <input
                              type="checkbox"
                              checked={isActive}
                              disabled={isUpdating}
                              onChange={() => initiateStatusToggle(zone)}
                            />
                            <span className="slider" />
                          </label>

                          <span
                            className={`zone-status-badge ${
                              isActive ? "active" : "inactive"
                            }`}
                          >
                            <span className="zone-badge-dot" />
                            {isUpdating
                              ? "Saving..."
                              : isActive
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </div>
                      </td>

                      {/* ACTIONS: VIEW & EDIT (NO DELETE PER CONTRACT) */}
                      <td>
                        <div className="zone-action-buttons">
                          <button
                            type="button"
                            className="view-fab"
                            onClick={() => handleViewZone(zone)}
                            title={`View Details for ${zone.zoneName || "Zone"}`}
                            aria-label={`View Details for ${zone.zoneName || "Zone"}`}
                          >
                            <FiEye />
                          </button>

                          <button
                            type="button"
                            className="edit-fab"
                            onClick={() => handleEditZone(zone)}
                            title={`Edit ${zone.zoneName || "Zone"}`}
                            aria-label={`Edit ${zone.zoneName || "Zone"}`}
                          >
                            <FiEdit2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                /* EMPTY STATE */
                <tr>
                  <td colSpan="4" className="zone-empty-cell">
                    <div className="zone-empty-container">
                      <div className="zone-empty-icon">
                        <FiMapPin />
                      </div>
                      <h3>No Zones Found</h3>
                      <p>
                        {search || statusFilter !== "ALL"
                          ? "No zones match your search query or filter criteria."
                          : "No delivery zones have been configured yet."}
                      </p>
                      {search || statusFilter !== "ALL" ? (
                        <button
                          type="button"
                          className="zone-empty-btn"
                          onClick={() => {
                            setSearch("");
                            setStatusFilter("ALL");
                          }}
                        >
                          Clear All Filters
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="zone-btn"
                          style={{ marginTop: "12px" }}
                          onClick={handleCreateZone}
                        >
                          <FiPlus size={16} />
                          <span>Create First Zone</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* =====================================================
            FOOTER & PAGINATION
        ====================================================== */}
        {filteredZones.length > 0 && (
          <div className="zone-footer">
            <div className="zone-footer-info">
              Showing <strong>{startIndex + 1}</strong> to{" "}
              <strong>
                {Math.min(startIndex + entriesPerPage, filteredZones.length)}
              </strong>{" "}
              of <strong>{filteredZones.length}</strong> zones
            </div>

            <div className="zone-pagination-controls">
              {/* PREV BUTTON */}
              <button
                type="button"
                className="zone-page-btn"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1 || loading}
                title="Previous Page"
              >
                &lt;
              </button>

              {/* PAGE BUTTONS */}
              {Array.from({ length: totalPages }, (_, idx) => idx + 1)
                .filter((p) => {
                  if (totalPages <= 6) return true;
                  if (p === 1 || p === totalPages) return true;
                  if (Math.abs(p - currentPage) <= 1) return true;
                  return false;
                })
                .map((p) => (
                  <button
                    key={`page-${p}`}
                    type="button"
                    className={`zone-page-btn ${
                      currentPage === p ? "active" : ""
                    }`}
                    onClick={() => setCurrentPage(p)}
                    disabled={loading}
                  >
                    {p}
                  </button>
                ))}

              {/* NEXT BUTTON */}
              <button
                type="button"
                className="zone-page-btn"
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage >= totalPages || loading}
                title="Next Page"
              >
                &gt;
              </button>
            </div>
          </div>
        )}
      </div>

      {/* =====================================================
          STATUS CONFIRMATION DIALOG
      ====================================================== */}
      <ZoneStatusDialog
        isOpen={statusDialog.isOpen}
        zone={statusDialog.zone}
        targetStatus={statusDialog.targetStatus}
        onConfirm={confirmStatusToggle}
        onCancel={() =>
          setStatusDialog({
            isOpen: false,
            zone: null,
            targetStatus: "INACTIVE",
          })
        }
        loading={updatingZoneId === statusDialog.zone?.zoneId}
      />

      {/* =====================================================
          ZONE DETAILS MODAL (READ-ONLY MAP & METADATA)
      ====================================================== */}
      <ZoneDetailsModal
        isOpen={Boolean(detailsZone)}
        zone={detailsZone}
        onClose={() => setDetailsZone(null)}
        onEdit={(zone) => {
          setDetailsZone(null);
          handleEditZone(zone);
        }}
        onToggleStatus={(zone) => {
          initiateStatusToggle(zone);
        }}
        isLoaded={isMapLoaded}
      />
    </div>
  );
}

ZoneManagement.propTypes = {
  setActivePage: PropTypes.func,
};

export default ZoneManagement;