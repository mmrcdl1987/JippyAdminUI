import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { menuData } from "../data/menuData";
import "../styles/Sidebar.css";
import { hasPermission, hasRoleAccess, canAccessPage } from "../utils/permissionUtils";
import { getRole } from "../utils/authUtils";
import {
  FiHome,
  FiChevronRight,
  FiChevronDown,
  FiSearch,
  FiLogOut
} from "react-icons/fi";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = getRole();

  const [openMenus, setOpenMenus] = useState({});

  const toggleMenu = (menuName) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menuName]: !prev[menuName],
    }));
  };

  const handleMenuClick = (item) => {
    if (item.children) {
      toggleMenu(item.name);
    } else if (item.pageKey) {
      console.log("Navigating to:", item.pageKey);
      navigate(`/dashboard/${item.pageKey}`);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const isDashboardActive = location.pathname === "/dashboard" || location.pathname === "/dashboard/";

  return (
    <div className="sidebar">
      <div className="logo">
        <span className="green">Jippy</span>
        <span className="orange">Mart</span>
      </div>

      <div className="user-info">
        <strong>{role}</strong>
      </div>

      <div className="sidebar-search-container">
        <FiSearch className="sidebar-search-icon" />
        <input
          type="text"
          className="sidebar-search-input"
          placeholder="Search Menu"
        />
      </div>

      <div
        className={`menu ${isDashboardActive ? "active" : ""}`}
        onClick={() => navigate("/dashboard")}
      >
        <FiHome className="menu-icon" />
        <span>Dashboard</span>
      </div>

      {menuData
        .filter((section) => canAccessPage(section.permission, section.role, section.excludeRole))
        .map((section) => (
          <div key={section.title}>
            <div className="section-title">{section.title}</div>

            {section.items
              .filter((item) => {
                if (!item.permission) {
                  return true;
                }
                return hasPermission(item.permission);
              })
              .map((item) => (
                <div key={item.name}>
                  <div
                    className="menu-item"
                    onClick={() => handleMenuClick(item)}
                  >
                    <span>{item.name}</span>

                      {item.children && (
                        <span className="arrow">
                          {openMenus[item.name] ? (
                            <FiChevronDown />
                          ) : (
                            <FiChevronRight />
                          )}
                        </span>
                      )}
                    </div>

                  {openMenus[item.name] &&
                    item.children &&
                    item.children.some((child) =>
                      hasPermission(child.permission)
                    ) && (
                      <div className="submenu">
                        {item.children
                          .filter((child) =>
                            hasPermission(child.permission)
                          )
                          .map((child) => (
                            <div
                              key={child.name}
                              className="submenu-item"
                              onClick={() => {
                                console.log("Clicked:", child.pageKey);
                                if (child.pageKey) {
                                  navigate(`/dashboard/${child.pageKey}`);
                                }
                              }}
                            >
                              • {child.name}
                            </div>
                          ))}
                      </div>
                    )}
                </div>
              ))}
          </div>
        ))}

      <div className="logout-btn" onClick={handleLogout}>
        <FiLogOut className="logout-icon" />
        <span>Logout</span>
      </div>
    </div>
  );
}

export default Sidebar;