import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { menuData } from "../data/menuData";
import "../styles/Sidebar.css";

import {
  hasPermission,
  canAccessPage,
} from "../utils/permissionUtils";

import { getRole } from "../utils/authUtils";

import {
  FiHome,
  FiChevronRight,
  FiChevronDown,
  FiSearch,
  FiLogOut,
  FiMenu,
  FiX,
} from "react-icons/fi";

function Sidebar({ collapsed, setCollapsed }) {
  const navigate = useNavigate();
  const location = useLocation();
  const role = getRole();

  const [openMenus, setOpenMenus] = useState({});

  const toggleMenu = (menuName) => {
    if (collapsed) {
      setCollapsed(false);
    }

    setOpenMenus((prev) => ({
      ...prev,
      [menuName]: !prev[menuName],
    }));
  };

  const handleMenuClick = (item) => {
    if (item.children) {
      toggleMenu(item.name);
    } else if (item.pageKey) {
      navigate(`/dashboard/${item.pageKey}`);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleDashboardClick = () => {
    navigate("/dashboard");
  };

  const isDashboardActive =
    location.pathname === "/dashboard" ||
    location.pathname === "/dashboard/";

  return (
    <aside className={`sidebar ${collapsed ? "sidebar-collapsed" : ""}`}>
      {/* =====================================================
          SIDEBAR HEADER
      ====================================================== */}
      <div className="sidebar-header">
        {!collapsed && (
          <div className="logo">
            <span className="green">Jippy</span>
            <span className="orange">Mart</span>
          </div>
        )}

        <button
          type="button"
          className="sidebar-toggle-btn"
          onClick={() => setCollapsed((prev) => !prev)}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <FiMenu /> : <FiX />}
        </button>
      </div>

      {/* =====================================================
          ROLE
      ====================================================== */}
      {!collapsed && (
        <div className="sidebar-role">
          <strong>{role || "USER"}</strong>
        </div>
      )}

      {/* =====================================================
          SEARCH
      ====================================================== */}
      <div
        className={`sidebar-search-container ${collapsed ? "sidebar-search-collapsed" : ""
          }`}
        title={collapsed ? "Search Menu" : ""}
      >
        <FiSearch className="sidebar-search-icon" />

        {!collapsed && (
          <input
            type="text"
            className="sidebar-search-input"
            placeholder="Search Menu"
          />
        )}
      </div>

      {/* =====================================================
          DASHBOARD
      ====================================================== */}
      <div
        className={`menu ${isDashboardActive ? "active" : ""}`}
        onClick={handleDashboardClick}
        title={collapsed ? "Dashboard" : ""}
      >
        <FiHome className="menu-icon" />

        {!collapsed && <span>Dashboard</span>}
      </div>

      {/* =====================================================
          MENU DATA
      ====================================================== */}
      <div className="sidebar-menu-wrapper">
        {menuData
          .filter((section) =>
            canAccessPage(
              section.permission,
              section.role,
              section.excludeRole
            )
          )
          .map((section) => (
            <div key={section.title}>
              {!collapsed && (
                <div className="section-title">
                  {section.title}
                </div>
              )}

              {section.items
                .filter((item) => {
                  if (!item.permission) {
                    return true;
                  }

                  return hasPermission(item.permission);
                })
                .map((item) => {
                  const hasChildren = Boolean(item.children);

                  const visibleChildren =
                    item.children?.filter((child) =>
                      hasPermission(child.permission)
                    ) || [];

                  return (
                    <div key={item.name}>
                      <div
                        className={`menu-item ${collapsed ? "menu-item-collapsed" : ""
                          }`}
                        onClick={() => handleMenuClick(item)}
                        title={collapsed ? item.name : ""}
                      >
                        <span className="menu-item-name">
                          {!collapsed && item.name}
                        </span>

                        {hasChildren && !collapsed && (
                          <span className="arrow">
                            {openMenus[item.name] ? (
                              <FiChevronDown />
                            ) : (
                              <FiChevronRight />
                            )}
                          </span>
                        )}
                      </div>

                      {/* SUBMENU */}
                      {!collapsed &&
                        openMenus[item.name] &&
                        hasChildren &&
                        visibleChildren.length > 0 && (
                          <div className="submenu">
                            {visibleChildren.map((child) => (
                              <div
                                key={child.name}
                                className="submenu-item"
                                onClick={() => {
                                  if (child.pageKey) {
                                    navigate(
                                      `/dashboard/${child.pageKey}`
                                    );
                                  }
                                }}
                              >
                                • {child.name}
                              </div>
                            ))}
                          </div>
                        )}
                    </div>
                  );
                })}
            </div>
          ))}
      </div>

      {/* =====================================================
          LOGOUT
      ====================================================== */}
      <div
        className={`logout-btn ${collapsed ? "logout-btn-collapsed" : ""
          }`}
        onClick={handleLogout}
        title={collapsed ? "Logout" : ""}
      >
        <FiLogOut className="logout-icon" />

        {!collapsed && <span>Logout</span>}
      </div>
    </aside>
  );
}

export default Sidebar;