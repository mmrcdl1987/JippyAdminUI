import { useState } from "react";
import "../styles/OrderSettings.css";

import {
  createOrderSettings,
} from "../services/orderSettingsService";

function OrderSettings() {

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    platformFee: "",
    surgeFee: "",
    packagingFee: "",
    deliveryFeeTax: "",
    foodTotalAmountTax: "",
  });

  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

  };

  const handleSave = async () => {

    if (
      formData.platformFee &&
      Number(formData.platformFee) < 0
    ) {
      alert("Platform Fee cannot be negative.");
      return;
    }

    if (
      formData.surgeFee &&
      Number(formData.surgeFee) < 0
    ) {
      alert("Surge Fee cannot be negative.");
      return;
    }

    if (
      formData.packagingFee &&
      Number(formData.packagingFee) < 0
    ) {
      alert("Packaging Fee cannot be negative.");
      return;
    }

    if (
      formData.deliveryFeeTax &&
      (
        Number(formData.deliveryFeeTax) < 0 ||
        Number(formData.deliveryFeeTax) > 100
      )
    ) {
      alert("Delivery Fee Tax must be between 0 and 100.");
      return;
    }

    if (
      formData.foodTotalAmountTax &&
      (
        Number(formData.foodTotalAmountTax) < 0 ||
        Number(formData.foodTotalAmountTax) > 100
      )
    ) {
      alert("Food Total Amount Tax must be between 0 and 100.");
      return;
    }

    try {

  setLoading(true);

  const payload = {
    ...formData,
    createdBy: 1,
    updatedBy: 1,
  };

  const response =
    await createOrderSettings(payload);

  console.log(response.data);

  alert("Order Settings Saved Successfully.");

  setFormData({
    platformFee: "",
    surgeFee: "",
    packagingFee: "",
    deliveryFeeTax: "",
    foodTotalAmountTax: "",
  });

} catch (error) {

  console.log(error);

  const message =
    error.response?.data?.errorMessage;

  alert(message || "Unable to save settings.");

} finally {

  setLoading(false);

}

  };

  return (
    <div className="ord-page-wrapper">

  <h2 className="ord-page-title">
    Order Settings
  </h2>

  <div className="ord-settings-card">

    <div className="ord-card-header">
      ORDER SETTINGS
    </div>

    <div className="ord-form-grid">

      <div className="ord-form-group">
        <label className="ord-form-label">
          Platform Fee (₹)
        </label>

        <input
          type="number"
          className="ord-form-input"
          name="platformFee"
          value={formData.platformFee}
          onChange={handleChange}
          placeholder="Enter Platform Fee"
        />
      </div>

      <div className="ord-form-group">
        <label className="ord-form-label">
          Surge Fee (₹)
        </label>

        <input
          type="number"
          className="ord-form-input"
          name="surgeFee"
          value={formData.surgeFee}
          onChange={handleChange}
          placeholder="Enter Surge Fee"
        />
      </div>

      <div className="ord-form-group">
        <label className="ord-form-label">
          Packaging Fee (₹)
        </label>

        <input
          type="number"
          className="ord-form-input"
          name="packagingFee"
          value={formData.packagingFee}
          onChange={handleChange}
          placeholder="Enter Packaging Fee"
        />
      </div>

      <div className="ord-form-group">
        <label className="ord-form-label">
          Delivery Fee Tax (%)
        </label>

        <input
          type="number"
          className="ord-form-input"
          name="deliveryFeeTax"
          value={formData.deliveryFeeTax}
          onChange={handleChange}
          placeholder="Enter Delivery Fee Tax"
        />
      </div>

      <div className="ord-form-group">
        <label className="ord-form-label">
          Food Total Amount Tax (%)
        </label>

        <input
          type="number"
          className="ord-form-input"
          name="foodTotalAmountTax"
          value={formData.foodTotalAmountTax}
          onChange={handleChange}
          placeholder="Enter Food Total Amount Tax"
        />
      </div>

    </div>
            <div className="ord-button-wrapper">

          <button
            className="ord-save-btn"
            onClick={handleSave}
            disabled={loading}
          >
            {
              loading
                ? "Saving..."
                : "Save Order Settings"
            }
          </button>

        </div>

      </div>

    </div>

  );

}

export default OrderSettings;