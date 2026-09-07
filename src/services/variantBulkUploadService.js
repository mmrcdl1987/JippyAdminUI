import { FM_API } from "./api";

// ============================================================
// Bulk Upload Variants for a specific Outlet
// POST /api/fm/products/bulk-upload-variants
// ============================================================
export const bulkUploadVariants = async (outletId, file) => {
  try {
    if (!file) {
      throw new Error("No file selected.");
    }

    if (!outletId) {
      throw new Error("Outlet ID is required.");
    }

    const formData = new FormData();
    formData.append("file", file);

    console.log(
      "[VARIANT-BULK] Calling API:",
      "/api/fm/products/bulk-upload-variants"
    );
    console.log("[VARIANT-BULK] Outlet ID:", outletId);
    console.log("[VARIANT-BULK] File:", file.name);
    console.log("[VARIANT-BULK] Size:", file.size, "bytes");

    const response = await FM_API.post(
      "/api/fm/products/bulk-upload-variants",
      formData,
      {
        params: { outletId },
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log("[VARIANT-BULK] API Response:", response.data);

    return response.data;
  } catch (error) {
    console.error(
      "[VARIANT-BULK] Upload Error:",
      error?.response?.data || error
    );

    throw error;
  }
};
