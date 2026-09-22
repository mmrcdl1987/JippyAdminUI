import { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import {
  hasPermission,
} from "../utils/permissionUtils";

import { pageRegistry } from "../config/pageRegistry";

import AddToOutletProducts from "../pages/AddToOutletProducts";
import WelcomeBanner from "../components/dashboard/WelcomeBanner";
import AnalyticsDashboard from "../components/dashboard/AnalyticsDashboard";

import "../styles/Dashboard.css";

function Dashboard() {
  const [refreshCategories, setRefreshCategories] = useState(0);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  /*
   * Sidebar collapsed state.
   *
   * Saved in localStorage so the state remains when
   * navigating between dashboard pages.
   */
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem("sidebarCollapsed") === "true";
  });

  const navigate = useNavigate();

  const handleSidebarToggle = (value) => {
    setSidebarCollapsed(value);

    localStorage.setItem(
      "sidebarCollapsed",
      String(value)
    );
  };

  const setActivePage = (page) => {
    navigate(`/dashboard/${page}`);
  };

  const renderDashboardHome = () => (
    <>
      <WelcomeBanner />
      <AnalyticsDashboard setActivePage={setActivePage} />
    </>
  );

  return (
    <div
      className={`dashboard-layout ${sidebarCollapsed
        ? "dashboard-sidebar-collapsed"
        : ""
        }`}
    >
      {/* =====================================================
          SIDEBAR
      ====================================================== */}
      <Sidebar
        collapsed={sidebarCollapsed}
        setCollapsed={handleSidebarToggle}
      />

      {/* =====================================================
          MAIN AREA
      ====================================================== */}
      <div className="dashboard-main">
        {/* ===================================================
            NAVBAR
        ==================================================== */}
        <Navbar
          collapsed={sidebarCollapsed}
          setCollapsed={handleSidebarToggle}
        />

        {/* ===================================================
            PAGE CONTENT
        ==================================================== */}
        <main className="dashboard-content">
          <Routes>
            {/* =================================================
                MAIN DASHBOARD (Matches /dashboard, /dashboard/, and index)
            ================================================== */}
            <Route index element={renderDashboardHome()} />
            <Route path="" element={renderDashboardHome()} />
            <Route path="/" element={renderDashboardHome()} />

            {/* =================================================
                ALL REGISTERED PAGES
            ================================================== */}
            {Object.entries(pageRegistry).map(
              ([pageKey, config]) => {
                const CurrentComponent =
                  config.component;

                const isEditProductPage =
                  pageKey === "editMasterProduct";

                const hasAccess =
                  isEditProductPage ||
                  !config.permission ||
                  hasPermission(config.permission);

                return (
                  <Route
                    key={pageKey}
                    path={pageKey}
                    element={
                      hasAccess ? (
                        <CurrentComponent
                          refreshCategories={
                            refreshCategories
                          }
                          setRefreshCategories={
                            setRefreshCategories
                          }
                          selectedProduct={
                            selectedProduct
                          }
                          setSelectedProduct={
                            setSelectedProduct
                          }
                          selectedPlan={selectedPlan}
                          setSelectedPlan={
                            setSelectedPlan
                          }
                          selectedCategory={
                            selectedCategory
                          }
                          setSelectedCategory={
                            setSelectedCategory
                          }
                          setActivePage={
                            setActivePage
                          }
                          selectedOrderId={
                            selectedOrderId
                          }
                          setSelectedOrderId={
                            setSelectedOrderId
                          }
                        />
                      ) : (
                        <div
                          style={{
                            padding: "40px",
                            backgroundColor: "#fff",
                            borderRadius: "8px",
                            color: "#d9534f",
                          }}
                        >
                          <h2>Access Denied</h2>

                          <p>
                            You lack the required
                            permission to view this page
                            (
                            {config.permission}
                            ).
                          </p>
                        </div>
                      )
                    }
                  />
                );
              }
            )}

            {/* =================================================
                ADD TO OUTLET PRODUCTS
            ================================================== */}
            <Route
              path="/addToOutletProducts"
              element={
                <AddToOutletProducts
                  refreshCategories={
                    refreshCategories
                  }
                  setRefreshCategories={
                    setRefreshCategories
                  }
                  setActivePage={setActivePage}
                />
              }
            />

            {/* =================================================
                404
            ================================================== */}
            <Route
              path="*"
              element={
                <div
                  style={{
                    padding: "40px",
                    backgroundColor: "#fff",
                    borderRadius: "8px",
                    color: "#333",
                  }}
                >
                  <h2>404 - Page Not Found</h2>

                  <p>
                    The requested page could not be
                    found or has not been registered in{" "}
                    <code>pageRegistry.js</code>.
                  </p>
                </div>
              }
            />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;