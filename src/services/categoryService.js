import { FM_API } from "./api";

// ============================================================
// GET ALL / HOME CATEGORIES
// ============================================================
export const getHomeOrAllCategories = async (filter) => {
  const response = await FM_API.get(
    `/api/fm/getHomeOrAllCategories?filter=${encodeURIComponent(filter)}`
  );

  return response.data;
};

// ============================================================
// CREATE CATEGORY
// ============================================================
//
// Backend expects multipart/form-data.
//
// IMPORTANT:
// For CREATE, backend reads the image from:
// request.getCategoryImageUrl()
//
// Therefore the UI must append the actual File using:
// formData.append("categoryImageUrl", file)
//
// Do NOT manually set Content-Type.
// Axios/browser will automatically add:
// multipart/form-data; boundary=...
// ============================================================
export const createCategory = async (categoryData) => {
  const response = await FM_API.post(
    "/api/fm/createCategory",
    categoryData
  );

  return response.data;
};

// ============================================================
// UPDATE CATEGORY
// ============================================================
//
// Backend expects multipart/form-data.
//
// IMPORTANT:
// For UPDATE, backend reads the image from:
// request.getCategoryImage()
//
// Therefore the UI must append the actual File using:
// formData.append("categoryImage", file)
//
// Do NOT manually set Content-Type.
// ============================================================
export const updateCategory = async (categoryData) => {
  const response = await FM_API.put(
    "/api/fm/updateCategory",
    categoryData
  );

  return response.data;
};