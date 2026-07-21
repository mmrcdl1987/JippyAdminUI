import { FM_API } from "./api";

// Create or Update Incentive
export const createOrUpdateIncentive = async (payload) => {
  return await FM_API.post(
    "/api/driver/CreateOrUpdateIncentives",
    payload
  );
};

// Driver Incentive History
export const getDriverIncentiveHistory = async (
  driverId,
  filter,
  page = 0,
  size = 10
) => {
  return await FM_API.get(
    `/api/driver/getDriverIncentiveHistory?driverId=${driverId}&filter=${filter}&page=${page}&size=${size}`
  );
};