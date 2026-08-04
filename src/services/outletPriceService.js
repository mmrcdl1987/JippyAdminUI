import { FM_API } from "./api";

/**
 * Campaign Location API
 * Query Parameters:
 * - stateId (Required)
 * - cityId (Optional)
 * - areaId (Optional)
 */
export const fetchCampaignLocations = async (stateId, cityId = null, areaId = null) => {
  const params = { stateId };
  if (cityId) params.cityId = cityId;
  if (areaId) params.areaId = areaId;

  const response = await FM_API.get("/api/fm/campaign/location", { params });
  return response.data || {};
};

/**
 * Fetch States API
 */
export const fetchStates = async () => {
  const response = await FM_API.get("/api/fm/location/fetchStates");
  return response.data || [];
};

/**
 * Fetch Outlet Details
 */
export const fetchOutletDetailsById = async (outletId) => {
  const response = await FM_API.get(`/api/fm/outlets/getOutletById/${outletId}`);
  return response.data;
};

/**
 * Update Outlet Products
 */
export const updateOutletProducts = async (outletId, payload, userType = "MERCHANT") => {
  const response = await FM_API.put(
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
};