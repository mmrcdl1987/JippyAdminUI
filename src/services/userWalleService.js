import { FM_API } from "./api";

// GET /api/co/wallet/{customerId}
// Returns CoCustomerWalletResponseDto: { walletId, customerId, customerName, balanceAmount, balancePoints }
export const getWalletByCustomerId = async (customerId) => {
  const response = await FM_API.get(`/api/co/wallet/${customerId}`);
  return response.data;
};

// PUT /api/co/wallet/{customerId}
// Accepts CoCustomerWallet payload: { balancePoints, balanceAmount, updatedBy }
export const updateWalletPoints = async (customerId, payload) => {
  const response = await FM_API.put(`/api/co/wallet/${customerId}`, payload);
  return response.data;
};