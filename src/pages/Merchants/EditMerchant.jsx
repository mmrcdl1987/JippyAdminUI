import { useEffect, useState } from "react";
import { FiArrowLeft } from "react-icons/fi";
import "../../styles/Merchants/EditMerchant.css";
import {
  getOutletsByMerchant,
  getStates,
  getCitiesByState,
  getAreasByCity,
    updateOutlet,
} from "../../services/outletService";



const EditMerchant = ({ setActivePage }) => {
 
  const merchantId = localStorage.getItem("merchantId");

  

  const [outlets, setOutlets] = useState([]);
  const [states, setStates] = useState([]);
const [cities, setCities] = useState([]);
const [areas, setAreas] = useState([]);

const [selectedState, setSelectedState] = useState("");
const [selectedCity, setSelectedCity] = useState("");

const [loading, setLoading] = useState(false);

  const [merchant, setMerchant] = useState({
  
    outletId: "",
      outletName: "",
    email: "",
    phone: "",
    alternatePhone: "",
    cuisine: "",

    favourite: false,
    available: true,

    buildingNumber: "",
    roadName: "",
    landmark: "",
    state: "",
    city: "",
    area: "",
    latitude: "",
    longitude: "",

    accountHolder: "",
    bankName: "",
    accountNumber: "",
    ifscCode: ""
  });

  useEffect(() => {
  fetchOutlets();
  loadStates();
}, []);
const loadStates = async () => {

  try {

    const response = await getStates();

    setStates(response.data);

  } catch (error) {

    console.log(error);

  }

};

const loadCities = async (stateId) => {

  try {

    const response =
      await getCitiesByState(stateId);

    setCities(response.data);

    setAreas([]);

  } catch (error) {

    console.log(error);

  }

};

const loadAreas = async (cityId) => {

  try {

    const response =
      await getAreasByCity(cityId);

    setAreas(response.data);

  } catch (error) {

    console.log(error);

  }

};
const fetchOutlets = async () => {
    try {

        const response = await getOutletsByMerchant(merchantId);

        console.log("Outlets:", response);

    setOutlets(response);

if (response.length > 0) {

  setMerchant((prev) => ({

    ...prev,

    outletId: response[0].outletId,

    outletName: response[0].outletName,

  }));

}

    } catch (error) {

        console.error("Error fetching outlets:", error);

    }
};

const handleUpdate = async () => {

  try {

    setLoading(true);

    const payload = {

      ...merchant,

      stateId: Number(selectedState),

      cityId: Number(selectedCity),

      areaId: Number(merchant.area),

    };

    console.log("Merchant:", merchant);

console.log("Outlet Id:", merchant.outletId);

console.log("Payload:", payload); 

    await updateOutlet(
      merchant.outletId,
      "merchant",
      payload
    );

    alert("Outlet updated successfully.");

    setActivePage("outlets");

  } catch (error) {

    console.log(error);

    alert(
      error.response?.data?.errorMessage ||
      error.response?.data?.message ||
      "Unable to update outlet."
    );

  } finally {

    setLoading(false);

  }

};

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;

    setMerchant((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <div className="edit-merchant-page">

      <div className="edit-merchant-card">

        <button
          className="edit-merchant-back-btn"
          onClick={() => setActivePage("outlets")}
        >
          <FiArrowLeft />
          Back
        </button>

        <h2 className="edit-merchant-title">
          Edit Outlet
        </h2>

        {/* ================= Outlet Information ================= */}

        <div className="edit-merchant-section">

          <div className="edit-merchant-section-header">
            Outlet Information
          </div>

          <div className="edit-merchant-grid">

            <div className="edit-merchant-field">
              <label>Outlet Name</label>
              <select
    name="outletId"
    value={merchant.outletId}
   onChange={(e) => {

  const outlet = outlets.find(
    (item) => item.outletId === Number(e.target.value)
  );

  setMerchant((prev) => ({
    ...prev,
    outletId: outlet.outletId,
    outletName: outlet.outletName,
    phone: outlet.outletPhone,
  }));

}}
>
    <option value="">Select Outlet</option>

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

            {/* <div className="edit-merchant-field">
              <label>Outlet ID</label>
              <input
                type="text"
                name="outletId"
                value={merchant.outletId}
                disabled
              />
            </div> */}

            <div className="edit-merchant-field">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={merchant.email}
                onChange={handleChange}
              />
            </div>

            <div className="edit-merchant-field">
              <label>Phone</label>
              <input
                type="text"
                name="phone"
                value={merchant.phone}
                onChange={handleChange}
              />
            </div>

            <div className="edit-merchant-field">
              <label>Alternate Phone</label>
              <input
                type="text"
                name="alternatePhone"
                value={merchant.alternatePhone}
                onChange={handleChange}
              />
            </div>

            <div className="edit-merchant-field">
              <label>Cuisine</label>

              <select
                name="cuisine"
                value={merchant.cuisine}
                onChange={handleChange}
              >
                <option>Select Cuisine</option>
                <option>Indian</option>
                <option>Chinese</option>
                <option>Italian</option>
                <option>Fast Food</option>
              </select>

            </div>

          </div>

          <div className="edit-merchant-checkbox-row">

            <label className="edit-merchant-checkbox">

              <input
                type="checkbox"
                name="favourite"
                checked={merchant.favourite}
                onChange={handleChange}
              />

              Favourite

            </label>

            <label className="edit-merchant-checkbox">

              <input
                type="checkbox"
                name="available"
                checked={merchant.available}
                onChange={handleChange}
              />

              Available

            </label>

          </div>

        </div>

                {/* ================= Address Details ================= */}

        <div className="edit-merchant-section">

          <div className="edit-merchant-section-header">
            Address Details
          </div>

          <div className="edit-merchant-grid">

            <div className="edit-merchant-field">
              <label>Building Number</label>
              <input
                type="text"
                name="buildingNumber"
                value={merchant.buildingNumber}
                onChange={handleChange}
              />
            </div>

            <div className="edit-merchant-field">
              <label>Road / Street Name</label>
              <input
                type="text"
                name="roadName"
                value={merchant.roadName}
                onChange={handleChange}
              />
            </div>

            <div className="edit-merchant-field">
              <label>Landmark</label>
              <input
                type="text"
                name="landmark"
                value={merchant.landmark}
                onChange={handleChange}
              />
            </div>

            <div className="edit-merchant-field">
              <label>State</label>

<select
  name="state"
  value={selectedState}
  onChange={(e) => {

    const value = e.target.value;

    setSelectedState(value);

    setSelectedCity("");

    setMerchant((prev) => ({
      ...prev,
      state: value,
      city: "",
      area: "",
    }));

    loadCities(value);

  }}
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

            <div className="edit-merchant-field">
              <label>City</label>

              <select
                name="city"
                value={selectedCity}
                onChange={(e) => {

                  const value = e.target.value;

                  setSelectedCity(value);

                  setMerchant((prev) => ({
                    ...prev,
                    city: value,
                    area: "",
                  }));

                  loadAreas(value);

                }}
              >
                <option>Select City</option>
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

            <div className="edit-merchant-field">
              <label>Area</label>

             <select
  value={merchant.area}
  onChange={(e) =>
    setMerchant((prev) => ({
      ...prev,
      area: e.target.value,
    }))
  }
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

            <div className="edit-merchant-field">
              <label>Latitude</label>
              <input
                type="text"
                name="latitude"
                value={merchant.latitude}
                onChange={handleChange}
              />
            </div>

            <div className="edit-merchant-field">
              <label>Longitude</label>
              <input
                type="text"
                name="longitude"
                value={merchant.longitude}
                onChange={handleChange}
              />
            </div>

          </div>

        </div>

        {/* ================= Bank Details ================= */}

        <div className="edit-merchant-section">

          <div className="edit-merchant-section-header">
            Bank Details
          </div>

          <div className="edit-merchant-grid">

            <div className="edit-merchant-field">
              <label>Account Holder</label>
              <input
                type="text"
                name="accountHolder"
                value={merchant.accountHolder}
                onChange={handleChange}
              />
            </div>

            <div className="edit-merchant-field">
              <label>Bank Name</label>
              <input
                type="text"
                name="bankName"
                value={merchant.bankName}
                onChange={handleChange}
              />
            </div>

            <div className="edit-merchant-field">
              <label>Account Number</label>
              <input
                type="text"
                name="accountNumber"
                value={merchant.accountNumber}
                onChange={handleChange}
              />
            </div>

            <div className="edit-merchant-field">
              <label>IFSC Code</label>
              <input
                type="text"
                name="ifscCode"
                value={merchant.ifscCode}
                onChange={handleChange}
              />
            </div>

          </div>

        </div>

                {/* ================= Outlet Timings ================= */}

        <div className="edit-merchant-section">

          <div className="edit-merchant-section-header">
            Outlet Timings
          </div>

          <table className="edit-merchant-timing-table">

            <thead>
              <tr>
                <th>DAY</th>
                <th>OPEN</th>
                <th>START TIME</th>
                <th>END TIME</th>
              </tr>
            </thead>

            <tbody>

              {[
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday",
              ].map((day, index) => (
                <tr key={day}>

                  <td>{day}</td>

                  <td>
                    <input
                      type="checkbox"
                      defaultChecked
                    />
                  </td>

                  <td>
                    <input
                      type="time"
                      defaultValue="09:00"
                      className="edit-merchant-time-input"
                    />
                  </td>

                  <td>
                    <input
                      type="time"
                      defaultValue="22:00"
                      className="edit-merchant-time-input"
                    />
                  </td>

                </tr>
              ))}

            </tbody>

          </table>

        </div>

                {/* ================= Categories ================= */}

        <div className="edit-merchant-section">

          <div className="edit-merchant-section-header">
            Categories
          </div>

          <div className="edit-merchant-category-card">

            <div className="edit-merchant-category-header">

              <div className="edit-merchant-category-title">
                ▼ Chicken
              </div>

              <label className="edit-merchant-checkbox">
                <input
                  type="checkbox"
                  defaultChecked
                />
                Category Available
              </label>

            </div>

            <div className="edit-merchant-product-card">

              <div className="edit-merchant-grid">

                <div className="edit-merchant-field">
                  <label>Product Name</label>
                  <input
                    type="text"
                    defaultValue="Chicken Grill"
                  />
                </div>

                <div className="edit-merchant-field">
                  <label>Price</label>
                  <input
                    type="number"
                    defaultValue="250"
                  />
                </div>

              </div>

              <div className="edit-merchant-field">
                <label>Description</label>

                <textarea
                  rows="3"
                  defaultValue="Juicy grilled chicken"
                />
              </div>

              <div className="edit-merchant-checkbox-row">

                <label className="edit-merchant-checkbox">
                  <input type="checkbox" />
                  Veg
                </label>

                <label className="edit-merchant-checkbox">
                  <input
                    type="checkbox"
                    defaultChecked
                  />
                  Available
                </label>

              </div>

              <hr className="edit-merchant-divider" />

              <h4 className="edit-merchant-sub-heading">
                Variants
              </h4>

              <div className="edit-merchant-variant-row">

                <div className="edit-merchant-variant-box">

                  <label>Small</label>

                  <input
                    type="number"
                    defaultValue="120"
                  />

                </div>

                <div className="edit-merchant-variant-box">

                  <label>Medium</label>

                  <input
                    type="number"
                    defaultValue="180"
                  />

                </div>

                <div className="edit-merchant-variant-box">

                  <label>Large</label>

                  <input
                    type="number"
                    defaultValue="250"
                  />

                </div>

              </div>

              <hr className="edit-merchant-divider" />

              <h4 className="edit-merchant-sub-heading">
                Product Timings
              </h4>

              <table className="edit-merchant-product-table">

                <thead>

                  <tr>
                    <th>DAY</th>
                    <th>TIMING WINDOW</th>
                  </tr>

                </thead>

                <tbody>

                  {[
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                    "Sunday",
                  ].map((day) => (

                    <tr key={day}>

                      <td>{day}</td>

                      <td>

                        <div className="edit-merchant-time-window">

                          <input
                            type="time"
                            defaultValue="09:00"
                            className="edit-merchant-time-input"
                          />

                          <span>-</span>

                          <input
                            type="time"
                            defaultValue="18:00"
                            className="edit-merchant-time-input"
                          />

                        </div>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>

        </div>
                <div className="edit-merchant-footer">

          <button
            className="edit-merchant-cancel-btn"
            onClick={() => setActivePage("outlets")}
          >
            Cancel
          </button>

          <button
  className="edit-merchant-save-btn"
  onClick={handleUpdate}
  disabled={loading}
>
  {loading ? "Updating..." : "Update"}
</button>

        </div>

      </div>

    </div>
  );
};

export default EditMerchant;