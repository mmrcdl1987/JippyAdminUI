import { FM_API } from "./api";

// --- Wallet CRUD Operations ---

// GET /api/co/wallet/{customerId} - Get wallet by customer ID
export const getWalletByCustomerId = async (customerId) => {
  try {
    const response = await FM_API.get(`/api/co/wallet/${customerId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching wallet:", error);
    throw error;
  }
};

// POST /api/co/wallet/add-money - Add money to wallet
export const addMoney = async (payload) => {
  try {
    const response = await FM_API.post("/api/co/wallet/add-money", payload);
    return response.data;
  } catch (error) {
    console.error("Error adding money:", error);
    throw error;
  }
};

// POST /api/co/wallet/deduct-money - Deduct money from wallet
export const deductMoney = async (payload) => {
  try {
    const response = await FM_API.post("/api/co/wallet/deduct-money", payload);
    return response.data;
  } catch (error) {
    console.error("Error deducting money:", error);
    throw error;
  }
};

// POST /api/co/wallet/add-points - Add points to wallet
export const addPoints = async (payload) => {
  try {
    const response = await FM_API.post("/api/co/wallet/add-points", payload);
    return response.data;
  } catch (error) {
    console.error("Error adding points:", error);
    throw error;
  }
};

// POST /api/co/wallet/deduct-points - Deduct points from wallet
export const deductPoints = async (payload) => {
  try {
    const response = await FM_API.post("/api/co/wallet/deduct-points", payload);
    return response.data;
  } catch (error) {
    console.error("Error deducting points:", error);
    throw error;
  }
};

// --- Transaction History Operations ---

// GET /api/co/wallet/transactions - Fetch all transactions
export const getAllWalletTransactions = async () => {
  try {
    const response = await FM_API.get("/api/co/wallet/transactions");
    return response.data;
  } catch (error) {
    console.error("Error fetching all transactions:", error);
    throw error;
  }
};

// GET /api/co/wallet/transactions/{customerId} - Fetch transactions for specific customer ID
export const getTransactionsByCustomerId = async (customerId) => {
  try {
    const response = await FM_API.get(`/api/co/wallet/transactions/${customerId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching customer transactions:", error);
    throw error;
  }
};

// GET /api/co/wallet/transactions/wallet/{walletId} - Fetch transactions for specific wallet ID (with fallback)
export const getTransactionsByWalletId = async (walletId) => {
  try {
    const response = await FM_API.get(`/api/co/wallet/transactions/wallet/${walletId}`);
    return response.data;
  } catch (error) {
    console.warn("Error fetching transactions by wallet ID, using fallback:", error);
    // Fallback: fetch all and filter by walletId
    try {
      const response = await FM_API.get("/api/co/wallet/transactions");
      const all = Array.isArray(response.data) ? response.data : [];
      return all.filter((tx) => String(tx.walletId) === String(walletId));
    } catch (fallbackError) {
      console.error("Fallback error fetching transactions:", fallbackError);
      return [];
    }
  }
};

// Backwards compatibility alias
export const getWalletTransactions = getAllWalletTransactions;

// Default export for convenience
const walletService = {
  getWalletByCustomerId,
  addMoney,
  deductMoney,
  addPoints,
  deductPoints,
  getAllWalletTransactions,
  getTransactionsByCustomerId,
  getTransactionsByWalletId,
  getWalletTransactions,
};

export default walletService;