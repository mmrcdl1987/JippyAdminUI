import api from "./api";

// ============================================================
// GET ALL OUTLETS
// ============================================================
// export const getAllOutlets = async () => {
//   try {
//     const response = await api.get("/api/fm/outlets");
//     return response.data?.data || [];
//   } catch (error) {
//     console.error("Failed to fetch outlets:", error);
//     throw error;
//   }
// };

export const getAllOutlets = async () => {
  try {
    const response = await api.get("/api/fm/outlets");

    console.log("ALL OUTLETS FULL RESPONSE:", response.data);
    console.log("ALL OUTLETS DATA:", response.data?.data);

    return response.data?.data || [];
  } catch (error) {
    console.error("Failed to fetch outlets:", error);
    throw error;
  }
};

// ============================================================
// GET OUTLET BY ID
// ============================================================
export const getOutletById = async (outletId) => {
  try {
    const response = await api.get(
      `/api/fm/outlets/getOutletById/${Number(outletId)}`
    );

    return response.data;
  } catch (error) {
    console.error("Failed to fetch outlet by ID:", error);
    throw error;
  }
};

// ============================================================
// GET COMPLETE OUTLET DETAILS
// BASIC + FOODS
// ============================================================


const unwrapOutletPayload = (body) => {
  if (!body || typeof body !== "object") {
    return body;
  }

  if (
    body.outletId != null ||
    Array.isArray(body.categories)
  ) {
    return body;
  }

  if (body.data && typeof body.data === "object") {
    return body.data;
  }

  return body;
};

// ============================================================
// GET COMPLETE OUTLET DETAILS - ADMIN
// BASIC + FOODS
// ============================================================

export const getOutletDetails = async (outletId) => {
  try {
    const response = await api.get(
      "/api/fm/outlets/admin/outlet-details",
      {
        params: {
          outletId: Number(outletId),
        },
      }
    );

    console.log(
      "ADMIN OUTLET DETAILS RESPONSE:",
      response.data
    );

    return response.data;
  } catch (error) {
    console.error(
      "ADMIN OUTLET DETAILS ERROR:",
      error.response?.status,
      error.response?.data || error.message
    );

    throw error;
  }
};
// ============================================================
// GET OUTLET LOCATION
// ============================================================
export const getOutletLocation = async (outletId) => {
  try {
    const response = await api.get(
      `/api/fm/outlets/location/${Number(outletId)}`
    );

    return response.data;
  } catch (error) {
    console.error("Failed to fetch outlet location:", error);
    throw error;
  }
};

// ============================================================
// GET SUBSCRIPTION STATUS
// ============================================================
export const getOutletSubscriptionStatus = async (outletId) => {
  try {
    const response = await api.get(
      `/api/fm/outlet-subscription-plans/status/${Number(outletId)}`
    );

    console.log(
      "SUBSCRIPTION STATUS RESPONSE:",
      response.data
    );

    return response.data;
  } catch (error) {
    console.error(
      "Failed to fetch outlet subscription:",
      error
    );

    throw error;
  }
};

// ============================================================
// UPDATE OUTLET
// ============================================================
// ============================================================
// UPDATE OUTLET DETAILS - ADMIN / MERCHANT
// ============================================================
export const updateOutletDetailsByMerchant = async (
  outletId,
  payload
) => {
  try {
    const response = await api.put(
      `/api/fm/outlets/updateOutletDetailsByMerchant/${Number(
        outletId
      )}`,
      payload
    );

    console.log(
      "UPDATE OUTLET DETAILS RESPONSE:",
      response.data
    );

    return response.data;
  } catch (error) {
    console.error(
      "UPDATE OUTLET DETAILS ERROR:",
      error.response?.status,
      error.response?.data || error.message
    );

    throw error;
  }
};
// ============================================================
// CREATE OUTLET
// ============================================================
export const createOutlet = async (payload) => {
  try {
    console.log("CREATE OUTLET PAYLOAD:", payload);

    const response = await api.post(
      "/api/fm/outlets/createOutlet",
      payload
    );

    console.log("CREATE OUTLET RESPONSE:", response.data);

    return response.data;
  } catch (error) {
    console.error(
      "CREATE OUTLET ERROR:",
      error.response?.status,
      error.response?.data || error.message
    );

    throw error;
  }
};

// ============================================================
// OUTLET COUNT
// ============================================================
export const getOutletCount = async () => {
  try {
    const response = await api.get(
      "/api/fm/outlets/count"
    );

    return response.data?.data || 0;
  } catch (error) {
    console.error(
      "Failed to fetch outlet count:",
      error
    );
    throw error;
  }
};

// ============================================================
// GET AREAS BY CITY
// ============================================================
export const getAreasByCity = async (cityId) => {
  try {
    const response = await api.get(
      `/api/fm/outlets/areas/by-city/${Number(cityId)}`
    );

    console.log("AREAS BY CITY RESPONSE:", response.data);

    return response.data?.data || response.data || [];
  } catch (error) {
    console.error(
      "GET AREAS BY CITY ERROR:",
      error.response?.status,
      error.response?.data || error.message
    );

    throw error;
  }
};