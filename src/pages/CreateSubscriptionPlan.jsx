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
import "../styles/CreateSubscriptionPlan.css";

import {
  createSubscriptionPlan,
  getStates,
  getCitiesByState,
  getAreasByCity,
} from "../services/subscriptionPlanSettingsService";

function CreateSubscriptionPlan() {
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
    const sessionUserId = getLoggedInUserId();
    if (sessionUserId) {
      setFormData((prev) => ({
        ...prev,
        userId: sessionUserId,
      }));
    }
  }, []);

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

  const handleSave = async () => {
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

    const sessionUserId = getLoggedInUserId();

    try {
      setLoading(true);
      const payload = {
        ...formData,
        userId: sessionUserId,
      };
      await createSubscriptionPlan(payload);
      showToast("Subscription Plan created successfully!", "success");
      setTimeout(() => {
        navigate("/dashboard/subscriptionPlanSettings");
      }, 1000);
    } catch (error) {
      showToast(
        error?.response?.data?.message ||
          "Failed to create subscription plan.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-sub-page-wrapper">
      {/* FLOATING TOAST NOTIFICATION */}
      {toast && (
        <div
          className={`create-sub-toast ${
            toast.type === "success"
              ? "create-sub-toast-success"
              : toast.type === "error"
              ? "create-sub-toast-error"
              : "create-sub-toast-info"
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
            className="create-sub-toast-close"
            onClick={() => setToast(null)}
          >
            <FiX size={14} />
          </button>
        </div>
      )}

      {/* PAGE HEADER WITH ZONE MANAGEMENT DESIGN */}
      <div className="create-sub-header">
        <div className="create-sub-header-left">
          <div className="create-sub-header-icon">
            <FiPackage />
          </div>

          <div className="create-sub-header-titles">
            <div className="create-sub-eyebrow-row">
              <span className="create-sub-eyebrow">Subscription Management</span>
              <span className="create-sub-divider">/</span>
              <span className="create-sub-breadcrumb">New Plan</span>
            </div>

            <h2>Create Subscription Plan</h2>

            <p>
              Configure pricing, validity duration, promotional visibility slots, and target coverage area.
            </p>
          </div>
        </div>

        <div className="create-sub-header-actions">
          <button
            type="button"
            className="create-sub-back-btn"
            onClick={() => navigate("/dashboard/subscriptionPlanSettings")}
            title="Return to Subscription Plans"
          >
            <FiArrowLeft size={16} />
            <span>Back to Plans</span>
          </button>

          <button
            type="button"
            className="create-sub-close-btn"
            onClick={() => navigate("/dashboard/subscriptionPlanSettings")}
            title="Close"
          >
            <FiX size={18} />
          </button>
        </div>
      </div>

      <p className="required-note">
        <span className="required-star">*</span> Indicates mandatory fields required for plan creation
      </p>

      {/* FORM CARD */}
      <div className="create-sub-card">
        {/* SECTION 1: BASIC PLAN INFO */}
        <div className="create-sub-section">
          <div className="create-sub-section-header">
            <div className="create-sub-section-icon">
              <FiTag />
            </div>
            <div>
              <h3>Basic Plan Information</h3>
              <p>Set the plan identity, billing price, and validity duration</p>
            </div>
          </div>

          <div className="create-sub-form-grid">
            <div className="create-sub-form-group">
              <label className="create-sub-form-label">
                Plan Name <span className="required-star">*</span>
              </label>
              <input
                className="create-sub-form-input"
                type="text"
                name="planName"
                placeholder="e.g. Platinum Merchant Booster"
                value={formData.planName}
                onChange={handleChange}
              />
            </div>

            <div className="create-sub-form-group">
              <label className="create-sub-form-label">
                Price (₹) <span className="required-star">*</span>
              </label>
              <div className="create-sub-input-wrap has-prefix">
                <span className="create-sub-prefix">₹</span>
                <input
                  className="create-sub-form-input"
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

            <div className="create-sub-form-group">
              <label className="create-sub-form-label">
                Duration (Days) <span className="required-star">*</span>
              </label>
              <div className="create-sub-input-wrap has-suffix">
                <input
                  className="create-sub-form-input"
                  type="number"
                  name="durationInDays"
                  min="1"
                  placeholder="30"
                  value={formData.durationInDays}
                  onChange={handleChange}
                />
                <span className="create-sub-suffix">Days</span>
              </div>
            </div>

            <div className="create-sub-form-group">
              <label className="create-sub-form-label">Banner Duration (Days)</label>
              <div className="create-sub-input-wrap has-suffix">
                <input
                  className="create-sub-form-input"
                  type="number"
                  name="bannerDurationInDays"
                  min="1"
                  placeholder="15"
                  value={formData.bannerDurationInDays}
                  onChange={handleChange}
                />
                <span className="create-sub-suffix">Days</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: SLOTS & MARKETING */}
        <div className="create-sub-section">
          <div className="create-sub-section-header">
            <div className="create-sub-section-icon">
              <FiLayers />
            </div>
            <div>
              <h3>Marketing Slots & Coverage Radius</h3>
              <p>Promotional benefits, featured placement slots, and broadcasting</p>
            </div>
          </div>

          <div className="create-sub-form-grid">
            <div className="create-sub-form-group">
              <label className="create-sub-form-label">Coverage Radius (KM)</label>
              <div className="create-sub-input-wrap has-suffix">
                <input
                  className="create-sub-form-input"
                  type="number"
                  name="radiusInKms"
                  min="0"
                  step="0.1"
                  placeholder="10.0"
                  value={formData.radiusInKms}
                  onChange={handleChange}
                />
                <span className="create-sub-suffix">KM</span>
              </div>
            </div>

            <div className="create-sub-form-group">
              <label className="create-sub-form-label">Banner Slot</label>
              <input
                className="create-sub-form-input"
                type="number"
                name="bannerSlot"
                min="0"
                placeholder="Number of slots"
                value={formData.bannerSlot}
                onChange={handleChange}
              />
            </div>

            <div className="create-sub-form-group">
              <label className="create-sub-form-label">Best Restaurant Slot</label>
              <input
                className="create-sub-form-input"
                type="number"
                name="bestRestaurantSlot"
                min="0"
                placeholder="Featured ranking slots"
                value={formData.bestRestaurantSlot}
                onChange={handleChange}
              />
            </div>

            <div className="create-sub-form-group">
              <label className="create-sub-form-label">Deals Slot</label>
              <input
                className="create-sub-form-input"
                type="number"
                name="dealsSlot"
                min="0"
                placeholder="Active discount deal slots"
                value={formData.dealsSlot}
                onChange={handleChange}
              />
            </div>

            <div className="create-sub-form-group">
              <label className="create-sub-form-label">WhatsApp Broadcast</label>
              <input
                className="create-sub-form-input"
                type="text"
                name="whatsappBroadcast"
                placeholder="e.g. 5000 messages / month"
                value={formData.whatsappBroadcast}
                onChange={handleChange}
              />
            </div>

            <div className="create-sub-form-group">
              <label className="create-sub-form-label">Video Credits</label>
              <input
                className="create-sub-form-input"
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
        <div className="create-sub-section">
          <div className="create-sub-section-header">
            <div className="create-sub-section-icon">
              <FiMapPin />
            </div>
            <div>
              <h3>Geographic Location & Area</h3>
              <p>Target territory where merchants can subscribe to this plan</p>
            </div>
          </div>

          <div className="create-sub-form-grid location-grid">
            <div className="create-sub-form-group">
              <label className="create-sub-form-label">
                State <span className="required-star">*</span>
              </label>
              <select
                className="create-sub-form-input create-sub-select"
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

            <div className="create-sub-form-group">
              <label className="create-sub-form-label">
                City <span className="required-star">*</span>
              </label>
              <select
                className="create-sub-form-input create-sub-select"
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

            <div className="create-sub-form-group">
              <label className="create-sub-form-label">
                Area <span className="required-star">*</span>
              </label>
              <select
                className="create-sub-form-input create-sub-select"
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
        <div className="create-sub-button-wrapper">
          <button
            type="button"
            className="create-sub-cancel-btn"
            onClick={() => navigate("/dashboard/subscriptionPlanSettings")}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            type="button"
            className="create-sub-save-btn"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="create-sub-spinner"></span>
                <span>Creating Plan...</span>
              </>
            ) : (
              <>
                <FiCheck size={18} />
                <span>Create Subscription Plan</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateSubscriptionPlan;