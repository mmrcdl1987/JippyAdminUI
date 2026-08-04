import { useState } from "react";
import "../styles/DriverSettings.css";

import {
  createDriverSettings,
} from "../services/driverSettingsService";

function DriverSettings() {

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({

    pickUpKmsRangeFrom: "",

    pickUpKmsRangeTo: "",

    unitPricePerPickKm: "",

    deliveryKmsRangeFrom: "",

    deliveryKmsRangeTo: "",

    unitPricePerDeliverKm: "",

  });

  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

  };

  const handleSave = async () => {

    if (!formData.pickUpKmsRangeFrom) {
      alert("Pickup KM Range From is required.");
      return;
    }

    if (!formData.pickUpKmsRangeTo) {
      alert("Pickup KM Range To is required.");
      return;
    }

    if (!formData.unitPricePerPickKm) {
      alert("Unit Price Per Pickup KM is required.");
      return;
    }

    if (!formData.deliveryKmsRangeFrom) {
      alert("Delivery KM Range From is required.");
      return;
    }

    if (!formData.deliveryKmsRangeTo) {
      alert("Delivery KM Range To is required.");
      return;
    }

    if (!formData.unitPricePerDeliverKm) {
      alert("Unit Price Per Delivery KM is required.");
      return;
    }

    if (
      Number(formData.pickUpKmsRangeFrom) < 0 ||
      Number(formData.pickUpKmsRangeTo) < 0 ||
      Number(formData.unitPricePerPickKm) < 0 ||
      Number(formData.deliveryKmsRangeFrom) < 0 ||
      Number(formData.deliveryKmsRangeTo) < 0 ||
      Number(formData.unitPricePerDeliverKm) < 0
    ) {
      alert("Values cannot be negative.");
      return;
    }

   if (
  Number(formData.pickUpKmsRangeFrom) >=
  Number(formData.pickUpKmsRangeTo)
) {
  alert(
    "Pickup KM Range From must be less than Pickup KM Range To."
  );
  return;
}

    if (
  Number(formData.deliveryKmsRangeFrom) >=
  Number(formData.deliveryKmsRangeTo)
) {
  alert(
    "Delivery KM Range From must be less than Delivery KM Range To."
  );
  return;
}
    try {

      setLoading(true);

      const payload = {

        pickUpKmsRangeFrom: Number(formData.pickUpKmsRangeFrom),

        pickUpKmsRangeTo: Number(formData.pickUpKmsRangeTo),

        unitPricePerPickKm: Number(formData.unitPricePerPickKm),

        deliveryKmsRangeFrom: Number(formData.deliveryKmsRangeFrom),

        deliveryKmsRangeTo: Number(formData.deliveryKmsRangeTo),

        unitPricePerDeliverKm: Number(formData.unitPricePerDeliverKm),

        // Replace with logged-in user later
        createdBy: 1,

      };

      const response =
        await createDriverSettings(payload);

      console.log(response.data);

      alert("Driver Settings Saved Successfully.");

      setFormData({

        pickUpKmsRangeFrom: "",

        pickUpKmsRangeTo: "",

        unitPricePerPickKm: "",

        deliveryKmsRangeFrom: "",

        deliveryKmsRangeTo: "",

        unitPricePerDeliverKm: "",

      });

          } catch (error) {

      console.log(error);

      console.log(error.response);

      console.log(error.response?.data);

      alert(
  error.response?.data?.errorMessage ||
  error.response?.data?.message ||
  "Unable to save Driver Settings."
);
    } finally {

      setLoading(false);

    }

  };

  return (

    <div className="driver-settings-page">

      <h2 className="driver-settings-title">
        Driver Settings
      </h2>

      <div className="driver-settings-card">

        <div className="driver-settings-header">
          DRIVER CHARGE CONFIGURATION
        </div>

        <div className="driver-settings-grid">

          <div className="driver-settings-form-group">

            <label className="driver-settings-label">
              Pickup KM Range From
              <span className="driver-required">*</span>
            </label>

            <input
              type="number"
              className="driver-settings-input"
              name="pickUpKmsRangeFrom"
              value={formData.pickUpKmsRangeFrom}
              onChange={handleChange}
              placeholder="Enter Pickup KM From"
              min="0"
            />

          </div>

          <div className="driver-settings-form-group">

            <label className="driver-settings-label">
              Pickup KM Range To
              <span className="driver-required">*</span>
            </label>

            <input
              type="number"
              className="driver-settings-input"
              name="pickUpKmsRangeTo"
              value={formData.pickUpKmsRangeTo}
              onChange={handleChange}
              placeholder="Enter Pickup KM To"
              min="0"
            />

          </div>

          <div className="driver-settings-form-group">

            <label className="driver-settings-label">
              Unit Price Per Pickup KM
              <span className="driver-required">*</span>
            </label>

            <input
              type="number"
              className="driver-settings-input"
              name="unitPricePerPickKm"
              value={formData.unitPricePerPickKm}
              onChange={handleChange}
              placeholder="Enter Pickup Unit Price"
              min="0"
              step="0.01"
            />

          </div>
                    <div className="driver-settings-form-group">

            <label className="driver-settings-label">
              Delivery KM Range From
              <span className="driver-required">*</span>
            </label>

            <input
              type="number"
              className="driver-settings-input"
              name="deliveryKmsRangeFrom"
              value={formData.deliveryKmsRangeFrom}
              onChange={handleChange}
              placeholder="Enter Delivery KM From"
              min="0"
            />

          </div>

          <div className="driver-settings-form-group">

            <label className="driver-settings-label">
              Delivery KM Range To
              <span className="driver-required">*</span>
            </label>

            <input
              type="number"
              className="driver-settings-input"
              name="deliveryKmsRangeTo"
              value={formData.deliveryKmsRangeTo}
              onChange={handleChange}
              placeholder="Enter Delivery KM To"
              min="0"
            />

          </div>

          <div className="driver-settings-form-group">

            <label className="driver-settings-label">
              Unit Price Per Delivery KM
              <span className="driver-required">*</span>
            </label>

            <input
              type="number"
              className="driver-settings-input"
              name="unitPricePerDeliverKm"
              value={formData.unitPricePerDeliverKm}
              onChange={handleChange}
              placeholder="Enter Delivery Unit Price"
              min="0"
              step="0.01"
            />

          </div>

        </div>

        <div className="driver-settings-button-wrapper">

          <button
            className="driver-settings-save-btn"
            onClick={handleSave}
            disabled={loading}
          >
            {
              loading
                ? "Saving..."
                : "Save Driver Settings"
            }
          </button>

          <button
            className="driver-settings-reset-btn"
            onClick={() =>
              setFormData({
                pickUpKmsRangeFrom: "",
                pickUpKmsRangeTo: "",
                unitPricePerPickKm: "",
                deliveryKmsRangeFrom: "",
                deliveryKmsRangeTo: "",
                unitPricePerDeliverKm: "",
              })
            }
          >
            Reset
          </button>

        </div>

      </div>

    </div>

  );

}

export default DriverSettings;