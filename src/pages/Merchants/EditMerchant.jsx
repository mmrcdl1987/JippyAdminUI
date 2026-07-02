import { useEffect, useState } from "react";
import { FM_API } from "../../services/api";
import "../../styles/Merchants/EditMerchant.css";


function EditMerchant({ setActivePage }) {

  const merchantId = localStorage.getItem("merchantId");
  const [showWorkingHours, setShowWorkingHours] = useState(false);
  const [outlets, setOutlets] = useState([]);
const [selectedOutlet, setSelectedOutlet] = useState("");
useEffect(() => {
    fetchMerchantOutlets();
}, []);

const weekDays = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const fetchMerchantOutlets = async () => {

    try {

        const response = await FM_API.get(
            "/api/fm/outlets/getOutletsByMerchant",
            {
                params: {
                    merchantId: merchantId
                }
            }
        );

        console.log("Merchant Outlets:", response.data);

        setOutlets(response.data);

    } catch (error) {

        console.error("Failed to fetch outlets", error);

    }

};
const fetchOutletDetails = async (outletId) => {

    try {

       const response = await FM_API.get(
    "/api/fm/outlets/outletDetails",
    {
        params: {
            outletId
        }
    }
);

        console.log("Outlet Details", response.data);

        // Later we'll populate the form here

    } catch (error) {

        console.error(error);

    }

};
  return (

    <div className="edit-page">

      {/* Header */}

      <div className="edit-header">

        <div>
          <h1>Edit Outlet</h1>
        </div>
<div className="breadcrumb">
  Dashboard &gt; Outlets &gt; Edit Outlet
</div>

      </div>

      {/* Tabs */}

      <div className="tabs">

        <button className="tab">
          Profile
        </button>

        <button className="tab active">
          Restaurant
        </button>

      </div>

      {/* Restaurant Details */}

      <div className="section">
<div className="section-title">
  OUTLET DETAILS
</div>

        <div className="form-grid">

          <div className="form-group">
           <label>Outlet Name</label>
<select
    value={selectedOutlet}
    onChange={(e) => {

    const outletId = e.target.value;

    setSelectedOutlet(outletId);

    if (outletId) {
        fetchOutletDetails(outletId);
    }

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

          <div className="form-group">
            <label>Offer Label</label>

            <input
              type="text"
              placeholder="Offer Label"
            />
          </div>

          <div className="form-group">
            <label>Cuisine</label>

            <select>
  <option value="">Select Cuisine</option>
</select>
          </div>

          <div className="form-group">
            <label>Category</label>
<select multiple>
</select>

          </div>

          <div className="form-group">
            <label>Phone</label>

            <input
              type="text"
              placeholder="Phone Number"
            />
          </div>

          <div className="form-group">
           <label>Outlet Type</label>
<select>
  <option value="">Select Vendor Type</option>
</select>

          </div>

          <div className="form-group">
            <label>Address</label>

            <input
              type="text"
              placeholder="Address"
            />
          </div>

          <div className="form-group">
            <label>Zone</label>
<select>
  <option value="">Select Zone</option>
</select>
          </div>

          <div className="form-group">
            <label>Latitude</label>

            <input
              type="text"
            />
          </div>

          <div className="form-group">
            <label>Longitude</label>

            <input
              type="text"
            />
          </div>

          <div className="form-group full">

            <label>Description</label>

            <textarea
              rows="5"
            ></textarea>

          </div>

        </div>
        

      </div>
      {/* ================= BANK DETAILS ================= */}

<div className="section">

  <div className="section-title">
    BANK DETAILS
  </div>

  <div className="form-grid">

    <div className="form-group full">
      <label>Bank Name</label>
      <input
        type="text"
        placeholder="Enter Bank Name"
      />
    </div>

    <div className="form-group full">
      <label>Branch Name</label>
      <input
        type="text"
        placeholder="Enter Branch Name"
      />
    </div>

    <div className="form-group full">
      <label>Holder Name</label>
      <input
        type="text"
        placeholder="Enter Holder Name"
      />
    </div>

    <div className="form-group full">
      <label>Account Number</label>
      <input
        type="text"
        placeholder="Enter Account Number"
      />
    </div>

    <div className="form-group full">
      <label>Other Information</label>
      <textarea
        rows="4"
        placeholder="Enter Other Information"
      ></textarea>
    </div>

  </div>

</div>
<div className="section">

  <div className="section-title">
    OUTLET ADMIN COMMISSION
  </div>

  <div className="form-grid">

    <div className="form-group">
      <label>Commission Type</label>

      <select>
        <option value="">Select Commission Type</option>
      </select>
    </div>

    <div className="form-group">
      <label>Admin Commission</label>

      <input
        type="number"
        placeholder="Enter Admin Commission"
      />
    </div>

  </div>

</div>
<div className="section">

  <div className="section-title">
    GALLERY
  </div>

  <p>Photos not available.</p>

  <input
    type="file"
    multiple
  />

</div>
<div className="section">

  <div className="section-title">
    WORKING HOURS
  </div>

  <p className="warning">
    NOTE : Please Click on Edit Button After Making Changes in Working Hours, Otherwise Data may not Save!!
  </p>

  <button
    className="save-btn"
    onClick={() => setShowWorkingHours(true)}
>
    Add Working Hours
</button>
{showWorkingHours && (

<div className="working-hours-list">

    {weekDays.map((day,index)=>(

        <div
            key={index}
            className="working-row"
        >

            <div className="day-name">
                {day}
            </div>

            <button className="mini-btn">
                Add
            </button>

            <div className="time-grid">

                <div>

                    <label>From</label>

                    <input
                        type="time"
                        defaultValue="12:30"
                    />

                </div>

                <div>

                    <label>To</label>

                    <input
                        type="time"
                        defaultValue="23:59"
                    />

                </div>

                <div>

                    <label>Action</label>

                    <button className="delete-btn">
                        🗑
                    </button>

                </div>

            </div>

        </div>

    ))}

</div>

)}

</div>
<div className="section">

  <div className="section-title">
    OUTLET STATUS
  </div>

  <label>

    <input type="checkbox" />

    Open / Closed

  </label>

</div>
<div className="section">

  <div className="section-title">
    DINE IN FEATURE SETTINGS
  </div>

  <label>

    <input type="checkbox" />

    Enable DINE IN Feature

  </label>

</div>
<div className="section">

  <div className="section-title">
    DELIVERY CHARGE
  </div>

  <div className="form-grid">

    <div className="form-group full">

      <label>Delivery Charge Per</label>

      <input type="number" />

    </div>

    <div className="form-group full">

      <label>Minimum Delivery Charges</label>

      <input type="number" />

    </div>

    <div className="form-group full">

      <label>Minimum Delivery Charge Within</label>

      <input type="number" />

    </div>

  </div>

</div>
<div className="section">

  <div className="section-title">
    SPECIAL OFFER
  </div>

  <label>

    <input type="checkbox" />

    Enable Special Discount

  </label>

  <br /><br />

  <button className="save-btn">
    Add Special Offer
  </button>

</div>
<div className="section">

  <div className="section-title">
    STORY
  </div>

  <div className="form-group">

    <label>Choose Humbling GIF / Image</label>

    <input type="file" />

  </div>

  <div className="form-group">

    <label>Select Story Video</label>

    <input type="file" />

  </div>

</div>

      <div className="buttons">

        <button
          className="save-btn"
        >
          Save
        </button>

        <button
          className="cancel-btn"
          onClick={() =>
            setActivePage("outlets")
          }
        >
          Cancel
        </button>

      </div>

    </div>

  );

}

export default EditMerchant;