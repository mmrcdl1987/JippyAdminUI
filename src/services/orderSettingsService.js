import { FM_API } from "./api";

// Create Order Settings
export const createOrderSettings = async (payload) => {
  return await FM_API.post(
    "/api/co/order-settings",
    payload
  );
};

export const getCheckoutFees = async () => {
  const response = await FM_API.get("/api/co/order-checkout-fee");
  return response.data;
};

export const getCheckoutFeeById = async (id) => {
  const response = await FM_API.get(`/api/co/order-checkout-fee/${id}`);
  return response.data;
};

export const createCheckoutFee = async (payload) => {
  const response = await FM_API.post("/api/co/order-checkout-fee", payload);
  return response.data;
};

export const updateCheckoutFee = async (id, payload) => {
  const response = await FM_API.put(`/api/co/order-checkout-fee/${id}`, payload);
  return response.data;
};

export const deleteCheckoutFee = async (id) => {
  const response = await FM_API.delete(`/api/co/order-checkout-fee/${id}`);
  return response.data;
};

export const getCheckoutTaxes = async () => {
  const response = await FM_API.get("/api/co/order-checkout-tax");
  return response.data;
};

export const getCheckoutTaxById = async (id) => {
  const response = await FM_API.get(`/api/co/order-checkout-tax/${id}`);
  return response.data;
};

export const createCheckoutTax = async (payload) => {
  const response = await FM_API.post("/api/co/order-checkout-tax", payload);
  return response.data;
};

export const updateCheckoutTax = async (id, payload) => {
  const response = await FM_API.put(`/api/co/order-checkout-tax/${id}`, payload);
  return response.data;
};

export const deleteCheckoutTax = async (id) => {
  const response = await FM_API.delete(`/api/co/order-checkout-tax/${id}`);
  return response.data;
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
