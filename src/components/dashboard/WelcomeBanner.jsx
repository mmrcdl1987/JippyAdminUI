import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/WelcomeBanner.css";
import {
  FiShield,
  FiAward,
  FiActivity,
  FiCalendar,
  FiCheckCircle,
  FiShoppingBag,
  FiUsers,
  FiTruck,
  FiGrid,
  FiX,
  FiZap,
} from "react-icons/fi";

function WelcomeBanner() {
  const navigate = useNavigate();

  // State for login success toast
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    // Check if user just arrived from a successful login
    const justLoggedIn = sessionStorage.getItem("justLoggedIn");
    if (justLoggedIn === "true") {
      setShowToast(true);

      // Automatically dismiss the toast after 7 seconds
      const timer = setTimeout(() => {
        setShowToast(false);
        sessionStorage.removeItem("justLoggedIn");
      }, 7000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismissToast = () => {
    setShowToast(false);
    sessionStorage.removeItem("justLoggedIn");
  };

  // Get user details from localStorage and userData JSON
  const getStoredValue = (keys, fallback = "") => {
    for (const key of keys) {
      const value = localStorage.getItem(key);
      if (value && value.trim && value.trim()) return value;
    }
    try {
      const userDataStr = localStorage.getItem("userData");
      if (userDataStr) {
        const u = JSON.parse(userDataStr);
        for (const key of keys) {
          if (u && u[key]) return String(u[key]);
        }
      }
    } catch (e) {
      // Ignore JSON parse errors
    }
    return fallback;
  };

  const getStoredRole = () => {
    const directRole = localStorage.getItem("role");
    if (directRole && directRole.trim()) return directRole.trim();
    try {
      const userDataStr = localStorage.getItem("userData");
      if (userDataStr) {
        const u = JSON.parse(userDataStr);
        if (u.role) return String(u.role).trim();
        if (Array.isArray(u.roles) && u.roles[0]) return String(u.roles[0]).trim();
      }
    } catch (e) {
      // Ignore JSON parse errors
    }
    return "";
  };

  const rawRole = getStoredRole();
  const rawUsername = getStoredValue(
    ["username", "userName", "name", "fullName", "user_name", "full_name", "email", "loggedInUser"],
    "Administrator"
  );

  // Capitalize name cleanly
  const finalName = rawUsername || "Administrator";
  const displayName = finalName
    .split("@")[0]
    .replace(/[._-]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  // Determine greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // Format role & get corresponding visual style & icon
  const getRoleInfo = (roleStr) => {
    const upper = (roleStr || "").toUpperCase();

    if (upper.includes("SUPER")) {
      return {
        title: "Super Administrator",
        badgeClass: "role-badge-super-admin",
        Icon: FiShield,
        accent: "super-admin",
      };
    }

    if (upper.includes("FLEET")) {
      return {
        title: "Fleet Operations Manager",
        badgeClass: "role-badge-fleet",
        Icon: FiTruck,
        accent: "fleet",
      };
    }

    if (upper.includes("ADMIN")) {
      return {
        title: "System Administrator",
        badgeClass: "role-badge-super-admin",
        Icon: FiShield,
        accent: "admin",
      };
    }

    if (upper.includes("MANAGER")) {
      return {
        title: "Store Manager",
        badgeClass: "role-badge-manager",
        Icon: FiAward,
        accent: "manager",
      };
    }

    if (upper.includes("MERCHANT")) {
      return {
        title: "Merchant Partner",
        badgeClass: "role-badge-manager",
        Icon: FiAward,
        accent: "merchant",
      };
    }

    if (upper.includes("DRIVER")) {
      return {
        title: "Fleet Driver Specialist",
        badgeClass: "role-badge-fleet",
        Icon: FiTruck,
        accent: "driver",
      };
    }

    if (upper.includes("OPERATOR") || upper.includes("STAFF") || upper.includes("USER")) {
      return {
        title: "Store Operations Specialist",
        badgeClass: "role-badge-operator",
        Icon: FiActivity,
        accent: "operator",
      };
    }

    // Default formatting
    const formatted = upper
      .replace(/^ROLE_/, "")
      .replace(/_/g, " ")
      .trim();

    return {
      title: formatted || "Authorized Administrator",
      badgeClass: "role-badge-super-admin",
      Icon: FiShield,
      accent: "default",
    };
  };

  const roleInfo = getRoleInfo(rawRole);
  const RoleIcon = roleInfo.Icon;

  // Format today's date (e.g., Tuesday, 22 Sep 2026)
  const todayFormatted = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <>
      {/* 1. CELEBRATORY TOAST ALERT (Visible right after successful login) */}
      {showToast && (
        <div className="jippy-login-toast" role="status" aria-live="polite">
          <div className="toast-content-left">
            <div className="toast-icon-pulse">
              <FiCheckCircle />
            </div>
            <div className="toast-text">
              <strong>Login Successful!</strong>
              <span>Welcome to JippyMart Administration & Store Management Portal.</span>
            </div>
          </div>
          <button
            type="button"
            className="toast-dismiss-btn"
            onClick={handleDismissToast}
            aria-label="Dismiss login alert"
            title="Dismiss"
          >
            <FiX />
          </button>
        </div>
      )}

      {/* 2. GRAND HERO WELCOME BANNER */}
      <div className="jippy-welcome-banner">
        {/* Ambient Glowing Orbs in background */}
        <div className="banner-ambient-orb orb-primary" />
        <div className="banner-ambient-orb orb-emerald" />
        <div className="banner-ambient-orb orb-amber" />
        <div className="banner-grid-overlay" />

        {/* Content Section */}
        <div className="banner-content-inner">
          {/* Metadata Chips Row */}
          <div className="banner-meta-row">
            <div className="banner-portal-pill">
              <FiZap className="portal-sparkle" />
              <span>JippyMart Executive Console</span>
            </div>

            <div className="banner-status-pill">
              <span className="status-dot-pulse" />
              <span>All Systems Operational</span>
            </div>

            <div className="banner-date-pill">
              <FiCalendar />
              <span>{todayFormatted}</span>
            </div>
          </div>

          {/* Time of Day Greeting */}
          <div className="banner-greeting-line">
            {getGreeting()}
          </div>

          {/* Welcome Headline */}
          <h1 className="banner-main-title">
            Welcome to <span className="brand-name-highlight">JippyMart</span>,{" "}
            <span className="user-name-highlight">{displayName}</span> 👋
          </h1>

          {/* ATTRACTIVE HIGHLIGHTED ROLE BADGE */}
          <div className="welcome-role-badge-container">
            <div className={`welcome-role-badge ${roleInfo.badgeClass}`}>
              <div className="role-icon-box">
                <RoleIcon />
              </div>
              <div className="role-text-column">
                <span className="role-label-tag">AUTHENTICATED ROLE</span>
                <span className="role-display-name">{roleInfo.title}</span>
              </div>
              <span className="role-sparkle-dot">✦</span>
            </div>
          </div>

          {/* Subtitle description */}
          <p className="banner-description">
            Your centralized command center for real-time sales intelligence, outlet network 
            logistics, product inventory, and multi-fleet driver dispatch.
          </p>

          {/* Quick Action Navigation Links */}
          <div className="banner-quick-links">
            <span className="quick-link-label">Quick Actions:</span>

            <button
              type="button"
              className="quick-action-pill"
              onClick={() => navigate("/dashboard/orders")}
            >
              <FiShoppingBag />
              <span>Orders</span>
            </button>

            <button
              type="button"
              className="quick-action-pill"
              onClick={() => navigate("/dashboard/merchants")}
            >
              <FiUsers />
              <span>Merchants</span>
            </button>

            <button
              type="button"
              className="quick-action-pill"
              onClick={() => navigate("/dashboard/allDrivers")}
            >
              <FiTruck />
              <span>Drivers Fleet</span>
            </button>

            <button
              type="button"
              className="quick-action-pill"
              onClick={() => navigate("/dashboard/allOutlets")}
            >
              <FiGrid />
              <span>Outlets</span>
            </button>
          </div>
        </div>

        {/* Right-side 3D Animated Glowing Emblem */}
        <div className="banner-right-widget">
          <div className="emblem-outer-ring">
            <div className="emblem-inner-card">
              <FiActivity className="emblem-icon-glow" />
              <span className="emblem-badge-caption">JippyMart</span>
            </div>
          </div>
          <div className="emblem-status-tag">
            <span>● 100% Active</span>
          </div>
        </div>
      </div>
    </>
  );
}

export default WelcomeBanner;
