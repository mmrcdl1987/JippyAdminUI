import { FM_API } from "./api";

// Fetch all Wallet Settings
export const getWalletSettings = async () => {
  const response = await FM_API.get("/api/co/wallet-settings");
  return response.data;
};

// Save new Wallet Settings
export const saveWalletSettings = async (payload) => {
  return await FM_API.post("/api/co/wallet-settings/save", payload);
};