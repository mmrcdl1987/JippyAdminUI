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


/* =========================================================
   PROMOTION PRODUCTS HELPERS & STORAGE
   ========================================================= */

const PROMOTIONS_STORAGE_KEY = "jippymart_promotion_products";

export const INITIAL_PROMOTION_PRODUCTS = [
  {
    id: 1,
    type: "Restaurant",
    zone: "Ongole",
    restaurant: "Mawa's Kitchen",
    outletId: 101,
    product: "Roti(4) + Corn Palak Curry(300 ml)",
    productId: 501,
    specialPrice: 99,
    itemLimit: 1,
    extraKmCharge: 5,
    freeDeliveryKm: 0,
    startTime: "2026-09-11T11:51:00",
    endTime: "2026-09-30T23:51:00",
    paymentMode: "prepaid",
    isAvailable: true,
    isPromoAccepted: true,
  },
  {
    id: 2,
    type: "Restaurant",
    zone: "Ongole",
    restaurant: "Mawa's Kitchen",
    outletId: 101,
    product: "Roti(4) + Egg Kheema Curry(300 ml)",
    productId: 502,
    specialPrice: 99,
    itemLimit: 1,
    extraKmCharge: 5,
    freeDeliveryKm: 0,
    startTime: "2026-09-11T11:51:00",
    endTime: "2026-09-30T23:51:00",
    paymentMode: "prepaid",
    isAvailable: true,
    isPromoAccepted: true,
  },
  {
    id: 3,
    type: "Restaurant",
    zone: "Ongole",
    restaurant: "Mawa's Kitchen",
    outletId: 101,
    product: "Roti(4) + Egg Tomato Curry(300 ml)",
    productId: 503,
    specialPrice: 99,
    itemLimit: 1,
    extraKmCharge: 5,
    freeDeliveryKm: 0,
    startTime: "2026-09-11T11:51:00",
    endTime: "2026-09-30T23:51:00",
    paymentMode: "prepaid",
    isAvailable: true,
    isPromoAccepted: true,
  },
  {
    id: 4,
    type: "Restaurant",
    zone: "Ongole",
    restaurant: "Alif Kachi Dum Biryani",
    outletId: 102,
    product: "Chicken Mini Dum Biryani",
    productId: 504,
    specialPrice: 99,
    itemLimit: 2,
    extraKmCharge: 5,
    freeDeliveryKm: 0,
    startTime: "2026-09-11T10:15:00",
    endTime: "2026-09-30T23:16:00",
    paymentMode: "prepaid",
    isAvailable: true,
    isPromoAccepted: true,
  },
  {
    id: 5,
    type: "Restaurant",
    zone: "Ongole",
    restaurant: "R.K Foods",
    outletId: 103,
    product: "1 Pc Idly+1 Vada+1 Pongal+Pesara Dosa",
    productId: 505,
    specialPrice: 99,
    itemLimit: 2,
    extraKmCharge: 5,
    freeDeliveryKm: 0,
    startTime: "2026-09-03T20:45:00",
    endTime: "2026-09-30T20:45:00",
    paymentMode: "prepaid",
    isAvailable: true,
    isPromoAccepted: true,
  },
  {
    id: 6,
    type: "Restaurant",
    zone: "Ongole",
    restaurant: "R.K Foods",
    outletId: 103,
    product: "1 Pc Idly+1 Vada+1 Pongal+Plain Dosa",
    productId: 506,
    specialPrice: 99,
    itemLimit: 2,
    extraKmCharge: 5,
    freeDeliveryKm: 0,
    startTime: "2026-09-03T20:45:00",
    endTime: "2026-09-30T20:45:00",
    paymentMode: "prepaid",
    isAvailable: true,
    isPromoAccepted: true,
  },
  {
    id: 7,
    type: "Restaurant",
    zone: "Ongole",
    restaurant: "R.K Foods",
    outletId: 103,
    product: "1 Pc Idly+Gara+Chitti Pesara",
    productId: 507,
    specialPrice: 69,
    itemLimit: 2,
    extraKmCharge: 5,
    freeDeliveryKm: 0,
    startTime: "2026-09-03T20:45:00",
    endTime: "2026-09-30T20:45:00",
    paymentMode: "prepaid",
    isAvailable: true,
    isPromoAccepted: true,
  },
  {
    id: 8,
    type: "Restaurant",
    zone: "Ongole",
    restaurant: "R.K Foods",
    outletId: 103,
    product: "1 Pc Idly+Gara+Upma+Plain Dosa",
    productId: 508,
    specialPrice: 99,
    itemLimit: 2,
    extraKmCharge: 5,
    freeDeliveryKm: 0,
    startTime: "2026-09-03T20:45:00",
    endTime: "2026-09-30T20:45:00",
    paymentMode: "prepaid",
    isAvailable: true,
    isPromoAccepted: true,
  },
  {
    id: 9,
    type: "Restaurant",
    zone: "Ongole",
    restaurant: "R.K Foods",
    outletId: 103,
    product: "1 Pc Idly+Vada+Chitti Dosa",
    productId: 509,
    specialPrice: 69,
    itemLimit: 2,
    extraKmCharge: 5,
    freeDeliveryKm: 0,
    startTime: "2026-09-03T20:45:00",
    endTime: "2026-09-30T20:45:00",
    paymentMode: "prepaid",
    isAvailable: true,
    isPromoAccepted: true,
  },
  {
    id: 10,
    type: "Restaurant",
    zone: "Ongole",
    restaurant: "R.K Foods",
    outletId: 103,
    product: "1 Pc Idly+Vada+Small Dosa",
    productId: 510,
    specialPrice: 69,
    itemLimit: 2,
    extraKmCharge: 5,
    freeDeliveryKm: 0,
    startTime: "2026-09-03T20:45:00",
    endTime: "2026-09-30T20:45:00",
    paymentMode: "prepaid",
    isAvailable: true,
    isPromoAccepted: true,
  },
  {
    id: 11,
    type: "Restaurant",
    zone: "Ongole",
    restaurant: "R.K Foods",
    outletId: 103,
    product: "1 Pc Gara+Plain Dosa",
    productId: 511,
    specialPrice: 89,
    itemLimit: 2,
    extraKmCharge: 5,
    freeDeliveryKm: 0,
    startTime: "2026-09-03T20:45:00",
    endTime: "2026-09-30T20:45:00",
    paymentMode: "prepaid",
    isAvailable: true,
    isPromoAccepted: true,
  },
  {
    id: 12,
    type: "Restaurant",
    zone: "Ongole",
    restaurant: "R.K Foods",
    outletId: 103,
    product: "2 Idly+1 Pc Vada",
    productId: 512,
    specialPrice: 69,
    itemLimit: 2,
    extraKmCharge: 5,
    freeDeliveryKm: 0,
    startTime: "2026-09-03T20:45:00",
    endTime: "2026-09-30T20:45:00",
    paymentMode: "prepaid",
    isAvailable: true,
    isPromoAccepted: true,
  },
];

export const getStoredPromotionProducts = () => {
  try {
    const raw = localStorage.getItem(PROMOTIONS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(
        PROMOTIONS_STORAGE_KEY,
        JSON.stringify(INITIAL_PROMOTION_PRODUCTS)
      );
      return INITIAL_PROMOTION_PRODUCTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0
      ? parsed
      : INITIAL_PROMOTION_PRODUCTS;
  } catch {
    return INITIAL_PROMOTION_PRODUCTS;
  }
};

export const saveStoredPromotionProducts = (items) => {
  try {
    localStorage.setItem(PROMOTIONS_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error("Failed to save promotion products to localStorage:", e);
  }
};