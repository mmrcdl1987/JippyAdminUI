import { API, FM_API } from "./api";

/* ==========================================
   Campaign Location APIs
========================================== */

// Fetch States
export const getStates = async () => {

  const response = await FM_API.get(
    "/api/fm/location/fetchStates"
  );

  return response.data;
};

// Fetch Cities
export const getCities = async (stateId) => {

  const response = await FM_API.get(
    `/api/fm/location/fetchCityInState?stateId=${stateId}`
  );

  return response.data;
};

// Fetch Areas
export const getAreas = async (cityId) => {

  const response = await FM_API.get(
    `/api/fm/location/fetchAreaInCity?cityId=${cityId}`
  );

  return response.data;
};

// Fetch Available Outlets
 
export const getAvailableOutlets = async (areaId) => {
  const response = await API.get(
    `/api/fm/outlets/available-outlets/${areaId}`
  );

  return response.data;
};

/* ==========================================
   Campaign APIs
========================================== */

// Create Campaign
export const createCampaign = async (payload) => {

  const response = await API.post(
    "/api/coupons/campaign/create",
    payload
  );

  return response.data;
};

// Fetch Coupons
export const getCoupons = async (
  page = 0,
  size = 20
) => {

  const response = await API.get(
    `/api/coupons?page=${page}&size=${size}`
  );

  return response.data;
};

// Fetch Price Models
export const getPriceModels = async () => {

  const response = await API.get(
    "/api/coupons/getPriceModels"
  );

  return response.data;
};