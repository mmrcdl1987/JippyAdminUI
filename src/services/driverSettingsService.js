import { FM_API } from "./api";

// Create Driver Settings
export const createDriverSettings = async (payload) => {
  return await FM_API.post(
    "/api/driver",
    payload
  );
};