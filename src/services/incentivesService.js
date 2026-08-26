import { FM_API } from "./api";

// Create or Update Incentive
export const createOrUpdateIncentive = async (payload) => {
  return await FM_API.post(
    "/api/driver/CreateOrUpdateIncentives",
    payload
  );
};

// Driver Incentive Settings Paged (Matches your table data endpoint)
export const getDriverIncentiveSettingsPaged = async (page = 0, size = 20) => {
  return await FM_API.get(
    `/api/driver/incentive-settings?page=${page}&size=${size}`
  );
};

// Driver Incentive History (with search/filters)
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

// Driver Incentive History Paged (for loading all history without a specific driver ID)
export const getDriverIncentiveHistoryPaged = async (page = 0, size = 20) => {
  return await FM_API.get(
    `/api/driver/incentive-settings/history/page?page=${page}&size=${size}`
  );
};

// Get Drivers Incentives For Settlements (Settings / List view)
export const getDriversIncentivesForSettlements = async (filter = "currentMonth") => {
  return await FM_API.get(
    `/api/driver/getDriversIncentivesForSettlements?filter=${filter}`
  );
};