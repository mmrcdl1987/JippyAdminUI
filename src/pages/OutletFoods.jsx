import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import "../styles/OutletFoods.css";

import {
  getOutletDetails,
} from "../services/outletListService";
import { getProductDetailById } from "../services/productDetailService";
import AddToOutletProducts from "./AddToOutletProducts";

import {
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiShoppingBag,
  FiLayers,
  FiX,
  FiEdit2,
} from "react-icons/fi";

function OutletFoods({
  outlet: outletFromParent,
  categories: categoriesFromParent,
  setActivePage,
}) {
  // ============================================================
  // STATE
  // ============================================================

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

  const [variantProduct, setVariantProduct] = useState(null);
  const [variantLoading, setVariantLoading] = useState(false);
  const [variantError, setVariantError] = useState("");
  const [foodForVariants, setFoodForVariants] = useState(null);
  const [preparingVariantForm, setPreparingVariantForm] = useState(false);

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

        // Always load foods from getOutletDetails for the selected outlet.
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

        setOutlet(response);
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

            outletCategoryId:
              product?.outletCategoryId ??
              category?.outletCategoryId ??
              null,
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
          productId.includes(search) ||
          productName.includes(search) ||
          description.includes(search) ||
          categoryName.includes(search)
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

    return `₹${number.toFixed(2)}`;
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

  };

  const handleViewVariants = async (food) => {
    const productId = Number(food?.productId ?? food?.id);
    if (!productId) {
      setVariantError("This food item does not have a valid product ID.");
      return;
    }

    setVariantProduct(null);
    setVariantError("");
    setVariantLoading(true);

    try {
      const response = await getProductDetailById(productId);
      const product = response?.data ?? response;
      setVariantProduct(product);
    } catch (error) {
      setVariantError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to load product variants."
      );
    } finally {
      setVariantLoading(false);
    }
  };

  const handleAddVariants = async (food) => {
    const productId = Number(food?.productId ?? food?.id);
    if (!productId) {
      setVariantError("This food item does not have a valid product ID.");
      return;
    }

    setPreparingVariantForm(true);
    setVariantError("");
    try {
      // Fetch complete product data first, then retain the food-row category,
      // timings, and product ID needed by the mapping request.
      const response = await getProductDetailById(productId);
      const detail = response?.data ?? response ?? {};
      setFoodForVariants({
        ...food,
        ...detail,
        masterProductId:
          detail.masterProductId ??
          food.masterProductId ??
          food.master_product_id ??
          productId,
        productName: detail.productName ?? food.productName,
        categoryId: detail.categoryId ?? food.categoryId,
        timings: detail.timings ?? food.productTimings ?? [],
        variantGroups: detail.variantGroups ?? food.variantGroups ?? [],
      });
    } catch (error) {
      setVariantError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to load this food item for variant mapping."
      );
    } finally {
      setPreparingVariantForm(false);
    }
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
                  Available
                </th>

                <th>
                  Product Timings
                </th>

                <th>
                  Add Variants
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
                  ) => (
                    <tr
                      key={
                        food?.productId ??
                        index
                      }
                    >

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
                        <div className="jippy-food-variants-cell">
                          {renderVariants(food)}
                          <button
                            type="button"
                            className="jippy-food-variants-btn"
                            onClick={() => handleViewVariants(food)}
                            disabled={variantLoading}
                          >
                            <FiLayers />
                            View variants
                          </button>
                        </div>
                      </td>

                      {/* AVAILABLE */}

                      <td>
                        {isTrue(
                          food?.isAvailable
                        ) ? (
                          <span className="jippy-food-available">
                            Available
                          </span>
                        ) : (
                          <span className="jippy-food-unavailable">
                            Unavailable
                          </span>
                        )}
                      </td>

                      {/* PRODUCT TIMINGS */}

                      <td>
                        {renderProductTimings(
                          food?.productTimings
                        )}
                      </td>

                      <td>
                        <button
                          type="button"
                          className="jippy-food-add-variants-btn"
                          onClick={() => handleAddVariants(food)}
                          disabled={preparingVariantForm}
                          title="Edit product variants"
                          aria-label="Edit product variants"
                        >
                          <FiEdit2 />
                        </button>
                      </td>

                    </tr>
                  )
                )

              ) : (

                <tr>
                  <td
                    colSpan="11"
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

      {(variantLoading || variantProduct || variantError) && (
        <div className="jippy-food-variants-modal" role="dialog" aria-modal="true" aria-label="Product variants">
          <div className="jippy-food-variants-dialog">
            <div className="jippy-food-variants-dialog-header">
              <div>
                <p>PRODUCT VARIANTS</p>
                <h3>{variantProduct?.productName || "Loading product variants"}</h3>
              </div>
              <button type="button" onClick={() => { setVariantProduct(null); setVariantError(""); }} aria-label="Close variants">
                <FiX />
              </button>
            </div>

            {variantLoading && <div className="jippy-food-variants-state">Loading variants...</div>}
            {variantError && <div className="jippy-food-variants-error">{variantError}</div>}

            {variantProduct && !variantLoading && (
              <div className="jippy-food-variants-content">
                {Array.isArray(variantProduct.variantGroups) && variantProduct.variantGroups.length > 0 ? (
                  variantProduct.variantGroups.map((group) => (
                    <section className="jippy-food-variant-group" key={group.productVariantGroupsId}>
                      <h3>{group.groupName || `Group #${group.productVariantGroupsId}`}</h3>
                      <div className="jippy-food-variant-options">
                        {(group.options || []).map((option) => (
                          <div className="jippy-food-variant-option" key={option.productVariantOptionsId}>
                            <strong>{option.variantName || `Option #${option.productVariantOptionsId}`}</strong>
                            <span>{option.priceType || "FIXED"}</span>
                            <b>{formatPrice(option.variantPrice)}</b>
                          </div>
                        ))}
                      </div>
                    </section>
                  ))
                ) : (
                  <div className="jippy-food-variants-state">No variants are configured for this food item.</div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {foodForVariants && (
        <AddToOutletProducts
          selectedProducts={[foodForVariants]}
          initialOutletId={outlet?.outletId ?? outlet?.id}
          initialOutletName={outlet?.outletName ?? outlet?.name}
          initialOutletCategoryId={foodForVariants.outletCategoryId}
          initialCategoryId={foodForVariants.categoryId}
          asModal
          setShowOutletPopup={() => setFoodForVariants(null)}
        />
      )}

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

    </div>
  );
}

export default OutletFoods;
