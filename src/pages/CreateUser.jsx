import { useState } from "react";
import {
  FiUserPlus,
  FiArrowLeft,
  FiCheck
} from "react-icons/fi";
import "../styles/CreateUser.css";

function CreateUser({ setActivePage }) {
  const [active, setActive] = useState(true);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    image: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, image: e.target.files[0] }));
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    console.log("Saving user:", { ...formData, active });
    if (setActivePage) {
      setActivePage("usersCustomers");
    }
  };

  return (
    <div className="create-user-page">
      {/* Header Bar */}
      <div className="create-user-header">
        <div className="create-user-header-left">
          <div className="create-user-header-icon">
            <FiUserPlus />
          </div>
          <div className="create-user-header-titles">
            <div className="create-user-eyebrow-row">
              <span className="create-user-eyebrow">CUSTOMERS & ACCOUNTS</span>
              <span className="create-user-divider">•</span>
              <span className="create-user-breadcrumb">NEW REGISTRATION</span>
            </div>
            <h2>Create New Customer</h2>
            <p>Add a new customer profile with personal and contact information</p>
          </div>
        </div>

        <button
          type="button"
          className="create-user-back-btn"
          onClick={() => setActivePage && setActivePage("usersCustomers")}
        >
          <FiArrowLeft /> Back to Customers
        </button>
      </div>

      {/* Form Card */}
      <div className="user-form-card">
        <div className="card-header-banner">
          <span className="section-label">User Details</span>
          <h3>Personal Information</h3>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label>First Name</label>
            <input
              type="text"
              name="firstName"
              placeholder="e.g. John"
              value={formData.firstName}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Last Name</label>
            <input
              type="text"
              name="lastName"
              placeholder="e.g. Doe"
              value={formData.lastName}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="e.g. john.doe@example.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Account Password</label>
            <input
              type="password"
              name="password"
              placeholder="Set a secure password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div className="form-group full-width">
            <label>Phone Number</label>
            <input
              type="text"
              name="phone"
              placeholder="e.g. +91 98765 43210"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className="form-group full-width">
            <label>Profile Image</label>
            <div className="file-upload-box">
              <input type="file" accept="image/*" onChange={handleFileChange} />
            </div>
          </div>
        </div>
      </div>

      {/* Status Card */}
      <div className="status-card">
        <div className="card-header-banner">
          <span className="section-label">Account Status</span>
          <h3>Account Activation</h3>
        </div>

        <div className="status-toggle-wrapper">
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={active}
              onChange={() => setActive(!active)}
            />
            <span className="toggle-slider"></span>
          </label>
          <span className={`status-text-badge ${active ? "active" : "inactive"}`}>
            {active ? "Active Account" : "Inactive Account"}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button
          type="button"
          className="cancel-btn"
          onClick={() => setActivePage && setActivePage("usersCustomers")}
        >
          Cancel
        </button>
        <button type="button" className="save-btn" onClick={handleSave}>
          <FiCheck /> Save Customer
        </button>
      </div>
    </div>
  );
}

export default CreateUser;