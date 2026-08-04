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

// Get All Outlets
export const getOutlets = async () => {
  return await FM_API.get("/api/fm/outlets");
};

// Get All Customers
export const getCustomers = async () => {
  return await FM_API.get("/api/co/customers");
};