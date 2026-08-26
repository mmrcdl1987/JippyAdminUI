import { useState, useEffect } from "react";
import {
  getDeliveryRules,
  getDeliveryRuleById,
  saveDeliveryRule,
  deleteDeliveryRule
} from "../services/deliveryChargeService";
import "../styles/DeliveryCharge.css";

const STATUS_OPTIONS = ["ACTIVE", "INACTIVE"];

function DeliveryCharge() {
  const [currentView, setCurrentView] = useState("list");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState(null);

  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState({ message: "", type: "" });

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVehicleFilter, setSelectedVehicleFilter] = useState("All");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPagesServer, setTotalPagesServer] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const [rules, setRules] = useState([]);

  // Delete confirmation modal state
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Dynamically populated options from server and user session
  const [dropdownOptions, setDropdownOptions] = useState({
    serviceTypes: [],
    vehicleTypes: [],
    fuelTypes: [],
    chargeTypes: [],
    deliveryTypes: [],
    driverTypes: [],
    zoneIds: []
  });

  const emptyForm = {
    deliveryChargeSettingId: "",
    kmsRangeFrom: "",
    kmsRangeTo: "",
    unitPricePerKm: "",
    chargeType: "",
    deliveryType: "",
    driverType: "",
    serviceType: "",
    vehicleType: "",
    fuelType: "",
    zoneId: "",
    currencyCode: "INR",
    waitingFreeMinutes: "",
    waitingPerMinute: "",
    nightCharge: "",
    peakCharge: "",
    weatherSurcharge: "",
    remoteAreaCharge: "",
    remoteZoneSurcharge: "",
    status: "ACTIVE",
    createdBy: "",
    updatedBy: ""
  };

  const [formData, setFormData] = useState(emptyForm);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: "", type: "" }), 4000);
  };

  // Helper to fetch logged-in user ID dynamically from session/localStorage
  const getLoggedInUserId = () => {
    try {
      const storedUser = localStorage.getItem("userId") || localStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        return parsed.id || parsed.userId || Number(storedUser) || 101;
      }
    } catch {
      const rawId = localStorage.getItem("userId");
      if (rawId) return Number(rawId);
    }
    return 101; // Default fallback if no session found
  };

  useEffect(() => {
    loadRulesData(currentPage - 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const loadRulesData = async (pageIndex = 0) => {
    try {
      setLoading(true);
      const res = await getDeliveryRules({ page: pageIndex, size: itemsPerPage });

      const pageContent = res?.content || [];
      setTotalPagesServer(res?.totalPages || 1);
      setTotalElements(res?.totalElements ?? pageContent.length);

      const formattedRules = pageContent.map((item) => ({
        ...item,
        id: item.deliveryChargeSettingId,
        rangeKm: `${item.kmsRangeFrom} - ${item.kmsRangeTo}`
      }));

      setRules(formattedRules);

      // Dynamically map all unique fields from existing data to power selects
      setDropdownOptions({
        serviceTypes: [...new Set(pageContent.map((item) => item.serviceType).filter(Boolean))],
        vehicleTypes: [...new Set(pageContent.map((item) => item.vehicleType).filter(Boolean))],
        fuelTypes: [...new Set(pageContent.map((item) => item.fuelType).filter(Boolean))],
        chargeTypes: [...new Set(pageContent.map((item) => item.chargeType).filter(Boolean))],
        deliveryTypes: [...new Set(pageContent.map((item) => item.deliveryType).filter(Boolean))],
        driverTypes: [...new Set(pageContent.map((item) => item.driverType).filter(Boolean))],
        zoneIds: [...new Set(pageContent.map((item) => item.zoneId).filter((val) => val !== null && val !== undefined))]
      });
    } catch (error) {
      console.error("Error loading rules:", error);
      showNotification("Failed to fetch delivery charge rules.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenAdd = () => {
    const currentUserId = getLoggedInUserId();
    setFormData({
      ...emptyForm,
      chargeType: dropdownOptions.chargeTypes[0] || "PER_KM",
      deliveryType: dropdownOptions.deliveryTypes[0] || "STANDARD",
      driverType: dropdownOptions.driverTypes[0] || "FULL_TIME",
      serviceType: dropdownOptions.serviceTypes[0] || "",
      vehicleType: dropdownOptions.vehicleTypes[0] || "",
      fuelType: dropdownOptions.fuelTypes[0] || "",
      zoneId: dropdownOptions.zoneIds[0] || "",
      createdBy: currentUserId,
      updatedBy: currentUserId
    });
    setSelectedRule(null);
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (rule) => {
    const currentUserId = getLoggedInUserId();
    setSelectedRule(rule);
    setFormData({
      deliveryChargeSettingId: rule.deliveryChargeSettingId || "",
      kmsRangeFrom: rule.kmsRangeFrom ?? "",
      kmsRangeTo: rule.kmsRangeTo ?? "",
      unitPricePerKm: rule.unitPricePerKm ?? "",
      chargeType: rule.chargeType || "",
      deliveryType: rule.deliveryType || "",
      driverType: rule.driverType || "",
      serviceType: rule.serviceType || "",
      vehicleType: rule.vehicleType || "",
      fuelType: rule.fuelType || "",
      zoneId: rule.zoneId ?? "",
      currencyCode: rule.currencyCode || "INR",
      waitingFreeMinutes: rule.waitingFreeMinutes ?? "",
      waitingPerMinute: rule.waitingPerMinute ?? "",
      nightCharge: rule.nightCharge ?? "",
      peakCharge: rule.peakCharge ?? "",
      weatherSurcharge: rule.weatherSurcharge ?? "",
      remoteAreaCharge: rule.remoteAreaCharge ?? "",
      remoteZoneSurcharge: rule.remoteZoneSurcharge ?? "",
      status: rule.status || "ACTIVE",
      createdBy: rule.createdBy || currentUserId,
      updatedBy: currentUserId
    });
    setIsDrawerOpen(true);
  };

  const handleOpenDetail = async (rule) => {
    try {
      setActionLoading(true);
      const item = await getDeliveryRuleById(rule.deliveryChargeSettingId);

      setSelectedRule({
        ...item,
        id: item.deliveryChargeSettingId,
        rangeKm: `${item.kmsRangeFrom} - ${item.kmsRangeTo}`
      });
      setCurrentView("detail");
    } catch (error) {
      showNotification("Failed to fetch rule details.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setActionLoading(true);
      await deleteDeliveryRule(deleteTarget.deliveryChargeSettingId);
      showNotification("Delivery rule deleted successfully!");
      setDeleteTarget(null);
      if (currentView === "detail") setCurrentView("list");
      loadRulesData(currentPage - 1);
    } catch (error) {
      showNotification("Failed to delete record.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveRule = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const currentUserId = getLoggedInUserId();

      const payload = {
        ...(selectedRule && selectedRule.deliveryChargeSettingId
          ? { deliveryChargeSettingId: Number(selectedRule.deliveryChargeSettingId) }
          : {}),
        zoneId: Number(formData.zoneId),
        kmsRangeFrom: Number(formData.kmsRangeFrom),
        kmsRangeTo: Number(formData.kmsRangeTo),
        unitPricePerKm: Number(formData.unitPricePerKm),
        chargeType: formData.chargeType,
        deliveryType: formData.deliveryType,
        driverType: formData.driverType,
        serviceType: formData.serviceType,
        vehicleType: formData.vehicleType,
        fuelType: formData.fuelType,
        currencyCode: formData.currencyCode,
        waitingFreeMinutes: Number(formData.waitingFreeMinutes) || 0,
        waitingPerMinute: Number(formData.waitingPerMinute) || 0,
        nightCharge: Number(formData.nightCharge) || 0,
        peakCharge: Number(formData.peakCharge) || 0,
        weatherSurcharge: Number(formData.weatherSurcharge) || 0,
        remoteAreaCharge: Number(formData.remoteAreaCharge) || 0,
        remoteZoneSurcharge: Number(formData.remoteZoneSurcharge) || 0,
        status: formData.status,
        createdBy: Number(formData.createdBy || currentUserId),
        updatedBy: Number(currentUserId)
      };

      await saveDeliveryRule(payload);
      showNotification("Delivery rule saved successfully!");
      setIsDrawerOpen(false);
      loadRulesData(currentPage - 1);
    } catch (error) {
      showNotification("Failed to save delivery rule.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredRules = rules.filter((rule) => {
    const matchesSearch =
      rule.deliveryChargeSettingId?.toString().includes(searchTerm) ||
      rule.serviceType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.vehicleType?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVehicle = selectedVehicleFilter === "All" || rule.vehicleType === selectedVehicleFilter;
    return matchesSearch && matchesVehicle;
  });

  const activeCount = rules.filter((r) => r.status === "ACTIVE").length;
  const zoneCount = dropdownOptions.zoneIds.length;

  const rangeStart = totalElements === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const rangeEnd = Math.min(currentPage * itemsPerPage, totalElements);

  const pageNumbers = Array.from({ length: totalPagesServer }, (_, i) => i + 1).slice(0, 5);

  return (
    <div className="jmart-main-standalone">
      <header className="jmart-header">
        <span className="jmart-menu-trigger">&#9776;</span>
        <div className="jmart-header-right">
          <span className="jmart-notify">
            &#128276;
            <span className="jmart-notify-badge">3</span>
          </span>
          <span className="jmart-user-dropdown">Admin User &#9662;</span>
        </div>
      </header>

      {notification.message && (
        <div className={`jmart-toast ${notification.type === "error" ? "error" : "success"}`}>
          {notification.message}
        </div>
      )}

      <div className="jmart-content-body">
        {currentView === "list" && (
          <>
            <div className="jmart-page-title-row">
              <div>
                <h1 className="jmart-title">Delivery Charge Settings</h1>
                <p className="jmart-breadcrumb">Pricing &gt; Delivery Charge Settings</p>
              </div>
            </div>

            <div className="jmart-kpi-grid">
              <div className="jmart-kpi-card">
                <div className="jmart-kpi-icon blue">&#128203;</div>
                <div>
                  <p className="kpi-label">Total Rules</p>
                  <p className="kpi-val">{totalElements}</p>
                  <p className="kpi-sub">Across all zones</p>
                </div>
              </div>
              <div className="jmart-kpi-card">
                <div className="jmart-kpi-icon green">&#10003;</div>
                <div>
                  <p className="kpi-label">Active Rules</p>
                  <p className="kpi-val">{activeCount}</p>
                  <p className="kpi-sub">On this page</p>
                </div>
              </div>
              <div className="jmart-kpi-card">
                <div className="jmart-kpi-icon orange">&#128205;</div>
                <div>
                  <p className="kpi-label">Zones</p>
                  <p className="kpi-val">{zoneCount}</p>
                  <p className="kpi-sub">Configured zones</p>
                </div>
              </div>
            </div>

            <div className="jmart-table-card">
              <div className="jmart-table-toolbar">
                <div className="jmart-search-box">
                  <span className="search-icon">&#128269;</span>
                  <input
                    type="text"
                    placeholder="Search ID, Service, Vehicle..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="jmart-toolbar-right">
                  <select
                    className="jmart-select"
                    value={selectedVehicleFilter}
                    onChange={(e) => setSelectedVehicleFilter(e.target.value)}
                  >
                    <option value="All">All Vehicles</option>
                    {dropdownOptions.vehicleTypes.map((v, i) => (
                      <option key={i} value={v}>{v}</option>
                    ))}
                  </select>
                  <button className="jmart-btn-primary" onClick={handleOpenAdd}>
                    + Add Setting
                  </button>
                </div>
              </div>

              <div className="jmart-table-container">
                {loading ? (
                  <div className="jmart-loading-state">Loading records...</div>
                ) : (
                  <table className="jmart-data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>ZONE</th>
                        <th>KM RANGE</th>
                        <th>UNIT PRICE</th>
                        <th>SERVICE / VEHICLE</th>
                        <th>STATUS</th>
                        <th className="text-center">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRules.length > 0 ? (
                        filteredRules.map((rule) => (
                          <tr key={rule.deliveryChargeSettingId}>
                            <td className="jmart-id-cell">#{rule.deliveryChargeSettingId}</td>
                            <td>Zone {rule.zoneId}</td>
                            <td>
                              {rule.rangeKm} KM
                              <span className="jmart-subtext">{rule.chargeType}</span>
                            </td>
                            <td>{rule.currencyCode || "INR"} {rule.unitPricePerKm}</td>
                            <td>
                              {rule.serviceType} / {rule.vehicleType}
                              <span className="jmart-subtext">{rule.fuelType}</span>
                            </td>
                            <td>
                              <span className={`status-badge ${rule.status === "ACTIVE" ? "active" : "inactive"}`}>
                                {rule.status}
                              </span>
                            </td>
                            <td>
                              <div className="action-col">
                                <button
                                  className="act-btn view"
                                  onClick={() => handleOpenDetail(rule)}
                                  disabled={actionLoading}
                                  title="View"
                                >
                                  &#128065;
                                </button>
                                <button
                                  className="act-btn edit"
                                  onClick={() => handleOpenEdit(rule)}
                                  title="Edit"
                                >
                                  &#9998;
                                </button>
                                <button
                                  className="act-btn delete"
                                  onClick={() => setDeleteTarget(rule)}
                                  title="Delete"
                                >
                                  &#128465;
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7">
                            <div className="jmart-empty-state">
                              <span>&#128230;</span>
                              No delivery charge rules found.
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="jmart-table-footer">
                <span>
                  Showing {rangeStart} to {rangeEnd} of {totalElements} entries
                </span>
                <div className="pagination">
                  <button
                    className="page-btn"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    &lsaquo;
                  </button>
                  {pageNumbers.map((num) => (
                    <button
                      key={num}
                      className={`page-btn ${currentPage === num ? "active" : ""}`}
                      onClick={() => setCurrentPage(num)}
                    >
                      {num}
                    </button>
                  ))}
                  <button
                    className="page-btn"
                    onClick={() => setCurrentPage((p) => Math.min(totalPagesServer, p + 1))}
                    disabled={currentPage === totalPagesServer}
                  >
                    &rsaquo;
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {currentView === "detail" && selectedRule && (
          <div className="jmart-detail-card">
            <div className="detail-top-nav">
              <button className="back-link" onClick={() => setCurrentView("list")}>
                &larr; Back to List
              </button>
              <div className="detail-action-top">
                <button className="jmart-btn-secondary" onClick={() => handleOpenEdit(selectedRule)}>
                  Edit
                </button>
                <button className="jmart-btn-danger" onClick={() => setDeleteTarget(selectedRule)}>
                  Delete
                </button>
              </div>
            </div>

            <div className="detail-heading">
              <h2>Delivery Setting Details (ID: #{selectedRule.deliveryChargeSettingId})</h2>
              <span className={`status-badge ${selectedRule.status === "ACTIVE" ? "active" : "inactive"}`}>
                {selectedRule.status}
              </span>
            </div>

            <div className="overview-grid">
              <div>
                <p className="lbl">Zone ID</p>
                <p>Zone {selectedRule.zoneId}</p>
              </div>
              <div>
                <p className="lbl">KM Range</p>
                <p>{selectedRule.rangeKm} KM</p>
              </div>
              <div>
                <p className="lbl">Unit Price / KM</p>
                <p>{selectedRule.currencyCode} {selectedRule.unitPricePerKm}</p>
              </div>
            </div>

            <div className="detail-pricing-row">
              <div className="mini-box">
                <h5 className="blue">Service Details</h5>
                <p><span>Charge Type</span><span>{selectedRule.chargeType || "-"}</span></p>
                <p><span>Delivery Type</span><span>{selectedRule.deliveryType || "-"}</span></p>
                <p><span>Driver Type</span><span>{selectedRule.driverType || "-"}</span></p>
                <p><span>Service Type</span><span>{selectedRule.serviceType || "-"}</span></p>
                <p><span>Vehicle Type</span><span>{selectedRule.vehicleType || "-"}</span></p>
                <p><span>Fuel Type</span><span>{selectedRule.fuelType || "-"}</span></p>
              </div>
              <div className="mini-box">
                <h5 className="green">Charges &amp; Waiting Time</h5>
                <p><span>Waiting Free Mins</span><span>{selectedRule.waitingFreeMinutes ?? 0}</span></p>
                <p><span>Waiting / Min</span><span>{selectedRule.waitingPerMinute ?? 0}</span></p>
                <p><span>Night Charge</span><span>{selectedRule.nightCharge ?? 0}</span></p>
                <p><span>Peak Charge</span><span>{selectedRule.peakCharge ?? 0}</span></p>
                <p><span>Weather Surcharge</span><span>{selectedRule.weatherSurcharge ?? 0}</span></p>
                <p><span>Remote Area Charge</span><span>{selectedRule.remoteAreaCharge ?? 0}</span></p>
                <p><span>Remote Zone Surcharge</span><span>{selectedRule.remoteZoneSurcharge ?? 0}</span></p>
              </div>
            </div>

            <div className="detail-section-block">
              <h4>Audit Information</h4>
              <div className="overview-grid">
                <div>
                  <p className="lbl">Created By</p>
                  <p>{selectedRule.createdBy ?? "-"}</p>
                </div>
                <div>
                  <p className="lbl">Updated By</p>
                  <p>{selectedRule.updatedBy ?? "-"}</p>
                </div>
                <div>
                  <p className="lbl">Currency</p>
                  <p>{selectedRule.currencyCode || "INR"}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {isDrawerOpen && (
        <div className="jmart-drawer-backdrop" onClick={() => setIsDrawerOpen(false)}>
          <div className="jmart-side-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="jmart-form-container-card">
              <div className="form-top-row">
                <h2>{!selectedRule ? "Add Delivery Charge Setting" : `Edit Setting (ID: #${selectedRule.deliveryChargeSettingId})`}</h2>
                <button className="close-x" onClick={() => setIsDrawerOpen(false)}>&times;</button>
              </div>

              <div className="jmart-note-box">
                <span className="info-icon">&#9432;</span>
                <span>Ensure the KM range does not overlap with existing rules for the same zone.</span>
              </div>

              <form onSubmit={handleSaveRule}>
                <div className="pricing-section-box">
                  <p className="section-subtitle blue">Zone &amp; Distance Range</p>

                  <div className="jmart-field-group">
                    <label className="jmart-label">Zone ID <span className="req">*</span></label>
                    <select
                      className="jmart-select"
                      style={{ width: "100%" }}
                      name="zoneId"
                      value={formData.zoneId}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Zone</option>
                      {dropdownOptions.zoneIds.map((z, i) => (
                        <option key={i} value={z}>Zone {z}</option>
                      ))}
                    </select>
                  </div>

                  <div className="pricing-grid-3">
                    <div className="jmart-field-group">
                      <label className="jmart-label">KM Range From <span className="req">*</span></label>
                      <input
                        className="jmart-input"
                        type="number"
                        step="0.01"
                        name="kmsRangeFrom"
                        value={formData.kmsRangeFrom}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="jmart-field-group">
                      <label className="jmart-label">KM Range To <span className="req">*</span></label>
                      <input
                        className="jmart-input"
                        type="number"
                        step="0.01"
                        name="kmsRangeTo"
                        value={formData.kmsRangeTo}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="jmart-field-group">
                      <label className="jmart-label">Unit Price / KM <span className="req">*</span></label>
                      <input
                        className="jmart-input"
                        type="number"
                        step="0.01"
                        name="unitPricePerKm"
                        value={formData.unitPricePerKm}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="pricing-section-box">
                  <p className="section-subtitle green">Service Details</p>

                  <div className="pricing-grid-3">
                    <div className="jmart-field-group">
                      <label className="jmart-label">Service Type</label>
                      <select className="jmart-select" style={{ width: "100%" }} name="serviceType" value={formData.serviceType} onChange={handleInputChange}>
                        <option value="">Select Service</option>
                        {dropdownOptions.serviceTypes.map((s, i) => <option key={i} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="jmart-field-group">
                      <label className="jmart-label">Vehicle Type</label>
                      <select className="jmart-select" style={{ width: "100%" }} name="vehicleType" value={formData.vehicleType} onChange={handleInputChange}>
                        <option value="">Select Vehicle</option>
                        {dropdownOptions.vehicleTypes.map((v, i) => <option key={i} value={v}>{v}</option>)}
                      </select>
                    </div>
                    <div className="jmart-field-group">
                      <label className="jmart-label">Fuel Type</label>
                      <select className="jmart-select" style={{ width: "100%" }} name="fuelType" value={formData.fuelType} onChange={handleInputChange}>
                        <option value="">Select Fuel</option>
                        {dropdownOptions.fuelTypes.map((f, i) => <option key={i} value={f}>{f}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="pricing-grid-3" style={{ marginTop: "16px" }}>
                    <div className="jmart-field-group">
                      <label className="jmart-label">Charge Type</label>
                      <select className="jmart-select" style={{ width: "100%" }} name="chargeType" value={formData.chargeType} onChange={handleInputChange}>
                        <option value="">Select Charge Type</option>
                        {dropdownOptions.chargeTypes.map((c, i) => <option key={i} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="jmart-field-group">
                      <label className="jmart-label">Delivery Type</label>
                      <select className="jmart-select" style={{ width: "100%" }} name="deliveryType" value={formData.deliveryType} onChange={handleInputChange}>
                        <option value="">Select Delivery Type</option>
                        {dropdownOptions.deliveryTypes.map((d, i) => <option key={i} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div className="jmart-field-group">
                      <label className="jmart-label">Driver Type</label>
                      <select className="jmart-select" style={{ width: "100%" }} name="driverType" value={formData.driverType} onChange={handleInputChange}>
                        <option value="">Select Driver Type</option>
                        {dropdownOptions.driverTypes.map((d, i) => <option key={i} value={d}>{d}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pricing-section-box">
                  <p className="section-subtitle orange">Charges &amp; Surcharges</p>

                  <div className="pricing-grid-3">
                    <div className="jmart-field-group">
                      <label className="jmart-label">Currency Code</label>
                      <input className="jmart-input" type="text" name="currencyCode" value={formData.currencyCode} onChange={handleInputChange} />
                    </div>
                    <div className="jmart-field-group">
                      <label className="jmart-label">Waiting Free Minutes</label>
                      <input className="jmart-input" type="number" name="waitingFreeMinutes" value={formData.waitingFreeMinutes} onChange={handleInputChange} />
                    </div>
                    <div className="jmart-field-group">
                      <label className="jmart-label">Waiting / Minute</label>
                      <input className="jmart-input" type="number" step="0.01" name="waitingPerMinute" value={formData.waitingPerMinute} onChange={handleInputChange} />
                    </div>
                  </div>

                  <div className="pricing-grid-3" style={{ marginTop: "16px" }}>
                    <div className="jmart-field-group">
                      <label className="jmart-label">Night Charge</label>
                      <input className="jmart-input" type="number" step="0.01" name="nightCharge" value={formData.nightCharge} onChange={handleInputChange} />
                    </div>
                    <div className="jmart-field-group">
                      <label className="jmart-label">Peak Charge</label>
                      <input className="jmart-input" type="number" step="0.01" name="peakCharge" value={formData.peakCharge} onChange={handleInputChange} />
                    </div>
                    <div className="jmart-field-group">
                      <label className="jmart-label">Weather Surcharge</label>
                      <input className="jmart-input" type="number" step="0.01" name="weatherSurcharge" value={formData.weatherSurcharge} onChange={handleInputChange} />
                    </div>
                  </div>

                  <div className="pricing-grid-3" style={{ marginTop: "16px" }}>
                    <div className="jmart-field-group">
                      <label className="jmart-label">Remote Area Charge</label>
                      <input className="jmart-input" type="number" step="0.01" name="remoteAreaCharge" value={formData.remoteAreaCharge} onChange={handleInputChange} />
                    </div>
                    <div className="jmart-field-group">
                      <label className="jmart-label">Remote Zone Surcharge</label>
                      <input className="jmart-input" type="number" step="0.01" name="remoteZoneSurcharge" value={formData.remoteZoneSurcharge} onChange={handleInputChange} />
                    </div>
                    <div className="jmart-field-group">
                      <label className="jmart-label">Status</label>
                      <select className="jmart-select" style={{ width: "100%" }} name="status" value={formData.status} onChange={handleInputChange}>
                        {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-action-buttons">
                  <button type="button" className="jmart-btn-secondary" onClick={() => setIsDrawerOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="jmart-btn-primary" disabled={actionLoading}>
                    {actionLoading ? "Saving..." : "Save Setting"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="jmart-modal-backdrop" onClick={() => setDeleteTarget(null)}>
          <div className="jmart-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="warning-circle">&#9888;</div>
            <h3>Delete Rule</h3>
            <p>
              Are you sure you want to delete rule #{deleteTarget.deliveryChargeSettingId}?
              This action cannot be undone.
            </p>
            <div className="modal-btns">
              <button className="jmart-btn-secondary" onClick={() => setDeleteTarget(null)} disabled={actionLoading}>
                Cancel
              </button>
              <button className="jmart-btn-danger" onClick={handleConfirmDelete} disabled={actionLoading}>
                {actionLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DeliveryCharge;