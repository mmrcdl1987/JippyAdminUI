import { useState, useEffect } from "react";
import Select from "react-select";
import "../styles/CreateOutlet.css";

import {
  createOutlet,
  getAllMerchants,
  getAllStates,
  getCitiesByState,
  getAreasByCity,
} from "../services/masterProductsService";

function CreateOutlet({ setActivePage }) {

  const [outletName, setOutletName] = useState("");
  const [merchantId, setMerchantId] = useState("");
  const [cuisineType, setCuisineType] = useState("");

  const [outletPhone, setOutletPhone] = useState("");
  const [outletEmail, setOutletEmail] = useState("");
  const [alternateOutletPhone, setAlternateOutletPhone] = useState("");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [buildingNumber, setBuildingNumber] = useState("");
  const [road, setRoad] = useState("");
  const [landmark, setLandmark] = useState("");

  const [stateId, setStateId] = useState("");
  const [cityId, setCityId] = useState("");
  const [areaId, setAreaId] = useState("");

  const [areaName, setAreaName] = useState("");
  const [stateName, setStateName] = useState("");

  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [merchants, setMerchants] = useState([]);
const [states, setStates] = useState([]);
const [cities, setCities] = useState([]);
const [areas, setAreas] = useState([]);

  const handleCreate = async () => {

    const payload = {

      outletName,
      merchantId: Number(merchantId),
      cuisineType,

      outletPhone,
      outletEmail,
      alternateOutletPhone,

      username,
      password,

      accountNumber,
      ifscCode,
      bankName,
      accountHolderName,

      buildingNumber,
      road,
      landmark,

      stateId: Number(stateId),
      cityId: Number(cityId),
      areaId: Number(areaId),

      areaName,
      stateName,

      latitude,
      longitude,

      updatedBy: 1,
      uploadedBy: "Admin"

    };

    console.log(payload);

    try {

      const response = await createOutlet(payload);

      console.log(response.data);

      alert("Outlet created successfully.");

      setActivePage("outlets");

    } catch (error) {

      console.error(error);

      alert("Failed to create outlet.");

    }

  };

  //Fetch Merchants & States
  const fetchMerchants = async () => {

  try {

    const response = await getAllMerchants();

    setMerchants(response.data.data);

  } catch (error) {

    console.error(error);

  }

};

const fetchStates = async () => {

  try {

    const response = await getAllStates();
setStates(response.data);

  } catch (error) {

    console.error(error);

  }

};

useEffect(() => {

  fetchMerchants();

  fetchStates();

}, []);

const fetchCities = async (selectedStateId) => {

  try {

    const response =
      await getCitiesByState(selectedStateId);

    setCities(response.data);

  } catch (error) {

    console.error(error);

  }

};

const fetchAreas = async (selectedCityId) => {

  try {

    const response =
      await getAreasByCity(selectedCityId);

    setAreas(response.data);

  } catch (error) {

    console.error(error);

  }

};

  return (

    <div className="create-outlet-page">

      <button
        className="create-outlet-back-btn"
        onClick={() => setActivePage("outlets")}
      >
        ← Back
      </button>

      <h1>Create Outlet</h1>

      <p>
        Fill the details below to create a new outlet.
      </p>

      <form>

        {/* ================= Basic Information ================= */}

        <div className="create-outlet-form-card">

          <h2>🏪 Basic Information</h2>

          <div className="create-outlet-form-grid">

            <div className="create-outlet-form-group">

              <label>Outlet Name</label>

              <input
                type="text"
                value={outletName}
                onChange={(e) => setOutletName(e.target.value)}
              />

            </div>

            <div className="create-outlet-form-group">

              <label>Merchant ID</label>

              <Select
 options={merchants.map((merchant) => ({
  value: merchant.merchantId,
  label: merchant.merchantName,
}))}

  value={
  merchants
    .map((merchant) => ({
      value: merchant.merchantId,
      label: merchant.merchantName,
    }))
    .find((item) => item.value === merchantId) || null
}

  onChange={(selected) =>
    setMerchantId(selected.value)
  }

  placeholder="Select Merchant"

  isSearchable
  
/>

            </div>

            <div className="create-outlet-form-group">

              <label>Cuisine Type</label>

              <input
                type="text"
                value={cuisineType}
                onChange={(e) => setCuisineType(e.target.value)}
              />

            </div>

            <div className="create-outlet-form-group">

              <label>Outlet Phone</label>

              <input
                type="text"
                value={outletPhone}
                onChange={(e) => setOutletPhone(e.target.value)}
              />

            </div>

            <div className="create-outlet-form-group">

              <label>Outlet Email</label>

              <input
                type="email"
                value={outletEmail}
                onChange={(e) => setOutletEmail(e.target.value)}
              />

            </div>

            <div className="create-outlet-form-group">

              <label>Alternate Phone</label>

              <input
                type="text"
                value={alternateOutletPhone}
                onChange={(e) =>
                  setAlternateOutletPhone(e.target.value)
                }
              />

            </div>

            <div className="create-outlet-form-group">

              <label>Username</label>

              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />

            </div>

            <div className="create-outlet-form-group">

              <label>Password</label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

            </div>

          </div>

        </div>

        {/* ================= Address ================= */}

        <div className="create-outlet-form-card">

          <h2>📍 Address & Location</h2>

          <div className="create-outlet-form-grid">

            <div className="create-outlet-form-group">

              <label>Building Number</label>

              <input
                type="text"
                value={buildingNumber}
                onChange={(e) =>
                  setBuildingNumber(e.target.value)
                }
              />

            </div>

            <div className="create-outlet-form-group">

              <label>Road</label>

              <input
                type="text"
                value={road}
                onChange={(e) => setRoad(e.target.value)}
              />

            </div>

            <div className="create-outlet-form-group">

              <label>Landmark</label>

              <input
                type="text"
                value={landmark}
                onChange={(e) =>
                  setLandmark(e.target.value)
                }
              />

            </div>

            <div className="create-outlet-form-group">

              <label>State ID</label>

             <Select
  options={states.map((state) => ({
    value: state.stateId,
    label: state.stateName,
  }))}

  value={
    states
      .map((state) => ({
        value: state.stateId,
        label: state.stateName,
      }))
      .find((item) => item.value === stateId) || null
  }

  onChange={(selected) => {

    setStateId(selected.value);

    setStateName(selected.label);

    setCityId("");

    setAreaId("");

    setCities([]);

    setAreas([]);

    fetchCities(selected.value);

  }}

  placeholder="Select State"

  isSearchable
/>

            </div>

            <div className="create-outlet-form-group">

              <label>City ID</label>

            <Select
  options={cities.map((city) => ({
    value: city.cityId,
    label: city.cityName,
  }))}

  value={
    cities
      .map((city) => ({
        value: city.cityId,
        label: city.cityName,
      }))
      .find((item) => item.value === cityId) || null
  }

  onChange={(selected) => {

    setCityId(selected.value);

    setAreaId("");

    setAreas([]);

    fetchAreas(selected.value);

  }}

  placeholder="Select City"

  isSearchable
/>

            </div>

            <div className="create-outlet-form-group">

              <label>Area ID</label>

              <Select
  options={areas.map((area) => ({
    value: area.areaId,
    label: area.areaName,
  }))}

  value={
    areas
      .map((area) => ({
        value: area.areaId,
        label: area.areaName,
      }))
      .find((item) => item.value === areaId) || null
  }

  onChange={(selected) => {

    setAreaId(selected.value);

    setAreaName(selected.label);

  }}

  placeholder="Select Area"

  isSearchable
/>

            </div>

                        <div className="create-outlet-form-group">

              <label>Area Name</label>

              <input
                type="text"
                value={areaName}
                onChange={(e) => setAreaName(e.target.value)}
              />

            </div>

            <div className="create-outlet-form-group">

              <label>State Name</label>

              <input
                type="text"
                value={stateName}
                onChange={(e) => setStateName(e.target.value)}
              />

            </div>

            <div className="create-outlet-form-group">

              <label>Latitude</label>

              <input
                type="text"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
              />

            </div>

            <div className="create-outlet-form-group">

              <label>Longitude</label>

              <input
                type="text"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
              />

            </div>

          </div>

        </div>

        {/* ================= Bank Details ================= */}

        <div className="create-outlet-form-card">

          <h2>🏦 Bank Details</h2>

          <div className="create-outlet-form-grid">

            <div className="create-outlet-form-group">

              <label>Account Number</label>

              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
              />

            </div>

            <div className="create-outlet-form-group">

              <label>IFSC Code</label>

              <input
                type="text"
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value)}
              />

            </div>

            <div className="create-outlet-form-group">

              <label>Bank Name</label>

              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
              />

            </div>

            <div className="create-outlet-form-group">

              <label>Account Holder Name</label>

              <input
                type="text"
                value={accountHolderName}
                onChange={(e) =>
                  setAccountHolderName(e.target.value)
                }
              />

            </div>

          </div>

        </div>

        {/* ================= Buttons ================= */}

        <div className="create-outlet-button-group">

          <button
            type="button"
            className="create-outlet-cancel-btn"
            onClick={() => setActivePage("outlets")}
          >
            Cancel
          </button>

          <button
            type="button"
            className="create-outlet-save-btn"
            onClick={handleCreate}
          >
            Create Outlet
          </button>

        </div>

      </form>

    </div>

  );

}

export default CreateOutlet;