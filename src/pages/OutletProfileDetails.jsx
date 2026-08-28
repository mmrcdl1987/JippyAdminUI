import React, { useEffect, useState } from "react";
import "../styles/OutletProfileDetails.css";

import {
  getOutletById,
  getOutletDetails,
  getOutletLocation,
} from "../services/outletListService";

import OutletFoods from "./OutletFoods";
import OutletSubscriptionHistory from "./OutletSubscriptionHistory";

import {
  FiHome,
  FiArrowLeft,
  FiPlus,
  FiMapPin,
  FiCreditCard,
  FiClock,
  FiShoppingBag,
  FiStar,
  FiUser,
  FiMail,
  FiPhone,
  FiNavigation,
} from "react-icons/fi";


function OutletProfileDetails({ setActivePage }) {

  // ============================================================
  // STATE
  // ============================================================

  const [outlet, setOutlet] = useState(null);

  const [activeTab, setActiveTab] = useState("Basic");

  const [loading, setLoading] = useState(true);

  const [errorMessage, setErrorMessage] = useState("");


  // ============================================================
  // GET SELECTED OUTLET ID
  // ============================================================

  const getCurrentOutletId = () => {

    try {

      const storedOutlet =
        sessionStorage.getItem("selectedOutlet");

      if (!storedOutlet) {
        return null;
      }

      const selectedOutlet =
        JSON.parse(storedOutlet);

      return (
        selectedOutlet?.outletId ||
        selectedOutlet?.id ||
        null
      );

    } catch (error) {

      console.error(
        "Failed to read selectedOutlet:",
        error
      );

      return null;
    }
  };


  // ============================================================
  // LOAD OUTLET DETAILS
  // ============================================================

  useEffect(() => {

    const loadOutletData = async () => {

      try {

        setLoading(true);
        setErrorMessage("");

        const outletId =
          getCurrentOutletId();

        if (!outletId) {

          setErrorMessage(
            "Outlet ID not found."
          );

          return;
        }


        console.log(
          "Loading outlet:",
          outletId
        );

        let storedOutlet = null;

        try {
          storedOutlet = JSON.parse(
            sessionStorage.getItem("selectedOutlet")
          );
        } catch {
          storedOutlet = null;
        }


        // ======================================================
        // OUTLET DETAILS
        // getOutletDetails (userType=customer) only exists for
        // some outlets. Fall back to getOutletById / list row.
        // ======================================================

        let details = null;

        try {
          const detailsResponse =
            await getOutletDetails(
              outletId
            );

          console.log(
            "OUTLET DETAILS RESPONSE:",
            detailsResponse
          );

        details = detailsResponse || null;
        } catch (detailsError) {
          console.warn(
            "getOutletDetails failed, using getOutletById:",
            detailsError?.response?.status
          );

          try {
            const byIdResponse =
              await getOutletById(
                outletId
              );

            console.log(
              "GET OUTLET BY ID RESPONSE:",
              byIdResponse
            );

            details =
              byIdResponse?.data ??
              byIdResponse ??
              null;
          } catch (byIdError) {
            console.warn(
              "getOutletById failed, using selectedOutlet:",
              byIdError?.response?.status
            );
          }
        }

        if (storedOutlet) {
          details = {
            ...storedOutlet,
            ...(details || {}),
            categories:
              details?.categories ??
              storedOutlet?.categories ??
              [],
          };
        }


        if (!details) {

          setErrorMessage(
            "No outlet details found."
          );

          return;
        }


        setOutlet(details);


        // ======================================================
        // LOCATION
        // ======================================================

        try {

          const locationResponse =
            await getOutletLocation(
              outletId
            );


          console.log(
            "OUTLET LOCATION RESPONSE:",
            locationResponse
          );


          const location =
            locationResponse?.data ??
            locationResponse ??
            {};


          setOutlet((previous) => {

            if (!previous) {
              return details;
            }


            return {

              ...previous,

              latitude:
                location?.latitude ??
                previous?.latitude ??
                null,

              longitude:
                location?.longitude ??
                previous?.longitude ??
                null,

              stateId:
                location?.stateId ??
                previous?.stateId ??
                null,

              cityId:
                location?.cityId ??
                previous?.cityId ??
                null,

              areaId:
                location?.areaId ??
                previous?.areaId ??
                null,

              stateName:
                location?.stateName ??
                previous?.stateName ??
                null,

              cityName:
                location?.cityName ??
                previous?.cityName ??
                null,

              areaName:
                location?.areaName ??
                previous?.areaName ??
                null,
            };
          });

        } catch (locationError) {

          console.warn(
            "Location API failed:",
            locationError
          );

        }

      } catch (error) {

        console.error(
          "Failed to load outlet details:",
          error
        );


        setErrorMessage(
          "Failed to load outlet details."
        );

      } finally {

        setLoading(false);

      }

    };


    loadOutletData();

  }, []);


  // ============================================================
  // BACK BUTTON
  // ============================================================

  const handleBack = () => {

    if (setActivePage) {

      setActivePage(
        "allOutletsList"
      );

    }

  };


  // ============================================================
  // FORMAT TIME
  // ============================================================

  const formatTime = (time) => {

    if (!time) {
      return "-";
    }

    return String(time).substring(
      0,
      5
    );

  };


  // ============================================================
  // FORMAT DATE
  // ============================================================

  const formatDate = (value) => {

    if (!value) {
      return "-";
    }


    try {

      const date =
        new Date(value);


      if (
        Number.isNaN(
          date.getTime()
        )
      ) {

        return String(value);

      }


      return date.toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );

    } catch {

      return String(value);

    }

  };


  // ============================================================
  // DISPLAY VALUE
  // ============================================================

  const displayValue = (
    value,
    fallback = "-"
  ) => {

    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {

      return fallback;

    }

    if (
      typeof value === "boolean"
    ) {

      return value
        ? "Yes"
        : "No";

    }

    return String(value);

  };


  // ============================================================
  // CUISINE
  // ============================================================

  const getCuisine = () => {

    if (
      Array.isArray(
        outlet?.cuisineTypes
      )
    ) {

      return outlet.cuisineTypes
        .map((item) => {

          if (
            typeof item ===
            "string"
          ) {

            return item;

          }

          return (
            item?.cuisineTypeName ??
            item?.cuisineType ??
            item?.name ??
            item?.cuisineTypeId ??
            null
          );

        })
        .filter(Boolean)
        .join(", ");

    }


    if (
      Array.isArray(
        outlet?.cuisineType
      )
    ) {

      return outlet.cuisineType
        .join(", ");

    }


    return (
      outlet?.cuisineType ||
      "-"
    );

  };


  // ============================================================
  // TOTAL PRODUCTS
  // ============================================================

  const getProductsCount = () => {

    if (
      !Array.isArray(
        outlet?.categories
      )
    ) {

      return 0;

    }


    return outlet.categories.reduce(
      (
        total,
        category
      ) => {

        const products =
          Array.isArray(
            category?.products
          )
            ? category.products.length
            : 0;


        return total + products;

      },
      0
    );

  };


  // ============================================================
  // TOTAL CATEGORIES
  // ============================================================

  const getCategoriesCount = () => {

    if (
      !Array.isArray(
        outlet?.categories
      )
    ) {

      return 0;

    }

    return outlet.categories.length;

  };


  // ============================================================
  // ACTIVE PRODUCTS
  // ============================================================

  const getActiveProductsCount = () => {

    if (
      !Array.isArray(
        outlet?.categories
      )
    ) {

      return 0;

    }


    return outlet.categories.reduce(
      (
        total,
        category
      ) => {

        if (
          !Array.isArray(
            category?.products
          )
        ) {

          return total;

        }


        const active =
          category.products.filter(
            (product) =>
              product?.isAvailable === true
          ).length;


        return total + active;

      },
      0
    );

  };


  // ============================================================
  // ADDRESS
  // ============================================================

  const getFullAddress = () => {

    const addressParts = [

      outlet?.buildingNumber,

      outlet?.road,

      outlet?.landmark,

      outlet?.areaName,

      outlet?.cityName,

      outlet?.stateName,

    ].filter(Boolean);


    if (
      addressParts.length === 0
    ) {

      return "-";

    }


    return addressParts.join(
      ", "
    );

  };


  // ============================================================
  // WORKING DAYS
  // ============================================================

  const days = [

    "Monday",

    "Tuesday",

    "Wednesday",

    "Thursday",

    "Friday",

    "Saturday",

    "Sunday",

  ];


  // ============================================================
  // FIND TIMING FOR DAY
  // ============================================================

  const getTimingForDay = (
    day
  ) => {

    if (
      !Array.isArray(
        outlet?.outletTimings
      )
    ) {

      return null;

    }


    return outlet.outletTimings.find(
      (timing) =>
        String(
          timing?.day
        ).toLowerCase() ===
        day.toLowerCase()
    );

  };


  // ============================================================
  // GOOGLE MAP URL
  // ============================================================

  const getMapUrl = () => {

    const latitude =
      outlet?.latitude;

    const longitude =
      outlet?.longitude;


    if (
      latitude === null ||
      latitude === undefined ||
      longitude === null ||
      longitude === undefined
    ) {

      return null;

    }


    return `https://www.google.com/maps?q=${latitude},${longitude}&output=embed`;

  };


  // ============================================================
  // TABS
  // ============================================================

  const tabs = [

    "Basic",

    "Foods",

    "Orders",

    "Promos",

    "Payouts",

    "Subscription History",

  ];


  // ============================================================
  // LOADING UI
  // ============================================================

  if (loading) {

    return (

      <div className="jippy-outlet-profile-page">

        <div className="jippy-outlet-profile-loading">

          <FiHome />

          <span>
            Loading outlet details...
          </span>

        </div>

      </div>

    );

  }


  // ============================================================
  // ERROR UI
  // ============================================================

  if (!outlet) {

    return (

      <div className="jippy-outlet-profile-page">

        <div className="jippy-outlet-profile-empty-tab">

          <FiHome />

          <h3>
            Outlet Details Not Found
          </h3>

          <p>
            {errorMessage ||
              "Unable to load outlet information."}
          </p>


          <button
            className="jippy-outlet-profile-back-btn"
            onClick={handleBack}
          >

            <FiArrowLeft />

            Back to Outlets

          </button>

        </div>

      </div>

    );

  }


  // ============================================================
  // RENDER
  // ============================================================

  return (

    <div className="jippy-outlet-profile-page">


      {/* ========================================================
          HEADER
      ======================================================== */}

      <div className="jippy-outlet-profile-header">

        <div className="jippy-outlet-profile-header-left">

          <div className="jippy-outlet-profile-title-row">

            <FiHome />

            <h1>
              {displayValue(
                outlet?.outletName,
                "Outlet Profile"
              )}
            </h1>

          </div>


          <div className="jippy-outlet-profile-breadcrumb">

            <span>
              Outlets
            </span>

            <span>
              /
            </span>

            <strong>
              {displayValue(
                outlet?.outletName
              )}
            </strong>

          </div>

        </div>


        <button
          className="jippy-outlet-profile-orange-btn"
          onClick={handleBack}
        >

          <FiArrowLeft />

          Back to Outlets

        </button>

      </div>


      {/* ========================================================
          TABS
      ======================================================== */}

      <div className="jippy-outlet-profile-tabs">

        {tabs.map((tab) => (

          <button
            key={tab}
            className={`jippy-outlet-profile-tab ${
              activeTab === tab
                ? "jippy-outlet-profile-tab-active"
                : ""
            }`}
            onClick={() =>
              setActiveTab(tab)
            }
          >

            {tab}

          </button>

        ))}

      </div>


      {/* ========================================================
          BASIC TAB
      ======================================================== */}

      {activeTab === "Basic" && (

        <>

          {/* ======================================================
              SUMMARY CARDS
          ====================================================== */}

          <div className="jippy-outlet-profile-summary-grid">


            {/* PRODUCTS */}

            <div className="jippy-outlet-profile-summary-card jippy-summary-blue">

              <div className="jippy-summary-content">

                <strong>
                  {getProductsCount()}
                </strong>

                <span>
                  Total Foods
                </span>

              </div>


              <div className="jippy-summary-icon">

                <FiShoppingBag />

              </div>

            </div>


            {/* CATEGORIES */}

            <div className="jippy-outlet-profile-summary-card jippy-summary-green">

              <div className="jippy-summary-content">

                <strong>
                  {getCategoriesCount()}
                </strong>

                <span>
                  Categories
                </span>

              </div>


              <div className="jippy-summary-icon">

                <FiPlus />

              </div>

            </div>


            {/* AVAILABLE */}

            <div className="jippy-outlet-profile-summary-card jippy-summary-pink">

              <div className="jippy-summary-content">

                <strong>
                  {getActiveProductsCount()}
                </strong>

                <span>
                  Available Foods
                </span>

              </div>


              <div className="jippy-summary-icon">

                <FiStar />

              </div>

            </div>


            {/* STATUS */}

            <div className="jippy-outlet-profile-summary-card jippy-summary-yellow">

              <div className="jippy-summary-content">

                <strong
                  className={
                    outlet?.isAvailable === false
                      ? "jippy-status-danger"
                      : "jippy-status-success"
                  }
                >

                  {outlet?.isAvailable === false
                    ? "Closed"
                    : "Open"}

                </strong>

                <span>
                  Outlet Status
                </span>

              </div>


              <div className="jippy-summary-icon">

                <FiClock />

              </div>

            </div>

          </div>


          {/* ======================================================
              OUTLET INFORMATION
          ====================================================== */}

          <div className="jippy-outlet-profile-main-card">

            <div className="jippy-outlet-profile-card-heading">

              <FiHome />

              <span>
                Outlet Information
              </span>

            </div>


            <div className="jippy-outlet-profile-details-grid">


              {/* OUTLET ID */}

              <div>

                <span>
                  Outlet ID
                </span>

                <strong>
                  {displayValue(
                    outlet?.outletId
                  )}
                </strong>

              </div>


              {/* OUTLET NAME */}

              <div>

                <span>
                  Outlet Name
                </span>

                <strong>
                  {displayValue(
                    outlet?.outletName
                  )}
                </strong>

              </div>


              {/* EMAIL */}

              <div>

                <span>
                  Email
                </span>

                <strong>
                  {displayValue(
                    outlet?.outletEmail
                  )}
                </strong>

              </div>


              {/* PHONE */}

              <div>

                <span>
                  Phone
                </span>

                <strong>
                  {displayValue(
                    outlet?.outletPhone
                  )}
                </strong>

              </div>


              {/* ALTERNATE PHONE */}

              <div>

                <span>
                  Alternate Phone
                </span>

                <strong>
                  {displayValue(
                    outlet?.alternateOutletPhone
                  )}
                </strong>

              </div>


              {/* CUISINE */}

              <div>

                <span>
                  Cuisine Types
                </span>

                <strong>
                  {getCuisine()}
                </strong>

              </div>


              {/* FAVOURITE */}

              <div>

                <span>
                  Favourite
                </span>

                <strong
                  className={
                    outlet?.isFavourite === true
                      ? "jippy-status-success"
                      : "jippy-status-neutral"
                  }
                >

                  {outlet?.isFavourite === true
                    ? "Yes"
                    : "No"}

                </strong>

              </div>


              {/* AVAILABILITY */}

              <div>

                <span>
                  Availability
                </span>

                <strong
                  className={
                    outlet?.isAvailable === false
                      ? "jippy-status-danger"
                      : "jippy-status-success"
                  }
                >

                  {outlet?.isAvailable === false
                    ? "Unavailable"
                    : "Available"}

                </strong>

              </div>


              {/* ADDRESS */}

              <div className="jippy-outlet-profile-address-full">

                <span>
                  Full Address
                </span>

                <strong>
                  {getFullAddress()}
                </strong>

              </div>

            </div>

          </div>


          {/* ======================================================
              CONTACT DETAILS
          ====================================================== */}

          <div className="jippy-outlet-profile-main-card">

            <div className="jippy-outlet-profile-card-heading">

              <FiUser />

              <span>
                Contact & Account Details
              </span>

            </div>


            <div className="jippy-outlet-profile-details-grid">


              <div>

                <span>
                  Email
                </span>

                <strong>
                  {displayValue(
                    outlet?.outletEmail
                  )}
                </strong>

              </div>


              <div>

                <span>
                  Phone Number
                </span>

                <strong>
                  {displayValue(
                    outlet?.outletPhone
                  )}
                </strong>

              </div>


              <div>

                <span>
                  Alternate Phone
                </span>

                <strong>
                  {displayValue(
                    outlet?.alternateOutletPhone
                  )}
                </strong>

              </div>


              <div>

                <span>
                  Account Number
                </span>

                <strong>
                  {displayValue(
                    outlet?.accountNumber
                  )}
                </strong>

              </div>


              <div>

                <span>
                  Account Holder
                </span>

                <strong>
                  {displayValue(
                    outlet?.accountHolderName
                  )}
                </strong>

              </div>


              <div>

                <span>
                  Bank Name
                </span>

                <strong>
                  {displayValue(
                    outlet?.bankName
                  )}
                </strong>

              </div>


              <div>

                <span>
                  IFSC Code
                </span>

                <strong>
                  {displayValue(
                    outlet?.ifscCode
                  )}
                </strong>

              </div>


              <div>

                <span>
                  City ID
                </span>

                <strong>
                  {displayValue(
                    outlet?.cityId
                  )}
                </strong>

              </div>

            </div>

          </div>


          {/* ======================================================
              LOCATION + MAP
          ====================================================== */}

          <div className="jippy-outlet-profile-location-layout">


            {/* LOCATION DETAILS */}

            <div className="jippy-outlet-profile-main-card jippy-location-details-card">

              <div className="jippy-outlet-profile-card-heading">

                <FiMapPin />

                <span>
                  Location Details
                </span>

              </div>


              <div className="jippy-outlet-profile-details-grid">


                <div>

                  <span>
                    Building Number
                  </span>

                  <strong>
                    {displayValue(
                      outlet?.buildingNumber
                    )}
                  </strong>

                </div>


                <div>

                  <span>
                    Road
                  </span>

                  <strong>
                    {displayValue(
                      outlet?.road
                    )}
                  </strong>

                </div>


                <div>

                  <span>
                    Landmark
                  </span>

                  <strong>
                    {displayValue(
                      outlet?.landmark
                    )}
                  </strong>

                </div>


                <div>

                  <span>
                    Area
                  </span>

                  <strong>
                    {displayValue(
                      outlet?.areaName
                    )}
                  </strong>

                </div>


                <div>

                  <span>
                    Area ID
                  </span>

                  <strong>
                    {displayValue(
                      outlet?.areaId
                    )}
                  </strong>

                </div>


                <div>

                  <span>
                    City
                  </span>

                  <strong>
                    {displayValue(
                      outlet?.cityName
                    )}
                  </strong>

                </div>


                <div>

                  <span>
                    City ID
                  </span>

                  <strong>
                    {displayValue(
                      outlet?.cityId
                    )}
                  </strong>

                </div>


                <div>

                  <span>
                    State
                  </span>

                  <strong>
                    {displayValue(
                      outlet?.stateName
                    )}
                  </strong>

                </div>


                <div>

                  <span>
                    State ID
                  </span>

                  <strong>
                    {displayValue(
                      outlet?.stateId
                    )}
                  </strong>

                </div>


                <div>

                  <span>
                    Latitude
                  </span>

                  <strong>
                    {displayValue(
                      outlet?.latitude
                    )}
                  </strong>

                </div>


                <div>

                  <span>
                    Longitude
                  </span>

                  <strong>
                    {displayValue(
                      outlet?.longitude
                    )}
                  </strong>

                </div>

              </div>

            </div>


            {/* MAP */}

            <div className="jippy-outlet-profile-map-card">

              <div className="jippy-outlet-profile-map-header">

                <span>
                  Location Map
                </span>


                {outlet?.latitude &&
                outlet?.longitude ? (

                  <a
                    href={`https://www.google.com/maps?q=${outlet.latitude},${outlet.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >

                    <FiNavigation />

                    Open in Maps

                  </a>

                ) : null}

              </div>


              <div className="jippy-outlet-profile-map">

                {getMapUrl() ? (

                  <iframe
                    title="Outlet Location"
                    src={getMapUrl()}
                    loading="lazy"
                  />

                ) : (

                  <div className="jippy-outlet-profile-map-empty">

                    <FiMapPin />

                    <span>
                      Location coordinates
                      are not available
                    </span>

                  </div>

                )}

              </div>

            </div>

          </div>


          {/* ======================================================
              WORKING HOURS
          ====================================================== */}

          <div className="jippy-outlet-profile-main-card">

            <div className="jippy-outlet-profile-card-heading">

              <FiClock />

              <span>
                Working Hours
              </span>

            </div>


            <div className="jippy-outlet-profile-hours-grid">

              {days.map((day) => {

                const timing =
                  getTimingForDay(
                    day
                  );


                return (

                  <div
                    key={day}
                  >

                    <strong>
                      {day}
                    </strong>


                    {timing ? (

                      <span
                        className={
                          timing?.isOpen === false
                            ? "jippy-status-danger"
                            : "jippy-status-success"
                        }
                      >

                        {timing?.isOpen === false

                          ? "Closed"

                          : `${formatTime(
                              timing?.openingTime
                            )} - ${formatTime(
                              timing?.closingTime
                            )}`}

                      </span>

                    ) : (

                      <span>
                        Not configured
                      </span>

                    )}

                  </div>

                );

              })}

            </div>

          </div>

        </>

      )}


      {/* ========================================================
          FOODS TAB
      ======================================================== */}

      {activeTab === "Foods" && (

        <div className="jippy-outlet-profile-main-card">

          <div className="jippy-outlet-profile-card-heading">

            <FiShoppingBag />

            <span>
              Outlet Foods
            </span>

          </div>


          <OutletFoods
            categories={
              Array.isArray(
                outlet?.categories
              )
                ? outlet.categories
                : []
            }
            outlet={outlet}
          />

        </div>

      )}


      {/* ========================================================
          ORDERS TAB
      ======================================================== */}

      {activeTab === "Orders" && (

        <div className="jippy-outlet-profile-empty-tab">

          <FiShoppingBag />

          <h3>
            Orders
          </h3>

          <p>
            Order information will be
            displayed here.
          </p>

        </div>

      )}


      {/* ========================================================
          PROMOS TAB
      ======================================================== */}

      {activeTab === "Promos" && (

        <div className="jippy-outlet-profile-empty-tab">

          <FiStar />

          <h3>
            Promotions
          </h3>

          <p>
            Promotion information will be
            displayed here.
          </p>

        </div>

      )}


      {/* ========================================================
          PAYOUTS TAB
      ======================================================== */}

      {activeTab === "Payouts" && (

        <div className="jippy-outlet-profile-empty-tab">

          <FiCreditCard />

          <h3>
            Payouts
          </h3>

          <p>
            Payout information will be
            displayed here.
          </p>

        </div>

      )}


      {/* ========================================================
          SUBSCRIPTION HISTORY TAB
          
          IMPORTANT:
          DO NOT use subscription here.
          OutletSubscriptionHistory handles
          the subscription API and UI itself.
      ======================================================== */}

      {activeTab === "Subscription History" && (

        <div className="jippy-outlet-profile-main-card">

          <div className="jippy-outlet-profile-card-heading">

            <FiCreditCard />

            <span>
              Subscription History
            </span>

          </div>


          <OutletSubscriptionHistory
            outletId={
              outlet?.outletId ||
              getCurrentOutletId()
            }
          />

        </div>

      )}


      {/* ========================================================
          BOTTOM BACK BUTTON
      ======================================================== */}

      <div className="jippy-outlet-profile-bottom-actions">

        {/* <button
          className="jippy-outlet-profile-back-btn"
          onClick={handleBack}
        >

          <FiArrowLeft />

          Back to Outlets

        </button> */}

      </div>

    </div>

  );

}


export default OutletProfileDetails;