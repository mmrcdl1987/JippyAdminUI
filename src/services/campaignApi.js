import { API, FM_API } from "./api";

/* ==========================================
   Campaign Location & Slot APIs
========================================== */

export const fetchAvailableMealSlots = async (payload) => {
  const response = await API.post("/api/div/coupons/available-meal-slots", payload);
  return response.data;
};

export const getStates = async () => {
  const response = await FM_API.get("/api/fm/location/fetchStates");
  return response.data;
};

export const getCities = async (stateId) => {
  const response = await FM_API.get(`/api/fm/location/fetchCityInState?stateId=${stateId}`);
  return response.data;
};

export const getAreas = async (cityId) => {
  const response = await FM_API.get(`/api/fm/location/fetchAreaInCity?cityId=${cityId}`);
  return response.data;
};

export const getCampaignLocation = async (stateId, cityId = null, areaId = null) => {
  let url = `/api/fm/campaign/location?stateId=${stateId}`;
  if (cityId) url += `&cityId=${cityId}`;
  if (areaId) url += `&areaId=${areaId}`;

  const response = await FM_API.get(url);
  return response.data;
};

/* ==========================================
   Campaign Creation & Coupon APIs
========================================== */

export const createCampaign = async (payload) => {
  const response = await API.post("/api/div/campaign/campaign/create", payload);
  return response.data;
};

/**
 * Fetch active coupons for dropdown selection
 */
export const getActiveCoupons = async () => {
  const response = await API.get("/api/div/coupons/active");
  return response.data;
};