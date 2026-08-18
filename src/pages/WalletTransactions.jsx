import { useState, useEffect, useMemo } from "react";
import {
  getAllWalletTransactions,
  getTransactionsByCustomerId,
  getTransactionsByWalletId
} from "../services/walletService";
import "../styles/WalletTransactions.css";

function WalletTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null); // { type: 'success' | 'error' | 'server-error', title: string, message: string }

  // Filters
  const [customerIdInput, setCustomerIdInput] = useState("");
  const [activeCustomerId, setActiveCustomerId] = useState("");

  const [walletIdInput, setWalletIdInput] = useState("");
  const [activeWalletId, setActiveWalletId] = useState("");

  const [typeFilter, setTypeFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const clearNotification = () => setNotification(null);

  useEffect(() => {
    fetchTransactions();
  }, [activeCustomerId, activeWalletId]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      clearNotification();

      let data = [];
      if (activeCustomerId && activeCustomerId.trim()) {
        data = await getTransactionsByCustomerId(activeCustomerId.trim());
      } else if (activeWalletId && activeWalletId.trim()) {
        data = await getTransactionsByWalletId(activeWalletId.trim());
      } else {
        data = await getAllWalletTransactions();
      }

      setTransactions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setTransactions([]);

      const is500 = err.response?.status === 500 || err.status === 500;
      if (is500) {
        setNotification({
          type: "server-error",
          title: "500 - Internal Server Error",
          message: "The backend server failed to retrieve wallet transactions. Please verify backend server state."
        });
      } else {
        setNotification({
          type: "error",
          title: "Fetch Error",
          message: err.response?.data?.message ||
                   err.response?.data?.errorMessage ||
                   (activeCustomerId
                     ? `Failed to load transactions for Customer ID #${activeCustomerId}`
                     : activeWalletId
                     ? `Failed to load transactions for Wallet ID #${activeWalletId}`
                     : "Failed to load wallet transactions")
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearchCustomer = (e) => {
    e.preventDefault();
    setActiveWalletId(""); // Reset active wallet ID when searching by customer ID
    setActiveCustomerId(customerIdInput.trim());
  };

  const handleSearchWallet = (e) => {
    e.preventDefault();
    setActiveCustomerId(""); // Reset active customer ID when searching by wallet ID
    setActiveWalletId(walletIdInput.trim());
  };

  const handleReset = () => {
    setCustomerIdInput("");
    setActiveCustomerId("");
    setWalletIdInput("");
    setActiveWalletId("");
    setTypeFilter("ALL");
    setSearchQuery("");
    clearNotification();
  };

  // Filtered List
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Wallet ID Filter check if active
      if (activeWalletId && String(tx.walletId || "") !== String(activeWalletId)) {
        return false;
      }

      // Type Filter
      if (typeFilter !== "ALL" && tx.pointsType?.toUpperCase() !== typeFilter) {
        return false;
      }

      // Keyword Search Query (transaction ID, wallet ID, createdBy)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const txIdMatch = String(tx.transactionId || tx.id || "").toLowerCase().includes(q);
        const walletIdMatch = String(tx.walletId || "").toLowerCase().includes(q);
        const createdByMatch = String(tx.createdBy || "").toLowerCase().includes(q);

        if (!txIdMatch && !walletIdMatch && !createdByMatch) {
          return false;
        }
      }

      return true;
    });
  }, [transactions, activeWalletId, typeFilter, searchQuery]);

  // Statistics Summary
  const stats = useMemo(() => {
    let creditSum = 0;
    let debitSum = 0;

    filteredTransactions.forEach((tx) => {
      const pts = Number(tx.points || 0);
      if (tx.pointsType?.toUpperCase() === "CREDIT") {
        creditSum += pts;
      } else if (tx.pointsType?.toUpperCase() === "DEBIT") {
        debitSum += pts;
      }
    });

    return {
      totalCount: filteredTransactions.length,
      totalCredits: creditSum,
      totalDebits: debitSum
    };
  }, [filteredTransactions]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch (_) {
      return dateStr;
    }
  };

  return (
    <div className="tx-container">
      <div className="tx-header">
        <h2 className="tx-title">Wallet Transactions</h2>
        <p className="tx-subtitle">View and monitor all customer wallet transaction logs</p>
      </div>

      {/* Summary Stat Cards */}
      <div className="tx-stats-grid">
        <div className="tx-stat-card">
          <div className="tx-stat-icon total">📜</div>
          <div>
            <div className="tx-stat-label">Total Transactions</div>
            <div className="tx-stat-val">{stats.totalCount}</div>
          </div>
        </div>

        <div className="tx-stat-card">
          <div className="tx-stat-icon credit">➕</div>
          <div>
            <div className="tx-stat-label">Total Points Credited</div>
            <div className="tx-stat-val" style={{ color: "#16a34a" }}>
              +{stats.totalCredits}
            </div>
          </div>
        </div>

        <div className="tx-stat-card">
          <div className="tx-stat-icon debit">➖</div>
          <div>
            <div className="tx-stat-label">Total Points Debited</div>
            <div className="tx-stat-val" style={{ color: "#dc2626" }}>
              -{stats.totalDebits}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="tx-card">
        {/* Toolbar & Filters */}
        <div className="tx-toolbar">
          <div className="tx-search-group">
            {/* Search by Customer ID Form */}
            <form onSubmit={handleSearchCustomer} style={{ display: "flex", gap: "8px" }}>
              <input
                type="number"
                placeholder="Search Customer ID"
                value={customerIdInput}
                onChange={(e) => setCustomerIdInput(e.target.value)}
                className="tx-input"
                style={{ width: "170px" }}
              />
              <button type="submit" className="tx-btn tx-btn-primary">
                Customer
              </button>
            </form>

            {/* Search by Wallet ID Form */}
            <form onSubmit={handleSearchWallet} style={{ display: "flex", gap: "8px" }}>
              <input
                type="number"
                placeholder="Search Wallet ID"
                value={walletIdInput}
                onChange={(e) => setWalletIdInput(e.target.value)}
                className="tx-input"
                style={{ width: "160px" }}
              />
              <button type="submit" className="tx-btn tx-btn-primary">
                Wallet
              </button>
            </form>


            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="tx-select"
            >
              <option value="ALL">All Types</option>
              <option value="CREDIT">Credit Only</option>
              <option value="DEBIT">Debit Only</option>
            </select>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            {(activeCustomerId || activeWalletId || searchQuery || typeFilter !== "ALL" || customerIdInput || walletIdInput) && (
              <button
                type="button"
                onClick={handleReset}
                className="tx-btn tx-btn-secondary"
              >
                Reset Filters
              </button>
            )}

            <button
              type="button"
              onClick={fetchTransactions}
              className="tx-btn tx-btn-secondary"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Active Filter Indicators */}
        {activeCustomerId && (
          <div style={{ marginBottom: "16px", fontSize: "14px", color: "#2563eb", fontWeight: "600" }}>
            Filter: Customer ID #{activeCustomerId}
          </div>
        )}
        {activeWalletId && (
          <div style={{ marginBottom: "16px", fontSize: "14px", color: "#ff6b35", fontWeight: "600" }}>
            Filter: Wallet ID #{activeWalletId}
          </div>
        )}

        {/* Notification Banner */}
        {notification && (
          <div className={`tx-toast-notification ${notification.type}`}>
            <div className="tx-toast-content">
              <span style={{ fontSize: "20px" }}>
                {notification.type === "success" && "✅"}
                {notification.type === "error" && "❌"}
                {notification.type === "server-error" && "⚠️"}
              </span>
              <div>
                <div className="tx-toast-title">{notification.title}</div>
                <div className="tx-toast-desc">{notification.message}</div>
              </div>
            </div>
            <button
              className="tx-toast-close"
              onClick={clearNotification}
              title="Close Notification"
            >
              ✕
            </button>
          </div>
        )}

        {/* Table View */}
        {loading ? (
          <div className="tx-loading">Loading wallet transactions...</div>
        ) : filteredTransactions.length === 0 ? (
          <div className="tx-empty">
            <div className="tx-empty-icon">📁</div>
            <p>No wallet transactions found.</p>
          </div>
        ) : (
          <div className="tx-table-wrapper">
            <table className="tx-table">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Wallet ID</th>
                  <th>Type</th>
                  <th>Points</th>
                  <th>Created By</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((tx, idx) => {
                  const isCredit = tx.pointsType?.toUpperCase() === "CREDIT";
                  return (
                    <tr key={tx.transactionId || tx.id || idx}>
                      <td style={{ fontWeight: "600" }}>
                        #{tx.transactionId || tx.id || idx + 1}
                      </td>
                      <td>#{tx.walletId}</td>
                      <td>
                        <span className={`tx-badge ${isCredit ? "tx-badge-credit" : "tx-badge-debit"}`}>
                          {isCredit ? "▲ CREDIT" : "▼ DEBIT"}
                        </span>
                      </td>
                      <td className={isCredit ? "tx-pts-credit" : "tx-pts-debit"}>
                        {isCredit ? `+${tx.points}` : `-${tx.points}`}
                      </td>
                      <td>{tx.createdBy || "System"}</td>
                      <td>{formatDate(tx.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default WalletTransactions;