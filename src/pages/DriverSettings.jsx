// import { useState } from "react";
// import "../styles/DriverSettings.css";
// import { createDriverSettings } from "../services/driverSettingsService";

// function DriverSettings() {
//   const [activeTab, setActiveTab] = useState("settings"); // "settings", "add", "edit", "view", "history", "history-view"
//   const [loading, setLoading] = useState(false);
//   const [selectedItem, setSelectedItem] = useState(null);

//   const [settingsList, setSettingsList] = useState([
//     {
//       id: 1,
//       pickUpKmsRangeFrom: 0,
//       pickUpKmsRangeTo: 5,
//       unitPricePerPickKm: 10.00,
//       deliveryKmsRangeFrom: 0,
//       deliveryKmsRangeTo: 5,
//       unitPricePerDeliverKm: 12.00,
//       createdBy: "Sudheer Admin",
//       updatedBy: "Sudheer Admin",
//       createdAt: "10 May 2025 10:30 AM",
//       updatedAt: "10 May 2025 10:30 AM",
//     },
//     {
//       id: 2,
//       pickUpKmsRangeFrom: 5,
//       pickUpKmsRangeTo: 10,
//       unitPricePerPickKm: 15.00,
//       deliveryKmsRangeFrom: 5,
//       deliveryKmsRangeTo: 10,
//       unitPricePerDeliverKm: 18.00,
//       createdBy: "Sudheer Admin",
//       updatedBy: "Sudheer Admin",
//       createdAt: "18 Apr 2025 02:15 PM",
//       updatedAt: "18 Apr 2025 02:15 PM",
//     }
//   ]);

//   const [historyList, setHistoryList] = useState([
//     {
//       id: 15,
//       driverId: 101,
//       driverName: "Ramesh Kumar",
//       date: "10 May 2025",
//       completedOrdersCount: 12,
//       incentiveAmount: 60.00,
//       createdAt: "10 May 2025 11:00 AM",
//       createdBy: "System",
//       updatedBy: "System"
//     },
//     {
//       id: 16,
//       driverId: 102,
//       driverName: "Suresh Singh",
//       date: "10 May 2025",
//       completedOrdersCount: 25,
//       incentiveAmount: 120.00,
//       createdAt: "10 May 2025 11:00 AM",
//       createdBy: "System",
//       updatedBy: "System"
//     }
//   ]);

//   const [formData, setFormData] = useState({
//     pickUpKmsRangeFrom: "",
//     pickUpKmsRangeTo: "",
//     unitPricePerPickKm: "",
//     deliveryKmsRangeFrom: "",
//     deliveryKmsRangeTo: "",
//     unitPricePerDeliverKm: "",
//   });

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleSave = async () => {
//     if (!formData.pickUpKmsRangeFrom || !formData.pickUpKmsRangeTo || !formData.unitPricePerPickKm ||
//         !formData.deliveryKmsRangeFrom || !formData.deliveryKmsRangeTo || !formData.unitPricePerDeliverKm) {
//       alert("All fields are required.");
//       return;
//     }

//     if (
//       Number(formData.pickUpKmsRangeFrom) < 0 ||
//       Number(formData.pickUpKmsRangeTo) < 0 ||
//       Number(formData.unitPricePerPickKm) < 0 ||
//       Number(formData.deliveryKmsRangeFrom) < 0 ||
//       Number(formData.deliveryKmsRangeTo) < 0 ||
//       Number(formData.unitPricePerDeliverKm) < 0
//     ) {
//       alert("Values cannot be negative.");
//       return;
//     }

//     if (Number(formData.pickUpKmsRangeFrom) >= Number(formData.pickUpKmsRangeTo)) {
//       alert("Pickup KM Range From must be less than Pickup KM Range To.");
//       return;
//     }

//     if (Number(formData.deliveryKmsRangeFrom) >= Number(formData.deliveryKmsRangeTo)) {
//       alert("Delivery KM Range From must be less than Delivery KM Range To.");
//       return;
//     }

//     try {
//       setLoading(true);
//       const payload = {
//         pickUpKmsRangeFrom: Number(formData.pickUpKmsRangeFrom),
//         pickUpKmsRangeTo: Number(formData.pickUpKmsRangeTo),
//         unitPricePerPickKm: Number(formData.unitPricePerPickKm),
//         deliveryKmsRangeFrom: Number(formData.deliveryKmsRangeFrom),
//         deliveryKmsRangeTo: Number(formData.deliveryKmsRangeTo),
//         unitPricePerDeliverKm: Number(formData.unitPricePerDeliverKm),
//         createdBy: 1,
//       };

//       const response = await createDriverSettings(payload);
//       console.log(response?.data);

//       alert("Driver Settings Saved Successfully.");
//       setFormData({
//         pickUpKmsRangeFrom: "",
//         pickUpKmsRangeTo: "",
//         unitPricePerPickKm: "",
//         deliveryKmsRangeFrom: "",
//         deliveryKmsRangeTo: "",
//         unitPricePerDeliverKm: "",
//       });
//       setActiveTab("settings");
//     } catch (error) {
//       console.log(error);
//       alert(
//         error.response?.data?.errorMessage ||
//         error.response?.data?.message ||
//         "Unable to save Driver Settings."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleUpdate = () => {
//     alert("Driver Settings Updated Successfully.");
//     setActiveTab("settings");
//   };

//   return (
//     <div className="driver-settings-page">
//       {/* 1. Incentive Settings - List Screen */}
//       {activeTab === "settings" && (
//         <>
//           <div className="driver-settings-page-header">
//             <div>
//               <h2 className="driver-settings-title">Driver Charge Configuration</h2>
//               <p className="driver-settings-subtitle">Manage driver distance slabs and view configuration history</p>
//             </div>
//             <button 
//               className="driver-settings-add-btn"
//               onClick={() => {
//                 setFormData({ pickUpKmsRangeFrom: "", pickUpKmsRangeTo: "", unitPricePerPickKm: "", deliveryKmsRangeFrom: "", deliveryKmsRangeTo: "", unitPricePerDeliverKm: "" });
//                 setActiveTab("add");
//               }}
//             >
//               + Add Driver Setting
//             </button>
//           </div>

//           <div className="driver-settings-tabs">
//             <button className="driver-tab-btn active" onClick={() => setActiveTab("settings")}>
//               Driver Settings
//             </button>
//             <button className="driver-tab-btn" onClick={() => setActiveTab("history-list")}>
//               Settings History
//             </button>
//           </div>

//           <div className="driver-settings-card list-card">
//             <div className="driver-table-container">
//               <table className="driver-settings-table">
//                 <thead>
//                   <tr>
//                     <th>#</th>
//                     <th>Pickup Range (KM)</th>
//                     <th>Pickup Price (₹)</th>
//                     <th>Delivery Range (KM)</th>
//                     <th>Delivery Price (₹)</th>
//                     <th>Created At</th>
//                     <th>Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {settingsList.map((item, index) => (
//                     <tr key={item.id}>
//                       <td>{index + 1}</td>
//                       <td>{item.pickUpKmsRangeFrom} - {item.pickUpKmsRangeTo}</td>
//                       <td>₹{item.unitPricePerPickKm.toFixed(2)}</td>
//                       <td>{item.deliveryKmsRangeFrom} - {item.deliveryKmsRangeTo}</td>
//                       <td>₹{item.unitPricePerDeliverKm.toFixed(2)}</td>
//                       <td>{item.createdAt}</td>
//                       <td>
//                         <button className="action-icon-btn view" title="View" onClick={() => { setSelectedItem(item); setActiveTab("view"); }}>👁️</button>
//                         <button className="action-icon-btn edit" title="Edit" onClick={() => { 
//                           setFormData({
//                             pickUpKmsRangeFrom: item.pickUpKmsRangeFrom,
//                             pickUpKmsRangeTo: item.pickUpKmsRangeTo,
//                             unitPricePerPickKm: item.unitPricePerPickKm,
//                             deliveryKmsRangeFrom: item.deliveryKmsRangeFrom,
//                             deliveryKmsRangeTo: item.deliveryKmsRangeTo,
//                             unitPricePerDeliverKm: item.unitPricePerDeliverKm,
//                           });
//                           setSelectedItem(item);
//                           setActiveTab("edit"); 
//                         }}>✏️</button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </>
//       )}

//       {/* 2. Add Incentive Setting Screen */}
//       {activeTab === "add" && (
//         <div className="sub-screen-container">
//           <div className="breadcrumb-nav">
//             <span className="back-arrow" onClick={() => setActiveTab("settings")}>←</span>
//             <span className="breadcrumb-link" onClick={() => setActiveTab("settings")}>Driver Settings</span>
//             <span className="breadcrumb-sep">&gt;</span>
//             <span className="breadcrumb-current">Add</span>
//           </div>

//           <div className="driver-settings-card">
//             <div className="driver-settings-header">DRIVER CHARGE CONFIGURATION</div>
            
//             <div className="driver-settings-grid">
//               <div className="driver-settings-form-group">
//                 <label className="driver-settings-label">Pickup KM Range From <span className="driver-required">*</span></label>
//                 <input type="number" className="driver-settings-input" name="pickUpKmsRangeFrom" value={formData.pickUpKmsRangeFrom} onChange={handleChange} placeholder="Enter Pickup KM From" min="0" />
//               </div>
//               <div className="driver-settings-form-group">
//                 <label className="driver-settings-label">Pickup KM Range To <span className="driver-required">*</span></label>
//                 <input type="number" className="driver-settings-input" name="pickUpKmsRangeTo" value={formData.pickUpKmsRangeTo} onChange={handleChange} placeholder="Enter Pickup KM To" min="0" />
//               </div>
//               <div className="driver-settings-form-group">
//                 <label className="driver-settings-label">Unit Price Per Pickup KM <span className="driver-required">*</span></label>
//                 <input type="number" className="driver-settings-input" name="unitPricePerPickKm" value={formData.unitPricePerPickKm} onChange={handleChange} placeholder="Enter Pickup Unit Price" min="0" step="0.01" />
//               </div>
//               <div className="driver-settings-form-group">
//                 <label className="driver-settings-label">Delivery KM Range From <span className="driver-required">*</span></label>
//                 <input type="number" className="driver-settings-input" name="deliveryKmsRangeFrom" value={formData.deliveryKmsRangeFrom} onChange={handleChange} placeholder="Enter Delivery KM From" min="0" />
//               </div>
//               <div className="driver-settings-form-group">
//                 <label className="driver-settings-label">Delivery KM Range To <span className="driver-required">*</span></label>
//                 <input type="number" className="driver-settings-input" name="deliveryKmsRangeTo" value={formData.deliveryKmsRangeTo} onChange={handleChange} placeholder="Enter Delivery KM To" min="0" />
//               </div>
//               <div className="driver-settings-form-group">
//                 <label className="driver-settings-label">Unit Price Per Delivery KM <span className="driver-required">*</span></label>
//                 <input type="number" className="driver-settings-input" name="unitPricePerDeliverKm" value={formData.unitPricePerDeliverKm} onChange={handleChange} placeholder="Enter Delivery Unit Price" min="0" step="0.01" />
//               </div>
//             </div>

//             <div className="driver-settings-button-wrapper">
//               <button className="driver-settings-cancel-btn" onClick={() => setActiveTab("settings")}>Cancel</button>
//               <button className="driver-settings-save-btn" onClick={handleSave} disabled={loading}>{loading ? "Saving..." : "Save"}</button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* 3. Edit Incentive Setting Screen */}
//       {activeTab === "edit" && (
//         <div className="sub-screen-container">
//           <div className="breadcrumb-nav">
//             <span className="back-arrow" onClick={() => setActiveTab("settings")}>←</span>
//             <span className="breadcrumb-link" onClick={() => setActiveTab("settings")}>Driver Settings</span>
//             <span className="breadcrumb-sep">&gt;</span>
//             <span className="breadcrumb-current">Edit</span>
//           </div>

//           <div className="driver-settings-card">
//             <div className="driver-settings-header">EDIT DRIVER CHARGE CONFIGURATION</div>
            
//             <div className="driver-settings-grid">
//               <div className="driver-settings-form-group">
//                 <label className="driver-settings-label">Pickup KM Range From <span className="driver-required">*</span></label>
//                 <input type="number" className="driver-settings-input" name="pickUpKmsRangeFrom" value={formData.pickUpKmsRangeFrom} onChange={handleChange} min="0" />
//               </div>
//               <div className="driver-settings-form-group">
//                 <label className="driver-settings-label">Pickup KM Range To <span className="driver-required">*</span></label>
//                 <input type="number" className="driver-settings-input" name="pickUpKmsRangeTo" value={formData.pickUpKmsRangeTo} onChange={handleChange} min="0" />
//               </div>
//               <div className="driver-settings-form-group">
//                 <label className="driver-settings-label">Unit Price Per Pickup KM <span className="driver-required">*</span></label>
//                 <input type="number" className="driver-settings-input" name="unitPricePerPickKm" value={formData.unitPricePerPickKm} onChange={handleChange} min="0" step="0.01" />
//               </div>
//               <div className="driver-settings-form-group">
//                 <label className="driver-settings-label">Delivery KM Range From <span className="driver-required">*</span></label>
//                 <input type="number" className="driver-settings-input" name="deliveryKmsRangeFrom" value={formData.deliveryKmsRangeFrom} onChange={handleChange} min="0" />
//               </div>
//               <div className="driver-settings-form-group">
//                 <label className="driver-settings-label">Delivery KM Range To <span className="driver-required">*</span></label>
//                 <input type="number" className="driver-settings-input" name="deliveryKmsRangeTo" value={formData.deliveryKmsRangeTo} onChange={handleChange} min="0" />
//               </div>
//               <div className="driver-settings-form-group">
//                 <label className="driver-settings-label">Unit Price Per Delivery KM <span className="driver-required">*</span></label>
//                 <input type="number" className="driver-settings-input" name="unitPricePerDeliverKm" value={formData.unitPricePerDeliverKm} onChange={handleChange} min="0" step="0.01" />
//               </div>
//             </div>

//             <div className="driver-settings-button-wrapper">
//               <button className="driver-settings-cancel-btn" onClick={() => setActiveTab("settings")}>Cancel</button>
//               <button className="driver-settings-save-btn" onClick={handleUpdate}>Update</button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* 4. View Incentive Setting Screen */}
//       {activeTab === "view" && selectedItem && (
//         <div className="sub-screen-container">
//           <div className="breadcrumb-nav">
//             <span className="back-arrow" onClick={() => setActiveTab("settings")}>←</span>
//             <span className="breadcrumb-link" onClick={() => setActiveTab("settings")}>Driver Settings</span>
//             <span className="breadcrumb-sep">&gt;</span>
//             <span className="breadcrumb-current">View</span>
//           </div>

//           <div className="driver-settings-card">
//             <div className="driver-settings-header">Driver Setting Details</div>
//             <div className="details-grid-view">
//               <div className="detail-row"><span>Driver Setting ID</span><span>: {selectedItem.id}</span></div>
//               <div className="detail-row"><span>Pickup Range (KM)</span><span>: {selectedItem.pickUpKmsRangeFrom} - {selectedItem.pickUpKmsRangeTo}</span></div>
//               <div className="detail-row"><span>Unit Price Per Pickup KM (₹)</span><span>: {selectedItem.unitPricePerPickKm.toFixed(2)}</span></div>
//               <div className="detail-row"><span>Delivery Range (KM)</span><span>: {selectedItem.deliveryKmsRangeFrom} - {selectedItem.deliveryKmsRangeTo}</span></div>
//               <div className="detail-row"><span>Unit Price Per Delivery KM (₹)</span><span>: {selectedItem.unitPricePerDeliverKm.toFixed(2)}</span></div>
//               <hr className="detail-divider" />
//               <div className="detail-row"><span>Created By</span><span>: {selectedItem.createdBy}</span></div>
//               <div className="detail-row"><span>Created At</span><span>: {selectedItem.createdAt}</span></div>
//               <div className="detail-row"><span>Updated By</span><span>: {selectedItem.updatedBy}</span></div>
//               <div className="detail-row"><span>Updated At</span><span>: {selectedItem.updatedAt}</span></div>
//             </div>
//             <div className="driver-settings-button-wrapper">
//               <button className="driver-settings-save-btn" onClick={() => setActiveTab("settings")}>Back</button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* 6. Incentive History - List Screen */}
//       {activeTab === "history-list" && (
//         <>
//           <div className="driver-settings-page-header">
//             <div>
//               <h2 className="driver-settings-title">Driver Configuration History</h2>
//               <p className="driver-settings-subtitle">View daily transaction history earned by drivers</p>
//             </div>
//           </div>

//           <div className="driver-settings-tabs">
//             <button className="driver-tab-btn" onClick={() => setActiveTab("settings")}>
//               Driver Settings
//             </button>
//             <button className="driver-tab-btn active" onClick={() => setActiveTab("history-list")}>
//               Settings History
//             </button>
//           </div>

//           <div className="driver-settings-card list-card">
//             <div className="driver-table-container">
//               <table className="driver-settings-table">
//                 <thead>
//                   <tr>
//                     <th>#</th>
//                     <th>Driver ID</th>
//                     <th>Driver Name</th>
//                     <th>Date</th>
//                     <th>Orders Count</th>
//                     <th>Incentive Amount (₹)</th>
//                     <th>Created At</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {historyList.map((hist, index) => (
//                     <tr key={hist.id} onClick={() => { setSelectedItem(hist); setActiveTab("history-view"); }} style={{ cursor: "pointer" }}>
//                       <td>{index + 1}</td>
//                       <td>{hist.driverId}</td>
//                       <td>{hist.driverName}</td>
//                       <td>{hist.date}</td>
//                       <td>{hist.completedOrdersCount}</td>
//                       <td>₹{hist.incentiveAmount.toFixed(2)}</td>
//                       <td>{hist.createdAt}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </>
//       )}

//       {/* 7. Incentive History Details - View Screen */}
//       {activeTab === "history-view" && selectedItem && (
//         <div className="sub-screen-container">
//           <div className="breadcrumb-nav">
//             <span className="back-arrow" onClick={() => setActiveTab("history-list")}>←</span>
//             <span className="breadcrumb-link" onClick={() => setActiveTab("history-list")}>Incentive History</span>
//             <span className="breadcrumb-sep">&gt;</span>
//             <span className="breadcrumb-current">View</span>
//           </div>

//           <div className="driver-settings-card">
//             <div className="driver-settings-header">Incentive History Details</div>
//             <div className="details-grid-view">
//               <div className="detail-row"><span>Incentive History ID</span><span>: {selectedItem.id}</span></div>
//               <div className="detail-row"><span>Driver ID</span><span>: {selectedItem.driverId}</span></div>
//               <div className="detail-row"><span>Driver Name</span><span>: {selectedItem.driverName}</span></div>
//               <div className="detail-row"><span>Date</span><span>: {selectedItem.date}</span></div>
//               <div className="detail-row"><span>Completed Orders Count</span><span>: {selectedItem.completedOrdersCount}</span></div>
//               <div className="detail-row"><span>Incentive Amount (₹)</span><span>: {selectedItem.incentiveAmount.toFixed(2)}</span></div>
//               <hr className="detail-divider" />
//               <div className="detail-row"><span>Created By</span><span>: {selectedItem.createdBy}</span></div>
//               <div className="detail-row"><span>Created At</span><span>: {selectedItem.createdAt}</span></div>
//               <div className="detail-row"><span>Updated By</span><span>: {selectedItem.updatedBy}</span></div>
//             </div>
//             <div className="driver-settings-button-wrapper">
//               <button className="driver-settings-save-btn" onClick={() => setActiveTab("history-list")}>Back</button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default DriverSettings;
import React from 'react';

const DriverSettings = () => {
  return (
    <div>
      <h2>Driver Settings</h2>
    </div>
  );
};

// 👉 YOU MUST HAVE THIS LINE:
export default DriverSettings;