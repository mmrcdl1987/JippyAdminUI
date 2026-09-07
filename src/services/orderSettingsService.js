import { FM_API } from "./api";

// Create Order Settings
export const createOrderSettings = async (payload) => {
  return await FM_API.post(
    "/api/co/order-settings",
    payload
  );
};

// =============================================
// Payment Modes APIs
// =============================================

// Get Active Payment Modes
export const getActivePaymentModes = async () => {
  return await FM_API.get("/api/co/order-settings/getActivePaymentModes");
};

// Get All Payment Modes
export const getAllPaymentModes = async () => {
  return await FM_API.get("/api/co/order-settings/payment-mode");
};

// Get Payment Mode By ID
export const getPaymentModeById = async (paymentModeId) => {
  return await FM_API.get("/api/co/order-settings/getPaymentModeById", {
    params: { paymentModeId },
  });
};

// Create Payment Mode
export const createPaymentMode = async (payload) => {
  return await FM_API.post("/api/co/order-settings/payment-mode", payload);
};

// Update Payment Mode
export const updatePaymentMode = async (id, payload) => {
  return await FM_API.put(`/api/co/order-settings/payment-mode/${id}`, payload);
};

// Delete Payment Mode (Soft Delete)
export const deletePaymentMode = async (id) => {
  return await FM_API.delete(`/api/co/order-settings/payment-mode/${id}`);
};
