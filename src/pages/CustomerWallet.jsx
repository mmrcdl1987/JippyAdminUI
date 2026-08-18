import { useState } from "react";
import {
  getWalletByCustomerId,
  updateWalletPoints
} from "../services/userWalleService";
import "../styles/CustomerWallet.css";

const CustomerWallet = () => {
  const [wallet, setWallet] = useState(null);
  const [customerId, setCustomerId] = useState("");

  const [points, setPoints] = useState("");
  const [pointsType, setPointsType] = useState("CREDIT");
  const [balanceAmount, setBalanceAmount] = useState("");

  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [notification, setNotification] = useState(null); // { type: 'success' | 'error' | 'server-error', title: string, message: string }

  const clearNotification = () => setNotification(null);

  const handleFetchWallet = async (e) => {
    if (e) e.preventDefault();
    clearNotification();

    if (!customerId || !customerId.trim()) {
      setNotification({
        type: "error",
        title: "Validation Error",
        message: "Please enter a valid Customer ID"
      });
      return;
    }

    try {
      setLoading(true);
      const data = await getWalletByCustomerId(customerId.trim());
      setWallet(data);
      setBalanceAmount(data.balanceAmount ?? "");
    } catch (err) {
      setWallet(null);
      setBalanceAmount("");

      const is500 = err.response?.status === 500 || err.status === 500;
      if (is500) {
        setNotification({
          type: "server-error",
          title: "500 - Internal Server Error",
          message: "The backend server encountered an internal error fetching wallet for Customer ID #" + customerId
        });
      } else {
        setNotification({
          type: "error",
          title: "Wallet Not Found",
          message: err.response?.data?.message || err.response?.data?.errorMessage || "Wallet not found for customer ID #" + customerId
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    clearNotification();

    if (!customerId || !customerId.trim()) {
      setNotification({
        type: "error",
        title: "Missing Customer ID",
        message: "Please fetch a wallet first by entering Customer ID"
      });
      return;
    }

    if (!wallet) {
      setNotification({
        type: "error",
        title: "No Wallet Loaded",
        message: "Please fetch customer wallet details first"
      });
      return;
    }

    const pointsNum = points !== "" ? Number(points) : 0;
    const amountNum = balanceAmount !== "" ? Number(balanceAmount) : Number(wallet.balanceAmount || 0);

    if (points === "" && balanceAmount === "") {
      setNotification({
        type: "error",
        title: "Validation Error",
        message: "Please enter points or wallet balance to update"
      });
      return;
    }

    try {
      setUpdating(true);

      // Calculate new total points according to transaction type (CREDIT / DEBIT)
      const currentPoints = Number(wallet.balancePoints || 0);
      
      let newPoints = currentPoints;
      if (points !== "" && pointsNum > 0) {
        if (pointsType === "CREDIT") {
          newPoints = currentPoints + pointsNum;
        } else {
          newPoints = Math.max(0, currentPoints - pointsNum);
        }
      }

      // Backend updateByCustomerId expects CoCustomerWallet payload: { balancePoints, balanceAmount, updatedBy }
      const payload = {
        balancePoints: newPoints,
        balanceAmount: amountNum,
        updatedBy: 2
      };

      await updateWalletPoints(customerId.trim(), payload);

      // Re-fetch updated wallet response DTO to get complete customer details
      const refreshedWallet = await getWalletByCustomerId(customerId.trim());
      setWallet(refreshedWallet);
      setBalanceAmount(refreshedWallet.balanceAmount ?? "");

      setPoints("");
      setNotification({
        type: "success",
        title: "Success",
        message: "Wallet updated successfully! (New Balance: " + newPoints + " points, ₹" + amountNum + ")"
      });
    } catch (err) {
      const is500 = err.response?.status === 500 || err.status === 500;
      if (is500) {
        setNotification({
          type: "server-error",
          title: "500 - Internal Server Error",
          message: "The backend server failed to process the wallet update. Please verify server logs."
        });
      } else {
        setNotification({
          type: "error",
          title: "Update Failed",
          message: err.response?.data?.message || err.response?.data?.errorMessage || "Failed to update wallet details"
        });
      }
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="cust-wallet-wrapper">
      <h2 className="cust-wallet-title">Customer Wallet Management</h2>

      <div className="cust-wallet-card">
        <div className="cust-card-header">CUSTOMER WALLET</div>

        {/* Search Customer ID Form */}
        <form onSubmit={handleFetchWallet} className="cust-search-box">
          <div className="cust-form-group">
            <label className="cust-form-label">Customer ID</label>
            <input
              type="number"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              placeholder="Enter Customer ID"
              className="cust-form-input"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="cust-btn-search"
          >
            {loading ? "Fetching..." : "Fetch Wallet"}
          </button>
        </form>

        {/* In-Page Notification Banner (No Popup Alert) */}
        {notification && (
          <div className={`cust-toast-notification ${notification.type}`}>
            <div className="cust-toast-content">
              <span style={{ fontSize: "20px" }}>
                {notification.type === "success" && "✅"}
                {notification.type === "error" && "❌"}
                {notification.type === "server-error" && "⚠️"}
              </span>
              <div>
                <div className="cust-toast-title">{notification.title}</div>
                <div className="cust-toast-desc">{notification.message}</div>
              </div>
            </div>
            <button
              className="cust-toast-close"
              onClick={clearNotification}
              title="Close Notification"
            >
              ✕
            </button>
          </div>
        )}

        {/* Wallet Details View */}
        {wallet && (
          <div className="cust-info-box">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p className="cust-info-label">Customer Name</p>
                <p style={{ fontSize: "16px", fontWeight: "600", color: "#1e293b", margin: 0 }}>
                  {wallet.customerName || `Customer #${wallet.customerId || customerId}`}
                </p>
              </div>
              <div style={{ fontSize: "12px", background: "#e2e8f0", padding: "4px 8px", borderRadius: "4px" }}>
                Wallet ID: {wallet.walletId}
              </div>
            </div>

            <div className="cust-info-grid">
              <div className="cust-info-card">
                <p className="cust-info-label">Available Points</p>
                <p className="cust-info-val-pts">
                  {wallet.balancePoints ?? 0}
                </p>
              </div>

              <div className="cust-info-card">
                <p className="cust-info-label">Wallet Balance</p>
                <p className="cust-info-val-amt">
                  ₹{wallet.balanceAmount ?? 0}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Wallet Update Form */}
        <form onSubmit={handleUpdate} style={{ marginTop: "20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "16px" }}>
            <div className="cust-form-group">
              <label className="cust-form-label">Transaction Type</label>
              <select
                value={pointsType}
                onChange={(e) => setPointsType(e.target.value)}
                className="cust-form-select"
              >
                <option value="CREDIT">Credit (+)</option>
                <option value="DEBIT">Debit (-)</option>
              </select>
            </div>

            <div className="cust-form-group">
              <label className="cust-form-label">Points</label>
              <input
                type="number"
                min="0"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                placeholder="Enter points count"
                className="cust-form-input"
              />
            </div>

            <div className="cust-form-group">
              <label className="cust-form-label">Wallet Balance (₹)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={balanceAmount}
                onChange={(e) => setBalanceAmount(e.target.value)}
                placeholder="Enter wallet balance"
                className="cust-form-input"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={updating || loading || !wallet}
            className="cust-submit-btn"
          >
            {updating ? "Processing Update..." : "Update Wallet"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CustomerWallet;