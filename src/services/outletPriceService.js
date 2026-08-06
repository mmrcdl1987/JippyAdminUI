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
 * Fetch Outlet Products for Price Update (GET)
 * Hits endpoint: /api/fm/products/outlets/{outletId}
 */
export const fetchOutletProductsForUpdate = async (outletId) => {
  const response = await FM_API.get(`/api/fm/products/outlets/${outletId}`);
  return response.data;
};

/**
 * Update Outlet Products
 * Hits endpoint: /api/fm/products/outlets/{outletId}
 */
export const updateOutletProducts = async (outletId, payload, userType = "MERCHANT") => {
  const response = await FM_API.put(
    `/api/fm/products/outlets/${outletId}`,
    payload,
    {
      params: {
        userType,
      },
    }
  );
  return response.data;
};