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

    createdBy: "",

    updatedBy: "",

  });

  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

  };

  const handleSave = async () => {

    try {

      setLoading(true);

      const response =
        await createOrderSettings(formData);

      console.log(response.data);

      alert("Order Settings Saved Successfully.");

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
              placeholder="Enter Food Amount Tax"
            />
          </div>

          <div className="ord-form-group">
            <label className="ord-form-label">
              Created By
            </label>

            <input
              type="number"
              className="ord-form-input"
              name="createdBy"
              value={formData.createdBy}
              onChange={handleChange}
              placeholder="Enter User ID"
            />
          </div>

          <div className="ord-form-group">
            <label className="ord-form-label">
              Updated By
            </label>

            <input
              type="number"
              className="ord-form-input"
              name="updatedBy"
              value={formData.updatedBy}
              onChange={handleChange}
              placeholder="Enter User ID"
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