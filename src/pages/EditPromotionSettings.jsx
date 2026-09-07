import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { FM_API } from "../services/api";
import {
  getPromotionSettingById,
  updatePromotionSetting,
} from "../services/promotionSettingsService";

import "../styles/PromotionSettingss.css";

const EditPromotionSettings = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const promotionId = searchParams.get("id");

  /* =========================================================
     FORM
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
     OUTLET / PRODUCT / VARIANT
  ========================================================= */

  const [outlets, setOutlets] = useState([]);
  const [products, setProducts] = useState([]);
  const [productVariants, setProductVariants] = useState([]);

  /* =========================================================
     API OBJECT FALLBACKS
  ========================================================= */

  const [promotionOutlet, setPromotionOutlet] = useState(null);
  const [promotionProduct, setPromotionProduct] = useState(null);
  const [promotionVariant, setPromotionVariant] = useState(null);

  const [promotionLocationMeta, setPromotionLocationMeta] =
    useState({
      stateName: "",
      cityName: "",
      areaName: "",
    });

  /* =========================================================
     LOADING
  ========================================================= */

  const [loading, setLoading] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [loadingOutlets, setLoadingOutlets] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingVariants, setLoadingVariants] = useState(false);

  /* =========================================================
     MESSAGE
  ========================================================= */

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* =========================================================
     API HELPERS
  ========================================================= */

  const unwrap = (response) => {
    let value = response?.data ?? response;

    for (let i = 0; i < 5; i += 1) {
      if (
        value &&
        typeof value === "object" &&
        !Array.isArray(value) &&
        value.data !== undefined
      ) {
        value = value.data;
      } else {
        break;
      }
    }

    return value;
  };

  const getArray = (response) => {
    const value = unwrap(response);

    if (Array.isArray(value)) {
      return value;
    }

    if (Array.isArray(value?.content)) {
      return value.content;
    }

    if (Array.isArray(value?.items)) {
      return value.items;
    }

    if (Array.isArray(value?.results)) {
      return value.results;
    }

    if (Array.isArray(value?.data)) {
      return value.data;
    }

    return [];
  };

  const getId = (item, keys = []) => {
    if (!item) {
      return "";
    }

    for (const key of keys) {
      if (
        item[key] !== undefined &&
        item[key] !== null &&
        item[key] !== ""
      ) {
        return item[key];
      }
    }

    return "";
  };

  const getName = (item, keys = []) => {
    if (!item) {
      return "";
    }

    for (const key of keys) {
      if (
        item[key] !== undefined &&
        item[key] !== null &&
        String(item[key]).trim() !== ""
      ) {
        return item[key];
      }
    }

    return "";
  };

  const sameId = (a, b) => {
    if (
      a === undefined ||
      a === null ||
      a === "" ||
      b === undefined ||
      b === null ||
      b === ""
    ) {
      return false;
    }

    return String(a) === String(b);
  };

  const displayNameWithId = (name, id) => {
    const result = [];

    if (
      name !== undefined &&
      name !== null &&
      String(name).trim() !== ""
    ) {
      result.push(String(name));
    }

    if (
      id !== undefined &&
      id !== null &&
      id !== ""
    ) {
      result.push(`(ID: ${id})`);
    }

    return result.join(" ");
  };

  /* =========================================================
     DATE FORMAT FOR INPUT
  ========================================================= */

  const formatDateTimeForInput = (value) => {
    if (!value) {
      return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    const pad = (number) =>
      String(number).padStart(2, "0");

    return (
      `${date.getFullYear()}-` +
      `${pad(date.getMonth() + 1)}-` +
      `${pad(date.getDate())}T` +
      `${pad(date.getHours())}:` +
      `${pad(date.getMinutes())}`
    );
  };

  /* =========================================================
     IMPORTANT:
     BACKEND USES java.time.LocalDateTime

     DO NOT USE:
       date.toISOString()

     because that creates:
       2026-08-12T04:30:00.000Z

     Backend requires:
       2026-08-12T04:30:00
  ========================================================= */

  const formatLocalDateTimeForApi = (value) => {
    if (!value) {
      return "";
    }

    const stringValue = String(value);

    if (
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(
        stringValue
      )
    ) {
      return `${stringValue}:00`;
    }

    if (
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(
        stringValue
      )
    ) {
      return stringValue;
    }

    return stringValue
      .replace(/\.\d{1,9}/, "")
      .replace(/Z$/, "")
      .replace(/[+-]\d{2}:?\d{2}$/, "")
      .slice(0, 19);
  };

  /* =========================================================
     STATES
  ========================================================= */

  const fetchStates = async () => {
    const response = await FM_API.get(
      "/api/fm/location/fetchStates"
    );

    const list = getArray(response);

    console.log(
      "FETCH STATES:",
      list
    );

    return list;
  };

  const loadStates = async () => {
    try {
      setLoadingStates(true);

      const list = await fetchStates();

      setStates(list);

      return list;
    } catch (err) {
      console.error(
        "LOAD STATES ERROR:",
        err
      );

      setStates([]);

      setError(
        err?.response?.data?.message ||
          "Failed to load states."
      );

      return [];
    } finally {
      setLoadingStates(false);
    }
  };

  /* =========================================================
     CITIES
  ========================================================= */

  const fetchCities = async (
    stateId
  ) => {
    if (!stateId) {
      return [];
    }

    const response =
      await FM_API.get(
        `/api/fm/location/fetchCityInState?stateId=${encodeURIComponent(
          stateId
        )}`
      );

    const list =
      getArray(response);

    console.log(
      "FETCH CITIES:",
      stateId,
      list
    );

    return list;
  };

  const loadCities = async (
    stateId
  ) => {
    if (!stateId) {
      setCities([]);
      return [];
    }

    try {
      setLoadingCities(true);

      const list =
        await fetchCities(
          stateId
        );

      setCities(list);

      return list;
    } catch (err) {
      console.error(
        "LOAD CITIES ERROR:",
        err
      );

      setCities([]);

      return [];
    } finally {
      setLoadingCities(false);
    }
  };

  /* =========================================================
     AREAS
  ========================================================= */

  const fetchAreas = async (
    cityId
  ) => {
    if (!cityId) {
      return [];
    }

    const response =
      await FM_API.get(
        `/api/fm/location/fetchAreaInCity?cityId=${encodeURIComponent(
          cityId
        )}`
      );

    const list =
      getArray(response);

    console.log(
      "FETCH AREAS:",
      cityId,
      list
    );

    return list;
  };

  const loadAreas = async (
    cityId
  ) => {
    if (!cityId) {
      setAreas([]);
      return [];
    }

    try {
      setLoadingAreas(true);

      const list =
        await fetchAreas(
          cityId
        );

      setAreas(list);

      return list;
    } catch (err) {
      console.error(
        "LOAD AREAS ERROR:",
        err
      );

      setAreas([]);

      return [];
    } finally {
      setLoadingAreas(false);
    }
  };

  /* =========================================================
     RESOLVE LOCATION

     If promotion API returns only:

       locationId = 13

     this searches:

       States API
          ↓
       Cities API
          ↓
       Areas API

     No static IDs/names.
  ========================================================= */

  const resolveLocation = async ({
    locationId,
    locationType,
    stateId,
    cityId,
    areaId,
  }) => {
    let finalStateId =
      stateId || "";

    let finalCityId =
      cityId || "";

    let finalAreaId =
      areaId || "";

    let finalState = null;
    let finalCity = null;
    let finalArea = null;

    const stateList =
      states.length
        ? states
        : await fetchStates();

    if (!states.length) {
      setStates(stateList);
    }

    /* ---------------------------------------------------------
       State already known
    --------------------------------------------------------- */

    if (finalStateId) {
      finalState =
        stateList.find(
          (state) =>
            sameId(
              getId(state, [
                "stateId",
                "stateID",
                "id",
              ]),
              finalStateId
            )
        ) || null;

      const cityList =
        await fetchCities(
          finalStateId
        );

      setCities(cityList);

      if (
        !finalCityId &&
        locationType === "CITY" &&
        locationId
      ) {
        const city =
          cityList.find(
            (item) =>
              sameId(
                getId(item, [
                  "cityId",
                  "cityID",
                  "id",
                ]),
                locationId
              )
          );

        if (city) {
          finalCityId =
            getId(
              city,
              [
                "cityId",
                "cityID",
                "id",
              ]
            );

          finalCity =
            city;
        }
      }

      if (finalCityId) {
        finalCity =
          cityList.find(
            (item) =>
              sameId(
                getId(item, [
                  "cityId",
                  "cityID",
                  "id",
                ]),
                finalCityId
              )
          ) || finalCity;

        const areaList =
          await fetchAreas(
            finalCityId
          );

        setAreas(areaList);

        if (
          !finalAreaId &&
          locationId
        ) {
          const area =
            areaList.find(
              (item) =>
                sameId(
                  getId(item, [
                    "areaId",
                    "areaID",
                    "id",
                  ]),
                  locationId
                )
            );

          if (area) {
            finalAreaId =
              getId(
                area,
                [
                  "areaId",
                  "areaID",
                  "id",
                ]
              );

            finalArea =
              area;
          }
        }

        if (
          finalAreaId &&
          !finalArea
        ) {
          finalArea =
            areaList.find(
              (item) =>
                sameId(
                  getId(item, [
                    "areaId",
                    "areaID",
                    "id",
                  ]),
                  finalAreaId
                )
            ) || null;
        }
      }
    }

    /* ---------------------------------------------------------
       LOCATION ID ONLY
    --------------------------------------------------------- */

    if (
      locationId &&
      (
        !finalStateId ||
        !finalCityId ||
        (
          locationType === "AREA" &&
          !finalAreaId
        )
      )
    ) {
      for (
        const state of stateList
      ) {
        const currentStateId =
          getId(
            state,
            [
              "stateId",
              "stateID",
              "id",
            ]
          );

        if (!currentStateId) {
          continue;
        }

        if (
          finalStateId &&
          !sameId(
            finalStateId,
            currentStateId
          )
        ) {
          continue;
        }

        /* STATE */

        if (
          locationType === "STATE" &&
          sameId(
            currentStateId,
            locationId
          )
        ) {
          finalStateId =
            currentStateId;

          finalState =
            state;

          break;
        }

        /* CITIES */

        const cityList =
          await fetchCities(
            currentStateId
          );

        if (
          locationType === "CITY"
        ) {
          const matchedCity =
            cityList.find(
              (city) =>
                sameId(
                  getId(
                    city,
                    [
                      "cityId",
                      "cityID",
                      "id",
                    ]
                  ),
                  locationId
                )
            );

          if (matchedCity) {
            finalStateId =
              currentStateId;

            finalCityId =
              getId(
                matchedCity,
                [
                  "cityId",
                  "cityID",
                  "id",
                ]
              );

            finalState =
              state;

            finalCity =
              matchedCity;

            setCities(
              cityList
            );

            break;
          }
        }

        /* AREAS */

        if (
          locationType === "AREA"
        ) {
          for (
            const city of cityList
          ) {
            const currentCityId =
              getId(
                city,
                [
                  "cityId",
                  "cityID",
                  "id",
                ]
              );

            if (!currentCityId) {
              continue;
            }

            const areaList =
              await fetchAreas(
                currentCityId
              );

            const matchedArea =
              areaList.find(
                (area) =>
                  sameId(
                    getId(
                      area,
                      [
                        "areaId",
                        "areaID",
                        "id",
                      ]
                    ),
                    locationId
                  )
              );

            if (
              matchedArea
            ) {
              finalStateId =
                currentStateId;

              finalCityId =
                currentCityId;

              finalAreaId =
                getId(
                  matchedArea,
                  [
                    "areaId",
                    "areaID",
                    "id",
                  ]
                );

              finalState =
                state;

              finalCity =
                city;

              finalArea =
                matchedArea;

              setCities(
                cityList
              );

              setAreas(
                areaList
              );

              console.log(
                "LOCATION FOUND FROM API:",
                {
                  stateId:
                    finalStateId,
                  cityId:
                    finalCityId,
                  areaId:
                    finalAreaId,
                }
              );

              return {
                stateId:
                  finalStateId,
                cityId:
                  finalCityId,
                areaId:
                  finalAreaId,
                state:
                  finalState,
                city:
                  finalCity,
                area:
                  finalArea,
              };
            }
          }
        }
      }
    }

    return {
      stateId:
        finalStateId,

      cityId:
        finalCityId,

      areaId:
        finalAreaId,

      state:
        finalState,

      city:
        finalCity,

      area:
        finalArea,
    };
  };

  /* =========================================================
     OUTLET API
  ========================================================= */

  const normalizeOutlets = (
    response
  ) => {
    const groups =
      getArray(response);

    const result = [];

    groups.forEach(
      (group) => {
        if (
          Array.isArray(
            group?.outlets
          )
        ) {
          group.outlets.forEach(
            (outlet) => {
              result.push({
                ...outlet,

                areaId:
                  outlet?.areaId ??
                  outlet?.areaID ??
                  outlet?.area_id ??
                  group?.areaId ??
                  group?.areaID ??
                  "",

                areaName:
                  outlet?.areaName ??
                  outlet?.area_name ??
                  group?.areaName ??
                  group?.area_name ??
                  "",
              });
            }
          );

          return;
        }

        const outletId =
          getId(
            group,
            [
              "outletId",
              "outletID",
              "id",
            ]
          );

        if (outletId) {
          result.push(group);
        }
      }
    );

    const unique =
      new Map();

    result.forEach(
      (item) => {
        const id =
          getId(
            item,
            [
              "outletId",
              "outletID",
              "id",
            ]
          );

        if (id !== "") {
          unique.set(
            String(id),
            item
          );
        }
      }
    );

    return Array.from(
      unique.values()
    );
  };

  const fetchOutlets = async ({
    stateId,
    cityId = "",
    areaId = "",
  }) => {
    if (!stateId) {
      return [];
    }

    let url =
      `/api/fm/outlets/fetchOutlets?stateId=${encodeURIComponent(
        stateId
      )}`;

    if (cityId) {
      url +=
        `&cityId=${encodeURIComponent(
          cityId
        )}`;
    }

    if (areaId) {
      url +=
        `&areaId=${encodeURIComponent(
          areaId
        )}`;
    }

    console.log(
      "OUTLET API:",
      url
    );

    const response =
      await FM_API.get(url);

    console.log(
      "OUTLET RESPONSE:",
      response.data
    );

    return normalizeOutlets(
      response
    );
  };

  const loadOutlets = async ({
    stateId,
    cityId = "",
    areaId = "",
  }) => {
    if (!stateId) {
      setOutlets([]);
      return [];
    }

    try {
      setLoadingOutlets(true);

      let list =
        await fetchOutlets({
          stateId,
          cityId,
          areaId,
        });

      return list;
    } catch (err) {
      console.error(
        "OUTLET API ERROR:",
        err
      );

      setOutlets([]);

      return [];
    } finally {
      setLoadingOutlets(false);
    }
  };

  /* =========================================================
     PRODUCT API
  ========================================================= */

  const loadProducts = async (
    outletId
  ) => {
    if (!outletId) {
      setProducts([]);
      return [];
    }

    try {
      setLoadingProducts(true);

      const response =
        await FM_API.get(
          `/api/fm/pricing/products?outletIds=${encodeURIComponent(
            outletId
          )}&isApproved=true`
        );

      const list =
        getArray(response);

      console.log(
        "PRODUCT RESPONSE:",
        response.data
      );

      setProducts(
        list
      );

      return list;
    } catch (err) {
      console.error(
        "PRODUCT API ERROR:",
        err
      );

      setProducts([]);

      return [];
    } finally {
      setLoadingProducts(false);
    }
  };

  /* =========================================================
     VARIANT API
  ========================================================= */

  const extractVariants = (
    response
  ) => {
    const value =
      unwrap(response);

    if (
      Array.isArray(value)
    ) {
      return value;
    }

    const candidates = [
      value?.productVariants,
      value?.variants,
      value?.variantOptions,
      value?.availableVariants,

      value?.data?.productVariants,
      value?.data?.variants,
      value?.data?.variantOptions,
      value?.data?.availableVariants,

      value?.product?.productVariants,
      value?.product?.variants,
    ];

    for (
      const candidate of candidates
    ) {
      if (
        Array.isArray(
          candidate
        )
      ) {
        return candidate;
      }
    }

    return [];
  };

  const loadProductVariants =
    async (
      productId
    ) => {
      if (!productId) {
        setProductVariants([]);
        return [];
      }

      try {
        setLoadingVariants(true);

        const response =
          await FM_API.get(
            `/api/fm/products/productdetails/${encodeURIComponent(
              productId
            )}`
          );

        console.log(
          "VARIANT API RESPONSE:",
          response.data
        );

        const variants =
          extractVariants(
            response
          );

        setProductVariants(
          variants
        );

        return variants;
      } catch (err) {
        console.error(
          "VARIANT API ERROR:",
          err
        );

        setProductVariants([]);

        return [];
      } finally {
        setLoadingVariants(false);
      }
    };

  /* =========================================================
     LOAD PROMOTION
  ========================================================= */

  const loadPromotion = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response =
        await getPromotionSettingById(
          promotionId
        );

      console.log(
        "PROMOTION API RESPONSE:",
        response
      );

      let promotion =
        response?.data ??
        response;

      for (let i = 0; i < 5; i += 1) {
        if (
          promotion &&
          typeof promotion ===
            "object" &&
          !Array.isArray(
            promotion
          ) &&
          promotion.data &&
          typeof promotion.data ===
            "object" &&
          !Array.isArray(
            promotion.data
          )
        ) {
          promotion =
            promotion.data;
        } else {
          break;
        }
      }

      console.log(
        "PROMOTION OBJECT:",
        promotion
      );

      /* =====================================================
         IDS
      ===================================================== */

      const outletId =
        promotion?.outletId ??
        promotion?.outletID ??
        promotion?.outlet?.outletId ??
        promotion?.outlet?.outletID ??
        promotion?.outlet?.id ??
        "";

      const productId =
        promotion?.productId ??
        promotion?.productID ??
        promotion?.product?.productId ??
        promotion?.product?.productID ??
        promotion?.product?.id ??
        "";

      const productVariantId =
        promotion?.productVariantId ??
        promotion?.productVariantID ??
        promotion?.variantId ??
        promotion?.productVariant?.productVariantId ??
        promotion?.productVariant?.productVariantID ??
        promotion?.productVariant?.variantId ??
        promotion?.productVariant?.id ??
        "";

      const stateId =
        promotion?.stateId ??
        promotion?.stateID ??
        promotion?.state?.stateId ??
        promotion?.state?.stateID ??
        promotion?.state?.id ??
        "";

      const cityId =
        promotion?.cityId ??
        promotion?.cityID ??
        promotion?.city?.cityId ??
        promotion?.city?.cityID ??
        promotion?.city?.id ??
        "";

      const areaId =
        promotion?.areaId ??
        promotion?.areaID ??
        promotion?.area?.areaId ??
        promotion?.area?.areaID ??
        promotion?.area?.id ??
        "";

      const locationId =
        promotion?.locationId ??
        promotion?.locationID ??
        areaId ??
        cityId ??
        stateId ??
        "";

      const locationType =
        promotion?.locationType ||
        "AREA";

      /* =====================================================
         API NESTED OBJECTS
      ===================================================== */

      setPromotionOutlet(
        promotion?.outlet &&
        typeof promotion.outlet ===
          "object"
          ? promotion.outlet
          : null
      );

      setPromotionProduct(
        promotion?.product &&
        typeof promotion.product ===
          "object"
          ? promotion.product
          : null
      );

      setPromotionVariant(
        promotion?.productVariant &&
        typeof promotion.productVariant ===
          "object"
          ? promotion.productVariant
          : null
      );

      setPromotionLocationMeta({
        stateName:
          getName(
            promotion?.state,
            [
              "stateName",
              "name",
              "state_name",
            ]
          ),

        cityName:
          getName(
            promotion?.city,
            [
              "cityName",
              "name",
              "city_name",
            ]
          ),

        areaName:
          getName(
            promotion?.area,
            [
              "areaName",
              "name",
              "area_name",
            ]
          ),
      });

      /* =====================================================
         BASIC FORM
      ===================================================== */

      setFormData({
        outletId:
          String(
            outletId || ""
          ),

        productId:
          String(
            productId || ""
          ),

        productVariantId:
          String(
            productVariantId || ""
          ),

        startDateTime:
          formatDateTimeForInput(
            promotion?.startDateTime
          ),

        endDateTime:
          formatDateTimeForInput(
            promotion?.endDateTime
          ),

        priceValue:
          promotion?.priceValue ??
          "",

        priceType:
          promotion?.priceType ||
          "FLAT",

        priceAdjustmentType:
          promotion?.priceAdjustmentType ||
          "INCREASE",

        locationId:
          String(
            locationId || ""
          ),

        locationType,
      });

      /* =====================================================
         LOCATION
      ===================================================== */

      const resolved =
        await resolveLocation({
          locationId,
          locationType,
          stateId,
          cityId,
          areaId,
        });

      console.log(
        "FINAL LOCATION:",
        resolved
      );

      setSelectedState(
        String(
          resolved.stateId || ""
        )
      );

      setSelectedCity(
        String(
          resolved.cityId || ""
        )
      );

      setSelectedArea(
        String(
          resolved.areaId || ""
        )
      );

      /* =====================================================
         OUTLETS
      ===================================================== */

      let outletList = [];

      if (
        resolved.stateId
      ) {
        /*
         * First request:
         * State + City + Area
         */

        outletList =
          await loadOutlets({
            stateId:
              resolved.stateId,

            cityId:
              resolved.cityId,

            areaId:
              resolved.areaId,
          });

        /*
         * If selected outlet is not found,
         * retry State + City.
         */

        const outletExists =
          outletList.some(
            (item) =>
              sameId(
                getId(
                  item,
                  [
                    "outletId",
                    "outletID",
                    "id",
                  ]
                ),
                outletId
              )
          );

        if (
          outletId &&
          !outletExists &&
          resolved.cityId
        ) {
          outletList =
            await loadOutlets({
              stateId:
                resolved.stateId,

              cityId:
                resolved.cityId,
            });
        }

        /*
         * Retry State only.
         */

        const outletExistsAfterCity =
          outletList.some(
            (item) =>
              sameId(
                getId(
                  item,
                  [
                    "outletId",
                    "outletID",
                    "id",
                  ]
                ),
                outletId
              )
          );

        if (
          outletId &&
          !outletExistsAfterCity
        ) {
          outletList =
            await loadOutlets({
              stateId:
                resolved.stateId,
            });
        }

        /*
         * Promotion GET may itself contain outlet object.
         * Use only API data.
         */

        const finalOutletExists =
          outletList.some(
            (item) =>
              sameId(
                getId(
                  item,
                  [
                    "outletId",
                    "outletID",
                    "id",
                  ]
                ),
                outletId
              )
          );

        if (
          outletId &&
          !finalOutletExists &&
          promotionOutlet
        ) {
          const promotionOutletId =
            getId(
              promotionOutlet,
              [
                "outletId",
                "outletID",
                "id",
              ]
            );

          if (
            sameId(
              promotionOutletId,
              outletId
            )
          ) {
            outletList = [
              promotionOutlet,
              ...outletList,
            ];
          }
        }

        setOutlets(
          outletList
        );
      }

      /* =====================================================
         PRODUCTS
      ===================================================== */

      let productList = [];

      if (outletId) {
        productList =
          await loadProducts(
            outletId
          );

        const productExists =
          productList.some(
            (item) =>
              sameId(
                getId(
                  item,
                  [
                    "productId",
                    "productID",
                    "id",
                  ]
                ),
                productId
              )
          );

        if (
          productId &&
          !productExists &&
          promotionProduct
        ) {
          const promotionProductId =
            getId(
              promotionProduct,
              [
                "productId",
                "productID",
                "id",
              ]
            );

          if (
            sameId(
              promotionProductId,
              productId
            )
          ) {
            productList = [
              promotionProduct,
              ...productList,
            ];

            setProducts(
              productList
            );
          }
        }
      }

      /* =====================================================
         VARIANTS
      ===================================================== */

      if (productId) {
        let variantList =
          await loadProductVariants(
            productId
          );

        const variantExists =
          variantList.some(
            (item) =>
              sameId(
                getId(
                  item,
                  [
                    "productVariantId",
                    "productVariantID",
                    "variantId",
                    "id",
                  ]
                ),
                productVariantId
              )
          );

        if (
          productVariantId &&
          !variantExists &&
          promotionVariant
        ) {
          const promotionVariantId =
            getId(
              promotionVariant,
              [
                "productVariantId",
                "productVariantID",
                "variantId",
                "id",
              ]
            );

          if (
            sameId(
              promotionVariantId,
              productVariantId
            )
          ) {
            variantList = [
              promotionVariant,
              ...variantList,
            ];

            setProductVariants(
              variantList
            );
          }
        }

        /*
         * Explicitly preserve selected variant ID.
         */

        setFormData(
          (previous) => ({
            ...previous,

            productVariantId:
              String(
                productVariantId ||
                  ""
              ),
          })
        );
      }

      /*
       * Explicitly preserve selected IDs.
       */

      setFormData(
        (previous) => ({
          ...previous,

          outletId:
            String(
              outletId || ""
            ),

          productId:
            String(
              productId || ""
            ),
        })
      );
    } catch (err) {
      console.error(
        "LOAD PROMOTION ERROR:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.errorMessage ||
          "Failed to load promotion setting."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    loadStates();
  }, []);

  useEffect(() => {
    if (!promotionId) {
      setError(
        "Promotion setting ID is missing."
      );

      return;
    }

    loadPromotion();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [promotionId]);

  /* =========================================================
     STATE CHANGE
  ========================================================= */

  const handleStateChange =
    async (event) => {
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

      setFormData(
        (previous) => ({
          ...previous,

          locationId: "",
          outletId: "",
          productId: "",
          productVariantId: "",
        })
      );

      if (!stateId) {
        return;
      }

      await loadCities(
        stateId
      );

      const list =
        await loadOutlets({
          stateId,
        });

      setOutlets(
        list
      );
    };

  /* =========================================================
     CITY CHANGE
  ========================================================= */

  const handleCityChange =
    async (event) => {
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

      setFormData(
        (previous) => ({
          ...previous,

          locationId: "",
          outletId: "",
          productId: "",
          productVariantId: "",
        })
      );

      if (!cityId) {
        if (selectedState) {
          const list =
            await loadOutlets({
              stateId:
                selectedState,
            });

          setOutlets(
            list
          );
        }

        return;
      }

      await loadAreas(
        cityId
      );

      const list =
        await loadOutlets({
          stateId:
            selectedState,

          cityId,
        });

      setOutlets(
        list
      );
    };

  /* =========================================================
     AREA CHANGE
  ========================================================= */

  const handleAreaChange =
    async (event) => {
      const areaId =
        event.target.value;

      setSelectedArea(
        areaId
      );

      setProducts([]);
      setProductVariants([]);

      setFormData(
        (previous) => ({
          ...previous,

          locationId:
            areaId,

          outletId: "",
          productId: "",
          productVariantId: "",
        })
      );

      if (!areaId) {
        return;
      }

      const list =
        await loadOutlets({
          stateId:
            selectedState,

          cityId:
            selectedCity,

          areaId,
        });

      setOutlets(
        list
      );
    };

  /* =========================================================
     OUTLET CHANGE
  ========================================================= */

  const handleOutletChange =
    async (event) => {
      const outletId =
        event.target.value;

      setFormData(
        (previous) => ({
          ...previous,

          outletId,

          productId: "",
          productVariantId: "",
        })
      );

      setProducts([]);
      setProductVariants([]);

      if (!outletId) {
        return;
      }

      await loadProducts(
        outletId
      );
    };

  /* =========================================================
     PRODUCT CHANGE
  ========================================================= */

  const handleProductChange =
    async (event) => {
      const productId =
        event.target.value;

      setFormData(
        (previous) => ({
          ...previous,

          productId,

          productVariantId: "",
        })
      );

      setProductVariants([]);

      if (!productId) {
        return;
      }

      await loadProductVariants(
        productId
      );
    };

  /* =========================================================
     NORMAL CHANGE
  ========================================================= */

  const handleChange =
    (event) => {
      const {
        name,
        value,
      } = event.target;

      setFormData(
        (previous) => ({
          ...previous,

          [name]: value,
        })
      );
    };

  /* =========================================================
     SELECTED STATE
  ========================================================= */

  const selectedStateObject =
    useMemo(
      () =>
        states.find(
          (item) =>
            sameId(
              getId(
                item,
                [
                  "stateId",
                  "stateID",
                  "id",
                ]
              ),
              selectedState
            )
        ) || null,
      [
        states,
        selectedState,
      ]
    );

  /* =========================================================
     SELECTED CITY
  ========================================================= */

  const selectedCityObject =
    useMemo(
      () =>
        cities.find(
          (item) =>
            sameId(
              getId(
                item,
                [
                  "cityId",
                  "cityID",
                  "id",
                ]
              ),
              selectedCity
            )
        ) || null,
      [
        cities,
        selectedCity,
      ]
    );

  /* =========================================================
     SELECTED AREA
  ========================================================= */

  const selectedAreaObject =
    useMemo(
      () =>
        areas.find(
          (item) =>
            sameId(
              getId(
                item,
                [
                  "areaId",
                  "areaID",
                  "id",
                ]
              ),
              selectedArea
            )
        ) || null,
      [
        areas,
        selectedArea,
      ]
    );

  /* =========================================================
     SELECTED OUTLET
  ========================================================= */

  const selectedOutlet =
    useMemo(
      () =>
        outlets.find(
          (item) =>
            sameId(
              getId(
                item,
                [
                  "outletId",
                  "outletID",
                  "id",
                ]
              ),
              formData.outletId
            )
        ) || null,
      [
        outlets,
        formData.outletId,
      ]
    );

  /* =========================================================
     DISPLAY NAMES
  ========================================================= */

  const selectedStateName =
    getName(
      selectedStateObject,
      [
        "stateName",
        "name",
        "state_name",
      ]
    ) ||
    promotionLocationMeta.stateName;

  const selectedCityName =
    getName(
      selectedCityObject,
      [
        "cityName",
        "name",
        "city_name",
      ]
    ) ||
    promotionLocationMeta.cityName;

  const selectedAreaName =
    getName(
      selectedAreaObject,
      [
        "areaName",
        "name",
        "area_name",
      ]
    ) ||
    promotionLocationMeta.areaName;

  const selectedOutletName =
    getName(
      selectedOutlet,
      [
        "outletName",
        "name",
        "outlet_name",
      ]
    ) ||
    getName(
      promotionOutlet,
      [
        "outletName",
        "name",
        "outlet_name",
      ]
    );

  const selectedOutletAreaId =
    getId(
      selectedOutlet,
      [
        "areaId",
        "areaID",
        "area_id",
      ]
    ) ||
    getId(
      promotionOutlet,
      [
        "areaId",
        "areaID",
        "area_id",
      ]
    );

  const selectedOutletAreaName =
    getName(
      selectedOutlet,
      [
        "areaName",
        "area_name",
      ]
    ) ||
    getName(
      promotionOutlet,
      [
        "areaName",
        "area_name",
      ]
    );

  /* =========================================================
     LOCATION DISPLAY
  ========================================================= */

  const locationName =
    formData.locationType ===
    "STATE"
      ? selectedStateName
      : formData.locationType ===
        "CITY"
      ? selectedCityName
      : selectedAreaName;

  const locationDisplay =
    displayNameWithId(
      locationName,
      formData.locationId
    );

  const locationDetails = [
    displayNameWithId(
      selectedStateName,
      selectedState
    ),

    displayNameWithId(
      selectedCityName,
      selectedCity
    ),

    displayNameWithId(
      selectedAreaName,
      selectedArea
    ),
  ]
    .filter(Boolean)
    .join(" / ");

  /* =========================================================
     SUBMIT
  ========================================================= */

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      setError("");
      setSuccess("");

      if (!promotionId) {
        setError(
          "Promotion setting ID is missing."
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

      if (
        !formData.productVariantId
      ) {
        setError(
          "Please select a Product Variant."
        );
        return;
      }

      if (!formData.locationId) {
        setError(
          "Please select a Location."
        );
        return;
      }

      if (
        formData.priceValue ===
          "" ||
        formData.priceValue ===
          null ||
        formData.priceValue ===
          undefined
      ) {
        setError(
          "Please enter Price Value."
        );
        return;
      }

      if (
        !formData.startDateTime
      ) {
        setError(
          "Please select Start Date & Time."
        );
        return;
      }

      if (
        !formData.endDateTime
      ) {
        setError(
          "Please select End Date & Time."
        );
        return;
      }

      const startDate =
        new Date(
          formData.startDateTime
        );

      const endDate =
        new Date(
          formData.endDateTime
        );

      if (
        Number.isNaN(
          startDate.getTime()
        ) ||
        Number.isNaN(
          endDate.getTime()
        )
      ) {
        setError(
          "Please enter valid dates."
        );
        return;
      }

      if (
        endDate <= startDate
      ) {
        setError(
          "End Date & Time must be greater than Start Date & Time."
        );
        return;
      }

      try {
        setLoading(true);

        const requestBody = {
          outletId:
            Number(
              formData.outletId
            ),

          productId:
            Number(
              formData.productId
            ),

          productVariantId:
            Number(
              formData.productVariantId
            ),

          /*
           * IMPORTANT:
           *
           * LocalDateTime only.
           * NO toISOString().
           */

          startDateTime:
            formatLocalDateTimeForApi(
              formData.startDateTime
            ),

          endDateTime:
            formatLocalDateTimeForApi(
              formData.endDateTime
            ),

          priceValue:
            Number(
              formData.priceValue
            ),

          priceType:
            formData.priceType,

          priceAdjustmentType:
            formData.priceAdjustmentType,

          locationId:
            Number(
              formData.locationId
            ),

          locationType:
            formData.locationType,
        };

        console.log(
          "FINAL UPDATE REQUEST:",
          requestBody
        );

        await updatePromotionSetting(
          promotionId,
          requestBody
        );

        setSuccess(
          "Promotion setting updated successfully."
        );

        setTimeout(() => {
          navigate(
            "/dashboard/promotionSettings"
          );
        }, 1000);
      } catch (err) {
        console.error(
          "UPDATE PROMOTION ERROR:",
          err
        );

        setError(
          err?.response?.data?.message ||
            err?.response?.data
              ?.errorMessage ||
            "Failed to update promotion setting."
        );
      } finally {
        setLoading(false);
      }
    };

  /* =========================================================
     CANCEL
  ========================================================= */

  const handleCancel =
    () => {
      navigate(
        "/dashboard/promotionSettings"
      );
    };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="promotion-settings-page">

      <div className="promotion-settings-header">
        <div>
          <h2>
            Edit Promotion Settings
          </h2>

          <p>
            Update product price promotion settings
          </p>
        </div>
      </div>

      {error && (
        <div className="promotion-settings-error">
          {error}
        </div>
      )}

      {success && (
        <div className="promotion-settings-success">
          {success}
        </div>
      )}

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
              gridColumn:
                "1 / -1",
            }}
          >

            <div className="promotion-settings-form-group">
              <label htmlFor="state">
                State <span>*</span>
              </label>

              <select
                id="state"
                value={selectedState}
                onChange={handleStateChange}
                disabled={
                  loading ||
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
                          "stateID",
                          "id",
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
                        {displayNameWithId(
                          name,
                          id
                        )}
                      </option>
                    );
                  }
                )}
              </select>
            </div>

            <div className="promotion-settings-form-group">
              <label htmlFor="city">
                City <span>*</span>
              </label>

              <select
                id="city"
                value={selectedCity}
                onChange={handleCityChange}
                disabled={
                  !selectedState ||
                  loading ||
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
                          "cityID",
                          "id",
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
                        {displayNameWithId(
                          name,
                          id
                        )}
                      </option>
                    );
                  }
                )}
              </select>
            </div>

            <div className="promotion-settings-form-group">
              <label htmlFor="area">
                Area <span>*</span>
              </label>

              <select
                id="area"
                value={selectedArea}
                onChange={handleAreaChange}
                disabled={
                  !selectedCity ||
                  loading ||
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
                          "areaID",
                          "id",
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
                        {displayNameWithId(
                          name,
                          id
                        )}
                      </option>
                    );
                  }
                )}
              </select>
            </div>
          </div>

          {/* =================================================
              FORM GRID
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
                value={formData.outletId}
                onChange={handleOutletChange}
                disabled={
                  !selectedState ||
                  loading ||
                  loadingOutlets
                }
              >
                <option value="">
                  {loadingOutlets
                    ? "Loading Outlets..."
                    : "Select Outlet"}
                </option>

                {outlets.map(
                  (
                    outlet,
                    index
                  ) => {
                    const id =
                      getId(
                        outlet,
                        [
                          "outletId",
                          "outletID",
                          "id",
                        ]
                      );

                    const name =
                      getName(
                        outlet,
                        [
                          "outletName",
                          "name",
                          "outlet_name",
                        ]
                      );

                    const areaId =
                      getId(
                        outlet,
                        [
                          "areaId",
                          "areaID",
                          "area_id",
                        ]
                      );

                    const areaName =
                      getName(
                        outlet,
                        [
                          "areaName",
                          "area_name",
                        ]
                      );

                    return (
                      <option
                        key={
                          id ||
                          `outlet-${index}`
                        }
                        value={id}
                      >
                        {[
                          displayNameWithId(
                            name,
                            id
                          ),
                          areaName,
                          areaId
                            ? `(Area ID: ${areaId})`
                            : "",
                        ]
                          .filter(Boolean)
                          .join(" - ")}
                      </option>
                    );
                  }
                )}
              </select>

              {formData.outletId && (
                <div
                  style={{
                    marginTop: "8px",
                    fontSize: "13px",
                    lineHeight: "1.5",
                  }}
                >
                  <div>
                    <strong>
                      Outlet Name:
                    </strong>{" "}
                    {selectedOutletName || ""}
                  </div>

                  <div>
                    <strong>
                      Outlet ID:
                    </strong>{" "}
                    {formData.outletId}
                  </div>

                  <div>
                    <strong>
                      Area Name:
                    </strong>{" "}
                    {selectedOutletAreaName || ""}
                  </div>

                  <div>
                    <strong>
                      Area ID:
                    </strong>{" "}
                    {selectedOutletAreaId || ""}
                  </div>
                </div>
              )}
            </div>

            {/* PRODUCT */}

            <div className="promotion-settings-form-group">
              <label htmlFor="productId">
                Product Name <span>*</span>
              </label>

              <select
                id="productId"
                name="productId"
                value={formData.productId}
                onChange={handleProductChange}
                disabled={
                  !formData.outletId ||
                  loading ||
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
                      getId(
                        product,
                        [
                          "productId",
                          "productID",
                          "id",
                        ]
                      );

                    const name =
                      getName(
                        product,
                        [
                          "productName",
                          "name",
                          "product_name",
                        ]
                      );

                    return (
                      <option
                        key={
                          id ||
                          `product-${index}`
                        }
                        value={id}
                      >
                        {displayNameWithId(
                          name,
                          id
                        )}
                      </option>
                    );
                  }
                )}
              </select>
            </div>

            {/* VARIANT */}

            <div className="promotion-settings-form-group">
              <label htmlFor="productVariantId">
                Product Variant <span>*</span>
              </label>

              <select
                id="productVariantId"
                name="productVariantId"
                value={
                  formData.productVariantId
                }
                onChange={handleChange}
                disabled={
                  !formData.productId ||
                  loading ||
                  loadingVariants
                }
              >
                <option value="">
                  {loadingVariants
                    ? "Loading Variants..."
                    : "Select Product Variant"}
                </option>

                {productVariants.map(
                  (
                    variant,
                    index
                  ) => {
                    const id =
                      getId(
                        variant,
                        [
                          "productVariantId",
                          "productVariantID",
                          "variantId",
                          "id",
                        ]
                      );

                    const name =
                      getName(
                        variant,
                        [
                          "productVariantName",
                          "variantName",
                          "productVariant",
                          "name",
                          "variant_name",
                          "optionName",
                          "value",
                        ]
                      );

                    return (
                      <option
                        key={
                          id ||
                          `variant-${index}`
                        }
                        value={id}
                      >
                        {displayNameWithId(
                          name,
                          id
                        )}
                      </option>
                    );
                  }
                )}
              </select>
            </div>

            {/* LOCATION TYPE */}

            <div className="promotion-settings-form-group">
              <label htmlFor="locationType">
                Location Type <span>*</span>
              </label>

              <select
                id="locationType"
                name="locationType"
                value={
                  formData.locationType
                }
                onChange={handleChange}
                disabled={loading}
              >
                <option value="AREA">
                  AREA
                </option>

                <option value="CITY">
                  CITY
                </option>

                <option value="STATE">
                  STATE
                </option>

                <option value="ZONE">
                  ZONE
                </option>
              </select>
            </div>

            {/* LOCATION NAME / ID */}

            <div className="promotion-settings-form-group">
              <label htmlFor="locationDisplay">
                Location Name / ID
              </label>

              <input
                id="locationDisplay"
                type="text"
                value={locationDisplay}
                readOnly
                disabled={loading}
              />
            </div>

            {/* LOCATION DETAILS */}

            <div className="promotion-settings-form-group">
              <label>
                Location Details
              </label>

              <input
                type="text"
                value={locationDetails}
                readOnly
                disabled={loading}
              />
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
                onChange={handleChange}
                disabled={loading}
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
                value={
                  formData.priceValue
                }
                onChange={handleChange}
                placeholder="Enter Price Value"
                disabled={loading}
              />
            </div>

            {/* ADJUSTMENT */}

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
                onChange={handleChange}
                disabled={loading}
              >
                <option value="INCREASE">
                  INCREASE
                </option>

                <option value="DECREASE">
                  DECREASE
                </option>
              </select>
            </div>

            {/* START */}

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
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            {/* END */}

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
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>

          {/* =================================================
              ACTIONS
          ================================================= */}

          <div className="promotion-settings-form-actions">

            <button
              type="button"
              className="promotion-settings-cancel-btn"
              onClick={handleCancel}
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
                ? "Updating..."
                : "Update Promotion"}
            </button>

          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPromotionSettings;