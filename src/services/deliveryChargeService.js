import { FM_API } from "./api";

// Driver Charge Calculation
export const calculateDriverCharge = async (payload) => {
  return await FM_API.post(
    "/api/driver/driver-charge/calculate",
    payload
  );
};

// Delivery Charge Calculation
export const calculateDeliveryCharge = async (payload) => {
  return await FM_API.post(
    "/api/driver/delivery-charge/calculate",
    payload
  );
};