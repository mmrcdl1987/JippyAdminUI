import React, { useEffect, useMemo, useState } from "react";
import {
  getOutletDetails,
  getOutletById,
  updateOutletDetailsByMerchant,
} from "../services/outletListService";

import "../styles/OutletEdit.css";

const JIPPY_EDIT_DAYS = [
  { id: 1, name: "Monday", short: "MO" },
  { id: 2, name: "Tuesday", short: "TU" },
  { id: 3, name: "Wednesday", short: "WE" },
  { id: 4, name: "Thursday", short: "TH" },
  { id: 5, name: "Friday", short: "FR" },
  { id: 6, name: "Saturday", short: "SA" },
  { id: 7, name: "Sunday", short: "SU" },
];

/*
 * IMPORTANT:
 * PUT API expects cuisineType as IDs.
 *
 * If your backend already returns cuisine names + IDs,
 * this component will use the IDs.
 */
const JIPPY_EDIT_CUISINES = [
  { id: 1, name: "Cuisine 1" },
  { id: 2, name: "Cuisine 2" },
  { id: 3, name: "Cuisine 3" },
  { id: 4, name: "Cuisine 4" },
  { id: 5, name: "Cuisine 5" },
];

const createEmptyDays = () =>
  JIPPY_EDIT_DAYS.map((day) => ({
    dayOfWeekId: day.id,
    isOpen: false,
    openingTime: "09:00",
    closingTime: "22:00",
    slotType: "FULL_DAY",
  }));

const normalizeTime = (time) => {
  if (!time) {
    return "09:00";
  }

  return String(time).substring(0, 5);
};

const getStoredOutlet = () => {
  try {
    const selectedOutlet =
      sessionStorage.getItem("selectedOutlet");

    if (selectedOutlet) {
      return JSON.parse(selectedOutlet);
    }

    const localSelectedOutlet =
      localStorage.getItem("selectedOutlet");

    if (localSelectedOutlet) {
      return JSON.parse(localSelectedOutlet);
    }

    return null;
  } catch (error) {
    console.error(
      "Failed to read selected outlet:",
      error
    );

    return null;
  }
};

const getOutletIdFromStorage = () => {
  const storedOutlet = getStoredOutlet();

  const editOutletId =
    sessionStorage.getItem("editOutletId");

  return (
    editOutletId ||
    storedOutlet?.outletId ||
    storedOutlet?.id ||
    localStorage.getItem("selectedOutletId") ||
    null
  );
};

const unwrapResponse = (response) => {
  if (!response) {
    return null;
  }

  if (
    response?.data &&
    typeof response.data === "object" &&
    !Array.isArray(response.data)
  ) {
    if (
      response.data.outletId != null ||
      response.data.merchantId != null ||
      response.data.outletName != null
    ) {
      return response.data;
    }

    if (
      response.data.data &&
      typeof response.data.data === "object"
    ) {
      return response.data.data;
    }
  }

  return response;
};

const extractCuisineIds = (outlet) => {
  const source =
    Array.isArray(outlet?.cuisineType)
      ? outlet.cuisineType
      : Array.isArray(outlet?.cuisineTypes)
      ? outlet.cuisineTypes
      : [];

  return source
    .map((item) => {
      if (
        typeof item === "object" &&
        item !== null
      ) {
        return Number(
          item.cuisineTypeId ??
            item.cuisineTypeID ??
            item.id
        );
      }

      return Number(item);
    })
    .filter(
      (id) => !Number.isNaN(id)
    );
};

const extractOperatingDays = (outlet) => {
  const backendDays =
    Array.isArray(outlet?.operatingDays)
      ? outlet.operatingDays
      : [];

  const oldDays =
    Array.isArray(outlet?.outletTimings)
      ? outlet.outletTimings
      : [];

  const source =
    backendDays.length > 0
      ? backendDays
      : oldDays;

  const days = createEmptyDays();

  source.forEach((item) => {
    let dayId = Number(
      item?.dayOfWeekId ??
        item?.dayId
    );

    /*
     * Fallback if old API gives:
     * day: "Monday"
     */
    if (
      Number.isNaN(dayId) &&
      typeof item?.day === "string"
    ) {
      const matchedDay =
        JIPPY_EDIT_DAYS.find(
          (day) =>
            day.name.toLowerCase() ===
            item.day.toLowerCase()
        );

      dayId = matchedDay?.id;
    }

    if (
      !dayId ||
      dayId < 1 ||
      dayId > 7
    ) {
      return;
    }

    days[dayId - 1] = {
      dayOfWeekId: dayId,

      isOpen:
        item?.isOpen === true ||
        item?.isOpen === "true" ||
        item?.isOpen === "Y",

      openingTime:
        normalizeTime(
          item?.openingTime
        ),

      closingTime:
        normalizeTime(
          item?.closingTime
        ),

      slotType:
        item?.slotType ||
        "FULL_DAY",
    };
  });

  return days;
};

function OutletEdit({
  outletId: propOutletId,
  selectedOutlet: propSelectedOutlet,
  setActivePage,
}) {
  const storedOutlet = useMemo(
    () => getStoredOutlet(),
    []
  );

  const outletId =
    propOutletId ||
    propSelectedOutlet?.outletId ||
    propSelectedOutlet?.id ||
    storedOutlet?.outletId ||
    storedOutlet?.id ||
    getOutletIdFromStorage();

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [loadError, setLoadError] =
    useState("");

  const [showSuccessPopup, setShowSuccessPopup] =
    useState(false);

  const [showErrorPopup, setShowErrorPopup] =
    useState(false);

  const [popupMessage, setPopupMessage] =
    useState("");

  const [formData, setFormData] =
    useState({
      outletName: "",
      merchantId: "",
      outletEmail: "",
      outletPhone: "",
      alternateOutletPhone: "",

      isGstApplied: false,

      accountNumber: "",
      ifscCode: "",
      bankName: "",
      accountHolderName: "",

      buildingNumber: "",
      road: "",
      landmark: "",

      stateId: "",
      cityId: "",
      areaId: "",

      latitude: "",
      longitude: "",

      cuisineType: [],

      operatingDays:
        createEmptyDays(),

      updatedBy: "",
    });

  const showError = (message) => {
    setPopupMessage(
      message ||
        "Something went wrong."
    );

    setShowErrorPopup(true);
  };

  /*
   * LOAD ALL OUTLET DETAILS
   */
  useEffect(() => {
    let mounted = true;

    const loadOutlet = async () => {
      if (!outletId) {
        if (mounted) {
          setLoadError(
            "Outlet ID not found. Please select the outlet again."
          );

          setLoading(false);
        }

        return;
      }

      try {
        setLoading(true);
        setLoadError("");

        console.log(
          "===================================="
        );

        console.log(
          "EDIT OUTLET"
        );

        console.log(
          "Outlet ID:",
          outletId
        );

        console.log(
          "===================================="
        );

        let outlet = null;

        /*
         * FIRST:
         * Try the detailed outlet API.
         */
        try {
          const response =
            await getOutletDetails(
              Number(outletId)
            );

          outlet =
            unwrapResponse(response);

          console.log(
            "GET OUTLET DETAILS:",
            outlet
          );
        } catch (detailsError) {
          console.warn(
            "getOutletDetails failed:",
            detailsError
          );
        }

        /*
         * FALLBACK:
         * Try getOutletById.
         */
        if (!outlet) {
          try {
            const response =
              await getOutletById(
                Number(outletId)
              );

            outlet =
              unwrapResponse(response);

            console.log(
              "GET OUTLET BY ID:",
              outlet
            );
          } catch (byIdError) {
            console.warn(
              "getOutletById failed:",
              byIdError
            );
          }
        }

        /*
         * LAST FALLBACK:
         * Use the outlet already present
         * in the table.
         */
        if (!outlet) {
          outlet =
            propSelectedOutlet ||
            storedOutlet ||
            null;
        }

        if (!outlet) {
          throw new Error(
            "No outlet details found."
          );
        }

        /*
         * VERY IMPORTANT:
         * Merchant ID can come from:
         *
         * 1. detailed API
         * 2. selected table row
         * 3. stored outlet
         */
        const merchantId =
          outlet?.merchantId ??
          propSelectedOutlet?.merchantId ??
          storedOutlet?.merchantId ??
          "";

        /*
         * Updated By:
         * use backend value if available.
         * Otherwise preserve existing stored value.
         */
        const updatedBy =
          outlet?.updatedBy ??
          propSelectedOutlet?.updatedBy ??
          storedOutlet?.updatedBy ??
          "";

        const cuisineType =
          extractCuisineIds(outlet);

        const operatingDays =
          extractOperatingDays(outlet);

        if (!mounted) {
          return;
        }

        setFormData({
          outletName:
            outlet?.outletName || "",

          merchantId:
            merchantId !== null &&
            merchantId !== undefined
              ? String(merchantId)
              : "",

          outletEmail:
            outlet?.outletEmail || "",

          outletPhone:
            outlet?.outletPhone || "",

          alternateOutletPhone:
            outlet?.alternateOutletPhone ||
            "",

          isGstApplied:
            outlet?.isGstApplied === true ||
            outlet?.isGstApplied === "true" ||
            outlet?.isGstApplied === "Y",

          accountNumber:
            outlet?.accountNumber || "",

          ifscCode:
            outlet?.ifscCode || "",

          bankName:
            outlet?.bankName || "",

          accountHolderName:
            outlet?.accountHolderName || "",

          buildingNumber:
            outlet?.buildingNumber || "",

          road:
            outlet?.road || "",

          landmark:
            outlet?.landmark || "",

          stateId:
            outlet?.stateId ?? "",

          cityId:
            outlet?.cityId ?? "",

          areaId:
            outlet?.areaId ?? "",

          latitude:
            outlet?.latitude ?? "",

          longitude:
            outlet?.longitude ?? "",

          cuisineType,

          operatingDays,

          updatedBy:
            updatedBy !== null &&
            updatedBy !== undefined
              ? String(updatedBy)
              : "",
        });

        console.log(
          "FORM DATA LOADED:",
          {
            merchantId,
            cuisineType,
            operatingDays,
          }
        );
      } catch (error) {
        console.error(
          "FAILED TO LOAD OUTLET:",
          error
        );

        if (mounted) {
          setLoadError(
            error?.response?.data?.message ||
              error?.message ||
              "Failed to load outlet details."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadOutlet();

    return () => {
      mounted = false;
    };
  }, [
    outletId,
    propSelectedOutlet,
  ]);

  /*
   * NORMAL INPUT
   */
  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setFormData((previous) => ({
      ...previous,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  /*
   * CUISINE
   */
  const handleCuisineChange = (
    event
  ) => {
    const values =
      Array.from(
        event.target.selectedOptions
      )
        .map((option) =>
          Number(option.value)
        )
        .filter(
          (id) =>
            !Number.isNaN(id)
        );

    setFormData((previous) => ({
      ...previous,
      cuisineType: values,
    }));
  };

  /*
   * OPERATING DAYS
   */
  const handleDayChange = (
    dayId,
    field,
    value
  ) => {
    setFormData((previous) => ({
      ...previous,

      operatingDays:
        previous.operatingDays.map(
          (day) => {
            if (
              Number(
                day.dayOfWeekId
              ) !== Number(dayId)
            ) {
              return day;
            }

            return {
              ...day,

              [field]:
                field === "isOpen"
                  ? Boolean(value)
                  : value,
            };
          }
        ),
    }));
  };

  /*
   * VALIDATION
   */
  const validateForm = () => {
    if (
      !formData.outletName.trim()
    ) {
      showError(
        "Outlet name is required."
      );

      return false;
    }

    if (
      !formData.outletEmail.trim()
    ) {
      showError(
        "Outlet email is required."
      );

      return false;
    }

    if (
      !formData.outletPhone.trim()
    ) {
      showError(
        "Outlet phone is required."
      );

      return false;
    }

    if (!formData.merchantId) {
      showError(
        "Merchant ID was not fetched."
      );

      return false;
    }

    if (!formData.updatedBy) {
      showError(
        "Updated By is required."
      );

      return false;
    }

    return true;
  };

  /*
   * UPDATE OUTLET
   */
  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (saving) {
      return;
    }

    if (!outletId) {
      showError(
        "Outlet ID not found."
      );

      return;
    }

    if (!validateForm()) {
      return;
    }

    /*
     * EXACT BODY REQUIRED BY PUT API
     */
    const payload = {
      outletName:
        formData.outletName.trim(),

      merchantId:
        Number(formData.merchantId),

      cuisineType:
        formData.cuisineType
          .map(Number)
          .filter(
            (id) =>
              !Number.isNaN(id)
          ),

      outletEmail:
        formData.outletEmail.trim(),

      outletPhone:
        formData.outletPhone.trim(),

      alternateOutletPhone:
        formData.alternateOutletPhone.trim() ||
        null,

      isGstApplied:
        Boolean(
          formData.isGstApplied
        ),

      accountNumber:
        formData.accountNumber.trim() ||
        null,

      ifscCode:
        formData.ifscCode
          .trim()
          .toUpperCase() ||
        null,

      bankName:
        formData.bankName.trim() ||
        null,

      accountHolderName:
        formData.accountHolderName.trim() ||
        null,

      buildingNumber:
        formData.buildingNumber.trim() ||
        null,

      road:
        formData.road.trim() ||
        null,

      landmark:
        formData.landmark.trim() ||
        null,

      stateId:
        formData.stateId !== "" &&
        formData.stateId !== null
          ? Number(formData.stateId)
          : null,

      cityId:
        formData.cityId !== "" &&
        formData.cityId !== null
          ? Number(formData.cityId)
          : null,

      areaId:
        formData.areaId !== "" &&
        formData.areaId !== null
          ? Number(formData.areaId)
          : null,

      latitude:
        formData.latitude !== "" &&
        formData.latitude !== null
          ? String(formData.latitude)
          : null,

      longitude:
        formData.longitude !== "" &&
        formData.longitude !== null
          ? String(formData.longitude)
          : null,

   operatingDays:
  formData.operatingDays
    .filter(
      (day) => day.isOpen === true
    )
    .map((day) => ({
      dayOfWeekId:
        Number(day.dayOfWeekId),

      isOpen: true,

      openingTime:
        normalizeTime(
          day.openingTime
        ),

      closingTime:
        normalizeTime(
          day.closingTime
        ),

      slotType:
        day.slotType ||
        "FULL_DAY",
    })),

      updatedBy:
        Number(formData.updatedBy),
    };

    console.log(
      "===================================="
    );

    console.log(
      "PUT OUTLET UPDATE"
    );

    console.log(
      "URL:",
      `/api/fm/outlets/updateOutletDetailsByMerchant/${Number(
        outletId
      )}`
    );

    console.log(
      "PAYLOAD:",
      JSON.stringify(
        payload,
        null,
        2
      )
    );

    console.log(
      "===================================="
    );

    try {
      setSaving(true);

      const response =
        await updateOutletDetailsByMerchant(
          Number(outletId),
          payload
        );

      console.log(
        "PUT RESPONSE:",
        response
      );

      if (
        response?.success === false
      ) {
        throw new Error(
          response?.message ||
            "Outlet update failed."
        );
      }

      /*
       * UPDATE THE STORED OUTLET TOO.
       * This makes the next screen/list use
       * the latest merchant ID + outlet data.
       */
      const currentStored =
        getStoredOutlet();

      const updatedStoredOutlet = {
        ...(currentStored || {}),
        ...(propSelectedOutlet || {}),
        outletId: Number(outletId),
        outletName:
          formData.outletName,
        merchantId:
          Number(formData.merchantId),
        outletEmail:
          formData.outletEmail,
        outletPhone:
          formData.outletPhone,
        alternateOutletPhone:
          formData.alternateOutletPhone,
        isGstApplied:
          formData.isGstApplied,
        accountNumber:
          formData.accountNumber,
        ifscCode:
          formData.ifscCode,
        bankName:
          formData.bankName,
        accountHolderName:
          formData.accountHolderName,
        buildingNumber:
          formData.buildingNumber,
        road:
          formData.road,
        landmark:
          formData.landmark,
        stateId:
          formData.stateId,
        cityId:
          formData.cityId,
        areaId:
          formData.areaId,
        latitude:
          formData.latitude,
        longitude:
          formData.longitude,
        cuisineType:
          formData.cuisineType,
        operatingDays:
          formData.operatingDays,
        updatedBy:
          Number(formData.updatedBy),
      };

      sessionStorage.setItem(
        "selectedOutlet",
        JSON.stringify(
          updatedStoredOutlet
        )
      );

      /*
       * SUCCESS POPUP
       */
      setPopupMessage(
        response?.message ||
          "Outlet details updated successfully."
      );

      setShowSuccessPopup(true);
    } catch (error) {
      console.error(
        "OUTLET UPDATE ERROR:",
        error
      );

      console.error(
        "STATUS:",
        error?.response?.status
      );

      console.error(
        "BACKEND RESPONSE:",
        error?.response?.data
      );

      showError(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Failed to update outlet."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (saving) {
      return;
    }

    if (setActivePage) {
      setActivePage(
        "allOutletsList"
      );
    }
  };

  const handleSuccessContinue =
    () => {
      setShowSuccessPopup(false);

      /*
       * Clear only the edit ID.
       * Keep selectedOutlet because other
       * outlet screens may use it.
       */
      sessionStorage.removeItem(
        "editOutletId"
      );

      if (setActivePage) {
        setActivePage(
          "allOutletsList"
        );
      }
    };

  /*
   * LOADING
   */
  if (loading) {
    return (
      <div className="jippy-outlet-edit-v2-page">
        <div className="jippy-outlet-edit-v2-loading-card">
          <div className="jippy-outlet-edit-v2-spinner" />

          <h2>
            Loading outlet details...
          </h2>

          <p>
            Please wait while we fetch
            the outlet information.
          </p>
        </div>
      </div>
    );
  }

  /*
   * ERROR
   */
  if (
    loadError &&
    !formData.outletName
  ) {
    return (
      <div className="jippy-outlet-edit-v2-page">
        <div className="jippy-outlet-edit-v2-error-card">
          <div className="jippy-outlet-edit-v2-error-symbol">
            !
          </div>

          <h2>
            Unable to load outlet
          </h2>

          <p>
            {loadError}
          </p>

          <button
            type="button"
            className="jippy-outlet-edit-v2-back-button"
            onClick={handleBack}
          >
            ← Back to Outlets
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="jippy-outlet-edit-v2-page">

      <div className="jippy-outlet-edit-v2-container">

        {/* HEADER */}
        <div className="jippy-outlet-edit-v2-header">

          <div className="jippy-outlet-edit-v2-header-left">

            <button
              type="button"
              className="jippy-outlet-edit-v2-back-button"
              onClick={handleBack}
              disabled={saving}
            >
              ← Back
            </button>

            <div>
              <h1>
                Edit Outlet
              </h1>

              <p>
                Update outlet information
              </p>
            </div>

          </div>

          <div className="jippy-outlet-edit-v2-outlet-id">
            Outlet ID
            <strong>
              {outletId}
            </strong>
          </div>

        </div>

        <form
          className="jippy-outlet-edit-v2-form"
          onSubmit={handleSubmit}
        >

          {/* BASIC DETAILS */}
          <section className="jippy-outlet-edit-v2-section">

            <div className="jippy-outlet-edit-v2-section-header">
              <div>
                <h2>
                  Basic Details
                </h2>

                <p>
                  Basic information about
                  the outlet
                </p>
              </div>
            </div>

            <div className="jippy-outlet-edit-v2-grid">

              <div className="jippy-outlet-edit-v2-field">
                <label>
                  Outlet Name
                  <span>*</span>
                </label>

                <input
                  type="text"
                  name="outletName"
                  value={
                    formData.outletName
                  }
                  onChange={
                    handleChange
                  }
                />
              </div>

              <div className="jippy-outlet-edit-v2-field">
                <label>
                  Merchant ID
                  <span>*</span>
                </label>

                <input
                  type="text"
                  value={
                    formData.merchantId
                  }
                  readOnly
                  className="jippy-outlet-edit-v2-readonly"
                />

                <small>
                  Automatically fetched
                  from outlet details
                </small>
              </div>

              <div className="jippy-outlet-edit-v2-field">
                <label>
                  Outlet Email
                  <span>*</span>
                </label>

                <input
                  type="email"
                  name="outletEmail"
                  value={
                    formData.outletEmail
                  }
                  onChange={
                    handleChange
                  }
                />
              </div>

              <div className="jippy-outlet-edit-v2-field">
                <label>
                  Outlet Phone
                  <span>*</span>
                </label>

                <input
                  type="text"
                  name="outletPhone"
                  value={
                    formData.outletPhone
                  }
                  onChange={
                    handleChange
                  }
                />
              </div>

              <div className="jippy-outlet-edit-v2-field">
                <label>
                  Alternate Phone
                </label>

                <input
                  type="text"
                  name="alternateOutletPhone"
                  value={
                    formData.alternateOutletPhone
                  }
                  onChange={
                    handleChange
                  }
                />
              </div>

              <div className="jippy-outlet-edit-v2-field">
                <label>
                  Updated By
                  <span>*</span>
                </label>

                <input
                  type="number"
                  name="updatedBy"
                  value={
                    formData.updatedBy
                  }
                  onChange={
                    handleChange
                  }
                />

                <small>
                  User ID performing
                  this update
                </small>
              </div>

            </div>

          </section>

          {/* CUISINE */}
          <section className="jippy-outlet-edit-v2-section">

            <div className="jippy-outlet-edit-v2-section-header">
              <div>
                <h2>
                  Cuisine Types
                </h2>

                <p>
                  Select all cuisines
                  applicable to this outlet
                </p>
              </div>
            </div>

            <div className="jippy-outlet-edit-v2-cuisine-box">

              <select
                multiple
                value={formData.cuisineType.map(
                  String
                )}
                onChange={
                  handleCuisineChange
                }
              >
                {JIPPY_EDIT_CUISINES.map(
                  (cuisine) => (
                    <option
                      key={cuisine.id}
                      value={cuisine.id}
                    >
                      {cuisine.name}
                    </option>
                  )
                )}
              </select>

              <small>
                Hold Ctrl/Cmd to select
                multiple cuisines.
              </small>

              <div className="jippy-outlet-edit-v2-selected-cuisines">

                {formData.cuisineType.length ===
                0 ? (
                  <span>
                    No cuisines selected
                  </span>
                ) : (
                  formData.cuisineType.map(
                    (id) => (
                      <span
                        key={id}
                        className="jippy-outlet-edit-v2-cuisine-chip"
                      >
                        Cuisine {id}
                      </span>
                    )
                  )
                )}

              </div>

            </div>

          </section>

          {/* GST */}
          <section className="jippy-outlet-edit-v2-section">

            <div className="jippy-outlet-edit-v2-section-header">
              <div>
                <h2>
                  GST
                </h2>

                <p>
                  GST applicability
                </p>
              </div>
            </div>

            <label className="jippy-outlet-edit-v2-checkbox">

              <input
                type="checkbox"
                name="isGstApplied"
                checked={
                  formData.isGstApplied
                }
                onChange={
                  handleChange
                }
              />

              <span>
                GST Applied
              </span>

            </label>

          </section>

          {/* BANK DETAILS */}
          <section className="jippy-outlet-edit-v2-section">

            <div className="jippy-outlet-edit-v2-section-header">
              <div>
                <h2>
                  Bank Details
                </h2>

                <p>
                  Outlet payment and
                  account information
                </p>
              </div>
            </div>

            <div className="jippy-outlet-edit-v2-grid">

              <div className="jippy-outlet-edit-v2-field">
                <label>
                  Account Number
                </label>

                <input
                  type="text"
                  name="accountNumber"
                  value={
                    formData.accountNumber
                  }
                  onChange={
                    handleChange
                  }
                />
              </div>

              <div className="jippy-outlet-edit-v2-field">
                <label>
                  IFSC Code
                </label>

                <input
                  type="text"
                  name="ifscCode"
                  value={
                    formData.ifscCode
                  }
                  onChange={
                    handleChange
                  }
                />
              </div>

              <div className="jippy-outlet-edit-v2-field">
                <label>
                  Bank Name
                </label>

                <input
                  type="text"
                  name="bankName"
                  value={
                    formData.bankName
                  }
                  onChange={
                    handleChange
                  }
                />
              </div>

              <div className="jippy-outlet-edit-v2-field">
                <label>
                  Account Holder Name
                </label>

                <input
                  type="text"
                  name="accountHolderName"
                  value={
                    formData.accountHolderName
                  }
                  onChange={
                    handleChange
                  }
                />
              </div>

            </div>

          </section>

          {/* ADDRESS */}
          <section className="jippy-outlet-edit-v2-section">

            <div className="jippy-outlet-edit-v2-section-header">
              <div>
                <h2>
                  Address
                </h2>

                <p>
                  Outlet address details
                </p>
              </div>
            </div>

            <div className="jippy-outlet-edit-v2-grid">

              <div className="jippy-outlet-edit-v2-field">
                <label>
                  Building Number
                </label>

                <input
                  type="text"
                  name="buildingNumber"
                  value={
                    formData.buildingNumber
                  }
                  onChange={
                    handleChange
                  }
                />
              </div>

              <div className="jippy-outlet-edit-v2-field">
                <label>
                  Road
                </label>

                <input
                  type="text"
                  name="road"
                  value={
                    formData.road
                  }
                  onChange={
                    handleChange
                  }
                />
              </div>

              <div className="jippy-outlet-edit-v2-field">
                <label>
                  Landmark
                </label>

                <input
                  type="text"
                  name="landmark"
                  value={
                    formData.landmark
                  }
                  onChange={
                    handleChange
                  }
                />
              </div>

              <div className="jippy-outlet-edit-v2-field">
                <label>
                  State ID
                </label>

                <input
                  type="number"
                  name="stateId"
                  value={
                    formData.stateId
                  }
                  onChange={
                    handleChange
                  }
                />
              </div>

              <div className="jippy-outlet-edit-v2-field">
                <label>
                  City ID
                </label>

                <input
                  type="number"
                  name="cityId"
                  value={
                    formData.cityId
                  }
                  onChange={
                    handleChange
                  }
                />
              </div>

              <div className="jippy-outlet-edit-v2-field">
                <label>
                  Area ID
                </label>

                <input
                  type="number"
                  name="areaId"
                  value={
                    formData.areaId
                  }
                  onChange={
                    handleChange
                  }
                />
              </div>

            </div>

          </section>

          {/* LOCATION */}
          <section className="jippy-outlet-edit-v2-section">

            <div className="jippy-outlet-edit-v2-section-header">
              <div>
                <h2>
                  Location
                </h2>

                <p>
                  GPS coordinates
                </p>
              </div>
            </div>

            <div className="jippy-outlet-edit-v2-grid">

              <div className="jippy-outlet-edit-v2-field">
                <label>
                  Latitude
                </label>

                <input
                  type="text"
                  name="latitude"
                  value={
                    formData.latitude
                  }
                  onChange={
                    handleChange
                  }
                />
              </div>

              <div className="jippy-outlet-edit-v2-field">
                <label>
                  Longitude
                </label>

                <input
                  type="text"
                  name="longitude"
                  value={
                    formData.longitude
                  }
                  onChange={
                    handleChange
                  }
                />
              </div>

            </div>

          </section>

          {/* OPERATING DAYS */}
          <section className="jippy-outlet-edit-v2-section">

            <div className="jippy-outlet-edit-v2-section-header">
              <div>
                <h2>
                  Operating Days
                </h2>

                <p>
                  Set opening and closing
                  times for each day
                </p>
              </div>
            </div>

            <div className="jippy-outlet-edit-v2-days">

              {formData.operatingDays.map(
                (day) => {
                  const dayInfo =
                    JIPPY_EDIT_DAYS.find(
                      (item) =>
                        item.id ===
                        Number(
                          day.dayOfWeekId
                        )
                    );

                  return (
                    <div
                      key={
                        day.dayOfWeekId
                      }
                      className={`jippy-outlet-edit-v2-day-row ${
                        day.isOpen
                          ? "jippy-outlet-edit-v2-day-open"
                          : "jippy-outlet-edit-v2-day-closed"
                      }`}
                    >

                      <div className="jippy-outlet-edit-v2-day-name">
                        <span>
                          {dayInfo?.short}
                        </span>

                        <strong>
                          {dayInfo?.name}
                        </strong>
                      </div>

                      <label className="jippy-outlet-edit-v2-toggle">

                        <input
                          type="checkbox"
                          checked={
                            day.isOpen
                          }
                          onChange={(
                            event
                          ) =>
                            handleDayChange(
                              day.dayOfWeekId,
                              "isOpen",
                              event
                                .target
                                .checked
                            )
                          }
                        />

                        <span />

                      </label>

                      <div
                        className={`jippy-outlet-edit-v2-day-status ${
                          day.isOpen
                            ? "jippy-outlet-edit-v2-status-open"
                            : "jippy-outlet-edit-v2-status-closed"
                        }`}
                      >
                        {day.isOpen
                          ? "Open"
                          : "Closed"}
                      </div>

                      <div className="jippy-outlet-edit-v2-time-box">

                        <label>
                          Opening
                        </label>

                        <input
                          type="time"
                          value={
                            day.openingTime
                          }
                          disabled={
                            !day.isOpen
                          }
                          onChange={(
                            event
                          ) =>
                            handleDayChange(
                              day.dayOfWeekId,
                              "openingTime",
                              event
                                .target
                                .value
                            )
                          }
                        />

                      </div>

                      <div className="jippy-outlet-edit-v2-time-box">

                        <label>
                          Closing
                        </label>

                        <input
                          type="time"
                          value={
                            day.closingTime
                          }
                          disabled={
                            !day.isOpen
                          }
                          onChange={(
                            event
                          ) =>
                            handleDayChange(
                              day.dayOfWeekId,
                              "closingTime",
                              event
                                .target
                                .value
                            )
                          }
                        />

                      </div>

                      <select
                        value={
                          day.slotType ||
                          "FULL_DAY"
                        }
                        disabled={
                          !day.isOpen
                        }
                        onChange={(event) =>
                          handleDayChange(
                            day.dayOfWeekId,
                            "slotType",
                            event.target.value
                          )
                        }
                      >
                        <option value="FULL_DAY">
                          Full Day
                        </option>

                        <option value="MORNING">
                          Morning
                        </option>

                        <option value="EVENING">
                          Evening
                        </option>
                      </select>

                    </div>
                  );
                }
              )}

            </div>

          </section>

          {/* ACTIONS */}
          <div className="jippy-outlet-edit-v2-actions">

            <button
              type="button"
              className="jippy-outlet-edit-v2-cancel-button"
              onClick={handleBack}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="jippy-outlet-edit-v2-update-button"
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="jippy-outlet-edit-v2-button-spinner" />
                  Updating...
                </>
              ) : (
                "✓ Update Outlet"
              )}
            </button>

          </div>

        </form>

      </div>

      {/* SUCCESS POPUP */}
      {showSuccessPopup && (
        <div className="jippy-outlet-edit-v2-popup-overlay">

          <div className="jippy-outlet-edit-v2-popup jippy-outlet-edit-v2-success-popup">

            <div className="jippy-outlet-edit-v2-popup-icon jippy-outlet-edit-v2-success-icon">
              ✓
            </div>

            <h2>
              Outlet Updated Successfully
            </h2>

            <p>
              {popupMessage}
            </p>

            <button
              type="button"
              onClick={
                handleSuccessContinue
              }
              className="jippy-outlet-edit-v2-popup-success-button"
            >
              Continue
            </button>

          </div>

        </div>
      )}

      {/* ERROR POPUP */}
      {showErrorPopup && (
        <div className="jippy-outlet-edit-v2-popup-overlay">

          <div className="jippy-outlet-edit-v2-popup jippy-outlet-edit-v2-error-popup">

            <div className="jippy-outlet-edit-v2-popup-icon jippy-outlet-edit-v2-error-icon">
              !
            </div>

            <h2>
              Update Failed
            </h2>

            <p>
              {popupMessage}
            </p>

            <button
              type="button"
              onClick={() =>
                setShowErrorPopup(false)
              }
              className="jippy-outlet-edit-v2-popup-error-button"
            >
              Close
            </button>

          </div>

        </div>
      )}

    </div>
  );
}

export default OutletEdit;