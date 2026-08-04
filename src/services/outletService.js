import { FM_API } from "./api";

export const getOutletsByMerchant = async (merchantId) => {
  try {
    const response = await FM_API.get(
      `/api/fm/outlets/getOutletsByMerchant`,
      {
        params: {
          merchantId,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching outlets:", error);
    throw error;
  }
};