import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/EditSubscriptionPlan.css";

import {
  updateSubscriptionPlan,
  getStates,
  getCitiesByState,
  getAreasByCity,
} from "../services/subscriptionPlanSettingsService";

function EditSubscriptionPlan({ selectedPlan }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);

  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedArea, setSelectedArea] = useState("");

  const [formData, setFormData] = useState({
    subscriptionPlanId: "",
    planName: "",
    price: "",
    durationInDays: "",
    bannerDurationInDays: "",
    radiusInKms: "",
    bannerSlot: "",
    bestRestaurantSlot: "",
    dealsSlot: "",
    whatsappBroadcast: "",
    videoCredits: "",
    areaId: "",
    userId: "",
  });

  useEffect(() => {
    loadStates();
  }, []);

  const loadStates = async () => {
    try {
      const response = await getStates();
      setStates(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (selectedPlan) {
      setFormData({
        subscriptionPlanId: selectedPlan.subscriptionPlanId || "",
        planName: selectedPlan.planName || "",
        price: selectedPlan.price || "",
        durationInDays: selectedPlan.durationInDays || "",
        bannerDurationInDays: selectedPlan.bannerDurationInDays || "",
        radiusInKms: selectedPlan.radiusInKms || "",
        bannerSlot: selectedPlan.bannerSlot || "",
        bestRestaurantSlot: selectedPlan.bestRestaurantSlot || "",
        dealsSlot: selectedPlan.dealsSlot || "",
        whatsappBroadcast: selectedPlan.whatsappBroadcast || "",
        videoCredits: selectedPlan.videoCredits || "",
        areaId: selectedPlan.areaId || "",
        userId: selectedPlan.userId || "",
      });
      setSelectedArea(selectedPlan.areaId || "");
    }
  }, [selectedPlan]);

  const handleStateChange = async (e) => {
    const stateId = e.target.value;
    setSelectedState(stateId);
    setSelectedCity("");
    setSelectedArea("");
    setCities([]);
    setAreas([]);

    setFormData((prev) => ({
      ...prev,
      areaId: "",
    }));

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

    setFormData((prev) => ({
      ...prev,
      areaId: "",
    }));

    if (!cityId) return;

    try {
      const response = await getAreasByCity(cityId);
      setAreas(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.log(error);
    }
  };

  const handleAreaChange = (e) => {
    const areaId = e.target.value;
    setSelectedArea(areaId);
    setFormData((prev) => ({
      ...prev,
      areaId: areaId,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "planName" ? value.replace(/^\s+/, "") : value,
    }));
  };

  const handleUpdate = async () => {
    if (!formData.planName.trim()) {
      alert("Plan Name is required.");
      return;
    }

    if (!formData.price || Number(formData.price) <= 0) {
      alert("Valid price is required.");
      return;
    }

    if (!formData.durationInDays || Number(formData.durationInDays) <= 0) {
      alert("Valid duration is required.");
      return;
    }

    if (!formData.areaId) {
      alert("Please select an Area.");
      return;
    }

    if (!formData.userId) {
      alert("User ID is required.");
      return;
    }

    try {
      setLoading(true);
      await updateSubscriptionPlan(formData.subscriptionPlanId, formData);
      alert("Subscription Plan updated successfully.");
      navigate("/dashboard/subscriptionPlanSettings");
    } catch (error) {
      alert(
        error?.response?.data?.message ||
          "Failed to update subscription plan."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-sub-page-wrapper">
      <h2 className="edit-sub-page-title">Edit Subscription Plan</h2>

      <p className="required-note">
        <span className="required-star">*</span> Indicates required fields
      </p>

      <div className="edit-sub-card">
        <div className="edit-sub-card-header">UPDATE SUBSCRIPTION PLAN</div>

        <div className="edit-sub-form-grid">
          <div className="edit-sub-form-group">
            <label className="edit-sub-form-label">
              Plan Name <span className="required-star">*</span>
            </label>
            <input
              className="edit-sub-form-input"
              type="text"
              name="planName"
              value={formData.planName}
              onChange={handleChange}
            />
          </div>

          <div className="edit-sub-form-group">
            <label className="edit-sub-form-label">
              Price <span className="required-star">*</span>
            </label>
            <input
              className="edit-sub-form-input"
              type="number"
              name="price"
              min="0.01"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
            />
          </div>

          <div className="edit-sub-form-group">
            <label className="edit-sub-form-label">
              Duration (Days) <span className="required-star">*</span>
            </label>
            <input
              className="edit-sub-form-input"
              type="number"
              name="durationInDays"
              min="1"
              value={formData.durationInDays}
              onChange={handleChange}
            />
          </div>

          <div className="edit-sub-form-group">
            <label className="edit-sub-form-label">Banner Duration (Days)</label>
            <input
              className="edit-sub-form-input"
              type="number"
              name="bannerDurationInDays"
              min="1"
              value={formData.bannerDurationInDays}
              onChange={handleChange}
            />
          </div>

          <div className="edit-sub-form-group">
            <label className="edit-sub-form-label">Radius (KM)</label>
            <input
              className="edit-sub-form-input"
              type="number"
              name="radiusInKms"
              min="0"
              step="0.1"
              value={formData.radiusInKms}
              onChange={handleChange}
            />
          </div>

          <div className="edit-sub-form-group">
            <label className="edit-sub-form-label">Banner Slot</label>
            <input
              className="edit-sub-form-input"
              type="number"
              name="bannerSlot"
              min="0"
              value={formData.bannerSlot}
              onChange={handleChange}
            />
          </div>

          <div className="edit-sub-form-group">
            <label className="edit-sub-form-label">Best Restaurant Slot</label>
            <input
              className="edit-sub-form-input"
              type="number"
              name="bestRestaurantSlot"
              min="0"
              value={formData.bestRestaurantSlot}
              onChange={handleChange}
            />
          </div>

          <div className="edit-sub-form-group">
            <label className="edit-sub-form-label">Deals Slot</label>
            <input
              className="edit-sub-form-input"
              type="number"
              name="dealsSlot"
              min="0"
              value={formData.dealsSlot}
              onChange={handleChange}
            />
          </div>

          <div className="edit-sub-form-group">
            <label className="edit-sub-form-label">WhatsApp Broadcast</label>
            <input
              className="edit-sub-form-input"
              type="text"
              name="whatsappBroadcast"
              value={formData.whatsappBroadcast}
              onChange={handleChange}
            />
          </div>

          <div className="edit-sub-form-group">
            <label className="edit-sub-form-label">Video Credits</label>
            <input
              className="edit-sub-form-input"
              type="text"
              name="videoCredits"
              value={formData.videoCredits}
              onChange={handleChange}
            />
          </div>

          <div className="edit-sub-form-group">
            <label className="edit-sub-form-label">
              State <span className="required-star">*</span>
            </label>
            <select
              className="edit-sub-form-input"
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
          </div>

          <div className="edit-sub-form-group">
            <label className="edit-sub-form-label">
              City <span className="required-star">*</span>
            </label>
            <select
              className="edit-sub-form-input"
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
          </div>

          <div className="edit-sub-form-group">
            <label className="edit-sub-form-label">
              Area <span className="required-star">*</span>
            </label>
            <select
              className="edit-sub-form-input"
              value={selectedArea}
              onChange={handleAreaChange}
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
          </div>

          <div className="edit-sub-form-group">
            <label className="edit-sub-form-label">
              User ID <span className="required-star">*</span>
            </label>
            <input
              className="edit-sub-form-input"
              type="number"
              name="userId"
              min="1"
              value={formData.userId}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="edit-sub-button-wrapper">
          <button
            className="edit-sub-update-btn"
            onClick={handleUpdate}
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Subscription Plan"}
          </button>

          <button
            className="edit-sub-cancel-btn"
            onClick={() => navigate("/dashboard/subscriptionPlanSettings")}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditSubscriptionPlan;