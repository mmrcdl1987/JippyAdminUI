import { useEffect, useState } from "react";
import "../styles/SubscriptionPlanSettings.css";

import {
  getAllSubscriptionPlans,
  getSubscriptionPlanById,
  createSubscriptionPlan,
  deleteSubscriptionPlan,
  getSubscriptionPlansByArea,
} from "../services/subscriptionPlanSettingsService";

function SubscriptionPlanSettings() {

const [plans,setPlans]=useState([]);

const [selectedPlan,setSelectedPlan]=useState(null);

const [areaPlans,setAreaPlans]=useState([]);

const [loading,setLoading]=useState(false);

const [areaId,setAreaId]=useState("");

const [formData,setFormData]=useState({

planName:"",

price:"",

durationInDays:"",

bannerDurationInDays:"",

radiusInKms:"",

bannerSlot:"",

bestRestaurantSlot:"",

dealsSlot:"",

whatsappBroadcast:"",

videoCredits:"",

areaId:"",

userId:""

});

useEffect(()=>{

fetchPlans();

},[]);

const fetchPlans=async()=>{

try{

const response=await getAllSubscriptionPlans();

setPlans(response.data.data);

}catch(error){

console.log(error);

}

};

const handleChange=(e)=>{

const {name,value}=e.target;

setFormData((prev)=>({

...prev,

[name]:value

}));

};

const handleSave=async()=>{

try{

setLoading(true);

const response=await createSubscriptionPlan(formData);

alert(response.data.message);

fetchPlans();

}catch(error){

console.log(error);

alert(
error.response?.data?.errors?.[0] ||
"Unable to create plan."
);

}finally{

setLoading(false);

}

};

const handleView=async(id)=>{

try{

const response=

await getSubscriptionPlanById(id);

setSelectedPlan(response.data.data);

}catch(error){

console.log(error);

}

};

const handleDelete=async(id)=>{

if(!window.confirm("Delete Subscription Plan?")) return;

try{

const response=

await deleteSubscriptionPlan(id);

alert(response.data.message);

fetchPlans();

}catch(error){

alert(
error.response?.data?.message ||
"Unable to delete."
);

}

};

const handleAreaSearch=async()=>{

try{

const response=

await getSubscriptionPlansByArea(areaId);

setAreaPlans(response.data.data);

}catch(error){

console.log(error);

}

};

return(

<div className="sub-page-wrapper">

<h2 className="sub-page-title">

Subscription Plan Settings

</h2>


      <div className="sub-card">

        <div className="sub-card-header">
          CREATE SUBSCRIPTION PLAN
        </div>

        <div className="sub-form-grid">

          <div className="sub-form-group">
            <label className="sub-form-label">Plan Name</label>

            <input
              className="sub-form-input"
              type="text"
              name="planName"
              value={formData.planName}
              onChange={handleChange}
            />
          </div>

          <div className="sub-form-group">
            <label className="sub-form-label">Price</label>

            <input
              className="sub-form-input"
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
            />
          </div>

          <div className="sub-form-group">
            <label className="sub-form-label">
              Duration (Days)
            </label>

            <input
              className="sub-form-input"
              type="number"
              name="durationInDays"
              value={formData.durationInDays}
              onChange={handleChange}
            />
          </div>

          <div className="sub-form-group">
            <label className="sub-form-label">
              Banner Duration (Days)
            </label>

            <input
              className="sub-form-input"
              type="number"
              name="bannerDurationInDays"
              value={formData.bannerDurationInDays}
              onChange={handleChange}
            />
          </div>

          <div className="sub-form-group">
            <label className="sub-form-label">
              Radius (KM)
            </label>

            <input
              className="sub-form-input"
              type="number"
              name="radiusInKms"
              value={formData.radiusInKms}
              onChange={handleChange}
            />
          </div>

          <div className="sub-form-group">
            <label className="sub-form-label">
              Banner Slot
            </label>

            <input
              className="sub-form-input"
              type="number"
              name="bannerSlot"
              value={formData.bannerSlot}
              onChange={handleChange}
            />
          </div>

          <div className="sub-form-group">
            <label className="sub-form-label">
              Best Restaurant Slot
            </label>

            <input
              className="sub-form-input"
              type="number"
              name="bestRestaurantSlot"
              value={formData.bestRestaurantSlot}
              onChange={handleChange}
            />
          </div>

          <div className="sub-form-group">
            <label className="sub-form-label">
              Deals Slot
            </label>

            <input
              className="sub-form-input"
              type="number"
              name="dealsSlot"
              value={formData.dealsSlot}
              onChange={handleChange}
            />
          </div>

          <div className="sub-form-group">
            <label className="sub-form-label">
              WhatsApp Broadcast
            </label>

            <input
              className="sub-form-input"
              type="text"
              name="whatsappBroadcast"
              value={formData.whatsappBroadcast}
              onChange={handleChange}
            />
          </div>

          <div className="sub-form-group">
            <label className="sub-form-label">
              Video Credits
            </label>

            <input
              className="sub-form-input"
              type="text"
              name="videoCredits"
              value={formData.videoCredits}
              onChange={handleChange}
            />
          </div>

          <div className="sub-form-group">
            <label className="sub-form-label">
              Area ID
            </label>

            <input
              className="sub-form-input"
              type="number"
              name="areaId"
              value={formData.areaId}
              onChange={handleChange}
            />
          </div>

          <div className="sub-form-group">
            <label className="sub-form-label">
              User ID
            </label>

            <input
              className="sub-form-input"
              type="number"
              name="userId"
              value={formData.userId}
              onChange={handleChange}
            />
          </div>

        </div>

        <div className="sub-button-wrapper">

          <button
            className="sub-save-btn"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Subscription Plan"}
          </button>

        </div>

      </div>
            {/* Subscription Plans List */}

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

                <th>Area</th>

                <th>Actions</th>

              </tr>

            </thead>

            <tbody>

              {
                plans.length > 0 ?

                plans.map((plan)=>(

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

                    <td>

                      <button
                        className="sub-view-btn"
                        onClick={()=>
                          handleView(
                            plan.subscriptionPlanId
                          )
                        }
                      >
                        View
                      </button>

                      <button
                        className="sub-delete-btn"
                        onClick={()=>
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

                :

                <tr>

                  <td
                    colSpan="7"
                    className="sub-empty-row"
                  >
                    No Subscription Plans Found
                  </td>

                </tr>

              }

            </tbody>

          </table>

        </div>

      </div>
            {/* Subscription Plan Details */}

      {
        selectedPlan && (

          <div className="sub-card">

            <div className="sub-card-header">
              SUBSCRIPTION PLAN DETAILS
            </div>

            <div className="sub-details-grid">

              <div><strong>Plan Name :</strong> {selectedPlan.planName}</div>

              <div><strong>Price :</strong> ₹ {selectedPlan.price}</div>

              <div><strong>Duration :</strong> {selectedPlan.durationInDays} Days</div>

              <div><strong>Banner Duration :</strong> {selectedPlan.bannerDurationInDays} Days</div>

              <div><strong>Radius :</strong> {selectedPlan.radiusInKms} Km</div>

              <div><strong>Banner Slot :</strong> {selectedPlan.bannerSlot}</div>

              <div><strong>Best Restaurant Slot :</strong> {selectedPlan.bestRestaurantSlot}</div>

              <div><strong>Deals Slot :</strong> {selectedPlan.dealsSlot}</div>

              <div><strong>WhatsApp Broadcast :</strong> {selectedPlan.whatsappBroadcast}</div>

              <div><strong>Video Credits :</strong> {selectedPlan.videoCredits}</div>

              <div><strong>Area ID :</strong> {selectedPlan.areaId}</div>

            </div>

          </div>

        )
      }


      {/* Search Plans By Area */}

      <div className="sub-card">

        <div className="sub-card-header">

          SEARCH PLANS BY AREA

        </div>

        <div className="sub-area-search">

          <input

            className="sub-form-input"

            type="number"

            placeholder="Enter Area ID"

            value={areaId}

            onChange={(e)=>setAreaId(e.target.value)}

          />

          <button

            className="sub-search-btn"

            onClick={handleAreaSearch}

          >

            Search

          </button>

        </div>


        {

          areaPlans.length>0 && (

            <table className="sub-table">

              <thead>

                <tr>

                  <th>ID</th>

                  <th>Plan</th>

                  <th>Price</th>

                  <th>Duration</th>

                  <th>Area</th>

                </tr>

              </thead>

              <tbody>

                {

                  areaPlans.map((plan)=>(

                    <tr key={plan.subscriptionPlanId}>

                      <td>{plan.subscriptionPlanId}</td>

                      <td>{plan.planName}</td>

                      <td>₹ {plan.price}</td>

                      <td>{plan.durationInDays} Days</td>

                      <td>{plan.areaId}</td>

                    </tr>

                  ))

                }

              </tbody>

            </table>

          )

        }

      </div>

    </div>

  );

}

export default SubscriptionPlanSettings;