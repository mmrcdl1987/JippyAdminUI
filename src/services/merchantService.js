import { FM_API } from "./api";

// ============================================================
// Get All Merchants
// ============================================================
export const getAllMerchants = async () => {
  console.log("Base URL:", FM_API.defaults?.baseURL);

  const response = await FM_API.get("/api/fm/merchants");

  return response.data;
};

// ============================================================
// Get Outlets by Merchant ID
// ============================================================
export const getOutletsByMerchant = async (merchantId) => {
  try {
    const response = await FM_API.get(
      `/api/fm/outlets/getOutletsByMerchant?merchantId=${merchantId}`
    );

    return response.data;
  } catch (error) {
    console.error(
      `Error fetching outlets for merchant ${merchantId}:`,
      error
    );

    throw error;
  }
};

// ============================================================
// Get Products by Outlet ID
// ============================================================
export const getProductsByOutlet = async (outletId) => {
  try {
    const response = await FM_API.get(
      `/api/fm/products/outlets/${outletId}`
    );

    return response.data;
  } catch (error) {
    console.error(
      `Error fetching products for outlet ${outletId}:`,
      error
    );

    throw error;
  }
};

// ============================================================
// Bulk Upload Merchants
// ============================================================
export const uploadMerchants = async (file) => {
  try {
    if (!file) {
      throw new Error("No file selected.");
    }

    const formData = new FormData();

    formData.append("file", file);

    console.log(
      "Calling Merchant Bulk Upload API:",
      "/api/fm/merchants/upload"
    );

    console.log("Uploading file:", file.name);
    console.log("File size:", file.size);
    console.log("File type:", file.type);

    const response = await FM_API.post(
      "/api/fm/merchants/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log(
      "Merchant Bulk Upload API Response:",
      response.data
    );

    return response.data;
  } catch (error) {
    console.error(
      "Merchant Bulk Upload API Error:",
      error?.response?.data || error
    );

    throw error;
  }
};

export const fetchStates = async () => {
  const response = await FM_API.get(
    "/api/fm/location/fetchStates"
  );

  return response.data;
};

export const fetchCitiesByState = async (stateId) => {
  const response = await FM_API.get(
    `/api/fm/location/fetchCityInState?stateId=${stateId}`
  );

  return response.data;
};

// ============================================================
// Get Merchant Address (State, City, Area details)
// Endpoint: /api/fm/merchants/getMerchantAddress?merchantId={merchantId}
// ============================================================
export const getMerchantAddress = async (merchantId) => {
  try {
    const response = await FM_API.get(
      `/api/fm/merchants/getMerchantAddress?merchantId=${merchantId}`
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching merchant address for merchantId ${merchantId}:`,
      error
    );
    throw error;
  }
};

// ============================================================
// Get Merchant Profile (Merchant & Bank details)
// Endpoint: /api/fm/merchants/getMerchantProfile?merchantId={merchantId}
// ============================================================
export const getMerchantProfile = async (merchantId) => {
  try {
    const response = await FM_API.get(
      `/api/fm/merchants/getMerchantProfile?merchantId=${merchantId}`
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching merchant profile for merchantId ${merchantId}:`,
      error
    );
    throw error;
  }
};

// ============================================================
// Toggle Merchant Active Status
// Endpoint: PUT /api/fm/merchants/toggleMerchant
// Body: { merchantId, isActive }
// ============================================================
export const toggleMerchantStatus = async (merchantId, isActive) => {
  try {
    const response = await FM_API.put("/api/fm/merchants/toggleMerchant", {
      merchantId: Number(merchantId),
      isActive: Boolean(isActive),
    });
    return response.data;
  } catch (error) {
    console.error(
      `Error toggling merchant active status for merchantId ${merchantId}:`,
      error
    );
    throw error;
  }
};

// ============================================================
// Update Merchant Profile Picture (Multipart File Upload)
// Endpoint: PUT /api/fm/merchants/updateMerchantProfilePic
// Request Params (Multipart): merchantId, file
// ============================================================
export const updateMerchantProfilePic = async (merchantId, file) => {
  try {
    const formData = new FormData();
    formData.append("merchantId", merchantId);
    formData.append("file", file);

    const response = await FM_API.put(
      "/api/fm/merchants/updateMerchantProfilePic",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error updating profile pic for merchantId ${merchantId}:`,
      error
    );
    throw error;
  }
};

// ============================================================
// Update Merchant Profile
// Endpoint: PUT /api/fm/merchants/updateMerchantProfile
// ============================================================
export const updateMerchantProfile = async (formData) => {
  try {
    const response = await FM_API.put(
      "/api/fm/merchants/updateMerchantProfile",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating merchant profile:", error);
    throw error;
  }
};
