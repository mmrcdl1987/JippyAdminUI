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