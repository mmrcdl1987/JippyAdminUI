import api from "./api";

// ============================================================
// GET ALL OUTLETS
// ============================================================
export const getAllOutlets = async () => {
  try {
    const response = await api.get("/api/fm/outlets");
<<<<<<< Updated upstream

    console.log("ALL OUTLETS FULL RESPONSE:", response.data);
    console.log("ALL OUTLETS DATA:", response.data?.data);

=======
>>>>>>> Stashed changes
    return response.data?.data || [];
  } catch (error) {
    console.error("Failed to fetch outlets:", error);
    throw error;
  }
};
<<<<<<< Updated upstream
=======

// export const getAllOutlets = async () => {
//   try {
//     const response = await api.get("/api/fm/outlets");

//     console.log("ALL OUTLETS FULL RESPONSE:", response.data);
//     console.log("ALL OUTLETS DATA:", response.data?.data);

//     return response.data?.data || [];
//   } catch (error) {
//     console.error("Failed to fetch outlets:", error);
//     throw error;
//   }
// };

>>>>>>> Stashed changes

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

// ============================================================
<<<<<<< Updated upstream
// BULK UPLOAD OUTLETS
// ============================================================
export const uploadOutletsBulk = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post(
      "/api/fm/outlets/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log("BULK UPLOAD RESPONSE:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "BULK UPLOAD ERROR:",
      error.response?.status,
      error.response?.data || error.message
    );
=======
// SET OUTLET UNAVAILABLE
// ============================================================

export const setOutletUnavailable = async (
  outletId,
  fromDate,
  toDate,
  reason = "Outlet unavailable"
) => {
  try {
    const formatDateTime = (value) => {
      if (!value) return null;

      return value.length === 16
        ? `${value}:00`
        : value.substring(0, 19);
    };

    const payload = {
      type: "OUTLET",
      unavailabilityId: Number(outletId),
      unavailabilityFromDate: formatDateTime(fromDate),
      unavailabilityToDate: formatDateTime(toDate),
      reason: reason?.trim() || "Outlet unavailable",
    };

    console.log(
      "OUTLET UNAVAILABILITY PAYLOAD:",
      JSON.stringify(payload, null, 2)
    );

    const response = await api.post(
      "/api/fm/outlet-unavailability",
      payload
    );

    console.log("OUTLET UNAVAILABILITY RESPONSE:", response.data);

    return response.data;
  } catch (error) {
    console.error(
      "SET OUTLET UNAVAILABLE ERROR:",
      error.response?.status,
      error.response?.data || error.message
    );

    throw error;
  }
};

// For product
export const setProductUnavailable = async (
  productId,
  fromDate,
  toDate,
  reason = "Product unavailable"
) => {
  try {
    const formatDateTime = (value) => {
      if (!value) return null;

      return value.length === 16
        ? `${value}:00`
        : value.substring(0, 19);
    };

    const payload = {
      type: "PRODUCT",
      unavailabilityId: Number(productId),
      unavailabilityFromDate: formatDateTime(fromDate),
      unavailabilityToDate: formatDateTime(toDate),
      reason: reason?.trim() || "Product unavailable",
    };

    console.log(
      "PRODUCT UNAVAILABILITY PAYLOAD:",
      JSON.stringify(payload, null, 2)
    );

    const response = await api.post(
      "/api/fm/outlet-unavailability",
      payload
    );

    console.log("PRODUCT UNAVAILABILITY RESPONSE:", response.data);

    return response.data;
  } catch (error) {
    console.error(
      "SET PRODUCT UNAVAILABLE ERROR:",
      error.response?.status,
      error.response?.data || error.message
    );

    throw error;
  }
};


// ============================================================
// RESTORE AVAILABILITY
// Used when toggling FOOD/PRODUCT or OUTLET back ON
// ============================================================

export const restoreUnavailability = async (
  type,
  unavailabilityId,
  reason
) => {
  try {
    const payload = {
      type: type,
      unavailabilityId: Number(unavailabilityId),
      reason: reason?.trim() || "stock restored",
    };

    console.log(
      "RESTORE UNAVAILABILITY PAYLOAD:",
      JSON.stringify(payload, null, 2)
    );

    const response = await api.patch(
      "/api/fm/outlet-unavailability/restore",
      payload
    );

    console.log(
      "RESTORE UNAVAILABILITY RESPONSE:",
      response.data
    );

    return response.data;
  } catch (error) {
    console.error(
      "RESTORE UNAVAILABILITY ERROR:",
      error.response?.status,
      error.response?.data || error.message
    );

    throw error;
  }
};

export const restoreProductUnavailable = async (
  productId,
  reason = "stock restored"
) => {
  try {
    const payload = {
      type: "PRODUCT",
      unavailabilityId: Number(productId),
      reason: reason?.trim() || "stock restored",
    };

    console.log(
      "RESTORE PRODUCT UNAVAILABILITY PAYLOAD:",
      JSON.stringify(payload, null, 2)
    );

    const response = await api.patch(
      "/api/fm/outlet-unavailability/restore",
      payload
    );

    console.log(
      "RESTORE PRODUCT UNAVAILABILITY RESPONSE:",
      response.data
    );

    return response.data;
  } catch (error) {
    console.error(
      "RESTORE PRODUCT UNAVAILABILITY ERROR:",
      error.response?.status,
      error.response?.data || error.message
    );

    throw error;
  }
};





// ============================================================
// RESTORE OUTLET AVAILABILITY
// OFF → ON
// ============================================================

export const restoreOutletUnavailability = async (outletId) => {
  try {
    const payload = {
      type: "OUTLET",
      unavailabilityId: Number(outletId),
      reason: "outlet restored",
    };

    console.log(
      "RESTORE OUTLET UNAVAILABILITY PAYLOAD:",
      JSON.stringify(payload, null, 2)
    );

    const response = await api.patch(
      "/api/fm/outlet-unavailability/restore",
      payload
    );

    console.log(
      "RESTORE OUTLET UNAVAILABILITY RESPONSE:",
      response.data
    );

    return response.data;
  } catch (error) {
    console.error(
      "RESTORE OUTLET UNAVAILABILITY ERROR:",
      error.response?.status,
      error.response?.data || error.message
    );

    throw error;
  }
};



// ============================================================
// SET CATEGORY UNAVAILABLE
// ============================================================
export const setCategoryUnavailable = async (
  categoryId,
  fromDate,
  toDate,
  reason = "Category unavailable"
) => {
  try {
    const formatDateTime = (value) => {
      if (!value) return null;

      return value.length === 16
        ? `${value}:00`
        : value.substring(0, 19);
    };

    const payload = {
      type: "OUTLET_CATEGORY",
      unavailabilityId: Number(categoryId),
      unavailabilityFromDate: formatDateTime(fromDate),
      unavailabilityToDate: formatDateTime(toDate),
      reason: reason?.trim() || "Category unavailable",
    };

    console.log(
      "CATEGORY UNAVAILABILITY PAYLOAD:",
      JSON.stringify(payload, null, 2)
    );

    const response = await api.post(
      "/api/fm/outlet-unavailability",
      payload
    );

    console.log(
      "CATEGORY UNAVAILABILITY RESPONSE:",
      response.data
    );

    return response.data;
  } catch (error) {
    console.error(
      "SET CATEGORY UNAVAILABLE ERROR:",
      error.response?.status,
      error.response?.data || error.message
    );

    throw error;
  }
};

// ============================================================
// RESTORE CATEGORY UNAVAILABILITY
// ============================================================
export const restoreCategoryUnavailable = async (categoryId) => {
  try {
    const payload = {
      type: "OUTLET_CATEGORY",
      unavailabilityId: Number(categoryId),
      reason: "category restored",
    };

    console.log(
      "RESTORE CATEGORY UNAVAILABILITY PAYLOAD:",
      JSON.stringify(payload, null, 2)
    );

    const response = await api.patch(
      "/api/fm/outlet-unavailability/restore",
      payload
    );

    console.log(
      "CATEGORY RESTORE RESPONSE:",
      response.data
    );

    return response.data;
  } catch (error) {
    console.error(
      "RESTORE CATEGORY UNAVAILABILITY ERROR:",
      error.response?.status,
      error.response?.data || error.message
    );

>>>>>>> Stashed changes
    throw error;
  }
};