import "../styles/AddToOutletProducts.css";
import { useEffect, useMemo, useState } from "react";

import {
  getAllOutlets,
  mapProductsFromMaster,
} from "../services/masterProductsService";

function AddToOutletProducts({
  setShowOutletPopup,
  selectedProducts,
  setActivePage,
  initialOutletId,
  initialOutletCategoryId,
  initialCategoryId,
  initialOutletName,
}) {
  /* ============================================================
     PRODUCTS
     ============================================================ */

  const products = Array.isArray(selectedProducts)
    ? selectedProducts
    : [];

  /* ============================================================
     STATE
     ============================================================ */

  const [outlets, setOutlets] = useState([]);

  const [loadingOutlets, setLoadingOutlets] =
    useState(false);

  const [selectedOutletId, setSelectedOutletId] =
    useState(
      initialOutletId
        ? String(initialOutletId)
        : ""
    );

  const [selectedOutletName, setSelectedOutletName] =
    useState(
      initialOutletName || ""
    );

  const [outletCategoryId, setOutletCategoryId] =
    useState(
      initialOutletCategoryId
        ? String(initialOutletCategoryId)
        : ""
    );

  const [categoryId, setCategoryId] =
    useState(
      initialCategoryId
        ? String(initialCategoryId)
        : ""
    );

  const [isSaving, setIsSaving] =
    useState(false);

  const [mappingResult, setMappingResult] =
    useState(null);

  const [productEdits, setProductEdits] =
    useState({});

  /* ============================================================
     HELPER - PRODUCT ID
     ============================================================ */

  const getProductId = (product) => {
    return Number(
      product?.masterProductId ??
        product?.master_product_id ??
        product?.productId ??
        product?.product_id ??
        product?.id ??
        0
    );
  };

  /* ============================================================
     HELPER - PRODUCT NAME
     ============================================================ */

  const getProductName = (product) => {
    return (
      product?.masterProductName ||
      product?.productName ||
      product?.master_product_name ||
      product?.name ||
      "Unknown Product"
    );
  };

  /* ============================================================
     HELPER - VEG / NON-VEG
     ============================================================ */

  const getIsVeg = (product) => {
    if (
      typeof product?.isVeg ===
      "boolean"
    ) {
      return product.isVeg;
    }

    if (
      typeof product?.isVeg ===
      "string"
    ) {
      const value =
        product.isVeg
          .trim()
          .toLowerCase();

      if (value === "true") {
        return true;
      }

      if (value === "false") {
        return false;
      }
    }

    if (
      product?.veg !==
        undefined &&
      product?.veg !== null
    ) {
      if (
        product.veg === true ||
        product.veg === 1 ||
        product.veg === "1" ||
        String(product.veg)
          .toLowerCase() ===
          "true"
      ) {
        return true;
      }

      if (
        product.veg === false ||
        product.veg === 0 ||
        product.veg === "0" ||
        String(product.veg)
          .toLowerCase() ===
          "false"
      ) {
        return false;
      }
    }

    if (
      product?.nonVeg !==
        undefined &&
      product?.nonVeg !== null
    ) {
      if (
        product.nonVeg === true ||
        product.nonVeg === 1 ||
        product.nonVeg === "1" ||
        String(product.nonVeg)
          .toLowerCase() ===
          "true"
      ) {
        return false;
      }

      if (
        product.nonVeg === false ||
        product.nonVeg === 0 ||
        product.nonVeg === "0" ||
        String(product.nonVeg)
          .toLowerCase() ===
          "false"
      ) {
        return true;
      }
    }

    return false;
  };

  /* ============================================================
     HELPER - ORIGINAL MERCHANT PRICE
     ============================================================ */

  const getOriginalPrice = (product) => {
    const value =
      product?.merchantPrice ??
      product?.csvMerchantPrice ??
      product?.xlsMerchantPrice ??
      product?.merchant_price ??
      product?.csvPrice ??
      product?.xlsPrice ??
      product?.price ??
      "";

    if (
      value === null ||
      value === undefined
    ) {
      return "";
    }

    return String(value);
  };

  /* ============================================================
     HELPER - ORIGINAL TIMING
     ============================================================ */

  const getOriginalTiming = (product) => {
    const value =
      product?.timing ??
      product?.csvTiming ??
      product?.xlsTiming ??
      product?.csv_timing ??
      product?.xls_timing ??
      product?.time ??
      product?.timings ??
      "";

    if (
      value === null ||
      value === undefined
    ) {
      return "";
    }

    return String(value).trim();
  };

  /* ============================================================
     HELPER - DAY OF WEEK
     ============================================================ */

  const getDayOfWeek = (product) => {
    const value =
      product?.dayOfWeek ??
      product?.csvDayOfWeek ??
      product?.xlsDayOfWeek ??
      product?.daysofaweek ??
      product?.dayOfTheWeek ??
      product?.csv_day_of_week ??
      product?.xls_day_of_week ??
      "";

    if (
      value === null ||
      value === undefined
    ) {
      return "";
    }

    return String(value).trim();
  };

  /* ============================================================
     HELPER - DAY OF WEEK ID

     FmProductTimingRequestDto requires dayOfWeekId.
     Prefer an ID already supplied by the backend.
     Otherwise convert the CSV day name to the standard 1-7 value.
     ============================================================ */

  const getDayOfWeekId = (product) => {
    const explicitId =
      product?.dayOfWeekId ??
      product?.day_of_week_id;

    if (
      explicitId !== undefined &&
      explicitId !== null &&
      Number(explicitId) > 0
    ) {
      return Number(explicitId);
    }

    const day = getDayOfWeek(product)
      .trim()
      .toLowerCase();

    const dayMap = {
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
      sunday: 7,
    };

    return dayMap[day] ?? null;
  };

  /* ============================================================
     HELPER - BUILD TIMINGS

     Backend ProductEntry expects:

       List<FmProductTimingRequestDto> timings

     Each item must contain:
       productAvailableTimingId (optional)
       dayOfWeekId
       startTime
       endTime

     IMPORTANT:
     - timings is an ARRAY, never a string.
     - Do not send dayOfWeek inside ProductEntry.
     - Do not send timing inside ProductEntry.
     ============================================================ */

  const getProductTimings = (
    product,
    timingValue
  ) => {
    const dayOfWeekId = getDayOfWeekId(product);

    if (!dayOfWeekId) {
      console.warn(
        "[OUTLET] dayOfWeekId not found for product:",
        getProductName(product)
      );
      return [];
    }

    /*
     * If the product already has timing objects, preserve them
     * and normalize only the fields expected by the backend.
     */
    if (Array.isArray(product?.timings) && product.timings.length > 0) {
      const normalized = product.timings
        .map((item) => {
          const startTime = String(
            item?.startTime ??
              item?.start_time ??
              ""
          ).trim();

          const endTime = String(
            item?.endTime ??
              item?.end_time ??
              ""
          ).trim();

          if (!startTime || !endTime) {
            return null;
          }

          const timing = {
            dayOfWeekId: Number(
              item?.dayOfWeekId ??
                item?.day_of_week_id ??
                dayOfWeekId
            ),
            startTime,
            endTime,
          };

          const productAvailableTimingId =
            item?.productAvailableTimingId ??
            item?.product_available_timing_id;

          if (
            productAvailableTimingId !== undefined &&
            productAvailableTimingId !== null &&
            Number(productAvailableTimingId) > 0
          ) {
            timing.productAvailableTimingId = Number(
              productAvailableTimingId
            );
          }

          return timing;
        })
        .filter(Boolean);

      if (normalized.length > 0) {
        return normalized;
      }
    }

    const rawTiming = String(
      timingValue ?? ""
    )
      .trim()
      .replace(/–/g, "-");

    if (!rawTiming) {
      return [];
    }

    const parts = rawTiming
      .split("-")
      .map((value) => value.trim());

    if (parts.length !== 2) {
      console.warn(
        "[OUTLET] Invalid timing for product:",
        getProductName(product),
        rawTiming
      );
      return [];
    }

    const startTime = parts[0];
    const endTime = parts[1];

    if (!startTime || !endTime) {
      return [];
    }

    const timing = {
      dayOfWeekId: Number(dayOfWeekId),
      startTime,
      endTime,
    };

    const productAvailableTimingId =
      product?.productAvailableTimingId ??
      product?.product_available_timing_id;

    if (
      productAvailableTimingId !== undefined &&
      productAvailableTimingId !== null &&
      Number(productAvailableTimingId) > 0
    ) {
      timing.productAvailableTimingId = Number(
        productAvailableTimingId
      );
    }

    return [timing];
  };

  /* ============================================================
     HELPER - OUTLET ID
     ============================================================ */

  const getOutletId = (outlet) => {
    return Number(
      outlet?.outletId ??
        outlet?.outlet_id ??
        outlet?.id ??
        0
    );
  };

  /* ============================================================
     HELPER - OUTLET NAME
     ============================================================ */

  const getOutletName = (outlet) => {
    return (
      outlet?.outletName ||
      outlet?.outlet_name ||
      outlet?.name ||
      `Outlet ${getOutletId(outlet)}`
    );
  };

  /* ============================================================
     HELPER - OUTLET CATEGORY ID
     
     We DO NOT call outlet-details.
     We only read fields already returned by /outlets.
     ============================================================ */

  const getOutletCategoryId = (
    outlet
  ) => {
    return (
      outlet?.outletCategoryId ??
      outlet?.outlet_category_id ??
      outlet?.categoryId ??
      outlet?.outletCategory?.id ??
      outlet?.category?.id ??
      null
    );
  };

  /* ============================================================
     LOAD OUTLETS

     ONLY API CALL ON INITIAL LOAD:

     GET /api/fm/outlets

     IMPORTANT:
     There is NO outlet-details call.
     ============================================================ */

  useEffect(() => {
    let isMounted = true;

    const loadOutlets = async () => {
      setLoadingOutlets(true);

      try {
        console.log(
          "[OUTLET] Loading outlets..."
        );

        const response =
          await getAllOutlets();

        console.log(
          "[OUTLET] GET /api/fm/outlets response:",
          response?.data
        );

        const responseData =
          response?.data;

        let outletList = [];

        if (
          Array.isArray(
            responseData
          )
        ) {
          outletList =
            responseData;
        } else if (
          Array.isArray(
            responseData?.data
          )
        ) {
          outletList =
            responseData.data;
        } else if (
          Array.isArray(
            responseData?.content
          )
        ) {
          outletList =
            responseData.content;
        } else if (
          Array.isArray(
            responseData?.outlets
          )
        ) {
          outletList =
            responseData.outlets;
        }

        if (
          !isMounted
        ) {
          return;
        }

        setOutlets(
          outletList
        );

        /*
         * If an initial outlet was supplied,
         * find its details from the already
         * loaded /outlets response.
         *
         * NO SECOND API CALL.
         */
        if (
          initialOutletId
        ) {
          const existingOutlet =
            outletList.find(
              (outlet) =>
                String(
                  getOutletId(
                    outlet
                  )
                ) ===
                String(
                  initialOutletId
                )
            );

          if (
            existingOutlet
          ) {
            setSelectedOutletName(
              getOutletName(
                existingOutlet
              )
            );

            const existingOutletCategoryId =
              getOutletCategoryId(
                existingOutlet
              );

            if (
              existingOutletCategoryId
            ) {
              setOutletCategoryId(
                String(
                  existingOutletCategoryId
                )
              );
            }
          }
        }
      } catch (error) {
        console.error(
          "[OUTLET] Failed to load outlets:",
          error
        );

        if (
          isMounted
        ) {
          alert(
            "Failed to load outlets."
          );
        }
      } finally {
        if (
          isMounted
        ) {
          setLoadingOutlets(
            false
          );
        }
      }
    };

    loadOutlets();

    return () => {
      isMounted = false;
    };
  }, [initialOutletId]);

  /* ============================================================
     INITIAL OUTLET ID
     ============================================================ */

  useEffect(() => {
    if (
      initialOutletId
    ) {
      setSelectedOutletId(
        String(
          initialOutletId
        )
      );
    }
  }, [initialOutletId]);

  /* ============================================================
     INITIAL OUTLET CATEGORY ID
     ============================================================ */

  useEffect(() => {
    if (
      initialOutletCategoryId
    ) {
      setOutletCategoryId(
        String(
          initialOutletCategoryId
        )
      );
    }
  }, [
    initialOutletCategoryId,
  ]);

  /* ============================================================
     INITIAL CATEGORY ID
     ============================================================ */

  useEffect(() => {
    if (
      initialCategoryId
    ) {
      setCategoryId(
        String(
          initialCategoryId
        )
      );
    }
  }, [
    initialCategoryId,
  ]);

  /* ============================================================
     INITIAL OUTLET NAME
     ============================================================ */

  useEffect(() => {
    if (
      initialOutletName
    ) {
      setSelectedOutletName(
        initialOutletName
      );
    }
  }, [
    initialOutletName,
  ]);

  /* ============================================================
     CATEGORY ID FROM SELECTED PRODUCTS
     ============================================================ */

  useEffect(() => {
    if (
      categoryId
    ) {
      return;
    }

    const categoryIds =
      products
        .map(
          (product) =>
            Number(
              product?.categoryId ??
                product?.category_id ??
                0
            )
        )
        .filter(
          (id) =>
            Number.isInteger(
              id
            ) &&
            id > 0
        );

    const uniqueCategoryIds =
      [
        ...new Set(
          categoryIds
        ),
      ];

    if (
      uniqueCategoryIds.length ===
      1
    ) {
      setCategoryId(
        String(
          uniqueCategoryIds[0]
        )
      );
    }
  }, [
    products,
    categoryId,
  ]);

  /* ============================================================
     OUTLET CHANGE

     VERY IMPORTANT:

     Selecting an outlet DOES NOT call any API.

     We only update local state.
     ============================================================ */

  const handleOutletChange =
    (event) => {
      const value =
        event.target.value;

      console.log(
        "[OUTLET] Selected outlet:",
        value
      );

      setSelectedOutletId(
        value
      );

      const selectedOutlet =
        outlets.find(
          (outlet) =>
            String(
              getOutletId(
                outlet
              )
            ) ===
            String(value)
        );

      if (
        !selectedOutlet
      ) {
        setSelectedOutletName(
          ""
        );

        /*
         * Do NOT call any API here.
         */
        return;
      }

      setSelectedOutletName(
        getOutletName(
          selectedOutlet
        )
      );

      /*
       * Get outletCategoryId ONLY from
       * the already loaded outlet object.
       *
       * No API request.
       */
      const selectedOutletCategoryId =
        getOutletCategoryId(
          selectedOutlet
        );

      if (
        selectedOutletCategoryId
      ) {
        setOutletCategoryId(
          String(
            selectedOutletCategoryId
          )
        );
      } else {
        /*
         * Do not disable Save if the outlet
         * doesn't provide outletCategoryId.
         */
        setOutletCategoryId(
          ""
        );
      }
    };

  /* ============================================================
     INITIAL PRODUCT EDIT VALUES
     ============================================================ */

  useEffect(() => {
    const initialEdits = {};

    products.forEach(
      (product) => {
        const id =
          getProductId(
            product
          );

        if (!id) {
          return;
        }

        initialEdits[id] = {
          merchantPrice:
            getOriginalPrice(
              product
            ),

          timing:
            getOriginalTiming(
              product
            ),
        };
      }
    );

    setProductEdits(
      initialEdits
    );
  }, [
    selectedProducts,
  ]);

  /* ============================================================
     GET CURRENT PRODUCT EDIT
     ============================================================ */

  const getEdit = (
    product
  ) => {
    const id =
      getProductId(
        product
      );

    return (
      productEdits[id] || {
        merchantPrice:
          getOriginalPrice(
            product
          ),

        timing:
          getOriginalTiming(
            product
          ),
      }
    );
  };

  /* ============================================================
     UPDATE MERCHANT PRICE / TIMING
     ============================================================ */

  const updateProductEdit = (
    product,
    field,
    value
  ) => {
    const id =
      getProductId(
        product
      );

    if (!id) {
      return;
    }

    setProductEdits(
      (current) => ({
        ...current,

        [id]: {
          ...(current[id] || {
            merchantPrice:
              getOriginalPrice(
                product
              ),

            timing:
              getOriginalTiming(
                product
              ),
          }),

          [field]:
            value,
        },
      })
    );
  };

  /* ============================================================
     CLOSE SCREEN
     ============================================================ */

  const closeScreen = () => {
    if (
      typeof setShowOutletPopup ===
      "function"
    ) {
      setShowOutletPopup(
        false
      );

      return;
    }

    if (
      typeof setActivePage ===
      "function"
    ) {
      setActivePage(
        "masterProducts"
      );
    }
  };

  /* ============================================================
     BUILD PAYLOAD

     POST /api/fm/products/from-master

     IMPORTANT:
     The backend ProductEntry DTO accepts `csvTiming`, `csvDayOfWeek`
     and `timings[]`. It does NOT accept `timing` or `dayOfWeek`.
     ============================================================ */

  const buildPayload =
    () => {
      const payload = {
        /*
         * If available, send outletCategoryId.
         * If unavailable, send null.
         *
         * It does NOT disable the Save button.
         */
        outletCategoryId:
          outletCategoryId
            ? Number(
                outletCategoryId
              )
            : null,

        outletId:
          Number(
            selectedOutletId
          ),

        categoryId:
          Number(
            categoryId
          ) > 0
            ? Number(
                categoryId
              )
            : null,

        /*
         * Product toggle flag.
         * Always send true when mapping products from master.
         */
        isToggle: true,

        products:
          products.map(
            (product) => {
              const productId =
                getProductId(
                  product
                );

              const edit =
                getEdit(
                  product
                );

              const merchantPrice =
                edit.merchantPrice ===
                ""
                  ? 0
                  : Number(
                      edit.merchantPrice
                    );

              const timing =
                String(
                  edit.timing ||
                    ""
                ).trim();

              const dayOfWeek =
                getDayOfWeek(
                  product
                );

              return {
                /*
                 * MASTER PRODUCT ID
                 */
                masterProductId:
                  productId,

                /*
                 * PRODUCT NAME
                 */
                productName:
                  getProductName(
                    product
                  ),

                /*
                 * DESCRIPTION
                 */
                description:
                  product?.description ||
                  product?.productDescription ||
                  "",

                /*
                 * CATEGORY
                 */
                categoryId:
                  product?.categoryId !==
                    undefined &&
                  product?.categoryId !==
                    null
                    ? Number(
                        product.categoryId
                      )
                    : null,

                categoryName:
                  product?.categoryName ||
                  "",

                /*
                 * PRODUCT TYPE
                 */
                productType:
                  product?.productType ||
                  product?.type ||
                  "",

                /*
                 * VEG STATUS
                 */
                isVeg:
                  getIsVeg(
                    product
                  ),

                /*
                 * VARIANTS
                 */
                hasProductVariants:
                  product?.hasProductVariants ??
                  false,

                /*
                 * MERCHANT PRICE
                 *
                 * This is the edited UI value.
                 */
                merchantPrice:
                  merchantPrice,

                /*
                 * IMAGE
                 */
                imageLink:
                  product?.photo ||
                  product?.imageLink ||
                  product?.imageUrl ||
                  product?.image ||
                  "",

                /*
                 * VARIANT GROUPS
                 */
                variantGroups:
                  product?.variantGroups ||
                  [],

                /*
                 * CSV TIMING
                 *
                 * ProductEntry has csvTiming, but it does NOT have
                 * a plain `timing` property.
                 */
                csvTiming:
                  timing,

                /*
                 * CSV DAY OF WEEK
                 *
                 * ProductEntry has csvDayOfWeek, but it does NOT have
                 * a plain `dayOfWeek` property.
                 */
                csvDayOfWeek:
                  dayOfWeek,

                /*
                 * API TIMINGS
                 *
                 * FmProductTimingRequestDto expects an ARRAY.
                 */
                timings:
                  getProductTimings(
                    product,
                    timing
                  ),
              };
            }
          ),
      };

      return payload;
    };

  /* ============================================================
     SAVE PRODUCTS

     ONLY:

     mapProductsFromMaster(payload)

     NO outlet-details API.
     NO updateProductDetails API.
     ============================================================ */

  const saveProducts =
    async () => {
      console.log(
        "=========================================="
      );

      console.log(
        "[OUTLET] SAVE PRODUCTS CLICKED"
      );

      console.log(
        "=========================================="
      );

      /* --------------------------------------------------------
         VALIDATION
         -------------------------------------------------------- */

      if (
        products.length ===
        0
      ) {
        alert(
          "Please select at least one product."
        );

        return;
      }

      if (
        !selectedOutletId
      ) {
        alert(
          "Please select an outlet."
        );

        return;
      }

      const invalidProduct =
        products.find(
          (product) =>
            getProductId(
              product
            ) <= 0
        );

      if (
        invalidProduct
      ) {
        alert(
          `Invalid Master Product ID for ${getProductName(
            invalidProduct
          )}.`
        );

        return;
      }

      const invalidPrice =
        products.find(
          (product) => {
            const price =
              getEdit(
                product
              ).merchantPrice;

            return (
              price !== "" &&
              Number.isNaN(
                Number(
                  price
                )
              )
            );
          }
        );

      if (
        invalidPrice
      ) {
        alert(
          `Invalid merchant price for ${getProductName(
            invalidPrice
          )}.`
        );

        return;
      }

      /* --------------------------------------------------------
         BUILD PAYLOAD
         -------------------------------------------------------- */

      const payload =
        buildPayload();

      console.log(
        "[OUTLET] SELECTED OUTLET ID:",
        selectedOutletId
      );

      console.log(
        "[OUTLET] SELECTED OUTLET NAME:",
        selectedOutletName
      );

      console.log(
        "[OUTLET] OUTLET CATEGORY ID:",
        outletCategoryId
      );

      console.log(
        "[OUTLET] CATEGORY ID:",
        categoryId
      );

      console.log(
        "[OUTLET] IS TOGGLE:",
        payload.isToggle
      );

      console.log(
        "[OUTLET] FINAL PAYLOAD:"
      );

      console.log(
        JSON.stringify(
          payload,
          null,
          2
        )
      );

      /* --------------------------------------------------------
         START SAVING
         -------------------------------------------------------- */

      setIsSaving(
        true
      );

      try {
        /*
         * ======================================================
         * ONLY API CALL FOR SAVE
         * ======================================================
         *
         * POST
         * /api/fm/products/from-master
         *
         * NO OTHER API.
         */

        const response =
          await mapProductsFromMaster(
            payload
          );

        console.log(
          "[OUTLET] SAVE API RESPONSE:",
          response
        );

        console.log(
          "[OUTLET] SAVE API RESPONSE DATA:",
          response?.data
        );

        /* ------------------------------------------------------
           RESPONSE DATA
           ------------------------------------------------------ */

        const result =
          response?.data?.data ??
          response?.data ??
          {};

        const savedCount =
          Number(
            result?.savedCount ??
              payload.products
                .length
          );

        const skippedCount =
          Number(
            result?.skippedCount ??
              0
          );

        const savedNames =
          Array.isArray(
            result?.savedNames
          )
            ? result.savedNames
            : [];

        const skippedNames =
          Array.isArray(
            result?.skippedNames
          )
            ? result.skippedNames
            : [];

        /* ------------------------------------------------------
           SAVED PRODUCTS
           ------------------------------------------------------ */

        let savedProducts =
          Array.isArray(
            result?.savedProducts
          )
            ? result.savedProducts
            : [];

        /*
         * If backend doesn't return savedProducts,
         * use the values we sent from the UI.
         */
        if (
          savedProducts.length ===
          0
        ) {
          const skippedSet =
            new Set(
              skippedNames.map(
                (name) =>
                  String(
                    name
                  )
                    .replace(
                      " (Already Exists)",
                      ""
                    )
                    .trim()
                    .toLowerCase()
              )
            );

          savedProducts =
            payload.products
              .filter(
                (product) =>
                  !skippedSet.has(
                    String(
                      product.productName
                    )
                      .trim()
                      .toLowerCase()
                  )
              )
              .map(
                (product) => ({
                  productName:
                    product.productName,

                  merchantPrice:
                    product.merchantPrice,

                  timing:
                    product.csvTiming,

                  dayOfWeek:
                    product.csvDayOfWeek,

                  isVeg:
                    product.isVeg,
                })
              );
        }

        /* ------------------------------------------------------
           NORMALIZE BACKEND SAVED PRODUCTS
           ------------------------------------------------------ */

        if (
          Array.isArray(
            result?.savedProducts
          ) &&
          result.savedProducts
            .length > 0
        ) {
          savedProducts =
            result.savedProducts.map(
              (item) => ({
                productName:
                  item?.productName ||
                  item?.masterProductName ||
                  "",

                merchantPrice:
                  item?.merchantPrice ??
                  item?.csvMerchantPrice ??
                  item?.xlsMerchantPrice ??
                  0,

                timing:
                  item?.timing ??
                  item?.csvTiming ??
                  item?.xlsTiming ??
                  "",

                dayOfWeek:
                  item?.dayOfWeek ??
                  item?.csvDayOfWeek ??
                  item?.xlsDayOfWeek ??
                  "",

                isVeg:
                  getIsVeg(
                    item
                  ),
              })
            );
        }

        /* ------------------------------------------------------
           SKIPPED PRODUCTS
           ------------------------------------------------------ */

        let skippedProducts =
          Array.isArray(
            result?.skippedProducts
          )
            ? result.skippedProducts
            : [];

        if (
          skippedProducts.length ===
            0 &&
          skippedNames.length >
            0
        ) {
          skippedProducts =
            skippedNames.map(
              (name) => ({
                productName:
                  String(
                    name
                  )
                    .replace(
                      " (Already Exists)",
                      ""
                    )
                    .trim(),

                reason:
                  String(
                    name
                  ).includes(
                    "Already Exists"
                  )
                    ? "Product already exists in this outlet"
                    : "Product was skipped by the backend",
              })
            );
        }

        /* ------------------------------------------------------
           SAVE RESULT
           ------------------------------------------------------ */

        setMappingResult({
          savedCount,

          skippedCount,

          savedNames,

          savedProducts,

          skippedProducts,
        });

        console.log(
          "[OUTLET] SAVE SUCCESS"
        );
      } catch (
        error
      ) {
        console.error(
          "[OUTLET] SAVE FAILED:",
          error
        );

        console.error(
          "[OUTLET] API ERROR:",
          error?.response?.data
        );

        const message =
          error?.response
            ?.data?.message ||
          error?.response
            ?.data?.error ||
          error?.message ||
          "Failed to save products.";

        alert(
          message
        );
      } finally {
        setIsSaving(
          false
        );
      }
    };

  /* ============================================================
     RESULT PRODUCTS
     ============================================================ */

  const resultProducts =
    useMemo(
      () =>
        mappingResult?.savedProducts ||
        [],
      [
        mappingResult,
      ]
    );

  /* ============================================================
     RESULT SCREEN
     ============================================================ */

  if (
    mappingResult
  ) {
    return (
      <div className="outlet-page outlet-fullscreen-page outlet-result-fullscreen">

        <div className="outlet-card mapping-result-card">

          {/* ==================================================
              HEADER
              ================================================== */}

          <div className="outlet-header">

            <div>

              <h2>
                📊 Product Mapping Result
              </h2>

              <p className="fullscreen-subtitle">

                Outlet:{" "}

                <strong>
                  {selectedOutletName ||
                    "Selected Outlet"}
                </strong>

              </p>

            </div>

            <button
              type="button"
              className="close-btn"
              onClick={
                closeScreen
              }
            >
              ✕
            </button>

          </div>

          {/* ==================================================
              SUMMARY
              ================================================== */}

          <div className="mapping-summary">

            <div className="mapping-summary-card mapping-summary-success">

              <div className="mapping-summary-icon">
                ✅
              </div>

              <div className="mapping-summary-count">
                {
                  mappingResult.savedCount
                }
              </div>

              <div className="mapping-summary-label">
                Successfully Added
              </div>

            </div>

            <div className="mapping-summary-card mapping-summary-skipped">

              <div className="mapping-summary-icon">
                ⏭️
              </div>

              <div className="mapping-summary-count">
                {
                  mappingResult.skippedCount
                }
              </div>

              <div className="mapping-summary-label">
                Skipped
              </div>

            </div>

          </div>

          {/* ==================================================
              SAVED PRODUCTS
              ================================================== */}

          {resultProducts.length >
            0 && (
            <section className="mapping-saved-section">

              <h3>
                ✅ Successfully Added
                Products
              </h3>

              <div className="mapping-saved-list">

                {resultProducts.map(
                  (
                    item,
                    index
                  ) => (
                    <div
                      className="mapping-saved-item"
                      key={`${item.productName}-${index}`}
                    >

                      <div className="mapping-saved-name">

                        <span className="mapping-check">
                          ✓
                        </span>

                        <span className="mapping-product-name">
                          {
                            item.productName
                          }
                        </span>

                        <span
                          className={`product-veg-badge ${
                            item.isVeg
                              ? "veg"
                              : "nonveg"
                          }`}
                        >
                          {item.isVeg
                            ? "VEG"
                            : "NON-VEG"}
                        </span>

                      </div>

                      <div className="mapping-saved-meta">

                        <span className="mapping-saved-price">

                          {item.merchantPrice !==
                            null &&
                          item.merchantPrice !==
                            undefined
                            ? `₹${Number(
                                item.merchantPrice
                              ).toFixed(
                                2
                              )}`
                            : "₹0.00"}

                        </span>

                        {item.timing && (
                          <span className="mapping-saved-time">
                            {
                              item.timing
                            }
                          </span>
                        )}

                        {item.dayOfWeek && (
                          <span className="mapping-saved-time">
                            {
                              item.dayOfWeek
                            }
                          </span>
                        )}

                      </div>

                    </div>
                  )
                )}

              </div>

            </section>
          )}

          {/* ==================================================
              SKIPPED PRODUCTS
              ================================================== */}

          {mappingResult.skippedCount >
            0 && (
            <section className="mapping-skipped-section">

              <h3>
                ⏭️ Skipped Products
              </h3>

              <div className="mapping-skipped-list">

                {(
                  mappingResult.skippedProducts ||
                  []
                ).map(
                  (
                    item,
                    index
                  ) => (
                    <div
                      className="mapping-skipped-item"
                      key={`${item?.productName || "skipped"}-${index}`}
                    >

                      <div className="mapping-skipped-name">

                        ⏭️{" "}

                        {item?.productName ||
                          "Unknown Product"}

                      </div>

                      <div className="mapping-skipped-reason">

                        <strong>
                          Reason:
                        </strong>{" "}

                        {item?.reason ||
                          "Product was skipped"}

                      </div>

                    </div>
                  )
                )}

              </div>

            </section>
          )}

          {/* ==================================================
              SUCCESS MESSAGE
              ================================================== */}

          {mappingResult.skippedCount ===
            0 && (
            <div className="mapping-all-saved">
              🎉 All selected products
              were successfully added.
            </div>
          )}

          {/* ==================================================
              RESULT FOOTER
              ================================================== */}

          <div className="outlet-footer">

            <button
              type="button"
              className="outlet-cancel-btn"
              onClick={
                closeScreen
              }
            >
              Close
            </button>

            <button
              type="button"
              className="outlet-save-btn"
              onClick={() =>
                setMappingResult(
                  null
                )
              }
            >
              ← Back
            </button>

          </div>

        </div>

      </div>
    );
  }

  /* ============================================================
     MAIN SCREEN
     ============================================================ */

  return (
    <div className="outlet-page outlet-fullscreen-page">

      <div className="outlet-card outlet-simple-card">

        {/* ======================================================
            HEADER
            ====================================================== */}

        <div className="outlet-header">

          <div>

            <h2>
              📂 Add to Outlet Products
            </h2>

            <p className="fullscreen-subtitle">
              Select an outlet and add the
              selected products.
            </p>

          </div>

          <button
            type="button"
            className="close-btn"
            onClick={
              closeScreen
            }
            disabled={
              isSaving
            }
          >
            ✕
          </button>

        </div>

        {/* ======================================================
            OUTLET
            ====================================================== */}

        <div className="outlet-selection-section">

          <div className="outlet-selection-label">

            <label htmlFor="outletDropdown">

              Outlet

              <span className="required-star">
                *
              </span>

            </label>

          </div>

          <select
            id="outletDropdown"
            className="outlet-dropdown"
            value={
              selectedOutletId
            }
            onChange={
              handleOutletChange
            }
            disabled={
              loadingOutlets ||
              isSaving
            }
          >

            <option value="">
              {loadingOutlets
                ? "Loading outlets..."
                : "Select outlet"}
            </option>

            {outlets.map(
              (outlet) => {
                const id =
                  getOutletId(
                    outlet
                  );

                if (!id) {
                  return null;
                }

                return (
                  <option
                    key={id}
                    value={id}
                  >
                    {getOutletName(
                      outlet
                    )}
                  </option>
                );
              }
            )}

          </select>

          {selectedOutletId && (
            <div className="outlet-selected-info">

              Selected Outlet:{" "}

              <strong>
                {selectedOutletName ||
                  "Selected Outlet"}
              </strong>

            </div>
          )}

        </div>

        {/* ======================================================
            INFO BAR
            ====================================================== */}

        <div className="simple-outlet-info">

          <span>

            <strong>
              {products.length}
            </strong>{" "}

            product
            {products.length ===
            1
              ? ""
              : "s"} selected

          </span>

          <span>
            Only merchant price, timing
            and VEG status are shown
            here.
          </span>

        </div>

        {/* ======================================================
            PRODUCTS
            ====================================================== */}

        <div className="outlet-body simple-outlet-body">

          <div className="simple-product-table">

            {/* ==================================================
                HEADER
                ================================================== */}

            <div className="simple-product-row simple-product-header">

              <div>
                PRODUCT
              </div>

              <div>
                MERCHANT PRICE
              </div>

              <div>
                TIMING
              </div>

              <div>
                VEG / NON-VEG
              </div>

            </div>

            {/* ==================================================
                PRODUCT ROWS
                ================================================== */}

            {products.map(
              (
                product,
                index
              ) => {
                const id =
                  getProductId(
                    product
                  );

                const edit =
                  getEdit(
                    product
                  );

                const isVeg =
                  getIsVeg(
                    product
                  );

                const day =
                  getDayOfWeek(
                    product
                  );

                return (
                  <div
                    className="simple-product-row"
                    key={
                      id ||
                      `product-${index}`
                    }
                  >

                    {/* ==========================================
                        PRODUCT
                        ========================================== */}

                    <div className="simple-product-name-cell">

                      <strong>
                        {getProductName(
                          product
                        )}
                      </strong>

                      {product?.description && (
                        <small>
                          {
                            product.description
                          }
                        </small>
                      )}

                    </div>

                    {/* ==========================================
                        MERCHANT PRICE
                        ========================================== */}

                    <div className="simple-input-cell">

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={
                          edit.merchantPrice
                        }
                        disabled={
                          isSaving
                        }
                        placeholder="Merchant price"
                        onChange={(
                          event
                        ) =>
                          updateProductEdit(
                            product,
                            "merchantPrice",
                            event.target
                              .value
                          )
                        }
                      />

                    </div>

                    {/* ==========================================
                        TIMING
                        ========================================== */}

                    <div className="simple-input-cell">

                      <input
                        type="text"
                        value={
                          edit.timing
                        }
                        disabled={
                          isSaving
                        }
                        placeholder="11:00-22:00"
                        onChange={(
                          event
                        ) =>
                          updateProductEdit(
                            product,
                            "timing",
                            event.target
                              .value
                          )
                        }
                      />

                      {day && (
                        <small>
                          {day}
                        </small>
                      )}

                    </div>

                    {/* ==========================================
                        VEG
                        ========================================== */}

                    <div className="simple-veg-cell">

                      <span
                        className={`product-veg-badge ${
                          isVeg
                            ? "veg"
                            : "nonveg"
                        }`}
                      >
                        {isVeg
                          ? "VEG"
                          : "NON-VEG"}
                      </span>

                    </div>

                  </div>
                );
              }
            )}

            {/* ==================================================
                EMPTY STATE
                ================================================== */}

            {products.length ===
              0 && (
              <div className="simple-empty-state">
                No products selected.
              </div>
            )}

          </div>

        </div>

        {/* ======================================================
            FOOTER
            ====================================================== */}

        <div className="outlet-footer">

          <button
            type="button"
            className="outlet-cancel-btn"
            disabled={
              isSaving
            }
            onClick={
              closeScreen
            }
          >
            Cancel
          </button>

          <button
            type="button"
            className="outlet-save-btn"

            /*
             * IMPORTANT:
             *
             * outletCategoryId is NOT included here.
             *
             * Therefore Save Products will NOT be
             * disabled just because outletCategoryId
             * is missing.
             */
            disabled={
              products.length ===
                0 ||
              !selectedOutletId ||
              isSaving
            }

            onClick={
              saveProducts
            }
          >

            {isSaving
              ? "⏳ Saving..."
              : "Save Products"}

          </button>

        </div>

      </div>

    </div>
  );
}

export default AddToOutletProducts;