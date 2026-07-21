import { FM_API } from "./api";

// Save Wallet Settings
export const saveWalletSettings = async (payload) => {

  return await FM_API.post(
    "/api/co/wallet-settings/save",
    payload
  );

};