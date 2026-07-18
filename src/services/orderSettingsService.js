import { FM_API } from "./api";

// Create Order Settings
export const createOrderSettings = async (payload) => {

  return await FM_API.post(
    "/api/co/order-settings",
    payload
  );

};