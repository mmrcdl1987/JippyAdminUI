import { useEffect, useState } from "react";
import "../styles/ApprovalSettings.css";
import { FM_API } from "../services/api";
import {
  getAllAreas,
  assignManagerAreas,
  getAssignedManagerAreas,
  updateManagerAreas,
} from "../services/managerAreaService";
import {
  createApproval,
  replaceApproverWithAreas,
  getApprovalSettings,
  triggerAutoApprovalTestProcess,
} from "../services/approvalService";

function ApprovalSettings() {
  const [settingsList, setSettingsList] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [testingScheduler, setTestingScheduler] = useState(false);
  const [search, setSearch] = useState("");
  const [showRulesInfo, setShowRulesInfo] = useState(true);

  // Form state for Create Approval Setting
  const [formData, setFormData] = useState({
    entityType: "OUTLET",
    approvalLevel: "Level 1",
    approverRole: "MANAGER",
    approverId: "",
    workflowType: "CASCADE",
    timeToEscalateInHours: 24,
    triggersActivation: true,
    requiredApprovalsCount: 1,
    createdBy: 1,
    isActive: true,
  });

  // State for Replace Approver Modal
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [replaceTarget, setReplaceTarget] = useState(null);
  const [replaceFormData, setReplaceFormData] = useState({
    approvalSettingsId: "",
    approverId: "",
    updatedBy: 1,
  });
  // Area state for Create Approver / Assign Areas
  const [areas, setAreas] = useState([]);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [selectedAreaIds, setSelectedAreaIds] = useState([]);
  const [areaFilter, setAreaFilter] = useState("");
  const [managerAreasMap, setManagerAreasMap] = useState({});

  // State for Viewing Assigned Areas Modal
  const [showViewAreasModal, setShowViewAreasModal] = useState(false);
  const [viewModalData, setViewModalData] = useState(null);

  const openViewAreasModal = (item, allNames) => {
    setViewModalData({
      approverId: item.approverId,
      approverRole: item.approverRole,
      entityType: item.entityType,
      approvalLevel: item.approvalLevel,
      areaNames: allNames,
    });
    setShowViewAreasModal(true);
  };

  useEffect(() => {
    fetchSettings();
    fetchAreas();
  }, []);

  const fetchAreas = async () => {
    try {
      setLoadingAreas(true);
      const data = await getAllAreas();
      setAreas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching areas:", error);
    } finally {
      setLoadingAreas(false);
    }
  };

  const fetchSettings = async () => {
    try {
      setFetching(true);
      const res = await getApprovalSettings();
      console.log("Approval Settings API Response:", res);

      let dataList = [];
      if (Array.isArray(res)) {
        dataList = res;
      } else if (res && Array.isArray(res.data)) {
        dataList = res.data;
      } else if (res && Array.isArray(res.content)) {
        dataList = res.content;
      } else if (res && typeof res === "object") {
        dataList = res.data || res.approvalSettings || [];
      }

      setSettingsList(Array.isArray(dataList) ? dataList : []);

      // Fetch assigned manager areas for all unique approver IDs in the settings list
      const uniqueApproverIds = [
        ...new Set(
          (Array.isArray(dataList) ? dataList : [])
            .map((s) => s.approverId)
            .filter((id) => id !== null && id !== undefined && !isNaN(Number(id)))
        ),
      ];

      for (const apprId of uniqueApproverIds) {
        try {
          const areaRes = await getAssignedManagerAreas(apprId);
          console.log(`Assigned Manager Areas for User #${apprId}:`, areaRes);
          const dto = areaRes?.data || areaRes;
          const assignedIds = dto?.assignedAreaIds || dto?.areaIds || dto?.assignedAreas || [];
          if (Array.isArray(assignedIds) && assignedIds.length > 0) {
            setManagerAreasMap((prev) => ({
              ...prev,
              [apprId]: assignedIds.map((a) => (typeof a === "object" ? a.areaId : Number(a))).filter(Boolean),
            }));
          }
        } catch (areaErr) {
          console.log(`Could not fetch manager areas for approver #${apprId}:`, areaErr);
        }
      }
    } catch (error) {
      console.error("Error fetching approval settings:", error);
      // Keep empty list or dummy preview data if backend endpoint isn't fully seeded yet
    } finally {
      setFetching(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleReplaceInputChange = (e) => {
    const { name, value } = e.target;
    setReplaceFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateApproval = async (e) => {
    e.preventDefault();

    if (!formData.entityType || !formData.approvalLevel || !formData.approverRole) {
      alert("Please fill all required fields: Entity Type, Approval Level, and Approver Role.");
      return;
    }

    if (!formData.approverId || isNaN(Number(formData.approverId))) {
      alert("Please enter a valid numeric Approver ID.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        entityType: formData.entityType,
        approvalLevel: formData.approvalLevel,
        approverRole: formData.approverRole,
        approverId: Number(formData.approverId),
        workflowType: formData.workflowType,
        timeToEscalateInHours: Number(formData.timeToEscalateInHours) || 0,
        triggersActivation: Boolean(formData.triggersActivation),
        requiredApprovalsCount: Number(formData.requiredApprovalsCount) || 1,
        createdBy: Number(formData.createdBy) || 1,
        isActive: Boolean(formData.isActive),
      };

      const res = await createApproval(payload);
      console.log("Create Approval Response:", res);

      const message =
        res?.message || res?.responseMessage || "Approval Settings created successfully.";
      alert(message);

      // Add newly created setting to local state list immediately
      const newSetting = res?.data || {
        ...payload,
        approvalSettingsId: Date.now(),
        createdAt: new Date().toISOString(),
      };
      setSettingsList((prev) => [newSetting, ...prev]);

      // Reset form
      setFormData({
        entityType: "OUTLET",
        approvalLevel: "Level 1",
        approverRole: "MANAGER",
        approverId: "",
        workflowType: "CASCADE",
        timeToEscalateInHours: 24,
        triggersActivation: true,
        requiredApprovalsCount: 1,
        createdBy: 1,
        isActive: true,
      });
    } catch (error) {
      console.error("Create Approval Error:", error);
      const errMsg =
        error.response?.data?.errorMessage ||
        error.response?.data?.message ||
        "Failed to create Approval Settings.";
      alert(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const openReplaceModal = (item) => {
    setReplaceTarget(item);
    setReplaceFormData({
      approvalSettingsId: item.approvalSettingsId,
      approverId: "",
      updatedBy: 1,
    });
    setShowReplaceModal(true);
  };

  const handleReplaceApprover = async () => {
    if (!replaceFormData.approverId || isNaN(Number(replaceFormData.approverId))) {
      alert("Please enter a valid numeric New Approver ID.");
      return;
    }

    try {
      setReplacing(true);
      const payload = {
        approvalSettingsId: Number(replaceFormData.approvalSettingsId),
        approverId: Number(replaceFormData.approverId),
        updatedBy: Number(replaceFormData.updatedBy) || 1,
      };

      const res = await replaceApproverWithAreas(payload);
      console.log("Replace Approver Response:", res);

      alert("Approver replaced successfully. Manager Area mappings updated.");

      // Update local state list
      setSettingsList((prev) =>
        prev.map((item) =>
          item.approvalSettingsId === payload.approvalSettingsId
            ? { ...item, approverId: payload.approverId, updatedBy: payload.updatedBy }
            : item
        )
      );

      setShowReplaceModal(false);
      setReplaceTarget(null);
    } catch (error) {
      console.error("Replace Approver Error:", error);
      const errMsg =
        error.response?.data?.errorMessage ||
        error.response?.data?.message ||
        "Failed to replace Approver.";
      alert(errMsg);
    } finally {
      setReplacing(false);
    }
  };

  const getAssignedAreaIdsForApprover = (item) => {
    if (!item) return [];
    const apprId = item.approverId;

    if (managerAreasMap[apprId] && Array.isArray(managerAreasMap[apprId])) {
      return managerAreasMap[apprId];
    }

    if (Array.isArray(item.assignedAreas)) {
      return item.assignedAreas.map((a) => (typeof a === "object" ? a.areaId : Number(a))).filter(Boolean);
    }
    if (Array.isArray(item.managerAreas)) {
      return item.managerAreas.map((a) => (typeof a === "object" ? a.areaId : Number(a))).filter(Boolean);
    }
    if (Array.isArray(item.areaIds)) {
      return item.areaIds.map(Number).filter(Boolean);
    }
    if (Array.isArray(item.areas)) {
      return item.areas.map((a) => (typeof a === "object" ? a.areaId : Number(a))).filter(Boolean);
    }
    if (item.areaId) {
      return [Number(item.areaId)];
    }
    return [];
  };

  const openAreaModal = async (item) => {
    setModalApprover(item);
    let existingAreaIds = getAssignedAreaIdsForApprover(item);
    setModalSelectedAreaIds(existingAreaIds);
    setModalAreaFilter("");
    setShowAreaModal(true);

    if (item?.approverId) {
      try {
        const areaRes = await getAssignedManagerAreas(item.approverId);
        console.log(`Modal fetched assigned areas for User #${item.approverId}:`, areaRes);
        const dto = areaRes?.data || areaRes;
        const fetchedIds = dto?.assignedAreaIds || dto?.areaIds || dto?.assignedAreas || [];
        if (Array.isArray(fetchedIds) && fetchedIds.length > 0) {
          const parsedIds = fetchedIds.map((a) => (typeof a === "object" ? a.areaId : Number(a))).filter(Boolean);
          setModalSelectedAreaIds(parsedIds);
          setManagerAreasMap((prev) => ({
            ...prev,
            [item.approverId]: parsedIds,
          }));
        }
      } catch (err) {
        console.log("Could not refresh modal manager areas:", err);
      }
    }
  };

  const handleSaveModalAreas = async () => {
    if (!modalApprover?.approverId) {
      alert("Invalid Approver ID");
      return;
    }

    try {
      setSavingModalAreas(true);
      try {
        await updateManagerAreas(modalApprover.approverId, modalSelectedAreaIds);
      } catch (updateErr) {
        console.log("updateManagerAreas fallback to assignManagerAreas:", updateErr);
        await assignManagerAreas(modalApprover.approverId, modalSelectedAreaIds);
      }

      setManagerAreasMap((prev) => ({
        ...prev,
        [modalApprover.approverId]: modalSelectedAreaIds,
      }));
      alert(`Manager Areas updated successfully for Approver ID #${modalApprover.approverId}.`);
      setShowAreaModal(false);
      setModalApprover(null);
    } catch (error) {
      console.error("Assign/Update Areas Error:", error);
      const errMsg =
        error.response?.data?.message ||
        error.response?.data ||
        "Failed to update manager areas";
      alert(errMsg);
    } finally {
      setSavingModalAreas(false);
    }
  };

  const filteredSettings = settingsList.filter((item) => {
    const q = search.toLowerCase();
    return (
      item.entityType?.toLowerCase().includes(q) ||
      item.approvalLevel?.toLowerCase().includes(q) ||
      item.approverRole?.toLowerCase().includes(q) ||
      item.workflowType?.toLowerCase().includes(q) ||
      String(item.approverId || "").includes(q) ||
      String(item.approvalSettingsId || "").includes(q)
    );
  });

  const handleRunAutoApprovalTest = async () => {
    try {
      setTestingScheduler(true);
      const res = await triggerAutoApprovalTestProcess();
      console.log("Auto Approval Scheduler Test Response:", res);
      const message = typeof res === "string" ? res : res?.message || "Auto Approval Scheduler Executed Successfully.";
      alert(`⚡ ${message}`);
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

  return (
    <div className="appr-page-wrapper">
      <div className="appr-header-flex">
        <div>
          <h2 className="appr-page-title">Approval Settings Management</h2>
          <p className="appr-subtitle">
            Configure multi-level approval workflows, entity types, escalate timers, and approver area assignments.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            className="appr-refresh-btn"
            style={{ background: "#eff6ff", borderColor: "#bfdbfe", color: "#1d4ed8" }}
            onClick={handleRunAutoApprovalTest}
            disabled={testingScheduler}
            title="Execute Auto Approval Scheduler manually for testing"
          >
            {testingScheduler ? "Executing Scheduler..." : "⚡ Run Auto-Approval Test"}
          </button>
          <button
            className="appr-refresh-btn"
            onClick={fetchSettings}
            disabled={fetching}
          >
            {fetching ? "Refreshing..." : "🔄 Refresh Settings"}
          </button>
        </div>
      </div>

      {/* Business Rules Info Banner */}
      <div className="appr-info-card">
        <div className="appr-info-header">
          <span>ℹ️ Backend Duplicate Validation Rules</span>
          <button
            style={{
              marginLeft: "auto",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "12px",
              color: "#0284c7",
              fontWeight: 600,
            }}
            onClick={() => setShowRulesInfo(!showRulesInfo)}
          >
            {showRulesInfo ? "Hide Rules" : "Show Rules"}
          </button>
        </div>
        {showRulesInfo && (
          <div className="appr-info-body">
            An Approval Setting is considered a <code>DUPLICATE</code> only when ALL 4 fields are identical:
            <br />
            <strong>1. Entity Type</strong> &nbsp;|&nbsp;
            <strong>2. Approval Level</strong> &nbsp;|&nbsp;
            <strong>3. Approver ID</strong> &nbsp;|&nbsp;
            <strong>4. Workflow Type</strong>
            <br />
            <em>Example: <code>OUTLET | Level 1 | 1 | CASCADE</code> is allowed only once. Changing any single field creates a valid allowed entry (e.g. PARALLEL, Level 2, or Approver 110).</em>
          </div>
        )}
      </div>

      {/* Create Approval Setting Card */}
      <div className="appr-card">
        <div className="appr-card-header">CREATE APPROVAL SETTING</div>
        <form onSubmit={handleCreateApproval}>
          <div className="appr-form-grid">
            <div className="appr-form-group">
              <label className="appr-form-label">
                Entity Type <span className="appr-required">*</span>
              </label>
              <select
                className="appr-form-select"
                name="entityType"
                value={formData.entityType}
                onChange={handleInputChange}
              >
                <option value="OUTLET">OUTLET</option>
                <option value="MERCHANT">MERCHANT</option>
                <option value="DRIVER">DRIVER</option>
                <option value="STORE">STORE</option>
                <option value="PRODUCT">PRODUCT</option>
              </select>
            </div>

            <div className="appr-form-group">
              <label className="appr-form-label">
                Approval Level <span className="appr-required">*</span>
              </label>
              <select
                className="appr-form-select"
                name="approvalLevel"
                value={formData.approvalLevel}
                onChange={handleInputChange}
              >
                <option value="Level 1">Level 1</option>
                <option value="Level 2">Level 2</option>
                <option value="Level 3">Level 3</option>
                <option value="Level 4">Level 4</option>
                <option value="Level 5">Level 5</option>
              </select>
            </div>

            <div className="appr-form-group">
              <label className="appr-form-label">
                Approver Role <span className="appr-required">*</span>
              </label>
              <input
                type="text"
                className="appr-form-input"
                name="approverRole"
                value={formData.approverRole}
                onChange={handleInputChange}
                placeholder="e.g. MANAGER, SUPERVISOR, ADMIN"
              />
            </div>

            <div className="appr-form-group">
              <label className="appr-form-label">
                Approver ID <span className="appr-required">*</span>
              </label>
              <input
                type="number"
                className="appr-form-input"
                name="approverId"
                value={formData.approverId}
                onChange={handleInputChange}
                placeholder="e.g. 80, 110, 1"
              />
            </div>

            <div className="appr-form-group">
              <label className="appr-form-label">
                Workflow Type <span className="appr-required">*</span>
              </label>
              <select
                className="appr-form-select"
                name="workflowType"
                value={formData.workflowType}
                onChange={handleInputChange}
              >
                <option value="CASCADE">CASCADE</option>
                <option value="PARALLEL">PARALLEL</option>
              </select>
            </div>

            <div className="appr-form-group">
              <label className="appr-form-label">Time to Escalate (Hours)</label>
              <input
                type="number"
                className="appr-form-input"
                name="timeToEscalateInHours"
                value={formData.timeToEscalateInHours}
                onChange={handleInputChange}
                placeholder="e.g. 24"
              />
            </div>

            <div className="appr-form-group">
              <label className="appr-form-label">Required Approvals Count</label>
              <input
                type="number"
                className="appr-form-input"
                name="requiredApprovalsCount"
                value={formData.requiredApprovalsCount}
                onChange={handleInputChange}
                placeholder="e.g. 1"
              />
            </div>

            <div className="appr-form-group">
              <label className="appr-form-label">Created By (User ID)</label>
              <input
                type="number"
                className="appr-form-input"
                name="createdBy"
                value={formData.createdBy}
                onChange={handleInputChange}
                placeholder="Admin ID (Default 1)"
              />
            </div>

            <div className="appr-form-group">
              <label className="appr-form-label">Workflow Activation & Status</label>
              <div className="appr-checkbox-group">
                <input
                  type="checkbox"
                  id="triggersActivation"
                  className="appr-checkbox-input"
                  name="triggersActivation"
                  checked={formData.triggersActivation}
                  onChange={handleInputChange}
                />
                <label htmlFor="triggersActivation" className="appr-checkbox-label">
                  Triggers Activation
                </label>

                <input
                  type="checkbox"
                  id="isActive"
                  className="appr-checkbox-input"
                  name="isActive"
                  style={{ marginLeft: "15px" }}
                  checked={formData.isActive}
                  onChange={handleInputChange}
                />
                <label htmlFor="isActive" className="appr-checkbox-label">
                  Is Active
                </label>
              </div>
            </div>
          </div>

          <div className="appr-button-wrapper">
            <button type="submit" className="appr-submit-btn" disabled={loading}>
              {loading ? "Creating Setting..." : "+ Create Approval Setting"}
            </button>
          </div>
        </form>
      </div>

      {/* Approval Settings Data Table */}
      <div className="appr-card">
        <div className="appr-card-header">EXISTING APPROVAL SETTINGS</div>

        <div className="appr-table-toolbar">
          <div className="appr-search-box">
            <input
              type="text"
              placeholder="Search by Entity, Level, Role, Approver ID, Workflow..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <span className="appr-count-badge">
            Total Configurations: {filteredSettings.length}
          </span>
        </div>

        <div className="appr-table-wrapper">
          <table className="appr-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Entity Type</th>
                <th>Level</th>
                <th>Role</th>
                <th>Approver ID</th>
                <th>Assigned Areas</th>
                <th>Workflow Type</th>
                <th>Escalation (hrs)</th>
                <th>Req. Approvals</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {fetching ? (
                <tr>
                  <td colSpan="11" className="appr-empty-row">
                    Loading Approval Settings...
                  </td>
                </tr>
              ) : filteredSettings.length > 0 ? (
                filteredSettings.map((item) => (
                  <tr key={item.approvalSettingsId || Math.random()}>
                    <td>
                      <span className="appr-id-badge">
                        #{item.approvalSettingsId || "-"}
                      </span>
                    </td>
                    <td>
                      <span className="appr-entity-badge">
                        {item.entityType || "-"}
                      </span>
                    </td>
                    <td>
                      <span className="appr-level-badge">
                        {item.approvalLevel || "-"}
                      </span>
                    </td>
                    <td>
                      <strong>{item.approverRole || "-"}</strong>
                    </td>
                    <td>
                      <code>ID #{item.approverId ?? "-"}</code>
                    </td>
                    <td>
                      {(() => {
                        const assignedIds = getAssignedAreaIdsForApprover(item);
                        if (assignedIds.length === 0) {
                          return <span style={{ color: "#94a3b8", fontSize: "12px", fontStyle: "italic" }}>No areas</span>;
                        }

                        const allNames = assignedIds.map((id) => {
                          const areaObj = areas.find((a) => Number(a.areaId) === Number(id));
                          return areaObj ? areaObj.areaName : `Area #${id}`;
                        });

                        const visibleNames = allNames.slice(0, 2);
                        const hiddenCount = allNames.length - visibleNames.length;

                        return (
                          <div
                            style={{ display: "flex", flexWrap: "nowrap", alignItems: "center", gap: "4px" }}
                            title={`Assigned Areas (${allNames.length}):\n${allNames.join("\n")}`}
                          >
                            {visibleNames.map((name, idx) => (
                              <span key={idx} className="appr-area-badge">
                                📍 {name}
                              </span>
                            ))}
                            {hiddenCount > 0 && (
                              <span
                                className="appr-area-more-tag"
                                style={{ cursor: "pointer" }}
                                onClick={() => openViewAreasModal(item, allNames)}
                                title={`Click to view all ${allNames.length} assigned areas`}
                              >
                                +{hiddenCount} more
                              </span>
                            )}
                          </div>
                        );
                      })()}
                    </td>
                    <td>
                      <span
                        className={
                          item.workflowType === "PARALLEL"
                            ? "appr-workflow-parallel"
                            : "appr-workflow-cascade"
                        }
                      >
                        {item.workflowType || "CASCADE"}
                      </span>
                    </td>
                    <td>{item.timeToEscalateInHours ?? "-"} h</td>
                    <td>{item.requiredApprovalsCount ?? 1}</td>
                    <td>
                      <span
                        className={
                          item.isActive !== false
                            ? "appr-status-active"
                            : "appr-status-inactive"
                        }
                      >
                        {item.isActive !== false ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <button
                        className="appr-action-replace-btn"
                        onClick={() => openReplaceModal(item)}
                        title="Replace Approver & Transfer Area Mappings"
                      >
                        🔄 Replace Approver
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="appr-empty-row">
                    No Approval Settings Found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Replace Approver Modal */}
      {showReplaceModal && replaceTarget && (
        <div className="appr-modal-overlay">
          <div className="appr-modal">
            <div className="appr-modal-header">
              <h3>
                Replace Approver (Setting #{replaceTarget.approvalSettingsId})
              </h3>
              <button
                className="appr-modal-close"
                onClick={() => {
                  setShowReplaceModal(false);
                  setReplaceTarget(null);
                }}
              >
                ✕
              </button>
            </div>

            <div className="appr-modal-body">
              <div className="appr-modal-info-box">
                <strong>Business Rule:</strong> Replaces existing Approver ID{" "}
                <code>{replaceTarget.approverId}</code> with New Approver. All
                Manager Area mappings will be automatically transferred to the
                New Approver.
              </div>

              <div className="appr-form-group" style={{ marginBottom: "16px" }}>
                <label className="appr-form-label">Entity & Approval Level</label>
                <input
                  type="text"
                  className="appr-form-input"
                  value={`${replaceTarget.entityType || ""} - ${
                    replaceTarget.approvalLevel || ""
                  } (${replaceTarget.workflowType || ""})`}
                  disabled
                  style={{ background: "#f1f5f9" }}
                />
              </div>

              <div className="appr-form-group" style={{ marginBottom: "16px" }}>
                <label className="appr-form-label">
                  New Approver ID <span className="appr-required">*</span>
                </label>
                <input
                  type="number"
                  className="appr-form-input"
                  name="approverId"
                  value={replaceFormData.approverId}
                  onChange={handleReplaceInputChange}
                  placeholder="Enter New Approver ID (e.g. 81)"
                />
              </div>

              <div className="appr-form-group">
                <label className="appr-form-label">Updated By (User ID)</label>
                <input
                  type="number"
                  className="appr-form-input"
                  name="updatedBy"
                  value={replaceFormData.updatedBy}
                  onChange={handleReplaceInputChange}
                  placeholder="Admin/User ID"
                />
              </div>
            </div>

            <div className="appr-modal-footer">
              <button
                className="appr-modal-cancel-btn"
                onClick={() => {
                  setShowReplaceModal(false);
                  setReplaceTarget(null);
                }}
                disabled={replacing}
              >
                Cancel
              </button>
              <button
                className="appr-modal-submit-btn"
                onClick={handleReplaceApprover}
                disabled={replacing}
              >
                {replacing ? "Replacing..." : "Replace Approver & Transfer Areas"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View All Assigned Areas Modal */}
      {showViewAreasModal && viewModalData && (
        <div className="appr-modal-overlay">
          <div className="appr-modal" style={{ maxWidth: "540px" }}>
            <div className="appr-modal-header" style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }}>
              <h3>📍 Assigned Areas (Approver #{viewModalData.approverId})</h3>
              <button
                className="appr-modal-close"
                onClick={() => {
                  setShowViewAreasModal(false);
                  setViewModalData(null);
                }}
              >
                ✕
              </button>
            </div>

            <div className="appr-modal-body">
              <div className="appr-modal-info-box" style={{ borderLeftColor: "#10b981" }}>
                <strong>Approver:</strong> ID #{viewModalData.approverId} | Role: <code>{viewModalData.approverRole || "N/A"}</code> | Level: <code>{viewModalData.approvalLevel || "N/A"}</code>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontSize: "13px", fontWeight: 600, color: "#334155" }}>
                <span>All Assigned Areas:</span>
                <span style={{ color: "#10b981", fontWeight: 700 }}>{viewModalData.areaNames.length} Areas</span>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", maxHeight: "260px", overflowY: "auto", padding: "12px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                {viewModalData.areaNames.map((name, idx) => (
                  <span key={idx} className="appr-area-badge" style={{ fontSize: "12px", padding: "4px 10px", maxWidth: "none" }}>
                    📍 {name}
                  </span>
                ))}
              </div>
            </div>

            <div className="appr-modal-footer">
              <button
                className="appr-modal-cancel-btn"
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

export default ApprovalSettings;
