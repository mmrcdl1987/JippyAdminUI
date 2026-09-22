import API from "./api";

// =========================================================
// DRIVER ZONE CONTROLLER SERVICE
// Endpoints from Swagger driver-zone-controller:
// - GET    /api/driver/zones/{zoneId}
// - PUT    /api/driver/zones/{zoneId}
// - GET    /api/driver/zones
// - POST   /api/driver/zones
// - PATCH  /api/driver/zones/{zoneId}/status
// =========================================================

/**
 * 1. GET /api/driver/zones
 * Fetch all registered delivery zones
 */
export const getZones = async () => {
  try {
    const response = await API.get("/api/driver/zones");
    return response.data;
  } catch (error) {
    console.error("Error fetching zones:", error);
    throw error;
  }
};

/**
 * 2. GET /api/driver/zones/{zoneId}
 * Fetch specific delivery zone by ID
 */
export const getZoneById = async (zoneId) => {
  try {
    const response = await API.get(`/api/driver/zones/${zoneId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching zone ${zoneId}:`, error);
    throw error;
  }
};

/**
 * 3. POST /api/driver/zones
 * Create a new delivery zone
 */
export const createZone = async (payload) => {
  try {
    const response = await API.post("/api/driver/zones", payload);
    return response.data;
  } catch (error) {
    console.error("Error creating zone:", error);
    throw error;
  }
};

/**
 * 4. PUT /api/driver/zones/{zoneId}
 * Update an existing delivery zone
 */
export const updateZone = async (zoneId, payload) => {
  try {
    const response = await API.put(`/api/driver/zones/${zoneId}`, payload);
    return response.data;
  } catch (error) {
    console.error(`Error updating zone ${zoneId}:`, error);
    throw error;
  }
};

/**
 * 5. PATCH /api/driver/zones/{zoneId}/status?status=ACTIVE|INACTIVE
 * Toggle/update zone active status
 * Specification requires: status parameter and body with ACTIVE or INACTIVE
 */
export const updateZoneStatus = async (zoneId, status) => {
  try {
    const isTrue =
      status === true ||
      status === "ACTIVE" ||
      status === "active" ||
      status === "Y" ||
      status === "y";

    const normalizedStatus = isTrue ? "ACTIVE" : "INACTIVE";

    const response = await API.patch(
      `/api/driver/zones/${zoneId}/status`,
      {
        status: normalizedStatus,
        active: isTrue,
      },
      {
        params: {
          status: normalizedStatus,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating status for zone ${zoneId}:`, error);
    throw error;
  }
};

export default {
  getZones,
  getZoneById,
  createZone,
  updateZone,
  updateZoneStatus,
};
