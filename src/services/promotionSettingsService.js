import { FM_API } from "./api";

/* =========================================================
   GET ALL PROMOTION SETTINGS
   GET /api/fm/product-price-settings
   ========================================================= */

export const getPromotionSettings = async ({
  page = 0,
  size = 10,
} = {}) => {
  try {
    const response = await FM_API.get(
      "/api/fm/product-price-settings",
      {
        params: {
          page,
          size,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Error fetching promotion settings:",
      error
    );

    throw error;
  }
};


/* =========================================================
   GET PROMOTION SETTING BY ID
   GET /api/fm/product-price-settings/{id}
   ========================================================= */

export const getPromotionSettingById = async (id) => {
  try {
    const response = await FM_API.get(
      `/api/fm/product-price-settings/${id}`
    );

    return response.data;
  } catch (error) {
    console.error(
      `Error fetching promotion setting ${id}:`,
      error
    );

    throw error;
  }
};


/* =========================================================
   CREATE PROMOTION SETTING
   POST /api/fm/product-price-settings
   ========================================================= */

export const createPromotionSetting = async (
  promotionData
) => {
  try {
    const response = await FM_API.post(
      "/api/fm/product-price-settings",
      promotionData
    );

    return response.data;
  } catch (error) {
    console.error(
      "Error creating promotion setting:",
      error
    );

    throw error;
  }
};


/* =========================================================
   UPDATE PROMOTION SETTING
   PUT /api/fm/product-price-settings/{id}
   ========================================================= */

export const updatePromotionSetting = async (
  id,
  promotionData
) => {
  try {
    const response = await FM_API.put(
      `/api/fm/product-price-settings/${id}`,
      promotionData
    );

    return response.data;
  } catch (error) {
    console.error(
      `Error updating promotion setting ${id}:`,
      error
    );

    throw error;
  }
};


/* =========================================================
   DELETE PROMOTION SETTING
   DELETE /api/fm/product-price-settings/{id}
   
   KEPT AS EXISTING API.
   Your UI Delete button can remain commented out.
   ========================================================= */

export const deletePromotionSetting = async (id) => {
  try {
    const response = await FM_API.delete(
      `/api/fm/product-price-settings/${id}`
    );

    return response.data;
  } catch (error) {
    console.error(
      `Error deleting promotion setting ${id}:`,
      error
    );

    throw error;
  }
};


/* =========================================================
   UPDATE ACTIVE / INACTIVE STATUS
   PUT /api/fm/product-price-settings/{id}/status

   Query Parameter:
   - status

   Active:
   status=Y

   Inactive:
   status=N

   Example:
   PUT /api/fm/product-price-settings/10/status?status=Y

   Example:
   PUT /api/fm/product-price-settings/10/status?status=N
   ========================================================= */

export const updatePromotionSettingStatus = async (
  id,
  status
) => {
  try {
    const response = await FM_API.put(
      `/api/fm/product-price-settings/${id}/status`,
      null,
      {
        params: {
          status,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      `Error updating promotion setting status ${id}:`,
      error
    );

    throw error;
  }
};


/* =========================================================
   GET CAMPAIGN LOCATION / OUTLETS
   GET /api/fm/campaign/location

   Query Parameters:
   - stateId
   - cityId
   - areaId

   Example:
   /api/fm/campaign/location?stateId=1&cityId=1&areaId=1
   ========================================================= */

export const getCampaignLocations = async ({
  stateId,
  cityId,
  areaId,
}) => {
  try {
    const response = await FM_API.get(
      "/api/fm/campaign/location",
      {
        params: {
          stateId,
          cityId,
          areaId,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Error fetching campaign locations:",
      error
    );

    throw error;
  }
};