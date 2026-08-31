import { FM_API } from "./api";

// Get paginated list (Maps to: /api/driver/delivery-charge-settings/get-all)
export const getDeliveryRules = async ({ page = 0, size = 10 } = {}) => {
  const response = await FM_API.get("/api/driver/delivery-charge-settings/get-all", {
    params: { page, size }
  });
  return response.data; // Returns { content: [...], totalPages, page, size, totalElements }
};

// Get single rule by ID (Maps to: /api/driver/delivery-charge-settings/get/{id})
export const getDeliveryRuleById = async (id) => {
  const response = await FM_API.get(`/api/driver/delivery-charge-settings/get/${id}`);
  return response.data;
};

// Create or Update (Maps to: /api/driver/delivery-charge-settings/save)
// If ruleData contains "deliveryChargeSettingId", it updates; otherwise it creates.
export const saveDeliveryRule = async (ruleData) => {
  const response = await FM_API.post("/api/driver/delivery-charge-settings/save", ruleData);
  return response.data;
};

// Delete rule (Maps to: /api/driver/delivery-charge-settings/delete with JSON body)
export const deleteDeliveryRule = async (id) => {
  const response = await FM_API.delete("/api/driver/delivery-charge-settings/delete", {
    data: { deliveryChargeSettingId: id }
  });
  return response.data;
};