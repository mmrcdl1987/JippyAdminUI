import React, { useEffect, useState } from "react";
import OutletSelection from "./OutletSelection";
import {
  getStates,
  getCities,
  getAreas,
  getCampaignLocation,
  fetchAvailableMealSlots,
} from "../../services/campaignApi";
import "../../styles/campaign/CampaignLocation.css";

function CampaignLocation({ campaignData, setCampaignData }) {
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [mealSlots, setMealSlots] = useState([]);
  const [loadingOutlets, setLoadingOutlets] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    loadStates();
  }, []);

  // Fetch slots whenever Location, Start Date, or End Date change
  useEffect(() => {
    if (campaignData.startDate && campaignData.endDate && campaignData.locationId) {
      loadDynamicMealSlots();
    } else {
      setMealSlots([]);
    }
  }, [
    campaignData.startDate,
    campaignData.endDate,
    campaignData.locationId,
    campaignData.locationType,
  ]);

  const loadStates = async () => {
    try {
      const response = await getStates();
      setStates(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error("Failed to load states:", error);
    }
  };

  const loadDynamicMealSlots = async () => {
    try {
      setLoadingSlots(true);

      const requestPayload = {
        locationId: parseInt(campaignData.locationId, 10),
        locationType: campaignData.locationType || "STATE",
        promotionFromDate: `${campaignData.startDate}T00:00:00`,
        promotionToDate: `${campaignData.endDate}T23:59:59`,
      };

      const response = await fetchAvailableMealSlots(requestPayload);
      setMealSlots(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error("Failed to fetch available meal slots:", error);
      setMealSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const fetchLocationOutlets = async (stateId, cityId, areaId) => {
    if (!stateId) {
      setOutlets([]);
      return;
    }

    try {
      setLoadingOutlets(true);
      const response = await getCampaignLocation(stateId, cityId, areaId);

      let extractedOutlets = [];
      if (Array.isArray(response)) {
        extractedOutlets = response;
      } else if (response) {
        extractedOutlets =
          response.areaOutlets ||
          response.cityOutlets ||
          response.stateOutlets ||
          response.outlets ||
          [];
      }

      setOutlets(extractedOutlets);
    } catch (error) {
      console.error("Failed to fetch outlets:", error);
      setOutlets([]);
    } finally {
      setLoadingOutlets(false);
    }
  };

  const handleStateChange = async (e) => {
    const stateId = e.target.value;

    setCampaignData((prev) => ({
      ...prev,
      stateId,
      cityId: "",
      areaId: "",
      locationId: stateId,
      locationType: "STATE",
      selectedOutlets: [],
      mealTypeSlotIds: [], // Reset selected slots
    }));

    setCities([]);
    setAreas([]);

    if (!stateId) {
      setOutlets([]);
      return;
    }

    try {
      const cityData = await getCities(stateId);
      setCities(Array.isArray(cityData) ? cityData : []);
    } catch (error) {
      console.error("Failed to fetch cities:", error);
    }

    fetchLocationOutlets(stateId, null, null);
  };

  const handleCityChange = async (e) => {
    const cityId = e.target.value;

    setCampaignData((prev) => ({
      ...prev,
      cityId,
      areaId: "",
      locationId: cityId || prev.stateId,
      locationType: cityId ? "CITY" : "STATE",
      selectedOutlets: [],
      mealTypeSlotIds: [], // Reset selected slots
    }));

    setAreas([]);

    if (!cityId) {
      fetchLocationOutlets(campaignData.stateId, null, null);
      return;
    }

    try {
      const areaData = await getAreas(cityId);
      setAreas(Array.isArray(areaData) ? areaData : []);
    } catch (error) {
      console.error("Failed to fetch areas:", error);
    }

    fetchLocationOutlets(campaignData.stateId, cityId, null);
  };

  const handleAreaChange = async (e) => {
    const areaId = e.target.value;

    setCampaignData((prev) => ({
      ...prev,
      areaId,
      locationId: areaId || prev.cityId || prev.stateId,
      locationType: areaId ? "AREA" : prev.cityId ? "CITY" : "STATE",
      selectedOutlets: [],
      mealTypeSlotIds: [], // Reset selected slots
    }));

    if (!areaId) {
      fetchLocationOutlets(campaignData.stateId, campaignData.cityId, null);
      return;
    }

    fetchLocationOutlets(campaignData.stateId, campaignData.cityId, areaId);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "startDate" && campaignData.endDate && value > campaignData.endDate) {
      setCampaignData((prev) => ({
        ...prev,
        startDate: value,
        endDate: "",
        mealTypeSlotIds: [], // Reset selected slots
      }));
      return;
    }

    setCampaignData((prev) => ({ ...prev, [name]: value }));
  };

  // MULTI-SELECT HANDLER
  const handleSlotSelect = (slot) => {
    if (!slot.available) return;

    setCampaignData((prev) => {
      const currentSlotIds = prev.mealTypeSlotIds || [];
      const isSelected = currentSlotIds.includes(slot.mealTypeTimingsId);

      const updatedSlots = isSelected
        ? currentSlotIds.filter((id) => id !== slot.mealTypeTimingsId) // Remove if already selected
        : [...currentSlotIds, slot.mealTypeTimingsId]; // Add if not selected

      return {
        ...prev,
        mealTypeSlotIds: updatedSlots,
      };
    });
  };

  return (
    <div className="section-card">
      <div className="section-title-row">
        <span className="icon-badge">📍</span>
        <div>
          <h2>Location & Outlets</h2>
          <p>Select campaign location, dates, and participating outlets.</p>
        </div>
      </div>

      <div className="location-grid">
        {/* Left Column */}
        <div className="sub-card">
          <h3>🏢 Location</h3>

          <div className="form-group">
            <label>
              State <span className="required">*</span>
            </label>
            <select value={campaignData.stateId || ""} onChange={handleStateChange}>
              <option value="">Select State</option>
              {states.map((state) => (
                <option key={state.stateId || state.id} value={state.stateId || state.id}>
                  {state.stateName || state.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>City</label>
            <select
              value={campaignData.cityId || ""}
              onChange={handleCityChange}
              disabled={!campaignData.stateId}
            >
              <option value="">Select City</option>
              {cities.map((city) => (
                <option key={city.cityId || city.id} value={city.cityId || city.id}>
                  {city.cityName || city.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Area</label>
            <select
              value={campaignData.areaId || ""}
              onChange={handleAreaChange}
              disabled={!campaignData.cityId}
            >
              <option value="">Select Area</option>
              {areas.map((area) => (
                <option key={area.areaId || area.id} value={area.areaId || area.id}>
                  {area.areaName || area.name}
                </option>
              ))}
            </select>
          </div>

          {/* Dates */}
          <div className="date-selection-container">
            <hr className="sub-divider" />
            <h3 className="sub-heading">📅 Campaign Dates</h3>

            <div className="date-fields-grid">
              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  min={today}
                  value={campaignData.startDate || ""}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>End Date</label>
                <input
                  type="date"
                  name="endDate"
                  min={campaignData.startDate || today}
                  value={campaignData.endDate || ""}
                  onChange={handleInputChange}
                  disabled={!campaignData.startDate}
                />
              </div>
            </div>
          </div>

          {/* Meal Time Slots Section */}
          {campaignData.startDate && campaignData.endDate && (
            <div className="meal-slots-container">
              <hr className="sub-divider" />
              <h3 className="sub-heading">⏰ Meal Time Slots</h3>
              <p className="sub-description">
                {loadingSlots
                  ? "Fetching slots from backend..."
                  : "Select one or more available time slots for your campaign:"}
              </p>

              <div className="meal-slots-grid">
                {mealSlots.map((slot) => {
                  const isSelected = (campaignData.mealTypeSlotIds || []).includes(
                    slot.mealTypeTimingsId
                  );

                  return (
                    <div
                      key={slot.mealTypeTimingsId}
                      className={`meal-slot-card ${
                        isSelected ? "selected" : ""
                      } ${!slot.available ? "disabled" : ""}`}
                      onClick={() => handleSlotSelect(slot)}
                    >
                      <div className="slot-header">
                        <span className="slot-title">{slot.mealType}</span>
                      </div>
                      <span className="slot-time">
                        {slot.fromTime} - {slot.toTime}
                      </span>
                      {!slot.available && (
                        <span className="booked-badge">{slot.message}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Outlets */}
        <div className="sub-card">
          {loadingOutlets ? (
            <p className="loading-text">Loading outlets...</p>
          ) : (
            <OutletSelection
              outlets={outlets}
              selectedOutlets={campaignData.selectedOutlets || []}
              setSelectedOutlets={(list) =>
                setCampaignData((prev) => ({ ...prev, selectedOutlets: list }))
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default CampaignLocation;