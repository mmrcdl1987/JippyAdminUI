import { FM_API } from "./api";

// ======== get all categories =========
export const getHomeOrAllCategories = async (filter) => {
  return await FM_API.get(
    `/api/fm/getHomeOrAllCategories?filter=${filter}`
  );
};

// ======== create category =======
export const createCategory = async (categoryData) => {
  const response = await FM_API.post(
    "/api/fm/createCategory",
    categoryData,
    {
      headers: {
        // Let browser/Axios set the multipart boundary automatically if it's FormData
        ...(categoryData instanceof FormData ? { "Content-Type": "multipart/form-data" } : {}),
      },
    }
  );
  return response.data;
};

// ======== update category =======
export const updateCategory = async (categoryData) => {
  const response = await FM_API.put(
    "/api/fm/updateCategory",
    categoryData,
    {
      headers: {
        ...(categoryData instanceof FormData ? { "Content-Type": "multipart/form-data" } : {}),
      },
    }
  );
  return response.data;
};