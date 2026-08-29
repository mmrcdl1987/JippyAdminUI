import { FM_API } from "./api";

export const getOutletsByMerchant = async (merchantId) => {
  try {
    const response = await FM_API.get(
      `/api/fm/outlets/getOutletsByMerchant`,
      {
        params: {
          merchantId,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching outlets:", error);
    throw error;
  }
};

export const getStates = async () => {
  return await FM_API.get("/api/fm/location/fetchStates");
};

export const getCitiesByState = async (stateId) => {
  return await FM_API.get(
    "/api/fm/location/fetchCityInState",
    {
      params: {
        stateId,
      },
    }
  );
};

export const getAreasByCity = async (cityId) => {
  return await FM_API.get(
    "/api/fm/location/fetchAreaInCity",
    {
      params: {
        cityId,
      },
    }
  );
};

export const updateOutlet = async (
  outletId,
  userType,
  payload
) => {
  const response = await FM_API.put(
    "/api/fm/outlets/editAndUpdateOutletProducts",
    payload,
    {
      params: {
        outletId,
        userType,
      },
    }
  );

  return response.data;
};

export const createOutlet = async (payload) => {
  const response = await FM_API.post(
    "/api/fm/outlets/createOutlet",
    payload
  );

  return response.data;
};