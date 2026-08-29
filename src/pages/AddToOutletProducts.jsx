import "../styles/AddToOutletProducts.css";
import { useState, useEffect } from "react";
import {
  getAllOutlets,
  addProductsToOutlet,
} from "../services/masterProductsService";
import Select from "react-select";

function AddToOutletProducts({
  setShowOutletPopup,
  selectedProducts,
}) {
  // ============================================================
  // STATE
  // ============================================================

  const [outlet, setOutlet] = useState("");
  const [outlets, setOutlets] = useState([]);

  const [defaultPrice, setDefaultPrice] = useState("");
  const [defaultTiming, setDefaultTiming] = useState("");
  const [defaultType, setDefaultType] = useState("");

  const [isSaving, setIsSaving] = useState(false);

  /**
   * Backend mapping result.
   *
   * null = result screen not shown
   */
  const [mappingResult, setMappingResult] = useState(null);

  const products = selectedProducts || [];

  // ============================================================
  // DEBUG
  // ============================================================

  console.log("Products received:", products);

  // ============================================================
  // FETCH OUTLETS
  // ============================================================

  const fetchOutlets = async () => {
    try {
      const response = await getAllOutlets();

      console.log("Outlets response:", response.data);

      setOutlets(response.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch outlets:", error);

      alert("Failed to load outlets.");
    }
  };

  useEffect(() => {
    fetchOutlets();
  }, []);

  // ============================================================
  // APPLY DEFAULT PRICE
  // ============================================================

  const handleApplyDefaultPrice = () => {
    if (defaultPrice === "") {
      alert("Please enter a default price.");
      return;
    }

    console.log("Applying default price:", defaultPrice);

    /*
     * The default price is used while building the payload.
     *
     * No separate product-level state is required because
     * the current screen uses one default price for all
     * selected products.
     */
  };

  // ============================================================
  // APPLY DEFAULT TIMING
  // ============================================================

  const handleApplyDefaultTiming = () => {
    if (!defaultTiming.trim()) {
      alert("Please enter a default timing.");
      return;
    }

    console.log("Applying default timing:", defaultTiming);

    /*
     * The default timing is used while building the payload.
     */
  };

  // ============================================================
  // CLOSE POPUP
  // ============================================================

  const handleClose = () => {
    setShowOutletPopup(false);
  };

  // ============================================================
  // SAVE PRODUCTS
  // ============================================================

  const handleSaveProducts = async () => {
    // ----------------------------------------------------------
    // Validate outlet
    // ----------------------------------------------------------

    if (!outlet) {
      alert("Please select an outlet.");
      return;
    }

    // ----------------------------------------------------------
    // Validate products
    // ----------------------------------------------------------

    if (!products || products.length === 0) {
      alert("Please select at least one master product.");
      return;
    }

    // ----------------------------------------------------------
    // Validate master product IDs
    // ----------------------------------------------------------

    const invalidProducts = products.filter(
      (product) =>
        !product?.masterProductId ||
        Number(product.masterProductId) <= 0
    );

    if (invalidProducts.length > 0) {
      console.error(
        "Products without valid masterProductId:",
        invalidProducts
      );

      alert(
        "One or more selected products do not have a valid Master Product ID."
      );

      return;
    }

    // ----------------------------------------------------------
    // Reset previous result
    // ----------------------------------------------------------

    setMappingResult(null);
    setIsSaving(true);

    // ==========================================================
    // BUILD PAYLOAD
    // ==========================================================

    /*
     * IMPORTANT:
     *
     * DO NOT send outletCategoryId here.
     *
     * Selected master products can belong to different
     * categories.
     *
     * Example:
     *
     * Chicken Biryani -> category 5
     * Paneer Butter Masala -> category 6
     * Chicken Tikka -> category 7
     *
     * Backend will resolve:
     *
     * masterProductId
     *       ↓
     * master_products.category_id
     *       ↓
     * outlet_categories
     *       ↓
     * outlet_category_id
     */

    const payload = {
      outletId: Number(outlet),

      products: products.map((product) => {
        const masterProductId = Number(
          product.masterProductId
        );

        // ------------------------------------------------------
        // VEG / NON-VEG
        // ------------------------------------------------------

        let isVeg = null;

        /*
         * If user selected a default type, use it.
         *
         * Otherwise keep the master product's type.
         */
        if (defaultType === "Veg") {
          isVeg = true;
        } else if (defaultType === "Non Veg") {
          isVeg = false;
        } else if (
          product.veg !== undefined &&
          product.veg !== null
        ) {
          isVeg = Number(product.veg) === 1;
        } else if (
          product.nonVeg !== undefined &&
          product.nonVeg !== null
        ) {
          isVeg = Number(product.nonVeg) !== 1;
        }

        // ------------------------------------------------------
        // PRICE
        // ------------------------------------------------------

        const merchantPrice =
          defaultPrice !== ""
            ? Number(defaultPrice)
            : Number(product.csvMerchantPrice || 0);

        // ------------------------------------------------------
        // TIMING
        // ------------------------------------------------------

        const csvTiming =
          defaultTiming?.trim() || "";

        // ------------------------------------------------------
        // PRODUCT
        // ------------------------------------------------------

        return {
          masterProductId,

          productName:
            product.masterProductName ||
            product.productName ||
            "",

          description:
            product.description || "",

          merchantPrice,

          isVeg,

          /*
           * Master product mapping should NOT create variants.
           */
          hasProductVariants: false,

          /*
           * No variants are sent.
           */
          csvDayOfWeek: "",

          csvTiming,

          timings: [],

          /*
           * This is only informational.
           *
           * Backend should use the category from
           * master_products as the source of truth.
           */
          categoryId:
            product.categoryId !== undefined &&
            product.categoryId !== null
              ? Number(product.categoryId)
              : null,
        };
      }),
    };

    // ==========================================================
    // DEBUG
    // ==========================================================

    console.log(
      "=========================================="
    );

    console.log(
      "MASTER PRODUCT → OUTLET PRODUCT PAYLOAD"
    );

    console.log(
      JSON.stringify(payload, null, 2)
    );

    console.log(
      "=========================================="
    );

    // ==========================================================
    // API CALL
    // ==========================================================

    try {
      const response =
        await addProductsToOutlet(payload);

      console.log(
        "Map products response:",
        response.data
      );

      // --------------------------------------------------------
      // Backend response
      // --------------------------------------------------------

      const result =
        response.data?.data ||
        response.data ||
        {};

      console.log(
        "Mapping result:",
        result
      );

      // --------------------------------------------------------
      // Saved count
      // --------------------------------------------------------

      const savedCount =
        Number(result?.savedCount ?? 0);

      // --------------------------------------------------------
      // Skipped count
      // --------------------------------------------------------

      const skippedCount =
        Number(result?.skippedCount ?? 0);

      // --------------------------------------------------------
      // Saved names
      // --------------------------------------------------------

      const savedNames =
        Array.isArray(result?.savedNames)
          ? result.savedNames
          : [];

      // --------------------------------------------------------
      // Skipped names
      // --------------------------------------------------------

      const skippedNames =
        Array.isArray(result?.skippedNames)
          ? result.skippedNames
          : [];

      // --------------------------------------------------------
      // Detailed skipped products
      // --------------------------------------------------------

      let skippedProducts =
        Array.isArray(result?.skippedProducts)
          ? result.skippedProducts
          : [];

      /*
       * Backward compatibility:
       *
       * If backend does not yet send skippedProducts,
       * create a basic reason from skippedNames.
       */
      if (
        skippedProducts.length === 0 &&
        skippedNames.length > 0
      ) {
        skippedProducts = skippedNames.map(
          (name) => ({
            productName: String(name)
              .replace(" (Already Exists)", ""),
            reason: String(name).includes(
              "Already Exists"
            )
              ? "Product already exists in this outlet and category"
              : "Product was skipped by the backend",
          })
        );
      }

      // --------------------------------------------------------
      // Store result
      // --------------------------------------------------------

      setMappingResult({
        savedCount,
        skippedCount,
        savedNames,
        skippedNames,
        skippedProducts,
      });

      /*
       * IMPORTANT:
       *
       * Do NOT close the popup here.
       *
       * The user needs to see the success/skipped
       * result on the UI.
       */

    } catch (error) {
      console.error(
        "Failed to add products to outlet:",
        error
      );

      console.error(
        "Backend error:",
        error?.response?.data
      );

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to add products.";

      alert(message);
    } finally {
      setIsSaving(false);
    }
  };

  // ============================================================
  // OUTLET OPTIONS
  // ============================================================

  const outletOptions = outlets.map((item) => ({
    value: item.outletId,
    label: item.outletName,
  }));

  const selectedOutlet =
    outletOptions.find(
      (option) =>
        Number(option.value) === Number(outlet)
    ) || null;

  // ============================================================
  // RESULT SCREEN
  // ============================================================

  if (mappingResult) {
    const {
      savedCount,
      skippedCount,
      savedNames,
      skippedProducts,
    } = mappingResult;

    return (
      <div className="outlet-page">
        <div className="outlet-card">

          {/* ==================================================
              RESULT HEADER
          =================================================== */}

          <div className="outlet-header">

            <h2>
              📊 Product Mapping Result
            </h2>

            <button
              type="button"
              className="close-btn"
              onClick={handleClose}
            >
              ✕
            </button>

          </div>

          {/* ==================================================
              SUMMARY
          =================================================== */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "1fr 1fr",
              gap: "15px",
              marginBottom: "25px",
            }}
          >

            {/* SUCCESS */}

            <div
              style={{
                padding: "20px",
                borderRadius: "10px",
                background: "#eaf8ef",
                border: "1px solid #b7e4c7",
                textAlign: "center",
              }}
            >

              <div
                style={{
                  fontSize: "30px",
                  marginBottom: "5px",
                }}
              >
                ✅
              </div>

              <div
                style={{
                  fontSize: "28px",
                  fontWeight: "700",
                }}
              >
                {savedCount}
              </div>

              <div
                style={{
                  fontWeight: "600",
                }}
              >
                Successfully Added
              </div>

            </div>

            {/* SKIPPED */}

            <div
              style={{
                padding: "20px",
                borderRadius: "10px",
                background: "#fff8e6",
                border: "1px solid #f1d48a",
                textAlign: "center",
              }}
            >

              <div
                style={{
                  fontSize: "30px",
                  marginBottom: "5px",
                }}
              >
                ⏭️
              </div>

              <div
                style={{
                  fontSize: "28px",
                  fontWeight: "700",
                }}
              >
                {skippedCount}
              </div>

              <div
                style={{
                  fontWeight: "600",
                }}
              >
                Skipped
              </div>

            </div>

          </div>

          {/* ==================================================
              SUCCESSFULLY ADDED
          =================================================== */}

          {savedCount > 0 &&
            savedNames.length > 0 && (
              <div
                style={{
                  marginBottom: "25px",
                }}
              >

                <h3>
                  ✅ Successfully Added Products
                </h3>

                <div
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    padding: "10px",
                    maxHeight: "220px",
                    overflowY: "auto",
                  }}
                >

                  {savedNames.map(
                    (name, index) => (
                      <div
                        key={`${name}-${index}`}
                        style={{
                          padding:
                            "8px 10px",
                          borderBottom:
                            index <
                            savedNames.length - 1
                              ? "1px solid #eee"
                              : "none",
                        }}
                      >
                        <span
                          style={{
                            marginRight: "8px",
                          }}
                        >
                          ✓
                        </span>

                        {name}
                      </div>
                    )
                  )}

                </div>

              </div>
            )}

          {/* ==================================================
              SKIPPED PRODUCTS
          =================================================== */}

          {skippedCount > 0 && (
            <div>

              <h3>
                ⏭️ Skipped Products
              </h3>

              <div
                style={{
                  border: "1px solid #f1d48a",
                  borderRadius: "8px",
                  overflow: "hidden",
                  marginTop: "10px",
                }}
              >

                {skippedProducts.length > 0 ? (
                  skippedProducts.map(
                    (item, index) => (
                      <div
                        key={`${item?.productName}-${index}`}
                        style={{
                          padding: "15px",
                          background:
                            index % 2 === 0
                              ? "#fffdf5"
                              : "#ffffff",
                          borderBottom:
                            index <
                            skippedProducts.length - 1
                              ? "1px solid #eee"
                              : "none",
                        }}
                      >

                        <div
                          style={{
                            fontWeight: "700",
                            marginBottom: "5px",
                          }}
                        >
                          ⏭️{" "}
                          {item?.productName ||
                            "Unknown Product"}
                        </div>

                        <div
                          style={{
                            fontSize: "14px",
                            color: "#666",
                            paddingLeft: "25px",
                          }}
                        >
                          <strong>
                            Reason:
                          </strong>{" "}
                          {item?.reason ||
                            "Product was skipped"}
                        </div>

                      </div>
                    )
                  )
                ) : (
                  <div
                    style={{
                      padding: "15px",
                      color: "#666",
                    }}
                  >
                    Products were skipped, but
                    no detailed reason was returned
                    by the backend.
                  </div>
                )}

              </div>

            </div>
          )}

          {/* ==================================================
              NO SKIPPED PRODUCTS
          =================================================== */}

          {skippedCount === 0 && (
            <div
              style={{
                padding: "15px",
                borderRadius: "8px",
                background: "#eaf8ef",
                marginTop: "20px",
                textAlign: "center",
              }}
            >
              🎉 All selected products were
              successfully added.
            </div>
          )}

          {/* ==================================================
              RESULT FOOTER
          =================================================== */}

          <div className="outlet-footer">

            <button
              type="button"
              className="outlet-cancel-btn"
              onClick={handleClose}
            >
              Close
            </button>

            <button
              type="button"
              className="outlet-save-btn"
              onClick={() => {
                setMappingResult(null);
              }}
            >
              ← Back
            </button>

          </div>

        </div>
      </div>
    );
  }

  // ============================================================
  // MAIN FORM
  // ============================================================

  return (
    <div className="outlet-page">

      <div className="outlet-card">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="outlet-header">

          <h2>
            📂 Add to Outlet Products
          </h2>

          <button
            type="button"
            className="close-btn"
            onClick={handleClose}
          >
            ✕
          </button>

        </div>

        {/* =====================================================
            INFO
        ====================================================== */}

        <div className="outlet-info">

          <div className="outlet-icon">
            📦
          </div>

          <div>

            <h3>
              Map selected products to an outlet
            </h3>

            <p>
              Choose the outlet, set a default
              price and timing, then save.
              Selected master products will be
              mapped to their corresponding
              outlet categories automatically.
            </p>

          </div>

        </div>

        {/* =====================================================
            FORM
        ====================================================== */}

        <div className="outlet-form">

          {/* ---------------------------------------------------
              OUTLET
          ---------------------------------------------------- */}

          <div className="form-group full">

            <label>
              Outlet *
            </label>

            <Select
              options={outletOptions}
              value={selectedOutlet}
              onChange={(selected) =>
                setOutlet(
                  selected
                    ? selected.value
                    : ""
                )
              }
              placeholder="Select Outlet..."
              isSearchable
              isDisabled={isSaving}
              styles={{
                control: (base) => ({
                  ...base,
                  minHeight: "46px",
                  borderRadius: "8px",
                }),

                menu: (base) => ({
                  ...base,
                  zIndex: 99999,
                }),
              }}
            />

          </div>

          {/* ---------------------------------------------------
              DEFAULT PRICE / TIMING
          ---------------------------------------------------- */}

          <div className="row">

            {/* DEFAULT PRICE */}

            <div className="form-group">

              <label>
                Default Price (₹)
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="149"
                value={defaultPrice}
                disabled={isSaving}
                onChange={(e) =>
                  setDefaultPrice(
                    e.target.value
                  )
                }
              />

            </div>

            <button
              type="button"
              className="apply-btn"
              disabled={isSaving}
              onClick={
                handleApplyDefaultPrice
              }
            >
              ↓ Apply
            </button>

            {/* DEFAULT TIMING */}

            <div className="form-group">

              <label>
                Default Timing
              </label>

              <input
                type="text"
                placeholder="9:00-22:00"
                value={defaultTiming}
                disabled={isSaving}
                onChange={(e) =>
                  setDefaultTiming(
                    e.target.value
                  )
                }
              />

            </div>

            <button
              type="button"
              className="apply-btn"
              disabled={isSaving}
              onClick={
                handleApplyDefaultTiming
              }
            >
              ↓ Apply
            </button>

          </div>

          {/* ---------------------------------------------------
              DEFAULT TYPE
          ---------------------------------------------------- */}

          <div className="form-group full">

            <label>
              Default Type
            </label>

            <select
              value={defaultType}
              disabled={isSaving}
              onChange={(e) =>
                setDefaultType(
                  e.target.value
                )
              }
            >

              <option value="">
                -- Keep Per Item --
              </option>

              <option value="Veg">
                Veg
              </option>

              <option value="Non Veg">
                Non Veg
              </option>

            </select>

          </div>

        </div>

        {/* =====================================================
            PRODUCTS HEADER
        ====================================================== */}

        <div className="products-header">

          <h4>
            PRODUCTS TO MAP
          </h4>

          <span>
            {products.length}
          </span>

        </div>

        {/* =====================================================
            PRODUCTS LIST
        ====================================================== */}

        <div className="products-list">

          {products.map(
            (product, index) => {

              const isVeg =
                product.veg === 1;

              return (
                <div
                  key={
                    product.masterProductId ||
                    index
                  }
                  className="product-card"
                >

                  {/* PRODUCT DETAILS */}

                  <div className="product-details">

                    <h5>

                      {product.masterProductName}

                      <span>
                        {product.price || ""}
                      </span>

                    </h5>

                    <p>
                      {product.description}
                    </p>

                    <small>
                      Master Product ID:{" "}
                      {product.masterProductId}
                      {" | "}
                      Category ID:{" "}
                      {product.categoryId}
                    </small>

                  </div>

                  {/* PRODUCT PRICE */}

                  <div className="product-price">

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder={
                        defaultPrice ||
                        "Price"
                      }
                      disabled
                      value={
                        defaultPrice
                          ? defaultPrice
                          : ""
                      }
                      readOnly
                    />

                  </div>

                  {/* PRODUCT TIMING */}

                  <div className="product-time">

                    <input
                      type="text"
                      placeholder="e.g. 9:00-22:00"
                      disabled
                      value={defaultTiming}
                      readOnly
                    />

                  </div>

                  {/* PRODUCT TYPE */}

                  <div className="product-type">

                    <select
                      value={
                        defaultType ||
                        (isVeg
                          ? "Veg"
                          : "Non Veg")
                      }
                      disabled
                      onChange={() => {}}
                    >

                      <option value="Veg">
                        Veg
                      </option>

                      <option value="Non Veg">
                        Non Veg
                      </option>

                    </select>

                  </div>

                </div>
              );
            }
          )}

        </div>

        {/* =====================================================
            FOOTER
        ====================================================== */}

        <div className="outlet-footer">

          <button
            type="button"
            className="outlet-cancel-btn"
            disabled={isSaving}
            onClick={handleClose}
          >
            Cancel
          </button>

          <button
            type="button"
            className="outlet-save-btn"
            onClick={handleSaveProducts}
            disabled={
              products.length === 0 ||
              isSaving
            }
          >
            {isSaving
              ? "⏳ Saving..."
              : "💾 Save to Products"}
          </button>

        </div>

      </div>

    </div>
  );
}

export default AddToOutletProducts;