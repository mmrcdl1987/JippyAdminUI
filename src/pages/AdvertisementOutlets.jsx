import { useEffect, useState } from "react";
import Select from "react-select";
import API from "../services/api";
import "../styles/AdvertisementOutlets.css";

function AdvertisementOutlets() {

  const [pricingType, setPricingType] =
    useState("FLAT");

  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);
  const [outlets, setOutlets] = useState([]);

  const [plans, setPlans] = useState([]);

  const [selectedState, setSelectedState] =
    useState("");

  const [selectedCity, setSelectedCity] =
    useState("");

  const [selectedArea, setSelectedArea] =
    useState("");

const [selectedOutlet, setSelectedOutlet] =
  useState(null);   

  const [selectedPlan, setSelectedPlan] =
    useState(null);

  const [startDate, setStartDate] =
    useState("");

  const [endDate, setEndDate] =
    useState("");

  const [amount, setAmount] =
    useState("");

  const [percentage, setPercentage] =
    useState("");

  const [maxAmount, setMaxAmount] =
    useState("");

    const today = new Date().toISOString().split("T")[0];

  useEffect(() => {

  fetchStates();

  

}, []);

  const fetchStates = async () => {

    try {

      const response =
        await API.get(
          "/api/fm/location/fetchStates"
        );

      setStates(
        Array.isArray(response.data)
          ? response.data
          : []
      );

    } catch (error) {

      console.error(error);

    }

  };

  const handleStateChange = async (e) => {

    const stateId = e.target.value;

    setSelectedState(stateId);
    setSelectedCity("");
    setSelectedArea("");
    setSelectedPlan(null);

    setCities([]);
    setAreas([]);

    try {

      const response =
        await API.get(
          `/api/fm/location/fetchCityInState?stateId=${stateId}`
        );

      setCities(response.data);

    } catch (error) {

      console.error(error);

    }

  };

  const handleCityChange = async (e) => {

    const cityId = e.target.value;

    setSelectedCity(cityId);

    try {

      const response =
        await API.get(
          `/api/fm/location/fetchAreaInCity?cityId=${cityId}`
        );

      setAreas(response.data);

    } catch (error) {

      console.error(error);

    }

  };

  

  const fetchOutlets = async () => {

  try {

    const response =
      await API.get("/api/fm/outlets"); 

    setOutlets(response.data.data);

  } catch (error) {

    console.error(error);

  }

};
const fetchSubscriptionPlans = async (areaId) => {

  try {

    const response = await API.get(
      `/api/fm/subscription-plans/area/${areaId}`
    );

    setPlans(response.data.data);

  } catch (error) {

    console.error(error);

    setPlans([]);

  }

};

const handleSave = async () => {

  try {

    const payload = {

      outletId: Number(selectedOutlet),

      subscriptionPlanId:
        selectedPlan.subscriptionPlanId,

      subscriptionFromDate:
        startDate,

      subscriptionToDate:
        endDate,

      bannerSlotDaysId:
        selectedPlan.bannerDurationInDays,

      bannerFromDate:
        startDate,

      bannerToDate:
        endDate,

      mealTypeTimingsIds: [],

      priceModelType: "FLAT",

      offerAmount: 0,

     userId: JSON.parse(
  localStorage.getItem("userData")
).userId

    };

    console.log(payload);
    console.log(
  JSON.stringify(payload, null, 2)
);

console.log("========== PAYLOAD ==========");
console.log(JSON.stringify(payload, null, 2));
console.log("=============================");

    const response = await API.post(
      "/api/fm/outlet-subscription-plans",
      payload
    );

    alert(response.data.message);

  } catch (error) {

  console.log(error);

  console.log(error.response);

  console.log(error.response?.data);

  alert(
    error.response?.data?.message ||
    "Unable to save."
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

        <p>
          Manage advertisement plans for outlets
        </p>

      </div>

    </div>

    <div className="advertisement-card">

      <h3>
        Advertisement Outlet Registration
      </h3>

      <div className="form-grid">

        <div className="form-group">

          <label>
            State
            <span className="required-star">*</span>
          </label>

          <select
            value={selectedState}
            onChange={handleStateChange}
          >

            <option value="">
              Select State
            </option>

            {states.map((state) => (

              <option
                key={state.stateId}
                value={state.stateId}
              >
                {state.stateName}
              </option>

            ))}

          </select>

        </div>

        <div className="form-group">

          <label>
            City
            <span className="required-star">*</span>
          </label>

          <select
            value={selectedCity}
            onChange={handleCityChange}
          >

            <option value="">
              Select City
            </option>

            {cities.map((city) => (

              <option
                key={city.cityId}
                value={city.cityId}
              >
                {city.cityName}
              </option>

            ))}

          </select>

        </div>

        <div className="form-group">

          <label>
            Area
            <span className="required-star">*</span>
          </label>

          <select
            value={selectedArea}
            onChange={(e) => {

  const areaId = e.target.value;

  setSelectedArea(areaId);

  setSelectedPlan(null);

  fetchSubscriptionPlans(areaId);

}}
          >

            <option value="" disabled>
              Select Area
            </option>

            {areas.map((area) => (

              <option
                key={area.areaId}
                value={area.areaId}
              >
                {area.areaName}
              </option>

            ))}

          </select>

        </div>

        <div className="form-group">

          <label>
            Outlet
            <span className="required-star">*</span>
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

    {selectedArea && (

      <div className="advertisement-card">

        <h3>
          Available Advertisement Plans
        </h3>

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
    selectedPlan?.subscriptionPlanId ===
    plan.subscriptionPlanId
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
      onChange={() => {
  console.log("Selected Plan:", plan);
  setSelectedPlan(plan);
}}
    />
  </td>

  <td>{plan.planName}</td>

  <td>{plan.price}</td>

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



      {/* Advertisement Dates */}

      <div className="advertisement-card">

        <h3>
          Advertisement Dates
        </h3>

        <div className="form-grid">

          <div className="form-group">

            <label>
              Start Date
              <span className="required-star">*</span>
            </label>

            <input
  type="date"
  value={startDate}
  min={today}
  onChange={(e) => {

  const selectedDate = e.target.value;

  setStartDate(selectedDate);

  if (
    selectedPlan &&
    selectedPlan.bannerDurationInDays
  ) {

    const date = new Date(selectedDate);

    date.setDate(
      date.getDate() +
      selectedPlan.bannerDurationInDays
    );

    setEndDate(
      date.toISOString().split("T")[0]
    );

  }

}}
/>

          </div>

          <div className="form-group">

            <label>
              End Date
              <span className="required-star">*</span>
            </label>

            <input
  type="date"
  value={endDate}
  min={startDate || today}
  onChange={(e) =>
    setEndDate(e.target.value)
  }
/>

          </div>

        </div>

      </div>

      

    </div>

    <div className="advertisement-buttons">
    <button className="cancel-btn">Cancel</button>
<button
  className="save-btn"
  onClick={handleSave}
>
  Save
</button>

</div>

  </>

)}

</div>

);

}

export default AdvertisementOutlets;