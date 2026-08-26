import { useEffect, useState } from "react";
import {
  getOutletById,
  updateOutlet,
} from "../services/outletListService";
import "../styles/OutletEdit.css";

const OutletEdit = ({ setActivePage }) => {
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const fetchOutlet = async () => {
      try {
        const outletId = sessionStorage.getItem("editOutletId");

        if (!outletId) {
          alert("Outlet ID not found.");
          setLoading(false);
          return;
        }

        console.log("Fetching outlet ID:", outletId);

        const response = await getOutletById(outletId);

        console.log("GET OUTLET BY ID RESPONSE:", response);

        const data = response?.data || {};

        setFormData(data);
      } catch (error) {
        console.error("Failed to load outlet:", error);
        alert("Failed to load outlet details.");
      } finally {
        setLoading(false);
      }
    };

    fetchOutlet();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

 const handleSave = async () => {
  try {
    const outletId = sessionStorage.getItem("editOutletId");

    if (!outletId) {
      alert("Outlet ID not found.");
      return;
    }

    const payload = {
      outletId: Number(outletId),

      outletName: formData.outletName,
      outletEmail: formData.outletEmail,
      outletPhone: formData.outletPhone,
      alternateOutletPhone: formData.alternateOutletPhone || null,

      latitude:
        formData.latitude !== null &&
        formData.latitude !== undefined
          ? Number(formData.latitude)
          : null,

      longitude:
        formData.longitude !== null &&
        formData.longitude !== undefined
          ? Number(formData.longitude)
          : null,

      accountNumber: formData.accountNumber || null,
      ifscCode: formData.ifscCode || null,
      bankName: formData.bankName || null,
      accountHolderName: formData.accountHolderName || null,

      buildingNumber: formData.buildingNumber || null,
      road: formData.road || null,
      landmark: formData.landmark || null,

      cityId: formData.cityId || null,
      cityName: formData.cityName || null,

      stateId: formData.stateId || null,
      stateName: formData.stateName || null,

      areaId: formData.areaId || null,
      areaName: formData.areaName || null,

      // Keep cuisineTypes from the GET response
      cuisineTypes: formData.cuisineTypes || [],

      // Keep outlet timings from GET response
      outletTimings: formData.outletTimings || [],

      // Keep existing categories/products
      categories: formData.categories || [],

      // Keep active discount if returned
      activeDiscounts: formData.activeDiscounts || null,

      isFavourite: formData.isFavourite ?? false,
      isAvailable: formData.isAvailable ?? true,
    };

    console.log(
      "========== FINAL UPDATE PAYLOAD =========="
    );

    console.log(JSON.stringify(payload, null, 2));

    console.log(
      "=========================================="
    );

    const response = await updateOutlet(
      outletId,
      "customer",
      payload
    );

    console.log("UPDATE SUCCESS:", response);

    alert("Outlet updated successfully.");

    setActivePage("allOutletsList");

  } catch (error) {
    console.error("========== UPDATE ERROR ==========");

    console.error("Status:", error?.response?.status);

    console.error(
      "Backend:",
      error?.response?.data
    );

    console.error("=================================");

    alert(
      error?.response?.data?.message ||
      "Failed to update outlet."
    );
  }
};
  const handleBack = () => {
    setActivePage("allOutletsList");
  };

  if (loading) {
    return (
      <div className="jippy-outlet-edit-loading">
        <div className="jippy-outlet-edit-spinner"></div>
        <span>Loading outlet details...</span>
      </div>
    );
  }

  return (
    <div className="jippy-outlet-edit-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="jippy-outlet-edit-header">

        <div className="jippy-outlet-edit-header-content">
          <h1 className="jippy-outlet-edit-title">
            Edit Outlet
          </h1>

          <p className="jippy-outlet-edit-subtitle">
            Update outlet information and details
          </p>
        </div>

        <button
          type="button"
          className="jippy-outlet-edit-back-btn"
          onClick={handleBack}
        >
          <span className="jippy-outlet-edit-back-icon">
            ←
          </span>

          Back to Outlets
        </button>

      </div>

      {/* =====================================================
          BASIC INFORMATION
      ===================================================== */}

      <div className="jippy-outlet-edit-card">

        <div className="jippy-outlet-edit-card-header">

          <div>
            <h2>Basic Information</h2>
            <p>Outlet contact and identification details</p>
          </div>

          <span className="jippy-outlet-edit-section-badge">
            Outlet Details
          </span>

        </div>

        <div className="jippy-outlet-edit-grid">

          {/* Outlet Name */}

          <div className="jippy-outlet-edit-field">

            <label>
              Outlet Name
            </label>

            <input
              type="text"
              name="outletName"
              value={formData.outletName || ""}
              onChange={handleChange}
              placeholder="Enter outlet name"
              className="jippy-outlet-edit-input"
            />

          </div>

          {/* Email */}

          <div className="jippy-outlet-edit-field">

            <label>
              Outlet Email
            </label>

            <input
              type="email"
              name="outletEmail"
              value={formData.outletEmail || ""}
              onChange={handleChange}
              placeholder="Enter outlet email"
              className="jippy-outlet-edit-input"
            />

          </div>

          {/* Phone */}

          <div className="jippy-outlet-edit-field">

            <label>
              Outlet Phone
            </label>

            <input
              type="tel"
              name="outletPhone"
              value={formData.outletPhone || ""}
              onChange={handleChange}
              placeholder="Enter phone number"
              className="jippy-outlet-edit-input"
            />

          </div>

          {/* Alternate Phone */}

          <div className="jippy-outlet-edit-field">

            <label>
              Alternate Phone
            </label>

            <input
              type="tel"
              name="alternateOutletPhone"
              value={formData.alternateOutletPhone || ""}
              onChange={handleChange}
              placeholder="Enter alternate phone"
              className="jippy-outlet-edit-input"
            />

          </div>

          {/* FSSAI */}

          <div className="jippy-outlet-edit-field">

            <label>
              FSSAI Number
            </label>

            <input
              type="text"
              name="fssaiNumber"
              value={formData.fssaiNumber || ""}
              onChange={handleChange}
              placeholder="Enter FSSAI number"
              className="jippy-outlet-edit-input"
            />

          </div>

          {/* GST */}

          <div className="jippy-outlet-edit-field">

            <label>
              GST Number
            </label>

            <input
              type="text"
              name="gstNumber"
              value={formData.gstNumber || ""}
              onChange={handleChange}
              placeholder="Enter GST number"
              className="jippy-outlet-edit-input"
            />

          </div>

        </div>

      </div>

      {/* =====================================================
          BANK DETAILS
      ===================================================== */}

      <div className="jippy-outlet-edit-card">

        <div className="jippy-outlet-edit-card-header">

          <div>
            <h2>Bank Details</h2>
            <p>Outlet banking and payment information</p>
          </div>

          <span className="jippy-outlet-edit-section-badge">
            Payment Information
          </span>

        </div>

        <div className="jippy-outlet-edit-grid">

          {/* Account Number */}

          <div className="jippy-outlet-edit-field">

            <label>
              Account Number
            </label>

            <input
              type="text"
              name="accountNumber"
              value={formData.accountNumber || ""}
              onChange={handleChange}
              placeholder="Enter account number"
              className="jippy-outlet-edit-input"
            />

          </div>

          {/* IFSC */}

          <div className="jippy-outlet-edit-field">

            <label>
              IFSC Code
            </label>

            <input
              type="text"
              name="ifscCode"
              value={formData.ifscCode || ""}
              onChange={handleChange}
              placeholder="Enter IFSC code"
              className="jippy-outlet-edit-input"
            />

          </div>

          {/* Bank Name */}

          <div className="jippy-outlet-edit-field">

            <label>
              Bank Name
            </label>

            <input
              type="text"
              name="bankName"
              value={formData.bankName || ""}
              onChange={handleChange}
              placeholder="Enter bank name"
              className="jippy-outlet-edit-input"
            />

          </div>

          {/* Account Holder */}

          <div className="jippy-outlet-edit-field">

            <label>
              Account Holder Name
            </label>

            <input
              type="text"
              name="accountHolderName"
              value={formData.accountHolderName || ""}
              onChange={handleChange}
              placeholder="Enter account holder name"
              className="jippy-outlet-edit-input"
            />

          </div>

        </div>

      </div>

      {/* =====================================================
          ADDRESS DETAILS
      ===================================================== */}

      <div className="jippy-outlet-edit-card">

        <div className="jippy-outlet-edit-card-header">

          <div>
            <h2>Address Details</h2>
            <p>Physical address of the outlet</p>
          </div>

          <span className="jippy-outlet-edit-section-badge">
            Outlet Location
          </span>

        </div>

        <div className="jippy-outlet-edit-grid">

          {/* Building Number */}

          <div className="jippy-outlet-edit-field">

            <label>
              Building Number
            </label>

            <input
              type="text"
              name="buildingNumber"
              value={formData.buildingNumber || ""}
              onChange={handleChange}
              placeholder="Enter building number"
              className="jippy-outlet-edit-input"
            />

          </div>

          {/* Road */}

          <div className="jippy-outlet-edit-field">

            <label>
              Road
            </label>

            <input
              type="text"
              name="road"
              value={formData.road || ""}
              onChange={handleChange}
              placeholder="Enter road"
              className="jippy-outlet-edit-input"
            />

          </div>

          {/* Landmark */}

          <div className="jippy-outlet-edit-field jippy-outlet-edit-full-width">

            <label>
              Landmark
            </label>

            <input
              type="text"
              name="landmark"
              value={formData.landmark || ""}
              onChange={handleChange}
              placeholder="Enter landmark"
              className="jippy-outlet-edit-input"
            />

          </div>

        </div>

      </div>

      {/* =====================================================
          GPS LOCATION
      ===================================================== */}

      <div className="jippy-outlet-edit-card">

        <div className="jippy-outlet-edit-card-header">

          <div>
            <h2>Location</h2>
            <p>GPS coordinates of the outlet</p>
          </div>

          <span className="jippy-outlet-edit-section-badge">
            GPS Coordinates
          </span>

        </div>

        <div className="jippy-outlet-edit-grid">

          {/* Latitude */}

          <div className="jippy-outlet-edit-field">

            <label>
              Latitude
            </label>

            <input
              type="number"
              step="any"
              name="latitude"
              value={formData.latitude ?? ""}
              onChange={handleChange}
              placeholder="Enter latitude"
              className="jippy-outlet-edit-input"
            />

          </div>

          {/* Longitude */}

          <div className="jippy-outlet-edit-field">

            <label>
              Longitude
            </label>

            <input
              type="number"
              step="any"
              name="longitude"
              value={formData.longitude ?? ""}
              onChange={handleChange}
              placeholder="Enter longitude"
              className="jippy-outlet-edit-input"
            />

          </div>

        </div>

      </div>

      {/* =====================================================
          ACTIONS
      ===================================================== */}

      <div className="jippy-outlet-edit-actions">

        <button
          type="button"
          className="jippy-outlet-edit-cancel"
          onClick={handleBack}
        >
          Cancel
        </button>

        <button
          type="button"
          className="jippy-outlet-edit-save"
          onClick={handleSave}
        >
          Save Changes
        </button>

      </div>

    </div>
  );
};

export default OutletEdit;