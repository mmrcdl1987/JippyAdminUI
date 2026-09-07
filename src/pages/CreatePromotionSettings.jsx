import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  createPromotionSetting,
  getCampaignLocations,
} from "../services/promotionSettingsService";

import { FM_API } from "../services/api";

import "../styles/PromotionSettingss.css";

/* =========================================================
   CREATE PROMOTION SETTINGS
   ========================================================= */

const CreatePromotionSettings = () => {
  const navigate = useNavigate();

  /* =========================================================
     FORM DATA
     ========================================================= */

  const [formData, setFormData] = useState({
    outletId: "",
    productId: "",
    productVariantId: "",

    startDateTime: "",
    endDateTime: "",

    priceValue: "",
    priceType: "FLAT",
    priceAdjustmentType: "INCREASE",

    locationId: "",
    locationType: "AREA",
  });

  /* =========================================================
     LOCATION
     ========================================================= */

  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);

  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedArea, setSelectedArea] = useState("");

  /* =========================================================
     OUTLETS / PRODUCTS / VARIANTS
     ========================================================= */

  const [outlets, setOutlets] = useState([]);
  const [products, setProducts] = useState([]);
  const [productVariants, setProductVariants] = useState([]);

  /* =========================================================
     LOADING
     ========================================================= */

  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [loadingOutlets, setLoadingOutlets] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [loading, setLoading] = useState(false);

  /* =========================================================
     MESSAGES
     ========================================================= */

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* =========================================================
     ARRAY HELPER
     ========================================================= */

  const getArray = (response) => {
    const data = response?.data;

    if (Array.isArray(data)) {
      return data;
    }

    if (Array.isArray(data?.data)) {
      return data.data;
    }

    if (Array.isArray(data?.content)) {
      return data.content;
    }

    if (Array.isArray(data?.items)) {
      return data.items;
    }

    if (Array.isArray(data?.results)) {
      return data.results;
    }

    return [];
  };

  /* =========================================================
     ID HELPER
     ========================================================= */

  const getId = (item, keys) => {
    for (const key of keys) {
      if (
        item?.[key] !== undefined &&
        item?.[key] !== null &&
        item?.[key] !== ""
      ) {
        return item[key];
      }
    }

    return "";
  };

  /* =========================================================
     NAME HELPER
     ========================================================= */

  const getName = (item, keys) => {
    for (const key of keys) {
      if (
        item?.[key] !== undefined &&
        item?.[key] !== null &&
        String(item[key]).trim() !== ""
      ) {
        return item[key];
      }
    }

    return "";
  };

  /* =========================================================
     OUTLET HELPERS
     ========================================================= */

  const getOutletId = (outlet) => {
    return getId(outlet, [
      "outletId",
      "id",
      "outletID",
    ]);
  };

  const getOutletName = (outlet) => {
    return getName(outlet, [
      "outletName",
      "name",
      "outlet_name",
    ]);
  };

  /* =========================================================
     PRODUCT HELPERS
     ========================================================= */

  const getProductId = (product) => {
    return getId(product, [
      "productId",
      "id",
      "productID",
    ]);
  };

  const getProductName = (product) => {
    return getName(product, [
      "productName",
      "name",
      "product_name",
    ]);
  };

  /* =========================================================
     VARIANT HELPERS
     ========================================================= */

  const getVariantId = (variant) => {
    return getId(variant, [
      "productVariantId",
      "variantId",
      "productVariantID",
      "id",
    ]);
  };

  const getVariantName = (variant) => {
    return getName(variant, [
      "productVariantName",
      "variantName",
      "productVariant",
      "name",
      "variant_name",
      "optionName",
      "value",
    ]);
  };

  /* =========================================================
     GET LOCATION ID BASED ON LOCATION TYPE

     STATE -> selectedState
     CITY  -> selectedCity
     AREA  -> selectedArea
     ========================================================= */

  const getSelectedLocationId = (
    locationType = formData.locationType
  ) => {
    switch (locationType) {
      case "STATE":
        return selectedState;

      case "CITY":
        return selectedCity;

      case "AREA":
        return selectedArea;

      default:
        return "";
    }
  };

  /* =========================================================
     LOAD STATES

     GET:
     /api/fm/location/fetchStates
     ========================================================= */

  useEffect(() => {
    loadStates();
  }, []);

  const loadStates = async () => {
    try {
      setLoadingStates(true);
      setError("");

      const response = await FM_API.get(
        "/api/fm/location/fetchStates"
      );

      console.log(
        "States response:",
        response.data
      );

      setStates(getArray(response));
    } catch (err) {
      console.error(
        "Failed to load states:",
        err
      );

      setStates([]);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.errorMessage ||
          "Failed to load states."
      );
    } finally {
      setLoadingStates(false);
    }
  };

  /* =========================================================
     FETCH OUTLETS BY LOCATION

     GET:
     /api/fm/campaign/location

     PARAMS:
     stateId
     cityId
     areaId

     IMPORTANT:
     This API requires all 3 IDs to find the outlets.

     Response:

     {
       states: null,
       cities: [],
       areas: [],
       outlets: [
         {
           outletId: 191,
           outletName: "Friends Restaurant"
         }
       ]
     }
     ========================================================= */

  const fetchOutletsByLocation = async ({
    stateId,
    cityId,
    areaId,
  }) => {
    if (!stateId || !cityId || !areaId) {
      setOutlets([]);
      return;
    }

    try {
      setLoadingOutlets(true);
      setError("");

      console.log(
        "Fetching campaign locations:",
        {
          stateId,
          cityId,
          areaId,
        }
      );

      const data =
        await getCampaignLocations({
          stateId: Number(stateId),
          cityId: Number(cityId),
          areaId: Number(areaId),
        });

      console.log(
        "Campaign location response:",
        data
      );

      /* =====================================================
         IMPORTANT FIX

         API returns:

         {
           states: null,
           cities: [],
           areas: [],
           outlets: [...]
         }

         So use:

         data.outlets
         ===================================================== */

      let outletList = [];

      if (
        Array.isArray(data?.outlets)
      ) {
        outletList = data.outlets;
      } else if (
        Array.isArray(
          data?.data?.outlets
        )
      ) {
        outletList =
          data.data.outlets;
      }

      console.log(
        "Outlet list:",
        outletList
      );

      /* =====================================================
         REMOVE DUPLICATES
         ===================================================== */

      const uniqueOutletMap =
        new Map();

      outletList.forEach(
        (outlet, index) => {
          const id =
            getOutletId(outlet);

          const key =
            id !== "" &&
            id !== null
              ? String(id)
              : `outlet-${index}`;

          if (
            !uniqueOutletMap.has(key)
          ) {
            uniqueOutletMap.set(
              key,
              outlet
            );
          }
        }
      );

      const uniqueOutlets =
        Array.from(
          uniqueOutletMap.values()
        );

      setOutlets(
        uniqueOutlets
      );

      /* =====================================================
         RESET PRODUCT DATA
         ===================================================== */

      setProducts([]);
      setProductVariants([]);

      setFormData((prev) => ({
        ...prev,
        outletId: "",
        productId: "",
        productVariantId: "",
      }));
    } catch (err) {
      console.error(
        "Failed to load outlets:",
        err
      );

      setOutlets([]);
      setProducts([]);
      setProductVariants([]);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.errorMessage ||
          err?.message ||
          "Failed to load outlets."
      );
    } finally {
      setLoadingOutlets(false);
    }
  };

  /* =========================================================
     STATE CHANGE

     STATE
       ↓
     CITY

     Does NOT call campaign/location yet.
     ========================================================= */

  const handleStateChange = async (
    event
  ) => {
    const stateId =
      event.target.value;

    setSelectedState(
      stateId
    );

    setSelectedCity("");
    setSelectedArea("");

    setCities([]);
    setAreas([]);
    setOutlets([]);
    setProducts([]);
    setProductVariants([]);

    setFormData((prev) => ({
      ...prev,
      locationId: "",
      outletId: "",
      productId: "",
      productVariantId: "",
    }));

    if (!stateId) {
      return;
    }

    try {
      setLoadingCities(true);
      setError("");

      const response =
        await FM_API.get(
          "/api/fm/location/fetchCityInState",
          {
            params: {
              stateId: Number(
                stateId
              ),
            },
          }
        );

      console.log(
        "Cities response:",
        response.data
      );

      setCities(
        getArray(response)
      );
    } catch (err) {
      console.error(
        "Failed to load cities:",
        err
      );

      setCities([]);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.errorMessage ||
          "Failed to load cities."
      );
    } finally {
      setLoadingCities(false);
    }
  };

  /* =========================================================
     CITY CHANGE

     CITY
       ↓
     AREA
     ========================================================= */

  const handleCityChange = async (
    event
  ) => {
    const cityId =
      event.target.value;

    setSelectedCity(
      cityId
    );

    setSelectedArea("");

    setAreas([]);
    setOutlets([]);
    setProducts([]);
    setProductVariants([]);

    setFormData((prev) => ({
      ...prev,
      locationId: "",
      outletId: "",
      productId: "",
      productVariantId: "",
    }));

    if (!cityId) {
      return;
    }

    try {
      setLoadingAreas(true);
      setError("");

      const response =
        await FM_API.get(
          "/api/fm/location/fetchAreaInCity",
          {
            params: {
              cityId: Number(
                cityId
              ),
            },
          }
        );

      console.log(
        "Areas response:",
        response.data
      );

      setAreas(
        getArray(response)
      );
    } catch (err) {
      console.error(
        "Failed to load areas:",
        err
      );

      setAreas([]);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.errorMessage ||
          "Failed to load areas."
      );
    } finally {
      setLoadingAreas(false);
    }
  };

  /* =========================================================
     AREA CHANGE

     STATE + CITY + AREA
            ↓
     /api/fm/campaign/location
            ↓
         OUTLETS
     ========================================================= */

  const handleAreaChange = async (
    event
  ) => {
    const areaId =
      event.target.value;

    setSelectedArea(
      areaId
    );

    setOutlets([]);
    setProducts([]);
    setProductVariants([]);

    /* -------------------------------------------------------
       IMPORTANT:

       If current Location Type is AREA,
       locationId must become areaId.

       If current Location Type is CITY,
       locationId remains cityId.

       If current Location Type is STATE,
       locationId remains stateId.
       ------------------------------------------------------- */

    const currentLocationId =
      getSelectedLocationId(
        formData.locationType
      );

    setFormData((prev) => ({
      ...prev,
      locationId:
        formData.locationType ===
        "AREA"
          ? areaId
          : currentLocationId,
      outletId: "",
      productId: "",
      productVariantId: "",
    }));

    if (!areaId) {
      setOutlets([]);
      return;
    }

    if (
      !selectedState ||
      !selectedCity
    ) {
      setOutlets([]);

      setError(
        "Please select State and City before selecting an Area."
      );

      return;
    }

    await fetchOutletsByLocation({
      stateId:
        Number(
          selectedState
        ),

      cityId:
        Number(
          selectedCity
        ),

      areaId:
        Number(
          areaId
        ),
    });
  };

  /* =========================================================
     OUTLET CHANGE

     GET:
     /api/fm/pricing/products

     ?outletIds=191
     &isApproved=true
     ========================================================= */

  const handleOutletChange = async (
    event
  ) => {
    const outletId =
      event.target.value;

    setFormData((prev) => ({
      ...prev,
      outletId,
      productId: "",
      productVariantId: "",
    }));

    setProducts([]);
    setProductVariants([]);

    if (!outletId) {
      return;
    }

    try {
      setLoadingProducts(true);
      setError("");

      const response =
        await FM_API.get(
          "/api/fm/pricing/products",
          {
            params: {
              outletIds:
                Number(
                  outletId
                ),
              isApproved: true,
            },
          }
        );

      console.log(
        "Products response:",
        response.data
      );

      setProducts(
        getArray(response)
      );
    } catch (err) {
      console.error(
        "Failed to load products:",
        err
      );

      setProducts([]);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.errorMessage ||
          "Failed to load products."
      );
    } finally {
      setLoadingProducts(false);
    }
  };

  /* =========================================================
     PRODUCT CHANGE

     PRODUCT VARIANT IS OPTIONAL
     ========================================================= */

  const handleProductChange =
    async (event) => {
      const productId =
        event.target.value;

      setFormData((prev) => ({
        ...prev,
        productId,
        productVariantId: "",
      }));

      setProductVariants([]);

      if (!productId) {
        return;
      }

      try {
        setLoadingVariants(true);
        setError("");

        const response =
          await FM_API.get(
            `/api/fm/products/productdetails/${encodeURIComponent(
              productId
            )}`
          );

        console.log(
          "Product details response:",
          response.data
        );

        const productData =
          response?.data;

        let variants = [];

        if (
          Array.isArray(
            productData?.productVariants
          )
        ) {
          variants =
            productData.productVariants;
        } else if (
          Array.isArray(
            productData?.variants
          )
        ) {
          variants =
            productData.variants;
        } else if (
          Array.isArray(
            productData?.variantOptions
          )
        ) {
          variants =
            productData.variantOptions;
        } else if (
          Array.isArray(
            productData?.availableVariants
          )
        ) {
          variants =
            productData.availableVariants;
        } else if (
          Array.isArray(
            productData?.data
              ?.productVariants
          )
        ) {
          variants =
            productData.data
              .productVariants;
        } else if (
          Array.isArray(
            productData?.data
              ?.variants
          )
        ) {
          variants =
            productData.data
              .variants;
        } else if (
          Array.isArray(
            productData?.data
              ?.variantOptions
          )
        ) {
          variants =
            productData.data
              .variantOptions;
        } else if (
          Array.isArray(
            productData?.variantGroups
          )
        ) {
          productData.variantGroups.forEach(
            (group) => {
              if (
                Array.isArray(
                  group?.options
                )
              ) {
                variants = [
                  ...variants,
                  ...group.options,
                ];
              }

              if (
                Array.isArray(
                  group?.variantOptions
                )
              ) {
                variants = [
                  ...variants,
                  ...group.variantOptions,
                ];
              }
            }
          );
        }

        setProductVariants(
          Array.isArray(
            variants
          )
            ? variants
            : []
        );
      } catch (err) {
        console.error(
          "Failed to load product variants:",
          err
        );

        setProductVariants([]);

        setError(
          err?.response?.data?.message ||
            err?.response?.data?.errorMessage ||
            "Failed to load product variants."
        );
      } finally {
        setLoadingVariants(false);
      }
    };

  /* =========================================================
     NORMAL FORM CHANGE
     ========================================================= */

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =========================================================
     LOCATION TYPE CHANGE

     IMPORTANT:

     STATE -> locationId = selectedState
     CITY  -> locationId = selectedCity
     AREA  -> locationId = selectedArea

     DO NOT RESET STATE/CITY/AREA.

     Example:

     State: Telangana
     City: Hyderabad
     Area: Kukatpally

     Location Type = CITY

     Request:

     locationType: "CITY"
     locationId: 2

     Location Type = STATE

     Request:

     locationType: "STATE"
     locationId: 1

     Location Type = AREA

     Request:

     locationType: "AREA"
     locationId: 10
     ========================================================= */

  const handleLocationTypeChange =
    (event) => {
      const value =
        event.target.value;

      let locationId = "";

      if (value === "STATE") {
        locationId =
          selectedState;
      }

      if (value === "CITY") {
        locationId =
          selectedCity;
      }

      if (value === "AREA") {
        locationId =
          selectedArea;
      }

      console.log(
        "Location Type:",
        value
      );

      console.log(
        "Location ID:",
        locationId
      );

      setFormData((prev) => ({
        ...prev,
        locationType:
          value,
        locationId:
          locationId,
      }));

      /*
       * IMPORTANT:
       * Do NOT clear State, City, Area,
       * Outlet, Product or Product Variant.
       */
      setError("");
      setSuccess("");
    };

  /* =========================================================
     SUBMIT
     ========================================================= */

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    /* =======================================================
       LOCATION VALIDATION
       ======================================================= */

    if (!selectedState) {
      setError(
        "Please select a State."
      );
      return;
    }

    if (!selectedCity) {
      setError(
        "Please select a City."
      );
      return;
    }

    if (!selectedArea) {
      setError(
        "Please select an Area."
      );
      return;
    }

    if (!formData.outletId) {
      setError(
        "Please select an Outlet."
      );
      return;
    }

    if (!formData.productId) {
      setError(
        "Please select a Product."
      );
      return;
    }

    /*
     * PRODUCT VARIANT IS OPTIONAL.
     *
     * No validation here.
     */

    if (!formData.priceValue) {
      setError(
        "Please enter Price Value."
      );
      return;
    }

    if (
      Number(
        formData.priceValue
      ) <= 0
    ) {
      setError(
        "Price Value must be greater than 0."
      );
      return;
    }

    if (!formData.startDateTime) {
      setError(
        "Please select Start Date & Time."
      );
      return;
    }

    if (!formData.endDateTime) {
      setError(
        "Please select End Date & Time."
      );
      return;
    }

    /* =======================================================
       GET LOCATION ID

       STATE -> stateId
       CITY  -> cityId
       AREA  -> areaId
       ======================================================= */

    const locationId =
      getSelectedLocationId(
        formData.locationType
      );

    if (!locationId) {
      setError(
        `Please select a ${
          formData.locationType ===
          "STATE"
            ? "State"
            : formData.locationType ===
              "CITY"
            ? "City"
            : "Area"
        }.`
      );

      return;
    }

    /* =======================================================
       DATE/TIME VALIDATION

       The backend uses Java LocalDateTime, so the API must
       receive YYYY-MM-DDTHH:mm:ss without a timezone suffix.
       Do NOT use new Date().toISOString().
       ======================================================= */

    const formatLocalDateTime = (value) => {
      if (!value) return null;
      return value.length === 16 ? `${value}:00` : value;
    };

    const startDateTime = formatLocalDateTime(formData.startDateTime);
    const endDateTime = formatLocalDateTime(formData.endDateTime);

    const localDateTimeRegex =
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;

    if (!startDateTime || !localDateTimeRegex.test(startDateTime)) {
      setError("Invalid Start Date & Time.");
      return;
    }

    if (!endDateTime || !localDateTimeRegex.test(endDateTime)) {
      setError("Invalid End Date & Time.");
      return;
    }

    if (endDateTime <= startDateTime) {
      setError(
        "End Date & Time must be greater than Start Date & Time."
      );
      return;
    }

    /* =======================================================
       REQUEST BODY

       Product Variant is included ONLY if selected.
       ======================================================= */

    /*
     * Build the POST payload exactly according to the API:
     *
     * STATE -> locationId = selectedState
     * CITY  -> locationId = selectedCity
     * AREA  -> locationId = selectedArea
     *
     * productVariantId is OPTIONAL.
     * When no variant is selected, it is NOT sent.
     */
    const requestBody = {
      outletId: Number(formData.outletId),
      productId: Number(formData.productId),
      startDateTime: startDateTime,
      endDateTime: endDateTime,
      priceValue: Number(formData.priceValue),
      priceType: formData.priceType,
      priceAdjustmentType: formData.priceAdjustmentType,
      locationId: Number(locationId),
      locationType: formData.locationType,
    };

    // Send productVariantId only when the user actually selected one.
    if (
      formData.productVariantId !== "" &&
      formData.productVariantId !== null &&
      formData.productVariantId !== undefined
    ) {
      requestBody.productVariantId = Number(
        formData.productVariantId
      );
    }

    console.log(
      "========================================"
    );

    console.log(
      "CREATE PROMOTION REQUEST"
    );

    console.log(
      requestBody
    );

    console.log(
      "========================================"
    );

    try {
      setLoading(true);

      await createPromotionSetting(
        requestBody
      );

      setSuccess(
        "Promotion setting created successfully."
      );

      setTimeout(() => {
        navigate(
          "/dashboard/promotionSettings"
        );
      }, 1000);
    } catch (err) {
      console.error(
        "Error creating promotion setting:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.errorMessage ||
          err?.message ||
          "Failed to create promotion setting."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     CANCEL
     ========================================================= */

  const handleCancel = () => {
    navigate(
      "/dashboard/promotionSettings"
    );
  };

  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <div className="promotion-settings-page">

      {/* =====================================================
          HEADER
          ===================================================== */}

      <div className="promotion-settings-header">
        <div>
          <h2>
            Create Promotion Settings
          </h2>

          <p>
            Create a new product price promotion
          </p>
        </div>
      </div>

      {/* =====================================================
          ERROR
          ===================================================== */}

      {error && (
        <div className="promotion-settings-error">
          {error}
        </div>
      )}

      {/* =====================================================
          SUCCESS
          ===================================================== */}

      {success && (
        <div className="promotion-settings-success">
          {success}
        </div>
      )}

      {/* =====================================================
          FORM CARD
          ===================================================== */}

      <div className="promotion-settings-form-card">

        <form
          className="promotion-settings-form"
          onSubmit={handleSubmit}
        >

          {/* =================================================
              STATE / CITY / AREA
              ================================================= */}

          <div
            className="promotion-settings-location-row"
            style={{
              width: "100%",
              display: "grid",
              gridTemplateColumns:
                "repeat(3, minmax(0, 1fr))",
              gap: "12px",
              gridColumn: "1 / -1",
              marginBottom: "4px",
            }}
          >

            {/* STATE */}

            <div className="promotion-settings-form-group">

              <label htmlFor="state">
                State <span>*</span>
              </label>

              <select
                id="state"
                value={
                  selectedState
                }
                onChange={
                  handleStateChange
                }
                disabled={
                  loadingStates
                }
              >
                <option value="">
                  {loadingStates
                    ? "Loading State..."
                    : "Select State"}
                </option>

                {states.map(
                  (
                    state,
                    index
                  ) => {
                    const id =
                      getId(
                        state,
                        [
                          "stateId",
                          "id",
                          "stateID",
                        ]
                      );

                    const name =
                      getName(
                        state,
                        [
                          "stateName",
                          "name",
                          "state_name",
                        ]
                      );

                    return (
                      <option
                        key={
                          id ||
                          `state-${index}`
                        }
                        value={id}
                      >
                        {name ||
                          `State ${id}`}
                      </option>
                    );
                  }
                )}
              </select>

            </div>

            {/* CITY */}

            <div className="promotion-settings-form-group">

              <label htmlFor="city">
                City <span>*</span>
              </label>

              <select
                id="city"
                value={
                  selectedCity
                }
                onChange={
                  handleCityChange
                }
                disabled={
                  !selectedState ||
                  loadingCities
                }
              >
                <option value="">
                  {loadingCities
                    ? "Loading City..."
                    : "Select City"}
                </option>

                {cities.map(
                  (
                    city,
                    index
                  ) => {
                    const id =
                      getId(
                        city,
                        [
                          "cityId",
                          "id",
                          "cityID",
                        ]
                      );

                    const name =
                      getName(
                        city,
                        [
                          "cityName",
                          "name",
                          "city_name",
                        ]
                      );

                    return (
                      <option
                        key={
                          id ||
                          `city-${index}`
                        }
                        value={id}
                      >
                        {name ||
                          `City ${id}`}
                      </option>
                    );
                  }
                )}
              </select>

            </div>

            {/* AREA */}

            <div className="promotion-settings-form-group">

              <label htmlFor="area">
                Area <span>*</span>
              </label>

              <select
                id="area"
                value={
                  selectedArea
                }
                onChange={
                  handleAreaChange
                }
                disabled={
                  !selectedCity ||
                  loadingAreas
                }
              >
                <option value="">
                  {loadingAreas
                    ? "Loading Area..."
                    : "Select Area"}
                </option>

                {areas.map(
                  (
                    area,
                    index
                  ) => {
                    const id =
                      getId(
                        area,
                        [
                          "areaId",
                          "id",
                          "areaID",
                        ]
                      );

                    const name =
                      getName(
                        area,
                        [
                          "areaName",
                          "name",
                          "area_name",
                        ]
                      );

                    return (
                      <option
                        key={
                          id ||
                          `area-${index}`
                        }
                        value={id}
                      >
                        {name ||
                          `Area ${id}`}
                      </option>
                    );
                  }
                )}
              </select>

            </div>

          </div>

          {/* =================================================
              MAIN FORM
              ================================================= */}

          <div
            className="promotion-settings-form-grid"
            style={{
              width: "100%",
            }}
          >

            {/* OUTLET */}

            <div className="promotion-settings-form-group">

              <label htmlFor="outletId">
                Outlet Name <span>*</span>
              </label>

              <select
                id="outletId"
                name="outletId"
                value={
                  formData.outletId
                }
                onChange={
                  handleOutletChange
                }
                disabled={
                  !selectedState ||
                  !selectedCity ||
                  !selectedArea ||
                  loadingOutlets
                }
              >
                <option value="">
                  {loadingOutlets
                    ? "Loading Outlets..."
                    : !selectedState
                    ? "Select State First"
                    : !selectedCity
                    ? "Select City First"
                    : !selectedArea
                    ? "Select Area First"
                    : outlets.length === 0
                    ? "No Outlets Found"
                    : "Select Outlet"}
                </option>

                {outlets.map(
                  (
                    outlet,
                    index
                  ) => {
                    const id =
                      getOutletId(
                        outlet
                      );

                    const name =
                      getOutletName(
                        outlet
                      );

                    return (
                      <option
                        key={
                          id ||
                          `outlet-${index}`
                        }
                        value={id}
                      >
                        {name ||
                          `Outlet ${id}`}
                      </option>
                    );
                  }
                )}
              </select>

            </div>

            {/* PRODUCT */}

            <div className="promotion-settings-form-group">

              <label htmlFor="productId">
                Product Name <span>*</span>
              </label>

              <select
                id="productId"
                name="productId"
                value={
                  formData.productId
                }
                onChange={
                  handleProductChange
                }
                disabled={
                  !formData.outletId ||
                  loadingProducts
                }
              >
                <option value="">
                  {loadingProducts
                    ? "Loading Products..."
                    : "Select Product"}
                </option>

                {products.map(
                  (
                    product,
                    index
                  ) => {
                    const id =
                      getProductId(
                        product
                      );

                    const name =
                      getProductName(
                        product
                      );

                    return (
                      <option
                        key={
                          id ||
                          `product-${index}`
                        }
                        value={id}
                      >
                        {name ||
                          `Product ${id}`}
                      </option>
                    );
                  }
                )}
              </select>

            </div>

            {/* PRODUCT VARIANT - OPTIONAL */}

            <div className="promotion-settings-form-group">

              <label htmlFor="productVariantId">
                Product Variant
              </label>

              <select
                id="productVariantId"
                name="productVariantId"
                value={
                  formData.productVariantId
                }
                onChange={
                  handleChange
                }
                disabled={
                  !formData.productId ||
                  loadingVariants
                }
              >
                <option value="">
                  {loadingVariants
                    ? "Loading Variants..."
                    : productVariants.length ===
                      0
                    ? "No Variant Available"
                    : "Select Product Variant"}
                </option>

                {productVariants.map(
                  (
                    variant,
                    index
                  ) => {
                    const id =
                      getVariantId(
                        variant
                      );

                    const name =
                      getVariantName(
                        variant
                      );

                    return (
                      <option
                        key={
                          id ||
                          `variant-${index}`
                        }
                        value={id}
                      >
                        {name ||
                          `Variant ${id}`}
                      </option>
                    );
                  }
                )}
              </select>

            </div>

            {/* LOCATION TYPE */}

            <div className="promotion-settings-form-group">

              <label htmlFor="locationType">
                Location Type{" "}
                <span>*</span>
              </label>

              <select
                id="locationType"
                name="locationType"
                value={
                  formData.locationType
                }
                onChange={
                  handleLocationTypeChange
                }
              >
                <option value="STATE">
                  STATE
                </option>

                <option value="CITY">
                  CITY
                </option>

                <option value="AREA">
                  AREA
                </option>
              </select>

            </div>

            {/* PRICE TYPE */}

            <div className="promotion-settings-form-group">

              <label htmlFor="priceType">
                Price Type <span>*</span>
              </label>

              <select
                id="priceType"
                name="priceType"
                value={
                  formData.priceType
                }
                onChange={
                  handleChange
                }
              >
                <option value="FLAT">
                  FLAT
                </option>

                <option value="PERCENTAGE">
                  PERCENTAGE
                </option>
              </select>

            </div>

            {/* PRICE VALUE */}

            <div className="promotion-settings-form-group">

              <label htmlFor="priceValue">
                Price Value <span>*</span>
              </label>

              <input
                id="priceValue"
                name="priceValue"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Enter Price Value"
                value={
                  formData.priceValue
                }
                onChange={
                  handleChange
                }
              />

            </div>

            {/* PRICE ADJUSTMENT */}

            <div className="promotion-settings-form-group">

              <label htmlFor="priceAdjustmentType">
                Price Adjustment Type{" "}
                <span>*</span>
              </label>

              <select
                id="priceAdjustmentType"
                name="priceAdjustmentType"
                value={
                  formData.priceAdjustmentType
                }
                onChange={
                  handleChange
                }
              >
                <option value="INCREASE">
                  INCREASE
                </option>

                <option value="DECREASE">
                  DECREASE
                </option>
              </select>

            </div>

            {/* START DATE */}

            <div className="promotion-settings-form-group">

              <label htmlFor="startDateTime">
                Start Date & Time{" "}
                <span>*</span>
              </label>

              <input
                id="startDateTime"
                name="startDateTime"
                type="datetime-local"
                value={
                  formData.startDateTime
                }
                onChange={
                  handleChange
                }
              />

            </div>

            {/* END DATE */}

            <div className="promotion-settings-form-group">

              <label htmlFor="endDateTime">
                End Date & Time{" "}
                <span>*</span>
              </label>

              <input
                id="endDateTime"
                name="endDateTime"
                type="datetime-local"
                value={
                  formData.endDateTime
                }
                onChange={
                  handleChange
                }
              />

            </div>

          </div>

          {/* =================================================
              BUTTONS
              ================================================= */}

          <div className="promotion-settings-form-actions">

            <button
              type="button"
              className="promotion-settings-cancel-btn"
              onClick={
                handleCancel
              }
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="promotion-settings-submit-btn"
              disabled={loading}
            >
              {loading
                ? "Creating..."
                : "Create Promotion"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
};

export default CreatePromotionSettings;