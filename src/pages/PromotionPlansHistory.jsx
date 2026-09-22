import React, { useState, useMemo } from "react";
import {
  FiClock,
  FiCalendar,
  FiCheckCircle,
  FiAlertCircle,
  FiSearch,
  FiArrowRight,
  FiShoppingBag,
} from "react-icons/fi";
import { getStoredPromotionProducts } from "../services/promotionSettingsService";
import "../styles/PromotionProducts.css";

const PromotionPlansHistory = ({ setActivePage }) => {
  const [promotions] = useState(() => getStoredPromotionProducts());
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const now = new Date();

  // Annotate promotions with computed status (Active, Expired, Upcoming)
  const historyItems = useMemo(() => {
    return promotions.map((p) => {
      const start = new Date(p.startTime);
      const end = new Date(p.endTime);
      let status = "ACTIVE";
      if (end < now) {
        status = "EXPIRED";
      } else if (start > now) {
        status = "UPCOMING";
      } else if (!p.isAvailable) {
        status = "PAUSED";
      }
      return {
        ...p,
        computedStatus: status,
      };
    });
  }, [promotions, now]);

  // Metrics
  const metrics = useMemo(() => {
    const total = historyItems.length;
    const active = historyItems.filter((i) => i.computedStatus === "ACTIVE").length;
    const expired = historyItems.filter((i) => i.computedStatus === "EXPIRED").length;
    const paused = historyItems.filter((i) => i.computedStatus === "PAUSED").length;
    return { total, active, expired, paused };
  }, [historyItems]);

  // Filtered
  const filteredItems = useMemo(() => {
    return historyItems.filter((item) => {
      if (statusFilter !== "All" && item.computedStatus !== statusFilter) {
        return false;
      }
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          item.restaurant?.toLowerCase().includes(q) ||
          item.product?.toLowerCase().includes(q) ||
          item.zone?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [historyItems, statusFilter, searchTerm]);

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="promotion-products-page">
      {/* Topbar */}
      <div className="promotion-products-topbar">
        <h1 className="promotion-products-page-title">Promotion Plans History</h1>
        <div className="promotion-products-breadcrumb">
          Dashboard <span>&gt;</span> Settings <span>&gt;</span>{" "}
          <strong>Promotion Plans History</strong>
        </div>
      </div>

      {/* Metrics Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            background: "#fff",
            padding: "18px 20px",
            borderRadius: 12,
            border: "1px solid #edf2f7",
            boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
          }}
        >
          <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>
            TOTAL PROMOTIONS
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#0f172a", marginTop: 4 }}>
            {metrics.total}
          </div>
        </div>

        <div
          style={{
            background: "#fff",
            padding: "18px 20px",
            borderRadius: 12,
            border: "1px solid #edf2f7",
            boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
          }}
        >
          <div style={{ fontSize: 12, color: "#16a34a", fontWeight: 600 }}>
            ACTIVE CAMPAIGNS
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#16a34a", marginTop: 4 }}>
            {metrics.active}
          </div>
        </div>

        <div
          style={{
            background: "#fff",
            padding: "18px 20px",
            borderRadius: 12,
            border: "1px solid #edf2f7",
            boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
          }}
        >
          <div style={{ fontSize: 12, color: "#ea580c", fontWeight: 600 }}>
            PAUSED
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#ea580c", marginTop: 4 }}>
            {metrics.paused}
          </div>
        </div>

        <div
          style={{
            background: "#fff",
            padding: "18px 20px",
            borderRadius: 12,
            border: "1px solid #edf2f7",
            boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
          }}
        >
          <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>
            EXPIRED / PAST
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#64748b", marginTop: 4 }}>
            {metrics.expired}
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="promotion-products-card">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
            flexWrap: "wrap",
            gap: 14,
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0f172a" }}>
              Historical Promotion Records
            </h3>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>
              Audit log of product price promotion campaigns and validity intervals
            </p>
          </div>

          <button
            type="button"
            className="promotion-products-add-btn"
            onClick={() => {
              if (setActivePage) setActivePage("promotionProducts");
            }}
          >
            Manage Active Promotions <FiArrowRight />
          </button>
        </div>

        {/* Filters */}
        <div className="promotion-products-table-controls">
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {["All", "ACTIVE", "PAUSED", "EXPIRED"].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 20,
                  fontSize: 12.5,
                  fontWeight: 600,
                  border: "1px solid",
                  cursor: "pointer",
                  backgroundColor: statusFilter === st ? "#ea580c" : "#fff",
                  borderColor: statusFilter === st ? "#ea580c" : "#e2e8f0",
                  color: statusFilter === st ? "#fff" : "#475569",
                  transition: "all 0.15s ease",
                }}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="promotion-products-search-box">
            <div className="promotion-products-search-input-wrapper">
              <input
                type="text"
                placeholder="Search history..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FiSearch className="promotion-products-search-icon" />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="promotion-products-table-responsive">
          <table className="promotion-products-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Restaurant / Mart</th>
                <th>Zone</th>
                <th>Product</th>
                <th>Special Price</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Payment Mode</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", padding: 36, color: "#94a3b8" }}>
                    No historical records found for this filter.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>#{item.id}</strong>
                    </td>
                    <td>
                      <strong>{item.restaurant}</strong>
                      <div style={{ fontSize: 11, color: "#64748b" }}>{item.type}</div>
                    </td>
                    <td>{item.zone || "Ongole"}</td>
                    <td className="promotion-products-product-cell">{item.product}</td>
                    <td className="promotion-products-price-cell">₹{item.specialPrice}</td>
                    <td className="promotion-products-time-cell">{formatDateTime(item.startTime)}</td>
                    <td className="promotion-products-time-cell">{formatDateTime(item.endTime)}</td>
                    <td className="promotion-products-payment-cell">{item.paymentMode}</td>
                    <td>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "3px 10px",
                          borderRadius: 12,
                          fontSize: 11,
                          fontWeight: 700,
                          backgroundColor:
                            item.computedStatus === "ACTIVE"
                              ? "#f0fdf4"
                              : item.computedStatus === "PAUSED"
                              ? "#fff7ed"
                              : "#f1f5f9",
                          color:
                            item.computedStatus === "ACTIVE"
                              ? "#16a34a"
                              : item.computedStatus === "PAUSED"
                              ? "#ea580c"
                              : "#64748b",
                          border: `1px solid ${
                            item.computedStatus === "ACTIVE"
                              ? "#bbf7d0"
                              : item.computedStatus === "PAUSED"
                              ? "#ffedd5"
                              : "#e2e8f0"
                          }`,
                        }}
                      >
                        {item.computedStatus}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PromotionPlansHistory;
