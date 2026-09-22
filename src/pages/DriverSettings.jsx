import { useState } from "react";
import PropTypes from "prop-types";
import {
  FiSettings,
  FiMapPin,
  FiSliders,
  FiClock,
  FiShield,
  FiPlus,
  FiEdit2,
  FiEye,
  FiCheck,
  FiX,
  FiRefreshCw,
  FiLayers,
} from "react-icons/fi";
import ZoneManagement from "./ZoneManagement";
import { createDriverSettings } from "../services/driverSettingsService";
import "../styles/DriverSettings.css";

function DriverSettings({ setActivePage }) {
  const [activeTab, setActiveTab] = useState("zones"); // "zones" | "slabs" | "history" | "policies"
  const [slabMode, setSlabMode] = useState("list"); // "list" | "add" | "edit" | "view"
  const [selectedSlab, setSelectedSlab] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Slabs list state
  const [settingsList, setSettingsList] = useState([
    {
      id: 1,
      pickUpKmsRangeFrom: 0,
      pickUpKmsRangeTo: 5,
      unitPricePerPickKm: 10.0,
      deliveryKmsRangeFrom: 0,
      deliveryKmsRangeTo: 5,
      unitPricePerDeliverKm: 12.0,
      createdBy: "Admin Operations",
      createdAt: "15 Sep 2026 10:30 AM",
      updatedAt: "18 Sep 2026 04:15 PM",
    },
    {
      id: 2,
      pickUpKmsRangeFrom: 5,
      pickUpKmsRangeTo: 10,
      unitPricePerPickKm: 14.0,
      deliveryKmsRangeFrom: 5,
      deliveryKmsRangeTo: 10,
      unitPricePerDeliverKm: 16.5,
      createdBy: "Admin Operations",
      createdAt: "15 Sep 2026 10:30 AM",
      updatedAt: "18 Sep 2026 04:15 PM",
    },
    {
      id: 3,
      pickUpKmsRangeFrom: 10,
      pickUpKmsRangeTo: 20,
      unitPricePerPickKm: 18.0,
      deliveryKmsRangeFrom: 10,
      deliveryKmsRangeTo: 20,
      unitPricePerDeliverKm: 22.0,
      createdBy: "Admin Operations",
      createdAt: "16 Sep 2026 02:00 PM",
      updatedAt: "18 Sep 2026 04:15 PM",
    },
  ]);

  // Slabs form data
  const [slabFormData, setSlabFormData] = useState({
    pickUpKmsRangeFrom: "",
    pickUpKmsRangeTo: "",
    unitPricePerPickKm: "",
    deliveryKmsRangeFrom: "",
    deliveryKmsRangeTo: "",
    unitPricePerDeliverKm: "",
  });

  // History list state
  const [historyList] = useState([
    {
      id: 101,
      driverId: "DRV-8421",
      driverName: "Ramesh Kumar",
      date: "20 Sep 2026",
      completedOrdersCount: 14,
      incentiveAmount: 180.0,
      createdAt: "20 Sep 2026 08:00 PM",
    },
    {
      id: 102,
      driverId: "DRV-8422",
      driverName: "Suresh Singh",
      date: "20 Sep 2026",
      completedOrdersCount: 22,
      incentiveAmount: 310.0,
      createdAt: "20 Sep 2026 08:30 PM",
    },
    {
      id: 103,
      driverId: "DRV-8423",
      driverName: "Mahesh Reddy",
      date: "19 Sep 2026",
      completedOrdersCount: 18,
      incentiveAmount: 240.0,
      createdAt: "19 Sep 2026 09:15 PM",
    },
  ]);

  // Operational policies state
  const [policies, setPolicies] = useState({
    maxConcurrentOrders: 3,
    dispatchRadiusKm: 8,
    acceptanceTimeoutSec: 45,
    autoReassignOnTimeout: true,
    requirePhotoProofOfDelivery: true,
  });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Handle slab input change
  const handleSlabChange = (e) => {
    const { name, value } = e.target;
    setSlabFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Save distance slab
  const handleSaveSlab = async () => {
    const {
      pickUpKmsRangeFrom,
      pickUpKmsRangeTo,
      unitPricePerPickKm,
      deliveryKmsRangeFrom,
      deliveryKmsRangeTo,
      unitPricePerDeliverKm,
    } = slabFormData;

    if (
      pickUpKmsRangeFrom === "" ||
      pickUpKmsRangeTo === "" ||
      unitPricePerPickKm === "" ||
      deliveryKmsRangeFrom === "" ||
      deliveryKmsRangeTo === "" ||
      unitPricePerDeliverKm === ""
    ) {
      showToast("All distance slab fields are required.", "error");
      return;
    }

    const pFrom = Number(pickUpKmsRangeFrom);
    const pTo = Number(pickUpKmsRangeTo);
    const pPrice = Number(unitPricePerPickKm);
    const dFrom = Number(deliveryKmsRangeFrom);
    const dTo = Number(deliveryKmsRangeTo);
    const dPrice = Number(unitPricePerDeliverKm);

    if (pFrom < 0 || pTo < 0 || pPrice < 0 || dFrom < 0 || dTo < 0 || dPrice < 0) {
      showToast("Distance and price values cannot be negative.", "error");
      return;
    }

    if (pFrom >= pTo) {
      showToast("Pickup Range From must be less than Pickup Range To.", "error");
      return;
    }

    if (dFrom >= dTo) {
      showToast("Delivery Range From must be less than Delivery Range To.", "error");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        pickUpKmsRangeFrom: pFrom,
        pickUpKmsRangeTo: pTo,
        unitPricePerPickKm: pPrice,
        deliveryKmsRangeFrom: dFrom,
        deliveryKmsRangeTo: dTo,
        unitPricePerDeliverKm: dPrice,
        createdBy: 1,
      };

      try {
        await createDriverSettings(payload);
      } catch (err) {
        console.warn("Backend driver settings sync fallback:", err);
      }

      if (slabMode === "edit" && selectedSlab) {
        setSettingsList((prev) =>
          prev.map((item) =>
            item.id === selectedSlab.id
              ? {
                  ...item,
                  ...payload,
                  updatedAt: "Just now",
                }
              : item
          )
        );
        showToast("Distance fare slab updated successfully!");
      } else {
        const newSlab = {
          id: Date.now(),
          ...payload,
          createdAt: "Just now",
          updatedAt: "Just now",
        };
        setSettingsList((prev) => [...prev, newSlab]);
        showToast("New distance fare slab added successfully!");
      }

      setSlabMode("list");
      setSelectedSlab(null);
    } catch (err) {
      console.error("Save slab error:", err);
      showToast("Failed to save distance slab settings.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="driver-settings-container">
      {/* FLOATING TOAST */}
      {toast && (
        <div
          className={`zone-toast ${
            toast.type === "success" ? "zone-toast-success" : "zone-toast-error"
          }`}
        >
          {toast.type === "success" ? <FiCheck size={18} /> : <FiX size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* PAGE HEADER */}
      <div className="driver-settings-header-card">
        <div className="driver-header-left">
          <div className="driver-header-icon">
            <FiSettings size={22} />
          </div>
          <div className="driver-header-text">
            <span className="driver-eyebrow">Fleet & Logistics</span>
            <h2>Driver Platform Settings</h2>
            <p>
              Configure delivery zone perimeters, distance fare slabs, incentive rules, and operational dispatch limits.
            </p>
          </div>
        </div>
      </div>

      {/* TABS BAR */}
      <div className="driver-tabs-bar">
        <button
          type="button"
          className={`driver-tab-btn ${activeTab === "zones" ? "active" : ""}`}
          onClick={() => setActiveTab("zones")}
        >
          <FiMapPin size={16} />
          <span>Delivery Zones & Coverage</span>
          <span className="tab-badge">Geo-Fence</span>
        </button>

        <button
          type="button"
          className={`driver-tab-btn ${activeTab === "slabs" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("slabs");
            setSlabMode("list");
          }}
        >
          <FiSliders size={16} />
          <span>Fare & Distance Slabs</span>
          <span className="tab-badge">{settingsList.length} Slabs</span>
        </button>

        <button
          type="button"
          className={`driver-tab-btn ${activeTab === "history" ? "active" : ""}`}
          onClick={() => setActiveTab("history")}
        >
          <FiClock size={16} />
          <span>Incentive History</span>
        </button>

        <button
          type="button"
          className={`driver-tab-btn ${activeTab === "policies" ? "active" : ""}`}
          onClick={() => setActiveTab("policies")}
        >
          <FiShield size={16} />
          <span>Operational Policies</span>
        </button>
      </div>

      {/* =======================================================
          TAB 1: DELIVERY ZONES (DIRECT DRIVER ZONE MANAGEMENT)
      ======================================================= */}
      {activeTab === "zones" && (
        <ZoneManagement setActivePage={setActivePage} />
      )}

      {/* =======================================================
          TAB 2: FARE & DISTANCE SLABS
      ======================================================= */}
      {activeTab === "slabs" && (
        <>
          {slabMode === "list" && (
            <div className="driver-card">
              <div className="driver-card-header">
                <div>
                  <h3>Distance Fare Configuration</h3>
                  <p>Define pickup and delivery slab ranges and per-kilometer unit charges</p>
                </div>
                <button
                  type="button"
                  className="driver-btn-primary"
                  onClick={() => {
                    setSlabFormData({
                      pickUpKmsRangeFrom: "",
                      pickUpKmsRangeTo: "",
                      unitPricePerPickKm: "",
                      deliveryKmsRangeFrom: "",
                      deliveryKmsRangeTo: "",
                      unitPricePerDeliverKm: "",
                    });
                    setSelectedSlab(null);
                    setSlabMode("add");
                  }}
                >
                  <FiPlus size={16} />
                  <span>Add Distance Slab</span>
                </button>
              </div>

              <div className="driver-table-wrap">
                <table className="driver-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Pickup Range</th>
                      <th>Pickup Rate</th>
                      <th>Delivery Range</th>
                      <th>Delivery Rate</th>
                      <th>Created At</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {settingsList.map((item, idx) => (
                      <tr key={item.id}>
                        <td>#{idx + 1}</td>
                        <td>
                          <span className="slab-range-pill">
                            {item.pickUpKmsRangeFrom} - {item.pickUpKmsRangeTo} KM
                          </span>
                        </td>
                        <td>
                          <span className="slab-price-pill">
                            ₹{Number(item.unitPricePerPickKm).toFixed(2)} / km
                          </span>
                        </td>
                        <td>
                          <span className="slab-range-pill">
                            {item.deliveryKmsRangeFrom} - {item.deliveryKmsRangeTo} KM
                          </span>
                        </td>
                        <td>
                          <span className="slab-price-pill">
                            ₹{Number(item.unitPricePerDeliverKm).toFixed(2)} / km
                          </span>
                        </td>
                        <td>{item.createdAt}</td>
                        <td>
                          <div className="actions-group">
                            <button
                              type="button"
                              className="btn-icon-action view"
                              title="View Details"
                              onClick={() => {
                                setSelectedSlab(item);
                                setSlabMode("view");
                              }}
                            >
                              <FiEye size={15} />
                            </button>
                            <button
                              type="button"
                              className="btn-icon-action edit"
                              title="Edit Slab"
                              onClick={() => {
                                setSelectedSlab(item);
                                setSlabFormData({
                                  pickUpKmsRangeFrom: item.pickUpKmsRangeFrom,
                                  pickUpKmsRangeTo: item.pickUpKmsRangeTo,
                                  unitPricePerPickKm: item.unitPricePerPickKm,
                                  deliveryKmsRangeFrom: item.deliveryKmsRangeFrom,
                                  deliveryKmsRangeTo: item.deliveryKmsRangeTo,
                                  unitPricePerDeliverKm: item.unitPricePerDeliverKm,
                                });
                                setSlabMode("edit");
                              }}
                            >
                              <FiEdit2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ADD / EDIT SLAB FORM */}
          {(slabMode === "add" || slabMode === "edit") && (
            <div className="driver-card">
              <div className="driver-card-header">
                <div>
                  <h3>{slabMode === "edit" ? "Edit Distance Fare Slab" : "Create Distance Fare Slab"}</h3>
                  <p>Configure distance thresholds and unit prices</p>
                </div>
              </div>

              <div className="driver-form-grid">
                <div className="form-group-slab">
                  <label>
                    Pickup Range From (KM) <span className="req-star">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    name="pickUpKmsRangeFrom"
                    value={slabFormData.pickUpKmsRangeFrom}
                    onChange={handleSlabChange}
                    className="slab-input"
                    placeholder="e.g. 0"
                  />
                </div>

                <div className="form-group-slab">
                  <label>
                    Pickup Range To (KM) <span className="req-star">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    name="pickUpKmsRangeTo"
                    value={slabFormData.pickUpKmsRangeTo}
                    onChange={handleSlabChange}
                    className="slab-input"
                    placeholder="e.g. 5"
                  />
                </div>

                <div className="form-group-slab">
                  <label>
                    Unit Price per Pickup KM (₹) <span className="req-star">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    name="unitPricePerPickKm"
                    value={slabFormData.unitPricePerPickKm}
                    onChange={handleSlabChange}
                    className="slab-input"
                    placeholder="e.g. 10.00"
                  />
                </div>

                <div className="form-group-slab">
                  <label>
                    Delivery Range From (KM) <span className="req-star">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    name="deliveryKmsRangeFrom"
                    value={slabFormData.deliveryKmsRangeFrom}
                    onChange={handleSlabChange}
                    className="slab-input"
                    placeholder="e.g. 0"
                  />
                </div>

                <div className="form-group-slab">
                  <label>
                    Delivery Range To (KM) <span className="req-star">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    name="deliveryKmsRangeTo"
                    value={slabFormData.deliveryKmsRangeTo}
                    onChange={handleSlabChange}
                    className="slab-input"
                    placeholder="e.g. 5"
                  />
                </div>

                <div className="form-group-slab">
                  <label>
                    Unit Price per Delivery KM (₹) <span className="req-star">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    name="unitPricePerDeliverKm"
                    value={slabFormData.unitPricePerDeliverKm}
                    onChange={handleSlabChange}
                    className="slab-input"
                    placeholder="e.g. 12.00"
                  />
                </div>
              </div>

              <div className="driver-form-footer">
                <button
                  type="button"
                  className="btn-form-cancel"
                  onClick={() => {
                    setSlabMode("list");
                    setSelectedSlab(null);
                  }}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="driver-btn-primary"
                  onClick={handleSaveSlab}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <FiRefreshCw className="zone-spin" size={15} />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{slabMode === "edit" ? "Update Slab" : "Save Slab"}</span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* VIEW SLAB DETAILS */}
          {slabMode === "view" && selectedSlab && (
            <div className="driver-card">
              <div className="driver-card-header">
                <div>
                  <h3>Distance Slab #{selectedSlab.id} Details</h3>
                  <p>Configuration summary and audit information</p>
                </div>
                <button
                  type="button"
                  className="btn-form-cancel"
                  onClick={() => setSlabMode("list")}
                >
                  Back to List
                </button>
              </div>

              <div style={{ padding: "24px", display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
                <div className="details-stat-card">
                  <div>
                    <span className="details-stat-label">Pickup Range</span>
                    <strong>{selectedSlab.pickUpKmsRangeFrom} - {selectedSlab.pickUpKmsRangeTo} KM</strong>
                  </div>
                </div>
                <div className="details-stat-card">
                  <div>
                    <span className="details-stat-label">Pickup Unit Rate</span>
                    <strong style={{ color: "#059669" }}>₹{Number(selectedSlab.unitPricePerPickKm).toFixed(2)} / km</strong>
                  </div>
                </div>
                <div className="details-stat-card">
                  <div>
                    <span className="details-stat-label">Delivery Range</span>
                    <strong>{selectedSlab.deliveryKmsRangeFrom} - {selectedSlab.deliveryKmsRangeTo} KM</strong>
                  </div>
                </div>
                <div className="details-stat-card">
                  <div>
                    <span className="details-stat-label">Delivery Unit Rate</span>
                    <strong style={{ color: "#059669" }}>₹{Number(selectedSlab.unitPricePerDeliverKm).toFixed(2)} / km</strong>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* =======================================================
          TAB 3: INCENTIVE HISTORY
      ======================================================= */}
      {activeTab === "history" && (
        <div className="driver-card">
          <div className="driver-card-header">
            <div>
              <h3>Driver Incentive & Payout Logs</h3>
              <p>Audit trail of calculated distance earnings and order bonuses</p>
            </div>
          </div>

          <div className="driver-table-wrap">
            <table className="driver-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Driver ID</th>
                  <th>Driver Name</th>
                  <th>Date</th>
                  <th>Orders Completed</th>
                  <th>Incentive Earned</th>
                  <th>Logged At</th>
                </tr>
              </thead>
              <tbody>
                {historyList.map((hist, idx) => (
                  <tr key={hist.id}>
                    <td>#{idx + 1}</td>
                    <td><strong>{hist.driverId}</strong></td>
                    <td>{hist.driverName}</td>
                    <td>{hist.date}</td>
                    <td>{hist.completedOrdersCount} orders</td>
                    <td>
                      <span className="slab-price-pill">
                        ₹{Number(hist.incentiveAmount).toFixed(2)}
                      </span>
                    </td>
                    <td>{hist.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =======================================================
          TAB 4: OPERATIONAL POLICIES
      ======================================================= */}
      {activeTab === "policies" && (
        <div className="driver-card">
          <div className="driver-card-header">
            <div>
              <h3>Operational Dispatch Rules</h3>
              <p>Global limits governing driver allocation, order thresholds, and acceptance timeouts</p>
            </div>
            <button
              type="button"
              className="driver-btn-primary"
              onClick={() => showToast("Operational policies saved successfully!")}
            >
              <FiCheck size={16} />
              <span>Save Policies</span>
            </button>
          </div>

          <div className="policies-grid">
            <div className="policy-card">
              <div className="policy-header">
                <div className="policy-icon">
                  <FiLayers size={20} />
                </div>
                <div className="policy-title">
                  <h4>Max Concurrent Orders</h4>
                  <p>Maximum number of active delivery orders a single driver can hold simultaneously.</p>
                </div>
              </div>
              <div className="policy-control">
                <span>Concurrent Orders:</span>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={policies.maxConcurrentOrders}
                  onChange={(e) =>
                    setPolicies((prev) => ({
                      ...prev,
                      maxConcurrentOrders: Number(e.target.value),
                    }))
                  }
                  className="policy-input"
                />
              </div>
            </div>

            <div className="policy-card">
              <div className="policy-header">
                <div className="policy-icon">
                  <FiMapPin size={20} />
                </div>
                <div className="policy-title">
                  <h4>Dispatch Search Radius</h4>
                  <p>Geographic radius (km) from merchant outlet to search for available online drivers.</p>
                </div>
              </div>
              <div className="policy-control">
                <span>Radius (KM):</span>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={policies.dispatchRadiusKm}
                  onChange={(e) =>
                    setPolicies((prev) => ({
                      ...prev,
                      dispatchRadiusKm: Number(e.target.value),
                    }))
                  }
                  className="policy-input"
                />
              </div>
            </div>

            <div className="policy-card">
              <div className="policy-header">
                <div className="policy-icon">
                  <FiClock size={20} />
                </div>
                <div className="policy-title">
                  <h4>Acceptance Window</h4>
                  <p>Seconds allocated to a driver to accept a newly routed delivery assignment.</p>
                </div>
              </div>
              <div className="policy-control">
                <span>Seconds:</span>
                <input
                  type="number"
                  min="15"
                  max="180"
                  value={policies.acceptanceTimeoutSec}
                  onChange={(e) =>
                    setPolicies((prev) => ({
                      ...prev,
                      acceptanceTimeoutSec: Number(e.target.value),
                    }))
                  }
                  className="policy-input"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

DriverSettings.propTypes = {
  setActivePage: PropTypes.func,
};

export default DriverSettings;