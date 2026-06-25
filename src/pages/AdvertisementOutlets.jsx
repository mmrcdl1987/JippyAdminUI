import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/AdvertisementOutlets.css";

function AdvertisementOutlets() {
    const token = localStorage.getItem("token");

  const [pricingType, setPricingType] =
    useState("FLAT");

  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);

const [outlets, setOutlets] = useState([]);
const [selectedOutlet, setSelectedOutlet] = useState("");

  const [selectedState, setSelectedState] =
    useState("");

  const [selectedCity, setSelectedCity] =
    useState("");

  const [selectedArea, setSelectedArea] =
    useState("");

  const [selectedPlan, setSelectedPlan] =
    useState(null);

  useEffect(() => {
    fetchStates();
  }, []);

  const fetchStates = async () => {
    try {
const token =
  localStorage.getItem("token");

const response = await axios.get(
  "api/fm/location/fetchStates",
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

      setStates(response.data);

    } catch (error) {

      console.error(error);

    }
  };

  const handleStateChange = async (e) => {

  const stateId = e.target.value;

  setSelectedState(stateId);
  setSelectedCity("");
  setSelectedArea("");
setCities([]);
setAreas([]);
  try {

    const token =
      localStorage.getItem("token");

    const response = await axios.get(
      `api/fm/location/fetchCityInState?stateId=${stateId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log(response.data);

    setCities(response.data);

  } catch (error) {
    console.error(error);
  }
};

 const handleCityChange = async (e) => {

  const cityId = e.target.value;

  setSelectedCity(cityId);

  try {

    const token =
      localStorage.getItem("token");

    const response = await axios.get(
      `api/fm/location/fetchAreaInCity?cityId=${cityId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log(response.data);

    setAreas(response.data);

  } catch (error) {
    console.error(error);
  }
};
const fetchOutlets = async () => {
  try {

    const token =
      localStorage.getItem("token");

    const response = await axios.get(
      "fm/api/outlets",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("Outlets API", response.data);

    setOutlets(response.data.data);

  } catch (error) {
    console.error(error);
  }
};

  const plans = [
    {
      planName: "Basic",
      price: "Free",
      radius: "3 Km",
      bannerDays: "0",
      bannerSlots: "-",
      whatsappBroadcast: "No",
      videoCredits: "No",
    },
    {
      planName: "Premium",
      price: "₹1299",
      radius: "5 Km",
      bannerDays: "10",
      bannerSlots: "4 & 5 Position",
      whatsappBroadcast: "Monthly 1 Time",
      videoCredits: "No",
    },
    {
      planName: "Ultra",
      price: "₹1999",
      radius: "7 Km",
      bannerDays: "15",
      bannerSlots: "2 & 3 Position",
      whatsappBroadcast: "Monthly 2 Times",
      videoCredits: "Yes",
    },
    {
      planName: "Ultra Premium",
      price: "₹2299",
      radius: "9 Km",
      bannerDays: "20",
      bannerSlots: "Top Position",
      whatsappBroadcast: "Weekly",
      videoCredits: "Yes",
    },
    {
      planName: "Advance",
      price: "₹3999",
      radius: "9+ Km",
      bannerDays: "30",
      bannerSlots: "1st Position",
      whatsappBroadcast: "Unlimited",
      videoCredits: "Yes",
    },
  ];

  return (

    <div className="advertisement-page">

      <div className="page-header">
        <h2>Advertisement Outlets</h2>
        <p>
          Manage advertisement plans for outlets
        </p>
      </div>

      <div className="advertisement-card">

        <h3>
          Advertisement Outlet Registration
        </h3>

        <div className="form-grid">

          <div className="form-group">
            <label>State *</label>

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
            <label>City *</label>

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
            <label>Area *</label>

            <select
              value={selectedArea}
              onChange={(e) => {
                setSelectedArea(
                  e.target.value
                );
                setSelectedPlan(null);
              }}
            >
              <option value="">
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
  <label>Outlet *</label>

  <select
  value={selectedOutlet}
  onFocus={fetchOutlets}
  onChange={(e) =>
    setSelectedOutlet(e.target.value)
  }
>
    <option value="">
      Select Outlet
    </option>

    {outlets.map((outlet) => (
      <option
        key={outlet.outletId}
        value={outlet.outletId}
      >
        {outlet.outletName}
      </option>
    ))}
  </select>
</div>

        </div>

      </div>

      {selectedArea && (

        <div className="advertisement-card">

          <h3>
            Available Advertisement Plans
          </h3>

          <div className="plans-grid">

            {plans.map((plan) => (

              <div
                key={plan.planName}
                className="plan-card"
              >

                <h4>
                  {plan.planName}
                </h4>

                <h2>
                  {plan.price}
                </h2>

                <p>
                  Radius :
                  {plan.radius}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedPlan(plan)
                  }
                >
                  Select Plan
                </button>

              </div>

            ))}

          </div>

        </div>

      )}

      {selectedPlan && (

        <div className="advertisement-card">

          <h3>
            Selected Plan Details
          </h3>

          <div className="details-grid">

            <div>Plan Name</div>
            <div>{selectedPlan.planName}</div>

            <div>Price</div>
            <div>{selectedPlan.price}</div>

            <div>Radius</div>
            <div>{selectedPlan.radius}</div>

            <div>Banner Days</div>
            <div>{selectedPlan.bannerDays}</div>

            <div>Banner Slots</div>
            <div>{selectedPlan.bannerSlots}</div>

            <div>WhatsApp Broadcast</div>
            <div>{selectedPlan.whatsappBroadcast}</div>

            <div>Video Credits</div>
            <div>{selectedPlan.videoCredits}</div>

          </div>

        </div>

      )}

      {selectedPlan && (

        <div className="advertisement-card">

          <h3>
            Advertisement Pricing
          </h3>

          <div className="form-grid">

            <div className="form-group">

              <label>
                Pricing Type
              </label>

              <select
                value={pricingType}
                onChange={(e) =>
                  setPricingType(
                    e.target.value
                  )
                }
              >
                <option value="FLAT">
                  Flat Amount
                </option>

                <option value="PERCENTAGE">
                  Percentage
                </option>
              </select>

            </div>

            {pricingType === "FLAT" ? (

              <div className="form-group">

                <label>
                  Amount
                </label>

                <input
                  type="number"
                  placeholder="Enter Amount"
                />

              </div>

            ) : (

              <>
                <div className="form-group">

                  <label>
                    Percentage
                  </label>

                  <input
                    type="number"
                    placeholder="Enter Percentage"
                  />

                </div>

                <div className="form-group">

                  <label>
                    Maximum Amount
                  </label>

                  <input
                    type="number"
                    placeholder="Enter Max Amount"
                  />

                </div>
              </>

            )}

          </div>

        </div>

      )}

      <div className="button-group">

        <button className="cancel-btn">
          Cancel
        </button>

        <button className="save-btn">
          Save Advertisement
        </button>

      </div>

    </div>
  );
}

export default AdvertisementOutlets;