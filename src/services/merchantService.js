import { FM_API } from "./api";

// Get All Merchants
export const getAllMerchants = async () => {
  console.log("Base URL:", FM_API.defaults?.baseURL);

  const response = await FM_API.get("/api/fm/merchants");

  return response.data;
};

// Get Outlets by Merchant ID
export const getOutletsByMerchant = async (merchantId) => {
  try {
    const response = await FM_API.get(
      `/api/fm/outlets/getOutletsByMerchant?merchantId=${merchantId}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching outlets for merchant ${merchantId}:`, error);
    throw error;
  }
};

// Get Products by Outlet ID
export const getProductsByOutlet = async (outletId) => {
  try {
    const response = await FM_API.get(`/api/fm/products/outlets/${outletId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching products for outlet ${outletId}:`, error);
    throw error;
  }
};

// Bulk Upload Merchants / Outlets
export const uploadMerchants = async (file) => {
  const formData = new FormData();

  formData.append("file", file);

  const response = await FM_API.post(
    "/api/fm/outlets/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};