import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import "../styles/Navbar.css";

import {
  FiMenu,
  FiChevronDown,
  FiUser,
  FiLogOut,
} from "react-icons/fi";

import { getRole } from "../utils/authUtils";

function Navbar({ collapsed, setCollapsed }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [showUserMenu, setShowUserMenu] = useState(false);

  const role = getRole();

  /*
   * Temporary flexible user lookup.
   *
   * Once you share authUtils.js / login code,
   * these can be connected directly to your actual
   * logged-in user object.
   */
  const getStoredValue = (keys, fallback = "") => {
    for (const key of keys) {
      const value = localStorage.getItem(key);

      if (value) {
        return value;
      }
    }

    return fallback;
  };

  const userName = getStoredValue(
    [
      "userName",
      "username",
      "name",
      "fullName",
      "user_name",
      "full_name",
    ],
    "Mahendra"
  );

  const userEmail = getStoredValue(
    [
      "userEmail",
      "email",
      "user_email",
    ],
    ""
  );

  const getPageTitle = () => {
    const path = location.pathname;

    if (path === "/dashboard" || path === "/dashboard/") {
      return "Dashboard";
    }

    const pageName = path
      .replace("/dashboard/", "")
      .split("/")
      .filter(Boolean)
      .pop();

    if (!pageName) {
      return "Dashboard";
    }

    return pageName
      .replace(/([A-Z])/g, " $1")
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase())
      .trim();
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const getInitials = () => {
    if (!userName) {
      return "U";
    }

    const words = userName.trim().split(/\s+/);

    if (words.length >= 2) {
      return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }

    return words[0].substring(0, 2).toUpperCase();
  };

  return (
    <header className="navbar">
      {/* =====================================================
          LEFT SIDE
      ====================================================== */}
      <div className="navbar-left">
        <button
          type="button"
          className="navbar-menu-btn"
          onClick={() => setCollapsed((prev) => !prev)}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <FiMenu />
        </button>

        <h3>{getPageTitle()}</h3>
      </div>

      {/* =====================================================
          RIGHT SIDE - USER
      ====================================================== */}
      <div className="navbar-right">
        <div className="navbar-user-wrapper">
          <button
            type="button"
            className="navbar-user-btn"
            onClick={() =>
              setShowUserMenu((prev) => !prev)
            }
          >
            <div className="navbar-avatar">
              {getInitials()}
            </div>

            <div className="navbar-user-text">
              <span className="navbar-user-name">
                {userName}
              </span>

              <span className="navbar-user-role">
                {role || "USER"}
              </span>
            </div>

            <FiChevronDown
              className={`navbar-user-arrow ${showUserMenu ? "rotate" : ""
                }`}
            />
          </button>

          {/* =================================================
              USER DROPDOWN
          ================================================== */}
          {showUserMenu && (
            <div className="navbar-user-dropdown">
              <div className="dropdown-user-header">
                <div className="dropdown-avatar">
                  {getInitials()}
                </div>

                <div className="dropdown-user-details">
                  <strong>{userName}</strong>

                  {userEmail && (
                    <span>{userEmail}</span>
                  )}

                  <small>{role || "USER"}</small>
                </div>
              </div>

              <div className="dropdown-divider" />

              <button
                type="button"
                className="dropdown-item"
                onClick={handleLogout}
              >
                <FiLogOut />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;