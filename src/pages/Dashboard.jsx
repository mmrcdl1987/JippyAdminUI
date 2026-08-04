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
        {/* Dashboard Cards */}
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

        {/* Dynamic Page Rendering */}
        {activePage !== "dashboard" &&
          pageConfig &&
          hasPermission(pageConfig.permission) && (
            <CurrentPage
              setActivePage={setActivePage}
              refreshCategories={refreshCategories}
              setRefreshCategories={setRefreshCategories}
              selectedProduct={selectedProduct}
              setSelectedProduct={setSelectedProduct}
              selectedPlan={selectedPlan}
              setSelectedPlan={setSelectedPlan}
            />
          )}

        {/* Access Denied (Handles all registered pages dynamically) */}
        {activePage !== "dashboard" &&
          pageConfig &&
          !hasPermission(pageConfig.permission) && <h2>Access Denied</h2>}

        {/* Special/Standalone Page Handling */}
        {activePage === "addToOutletProducts" && (
          <AddToOutletProducts setActivePage={setActivePage} />
        )}
      </div>
    </div>
  );
}

export default Dashboard;