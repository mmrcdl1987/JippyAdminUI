import { useState } from "react";
import "../styles/DeliveryCharge.css";

import {
  calculateDriverCharge as calculateDriverChargeApi,
  calculateDeliveryCharge as calculateDeliveryChargeApi,
} from "../services/deliveryChargeService";

function DeliveryCharge() {

  
const [driverLoading, setDriverLoading] = useState(false);

const [deliveryLoading, setDeliveryLoading] = useState(false);

  const [driverResult, setDriverResult] = useState(null);

  const [deliveryResult, setDeliveryResult] = useState(null);

  const [driverChargeRequest, setDriverChargeRequest] = useState({
    driverLatitude: "",
    driverLongitude: "",
    outletId: "",
    customerAddressId: "",
    orderAmount: "",
  });

  const [deliveryChargeRequest, setDeliveryChargeRequest] = useState({
    outletId: "",
    customerAddressId: "",
    orderAmount: "",
  });

  const handleDriverChange = (e) => {
    const { name, value } = e.target;

    setDriverChargeRequest((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDeliveryChange = (e) => {
    const { name, value } = e.target;

    setDeliveryChargeRequest((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const calculateDriverChargeHandler = async () => {
  try {
    setDriverLoading(true);

    const response = await calculateDriverChargeApi(driverChargeRequest);

    setDriverResult(response.data);

  } catch (error) {
    console.error(error);
    alert("Unable to calculate driver charge.");
  } finally {
    setDriverLoading(false);
  }
};

  const calculateDeliveryChargeHandler = async () => {
  try {
    setDeliveryLoading(true);

    const response = await calculateDeliveryChargeApi(deliveryChargeRequest);

    setDeliveryResult(response.data);

  } catch (error) {
    console.error(error);
    alert("Unable to calculate delivery charge.");
  } finally {
    setDeliveryLoading(false);
  }
};

  return (

    <div className="ddc-page-wrapper">

      <h2 className="ddc-main-title">
        Delivery Charge Calculator
      </h2>

      <div className="ddc-section-card">

        <div className="ddc-section-header">
          DRIVER CHARGE CALCULATION
        </div>

        <div className="ddc-grid">

          <div className="ddc-form-group">
            <label className="ddc-form-label">
              Driver Latitude
            </label>

            <input
              className="ddc-form-input"
              name="driverLatitude"
              value={driverChargeRequest.driverLatitude}
              onChange={handleDriverChange}
            />
          </div>

          <div className="ddc-form-group">
            <label className="ddc-form-label">
              Driver Longitude
            </label>

            <input
              className="ddc-form-input"
              name="driverLongitude"
              value={driverChargeRequest.driverLongitude}
              onChange={handleDriverChange}
            />
          </div>

          <div className="ddc-form-group">
            <label className="ddc-form-label">
              Outlet ID
            </label>

            <input
              className="ddc-form-input"
              name="outletId"
              value={driverChargeRequest.outletId}
              onChange={handleDriverChange}
            />
          </div>

          <div className="ddc-form-group">
            <label className="ddc-form-label">
              Customer Address ID
            </label>

            <input
              className="ddc-form-input"
              name="customerAddressId"
              value={driverChargeRequest.customerAddressId}
              onChange={handleDriverChange}
            />
          </div>

          <div className="ddc-form-group">
            <label className="ddc-form-label">
              Order Amount
            </label>

            <input
              className="ddc-form-input"
              name="orderAmount"
              value={driverChargeRequest.orderAmount}
              onChange={handleDriverChange}
            />
          </div>

        </div>

        <div className="ddc-button-container">

          <button
  className="ddc-save-button"
  onClick={calculateDriverChargeHandler}
  disabled={driverLoading}
>
  {driverLoading
    ? "Calculating..."
    : "Calculate Driver Charge"}
</button>
        </div>

        {driverResult && (

          <div className="ddc-result-card">

            <h3>Driver Charge Result</h3>

            <p>
              <strong>Pickup Distance :</strong>{" "}
              {driverResult.pickupDistanceKm} km
            </p>

            <p>
              <strong>Delivery Distance :</strong>{" "}
              {driverResult.deliveryDistanceKm} km
            </p>

            <p>
              <strong>Pickup Unit Price :</strong> ₹
              {driverResult.pickupUnitPrice}
            </p>

            <p>
              <strong>Delivery Unit Price :</strong> ₹
              {driverResult.deliveryUnitPrice}
            </p>

            <p>
              <strong>Pickup Charge :</strong> ₹
              {driverResult.pickupCharge}
            </p>

            <p>
              <strong>Delivery Charge :</strong> ₹
              {driverResult.deliveryCharge}
            </p>

            <p>
              <strong>Tax Amount :</strong> ₹
              {driverResult.taxAmount}
            </p>

            <p>
              <strong>Total Driver Charge :</strong> ₹
              {driverResult.totalDriverCharge}
            </p>

            <p>
              <strong>COD Available :</strong>{" "}
              {driverResult.codAvailable ? "Yes" : "No"}
            </p>

          </div>

        )}

      </div>


            {/* Delivery Charge */}

      <div className="ddc-section-card">

        <div className="ddc-section-header">
          DELIVERY CHARGE CALCULATION
        </div>

        <div className="ddc-grid">

          <div className="ddc-form-group">
            <label className="ddc-form-label">
              Outlet ID
            </label>

            <input
              className="ddc-form-input"
              name="outletId"
              value={deliveryChargeRequest.outletId}
              onChange={handleDeliveryChange}
            />
          </div>

          <div className="ddc-form-group">
            <label className="ddc-form-label">
              Customer Address ID
            </label>

            <input
              className="ddc-form-input"
              name="customerAddressId"
              value={deliveryChargeRequest.customerAddressId}
              onChange={handleDeliveryChange}
            />
          </div>

          <div className="ddc-form-group">
            <label className="ddc-form-label">
              Order Amount
            </label>

            <input
              className="ddc-form-input"
              name="orderAmount"
              value={deliveryChargeRequest.orderAmount}
              onChange={handleDeliveryChange}
            />
          </div>

        </div>

        <div className="ddc-button-container">

          <button
  className="ddc-save-button"
  onClick={calculateDeliveryChargeHandler}
  disabled={deliveryLoading}
>
  {deliveryLoading
    ? "Calculating..."
    : "Calculate Delivery Charge"}
</button>

        </div>

        {deliveryResult && (

          <div className="ddc-result-card">

            <h3>Delivery Charge Result</h3>

            <p>
              <strong>Delivery Distance :</strong>{" "}
              {deliveryResult.deliveryDistanceKm} km
            </p>

            <p>
              <strong>Delivery Charge :</strong> ₹
              {deliveryResult.deliveryCharge}
            </p>

            <p>
              <strong>Tax Amount :</strong> ₹
              {deliveryResult.taxAmount}
            </p>

            <p>
              <strong>Total Delivery Charge :</strong> ₹
              {deliveryResult.totalDeliveryCharge}
            </p>

            <p>
              <strong>COD Available :</strong>{" "}
              {deliveryResult.codAvailable ? "Yes" : "No"}
            </p>

          </div>

        )}

      </div>

    </div>

  );

}

export default DeliveryCharge;  