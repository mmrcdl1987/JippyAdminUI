import { useEffect, useState } from "react";
import "../styles/AssignAreas.css";
import {
  getStates,
  getCitiesByState,
  getAreasByCity,
  getAssignedManagerAreas,
  getAssignedManagerAreasByUsername,
  updateManagerAreas,
  assignManagerAreas,
  getAllAreas,
} from "../services/managerAreaService";
import { getApprovalSettings } from "../services/approvalService";
import { searchEmployees } from "../services/employeeService";
import { isSuperAdmin, isFleetManager } from "../utils/permissionUtils";

function AssignAreas() {
  const storedUserId = localStorage.getItem("approverId") || localStorage.getItem("userId");
  const userRole = (localStorage.getItem("role") || "").trim().toUpperCase();
  const isSuper = isSuperAdmin();
  const isFM = isFleetManager() || userRole === "ROLE_FLEET_MANAGER" || userRole === "ROLE_FLEET_MANAGER";

  // Approver selection state - Start empty
  const [approverIdInput, setApproverIdInput] = useState("");
  const [activeApproverId, setActiveApproverId] = useState(null);

  // Employee search state
  const [empSearchQuery, setEmpSearchQuery] = useState("");
  const [empSearchResults, setEmpSearchResults] = useState([]);
  const [isSearchingEmp, setIsSearchingEmp] = useState(false);
  const [showEmpDropdown, setShowEmpDropdown] = useState(false);

  const handleEmpSearch = async (query) => {
    setEmpSearchQuery(query);
    if (!query || query.trim().length < 1) {
      setEmpSearchResults([]);
      setShowEmpDropdown(false);
      return;
    }
    try {
      setIsSearchingEmp(true);
      const res = await searchEmployees(query);
      const data = res?.data || res || [];
      setEmpSearchResults(Array.isArray(data) ? data : []);
      setShowEmpDropdown(true);
    } catch (err) {
      console.error("Employee search error:", err);
    } finally {
      setIsSearchingEmp(false);
    }
  };

  // Location cascading state
  const [states, setStates] = useState([]);
  const [selectedStateId, setSelectedStateId] = useState("");
  const [cities, setCities] = useState([]);
  const [selectedCityId, setSelectedCityId] = useState("");
  const [cityAreas, setCityAreas] = useState([]);
  const [allGlobalAreas, setAllGlobalAreas] = useState([]);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [areaSearchFilter, setAreaSearchFilter] = useState("");

  // Area Selection state for active approver
  const [selectedAreaIds, setSelectedAreaIds] = useState([]);
  const [saving, setSaving] = useState(false);

  // Overview / Mappings table state
  const [approverMappings, setApproverMappings] = useState([]);
  const [loadingOverview, setLoadingOverview] = useState(false);
  const [tableSearch, setTableSearch] = useState("");

  // Modal for Viewing All Assigned Areas
  const [showViewAreasModal, setShowViewAreasModal] = useState(false);
  const [viewModalData, setViewModalData] = useState(null);

  const openViewAreasModal = (item, areaNames) => {
    setViewModalData({
      approverId: item.approverId,
      approverName: item.approverName,
      approverRole: item.approverRole,
      entityLevel: item.entityLevelDisplay || "ALL (L1)",
      areaNames: areaNames,
    });
    setShowViewAreasModal(true);
  };

  useEffect(() => {
    fetchInitialStates();
    fetchAllGlobalAreas();
    fetchApproversAndAreas();
    
    // For Fleet Managers, auto-load their ID but don't show it in input
    if (!isSuper && storedUserId) {
      setActiveApproverId(Number(storedUserId));
      // Don't set approverIdInput - keep it empty
    }
  }, []);

  // Only fetch when user explicitly selects an approver (non-null)
  useEffect(() => {
    if (activeApproverId && !isNaN(Number(activeApproverId))) {
      fetchAssignedAreasForUser(activeApproverId);
    }
  }, [activeApproverId]);

  const fetchInitialStates = async () => {
    try {
      setLoadingLocation(true);
      const res = await getStates();
      let list = [];
      if (Array.isArray(res)) list = res;
      else if (res && Array.isArray(res.data)) list = res.data;
      else if (res && Array.isArray(res.content)) list = res.content;
      setStates(list);
    } catch (err) {
      console.error("Error fetching states:", err);
    } finally {
      setLoadingLocation(false);
    }
  };

  const fetchAllGlobalAreas = async () => {
    try {
      const res = await getAllAreas();
      const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
      setAllGlobalAreas(list);
    } catch (err) {
      console.error("Error fetching global areas:", err);
    }
  };

  const handleStateChange = async (e) => {
    const stateId = e.target.value;
    setSelectedStateId(stateId);
    setSelectedCityId("");
    setCities([]);
    setCityAreas([]);

    if (!stateId) return;

    try {
      setLoadingLocation(true);
      const res = await getCitiesByState(stateId);
      let list = [];
      if (Array.isArray(res)) list = res;
      else if (res && Array.isArray(res.data)) list = res.data;
      else if (res && Array.isArray(res.content)) list = res.content;
      setCities(list);
    } catch (err) {
      console.error("Error fetching cities:", err);
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleCityChange = async (e) => {
    const cityId = e.target.value;
    setSelectedCityId(cityId);
    setCityAreas([]);

    if (!cityId) return;

    try {
      setLoadingLocation(true);
      const res = await getAreasByCity(cityId);
      let list = [];
      if (Array.isArray(res)) list = res;
      else if (res && Array.isArray(res.data)) list = res.data;
      else if (res && Array.isArray(res.content)) list = res.content;
      setCityAreas(list);
    } catch (err) {
      console.error("Error fetching areas in city:", err);
    } finally {
      setLoadingLocation(false);
    }
  };

  const fetchAssignedAreasForUser = async (userId) => {
    if (!userId || isNaN(Number(userId))) return;
    try {
      const res = await getAssignedManagerAreas(userId);
      console.log(`Fetched assigned areas for User #${userId}:`, res);
      const dto = res?.data || res;
      const assignedIds = dto?.assignedAreaIds || dto?.areaIds || dto?.assignedAreas || [];
      if (Array.isArray(assignedIds)) {
        const parsed = assignedIds.map((a) => (typeof a === "object" ? (a.areaId || a.area_id) : Number(a))).filter(Boolean);
        setSelectedAreaIds(parsed);
      }
    } catch (err) {
      console.error(`Error fetching assigned areas for User #${userId}:`, err);
    }
  };

  const fetchApproversAndAreas = async () => {
    try {
      setLoadingOverview(true);
      const res = await getApprovalSettings();
      let settingsList = [];
      if (Array.isArray(res)) settingsList = res;
      else if (res && Array.isArray(res.data)) settingsList = res.data;
      else if (res && Array.isArray(res.content)) settingsList = res.content;
      else if (res && typeof res === "object") settingsList = res.data || res.approvalSettings || [];

      // Group settings by unique Approver ID
      const mapByApprover = {};
      for (const item of settingsList) {
        const apprId = Number(item.approverId);
        if (!apprId || isNaN(apprId)) continue;

        if (!mapByApprover[apprId]) {
          mapByApprover[apprId] = {
            approverId: apprId,
            roles: new Set([item.approverRole || "MANAGER"]),
            entities: new Set([`${item.entityType || "OUTLET"} - ${item.approvalLevel || "Level 1"}`]),
            areaIds: [],
          };
        } else {
          mapByApprover[apprId].roles.add(item.approverRole || "MANAGER");
          mapByApprover[apprId].entities.add(`${item.entityType || "OUTLET"} - ${item.approvalLevel || "Level 1"}`);
        }
      }

      // If logged in Fleet Manager has no setting entry yet, include self
      if (!isSuper && storedUserId && !mapByApprover[Number(storedUserId)]) {
        mapByApprover[Number(storedUserId)] = {
          approverId: Number(storedUserId),
          roles: new Set([userRole || "ROLE_FLEET_MANAGER"]),
          entities: new Set(["ALL - Level 1"]),
          areaIds: [],
        };
      }

      const approverListRaw = Object.values(mapByApprover);
      const approverList = approverListRaw.map(appr => ({
        ...appr,
        approverRole: Array.from(appr.roles).join(", "),
        entityLevelDisplay: Array.from(appr.entities).join(", "),
      }));

      // Fetch assigned areas for each unique approver
      for (const appr of approverList) {
        try {
          const areaRes = await getAssignedManagerAreas(appr.approverId);
          const dto = areaRes?.data || areaRes;
          const assignedIds = dto?.assignedAreaIds || dto?.areaIds || dto?.assignedAreas || [];
          if (Array.isArray(assignedIds)) {
            appr.areaIds = assignedIds.map((a) => (typeof a === "object" ? (a.areaId || a.area_id) : Number(a))).filter(Boolean);
          }
          if (dto?.approverName) {
            appr.approverName = dto.approverName;
          }
        } catch (e) {
          // ignore if no assigned areas
        }
      }

      setApproverMappings(approverList);
    } catch (err) {
      console.error("Error fetching approvers and areas overview:", err);
    } finally {
      setLoadingOverview(false);
    }
  };

  const handleSaveAreas = async () => {
    if (!activeApproverId || isNaN(Number(activeApproverId))) {
      alert("Please select an Approver first.");
      return;
    }

    const validAreaIds = selectedAreaIds.filter((id) =>
      allGlobalAreas.some((a) => Number(a.areaId || a.area_id) === Number(id))
    );

    if (!validAreaIds || validAreaIds.length === 0) {
      alert("Please select at least one valid area to assign. The Area Id list cannot be empty.");
      return;
    }

    try {
      setSaving(true);
      try {
        await updateManagerAreas(activeApproverId, validAreaIds);
      } catch (updateErr) {
        console.log("updateManagerAreas fallback to assignManagerAreas:", updateErr);
        await assignManagerAreas(activeApproverId, validAreaIds);
      }

      alert(`Successfully saved ${validAreaIds.length} Manager Area(s) for Approver ID #${activeApproverId}.`);
      fetchApproversAndAreas(); // Refresh overview table
    } catch (error) {
      console.error("Save Manager Areas Error:", error);
      const errMsg =
        error.response?.data?.message ||
        error.response?.data ||
        "Failed to assign/update manager areas.";
      alert(errMsg);
    } finally {
      setSaving(false);
    }
  };

  const toggleSelectAllCityAreas = () => {
    const cityAreaIds = cityAreas.map((a) => a.areaId || a.area_id);
    const allSelected = cityAreaIds.every((id) => selectedAreaIds.includes(id));

    if (allSelected) {
      setSelectedAreaIds((prev) => prev.filter((id) => !cityAreaIds.includes(id)));
    } else {
      setSelectedAreaIds((prev) => [...new Set([...prev, ...cityAreaIds])]);
    }
  };

  const filteredCityAreas = cityAreas.filter((a) =>
    (a.areaName || a.area_name || "").toLowerCase().includes(areaSearchFilter.toLowerCase())
  );

  const filteredOverview = approverMappings.filter((m) => {
    const q = tableSearch.toLowerCase();
    const role = String(m.approverRole || "").toLowerCase();
    const entityLevel = String(m.entityLevelDisplay || "").toLowerCase();
    const id = String(m.approverId);
    const name = String(m.approverName || "").toLowerCase();
    return role.includes(q) || entityLevel.includes(q) || id.includes(q) || name.includes(q);
  });

  return (
    <div className="asgn-page-wrapper">
      <div className="asgn-header-flex">
        <div>
          <h2 className="asgn-page-title">Manager Area Assignment</h2>
          <p className="asgn-subtitle">
            Assign coverage areas by State, City, and Area for Approvers and Fleet Managers.
          </p>
        </div>
        <div className="asgn-header-actions">
          {/* Search Approver beside Refresh */}
          <div className="asgn-search-wrapper">
            <input
              type="text"
              className="asgn-search-input"
              placeholder="Search Approver..."
              value={empSearchQuery}
              onChange={(e) => handleEmpSearch(e.target.value)}
              disabled={!isSuper}
              onBlur={() => setTimeout(() => setShowEmpDropdown(false), 200)}
              onFocus={() => { if (empSearchResults.length > 0) setShowEmpDropdown(true); }}
            />
            {isSearchingEmp && <span className="asgn-search-spinner">⏳</span>}
            
            {showEmpDropdown && empSearchResults.length > 0 && (
              <ul className="asgn-dropdown-list asgn-dropdown-header">
                {empSearchResults.map(emp => (
                  <li
                    key={emp.employeeId || emp.id}
                    className="asgn-dropdown-item"
                    onMouseDown={() => {
                      const id = emp.employeeId || emp.id;
                      setApproverIdInput(id);
                      setActiveApproverId(Number(id));
                      setShowEmpDropdown(false);
                      setEmpSearchQuery("");
                    }}
                  >
                    <strong>{emp.employeeName || emp.name || emp.firstName}</strong>
                    <span className="asgn-dropdown-id">(ID: {emp.employeeId || emp.id})</span>
                  </li>
                ))}
              </ul>
            )}
            {showEmpDropdown && empSearchResults.length === 0 && empSearchQuery.trim().length > 0 && !isSearchingEmp && (
              <ul className="asgn-dropdown-list asgn-dropdown-header">
                <li className="asgn-dropdown-empty">No employees found</li>
              </ul>
            )}
          </div>
          
          <button
            className="asgn-refresh-btn"
            onClick={() => {
              fetchApproversAndAreas();
              if (activeApproverId) fetchAssignedAreasForUser(activeApproverId);
            }}
            disabled={loadingOverview}
          >
            {loadingOverview ? "Refreshing..." : "🔄 Refresh"}
          </button>
        </div>
      </div>

      {/* Main Assignment Card */}
      <div className="asgn-card">
        <div className="asgn-card-header">ASSIGN AREAS BY LOCATION</div>

        {/* Step 1: Approver ID, State, City in one line */}
        <div className="asgn-section-box">
          <label className="asgn-section-title">1. Select Approver & Location</label>
          <div className="asgn-grid-3">
            {/* Approver ID */}
            <div className="asgn-form-group">
              <label className="asgn-label">Approver ID <span className="asgn-required">*</span></label>
              <div className="asgn-input-wrapper">
                <input
                  type="number"
                  className="asgn-input"
                  value={approverIdInput}
                  onChange={(e) => {
                    setApproverIdInput(e.target.value);
                    if (e.target.value && !isNaN(Number(e.target.value))) {
                      setActiveApproverId(Number(e.target.value));
                    } else {
                      // Clear active approver if input is cleared
                      setActiveApproverId(null);
                      setSelectedAreaIds([]);
                    }
                  }}
                  disabled={!isSuper}
                  readOnly={!isSuper}
                  placeholder={isSuper ? "Enter ID" : `Your ID: ${storedUserId || "Not set"}`}
                />
                {!isSuper && <span className="asgn-lock-icon">🔒</span>}
              </div>
              {/* Show active approver info for Fleet Managers */}
              {!isSuper && activeApproverId && (
                <span className="asgn-helper-text" style={{ color: '#10b981', fontWeight: '600' }}>
                  ✓ Active Approver: #{activeApproverId}
                </span>
              )}
            </div>

            {/* State */}
            <div className="asgn-form-group">
              <label className="asgn-label">State <span className="asgn-required">*</span></label>
              <select
                className="asgn-select"
                value={selectedStateId}
                onChange={handleStateChange}
                disabled={!activeApproverId || loadingLocation}
              >
                <option value="">-- Select --</option>
                {states.map((s) => (
                  <option key={s.stateId || s.id} value={s.stateId || s.id}>
                    {s.stateName || s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* City */}
            <div className="asgn-form-group">
              <label className="asgn-label">City <span className="asgn-required">*</span></label>
              <select
                className="asgn-select"
                value={selectedCityId}
                onChange={handleCityChange}
                disabled={!selectedStateId || !activeApproverId || loadingLocation}
              >
                <option value="">-- Select --</option>
                {cities.map((c) => (
                  <option key={c.cityId || c.id || c.city_id} value={c.cityId || c.id || c.city_id}>
                    {c.cityName || c.name || c.city_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <span className="asgn-helper-text" style={{ marginTop: "8px", display: "block" }}>
            {!activeApproverId 
              ? " "
              : !isSuper 
                ? `✅ Approver ID #${activeApproverId} is active. Select State and City to assign areas.`
                : "Enter Approver ID or search above to assign coverage areas."}
          </span>
        </div>

        {/* Step 2: Areas Checklist for Selected City */}
        {selectedCityId ? (
          <div className="asgn-section-box">
            <div className="asgn-section-header">
              <label className="asgn-section-title" style={{ margin: 0 }}>
                2. Select Areas in City {selectedAreaIds.length > 0 && <span className="asgn-badge-count">({selectedAreaIds.length} Total Selected)</span>}
              </label>

              {cityAreas.length > 0 && (
                <button
                  type="button"
                  className="asgn-select-all-btn"
                  onClick={toggleSelectAllCityAreas}
                >
                  {cityAreas.every((a) => selectedAreaIds.includes(a.areaId || a.area_id)) ? "Deselect All" : "Select All"}
                </button>
              )}
            </div>

            <input
              type="text"
              className="asgn-input"
              placeholder="Search areas in city by name..."
              value={areaSearchFilter}
              onChange={(e) => setAreaSearchFilter(e.target.value)}
              style={{ marginBottom: "12px", height: "38px" }}
            />

            <div className="asgn-area-checklist">
              {loadingLocation ? (
                <div className="asgn-empty-state">Loading areas for selected city...</div>
              ) : filteredCityAreas.length > 0 ? (
                filteredCityAreas.map((area) => {
                  const isChecked = selectedAreaIds.includes(area.areaId || area.area_id);
                  return (
                    <label key={area.areaId || area.area_id} className={`asgn-area-card ${isChecked ? "selected" : ""}`}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedAreaIds((prev) => [...prev, area.areaId || area.area_id]);
                          } else {
                            setSelectedAreaIds((prev) => prev.filter((id) => id !== (area.areaId || area.area_id)));
                          }
                        }}
                      />
                      <span>
                        <strong>{area.areaName || area.area_name}</strong>
                      </span>
                    </label>
                  );
                })
              ) : (
                <div className="asgn-empty-state">No areas found for this city</div>
              )}
            </div>
          </div>
        ) : (
          <div className="asgn-info-banner">
            📍 Please select a <strong>State</strong> and <strong>City</strong> above to fetch and assign specific coverage areas to Approver ID <strong>#{activeApproverId || "-"}</strong>.
          </div>
        )}

        {/* Action Button */}
        <div className="asgn-btn-wrapper">
          <button
            className="asgn-save-btn"
            onClick={handleSaveAreas}
            disabled={saving || !activeApproverId}
          >
            {saving ? "Saving Areas..." : `✓ Save Manager Areas (${selectedAreaIds.length} Selected)`}
          </button>
        </div>
      </div>

      {/* Overview Table Card: Approvers & Assigned Areas */}
      <div className="asgn-card">
        <div className="asgn-card-header">APPROVERS & ASSIGNED COVERAGE AREAS</div>

        <div className="asgn-table-toolbar">
          <input
            type="text"
            className="asgn-input"
            style={{ width: "320px" }}
            placeholder="Search by Approver ID, Role, Entity, Level..."
            value={tableSearch}
            onChange={(e) => setTableSearch(e.target.value)}
          />
          <span className="asgn-badge-count">
            Total Approvers: {filteredOverview.length}
          </span>
        </div>

        <div className="asgn-table-wrapper">
          <table className="asgn-table">
            <thead>
              <tr>
                <th>Approver</th>
                <th>Approver Role</th>
                <th>Entity & Approval Level</th>
                <th>Assigned Coverage Areas</th>
              </tr>
            </thead>
            <tbody>
              {loadingOverview ? (
                <tr>
                  <td colSpan="4" className="asgn-empty-row">
                    Loading Approvers & Area Mappings...
                  </td>
                </tr>
              ) : filteredOverview.length > 0 ? (
                filteredOverview.map((item) => {
                  const areaNames = item.areaIds.map((id) => {
                    const found = allGlobalAreas.find((a) => Number(a.areaId || a.area_id) === Number(id));
                    return found ? (found.areaName || found.area_name) : `Area #${id}`;
                  });

                  const visibleNames = areaNames.slice(0, 3);
                  const extraCount = areaNames.length - visibleNames.length;

                  return (
                    <tr key={item.approverId}>
                      <td>
                        <strong>#{item.approverId}</strong>
                        {item.approverName && (
                          <div className="asgn-approver-name">
                            {item.approverName}
                          </div>
                        )}
                      </td>
                      <td>
                        {item.approverRole ? item.approverRole.split(", ").map((r, i) => (
                          <span key={i} className="asgn-role-badge">{r}</span>
                        )) : <span className="asgn-role-badge">MANAGER</span>}
                      </td>
                      <td>
                        {item.entityLevelDisplay ? item.entityLevelDisplay.split(", ").map((el, i) => {
                          const [entity, lvl] = el.split(" - ");
                          return (
                            <div key={i} className="asgn-entity-item">
                              <strong>{entity}</strong> - <small>{lvl}</small>
                            </div>
                          );
                        }) : <div><strong>OUTLET</strong> - <small>Level 1</small></div>}
                      </td>
                      <td>
                        {areaNames.length === 0 ? (
                          <span className="asgn-no-areas">No areas assigned</span>
                        ) : (
                          <div className="asgn-tag-container" title={`Assigned Areas (${areaNames.length}):\n${areaNames.join("\n")}`}>
                            {visibleNames.map((name, idx) => (
                              <span key={idx} className="asgn-tag">
                                📍 {name}
                              </span>
                            ))}
                            {extraCount > 0 && (
                              <span
                                className="asgn-more-tag"
                                onClick={() => openViewAreasModal(item, areaNames)}
                                title="Click to view all assigned areas"
                              >
                                +{extraCount} more
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4" className="asgn-empty-row">
                    No Approvers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View All Assigned Areas Modal */}
      {showViewAreasModal && viewModalData && (
        <div className="asgn-modal-overlay">
          <div className="asgn-modal">
            <div className="asgn-modal-header">
              <h3>📍 Assigned Coverage Areas ({viewModalData.approverName ? `${viewModalData.approverName} #${viewModalData.approverId}` : `Approver #${viewModalData.approverId}`})</h3>
              <button
                className="asgn-modal-close"
                onClick={() => {
                  setShowViewAreasModal(false);
                  setViewModalData(null);
                }}
              >
                ✕
              </button>
            </div>

            <div className="asgn-modal-body">
              <div className="asgn-info-banner asgn-modal-info">
                <strong>Approver:</strong> {viewModalData.approverName ? `${viewModalData.approverName} (ID #${viewModalData.approverId})` : `ID #${viewModalData.approverId}`} | Role: <strong>{viewModalData.approverRole}</strong> | Target: <strong>{viewModalData.entityLevel}</strong>
              </div>

              <div className="asgn-modal-count">
                <span>Total Assigned Coverage Areas:</span>
                <span className="asgn-badge-count">{viewModalData.areaNames.length} Areas</span>
              </div>

              <div className="asgn-modal-areas">
                {viewModalData.areaNames.map((name, idx) => (
                  <span key={idx} className="asgn-tag asgn-modal-tag">
                    📍 {name}
                  </span>
                ))}
              </div>
            </div>

            <div className="asgn-modal-footer">
              <button
                className="asgn-modal-cancel-btn"
                onClick={() => {
                  setShowViewAreasModal(false);
                  setViewModalData(null);
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AssignAreas;