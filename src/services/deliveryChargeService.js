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
// GET /api/driver/getZones
//
// The UI will display the zone name,
// while the selected zone ID will be sent
// to the delivery charge save API.
export const getZones = async () => {
  const response = await FM_API.get("/api/driver/getZones");

  return response.data;
};