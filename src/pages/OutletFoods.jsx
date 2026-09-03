import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import "../styles/OutletFoods.css";

import {
  getOutletDetails,
  setProductUnavailable,
  restoreProductUnavailable,
} from "../services/outletListService";

import {
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiShoppingBag,
} from "react-icons/fi";

function OutletFoods({
  outlet: outletFromParent,
  categories: categoriesFromParent,
  setActivePage,
}) {
  // ============================================================
  // STATE
  // ============================================================

  const [selectedFood, setSelectedFood] = useState(null);

  const [foodAvailabilityMode, setFoodAvailabilityMode] =
  useState("create");

  const [foodAvailabilityModal, setFoodAvailabilityModal] =
    useState(false);

  const [foodUnavailabilityForm, setFoodUnavailabilityForm] =
    useState({
      fromDate: "",
      toDate: "",
      reason: "",
    });



  const [savingFoodAvailability, setSavingFoodAvailability] =
    useState(false);

  const [foodUnavailabilityData, setFoodUnavailabilityData] =
    useState({});

  const [expandedFoodId, setExpandedFoodId] = useState(null);

  const [outlet, setOutlet] = useState(
    outletFromParent || null
  );

  const [loading, setLoading] = useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [foodSearch, setFoodSearch] =
    useState("");

  const [foodEntries, setFoodEntries] =
    useState(10);

  const [foodPage, setFoodPage] =
    useState(1);

  // ============================================================
  // GET SELECTED OUTLET ID
  // ============================================================

  const getCurrentOutletId = () => {
    try {
      const storedOutlet =
        sessionStorage.getItem(
          "selectedOutlet"
        );

      if (!storedOutlet) {
        console.error(
          "No selectedOutlet found in sessionStorage"
        );

        return null;
      }

      const selectedOutlet =
        JSON.parse(storedOutlet);

      const outletId =
        selectedOutlet?.outletId ??
        selectedOutlet?.id;

      console.log(
        "OutletFoods - Selected Outlet:",
        selectedOutlet
      );

      console.log(
        "OutletFoods - Outlet ID:",
        outletId
      );

      return outletId
        ? Number(outletId)
        : null;
    } catch (error) {
      console.error(
        "Failed to read selected outlet:",
        error
      );

      return null;
    }
  };

  // ============================================================
  // LOAD OUTLET DETAILS + FOODS
  // ============================================================

  useEffect(() => {
    const loadFoods = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const outletId =
          Number(
            outletFromParent?.outletId ??
              getCurrentOutletId()
          ) || getCurrentOutletId();

        if (!outletId) {
          setErrorMessage(
            "Outlet ID not found. Please select an outlet again."
          );

          return;
        }

        console.log(
          "=========================================="
        );

        console.log(
          "OutletFoods - Fetching food details"
        );

        console.log(
          "Outlet ID:",
          outletId
        );

        console.log(
          "User Type: merchant"
        );

        console.log(
          "Endpoint:",
          "/api/fm/outlets/getOutletDetails"
        );

        console.log(
          "=========================================="
        );

        const response =
          await getOutletDetails(
            outletId,
            "merchant"
          );

        console.log(
          "OutletFoods - Complete API Response:",
          response
        );

        if (!response) {
          setErrorMessage(
            "No outlet data received from server."
          );

          return;
        }

        // ============================================================
        // RESTORE SAVED FOOD UNAVAILABILITY AFTER REFRESH
        // ============================================================

        const savedFoodUnavailability =
          JSON.parse(
            localStorage.getItem(
              "jippy_food_unavailability"
            ) || "{}"
          );

        setFoodUnavailabilityData(
          savedFoodUnavailability
        );

        const restoredResponse = {
          ...response,

          categories:
            response.categories?.map(
              (category) => ({
                ...category,

                products:
                  category.products?.map(
                    (product) => {
                      const saved =
                        savedFoodUnavailability[
                          product?.productId
                        ];

                      if (saved) {
                        return {
                          ...product,
                          isToggle: false,
                        };
                      }

                      return product;
                    }
                  ),
              })
            ),
        };

        setOutlet(
          restoredResponse
        );

      } catch (error) {
        console.error(
          "OutletFoods - Failed to load foods:",
          error
        );

        const status =
          error?.response?.status;

        if (status === 401) {
          setErrorMessage(
            "Unauthorized. Please login again."
          );
        } else if (status === 404) {
          setErrorMessage(
            "Outlet details were not found."
          );
        } else {
          setErrorMessage(
            "Failed to load outlet foods."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    loadFoods();
  }, [
    outletFromParent?.outletId,
  ]);

// ============================================================
// FOOD AVAILABILITY TOGGLE
// ============================================================

const handleFoodAvailabilityToggle = (food) => {
  if (!food?.productId) {
    return;
  }

  // ON → OFF
  // Open normal unavailability form
  if (isTrue(food?.isToggle)) {
    setSelectedFood(food);

    setFoodAvailabilityMode("create");

    setFoodUnavailabilityForm({
      fromDate: "",
      toDate: "",
      reason: "",
    });

    setFoodAvailabilityModal(true);

    return;
  }

  // OFF → ON
  // Open restore confirmation
  setSelectedFood(food);

  setFoodAvailabilityMode("restore");

  setFoodAvailabilityModal(true);
};

// ============================================================
// CONFIRM FOOD RESTORE
// OFF → ON
// ============================================================

const handleConfirmFoodRestore = async () => {
  if (!selectedFood?.productId) {
    return;
  }

  try {
    setSavingFoodAvailability(true);

    console.log(
      "RESTORING FOOD:",
      selectedFood.productId
    );

    // ============================================================
    // CALL PATCH RESTORE API
    // ============================================================

    const response = await restoreProductUnavailable(
      selectedFood.productId,
      "stock restored"
    );

    console.log(
      "FOOD RESTORE RESPONSE:",
      response
    );

    // ============================================================
    // ONLY AFTER API SUCCESS → TURN FOOD ON
    // ============================================================

    setOutlet((previous) => ({
      ...previous,

      categories:
        previous.categories?.map(
          (category) => ({
            ...category,

            products:
              category.products?.map(
                (product) =>
                  Number(product.productId) ===
                  Number(selectedFood.productId)
                    ? {
                        ...product,
                        isToggle: true,
                      }
                    : product
              ),
          })
        ),
    }));

    // ============================================================
    // REMOVE SAVED UNAVAILABILITY DETAILS
    // ============================================================

    setFoodUnavailabilityData(
      (previous) => {
        const updated = {
          ...previous,
        };

        delete updated[
          selectedFood.productId
        ];

        localStorage.setItem(
          "jippy_food_unavailability",
          JSON.stringify(updated)
        );

        return updated;
      }
    );

    // ============================================================
    // CLOSE POPUP
    // ============================================================

    setFoodAvailabilityModal(false);

    setSelectedFood(null);

    // Close expanded unavailability details
    setExpandedFoodId(null);

  } catch (error) {
    console.error(
      "Failed to restore food availability:",
      error
    );

    alert(
      error?.response?.data?.message ||
        "Failed to restore food availability."
    );
  } finally {
    setSavingFoodAvailability(false);
  }
};

  // ============================================================
  // CONFIRM FOOD UNAVAILABILITY
  // ============================================================

  const handleConfirmFoodUnavailability =
    async () => {
      if (!selectedFood?.productId) return;

      const {
        fromDate,
        toDate,
        reason,
      } = foodUnavailabilityForm;

      // ============================================================
      // VALIDATION
      // ============================================================

      if (
        !fromDate ||
        !toDate ||
        !reason.trim()
      ) {
        alert(
          "Please select From Date, To Date and Reason."
        );

        return;
      }

      if (
        new Date(toDate) <=
        new Date(fromDate)
      ) {
        alert(
          "To Date & Time must be after From Date & Time."
        );

        return;
      }

      try {
        setSavingFoodAvailability(
          true
        );

        // ============================================================
        // CALL PRODUCT UNAVAILABILITY API
        // ============================================================

        const response =
          await setProductUnavailable(
            selectedFood.productId,
            fromDate,
            toDate,
            reason.trim()
          );

        console.log(
          "PRODUCT UNAVAILABILITY RESPONSE:",
          response
        );

        // ============================================================
        // SAVE UNAVAILABILITY DETAILS
        // ============================================================

        const newUnavailability = {
          productId:
            selectedFood.productId,

          fromDate,

          toDate,

          reason:
            reason.trim(),

          markedOn:
            response?.timestamp ||
            new Date().toISOString(),
        };

        setFoodUnavailabilityData(
          (previous) => {
            const updated = {
              ...previous,

              [selectedFood.productId]:
                newUnavailability,
            };

            localStorage.setItem(
              "jippy_food_unavailability",
              JSON.stringify(
                updated
              )
            );

            return updated;
          }
        );

        // ============================================================
        // MARK PRODUCT TOGGLE OFF
        // ============================================================

        setOutlet((previous) => ({
          ...previous,

          categories:
            previous.categories?.map(
              (category) => ({
                ...category,

                products:
                  category.products?.map(
                    (product) =>
                      Number(
                        product.productId
                      ) ===
                      Number(
                        selectedFood.productId
                      )
                        ? {
                            ...product,
                            isToggle:
                              false,
                          }
                        : product
                  ),
              })
            ),
        }));

        // ============================================================
        // OPEN EXPANDED UNAVAILABILITY ROW
        // ============================================================

        setExpandedFoodId(
          Number(
            selectedFood.productId
          )
        );

        // Close modal
        setFoodAvailabilityModal(
          false
        );

        setSelectedFood(null);

      } catch (error) {
        console.error(
          "Failed to mark food unavailable:",
          error
        );

        alert(
          error?.response?.data
            ?.message ||
            "Failed to mark food unavailable."
        );
      } finally {
        setSavingFoodAvailability(
          false
        );
      }
    };

  // ============================================================
  // FLATTEN CATEGORIES -> PRODUCTS
  // ============================================================

  const allFoods = useMemo(() => {
    if (!outlet) {
      return [];
    }

    const categories =
      Array.isArray(
        outlet.categories
      )
        ? outlet.categories
        : Array.isArray(
            categoriesFromParent
          )
        ? categoriesFromParent
        : [];

    if (categories.length === 0) {
      return [];
    }

    return categories.flatMap(
      (category) => {
        const products =
          Array.isArray(
            category?.products
          )
            ? category.products
            : [];

        return products.map(
          (product) => ({
            ...product,

            categoryId:
              product?.categoryId ??
              category?.categoryId ??
              null,

            categoryName:
              product?.categoryName ??
              category?.categoryName ??
              "-",
          })
        );
      }
    );
  }, [
    outlet,
    categoriesFromParent,
  ]);

  // ============================================================
  // SEARCH / FILTER
  // ============================================================

  const filteredFoods = useMemo(() => {
    const search =
      foodSearch
        .trim()
        .toLowerCase();

    if (!search) {
      return allFoods;
    }

    return allFoods.filter(
      (food) => {
        const productId =
          String(
            food?.productId ?? ""
          ).toLowerCase();

        const productName =
          String(
            food?.productName ?? ""
          ).toLowerCase();

        const description =
          String(
            food?.description ?? ""
          ).toLowerCase();

        const categoryName =
          String(
            food?.categoryName ?? ""
          ).toLowerCase();

        return (
          productId.includes(
            search
          ) ||
          productName.includes(
            search
          ) ||
          description.includes(
            search
          ) ||
          categoryName.includes(
            search
          )
        );
      }
    );
  }, [
    allFoods,
    foodSearch,
  ]);

  // ============================================================
  // PAGINATION
  // ============================================================

  const totalFoods =
    filteredFoods.length;

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        totalFoods /
          foodEntries
      )
    );

  const safePage =
    Math.min(
      foodPage,
      totalPages
    );

  const startIndex =
    (safePage - 1) *
    foodEntries;

  const displayedFoods =
    filteredFoods.slice(
      startIndex,
      startIndex +
        foodEntries
    );

  // ============================================================
  // RESET PAGE
  // ============================================================

  useEffect(() => {
    setFoodPage(1);
  }, [
    foodSearch,
    foodEntries,
  ]);

  // ============================================================
  // FORMAT PRICE
  // ============================================================

  const formatPrice = (
    value
  ) => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "-";
    }

    const number =
      Number(value);

    if (
      Number.isNaN(number)
    ) {
      return String(value);
    }

    return `₹${number.toFixed(
      2
    )}`;
  };

  // ============================================================
  // FORMAT TIME
  // ============================================================

  const formatTime = (
    time
  ) => {
    if (!time) {
      return "-";
    }

    return String(time)
      .substring(0, 5);
  };

  // ============================================================
  // BOOLEAN FORMAT
  // ============================================================

  const isTrue = (
    value
  ) => {
    return (
      value === true ||
      value === "true" ||
      value === "TRUE" ||
      value === "Y" ||
      value === "Yes" ||
      value === 1
    );
  };

  // ============================================================
  // PRODUCT TIMINGS
  // ============================================================

  const renderProductTimings = (
    productTimings
  ) => {
    if (
      !Array.isArray(
        productTimings
      ) ||
      productTimings.length === 0
    ) {
      return (
        <span className="jippy-outlet-foods-no-timing">
          No timings
        </span>
      );
    }

    return (
      <div className="jippy-outlet-foods-timings">
        {productTimings.map(
          (
            timing,
            index
          ) => (
            <div
              key={`${timing?.day || "day"}-${index}`}
              className="jippy-outlet-foods-timing-row"
            >
              <strong>
                {timing?.day ||
                  "-"}
              </strong>

              <span>
                {formatTime(
                  timing?.startTime
                )}
                {" - "}
                {formatTime(
                  timing?.endTime
                )}
              </span>
            </div>
          )
        )}
      </div>
    );
  };

  // ============================================================
  // VARIANTS
  // ============================================================

  const renderVariants = (
    food
  ) => {
    const variants =
      Array.isArray(
        food?.variants
      )
        ? food.variants
        : [];

    if (
      isTrue(
        food?.hasProductVariants
      )
    ) {
      return (
        <span className="jippy-food-variant">
          Yes
          {variants.length > 0
            ? ` (${variants.length})`
            : ""}
        </span>
      );
    }

    return (
      <span className="jippy-food-no-variant">
        No
      </span>
    );
  };

  // ============================================================
  // BACK
  // ============================================================

  const handleBack = () => {
    if (setActivePage) {
      setActivePage(
        "allOutletsList"
      );
    }
  };

  // ============================================================
  // PREVIOUS PAGE
  // ============================================================

  const handlePrevious = () => {
    setFoodPage(
      (previous) =>
        Math.max(
          1,
          previous - 1
        )
    );
  };

  // ============================================================
  // NEXT PAGE
  // ============================================================

  const handleNext = () => {
    setFoodPage(
      (previous) =>
        Math.min(
          totalPages,
          previous + 1
        )
    );
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="jippy-outlet-foods-page">

        <div className="jippy-outlet-foods-loading">

          <div className="jippy-outlet-foods-loader" />

          <p>
            Loading foods...
          </p>

        </div>
      </div>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (errorMessage) {
    return (
      <div className="jippy-outlet-foods-page">

        <div className="jippy-outlet-foods-error">

          <h3>
            Unable to load foods
          </h3>

          <p>
            {errorMessage}
          </p>

          <button
            type="button"
            onClick={
              handleBack
            }
            className="jippy-outlet-foods-back-btn"
          >
            <FiChevronLeft />

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
    <div className="jippy-outlet-foods-page">

      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

      <div className="jippy-outlet-foods-page-header">

        <div>

          <h2>
            Foods
          </h2>

          <p>
            Food items available
            in this outlet
          </p>

        </div>

        <div className="jippy-outlet-foods-count-badge">
          {allFoods.length} Foods
        </div>

      </div>

      {/* ======================================================
          TABLE CARD
      ====================================================== */}

      <div className="jippy-outlet-foods-card">

        {/* ====================================================
            CONTROLS
        ==================================================== */}

        <div className="jippy-outlet-foods-controls">

          <div className="jippy-outlet-foods-entries">

            <span>
              Show
            </span>

            <select
              value={
                foodEntries
              }
              onChange={(
                event
              ) =>
                setFoodEntries(
                  Number(
                    event.target
                      .value
                  )
                )
              }
            >

              <option value={10}>
                10
              </option>

              <option value={25}>
                25
              </option>

              <option value={50}>
                50
              </option>

              <option value={100}>
                100
              </option>

            </select>

            <span>
              entries
            </span>

          </div>

          <div className="jippy-outlet-foods-search">

            <div className="jippy-outlet-foods-search-box">

              <input
                type="text"
                value={
                  foodSearch
                }
                placeholder="Search food name, category..."
                onChange={(
                  event
                ) =>
                  setFoodSearch(
                    event.target
                      .value
                  )
                }
              />

              <FiSearch />

            </div>

          </div>

        </div>

        {/* ====================================================
            TABLE
        ==================================================== */}

        <div className="jippy-outlet-foods-table-wrapper">

          <table className="jippy-outlet-foods-table">

            <thead>

              <tr>

                <th className="food-expand-header">
                </th>

                <th>
                  Product ID
                </th>

                <th>
                  Food Name
                </th>

                <th>
                  Category
                </th>

                <th className="jippy-outlet-foods-description-column">
                  Description
                </th>

                <th>
                  Merchant Price
                </th>

                <th>
                  Online Price
                </th>

                <th>
                  Veg
                </th>

                <th>
                  Product Variants
                </th>

                <th>
                 isToggle
                </th>

                <th>
                  Product Timings
                </th>

              </tr>

            </thead>

            <tbody>

              {displayedFoods.length >
              0 ? (

                displayedFoods.map(
                  (
                    food,
                    index
                  ) => {

                    const productId =
                      food?.productId ??
                      index;

                    const isExpanded =
                      Number(
                        expandedFoodId
                      ) ===
                      Number(
                        productId
                      );

                    const unavailable =
                      !isTrue(
                        food?.isToggle
                      );

                    return (
                      <React.Fragment
                        key={
                          productId
                        }
                      >

                        {/* ==================================================
                            NORMAL FOOD ROW
                        ================================================== */}

                        <tr>

                          {/* EXPAND */}

                          <td>

                            <button
                              type="button"
                              className="food-expand-btn"
                              onClick={() =>
                                setExpandedFoodId(
                                  isExpanded
                                    ? null
                                    : productId
                                )
                              }
                            >
                              {isExpanded
                                ? "−"
                                : "+"}
                            </button>

                          </td>

                          {/* PRODUCT ID */}

                          <td>

                            <span className="jippy-food-product-id">

                              {food?.productId ??
                                "-"}

                            </span>

                          </td>

                          {/* FOOD NAME */}

                          <td>

                            <strong className="jippy-food-name">

                              {food?.productName ??
                                "-"}

                            </strong>

                          </td>

                          {/* CATEGORY */}

                          <td>

                            <span className="jippy-food-category">

                              {food?.categoryName ??
                                "-"}

                            </span>

                          </td>

                          {/* DESCRIPTION */}

                          <td className="jippy-outlet-foods-description">

                            {food?.description ??
                              "-"}

                          </td>

                          {/* MERCHANT PRICE */}

                          <td>

                            <span className="jippy-food-price">

                              {formatPrice(
                                food?.merchantPrice
                              )}

                            </span>

                          </td>

                          {/* ONLINE PRICE */}

                          <td>

                            <span className="jippy-food-online-price">

                              {formatPrice(
                                food?.onlinePrice
                              )}

                            </span>

                          </td>

                          {/* VEG */}

                          <td>

                            {isTrue(
                              food?.isVeg
                            ) ? (

                              <span className="jippy-food-veg">
                                VEG
                              </span>

                            ) : (

                              <span className="jippy-food-nonveg">
                                NON-VEG
                              </span>

                            )}

                          </td>

                          {/* VARIANTS */}

                          <td>

                            {renderVariants(
                              food
                            )}

                          </td>

                          {/* AVAILABLE */}

                          <td>

                            <button
                              type="button"
                              className={`jippy-food-availability-toggle ${
                                isTrue(
                                  food?.isToggle
                                )
                                  ? "jippy-food-toggle-on"
                                  : "jippy-food-toggle-off"
                              }`}
                              onClick={() =>
                                handleFoodAvailabilityToggle(
                                  food
                                )
                              }
                              disabled={
                                savingFoodAvailability
                              }
                              aria-label={
                                isTrue(
                                  food?.isToggle
                                )
                                  ? "Mark food unavailable"
                                  : "Mark food available"
                              }
                            >

                              <span className="jippy-food-toggle-knob" />

                            </button>

                          </td>

                          {/* PRODUCT TIMINGS */}

                          <td>

                            {renderProductTimings(
                              food?.productTimings
                            )}

                          </td>

                        </tr>

                        {/* ==================================================
                            FOOD UNAVAILABILITY EXPANDED ROW

                            DETAILS SHOWN ONLY WHEN:
                            1. FOOD IS UNAVAILABLE
                            2. USER CLICKED EXPAND
                        ================================================== */}

                        {isExpanded &&
                          unavailable &&
                          foodUnavailabilityData[
                            food?.productId
                          ] && (

                            <tr className="food-expanded-row">

                              <td
                                colSpan={11}
                                className="jippy-food-expanded-cell"
                              >

                                <div className="jippy-food-unavailability-card">

                                  {/* HEADER */}

                                  <div className="jippy-food-unavailability-heading">

                                    <div>

                                      <strong>
                                        Food Unavailability
                                      </strong>

                                      <span>
                                        {" "}
                                        (Currently
                                        Unavailable)
                                      </span>

                                    </div>

                                    {/* <button
                                      type="button"
                                      className="jippy-edit-unavailability-btn"
                                      onClick={() => {

                                        const saved =
                                          foodUnavailabilityData[
                                            food?.productId
                                          ];

                                        setSelectedFood(
                                          food
                                        );

                                        setFoodUnavailabilityForm(
                                          {
                                            fromDate:
                                              saved?.fromDate ||
                                              "",

                                            toDate:
                                              saved?.toDate ||
                                              "",

                                            reason:
                                              saved?.reason ||
                                              "",
                                          }
                                        );

                                        setFoodAvailabilityModal(
                                          true
                                        );

                                      }}
                                    >

                                      Edit Unavailability

                                    </button> */}
<button
  type="button"
  className="jippy-edit-unavailability-btn"
  onClick={() => {
    const saved =
      foodUnavailabilityData[
        food?.productId
      ];

    setSelectedFood(food);

    setFoodUnavailabilityForm({
      fromDate:
        saved?.fromDate || "",

      toDate:
        saved?.toDate || "",

      reason:
        saved?.reason || "",
    });

    // IMPORTANT:
    // Edit must open the form, NOT restore popup
    setFoodAvailabilityMode("edit");

    setFoodAvailabilityModal(true);
  }}
>
  Edit Unavailability
</button>

                                  </div>

                                  {/* HORIZONTAL DETAILS */}

                                  <div
                                    className="jippy-food-unavailability-content"
                                    style={{
                                      display: "grid",
                                      gridTemplateColumns:
                                        "repeat(4, minmax(0, 1fr))",
                                      gap: "24px",
                                      alignItems: "start",
                                      width: "100%",
                                    }}
                                  >

                                    {/* FROM */}

                                    <div className="jippy-unavailability-info">

                                      <span>
                                        From Date & Time
                                      </span>

                                      <strong>
                                        {
                                          foodUnavailabilityData[
                                            food?.productId
                                          ]?.fromDate ||
                                          "-"
                                        }
                                      </strong>

                                    </div>

                                    {/* TO */}

                                    <div className="jippy-unavailability-info">

                                      <span>
                                        To Date & Time
                                      </span>

                                      <strong>
                                        {
                                          foodUnavailabilityData[
                                            food?.productId
                                          ]?.toDate ||
                                          "-"
                                        }
                                      </strong>

                                    </div>

                                    {/* REASON */}

                                    <div className="jippy-unavailability-info">

                                      <span>
                                        Reason
                                      </span>

                                      <strong>
                                        {
                                          foodUnavailabilityData[
                                            food?.productId
                                          ]?.reason ||
                                          "-"
                                        }
                                      </strong>

                                    </div>

                                    {/* MARKED ON */}

                                    <div className="jippy-unavailability-info">

                                      <span>
                                        Marked On
                                      </span>

                                      <strong>
                                        {
                                          foodUnavailabilityData[
                                            food?.productId
                                          ]?.markedOn ||
                                          "-"
                                        }
                                      </strong>

                                    </div>

                                  </div>

                                </div>

                              </td>

                            </tr>

                          )}

                      </React.Fragment>
                    );
                  }
                )

              ) : (

                <tr>

                  <td
                    colSpan={11}
                    className="jippy-outlet-foods-empty"
                  >

                    <FiShoppingBag />

                    <div>
                      No food items found
                    </div>

                    {foodSearch && (

                      <small>
                        Try another search
                        term.
                      </small>

                    )}

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

        {/* ====================================================
            PAGINATION
        ==================================================== */}

        <div className="jippy-outlet-foods-pagination">

          <div className="jippy-outlet-foods-showing">

            {totalFoods > 0
              ? `Showing ${
                  startIndex + 1
                } to ${Math.min(
                  startIndex +
                    foodEntries,
                  totalFoods
                )} of ${totalFoods} entries`
              : "Showing 0 entries"}

          </div>

          <div className="jippy-outlet-foods-pagination-controls">

            <button
              type="button"
              onClick={
                handlePrevious
              }
              disabled={
                safePage === 1
              }
              title="Previous"
            >

              <FiChevronLeft />

            </button>

            <span>

              Page {safePage} of{" "}
              {totalPages}

            </span>

            <button
              type="button"
              onClick={
                handleNext
              }
              disabled={
                safePage ===
                totalPages
              }
              title="Next"
            >

              <FiChevronRight />

            </button>

          </div>

        </div>

      </div>

      {/* ======================================================
          BACK BUTTON
      ====================================================== */}

      <div className="jippy-outlet-foods-bottom">

        {/* <button
          type="button"
          className="jippy-outlet-foods-back-btn"
          onClick={
            handleBack
          }
        >
          <FiChevronLeft />
          Back to Outlets
        </button> */}

      </div>

      {/* ======================================================
          FOOD UNAVAILABILITY MODAL
      ====================================================== */}

      {foodAvailabilityModal && (
  <div className="jippy-food-unavailability-overlay">

    <div className="jippy-food-unavailability-modal">

      {/* ======================================================
          OFF → ON : RESTORE CONFIRMATION
      ====================================================== */}

{foodAvailabilityMode === "restore" ? (

        <>
          <div className="jippy-food-unavailability-header">

            <div>

              <h3>
                Make Food Available
              </h3>

              <p>
                {selectedFood?.productName || "-"}
              </p>

            </div>

            <button
              type="button"
              className="jippy-food-unavailability-close"
              onClick={() => {
                setFoodAvailabilityModal(false);
                setSelectedFood(null);
              }}
            >
              ×
            </button>

          </div>


          <div className="jippy-food-unavailability-info">

            This food is currently unavailable.
            Do you want to make this food available again?

          </div>


          <div className="jippy-food-unavailability-modal-actions">

            <button
              type="button"
              className="jippy-food-unavailability-cancel-btn"
              onClick={() => {
                setFoodAvailabilityModal(false);
                setSelectedFood(null);
              }}
            >
              Cancel
            </button>


            <button
              type="button"
              className="jippy-food-unavailability-confirm-btn"
              onClick={handleConfirmFoodRestore}
              disabled={savingFoodAvailability}
            >
              {savingFoodAvailability
                ? "Restoring..."
                : "Confirm & Turn ON"}
            </button>

          </div>

        </>

      ) : (

        /* ======================================================
           ON → OFF : YOUR EXISTING POPUP
           KEEP THIS PART EXACTLY AS YOUR CURRENT CODE
        ====================================================== */

        <>
          <div className="jippy-food-unavailability-header">

            <div>

              <h3>
                Mark Food as Unavailable
              </h3>

              <p>
                {selectedFood?.productName || "-"}
              </p>

            </div>

            <button
              type="button"
              className="jippy-food-unavailability-close"
              onClick={() => {
                setFoodAvailabilityModal(false);
                setSelectedFood(null);
              }}
            >
              ×
            </button>

          </div>


          <div className="jippy-food-unavailability-info">

            Please select the unavailability period and
            reason. This food will be unavailable during
            this time.

          </div>


          <div className="jippy-food-unavailability-grid">

            <div>

              <label>
                From Date & Time *
              </label>

              <input
                type="datetime-local"
                value={
                  foodUnavailabilityForm.fromDate
                }
                onChange={(e) =>
                  setFoodUnavailabilityForm(
                    (previous) => ({
                      ...previous,
                      fromDate:
                        e.target.value,
                    })
                  )
                }
              />

            </div>


            <div>

              <label>
                To Date & Time *
              </label>

              <input
                type="datetime-local"
                value={
                  foodUnavailabilityForm.toDate
                }
                onChange={(e) =>
                  setFoodUnavailabilityForm(
                    (previous) => ({
                      ...previous,
                      toDate:
                        e.target.value,
                    })
                  )
                }
              />

            </div>

          </div>


          <div className="jippy-food-unavailability-field">

            <label>
              Reason *
            </label>

            <textarea
              value={
                foodUnavailabilityForm.reason
              }
              onChange={(e) =>
                setFoodUnavailabilityForm(
                  (previous) => ({
                    ...previous,
                    reason:
                      e.target.value,
                  })
                )
              }
              placeholder="Enter reason for food unavailability"
              rows={4}
            />

          </div>


          <div className="jippy-food-unavailability-modal-actions">

            <button
              type="button"
              className="jippy-food-unavailability-cancel-btn"
              onClick={() => {
                setFoodAvailabilityModal(false);
                setSelectedFood(null);
              }}
            >
              Cancel
            </button>


            <button
              type="button"
              className="jippy-food-unavailability-confirm-btn"
              onClick={
                handleConfirmFoodUnavailability
              }
              disabled={
                savingFoodAvailability
              }
            >
              {savingFoodAvailability
                ? "Saving..."
                : "Confirm & Turn OFF"}
            </button>

          </div>

                </>

          )}
    </div>
  </div>
)}
</div>

  );
}

export default OutletFoods;