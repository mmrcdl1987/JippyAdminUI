import { useEffect, useState } from "react";
import API from "../services/api";
import "../styles/AdvertisementOutlets.css";

function AdvertisementOutlets() {

  const [pricingType, setPricingType] =
    useState("FLAT");

  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);
  const [outlets, setOutlets] = useState([]);

  const [selectedState, setSelectedState] =
    useState("");

  const [selectedCity, setSelectedCity] =
    useState("");

  const [selectedArea, setSelectedArea] =
    useState("");

  const [selectedOutlet, setSelectedOutlet] =
    useState("");

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
        await API.get("/fm/api/outlets");

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

              setSelectedArea(e.target.value);

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

          <label>
            Outlet
            <span className="required-star">*</span>
          </label>

          <select
            value={selectedOutlet}
            onFocus={fetchOutlets}
            onChange={(e) =>
              setSelectedOutlet(
                e.target.value
              )
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

        <div className="plans-table-wrapper">

          <table className="plans-table">

            <thead>

              <tr>

                <th>Select</th>

                <th>Plan Name</th>

                <th>Price</th>

                <th>Radius</th>

                <th>Banner Days</th>

                <th>Banner Slots</th>

                <th>WhatsApp Broadcast</th>

                <th>Video Credits</th>

              </tr>

            </thead>

            <tbody>

              {plans.map((plan) => (

                <tr
                  key={plan.planName}
                  className={
                    selectedPlan?.planName ===
                    plan.planName
                      ? "selected-plan-row"
                      : ""
                  }
                >

                  <td>

                    <input
                      type="radio"
                      name="selectedPlan"
                      checked={
                        selectedPlan?.planName ===
                        plan.planName
                      }
                      onChange={() =>
                        setSelectedPlan(plan)
                      }
                    />

                  </td>

                  <td>
                    {plan.planName}
                  </td>

                  <td className="plan-price">
                    {plan.price}
                  </td>

                  <td>
                    {plan.radius}
                  </td>

                  <td>
                    {plan.bannerDays}
                  </td>

                  <td>
                    {plan.bannerSlots}
                  </td>

                  <td>
                    {plan.whatsappBroadcast}
                  </td>

                  <td>
                    {plan.videoCredits}
                  </td>

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
              onChange={(e) =>
                setStartDate(e.target.value)
              }
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
              min={startDate}
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
    <button className="save-btn">Save</button>
</div>

  </>

)}

</div>

);

}

export default AdvertisementOutlets;