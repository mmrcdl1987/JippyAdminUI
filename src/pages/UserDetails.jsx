import React, { useState, useEffect } from "react";
import {
  FiArrowLeft,
  FiShoppingBag,
  FiCreditCard,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiCopy,
  FiCheck,
  FiX,
  FiRefreshCw,
  FiUser,
  FiAward,
  FiFileText,
  FiPlus,
  FiCheckCircle,
  FiAlertCircle
} from "react-icons/fi";
import { FaCoins, FaFire, FaWallet, FaStore } from "react-icons/fa";
import { getCustomerById } from "../services/customerService";
import { getWalletByCustomerId, updateWalletPoints } from "../services/userWalleService";
import { getTransactionsByCustomerId, addPoints } from "../services/walletService";
import "../styles/UserDetails.css";

function UserDetails({ customerId, initialCustomer, onBack, setActivePage, initialTab = "overview" }) {
  const [activeTab, setActiveTab] = useState(initialTab || "overview"); // 'overview' | 'orders' | 'wallet'
  const [customer, setCustomer] = useState(initialCustomer || null);
  const [wallet, setWallet] = useState(null);
  const [orders, setOrders] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  // Add Wallet Coins Modal State
  const [showAddCoinsModal, setShowAddCoinsModal] = useState(false);
  const [coinsToAdd, setCoinsToAdd] = useState("");
  const [coinsRemark, setCoinsRemark] = useState("");
  const [addingCoins, setAddingCoins] = useState(false);
  const [modalFeedback, setModalFeedback] = useState(null);

  const effectiveId = customerId || initialCustomer?.customerId || initialCustomer?.id;

  useEffect(() => {
    if (effectiveId) {
      loadCustomerProfile(effectiveId);
      loadWalletData(effectiveId);
      if (initialTab === "wallet") {
        loadTransactions(effectiveId);
      }
    }
  }, [effectiveId, initialTab]);

  // Load customer profile from /api/co/customers/{customerId}
  const loadCustomerProfile = async (id) => {
    try {
      setLoading(true);
      const res = await getCustomerById(id);
      const detail = res?.data || res;
      if (detail && typeof detail === "object") {
        setCustomer((prev) => ({
          ...(prev || {}),
          ...detail,
        }));
      }
    } catch (err) {
      console.error(`Error loading customer #${id} from /api/co/customers/${id}:`, err);
    } finally {
      setLoading(false);
    }
  };

  // Load customer wallet from /api/co/wallet/{customerId}
  const loadWalletData = async (id) => {
    try {
      const walletData = await getWalletByCustomerId(id);
      setWallet(walletData);
    } catch (err) {
      console.warn("Wallet not found or error loading:", err);
      setWallet(null);
    }
  };

  // Load wallet transactions
  const loadTransactions = async (id) => {
    try {
      const txData = await getTransactionsByCustomerId(id);
      const list = Array.isArray(txData) ? txData : txData?.data || [];
      setTransactions(list);
    } catch (err) {
      console.warn("Error loading transactions:", err);
      setTransactions([]);
    }
  };

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    if (tab === "wallet" && effectiveId) {
      loadTransactions(effectiveId);
    }
  };

  const handleCopyText = (text, fieldName) => {
    if (!text || text === "—") return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 1800);
  };

  // Add Coins Submission
  const handleAddCoinsSubmit = async (e) => {
    e.preventDefault();
    setModalFeedback(null);

    const coinsNum = Number(coinsToAdd);
    if (!coinsToAdd || isNaN(coinsNum) || coinsNum <= 0) {
      setModalFeedback({
        type: "error",
        message: "Please enter a valid coin amount greater than 0.",
      });
      return;
    }

    try {
      setAddingCoins(true);
      const currentPoints = Number(wallet?.balancePoints || 0);
      const currentAmount = Number(wallet?.balanceAmount || 0);
      const newPoints = currentPoints + coinsNum;

      const payload = {
        balancePoints: newPoints,
        balanceAmount: currentAmount,
        updatedBy: 1,
      };

      await updateWalletPoints(effectiveId, payload);

      try {
        await addPoints({
          customerId: Number(effectiveId),
          points: coinsNum,
          description: coinsRemark || "Admin Credited Wallet Coins",
        });
      } catch (logErr) {
        console.log("Point transaction logged:", logErr);
      }

      setModalFeedback({
        type: "success",
        message: `Successfully credited ${coinsNum} coins!`,
      });

      await loadWalletData(effectiveId);
      if (activeTab === "wallet") {
        await loadTransactions(effectiveId);
      }

      setTimeout(() => {
        setShowAddCoinsModal(false);
        setCoinsToAdd("");
        setCoinsRemark("");
        setModalFeedback(null);
      }, 1200);
    } catch (error) {
      console.error("Error adding wallet coins:", error);
      setModalFeedback({
        type: "error",
        message: error.response?.data?.message || "Failed to credit coins. Please try again.",
      });
    } finally {
      setAddingCoins(false);
    }
  };

  // Resolve Customer Values
  const fullName =
    customer?.customerName ||
    customer?.name ||
    [customer?.firstName, customer?.lastName].filter(Boolean).join(" ") ||
    "Unnamed Customer";

  const initials =
    fullName
      .split(" ")
      .map((n) => n[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U";

  const email = customer?.email || "—";
  const phone = customer?.phoneNumber || customer?.phone || "—";
  const areaName = customer?.areaName && customer?.areaName !== "-" ? customer.areaName : "Not Assigned";
  const streakDays = Number(customer?.currentStreak || 0);
  const registeredDate = customer?.createdAt
    ? new Date(customer.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  const fullAddress =
    customer?.address ||
    customer?.completeAddress ||
    [
      customer?.buildingNumber,
      customer?.road,
      customer?.landmark,
      customer?.areaName,
      customer?.cityName,
      customer?.stateName,
      customer?.pincode,
    ]
      .filter(Boolean)
      .join(", ") ||
    null;

  const totalOrders = customer?.totalOrders || orders.length || 0;
  const balancePoints = wallet?.balancePoints ?? 0;
  const balanceAmount = wallet?.balanceAmount != null ? Number(wallet.balanceAmount).toFixed(2) : "0.00";
  const isActive = customer?.status === "ACTIVE" || customer?.active !== false;

  return (
    <div className="user-details-page">
      {/* Top Header Bar */}
      <div className="user-details-header">
        <div className="user-details-header-left">
          <button
            type="button"
            className="user-details-back-btn"
            onClick={onBack}
            title="Back to Customers Directory"
          >
            <FiArrowLeft />
          </button>
          <div className="user-details-titles">
            <div className="user-details-eyebrow-row">
              <button
                type="button"
                className="user-details-eyebrow-link"
                onClick={() => (setActivePage ? setActivePage("dashboard") : onBack && onBack())}
              >
                Dashboard
              </button>
              <span className="user-details-eyebrow-sep">/</span>
              <button
                type="button"
                className="user-details-eyebrow-link"
                onClick={onBack}
              >
                Users & Customers
              </button>
              <span className="user-details-eyebrow-sep">/</span>
              <span>Customer Dossier</span>
            </div>
            <div className="user-details-heading-row">
              <h2>{fullName}</h2>
              <span className="user-id-badge">#{effectiveId}</span>
              <span className={`user-status-pill ${isActive ? "active" : "inactive"}`}>
                <span className="user-status-dot" />
                {isActive ? "Active Account" : "Inactive Account"}
              </span>
            </div>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="user-details-header-actions">
          <button
            type="button"
            className="btn-add-coins"
            onClick={() => {
              setModalFeedback(null);
              setCoinsToAdd("");
              setCoinsRemark("");
              setShowAddCoinsModal(true);
            }}
          >
            <FaCoins /> + Add Wallet Coins
          </button>
          <button
            type="button"
            className={`btn-refresh ${loading ? "spinning" : ""}`}
            onClick={() => {
              if (effectiveId) {
                loadCustomerProfile(effectiveId);
                loadWalletData(effectiveId);
                if (activeTab === "wallet") loadTransactions(effectiveId);
              }
            }}
            title="Refresh customer data"
          >
            <FiRefreshCw />
          </button>
        </div>
      </div>

      {/* 4 Executive Stat Metric Cards */}
      <div className="user-stats-grid">
        {/* Card 1: Total Orders */}
        <div className="stat-metric-card orders">
          <div className="stat-metric-info">
            <span className="stat-metric-label">Total Orders</span>
            <span className="stat-metric-value">{totalOrders}</span>
            <span className="stat-metric-subtext">Lifetime customer orders</span>
          </div>
          <div className="stat-metric-icon">
            <FiShoppingBag />
          </div>
        </div>

        {/* Card 2: Wallet Coins */}
        <div className="stat-metric-card coins">
          <div className="stat-metric-info">
            <span className="stat-metric-label">Wallet Coins</span>
            <span className="stat-metric-value">{balancePoints} pts</span>
            <span className="stat-metric-subtext">Loyalty reward points</span>
          </div>
          <div className="stat-metric-icon">
            <FaCoins />
          </div>
        </div>

        {/* Card 3: Wallet Cash Balance */}
        <div className="stat-metric-card balance">
          <div className="stat-metric-info">
            <span className="stat-metric-label">Wallet Balance</span>
            <span className="stat-metric-value">₹{balanceAmount}</span>
            <span className="stat-metric-subtext">Available credit balance</span>
          </div>
          <div className="stat-metric-icon">
            <FaWallet />
          </div>
        </div>

        {/* Card 4: Daily Order Streak */}
        <div className="stat-metric-card streak">
          <div className="stat-metric-info">
            <span className="stat-metric-label">Order Streak</span>
            <span className="stat-metric-value">
              {streakDays} {streakDays === 1 ? "Day" : "Days"}
            </span>
            <span className="stat-metric-subtext">Daily active ordering streak</span>
          </div>
          <div className="stat-metric-icon">
            <FaFire />
          </div>
        </div>
      </div>

      {/* Modern Segmented Navigation Tabs */}
      <div className="user-nav-tabs">
        <button
          type="button"
          className={`user-nav-tab ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => handleTabSwitch("overview")}
        >
          <FiUser /> Overview & Profile
        </button>
        <button
          type="button"
          className={`user-nav-tab ${activeTab === "orders" ? "active" : ""}`}
          onClick={() => handleTabSwitch("orders")}
        >
          <FiShoppingBag /> Order History
          <span className="user-tab-badge">{totalOrders}</span>
        </button>
        <button
          type="button"
          className={`user-nav-tab ${activeTab === "wallet" ? "active" : ""}`}
          onClick={() => handleTabSwitch("wallet")}
        >
          <FaCoins /> Wallet & Coins Ledger
          {transactions.length > 0 && (
            <span className="user-tab-badge">{transactions.length}</span>
          )}
        </button>
      </div>

      {/* TAB CONTENT: 1. OVERVIEW & PROFILE */}
      {activeTab === "overview" && (
        <div className="user-overview-grid">
          {/* Left Column: Customer Profile Card */}
          <div className="overview-card">
            <div className="overview-card-header">
              <h3>
                <FiUser style={{ color: "#f97316" }} /> Personal Information
              </h3>
              <span className="user-id-badge">Customer ID #{effectiveId}</span>
            </div>

            <div className="overview-card-body">
              {/* Profile Hero Box */}
              <div className="profile-hero-row">
                <div className="profile-avatar-large">
                  {initials}
                </div>
                <div className="profile-hero-details">
                  <h4>{fullName}</h4>
                  <div className="profile-hero-meta">
                    <span className="profile-meta-tag">
                      <FiMapPin /> {areaName}
                    </span>
                    <span className="profile-meta-tag">
                      <FiCalendar /> Joined {registeredDate}
                    </span>
                    {streakDays > 0 && (
                      <span className="profile-meta-tag" style={{ color: "#ea580c" }}>
                        <FaFire /> {streakDays} Days Streak
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Profile Details Grid */}
              <div className="profile-info-grid">
                {/* Email */}
                <div className="profile-info-tile">
                  <span className="profile-info-label">
                    <FiMail /> Email Address
                  </span>
                  <div className="profile-info-val-row">
                    <span className="profile-info-value">{email}</span>
                    {email !== "—" && (
                      <button
                        type="button"
                        className="tile-copy-btn"
                        onClick={() => handleCopyText(email, "email")}
                        title="Copy Email"
                      >
                        {copiedField === "email" ? <FiCheck style={{ color: "#10b981" }} /> : <FiCopy />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Phone */}
                <div className="profile-info-tile">
                  <span className="profile-info-label">
                    <FiPhone /> Phone Number
                  </span>
                  <div className="profile-info-val-row">
                    <span className="profile-info-value">{phone}</span>
                    {phone !== "—" && (
                      <button
                        type="button"
                        className="tile-copy-btn"
                        onClick={() => handleCopyText(phone, "phone")}
                        title="Copy Phone"
                      >
                        {copiedField === "phone" ? <FiCheck style={{ color: "#10b981" }} /> : <FiCopy />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Area Name */}
                <div className="profile-info-tile">
                  <span className="profile-info-label">
                    <FiMapPin /> Service Area
                  </span>
                  <span className="profile-info-value">{areaName}</span>
                </div>

                {/* Referred By */}
                <div className="profile-info-tile">
                  <span className="profile-info-label">
                    <FiAward /> Referred By
                  </span>
                  <span className="profile-info-value">
                    {customer?.referredBy || "Not Referred"}
                  </span>
                </div>

                {/* Date of Birth (if present) */}
                {customer?.dob && (
                  <div className="profile-info-tile">
                    <span className="profile-info-label">
                      <FiCalendar /> Date of Birth
                    </span>
                    <span className="profile-info-value">{customer.dob}</span>
                  </div>
                )}

                {/* Gender (if present) */}
                {customer?.gender && (
                  <div className="profile-info-tile">
                    <span className="profile-info-label">Gender</span>
                    <span className="profile-info-value">{customer.gender}</span>
                  </div>
                )}

                {/* Alternate Phone (if present) */}
                {(customer?.alternatePhone || customer?.alternatePhoneNumber) && (
                  <div className="profile-info-tile">
                    <span className="profile-info-label">
                      <FiPhone /> Alternate Phone
                    </span>
                    <span className="profile-info-value">
                      {customer.alternatePhone || customer.alternatePhoneNumber}
                    </span>
                  </div>
                )}

                {/* Area ID */}
                <div className="profile-info-tile">
                  <span className="profile-info-label">Area ID</span>
                  <span className="profile-info-value">
                    {customer?.areaId ? `#${customer.areaId}` : "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Address & Fintech Wallet Highlights */}
          <div className="side-cards-column">
            {/* Delivery Address Card */}
            <div className="overview-card">
              <div className="overview-card-header">
                <h3>
                  <FiMapPin style={{ color: "#3b82f6" }} /> Delivery Address
                </h3>
              </div>
              <div className="overview-card-body">
                {fullAddress ? (
                  <div className="address-item-card">
                    <div className="address-icon-box">
                      <FiMapPin />
                    </div>
                    <div className="address-details-content">
                      <span className="address-tag">Primary Address</span>
                      <span className="address-full-text">{fullAddress}</span>
                    </div>
                  </div>
                ) : (
                  <div className="address-item-card">
                    <div className="address-icon-box" style={{ background: "#f8fafc", color: "#94a3b8" }}>
                      <FiMapPin />
                    </div>
                    <div className="address-details-content">
                      <span className="address-tag" style={{ background: "#f1f5f9", color: "#64748b" }}>
                        Unspecified
                      </span>
                      <span className="address-empty-text">
                        No delivery address has been recorded for this user yet.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Fintech Wallet Card */}
            <div className="fintech-wallet-card">
              <div className="fintech-wallet-top">
                <div className="fintech-chip-row">
                  <div className="fintech-chip-icon" />
                  <span className="fintech-brand">JippyMart Pay</span>
                </div>
                {wallet?.walletId && (
                  <span className="fintech-wallet-id">#{wallet.walletId}</span>
                )}
              </div>

              <div className="fintech-balance-block">
                <span className="fintech-balance-label">Cash Wallet Balance</span>
                <h3 className="fintech-balance-val">₹{balanceAmount}</h3>
              </div>

              <div className="fintech-footer-row">
                <div className="fintech-points-box">
                  <span>Loyalty Coins</span>
                  <strong>{balancePoints} pts</strong>
                </div>
                <button
                  type="button"
                  className="fintech-action-btn"
                  onClick={() => {
                    setModalFeedback(null);
                    setCoinsToAdd("");
                    setCoinsRemark("");
                    setShowAddCoinsModal(true);
                  }}
                >
                  <FiPlus /> Add Coins
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 2. ORDERS HISTORY */}
      {activeTab === "orders" && (
        <div className="data-table-container">
          <div className="data-table-header">
            <h3>Recent Orders History</h3>
            <span className="user-id-badge">{orders.length} Orders</span>
          </div>

          {orders.length > 0 ? (
            <div className="data-table-wrapper">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Restaurant / Outlet</th>
                    <th>Date & Time</th>
                    <th>Status</th>
                    <th>Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((ord, idx) => (
                    <tr key={ord.orderId || idx}>
                      <td>
                        <span className="order-id-chip">#{ord.orderId}</span>
                      </td>
                      <td>
                        <span className="outlet-badge">
                          <FaStore style={{ color: "#f97316" }} />
                          {ord.outletName || "Jippy Store"}
                        </span>
                      </td>
                      <td>
                        {ord.orderDate || ord.createdAt
                          ? new Date(ord.orderDate || ord.createdAt).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "—"}
                      </td>
                      <td>
                        <span
                          className={`status-badge-chip ${String(
                            ord.orderStatus || "delivered"
                          ).toLowerCase()}`}
                        >
                          {ord.orderStatus || "DELIVERED"}
                        </span>
                      </td>
                      <td>
                        <strong style={{ fontSize: "14px", color: "#0f172a" }}>
                          ₹{ord.totalAmount || "0.00"}
                        </strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="table-empty-box">
              <div className="table-empty-icon">
                <FiShoppingBag />
              </div>
              <h4>No Orders Recorded Yet</h4>
              <p>This customer has not placed any orders through the platform.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: 3. WALLET & COINS LEDGER */}
      {activeTab === "wallet" && (
        <div className="data-table-container">
          <div className="data-table-header">
            <h3>Wallet & Coins Transactions</h3>
            <button
              type="button"
              className="btn-add-coins"
              onClick={() => {
                setModalFeedback(null);
                setCoinsToAdd("");
                setCoinsRemark("");
                setShowAddCoinsModal(true);
              }}
            >
              <FaCoins /> + Add Coins
            </button>
          </div>

          {transactions.length > 0 ? (
            <div className="data-table-wrapper">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Tx ID</th>
                    <th>Type</th>
                    <th>Coins / Points</th>
                    <th>Amount</th>
                    <th>Description / Purpose</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx, idx) => {
                    const isCredit =
                      String(tx.transactionType || tx.type || "").toUpperCase() === "CREDIT";
                    return (
                      <tr key={tx.transactionId || tx.id || idx}>
                        <td>
                          <span className="order-id-chip">
                            #{tx.transactionId || tx.id || idx + 1}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge-chip ${isCredit ? "credit" : "debit"}`}>
                            {isCredit ? "CREDITED" : "DEBITED"}
                          </span>
                        </td>
                        <td>
                          <strong style={{ color: isCredit ? "#15803d" : "#b91c1c" }}>
                            {isCredit ? "+" : "-"}
                            {tx.points || tx.coins || 0} pts
                          </strong>
                        </td>
                        <td>₹{tx.amount != null ? tx.amount : "0.00"}</td>
                        <td>{tx.description || tx.reason || "Wallet coins adjustment"}</td>
                        <td>
                          {tx.createdAt
                            ? new Date(tx.createdAt).toLocaleString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="table-empty-box">
              <div className="table-empty-icon">
                <FaCoins />
              </div>
              <h4>No Coin Transactions Recorded</h4>
              <p>No coin credits or debits have been recorded for this wallet yet.</p>
            </div>
          )}
        </div>
      )}

      {/* MODERN ADD WALLET COINS MODAL */}
      {showAddCoinsModal && (
        <div
          className="modern-modal-overlay"
          onClick={() => !addingCoins && setShowAddCoinsModal(false)}
        >
          <div
            className="modern-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modern-modal-header">
              <div>
                <h3>Add Wallet Coins</h3>
              </div>
              <button
                type="button"
                className="modern-modal-close"
                onClick={() => !addingCoins && setShowAddCoinsModal(false)}
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleAddCoinsSubmit}>
              <div className="modern-modal-body">
                {/* Current Balance Snapshot */}
                <div className="modal-wallet-preview">
                  <div>
                    <span>Current Coins</span>
                    <h4>{balancePoints} pts</h4>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span>Wallet Balance</span>
                    <h4 style={{ color: "#10b981" }}>₹{balanceAmount}</h4>
                  </div>
                </div>

                {/* Feedback Message */}
                {modalFeedback && (
                  <div
                    style={{
                      padding: "10px 14px",
                      borderRadius: "10px",
                      fontSize: "13px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      background: modalFeedback.type === "success" ? "#dcfce7" : "#fee2e2",
                      color: modalFeedback.type === "success" ? "#15803d" : "#b91c1c",
                      border:
                        modalFeedback.type === "success"
                          ? "1px solid #bbf7d0"
                          : "1px solid #fecaca",
                    }}
                  >
                    {modalFeedback.type === "success" ? <FiCheckCircle /> : <FiAlertCircle />}
                    <span>{modalFeedback.message}</span>
                  </div>
                )}

                {/* Quick Presets */}
                <div className="modal-field-group">
                  <label>Quick Presets</label>
                  <div className="coins-presets-row">
                    {[25, 50, 100, 250, 500].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        className={`preset-btn ${Number(coinsToAdd) === preset ? "active" : ""}`}
                        onClick={() => setCoinsToAdd(String(preset))}
                      >
                        +{preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Coins Amount */}
                <div className="modal-field-group">
                  <label>
                    Coins to Add <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    placeholder="Enter coin points amount"
                    value={coinsToAdd}
                    onChange={(e) => setCoinsToAdd(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                {/* Reason / Remarks */}
                <div className="modal-field-group">
                  <label>Purpose / Remarks (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Sign-up Bonus, Support Compensation"
                    value={coinsRemark}
                    onChange={(e) => setCoinsRemark(e.target.value)}
                  />
                </div>
              </div>

              <div className="modern-modal-footer">
                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={() => setShowAddCoinsModal(false)}
                  disabled={addingCoins}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-modal-submit"
                  disabled={addingCoins}
                >
                  {addingCoins ? "Processing..." : `+ Credit ${coinsToAdd ? coinsToAdd + " Coins" : "Coins"}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserDetails;
