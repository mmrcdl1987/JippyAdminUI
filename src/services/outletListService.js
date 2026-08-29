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

export const getOutletDetails = async (outletId, userType = "merchant") => {
  try {
    const response = await api.get(
      "/api/fm/outlets/getOutletDetails",
      {
        params: {
          outletId: Number(outletId),
          userType: userType,
        },
      }
    );

    console.log(
      "GET OUTLET DETAILS RESPONSE:",
      response.data
    );

    return unwrapOutletPayload(response.data);
  } catch (error) {
    console.error(
      "GET OUTLET DETAILS ERROR:",
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
export const updateOutlet = async (
  outletId,
  userType,
  payload
) => {
  const response = await api.put(
    "/api/fm/outlets/editAndUpdateOutletProducts",
    payload,
    {
      params: {
        outletId: Number(outletId),
        userType: userType || "customer",
      },
    }
  );

  return response.data;
};

// ============================================================
// CREATE OUTLET
// ============================================================
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