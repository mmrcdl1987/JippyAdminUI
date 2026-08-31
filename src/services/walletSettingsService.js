import { FM_API } from "./api";

/**
 * Fetch Wallet Settings with pagination
 * @param {number} page - Page number (default: 0)
 * @param {number} size - Number of items per page (default: 10)
 */
export const getWalletSettings = async (page = 0, size = 10) => {
  const response = await FM_API.get(`/api/co/wallet-settings/get?page=${page}&size=${size}`);
  return response.data;
};

/**
 * Save Wallet Settings
 * @param {Object} payload - The wallet settings data to save
 */
export const saveWalletSettings = async (payload) => {
  const response = await FM_API.post("/api/co/wallet-settings/save", payload);
  return response.data;
};