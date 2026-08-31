import { FM_API } from "./api";

/**
 * Fetch all available areas.
 * GET /api/fm/areas
 */
export const getAllAreas = async () => {
  const response = await FM_API.get("/api/fm/areas");
  return response.data;
};

/**
 * Fetch all States.
 * GET /api/fm/location/fetchStates
 */
export const getStates = async () => {
  const response = await FM_API.get("/api/fm/location/fetchStates");
  return response.data;
};

/**
 * Fetch Cities by State ID.
 * GET /api/fm/location/fetchCityInState?stateId={stateId}
 */
export const getCitiesByState = async (stateId) => {
  const response = await FM_API.get("/api/fm/location/fetchCityInState", {
    params: { stateId },
  });
  return response.data;
};

/**
 * Fetch Areas by City ID.
 * GET /api/fm/location/fetchAreaInCity?cityId={cityId}
 */
export const getAreasByCity = async (cityId) => {
  const response = await FM_API.get("/api/fm/location/fetchAreaInCity", {
    params: { cityId },
  });
  return response.data;
};

/**
 * Assign one Manager to one or more Areas.
 * POST /api/fm/manager-areas/assignManagerAreas
 * Payload: { userId: number, areaIds: number[] }
 */
export const assignManagerAreas = async (userId, areaIds) => {
  const response = await FM_API.post("/api/fm/manager-areas/assignManagerAreas", {
    userId: Number(userId),
    areaIds: areaIds.map(Number),
  });
  return response.data;
};

/**
 * Fetches all Areas assigned to a Manager.
 * GET /api/fm/manager-areas/{userId}
 */
export const getAssignedManagerAreas = async (userId) => {
  try {
    const response = await FM_API.get(`/api/fm/manager-areas/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching assigned manager areas for user ${userId}:`, error);
    return null;
  }
};

/**
 * Fetches all Areas assigned to a Manager by username.
 * GET /api/fm/manager-areas/by-username/{username}
 */
export const getAssignedManagerAreasByUsername = async (username) => {
  try {
    const response = await FM_API.get(`/api/fm/manager-areas/by-username/${username}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching assigned manager areas for username ${username}:`, error);
    return null;
  }
};

/**
 * Replaces all Areas assigned to a Manager.
 * PUT /api/fm/manager-areas/updateManagerAreas
 * Payload: { userId: number, areaIds: number[] }
 */
export const updateManagerAreas = async (userId, areaIds) => {
  const response = await FM_API.put("/api/fm/manager-areas/updateManagerAreas", {
    userId: Number(userId),
    areaIds: areaIds.map(Number),
  });
  return response.data;
};
