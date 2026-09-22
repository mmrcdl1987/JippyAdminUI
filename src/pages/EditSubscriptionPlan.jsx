import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiX,
  FiCheck,
  FiAlertCircle,
  FiInfo,
  FiPackage,
  FiLayers,
  FiMapPin,
  FiTag,
} from "react-icons/fi";
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
  const [toast, setToast] = useState(null);

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

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3800);
  };

  const getLoggedInUserId = () => {
    const directKeys = [
      "userId",
      "approverId",
      "user_id",
      "currentUserId",
      "loggedInUserId",
      "loginUserId",
    ];

    for (const key of directKeys) {
      try {
        const val = localStorage.getItem(key);
        if (val !== null && val !== undefined && String(val).trim() !== "") {
          return val;
        }
      } catch (err) {
        console.warn(`Could not read localStorage key "${key}"`, err);
      }
    }

    const objKeys = [
      "user",
      "userData",
      "currentUser",
      "loggedInUser",
      "loginUser",
      "authUser",
    ];

    for (const key of objKeys) {
      try {
        const val = localStorage.getItem(key);
        if (val) {
          const parsed = JSON.parse(val);
          if (parsed && typeof parsed === "object") {
            const possibleId =
              parsed.userId ||
              parsed.user_id ||
              parsed.id ||
              parsed.employeeId ||
              parsed.employee_id ||
              parsed.accountId;
            if (
              possibleId !== null &&
              possibleId !== undefined &&
              String(possibleId).trim() !== ""
            ) {
              return String(possibleId);
            }
          }
        }
      } catch (err) {
        console.warn(`Could not parse localStorage key "${key}"`, err);
      }
    }

    return "1";
  };

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
        userId: selectedPlan.userId || getLoggedInUserId(),
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
      showToast("Plan Name is required.", "error");
      return;
    }

    if (!formData.price || Number(formData.price) <= 0) {
      showToast("Valid price is required.", "error");
      return;
    }

    if (!formData.durationInDays || Number(formData.durationInDays) <= 0) {
      showToast("Valid duration in days is required.", "error");
      return;
    }

    if (!formData.areaId) {
      showToast("Please select an Area.", "error");
      return;
    }

    const sessionUserId = formData.userId || getLoggedInUserId();

    try {
      setLoading(true);
      const payload = {
        ...formData,
        userId: sessionUserId,
      };
      await updateSubscriptionPlan(formData.subscriptionPlanId, payload);
      showToast("Subscription Plan updated successfully!", "success");
      setTimeout(() => {
        navigate("/dashboard/subscriptionPlanSettings");
      }, 1000);
    } catch (error) {
      showToast(
        error?.response?.data?.message ||
          "Failed to update subscription plan.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-sub-page-wrapper">
      {/* FLOATING TOAST NOTIFICATION */}
      {toast && (
        <div
          className={`edit-sub-toast ${
            toast.type === "success"
              ? "edit-sub-toast-success"
              : toast.type === "error"
              ? "edit-sub-toast-error"
              : "edit-sub-toast-info"
          }`}
        >
          {toast.type === "success" ? (
            <FiCheck size={18} />
          ) : toast.type === "error" ? (
            <FiAlertCircle size={18} />
          ) : (
            <FiInfo size={18} />
          )}
          <span>{toast.message}</span>
          <button
            type="button"
            className="edit-sub-toast-close"
            onClick={() => setToast(null)}
          >
            <FiX size={14} />
          </button>
        </div>
      )}

      {/* PAGE HEADER WITH ZONE MANAGEMENT DESIGN */}
      <div className="edit-sub-header">
        <div className="edit-sub-header-left">
          <div className="edit-sub-header-icon">
            <FiPackage />
          </div>

          <div className="edit-sub-header-titles">
            <div className="edit-sub-eyebrow-row">
              <span className="edit-sub-eyebrow">Subscription Management</span>
              <span className="edit-sub-divider">/</span>
              <span className="edit-sub-breadcrumb">Edit Plan</span>
            </div>

            <h2>
              Edit Subscription Plan
              {formData.subscriptionPlanId && (
                <span className="edit-sub-id-badge">
                  #{formData.subscriptionPlanId}
                </span>
              )}
            </h2>

            <p>
              Modify pricing tiers, visibility limits, duration, or assigned regional coverage area.
            </p>
          </div>
        </div>

        <div className="edit-sub-header-actions">
          <button
            type="button"
            className="edit-sub-back-btn"
            onClick={() => navigate("/dashboard/subscriptionPlanSettings")}
            title="Return to Subscription Plans"
          >
            <FiArrowLeft size={16} />
            <span>Back to Plans</span>
          </button>

          <button
            type="button"
            className="edit-sub-close-btn"
            onClick={() => navigate("/dashboard/subscriptionPlanSettings")}
            title="Close"
          >
            <FiX size={18} />
          </button>
        </div>
      </div>

      <p className="required-note">
        <span className="required-star">*</span> Indicates mandatory fields required for plan update
      </p>

      {/* FORM CARD */}
      <div className="edit-sub-card">
        {/* SECTION 1: BASIC PLAN INFO */}
        <div className="edit-sub-section">
          <div className="edit-sub-section-header">
            <div className="edit-sub-section-icon">
              <FiTag />
            </div>
            <div>
              <h3>Basic Plan Information</h3>
              <p>Set the plan identity, billing price, and validity duration</p>
            </div>
          </div>

          <div className="edit-sub-form-grid">
            <div className="edit-sub-form-group">
              <label className="edit-sub-form-label">
                Plan Name <span className="required-star">*</span>
              </label>
              <input
                className="edit-sub-form-input"
                type="text"
                name="planName"
                placeholder="e.g. Platinum Merchant Booster"
                value={formData.planName}
                onChange={handleChange}
              />
            </div>

            <div className="edit-sub-form-group">
              <label className="edit-sub-form-label">
                Price (₹) <span className="required-star">*</span>
              </label>
              <div className="edit-sub-input-wrap has-prefix">
                <span className="edit-sub-prefix">₹</span>
                <input
                  className="edit-sub-form-input"
                  type="number"
                  name="price"
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="edit-sub-form-group">
              <label className="edit-sub-form-label">
                Duration (Days) <span className="required-star">*</span>
              </label>
              <div className="edit-sub-input-wrap has-suffix">
                <input
                  className="edit-sub-form-input"
                  type="number"
                  name="durationInDays"
                  min="1"
                  placeholder="30"
                  value={formData.durationInDays}
                  onChange={handleChange}
                />
                <span className="edit-sub-suffix">Days</span>
              </div>
            </div>

            <div className="edit-sub-form-group">
              <label className="edit-sub-form-label">Banner Duration (Days)</label>
              <div className="edit-sub-input-wrap has-suffix">
                <input
                  className="edit-sub-form-input"
                  type="number"
                  name="bannerDurationInDays"
                  min="1"
                  placeholder="15"
                  value={formData.bannerDurationInDays}
                  onChange={handleChange}
                />
                <span className="edit-sub-suffix">Days</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: SLOTS & MARKETING */}
        <div className="edit-sub-section">
          <div className="edit-sub-section-header">
            <div className="edit-sub-section-icon">
              <FiLayers />
            </div>
            <div>
              <h3>Marketing Slots & Coverage Radius</h3>
              <p>Promotional benefits, featured placement slots, and broadcasting</p>
            </div>
          </div>

          <div className="edit-sub-form-grid">
            <div className="edit-sub-form-group">
              <label className="edit-sub-form-label">Coverage Radius (KM)</label>
              <div className="edit-sub-input-wrap has-suffix">
                <input
                  className="edit-sub-form-input"
                  type="number"
                  name="radiusInKms"
                  min="0"
                  step="0.1"
                  placeholder="10.0"
                  value={formData.radiusInKms}
                  onChange={handleChange}
                />
                <span className="edit-sub-suffix">KM</span>
              </div>
            </div>

            <div className="edit-sub-form-group">
              <label className="edit-sub-form-label">Banner Slot</label>
              <input
                className="edit-sub-form-input"
                type="number"
                name="bannerSlot"
                min="0"
                placeholder="Number of slots"
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
                placeholder="Featured ranking slots"
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
                placeholder="Active discount deal slots"
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
                placeholder="e.g. 5000 messages / month"
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
                placeholder="e.g. 1 promotional reel"
                value={formData.videoCredits}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: GEOGRAPHIC COVERAGE */}
        <div className="edit-sub-section">
          <div className="edit-sub-section-header">
            <div className="edit-sub-section-icon">
              <FiMapPin />
            </div>
            <div>
              <h3>Geographic Location & Area</h3>
              <p>Target territory where merchants can subscribe to this plan</p>
            </div>
          </div>

          <div className="edit-sub-form-grid location-grid">
            <div className="edit-sub-form-group">
              <label className="edit-sub-form-label">
                State <span className="required-star">*</span>
              </label>
              <select
                className="edit-sub-form-input edit-sub-select"
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
                className="edit-sub-form-input edit-sub-select"
                value={selectedCity}
                onChange={handleCityChange}
                disabled={!selectedState}
              >
                <option value="">
                  {!selectedState ? "Choose State First" : "Select City"}
                </option>
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
                className="edit-sub-form-input edit-sub-select"
                value={selectedArea}
                onChange={handleAreaChange}
                disabled={!selectedCity}
              >
                <option value="">
                  {!selectedCity ? "Choose City First" : "Select Area"}
                </option>
                {Array.isArray(areas) &&
                  areas.map((area) => (
                    <option key={area.areaId} value={area.areaId}>
                      {area.areaName}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>

        {/* BUTTON ACTIONS */}
        <div className="edit-sub-button-wrapper">
          <button
            type="button"
            className="edit-sub-cancel-btn"
            onClick={() => navigate("/dashboard/subscriptionPlanSettings")}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            type="button"
            className="edit-sub-update-btn"
            onClick={handleUpdate}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="edit-sub-spinner"></span>
                <span>Updating Plan...</span>
              </>
            ) : (
              <>
                <FiCheck size={18} />
                <span>Update Subscription Plan</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditSubscriptionPlan;