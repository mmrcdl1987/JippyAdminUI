import api from "./api";

/* =========================================================
   GET DRIVER DETAILS
   ========================================================= */

export const getDriverDetails = async (driverId) => {
  const response = await api.get(
    `/api/driver/getDriverDetails?driverId=${driverId}`
  );

  return response.data;
};


/* =========================================================
   GET DRIVER BY ID
   ========================================================= */

export const getDriverById = async (driverId) => {
  const response = await api.get(
    `/api/driver/getDriverById/${driverId}`
  );

  return response.data;
};


/* =========================================================
   GET TOTAL DRIVER EARNINGS
   ========================================================= */

export const getTotalDriverEarnings = async (driverId) => {
  const response = await api.get(
    `/api/driver/fetchTotalEarnings?driverId=${driverId}`
  );

  return response.data;
};


/* =========================================================
   GET DRIVER INCENTIVE HISTORY
   =========================================================
   
   API:
   GET /api/driver/getDriverIncentiveHistory

   Parameters:
   driverId
   filter
   page
   size
   ========================================================= */

export const getDriverIncentiveHistory = async (
  driverId,
  filter = "ALL",
  page = 0,
  size = 10
) => {
  const response = await api.get(
    "/api/driver/getDriverIncentiveHistory",
    {
      params: {
        driverId,
        filter,
        page,
        size,
      },
    }
  );

  return response.data;
};


/* =========================================================
   GET SEPARATE INCENTIVE SETTINGS HISTORY
   =========================================================

   API:
   GET /api/driver/incentive-settings/history/page

   Parameters:
   driverId
   filter
   startDate
   endDate
   page
   size

   Example:
   /api/driver/incentive-settings/history/page
   ?driverId=1
   &filter=ALL
   &page=0
   &size=20
   ========================================================= */

export const getDriverIncentiveHistoryPage = async ({
  driverId,
  filter = "ALL",
  startDate = "",
  endDate = "",
  page = 0,
  size = 20,
} = {}) => {
  const params = {
    driverId,
    filter,
    page,
    size,
  };

  if (startDate) {
    params.startDate = startDate;
  }

  if (endDate) {
    params.endDate = endDate;
  }

  const response = await api.get(
    "/api/driver/incentive-settings/history/page",
    {
      params,
    }
  );

  return response.data;
};


/* =========================================================
   UPDATE DRIVER
   ========================================================= */

export const updateDriverDetails = async (
  driverId,
  driverData
) => {
  const response = await api.put(
    `/api/driver/updateDriverDetails?driverId=${driverId}`,
    driverData
  );

  return response.data;
};


/* =========================================================
   GET ALL DRIVERS
   ========================================================= */

export const getAllDrivers = async () => {
  const response = await api.get(
    "/api/driver/getAllDrivers"
  );

  return response.data;
};


/* =========================================================
   APPROVE DRIVER
   ========================================================= */

export const approveDriver = async (driverId) => {
  const response = await api.put(
    `/api/driver/approve/${driverId}`
  );

  return response.data;
};


/* =========================================================
   PROFILE PICTURE
   ========================================================= */

export const saveOrUpdateProfilePic = async ({
  userId,
  profilePicUrl = "",
  profilePicFile,
  userType = "DRIVER",
}) => {
  const formData = new FormData();

  formData.append("userId", userId);
  formData.append("profilePicUrl", profilePicUrl);
  formData.append("profilePicFile", profilePicFile);
  formData.append("userType", userType);

  const response = await api.post(
    "/api/driver/saveOrUpdateProfilePic",
    formData
  );

  return response.data;
};