import { FM_API } from "./api";

/**
 * Campaign Location API
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
 * Fetch Outlet Products Pricing (GET)
 */
export const fetchOutletProductsForUpdate = async (outletId) => {
  const response = await FM_API.get(`/api/fm/products/outlets/${outletId}/pricing`);
  return response.data;
};

/**
 * Single/Changed Products Update API (POST)
 */
export const updateOutletPricing = async (payload, isApproved = true) => {
  const response = await FM_API.post(
    `/api/fm/pricing/update`,
    payload,
    {
      params: { isApproved },
    }
  );
  return response.data;
};

/**
 * Bulk Outlet Pricing Update API (POST)
 * Hits endpoint: /api/fm/pricing/bulk-update?isApproved=true
 */
export const bulkUpdateOutletPricing = async (payload, isApproved = true) => {
  const response = await FM_API.post(
    `/api/fm/pricing/bulk-update`,
    payload,
    {
      params: { isApproved },
    }
  );
  return response.data;
};