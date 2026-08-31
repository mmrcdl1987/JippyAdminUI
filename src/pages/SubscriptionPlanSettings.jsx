import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/SubscriptionPlanSettings.css";

import {
  getAllSubscriptionPlans,
  getSubscriptionPlanById,
  deleteSubscriptionPlan,
  getSubscriptionPlansByArea,
  getStates,
  getCitiesByState,
  getAreasByCity,
} from "../services/subscriptionPlanSettingsService";

function SubscriptionPlanSettings({
  selectedPlan,
  setSelectedPlan,
}) {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [areaPlans, setAreaPlans] = useState([]);
  const [showAreaResults, setShowAreaResults] = useState(false);

  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);

  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedArea, setSelectedArea] = useState("");

  useEffect(() => {
    fetchPlans();
    loadStates();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await getAllSubscriptionPlans();
      setPlans(response.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  const loadStates = async () => {
    try {
      const response = await getStates();
      setStates(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.log(error);
    }
  };

  const handleStateChange = async (e) => {
    const stateId = e.target.value;
    setSelectedState(stateId);
    setSelectedCity("");
    setSelectedArea("");
    setCities([]);
    setAreas([]);

    if (!stateId) return;

    try {
      const response = await getCitiesByState(stateId);
      setCities(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.log(error);
    }
  };

  const handleCityChange = async (e) => {
    const cityId = e.target.value;
    setSelectedCity(cityId);
    setSelectedArea("");
    setAreas([]);

    if (!cityId) return;

    try {
      const response = await getAreasByCity(cityId);
      setAreas(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.log(error);
    }
  };

  const handleView = async (id) => {
    try {
      const response = await getSubscriptionPlanById(id);
      setSelectedPlan(response.data.data);
      navigate("/dashboard/viewSubscriptionPlan");
    } catch (error) {
      console.log(error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete Subscription Plan?")) {
      return;
    }

    try {
      const response = await deleteSubscriptionPlan(id);
      alert(response.data.message || "Subscription plan deleted successfully.");
      fetchPlans();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Unable to delete subscription plan."
      );
    }
  };

  const handleAreaSearch = async () => {
    if (!selectedArea) {
      alert("Please select an Area.");
      return;
    }

    try {
      const response = await getSubscriptionPlansByArea(selectedArea);
      const fetchedPlans = response.data.data;

      if (!fetchedPlans || fetchedPlans.length === 0) {
        alert("No Subscription Plans Found");
        setAreaPlans([]);
        setShowAreaResults(false);
        return;
      }

      setAreaPlans(fetchedPlans);
      setShowAreaResults(true);
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "No Subscription Plans Found"
      );
      setAreaPlans([]);
      setShowAreaResults(false);
    }
  };

  return (
    <div className="sub-page-wrapper">
      {/* Page Header Section */}
      <div className="subscription-plan-header-flex" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h2 className="sub-page-title" style={{ margin: 0, fontSize: "24px", fontWeight: "600" }}>
            Subscription Plans
          </h2>
          <p style={{ margin: "4px 0 0 0", color: "#6c757d", fontSize: "14px" }}>
            Manage all subscription plans dynamically
          </p>
        </div>

        <button
          className="subscription-plan-settings-create-button"
          onClick={() => {
            setSelectedPlan(null);
            navigate("/dashboard/createSubscriptionPlan");
          }}
          style={{ backgroundColor: "#0d6efd", color: "#fff", border: "none", padding: "10px 16px", borderRadius: "6px", fontWeight: "500", cursor: "pointer" }}
        >
          + Add Subscription Plan
        </button>
      </div>

      {/* Toolbar Container for Area Filtering / Search */}
      <div className="subscription-plan-settings-toolbar-container" style={{ background: "#fff", padding: "16px", borderRadius: "8px", marginBottom: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
        <div className="subscription-plan-settings-search-container" style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
          
          <select
            className="subscription-plan-settings-search-select"
            value={selectedState}
            onChange={handleStateChange}
          >
            <option value="">Select State</option>
            {Array.isArray(states) &&
              states.map((state) => (
                <option key={state.stateId} value={state.stateId}>
                  {state.stateName}
                </option>
              ))}
          </select>

          <select
            className="subscription-plan-settings-search-select"
            value={selectedCity}
            onChange={handleCityChange}
            disabled={!selectedState}
          >
            <option value="">Select City</option>
            {Array.isArray(cities) &&
              cities.map((city) => (
                <option key={city.cityId} value={city.cityId}>
                  {city.cityName}
                </option>
              ))}
          </select>

          <select
            className="subscription-plan-settings-search-select"
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            disabled={!selectedCity}
          >
            <option value="">Select Area</option>
            {Array.isArray(areas) &&
              areas.map((area) => (
                <option key={area.areaId} value={area.areaId}>
                  {area.areaName}
                </option>
              ))}
          </select>

          <button
            className="subscription-plan-settings-search-button"
            onClick={handleAreaSearch}
          >
            Search by Area
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="sub-card">
        <div className="sub-card-header">
          AVAILABLE SUBSCRIPTION PLANS
        </div>

        <div className="sub-table-wrapper">
          <table className="sub-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Plan Name</th>
                <th>Price (₹)</th>
                <th>Duration (Days)</th>
                <th>Banner Duration (Days)</th>
                <th>Area ID</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {plans.length > 0 ? (
                plans.map((plan, index) => (
                  <tr key={plan.subscriptionPlanId}>
                    <td>{index + 1}</td>
                    <td>{plan.planName}</td>
                    <td>₹ {Number(plan.price).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                    <td>{plan.durationInDays}</td>
                    <td>{plan.bannerDurationInDays || "-"}</td>
                    <td>{plan.areaId}</td>
                    <td>
                      <span className="sub-status-badge" style={{ backgroundColor: "#d1e7dd", color: "#0f5132", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: "500" }}>
                        Active
                      </span>
                    </td>
                    <td className="subscription-plan-settings-action-column">
                      <button
                        className="sub-view-btn"
                        onClick={() => handleView(plan.subscriptionPlanId)}
                        title="View"
                      >
                        👁️
                      </button>

                      <button
                        className="sub-edit-btn"
                        onClick={async () => {
                          try {
                            const response = await getSubscriptionPlanById(
                              plan.subscriptionPlanId
                            );
                            setSelectedPlan(response.data.data);
                            navigate("/dashboard/editSubscriptionPlan");
                          } catch (error) {
                            console.log(error);
                          }
                        }}
                        title="Edit"
                      >
                        ✏️
                      </button>

                      <button
                        className="sub-delete-btn"
                        onClick={() => handleDelete(plan.subscriptionPlanId)}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="sub-empty-row">
                    No Subscription Plans Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Area Search Results Section */}
      {areaPlans.length > 0 && (
        <div className="sub-card" style={{ marginTop: "20px" }}>
          <div className="sub-card-header">SEARCH RESULTS</div>

          <div
            className="subscription-plan-settings-expand-header"
            onClick={() => setShowAreaResults(!showAreaResults)}
            style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px", cursor: "pointer", background: "#f8f9fa" }}
          >
            <span>Area Plans ({areaPlans.length})</span>
            <button className="subscription-plan-settings-expand-button">
              {showAreaResults ? "▲" : "▼"}
            </button>
          </div>

          {showAreaResults && (
            <div className="sub-table-wrapper">
              <table className="sub-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Plan Name</th>
                    <th>Price</th>
                    <th>Duration</th>
                    <th>Area ID</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {areaPlans.map((plan) => (
                    <tr key={plan.subscriptionPlanId}>
                      <td>{plan.subscriptionPlanId}</td>
                      <td>{plan.planName}</td>
                      <td>₹ {plan.price}</td>
                      <td>{plan.durationInDays} Days</td>
                      <td>{plan.areaId}</td>
                      <td>
                        <button
                          className="sub-view-btn"
                          onClick={() => handleView(plan.subscriptionPlanId)}
                          title="View"
                        >
                          👁️
                        </button>
                        <button
                          className="sub-edit-btn"
                          onClick={async () => {
                            try {
                              const response = await getSubscriptionPlanById(plan.subscriptionPlanId);
                              setSelectedPlan(response.data.data);
                              navigate("/dashboard/editSubscriptionPlan");
                            } catch (error) {
                              console.log(error);
                            }
                          }}
                          title="Edit"
                          style={{ marginLeft: "6px" }}
                        >
                          ✏️
                        </button>
                        <button
                          className="sub-delete-btn"
                          onClick={() => handleDelete(plan.subscriptionPlanId)}
                          title="Delete"
                          style={{ marginLeft: "6px" }}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SubscriptionPlanSettings;