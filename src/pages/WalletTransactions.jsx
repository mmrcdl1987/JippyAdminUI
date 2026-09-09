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
  const [notification, setNotification] = useState(null);

  // Filters
  const [customerIdInput, setCustomerIdInput] = useState("");
  const [activeCustomerId, setActiveCustomerId] = useState("");

  const [walletIdInput, setWalletIdInput] = useState("");
  const [activeWalletId, setActiveWalletId] = useState("");

  const [typeFilter, setTypeFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Track if initial fetch has been done
  const [hasFetched, setHasFetched] = useState(false);

  const clearNotification = () => setNotification(null);

  // Auto-fetch all transactions on mount
  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      setHasFetched(true);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setTransactions([]);
      setHasFetched(true);

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
    if (!customerIdInput.trim()) {
      alert("Please enter a Customer ID");
      return;
    }
    setActiveWalletId("");
    setActiveCustomerId(customerIdInput.trim());
    setWalletIdInput("");
    // Fetch after setting the active ID
    setTimeout(() => fetchTransactions(), 0);
  };

  const handleSearchWallet = (e) => {
    e.preventDefault();
    if (!walletIdInput.trim()) {
      alert("Please enter a Wallet ID");
      return;
    }
    setActiveCustomerId("");
    setActiveWalletId(walletIdInput.trim());
    setCustomerIdInput("");
    // Fetch after setting the active ID
    setTimeout(() => fetchTransactions(), 0);
  };

  const handleReset = () => {
    setCustomerIdInput("");
    setActiveCustomerId("");
    setWalletIdInput("");
    setActiveWalletId("");
    setTypeFilter("ALL");
    setSearchQuery("");
    clearNotification();
    // Fetch all transactions after reset
    setTimeout(() => fetchTransactions(), 0);
  };

  // Filtered List with correct field name
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Wallet ID Filter check if active
      if (activeWalletId && String(tx.walletId || "") !== String(activeWalletId)) {
        return false;
      }

      // Type Filter
      if (typeFilter !== "ALL") {
        const txType = (tx.transactionType || tx.pointsType || "").toUpperCase();
        if (txType !== typeFilter) {
          return false;
        }
      }

      // Keyword Search Query with correct field name
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const txIdMatch = String(tx.customerWalletTransactionsId || tx.transactionId || tx.id || "").toLowerCase().includes(q);
        const walletIdMatch = String(tx.walletId || "").toLowerCase().includes(q);
        const createdByMatch = String(tx.createdBy || "").toLowerCase().includes(q);
        const typeMatch = String(tx.transactionType || tx.pointsType || "").toLowerCase().includes(q);

        if (!txIdMatch && !walletIdMatch && !createdByMatch && !typeMatch) {
          return false;
        }
      }

      return true;
    });
  }, [transactions, activeWalletId, typeFilter, searchQuery]);

  // Statistics Summary
  const stats = useMemo(() => {
    return {
      totalCount: filteredTransactions.length
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
        <h2 className="tx-title">💰 Wallet Transactions</h2>
        <p className="tx-subtitle">View and monitor all customer wallet transaction logs</p>
      </div>

      {/* Summary Stat Card - Always shown */}
      <div className="tx-stats-grid">
        <div className="tx-stat-card">
          <div className="tx-stat-icon total">📜</div>
          <div>
            <div className="tx-stat-label">Total Transactions</div>
            <div className="tx-stat-val">{stats.totalCount}</div>
          </div>
        </div>
        {activeCustomerId && (
          <div className="tx-stat-card">
            <div className="tx-stat-icon customer">👤</div>
            <div>
              <div className="tx-stat-label">Customer ID</div>
              <div className="tx-stat-val" style={{ fontSize: "18px" }}>#{activeCustomerId}</div>
            </div>
          </div>
        )}
        {activeWalletId && (
          <div className="tx-stat-card">
            <div className="tx-stat-icon wallet">💳</div>
            <div>
              <div className="tx-stat-label">Wallet ID</div>
              <div className="tx-stat-val" style={{ fontSize: "18px" }}>#{activeWalletId}</div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Card */}
      <div className="tx-card">
        {/* Toolbar & Filters */}
        <div className="tx-toolbar">
          <div className="tx-search-group">
            {/* Search by Customer ID Form */}
            <form onSubmit={handleSearchCustomer} className="tx-search-form">
              <input
                type="number"
                placeholder="Search by Customer ID"
                value={customerIdInput}
                onChange={(e) => setCustomerIdInput(e.target.value)}
                className="tx-input tx-input-customer"
              />
              <button type="submit" className="tx-btn tx-btn-primary">
                Customer
              </button>
            </form>

            {/* Search by Wallet ID Form */}
            <form onSubmit={handleSearchWallet} className="tx-search-form">
              <input
                type="number"
                placeholder="Search by Wallet ID"
                value={walletIdInput}
                onChange={(e) => setWalletIdInput(e.target.value)}
                className="tx-input tx-input-wallet"
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

            {/* Keyword Search */}
            <input
              type="text"
              placeholder="🔍 Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="tx-input tx-input-search"
            />
          </div>

          <div className="tx-actions">
            {(activeCustomerId || activeWalletId || searchQuery || typeFilter !== "ALL") && (
              <button
                type="button"
                onClick={handleReset}
                className="tx-btn tx-btn-secondary"
              >
                ✕ Reset Filters
              </button>
            )}

            <button
              type="button"
              onClick={fetchTransactions}
              className="tx-btn tx-btn-secondary"
              disabled={loading}
            >
              {loading ? "⏳ Loading..." : "🔄 Refresh"}
            </button>
          </div>
        </div>

        {/* Active Filter Indicators */}
        <div className="tx-filter-indicators">
          {activeCustomerId && (
            <span className="tx-filter-indicator tx-filter-customer">
              👤 Customer: #{activeCustomerId}
              <button onClick={() => {
                setActiveCustomerId("");
                setCustomerIdInput("");
                setTimeout(() => fetchTransactions(), 0);
              }} className="tx-filter-close">✕</button>
            </span>
          )}
          {activeWalletId && (
            <span className="tx-filter-indicator tx-filter-wallet">
              💳 Wallet: #{activeWalletId}
              <button onClick={() => {
                setActiveWalletId("");
                setWalletIdInput("");
                setTimeout(() => fetchTransactions(), 0);
              }} className="tx-filter-close">✕</button>
            </span>
          )}
          {typeFilter !== "ALL" && (
            <span className="tx-filter-indicator tx-filter-type">
              📊 Type: {typeFilter}
            </span>
          )}
          {searchQuery && (
            <span className="tx-filter-indicator tx-filter-search">
              🔍 "{searchQuery}"
            </span>
          )}
        </div>

        {/* Notification Banner */}
        {notification && (
          <div className={`tx-toast-notification ${notification.type}`}>
            <div className="tx-toast-content">
              <span className="tx-toast-icon">
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
          <div className="tx-loading">
            <div className="tx-loader"></div>
            <p>Loading wallet transactions...</p>
          </div>
        ) : !hasFetched ? (
          <div className="tx-empty">
            <div className="tx-empty-icon">🔍</div>
            <p>Enter a Customer ID or Wallet ID to view transactions</p>
            <p className="tx-empty-subtext">or click Refresh to see all transactions</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="tx-empty">
            <div className="tx-empty-icon">📁</div>
            <p>No wallet transactions found.</p>
            {activeCustomerId && <p className="tx-empty-subtext">Try a different Customer ID or remove the filter</p>}
            {activeWalletId && <p className="tx-empty-subtext">Try a different Wallet ID or remove the filter</p>}
            {!activeCustomerId && !activeWalletId && <p className="tx-empty-subtext">Try refreshing or check your connection</p>}
          </div>
        ) : (
          <>
            <div className="tx-table-info">
              <span>Showing {filteredTransactions.length} transactions</span>
            </div>
            <div className="tx-table-wrapper">
              <table className="tx-table">
                <thead>
                  <tr>
                    <th>Transaction ID</th>
                    <th>Wallet ID</th>
                    <th>Type</th>
                    <th>Points</th>
                    <th>Amount</th>
                    <th>Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((tx, idx) => {
                    const rawType = (tx.transactionType || tx.pointsType || "").toString().trim();
                    const typeUpper = rawType.toUpperCase();
                    const isCredit = typeUpper === "CREDIT";
                    const isDebit = typeUpper === "DEBIT";
                    const transactionId = tx.customerWalletTransactionsId || tx.transactionId || tx.id || idx + 1;

                    return (
                      <tr key={transactionId}>
                        <td className="tx-id">
                          #{transactionId}
                        </td>
                        <td>#{tx.walletId}</td>
                        <td>
                          <span className={`tx-badge ${isCredit ? "tx-badge-credit" : isDebit ? "tx-badge-debit" : "tx-badge-neutral"}`}>
                            {isCredit && "▲ "}
                            {isDebit && "▼ "}
                            {rawType ? typeUpper : "-"}
                          </span>
                        </td>
                        <td className={isCredit ? "tx-pts-credit" : isDebit ? "tx-pts-debit" : ""}>
                          {isCredit ? `+${tx.points}` : isDebit ? `-${tx.points}` : tx.points}
                        </td>
                        <td className={isCredit ? "tx-pts-credit" : isDebit ? "tx-pts-debit" : ""}>
                          {isCredit ? `+${tx.amount}` : isDebit ? `-${tx.amount}` : tx.amount}
                        </td>
                        <td>{formatDate(tx.createdAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default WalletTransactions;