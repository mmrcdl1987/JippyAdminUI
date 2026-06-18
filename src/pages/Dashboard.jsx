import { useState } from "react";
import Sidebar from "../components/Sidebar";
import ZoneManagement from "./ZoneManagement";
import CreateZone from "./CreateZone";
import AdminUsers from "./AdminUsers";
import RolesPermissions from "./RolesPermissions";
import { hasPermission } from "../utils/permissionUtils";

import "../styles/Dashboard.css";

import {
  FaMoneyBillWave,
  FaStore,
  FaClipboardList,
  FaUtensils,
  FaUsers,
  FaTruck,
} from "react-icons/fa";

function Dashboard() {

  const [activePage, setActivePage] =
    useState("dashboard");

  return (
    <div className="dashboard-layout">

      <Sidebar
        setActivePage={setActivePage}
      />

      <div className="dashboard-content">

        {/* Dashboard */}
        {activePage === "dashboard" && (
          <>
            <h2 className="dashboard-title">
              Business Analytics
            </h2>

            <div className="cards-grid">

              <div className="card green">
                <div>
                  <h3>₹830389</h3>
                  <p>Total Earnings</p>
                </div>
                <FaMoneyBillWave size={40} />
              </div>

              <div className="card blue">
                <div>
                  <h3>522</h3>
                  <p>Total Restaurants</p>
                </div>
                <FaStore size={40} />
              </div>

              <div className="card cream">
                <div>
                  <h3>5545</h3>
                  <p>Total Orders</p>
                </div>
                <FaClipboardList size={40} />
              </div>

              <div className="card lightgreen">
                <div>
                  <h3>23969</h3>
                  <p>Total Foods</p>
                </div>
                <FaUtensils size={40} />
              </div>

              <div className="card pink">
                <div>
                  <h3>₹164904</h3>
                  <p>Admin Commission</p>
                </div>
                <FaMoneyBillWave size={40} />
              </div>

              <div className="card purple">
                <div>
                  <h3>40245</h3>
                  <p>Total Clients</p>
                </div>
                <FaUsers size={40} />
              </div>

              <div className="card lavender">
                <div>
                  <h3>519</h3>
                  <p>Total Drivers</p>
                </div>
                <FaTruck size={40} />
              </div>

            </div>
          </>
        )}

        {/* Zone Management */}
        {
          activePage === "zones" &&
          hasPermission("ZONE_READ") && (
            <ZoneManagement
              setActivePage={setActivePage}
            />
          )
        }

        {/* Create Zone */}
        {
          activePage === "createZone" &&
          hasPermission("ZONE_CREATE") && (
            <CreateZone
              setActivePage={setActivePage}
            />
          )
        }

        {/* Roles & Permissions */}
        {
          activePage === "roles" &&
          hasPermission("ROLE_READ") && (
            <RolesPermissions />
          )
        }

        {/* Admin Users */}
        {
          activePage === "adminUsers" &&
          hasPermission("ADMIN_USER_READ") && (
            <AdminUsers />
          )
        }

        {/* Access Denied */}
        {
          activePage === "zones" &&
          !hasPermission("ZONE_READ") && (
            <h2>
              Access Denied
            </h2>
          )
        }

        {
          activePage === "roles" &&
          !hasPermission("ROLE_READ") && (
            <h2>
              Access Denied
            </h2>
          )
        }

        {
          activePage === "adminUsers" &&
          !hasPermission("ADMIN_USER_READ") && (
            <h2>
              Access Denied
            </h2>
          )
        }

      </div>

    </div>
  );
}

export default Dashboard;