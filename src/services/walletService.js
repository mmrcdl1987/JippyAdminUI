import { FM_API } from "./api";

// GET /api/co/wallet/transactions - Fetch all transactions
export const getAllWalletTransactions = async () => {
  const response = await FM_API.get("/api/co/wallet/transactions");
  return response.data;
};

// GET /api/co/wallet/transactions/{customerId} - Fetch transactions for specific customer ID
export const getTransactionsByCustomerId = async (customerId) => {
  const response = await FM_API.get(`/api/co/wallet/transactions/${customerId}`);
  return response.data;
};

// GET /api/co/wallet/transactions/wallet/{walletId} - Fetch transactions for specific wallet ID (with fallback)
export const getTransactionsByWalletId = async (walletId) => {
  try {
    const response = await FM_API.get(`/api/co/wallet/transactions/wallet/${walletId}`);
    return response.data;
  } catch (_) {
    // Fallback: fetch all and filter by walletId
    const response = await FM_API.get("/api/co/wallet/transactions");
    const all = Array.isArray(response.data) ? response.data : [];
    return all.filter((tx) => String(tx.walletId) === String(walletId));
  }
};

// Backwards compatibility alias
export const getWalletTransactions = getAllWalletTransactions;