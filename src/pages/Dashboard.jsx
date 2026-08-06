import { useState } from "react";
import Sidebar from "../components/Sidebar";
import { hasPermission } from "../utils/permissionUtils";
import { pageRegistry } from "../config/pageRegistry";
import AddToOutletProducts from "../pages/AddToOutletProducts";

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
  const [activePage, setActivePage] = useState("dashboard");
  const [refreshCategories, setRefreshCategories] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const pageConfig = pageRegistry[activePage];
  const CurrentPage = pageConfig?.component;

  console.log("Active Page:", activePage);
  console.log("Page Config:", pageConfig);

  return (
    <div className="dashboard-layout">
      <Sidebar setActivePage={setActivePage} />

      <div className="dashboard-content">
        {/* Dashboard Analytics View */}
        {activePage === "dashboard" && (
          <>
            <h2 className="dashboard-title">Business Analytics</h2>

            <div className="cards-grid">
              <div className="dashboard-card green">
                <div>
                  <h3>₹830389</h3>
                  <p>Total Earnings</p>
                </div>
                <FaMoneyBillWave size={40} />
              </div>

              <div className="dashboard-card blue">
                <div>
                  <h3>522</h3>
                  <p>Total Restaurants</p>
                </div>
                <FaStore size={40} />
              </div>

              <div className="dashboard-card cream">
                <div>
                  <h3>5545</h3>
                  <p>Total Orders</p>
                </div>
                <FaClipboardList size={40} />
              </div>

              <div className="dashboard-card lightgreen">
                <div>
                  <h3>23969</h3>
                  <p>Total Foods</p>
                </div>
                <FaUtensils size={40} />
              </div>

              <div className="dashboard-card pink">
                <div>
                  <h3>₹164904</h3>
                  <p>Admin Commission</p>
                </div>
                <FaMoneyBillWave size={40} />
              </div>

              <div className="dashboard-card purple">
                <div>
                  <h3>40245</h3>
                  <p>Total Clients</p>
                </div>
                <FaUsers size={40} />
              </div>

              <div className="dashboard-card lavender">
                <div>
                  <h3>519</h3>
                  <p>Total Drivers</p>
                </div>
                <FaTruck size={40} />
              </div>
            </div>
          </>
        )}


        {/* Dynamic Page Rendering with Explicit Fallback Rendering */}
        {activePage !== "dashboard" && pageConfig && (
          !pageConfig.permission || hasPermission(pageConfig.permission) ? (
            CurrentPage ? (
              <CurrentPage
                setActivePage={setActivePage}
                refreshCategories={refreshCategories}
                setRefreshCategories={setRefreshCategories}
                selectedProduct={selectedProduct}
                setSelectedProduct={setSelectedProduct}
                selectedPlan={selectedPlan}
                setSelectedPlan={setSelectedPlan}
              />
            ) : (
              <div style={{ padding: "40px", backgroundColor: "#fff", borderRadius: "8px", color: "#333" }}>
                <h2>Component Failed to Render</h2>
                <p>Target component key: <strong>{activePage}</strong></p>
              </div>
            )
          ) : (
            <div style={{ padding: "40px", backgroundColor: "#fff", borderRadius: "8px", color: "#d9534f" }}>
              <h2>Access Denied</h2>
              <p>
                You lack the permission <strong>"{pageConfig.permission}"</strong> to view this page.
              </p>
            </div>
          )
        )}

        


        {/* Standalone Page Fallback */}
        {activePage === "addToOutletProducts" && !pageConfig && (
          <AddToOutletProducts setActivePage={setActivePage} />
        )}

        {/* Page Not Found Fallback */}
        {activePage !== "dashboard" &&
          activePage !== "addToOutletProducts" &&
          !pageConfig && (
            <div style={{ padding: "40px", backgroundColor: "#fff", borderRadius: "8px", color: "#333" }}>
              <h2>404 - Page Not Found</h2>
              <p>
                The page key <strong>"{activePage}"</strong> was not found in <code>pageRegistry.js</code>.
              </p>
            </div>
          )}
      </div>
    </div>
  );
}

export default Dashboard;