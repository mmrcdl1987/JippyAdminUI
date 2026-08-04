import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { menuData } from "../data/menuData";
import "../styles/Sidebar.css";
import { hasPermission } from "../utils/permissionUtils";
import {
  getRole
} from "../utils/authUtils";
import {
  FiHome,
  FiChevronRight,
  FiChevronDown,
  FiSearch,
  FiLogOut
} from "react-icons/fi";

function Sidebar({ setActivePage }) {
  const navigate = useNavigate();

const role = getRole();

  const [openMenus, setOpenMenus] =
    useState({});

  const toggleMenu = (menuName) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menuName]: !prev[menuName],
    }));
  };

  const handleMenuClick = (menuName) => {
    switch (menuName) {

      case "Advertisement Outlets":
  setActivePage("advertisementOutlets");
  break;
  case "Banner Designer":
  setActivePage("bannerDesigner");
  break;

case "Gift Cards":
  setActivePage("giftCards");
  break;

      case "Zone Management":
        setActivePage("zones");
        break;

      case "Roles":
        setActivePage("roles");
        break;

      case "Admin Users":
        setActivePage("adminUsers");
        break;
       case "Users / Customers":
  console.log("Users Customers Clicked");
  setActivePage("usersCustomers");
  break;

      case "Driver Tracking":
        setActivePage("driverTracking");
        break;

      case "Restaurant Tracking":
        setActivePage("restaurantTracking");
        break;

      case "Restaurants":
        setActivePage("restaurants");
        break;

      case "Drivers":
        setActivePage("drivers");
        break;

      default:
        console.log(
          "Clicked:",
          menuName
        );
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="sidebar">

      <div className="logo">
        <span className="green">
          Jippy
        </span>
        <span className="orange">
          Mart
        </span>
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
  className="menu active"
  onClick={() => setActivePage("dashboard")}
>
  <FiHome className="menu-icon" />
  <span>Dashboard</span>
</div>

      {menuData
        .filter((section) =>
          hasPermission(
            section.permission
          )
        )
        .map((section) => (
          <div key={section.title}>

            <div className="section-title">
              {section.title}
            </div>

            {section.items
              .filter((item) => {

                if (!item.permission) {
                  return true;
                }

                return hasPermission(
                  item.permission
                );

              })
              .map((item) => (
                <div key={item.name}>

                  <div
                    className="menu-item"
                    onClick={() => {

                    if (item.children) {

  toggleMenu(item.name);

} else if (item.pageKey) {

  setActivePage(item.pageKey);

}
                    }}
                  >
                    <span>
                      {item.name}
                    </span>

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

                  {openMenus[
                    item.name
                  ] &&
                    item.children &&
                    item.children.some(
                      (child) =>
                        hasPermission(
                          child.permission
                        )
                    ) && (

                      <div className="submenu">

                        {item.children
                          .filter(
                            (child) =>
                              hasPermission(
                                child.permission
                              )
                          )
                          .map((child) => (

                            <div
                              key={
                                child.name
                              }
                              className="submenu-item"
 onClick={() => {
  console.log("Clicked:", child.pageKey);
  if (child.pageKey) {
    setActivePage(child.pageKey);
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

      <div
  className="logout-btn"
  onClick={handleLogout}
>
  <FiLogOut className="logout-icon" />
  <span>Logout</span>
</div>

    </div>
  );
}

export default Sidebar;