import api from "./api";


//Get All Outlets
export const getAllOutlets = async () => {
  try {
    const response = await api.get("/api/fm/outlets");

    return response.data?.data || [];
  } catch (error) {
    console.error("Failed to fetch outlets:", error);
    throw error;
  }
};

//Get Outlets by ID
export const getOutletById = async (outletId) => {
  try {
    const response = await api.get(
      `/api/fm/outlets/getOutletById/${outletId}`
    );

    return response.data;
  } catch (error) {
    console.error("Failed to fetch outlet by ID:", error);
    throw error;
  }
};

//Update Outlet
export const updateOutlet = async (outletId, userType, payload) => {
  try {
    const response = await api.put(
      "/api/fm/outlets/editAndUpdateOutletProducts",
      payload,
      {
        params: {
          outletId,
          userType,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Failed to update outlet:", error);
    throw error;
  }
};

// Create Outlet
export const createOutlet = async (payload) => {
  try {
    const response = await api.post(
      "/api/fm/outlets/create",
      payload
    );

    return response.data;
  } catch (error) {
    console.error("Failed to create outlet:", error);
    throw error;
  }
};