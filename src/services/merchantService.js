import { FM_API } from "./api";

// Get All Merchants
export const getAllMerchants = async () => {
  console.log("Base URL:", FM_API.defaults.baseURL);

  const response = await FM_API.get("/api/fm/merchants");

  return response.data;
};

// Bulk Upload Merchants
export const uploadMerchants = async (file) => {

  const formData = new FormData();

  formData.append("file", file);

  const response = await FM_API.post(
    // "/api/fm/merchants/upload",
    "/api/fm/outlets/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};