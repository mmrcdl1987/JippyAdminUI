import { useEffect, useState } from "react";
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
  setActivePage,
}) {

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
    console.log("States:", response.data);

    setStates(
  Array.isArray(response.data)
    ? response.data
    : []
);

    console.log("First State:", response.data[0]);

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

    const response =
      await getCitiesByState(stateId);

    console.log("Cities:", response.data);

   setCities(
  Array.isArray(response.data)
    ? response.data
    : []
);

   console.log("First City:", response.data[0]);

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

    const response =
      await getAreasByCity(cityId);

    console.log("Areas:", response.data);

    setAreas(
  Array.isArray(response.data)
    ? response.data
    : []
);

   console.log("First Area:", response.data[0]);

  } catch (error) {
    console.log(error);
  }

};

  const handleView = async (id) => {
    try {
      const response = await getSubscriptionPlanById(id);

      setSelectedPlan(response.data.data);

      setActivePage("viewSubscriptionPlan");

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

      alert(response.data.message);

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

    const plans = response.data.data;

    if (!plans || plans.length === 0) {
      alert("No Subscription Plans Found");
      setAreaPlans([]);
      setShowAreaResults(false);
      return;
    }

    setAreaPlans(plans);
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

      <h2 className="sub-page-title">
        Subscription Plan Settings
      </h2>

      <div className="subscription-plan-settings-toolbar-container">

        <button
          className="subscription-plan-settings-create-button"
          onClick={() =>
            setActivePage("createSubscriptionPlan")
          }
        >
          + Create Subscription Plan
        </button>

        <div className="subscription-plan-settings-search-container">

  <select
    className="subscription-plan-settings-search-select"
    value={selectedState}
    onChange={handleStateChange}
  >
    <option value="">Select State</option>

    {Array.isArray(states) &&
      states.map((state) => (
        <option
          key={state.stateId}
          value={state.stateId}
        >
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
        <option
          key={city.cityId}
          value={city.cityId}
        >
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
        <option
          key={area.areaId}
          value={area.areaId}
        >
          {area.areaName}
        </option>
      ))}
  </select>

  <button
    className="subscription-plan-settings-search-button"
    onClick={handleAreaSearch}
  >
    Search
  </button>

</div>

      </div>

      <div className="sub-card">

        <div className="sub-card-header">
          AVAILABLE SUBSCRIPTION PLANS
        </div>

        <div className="sub-table-wrapper">

          <table className="sub-table">

            <thead>

              <tr>

                <th>ID</th>

                <th>Plan Name</th>

                <th>Price</th>

                <th>Duration</th>

                <th>Radius</th>

                <th>Area ID</th>

                <th>Actions</th>

              </tr>

            </thead>

            <tbody>
                            {

                plans.length > 0 ? (

                  plans.map((plan) => (

                    <tr key={plan.subscriptionPlanId}>

                      <td>
                        {plan.subscriptionPlanId}
                      </td>

                      <td>
                        {plan.planName}
                      </td>

                      <td>
                        ₹ {plan.price}
                      </td>

                      <td>
                        {plan.durationInDays} Days
                      </td>

                      <td>
                        {plan.radiusInKms} Km
                      </td>

                      <td>
                        {plan.areaId}
                      </td>

                      <td className="subscription-plan-settings-action-column">

                        <button
                          className="sub-view-btn"
                          onClick={() =>
                            handleView(plan.subscriptionPlanId)
                          }
                        >
                          View
                        </button>

                        <button
                          className="sub-edit-btn"
                          onClick={async () => {

                            try {

                              const response =
                                await getSubscriptionPlanById(
                                  plan.subscriptionPlanId
                                );

                              setSelectedPlan(
                                response.data.data
                              );

                              setActivePage(
                                "editSubscriptionPlan"
                              );

                            } catch (error) {

                              console.log(error);

                            }

                          }}
                        >
                          Edit
                        </button>

                        <button
                          className="sub-delete-btn"
                          onClick={() =>
                            handleDelete(
                              plan.subscriptionPlanId
                            )
                          }
                        >
                          Delete
                        </button>

                      </td>

                    </tr>

                  ))

                ) : (

                  <tr>

                    <td
                      colSpan="7"
                      className="sub-empty-row"
                    >
                      No Subscription Plans Found
                    </td>

                  </tr>

                )

              }

            </tbody>

          </table>

        </div>

      </div>
            {

        
    areaPlans.length > 0 && (

        <div className="sub-card">

            <div className="sub-card-header">
                SEARCH RESULTS
            </div>

            <div
                className="subscription-plan-settings-expand-header"
                onClick={() =>
                    setShowAreaResults(!showAreaResults)
                }
            >

                <span>
                 Area Plans ({areaPlans.length})
                </span>

                <button
                    className="subscription-plan-settings-expand-button"
                >
                    {showAreaResults ? "▲" : "▼"}
                </button>

            </div>

            {
                showAreaResults && (

           
            <div className="sub-table-wrapper">

              <table className="sub-table">

                <thead>

                  <tr>

                    <th>ID</th>

                    <th>Plan Name</th>

                    <th>Price</th>

                    <th>Duration</th>

                    <th>Area</th>

                  </tr>

                </thead>

                <tbody>

                  {

                    areaPlans.map((plan) => (

                      <tr key={plan.subscriptionPlanId}>

                        <td>
                          {plan.subscriptionPlanId}
                        </td>

                        <td>
                          {plan.planName}
                        </td>

                        <td>
                          ₹ {plan.price}
                        </td>

                        <td>
                          {plan.durationInDays} Days
                        </td>

                        <td>
                          {plan.areaId}
                        </td>

                      </tr>

                    ))

                  }

                </tbody>

              </table>

            </div>
                            )
            }

        </div>

      

        )

      }

    </div>

  );

}

export default SubscriptionPlanSettings;
