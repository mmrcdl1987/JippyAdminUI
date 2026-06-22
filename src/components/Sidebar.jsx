import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { menuData } from "../data/menuData";
import "../styles/Sidebar.css";
import { hasPermission } from "../utils/permissionUtils";
import {
  getRole
} from "../utils/authUtils";

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

      <div className="search-box">
        <input
          type="text"
          placeholder="Search Menu"
        />
      </div>

      <div
        className="menu active"
        onClick={() =>
          setActivePage("dashboard")
        }
      >
        Dashboard
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

                      if (
                        item.children
                      ) {

                        toggleMenu(
                          item.name
                        );

                      } else {

                        handleMenuClick(
                          item.name
                        );

                      }
                    }}
                  >
                    <span>
                      {item.name}
                    </span>

                    {item.children && (
                      <span>
                        {openMenus[
                          item.name
                        ]
                          ? "▼"
                          : "▶"}
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
                              onClick={() =>
                                handleMenuClick(
                                  child.name
                                )
                              }
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
        Logout
      </div>

    </div>
  );
}

export default Sidebar;