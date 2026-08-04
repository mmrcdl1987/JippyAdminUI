import { FM_API } from "./api";

// Get All Plans
export const getAllSubscriptionPlans = async () => {
  return await FM_API.get("/api/fm/subscription-plans");
};

// Get Plan By Id
export const getSubscriptionPlanById = async (id) => { 
  return await FM_API.get(`/api/fm/subscription-plans/${id}`);
};

// Create Plan
export const createSubscriptionPlan = async (payload) => {
  return await FM_API.post("/api/fm/subscription-plans", payload);
};

// Delete Plan
export const deleteSubscriptionPlan = async (id) => {
  return await FM_API.delete(`/api/fm/subscription-plans/${id}`);
};

// Get All States
export const getStates = async () => {
  return await FM_API.get("/api/fm/location/fetchStates");
};

// Get Cities By State
export const getCitiesByState = async (stateId) => {
  return await FM_API.get(
    `/api/fm/location/fetchCityInState?stateId=${stateId}`
  );
};

// Get Areas By City
export const getAreasByCity = async (cityId) => {
  return await FM_API.get(
    `/api/fm/location/fetchAreaInCity?cityId=${cityId}`
  );
};


// Get Plans By Area
export const getSubscriptionPlansByArea = async (areaId) => {
  return await FM_API.get(
    `/api/fm/subscription-plans/area/${areaId}`
  );
};