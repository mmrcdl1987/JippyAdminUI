import { FM_API } from "./api";

// Get paginated list
// Maps to: /api/driver/delivery-charge-settings/get-all
export const getDeliveryRules = async ({ page = 0, size = 10 } = {}) => {
  const response = await FM_API.get(
    "/api/driver/delivery-charge-settings/get-all",
    {
      params: {
        page,
        size
      }
    }
  );

  return response.data;
};

// Get single delivery charge rule by ID
// Maps to: /api/driver/delivery-charge-settings/get/{id}
export const getDeliveryRuleById = async (id) => {
  const response = await FM_API.get(
    `/api/driver/delivery-charge-settings/get/${id}`
  );

  return response.data;
};

// Create or Update delivery charge rule
// Maps to: /api/driver/delivery-charge-settings/save
//
// If ruleData contains deliveryChargeSettingId,
// the backend will update the existing rule.
//
// If deliveryChargeSettingId is not provided,
// the backend will create a new rule.
export const saveDeliveryRule = async (ruleData) => {
  const response = await FM_API.post(
    "/api/driver/delivery-charge-settings/save",
    ruleData
  );

  return response.data;
};

// Delete delivery charge rule
// Maps to:
// /api/driver/delivery-charge-settings/delete
//
// Request body:
// {
//   deliveryChargeSettingId: id
// }
export const deleteDeliveryRule = async (id) => {
  const response = await FM_API.delete(
    "/api/driver/delivery-charge-settings/delete",
    {
      data: {
        deliveryChargeSettingId: id
      }
    }
  );

  return response.data;
};

// Get all zones
// Maps to:
// GET /api/driver/zones
//
// The UI will display the zone name,
// while the selected zone ID will be sent
// to the delivery charge save API.
export const getZones = async () => {
  const response = await FM_API.get("/api/driver/zones");

  return response.data;
};

export const getCustomerDeliveryRules = async () => {
  const response = await FM_API.get("/api/co/customer-delivery-charge-settings");
  return response.data;
};

export const getCustomerDeliveryRuleById = async (id) => {
  const response = await FM_API.get(`/api/co/customer-delivery-charge-settings/${id}`);
  return response.data;
};

export const createCustomerDeliveryRule = async (payload) => {
  const response = await FM_API.post("/api/co/customer-delivery-charge-settings", payload, {
    headers: { "X-User-Id": getCurrentUserId() }
  });
  return response.data;
};

export const updateCustomerDeliveryRule = async (id, payload) => {
  const response = await FM_API.put(`/api/co/customer-delivery-charge-settings/${id}`, payload, {
    headers: { "X-User-Id": getCurrentUserId() }
  });
  return response.data;
};

export const deleteCustomerDeliveryRule = async (id) => {
  const response = await FM_API.delete(`/api/co/customer-delivery-charge-settings/${id}`);
  return response.data;
};

export const getCustomerDeliveryAreas = async () => {
  const statesResponse = await FM_API.get("/api/fm/location/fetchStates");
  const states = Array.isArray(statesResponse.data) ? statesResponse.data : [];
  const cityResponses = await Promise.all(
    states
      .map((state) => state?.stateId ?? state?.id ?? state?.state_id)
      .filter(Boolean)
      .map((stateId) => FM_API.get("/api/fm/location/fetchCityInState", { params: { stateId } }))
  );
  const cities = cityResponses.flatMap((response) => Array.isArray(response.data) ? response.data : []);
  const areaResponses = await Promise.all(
    cities
      .map((city) => city?.cityId ?? city?.id ?? city?.city_id)
      .filter(Boolean)
      .map((cityId) => FM_API.get("/api/fm/location/fetchAreaInCity", { params: { cityId } }))
  );
  return areaResponses.flatMap((response) => Array.isArray(response.data) ? response.data : []);
};

const getCurrentUserId = () => {
  const value = localStorage.getItem("userId") || localStorage.getItem("id");
  return value ? Number(value) : undefined;
};