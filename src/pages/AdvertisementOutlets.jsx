import { useEffect, useState } from "react";
import Select from "react-select";
import API, { FM_API } from "../services/api";
import "../styles/AdvertisementOutlets.css";

function AdvertisementOutlets() {
  const [pricingType, setPricingType] = useState("FLAT");

  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [plans, setPlans] = useState([]);

  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [selectedOutlet, setSelectedOutlet] = useState("");
  const [selectedPlan, setSelectedPlan] = useState(null);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    fetchStates();
  }, []);

  const fetchStates = async () => {
    try {
      const response = await API.get("/api/fm/location/fetchStates");
      setStates(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching states:", error);
    }
  };

  const handleStateChange = async (e) => {
    const stateId = e.target.value;

    setSelectedState(stateId);
    setSelectedCity("");
    setSelectedArea("");
    setSelectedOutlet("");
    setSelectedPlan(null);

    setCities([]);
    setAreas([]);
    setOutlets([]);
    setPlans([]);

    try {
      const response = await API.get(
        `/api/fm/location/fetchCityInState?stateId=${stateId}`
      );
      setCities(response.data);
    } catch (error) {
      console.error("Error fetching cities:", error);
    }
  };

  const handleCityChange = async (e) => {
    const cityId = e.target.value;

    setSelectedCity(cityId);
    setSelectedArea("");
    setSelectedOutlet("");
    setSelectedPlan(null);

    setAreas([]);
    setOutlets([]);
    setPlans([]);

    try {
      const response = await API.get(
        `/api/fm/location/fetchAreaInCity?cityId=${cityId}`
      );
      setAreas(response.data);
    } catch (error) {
      console.error("Error fetching areas:", error);
    }
  };

  const handleAreaChange = async (e) => {
    const areaId = e.target.value;

    setSelectedArea(areaId);
    setSelectedOutlet("");
    setSelectedPlan(null);
    setPlans([]);
    setOutlets([]);

    if (!areaId) return;

    fetchSubscriptionPlans(areaId);
  };

  const fetchOutlets = async () => {
    try {
      const response = await API.get("/api/fm/outlets");
      setOutlets(response.data.data || []);
    } catch (error) {
      console.error("Error fetching outlets:", error);
    }
  };

  const fetchSubscriptionPlans = async (areaId) => {
    try {
      const response = await (FM_API || API).get(
        `/api/fm/subscription-plans/area/${areaId}`
      );
      setPlans(
        Array.isArray(response.data?.data)
          ? response.data.data
          : Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (error) {
      console.error("Error fetching subscription plans:", error);
      setPlans([]);
    }
  };

  const handleSave = async () => {
    try {
      const payload = {
        outletId: Number(selectedOutlet),
        subscriptionPlanId: selectedPlan.subscriptionPlanId,
        subscriptionFromDate: startDate,
        subscriptionToDate: endDate,
        bannerSlotDaysId: selectedPlan.bannerDurationInDays,
        bannerFromDate: startDate,
        bannerToDate: endDate,
        mealTypeTimingsIds: [],
        priceModelType: "FLAT",
        offerAmount: 0,
        userId: JSON.parse(localStorage.getItem("userData") || "{}").userId,
      };

      const response = await API.post(
        "/api/fm/outlet-subscription-plans",
        payload
      );

      alert(response.data.message || "Successfully saved!");
    } catch (error) {
      console.error(error);
      alert(
        error.response?.data?.message || "Unable to save advertisement outlet."
      );
    }
  };

  const outletOptions = outlets.map((outlet) => ({
    value: outlet.outletId,
    label: outlet.outletName,
  }));

  return (
    <div className="advertisement-page">
      <div className="page-header">
        <div>
          <h2>Advertisement Outlets</h2>
          <p>Manage advertisement plans for outlets</p>
        </div>
      </div>

      <div className="advertisement-card">
        <h3>Advertisement Outlet Registration</h3>

        <div className="form-grid">
          <div className="form-group">
            <label>
              State <span className="required-star">*</span>
            </label>
            <select value={selectedState} onChange={handleStateChange}>
              <option value="">Select State</option>
              {states.map((state) => (
                <option key={state.stateId} value={state.stateId}>
                  {state.stateName}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>
              City <span className="required-star">*</span>
            </label>
            <select value={selectedCity} onChange={handleCityChange}>
              <option value="">Select City</option>
              {cities.map((city) => (
                <option key={city.cityId} value={city.cityId}>
                  {city.cityName}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>
              Area <span className="required-star">*</span>
            </label>
            <select value={selectedArea} onChange={handleAreaChange}>
              <option value="">Select Area</option>
              {areas.map((area) => (
                <option key={area.areaId} value={area.areaId}>
                  {area.areaName}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>
              Outlet <span className="required-star">*</span>
            </label>
            <Select
              options={outletOptions}
              placeholder="Select Outlet"
              value={
                outletOptions.find(
                  (option) => option.value === selectedOutlet
                ) || null
              }
              onMenuOpen={fetchOutlets}
              onChange={(selectedOption) =>
                setSelectedOutlet(selectedOption?.value || "")
              }
              isSearchable
            />
          </div>
        </div>
      </div>

      {selectedArea && plans.length > 0 && (
        <div className="advertisement-card">
          <h3>Available Advertisement Plans</h3>

          <div className="plans-table-wrapper">
            <table className="plans-table">
              <thead>
                <tr>
                  <th>Select</th>
                  <th>Plan Name</th>
                  <th>Price</th>
                  <th>Duration (Days)</th>
                  <th>Radius (KM)</th>
                  <th>Banner Duration Days</th>
                  <th>Banner Slots</th>
                  <th>Best Restaurant Slot</th>
                  <th>Deals Slot</th>
                  <th>WhatsApp Broadcast</th>
                  <th>Video Credits</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((plan) => (
                  <tr
                    key={plan.subscriptionPlanId}
                    className={
                      selectedPlan?.subscriptionPlanId === plan.subscriptionPlanId
                        ? "selected-plan-row"
                        : ""
                    }
                  >
                    <td>
                      <input
                        type="radio"
                        name="selectedPlan"
                        checked={
                          selectedPlan?.subscriptionPlanId ===
                          plan.subscriptionPlanId
                        }
                        onChange={() => setSelectedPlan(plan)}
                      />
                    </td>
                    <td>{plan.planName}</td>
                    <td className="plan-price">{plan.price}</td>
                    <td>{plan.durationInDays}</td>
                    <td>{plan.radiusInKms}</td>
                    <td>{plan.bannerDurationInDays}</td>
                    <td>{plan.bannerSlot}</td>
                    <td>{plan.bestRestaurantSlot}</td>
                    <td>{plan.dealsSlot}</td>
                    <td>{plan.whatsappBroadcast}</td>
                    <td>{plan.videoCredits}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedPlan && (
        <>
          <div className="advertisement-bottom-grid">
            <div className="advertisement-card">
              <h3>Advertisement Dates</h3>

              <div className="form-grid">
                <div className="form-group">
                  <label>
                    Start Date <span className="required-star">*</span>
                  </label>
                  <input
                    type="date"
                    min={today}
                    value={startDate}
                    onChange={(e) => {
                      const selectedDate = e.target.value;
                      setStartDate(selectedDate);

                      if (selectedPlan && selectedPlan.bannerDurationInDays) {
                        const date = new Date(selectedDate);
                        date.setDate(
                          date.getDate() + selectedPlan.bannerDurationInDays
                        );
                        setEndDate(date.toISOString().split("T")[0]);
                      }
                    }}
                  />
                </div>

                <div className="form-group">
                  <label>
                    End Date <span className="required-star">*</span>
                  </label>
                  <input
                    type="date"
                    min={startDate || today}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="advertisement-buttons">
            <button className="cancel-btn">Cancel</button>
            <button className="save-btn" onClick={handleSave}>
              Save
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default AdvertisementOutlets;