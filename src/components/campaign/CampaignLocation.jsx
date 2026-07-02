import React, { useEffect, useState } from "react";

import OutletSelection from "./OutletSelection";
import TimeSlotManager from "./TimeSlotManager";
import CampaignDays from "./CampaignDays";

import {
  getStates,
  getCities,
  getAreas,
  getAvailableOutlets,
} from "../../services/campaignApi";

function CampaignLocation() {

  // ===============================
  // Master Data
  // ===============================

  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);
  const [outlets, setOutlets] = useState([]);

  // ===============================
  // Selected Values
  // ===============================

  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedArea, setSelectedArea] = useState("");

  const [selectedOutlets, setSelectedOutlets] = useState([]);

  // ===============================
  // Load States
  // ===============================

  useEffect(() => {
    loadStates();
  }, []);

  const loadStates = async () => {
    try {
      const response = await getStates();
      setStates(response);
    } catch (error) {
      console.error("Failed to load states", error);
    }
  };

  // ===============================
  // State Change
  // ===============================

  const handleStateChange = async (e) => {

    const stateId = e.target.value;

    setSelectedState(stateId);

    setSelectedCity("");
    setSelectedArea("");

    setCities([]);
    setAreas([]);
    setOutlets([]);
    setSelectedOutlets([]);

    if (!stateId) return;

    try {

      const response = await getCities(stateId);

      setCities(response);

    } catch (error) {

      console.error(error);

    }

  };

  // ===============================
  // City Change
  // ===============================

  const handleCityChange = async (e) => {

    const cityId = e.target.value;

    setSelectedCity(cityId);

    setSelectedArea("");

    setAreas([]);
    setOutlets([]);
    setSelectedOutlets([]);

    if (!cityId) return;

    try {

      const response = await getAreas(cityId);

      setAreas(response);

    } catch (error) {

      console.error(error);

    }

  };

  // ===============================
  // Area Change
  // ===============================

  const handleAreaChange = async (e) => {

    const areaId = e.target.value;

    setSelectedArea(areaId);

    setOutlets([]);
    setSelectedOutlets([]);

    if (!areaId) return;

    try {

      const response =
        await getAvailableOutlets(areaId);

      setOutlets(response);

    } catch (error) {

      console.error(error);

    }

  };

  return (

    <div className="card">

      <div className="section-header">

        <h2>Location & Outlets</h2>

        <p>
          Select campaign location and outlet details.
        </p>

      </div>

      <div className="location-layout">

        {/* Left Side */}

        <div className="location-card">

          <div className="form-group">

            <label>State</label>

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

            <label>City</label>

            <select
              value={selectedCity}
              onChange={handleCityChange}
              disabled={!selectedState}
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

            <label>Area</label>

            <select
              value={selectedArea}
              onChange={handleAreaChange}
              disabled={!selectedCity}
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

        </div>

        {/* Middle */}

        <div className="outlet-card">

          <OutletSelection
            outlets={outlets}
            selectedOutlets={selectedOutlets}
            setSelectedOutlets={setSelectedOutlets}
          />

        </div>

        {/* Right */}

        <div className="time-card">

          <TimeSlotManager />

          <CampaignDays />

        </div>

      </div>

    </div>

  );

}

export default CampaignLocation;