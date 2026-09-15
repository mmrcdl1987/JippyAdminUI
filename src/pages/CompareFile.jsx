import "../styles/CompareFile.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { FiEdit2 } from "react-icons/fi";
import AddToOutletProducts from "./AddToOutletProducts";

import {
  compareMasterProductsFile,
  addNewItemsToMasterProducts,
} from "../services/masterProductsService";

function CompareFile({ setActivePage }) {
  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] = useState(null);
  const [compareResult, setCompareResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Controls the separate AddToOutletProducts screen
  const [showOutletPopup, setShowOutletPopup] =
    useState(false);

  const [activeTab, setActiveTab] =
    useState("duplicates");

  const [selectedProducts, setSelectedProducts] =
    useState([]);

  const [selectedOutletProducts, setSelectedOutletProducts] =
    useState([]);

  // Confirmation is only used for Master Products.
  // It is NOT used for Add To Outlet Products.
  const [showConfirmPopup, setShowConfirmPopup] =
    useState(false);

  const [confirmType, setConfirmType] =
    useState("");

  // ============================================================
  // NAVIGATION
  // ============================================================

  const handleNavigation = () => {
    if (typeof setActivePage === "function") {
      setActivePage("masterProducts");
    } else {
      navigate("/dashboard/masterProducts");
    }
  };

  // ============================================================
  // FILE SELECTION
  // ============================================================

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    setSelectedFile(file);
  };

  // ============================================================
  // COMPARE FILE
  // ============================================================

  const handleCompare = async () => {
    if (!selectedFile) {
      alert("Please select a file.");
      return;
    }

    try {
      setLoading(true);

      const response =
        await compareMasterProductsFile(
          selectedFile
        );

      const data = response.data || {};

      // ----------------------------------------------------------
      // Normalize CSV / XLS values
      //
      // IMPORTANT:
      // Keep merchant price and timing under BOTH:
      // 1. Standard field names
      // 2. CSV/XLS compatibility field names
      //
      // This makes the values available to
      // AddToOutletProducts.jsx.
      // ----------------------------------------------------------

      const normalizeCompareItem = (item) => {
        if (!item) {
          return item;
        }

        // ========================================================
        // MERCHANT PRICE
        // ========================================================

        const rawPrice =
          item.merchantPrice ??
          item.csvMerchantPrice ??
          item.xlsMerchantPrice ??
          item.csvPrice ??
          item.merchant_price ??
          item.price ??
          null;

        const merchantPrice =
          rawPrice !== null &&
          rawPrice !== undefined &&
          rawPrice !== "" &&
          !Number.isNaN(
            Number(rawPrice)
          )
            ? Number(rawPrice)
            : null;

        // ========================================================
        // TIMING
        // ========================================================

        const rawTiming =
          item.csvTiming ??
          item.xlsTiming ??
          item.timing ??
          item.csv_timing ??
          item.xls_timing ??
          item.time ??
          "";

        const timing =
          String(
            rawTiming || ""
          ).trim();

        // ========================================================
        // DAY OF WEEK
        // ========================================================

        const rawDayOfWeek =
          item.csvDayOfWeek ??
          item.xlsDayOfWeek ??
          item.dayOfWeek ??
          item.daysofaweek ??
          item.csv_day_of_week ??
          item.xls_day_of_week ??
          "";

        const dayOfWeek =
          String(
            rawDayOfWeek || ""
          ).trim();

        // ========================================================
        // RETURN NORMALIZED ITEM
        // ========================================================

        return {
          ...item,

          // Standard merchant price
          merchantPrice,

          // Compatibility fields
          csvMerchantPrice:
            merchantPrice,

          xlsMerchantPrice:
            merchantPrice,

          // Standard timing
          csvTiming:
            timing,

          // Compatibility timing
          xlsTiming:
            timing,

          // Standard day
          csvDayOfWeek:
            dayOfWeek,

          // Compatibility day
          xlsDayOfWeek:
            dayOfWeek,
        };
      };

      const normalizedResult = {
        ...data,

        duplicates:
          Array.isArray(
            data.duplicates
          )
            ? data.duplicates.map(
                normalizeCompareItem
              )
            : [],

        newProducts:
          Array.isArray(
            data.newProducts
          )
            ? data.newProducts.map(
                normalizeCompareItem
              )
            : [],
      };

      console.log(
        "[COMPARE] Raw API response:",
        data
      );

      console.log(
        "[COMPARE] Normalized XLS/CSV data:",
        normalizedResult
      );

      // Helpful debug output
      console.log(
        "[COMPARE] Product price/timing values:",
        [
          ...(normalizedResult.duplicates ||
            []),
          ...(normalizedResult.newProducts ||
            []),
        ].map((product) => ({
          product:
            product.masterProductName,

          merchantPrice:
            product.merchantPrice,

          csvMerchantPrice:
            product.csvMerchantPrice,

          xlsMerchantPrice:
            product.xlsMerchantPrice,

          csvTiming:
            product.csvTiming,

          xlsTiming:
            product.xlsTiming,

          csvDayOfWeek:
            product.csvDayOfWeek,

          xlsDayOfWeek:
            product.xlsDayOfWeek,
        }))
      );

      setCompareResult(
        normalizedResult
      );

      setActiveTab("duplicates");

      setSelectedProducts([]);

      setSelectedOutletProducts([]);
    } catch (error) {
      console.error(
        "[COMPARE] Error:",
        error
      );

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to compare file.";

      alert(message);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // ADD NEW PRODUCTS TO MASTER PRODUCTS
  // ============================================================

  const handleAddToMasterProducts =
    async () => {
      if (
        selectedProducts.length === 0
      ) {
        alert(
          "Please select at least one product."
        );
        return;
      }

      try {
        const payload =
          currentProducts
            .filter((_, index) =>
              selectedProducts.includes(
                index
              )
            )
            .map((product) => {
              // --------------------------------------------------
              // Resolve isVeg
              // --------------------------------------------------

              let isVeg =
                product.isVeg;

              if (
                typeof isVeg ===
                "string"
              ) {
                const normalizedIsVeg =
                  isVeg
                    .trim()
                    .toLowerCase();

                if (
                  normalizedIsVeg ===
                  "true"
                ) {
                  isVeg = true;
                } else if (
                  normalizedIsVeg ===
                  "false"
                ) {
                  isVeg = false;
                }
              }

              // --------------------------------------------------
              // Legacy fallback
              // --------------------------------------------------

              if (
                typeof isVeg !==
                "boolean"
              ) {
                if (
                  product.veg ===
                    true ||
                  product.veg ===
                    1 ||
                  product.veg ===
                    "true" ||
                  product.veg ===
                    "1"
                ) {
                  isVeg = true;
                } else if (
                  product.nonVeg ===
                    true ||
                  product.nonVeg ===
                    1 ||
                  product.nonVeg ===
                    "true" ||
                  product.nonVeg ===
                    "1"
                ) {
                  isVeg = false;
                }
              }

              if (
                typeof isVeg !==
                "boolean"
              ) {
                throw new Error(
                  `Invalid isVeg value for "${product.masterProductName}". Expected true or false.`
                );
              }

              // --------------------------------------------------
              // Master Product Payload
              // --------------------------------------------------

              return {
                masterProductName:
                  product.masterProductName,

                description:
                  product.description ??
                  null,

                shortDescription:
                  product.shortDescription ??
                  null,

                photo:
                  product.photo ??
                  null,

                photos:
                  product.photos ??
                  null,

                thumbnail:
                  product.thumbnail ??
                  null,

                // category_id is optional
                categoryId:
                  product.categoryId ??
                  null,

                categoryName:
                  product.categoryName ??
                  null,

                subCategoryId:
                  product.subCategoryId ??
                  null,

                subCategoryName:
                  product.subCategoryName ??
                  null,

                // Important backend field
                isVeg,

                // Legacy fields
                veg:
                  product.veg ??
                  null,

                nonVeg:
                  product.nonVeg ??
                  null,

                foodType:
                  product.foodType ??
                  null,

                cuisineType:
                  product.cuisineType ??
                  null,

                hasOptions:
                  product.hasOptions !=
                  null
                    ? Number(
                        product.hasOptions
                      )
                    : 0,

                optionsEnabled:
                  product.optionsEnabled ??
                  null,

                options:
                  product.options ??
                  null,

                calories:
                  product.calories ??
                  null,

                protein:
                  product.protein ??
                  null,

                fats:
                  product.fats ??
                  null,

                carbs:
                  product.carbs ??
                  null,

                grams:
                  product.grams ??
                  null,

                productType:
                  product.productType !=
                  null
                    ? String(
                        product.productType
                      ).trim()
                    : null,

                publish:
                  product.publish ??
                  null,

                createdBy:
                  product.createdBy ??
                  1,

                updatedBy:
                  product.updatedBy ??
                  1,
              };
            });

        console.log(
          "[MASTER PRODUCT] Payload:",
          JSON.stringify(
            payload,
            null,
            2
          )
        );

        console.log(
          "[MASTER PRODUCT] isVeg values:",
          payload.map(
            (product) => ({
              masterProductName:
                product.masterProductName,

              isVeg:
                product.isVeg,

              type:
                typeof product.isVeg,
            })
          )
        );

        const response =
          await addNewItemsToMasterProducts(
            payload
          );

        console.log(
          "[MASTER PRODUCT] Response:",
          response.data
        );

        alert(
          "Products added successfully!"
        );

        setSelectedProducts([]);
      } catch (error) {
        console.error(
          "[MASTER PRODUCT] Error:",
          error
        );

        const message =
          error?.response?.data
            ?.message ||
          error?.response?.data
            ?.error ||
          error?.message ||
          "Failed to add products.";

        alert(message);
      }
    };

  // ============================================================
  // CURRENT PRODUCTS
  // ============================================================

  const currentProducts =
    activeTab === "duplicates"
      ? compareResult?.duplicates ||
        []
      : compareResult?.newProducts ||
        [];

  // ============================================================
  // ADD TO OUTLET PRODUCTS SCREEN
  // ============================================================

  /*
   * When Add To Outlet Products is opened,
   * completely replace CompareFile with
   * AddToOutletProducts.
   *
   * Therefore it will NOT appear beside
   * CompareFile.
   */

  if (showOutletPopup) {
    const firstSelectedProduct =
      selectedOutletProducts?.[0] ||
      {};

    return (
      <AddToOutletProducts
        setShowOutletPopup={
          setShowOutletPopup
        }

        selectedProducts={
          selectedOutletProducts
        }

        /*
         * Outlet context
         *
         * These values are passed when the
         * selected comparison row already
         * contains outlet information.
         *
         * AddToOutletProducts also has
         * its own outlet dropdown.
         */

        initialOutletId={
          firstSelectedProduct?.outletId ||
          firstSelectedProduct?.outlet_id ||
          null
        }

        initialOutletCategoryId={
          firstSelectedProduct?.outletCategoryId ||
          firstSelectedProduct?.outlet_category_id ||
          null
        }

        initialCategoryId={
          firstSelectedProduct?.categoryId ||
          null
        }

        initialOutletName={
          firstSelectedProduct?.outletName ||
          firstSelectedProduct?.outlet_name ||
          ""
        }
      />
    );
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="compare-page">

      <div className="compare-card">

        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="compare-header">

          <h2>
            Compare File with Catalogue
          </h2>

          <button
            type="button"
            className="close-btn"
            onClick={handleNavigation}
          >
            ✕
          </button>

        </div>


        {/* ======================================================
            INFO
        ====================================================== */}

        <div className="info-card">

          <div className="info-icon">
            🔎
          </div>

          <div>

            <h3>
              Detect duplicates before
              importing
            </h3>

            <p>
              Upload an Excel or CSV
              file. The system compares
              the products against the
              Master Catalogue and
              separates Duplicate Products
              and New Products.
            </p>

          </div>

        </div>


        {/* ======================================================
            FILE UPLOAD
        ====================================================== */}

        <div className="upload-area">

          <div className="upload-icon">
            📂
          </div>

          <h3>
            Drop your file here
          </h3>

          <span>
            or
          </span>

          <input
            id="compareFile"
            type="file"
            hidden
            onChange={
              handleFileChange
            }
          />

          <label
            htmlFor="compareFile"
            className="browse-btn"
          >
            Browse File
          </label>

          {selectedFile && (
            <p className="selected-file">
              {selectedFile.name}
            </p>
          )}

        </div>


        {/* ======================================================
            COMPARE RESULTS
        ====================================================== */}

        {compareResult && (
          <>

            {/* ==================================================
                STATISTICS
            ================================================== */}

            <div className="compare-stats">

              <div className="compare-stat-card">

                <h2>
                  {
                    compareResult.totalInFile
                  }
                </h2>

                <p>
                  Total Products
                </p>

              </div>


              <div className="compare-stat-card">

                <h2>
                  {
                    compareResult.newCount
                  }
                </h2>

                <p>
                  New Products
                </p>

              </div>


              <div className="compare-stat-card">

                <h2>
                  {
                    compareResult.duplicateCount
                  }
                </h2>

                <p>
                  Duplicates
                </p>

              </div>


              <div className="compare-stat-card">

                <h2>
                  {
                    compareResult.skippedCount
                  }
                </h2>

                <p>
                  Skipped
                </p>

              </div>

            </div>


            {/* ==================================================
                TABS
            ================================================== */}

            <div className="result-tabs">

              <button
                type="button"
                className={`tab-btn ${
                  activeTab ===
                  "duplicates"
                    ? "active"
                    : ""
                }`}
                onClick={() => {
                  setActiveTab(
                    "duplicates"
                  );

                  setSelectedProducts(
                    []
                  );
                }}
              >
                Duplicates (
                {
                  compareResult.duplicateCount
                }
                )
              </button>


              <button
                type="button"
                className={`tab-btn ${
                  activeTab === "new"
                    ? "active"
                    : ""
                }`}
                onClick={() => {
                  setActiveTab(
                    "new"
                  );

                  setSelectedProducts(
                    []
                  );
                }}
              >
                New Products (
                {
                  compareResult.newCount
                }
                )
              </button>

            </div>


            {/* ==================================================
                TOOLBAR
            ================================================== */}

            <div className="table-toolbar">

              {/* =================================================
                  ADD TO MASTER PRODUCTS
              ================================================= */}

              {activeTab ===
                "new" && (
                <button
                  type="button"
                  className="bulk-add-btn"
                  onClick={() => {

                    if (
                      selectedProducts.length ===
                      0
                    ) {
                      alert(
                        "Please select at least one product."
                      );

                      return;
                    }

                    setConfirmType(
                      "master"
                    );

                    setShowConfirmPopup(
                      true
                    );
                  }}
                >
                  + Add to Master
                  Products
                </button>
              )}


              {/* =================================================
                  ADD TO OUTLET PRODUCTS

                  IMPORTANT:
                  NO CONFIRMATION POPUP.

                  Clicking this button
                  immediately opens
                  AddToOutletProducts.jsx.
              ================================================= */}

              {activeTab ===
                "duplicates" && (
                <button
                  type="button"
                  className="bulk-add-btn"
                  onClick={() => {

                    if (
                      selectedProducts.length ===
                      0
                    ) {
                      alert(
                        "Please select at least one product."
                      );

                      return;
                    }

                    // --------------------------------------------
                    // Get selected complete product objects
                    // --------------------------------------------

                    const products =
                      selectedProducts.map(
                        (index) =>
                          currentProducts[
                            index
                          ]
                      );

                    console.log(
                      "[OUTLET] Selected products:",
                      products
                    );

                    // --------------------------------------------
                    // Verify CSV price/timing values
                    // before moving to next screen
                    // --------------------------------------------

                    console.log(
                      "[OUTLET] Selected CSV/XLS values:",
                      products.map(
                        (product) => ({
                          product:
                            product?.masterProductName,

                          merchantPrice:
                            product?.merchantPrice,

                          csvMerchantPrice:
                            product?.csvMerchantPrice,

                          xlsMerchantPrice:
                            product?.xlsMerchantPrice,

                          csvTiming:
                            product?.csvTiming,

                          xlsTiming:
                            product?.xlsTiming,

                          csvDayOfWeek:
                            product?.csvDayOfWeek,

                          xlsDayOfWeek:
                            product?.xlsDayOfWeek,
                        })
                      )
                    );

                    // --------------------------------------------
                    // Store complete product objects
                    // --------------------------------------------

                    setSelectedOutletProducts(
                      products
                    );

                    // --------------------------------------------
                    // Immediately open
                    // AddToOutletProducts.jsx
                    // --------------------------------------------

                    setShowOutletPopup(
                      true
                    );
                  }}
                >
                  + Add to Outlet
                  Products
                </button>
              )}

            </div>


            {/* ==================================================
                PRODUCT TABLE
            ================================================== */}

            <div className="compare-table-container">

              <table className="compare-table">

                <thead>

                  <tr>

                    <th>

                      <label className="select-all-label">

                        <input
                          type="checkbox"
                          checked={
                            currentProducts.length >
                              0 &&
                            selectedProducts.length ===
                              currentProducts.length
                          }
                          onChange={(
                            e
                          ) => {

                            if (
                              e.target.checked
                            ) {

                              setSelectedProducts(
                                currentProducts.map(
                                  (
                                    _
                                  ,
                                    index
                                  ) =>
                                    index
                                )
                              );

                            } else {

                              setSelectedProducts(
                                []
                              );

                            }

                          }}
                        />

                        Select All

                      </label>

                    </th>


                    <th>
                      Photo
                    </th>


                    <th>
                      Product
                    </th>


                    <th>
                      Product Type
                    </th>


                    <th>
                      Category
                    </th>


                    <th>
                      Calories
                    </th>


                    <th>
                      Protein
                    </th>


                    <th>
                      Fat
                    </th>


                    <th>
                      Carbs
                    </th>


                    <th>
                      Wt(g)
                    </th>


                    <th>
                      Options
                    </th>


                    <th>
                      Status
                    </th>


                    <th>
                      Edit
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {currentProducts.map(
                    (
                      product,
                      index
                    ) => (

                      <tr
                        key={
                          product.masterProductId ??
                          `${product.masterProductName}-${index}`
                        }
                      >

                        {/* CHECKBOX */}

                        <td>

                          <input
                            type="checkbox"
                            checked={selectedProducts.includes(
                              index
                            )}
                            onChange={(
                              e
                            ) => {

                              if (
                                e.target
                                  .checked
                              ) {

                                setSelectedProducts(
                                  (
                                    previous
                                  ) => [
                                    ...previous,
                                    index,
                                  ]
                                );

                              } else {

                                setSelectedProducts(
                                  (
                                    previous
                                  ) =>
                                    previous.filter(
                                      (
                                        id
                                      ) =>
                                        id !==
                                        index
                                    )
                                );

                              }

                            }}
                          />

                        </td>


                        {/* PHOTO */}

                        <td>

                          <img
                            src={
                              product.photo ||
                              "/no-image.png"
                            }
                            alt=""
                            className="product-photo"
                          />

                        </td>


                        {/* PRODUCT */}

                        <td>

                          <div className="product-info">

                            <strong>
                              {
                                product.masterProductName
                              }
                            </strong>

                            <div className="product-sub">
                              {
                                product.foodType
                              }
                            </div>

                          </div>

                        </td>


                        {/* PRODUCT TYPE */}

                        <td>

                          <span className="product-sub">

                            {
                              product.productType ||
                              "-"
                            }

                          </span>

                        </td>


                        {/* CATEGORY */}

                        <td>

                          <div>

                            <strong>
                              {
                                product.categoryName
                              }
                            </strong>

                            <div className="product-sub">
                              {
                                product.subCategoryName
                              }
                            </div>

                          </div>

                        </td>


                        {/* CALORIES */}

                        <td>
                          {
                            product.calories
                          }
                        </td>


                        {/* PROTEIN */}

                        <td>
                          {
                            product.protein
                          }
                        </td>


                        {/* FAT */}

                        <td>
                          {
                            product.fats
                          }
                        </td>


                        {/* CARBS */}

                        <td>
                          {
                            product.carbs
                          }
                        </td>


                        {/* WEIGHT */}

                        <td>
                          {
                            product.grams
                          }
                        </td>


                        {/* OPTIONS */}

                        <td>

                          <span
                            className={
                              product.hasOptions
                                ? "yes-tag"
                                : "no-tag"
                            }
                          >
                            {
                              product.hasOptions
                                ? "Yes"
                                : "No"
                            }
                          </span>

                        </td>


                        {/* STATUS */}

                        <td>

                          <span
                            className={
                              product.publish ===
                              1
                                ? "published-tag"
                                : "draft-tag"
                            }
                          >
                            {
                              product.publish ===
                              1
                                ? "Published"
                                : "Draft"
                            }
                          </span>

                        </td>


                        {/* EDIT */}

                        <td>

                          <button
                            type="button"
                            className="edit-small-btn"
                          >
                            <FiEdit2 />
                          </button>

                        </td>

                      </tr>

                    )
                  )}


                  {currentProducts.length ===
                    0 && (
                    <tr>

                      <td
                        colSpan="13"
                        style={{
                          textAlign:
                            "center",

                          padding:
                            "30px",
                        }}
                      >
                        No products
                        found.
                      </td>

                    </tr>
                  )}

                </tbody>

              </table>

            </div>

          </>
        )}


        {/* ========================================================
            MASTER PRODUCT CONFIRMATION ONLY
        ======================================================== */}

        {showConfirmPopup && (
          <div className="confirm-popup-overlay">

            <div className="confirm-popup">

              <h3>
                Confirmation
              </h3>

              <p>
                Are you sure you want
                to add the selected
                products to Master
                Products?
              </p>


              <div className="confirm-buttons">

                <button
                  type="button"
                  className="cancel-popup-btn"
                  onClick={() => {
                    setShowConfirmPopup(
                      false
                    );
                  }}
                >
                  Cancel
                </button>


                <button
                  type="button"
                  className="confirm-popup-btn"
                  onClick={() => {

                    setShowConfirmPopup(
                      false
                    );

                    if (
                      confirmType ===
                      "master"
                    ) {
                      handleAddToMasterProducts();
                    }

                  }}
                >
                  Yes
                </button>

              </div>

            </div>

          </div>
        )}


        {/* ========================================================
            FOOTER
        ======================================================== */}

        <div className="compare-footer">

          <button
            type="button"
            className="cancel-btn"
            onClick={
              handleNavigation
            }
          >
            Close
          </button>


          <button
            type="button"
            className="compare-button"
            onClick={
              handleCompare
            }
            disabled={loading}
          >
            {loading
              ? "Comparing..."
              : "Compare"}
          </button>

        </div>

      </div>

    </div>
  );
}


CompareFile.propTypes = {
  setActivePage:
    PropTypes.func,
};


export default CompareFile;