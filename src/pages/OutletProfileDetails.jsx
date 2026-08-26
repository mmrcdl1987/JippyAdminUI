import React, { useEffect, useState } from "react";
import "../styles/OutletProfileDetails.css";

import {
  FiHome,
  FiArrowLeft,
  FiPlus,
  FiMapPin,
  FiShoppingBag,
  FiDollarSign,
  FiCreditCard,
  FiClock,
  FiCalendar,
  FiEdit2,
} from "react-icons/fi";

function OutletProfileDetails({ setActivePage }) {
  const [outlet, setOutlet] = useState(null);
  const [activeTab, setActiveTab] = useState("Basic");

  useEffect(() => {
    const storedOutlet =
      sessionStorage.getItem("selectedOutlet");

    if (storedOutlet) {
      try {
        setOutlet(JSON.parse(storedOutlet));
      } catch (error) {
        console.error(
          "Failed to read selected outlet:",
          error
        );
      }
    }
  }, []);

  const handleBack = () => {
    sessionStorage.removeItem("selectedOutlet");

    if (setActivePage) {
      setActivePage("allOutletsList");
    }
  };

  if (!outlet) {
    return (
      <div className="jippy-outlet-profile-loading">
        <p>Loading outlet details...</p>

        <button
          type="button"
          onClick={handleBack}
          className="jippy-outlet-profile-back-btn"
        >
          <FiArrowLeft />
          Back to Outlets
        </button>
      </div>
    );
  }

  const address = [
    outlet.buildingNumber,
    outlet.road,
    outlet.landmark,
  ]
    .filter(Boolean)
    .join(", ");

  const tabs = [
    "Basic",
    "Foods",
    "Orders",
    "Promos",
    "Payouts",
   "Subscription History",
  ];

  return (
    <div className="jippy-outlet-profile-page">

      {/* =====================================================
          TOP HEADER
          ===================================================== */}

      <div className="jippy-outlet-profile-header">

        <div className="jippy-outlet-profile-title-area">

          <div className="jippy-outlet-profile-title-row">

            <FiHome className="jippy-outlet-profile-home-icon" />

            <h1>
              Outlets - {outlet.outletName || "Outlet"}
            </h1>

          </div>

          <div className="jippy-outlet-profile-breadcrumb">

            <span>Dashboard</span>

            <span>/</span>

            <span>Outlets</span>

            <span>/</span>

            <strong>Outlet Details</strong>

          </div>

        </div>

        <button
          type="button"
          className="jippy-outlet-profile-wallet-btn"
        >
          <FiPlus />
          Add Wallet Amount
        </button>

      </div>


      {/* =====================================================
          TABS
          ===================================================== */}

      <div className="jippy-outlet-profile-tabs">

        {tabs.map((tab) => (

          <button
            key={tab}
            type="button"
            className={`jippy-outlet-profile-tab ${
              activeTab === tab
                ? "jippy-outlet-profile-tab-active"
                : ""
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>

        ))}

      </div>


      {/* =====================================================
          NON-BASIC TAB
          ===================================================== */}

      {activeTab !== "Basic" ? (

        <div className="jippy-outlet-profile-empty-tab">

          <div className="jippy-outlet-profile-empty-icon">
            <FiShoppingBag />
          </div>

          <h3>{activeTab}</h3>

          <p>
            Data for this section is not available yet.
          </p>

    
        </div>

      ) : (

        <>

          {/* =================================================
              SUMMARY CARDS
              ================================================= */}

          <div className="jippy-outlet-profile-summary-grid">

            <div className="jippy-outlet-profile-summary-card blue">

              <div>
                <strong>0</strong>
                <span>Total Orders</span>
              </div>

              <FiShoppingBag />

            </div>


            <div className="jippy-outlet-profile-summary-card green">

              <div>
                <strong>₹0.00</strong>
                <span>Total Earnings</span>
              </div>

              <FiDollarSign />

            </div>


            <div className="jippy-outlet-profile-summary-card pink">

              <div>
                <strong>₹0.00</strong>
                <span>Total Payments</span>
              </div>

              <FiCreditCard />

            </div>


            <div className="jippy-outlet-profile-summary-card cream">

              <div>
                <strong>₹0.00</strong>
                <span>Remaining Payments</span>
              </div>

              <FiCreditCard />

            </div>

          </div>


          {/* =================================================
              SUBSCRIPTION DETAILS
              ================================================= */}

          <div className="jippy-outlet-profile-section">

            <div className="jippy-outlet-profile-section-header">

              <h2>Subscription Details</h2>

              <button
                type="button"
                className="jippy-outlet-profile-orange-btn"
              >
                <FiEdit2 />
                Change Subscription Plan
              </button>

            </div>


            <div className="jippy-outlet-profile-summary-grid">

              <div className="jippy-outlet-profile-info-card light-blue">

                <strong>
                  No Data
                </strong>

                <span>Name</span>

              </div>


              <div className="jippy-outlet-profile-info-card light-cream">

                <strong>
                  0 Days
                </strong>

                <span>Number of Days</span>

              </div>


              <div className="jippy-outlet-profile-info-card light-red">

                <strong>
                  -
                </strong>

                <span>Expiry Date</span>

              </div>


              <div className="jippy-outlet-profile-info-card light-purple">

                <strong>
                  ₹0.00
                </strong>

                <span>Total Price</span>

              </div>

            </div>

          </div>


          {/* =================================================
              RESTAURANT DETAILS
              ================================================= */}

          <div className="jippy-outlet-profile-main-card">

            <div className="jippy-outlet-profile-card-heading">
              Restaurant Details
            </div>


            <div className="jippy-outlet-profile-restaurant-layout">

              <div className="jippy-outlet-profile-restaurant-info">

                <div className="jippy-outlet-profile-outlet-name">

                  <strong>
                    {outlet.outletName || "-"}
                  </strong>

                  <span>
                    0★
                  </span>

                </div>


                <div className="jippy-outlet-profile-detail-line">

                  <strong>Phone</strong>

                  <span>
                    {outlet.outletPhone || "-"}
                  </span>

                </div>


                <div className="jippy-outlet-profile-detail-line">

                  <strong>Address</strong>

                  <span>
                    {address || "-"}
                  </span>

                </div>


                <div className="jippy-outlet-profile-detail-line">

                  <strong>Cuisine</strong>

                  <span>
                    {Array.isArray(outlet.cuisineType)
                      ? outlet.cuisineType.join(", ")
                      : outlet.cuisineType || "-"}
                  </span>

                </div>


                <div className="jippy-outlet-profile-detail-columns">

                  <div>

                    <strong>Description</strong>

                    <span>
                      No description available
                    </span>

                  </div>


                  <div>

                    <strong>Wallet Balance</strong>

                    <span>
                      ₹0.00
                    </span>

                  </div>


                  <div>

                    <strong>Zone Management</strong>

                    <span>
                      -
                    </span>

                  </div>

                </div>

              </div>


              {/* MAP PLACEHOLDER */}

              <div className="jippy-outlet-profile-map">

                <div className="jippy-outlet-profile-map-overlay">

                  <FiMapPin />

                  <span>
                    Location
                  </span>

                </div>

                <div className="jippy-outlet-profile-map-text">

                  <strong>
                    Outlet Location
                  </strong>

                  <span>
                    {outlet.latitude && outlet.longitude
                      ? `${outlet.latitude}, ${outlet.longitude}`
                      : "Location not available"}
                  </span>

                </div>

              </div>

            </div>

          </div>


          {/* =================================================
              TWO COLUMN SECTION
              ================================================= */}

          <div className="jippy-outlet-profile-two-column">


            {/* VENDOR DETAILS */}

            <div className="jippy-outlet-profile-main-card">

              <div className="jippy-outlet-profile-card-heading">
                Merchant ,Details
              </div>

              <div className="jippy-outlet-profile-vendor-grid">

                <div>
                  <span>Name</span>
                  <strong>-</strong>
                </div>

                <div>
                  <span>Phone</span>
                  <strong>-</strong>
                </div>

                <div>
                  <span>Email</span>
                  <strong>-</strong>
                </div>

                <div>
                  <span>Restaurant Status (Open/Closed)</span>

                  <strong className="jippy-outlet-status-open">
                    {outlet.isActive === "Y"
                      ? "Open"
                      : "Closed"}
                  </strong>

                </div>

                <div>
                  <span>Open/Closed</span>
                  <strong>
                    {outlet.isActive === "Y"
                      ? "Open"
                      : "Closed"}
                  </strong>
                </div>

                <div>
                  <span>Admin Commission</span>
                  <strong>-</strong>
                </div>

              </div>

            </div>


            {/* GALLERY */}

            <div className="jippy-outlet-profile-main-card">

              <div className="jippy-outlet-profile-card-heading">
                Gallery
              </div>

              <div className="jippy-outlet-profile-gallery-empty">
                No images available
              </div>

            </div>

          </div>


          {/* =================================================
              WORKING HOURS + SERVICES
              ================================================= */}

          <div className="jippy-outlet-profile-two-column">


            {/* WORKING HOURS */}

            <div className="jippy-outlet-profile-main-card">

              <div className="jippy-outlet-profile-card-heading">
                Working Hours
              </div>

              <div className="jippy-outlet-profile-working-hours">

                {[
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday",
                ].map((day) => (

                  <div
                    key={day}
                    className="jippy-outlet-profile-day"
                  >

                    <strong>{day}</strong>

                    <span>
                      7:00 AM - 11:59 PM
                    </span>

                  </div>

                ))}

              </div>

            </div>


            {/* SERVICES */}

            <div className="jippy-outlet-profile-main-card">

              <div className="jippy-outlet-profile-card-heading">
                Services
              </div>

              <div className="jippy-outlet-profile-services-empty">
                No services available
              </div>

            </div>

          </div>


          {/* =================================================
              ACTIVE SUBSCRIPTION
              ================================================= */}

          <div className="jippy-outlet-profile-main-card">

            <div className="jippy-outlet-profile-card-heading">

              Active Subscription Plan

            </div>


            <div className="jippy-outlet-profile-subscription-grid">

              <div>
                <span>Name</span>
                <strong>No subscription</strong>
              </div>

              <div>
                <span>Plan Type</span>
                <strong>-</strong>
              </div>

              <div>
                <span>Expires At</span>
                <strong>-</strong>
              </div>

              <div>
                <span>Order Limit</span>
                <strong>0</strong>
              </div>

              <div>
                <span>Item Limit</span>
                <strong>0</strong>
              </div>

              <button
                type="button"
                className="jippy-outlet-profile-orange-btn"
              >
                Update Plan Limit
              </button>

              <div>
                <span>Available Features</span>
                <strong>-</strong>
              </div>

            </div>

          </div>


          {/* =================================================
              BACK BUTTON
              ================================================= */}

          <div className="jippy-outlet-profile-bottom-actions">

            <button
              type="button"
              className="jippy-outlet-profile-back-btn"
              onClick={handleBack}
            >
              <FiArrowLeft />
              Back to Outlets
            </button>

          </div>

        </>

      )}

    </div>
  );
}

export default OutletProfileDetails;