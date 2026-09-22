import React, { useEffect, useMemo, useState } from "react";

import Select from "react-select";
import {
  getOutletDetails,
  getOutletById,
  updateOutletDetailsByMerchant,
} from "../services/outletListService";

import {
  getStates,
  getCitiesByState,
  getAreasByCity,
   getCuisineTypes,
} from "../services/outletService";

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

const extractOperatingAndCustomDays = (outlet) => {
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
  const custom = [];
  const assignedDays = new Set();

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

    const timingObj = {
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

    if (!assignedDays.has(dayId)) {
      assignedDays.add(dayId);
      days[dayId - 1] = timingObj;
    } else {
      custom.push({
        ...timingObj,
        slotType: timingObj.slotType || "CUSTOM",
      });
    }
  });

  return { days, custom };
};

const extractOperatingDays = (outlet) => {
  return extractOperatingAndCustomDays(outlet).days;
};

function OutletEdit({
  outletId: propOutletId,
  selectedOutlet: propSelectedOutlet,
  setActivePage,
}) {


  const [cuisineOptions, setCuisineOptions] = useState([]);
  const [cuisineDropdownOpen, setCuisineDropdownOpen] =
  useState(false);

const [cuisineSearch, setCuisineSearch] =
  useState("");

useEffect(() => {
  const fetchCuisineTypes = async () => {
    try {
      const response = await getCuisineTypes();

      const cuisines =
        response?.data?.data ||
        response?.data ||
        [];

      setCuisineOptions(
        cuisines.map((cuisine) => ({
          value: cuisine.cuisineTypeId,
          label: cuisine.cuisineTypeName,
        }))
      );
    } catch (error) {
      console.error(
        "Failed to fetch cuisine types:",
        error
      );
    }
  };

  fetchCuisineTypes();
}, []);


  const loggedInUserId =
    localStorage.getItem("userId") ||
    localStorage.getItem("approverId") ||
    "1";

  const loggedInRole = localStorage.getItem("role") || "";

  const currentLoggedUser =
    localStorage.getItem("username") ||
    localStorage.getItem("loggedInUser") ||
    (() => {
      try {
        const ud = localStorage.getItem("userData");
        if (ud) {
          const parsed = JSON.parse(ud);
          return parsed?.username || parsed?.name || parsed?.email;
        }
      } catch (e) {}
      return null;
    })() ||
    (loggedInRole
      ? loggedInRole
          .replace("ROLE_", "")
          .replace(/_/g, " ")
          .toLowerCase()
          .replace(/\b\w/g, (char) => char.toUpperCase())
      : "") ||
    "Admin";

  const displayUpdatedBy = currentLoggedUser;

  const [states, setStates] = useState([]);
const [cities, setCities] = useState([]);
const [areas, setAreas] = useState([]);

const [loadingStates, setLoadingStates] = useState(false);
const [loadingCities, setLoadingCities] = useState(false);
const [loadingAreas, setLoadingAreas] = useState(false);

const stateOptions = states.map((state) => ({
  value: state.stateId,
  label: state.stateName,
}));

const cityOptions = cities.map((city) => ({
  value: city.cityId,
  label: city.cityName,
}));

const areaOptions = areas.map((area) => ({
  value: area.areaId,
  label: area.areaName,
}));

// useEffect(() => {
//   const fetchStates = async () => {
//     try {
//       const response = await getStates();
//       setStates(response.data);
//     } catch (error) {
//       console.error("Error fetching states:", error);
//     }
//   };

//   fetchStates();
// }, []);

const handleStateChange = async (selected) => {
  const stateId = selected?.value || "";

  setFormData((current) => ({
    ...current,
    stateId,
    cityId: "",
    areaId: "",
  }));

  setCities([]);
  setAreas([]);

  if (!stateId) return;

  setLoadingCities(true);

  try {
    const response = await getCitiesByState(stateId);
    setCities(response.data || []);
  } catch (error) {
    console.error("Failed to fetch cities:", error);
  } finally {
    setLoadingCities(false);
  }
};


const handleCityChange = async (selected) => {
  const cityId = selected?.value || "";

  setFormData((current) => ({
    ...current,
    cityId,
    areaId: "",
  }));

  setAreas([]);

  if (!cityId) return;

  setLoadingAreas(true);

  try {
    const response = await getAreasByCity(cityId);
    setAreas(response.data || []);
  } catch (error) {
    console.error("Failed to fetch areas:", error);
  } finally {
    setLoadingAreas(false);
  }
};


const handleAreaChange = (selected) => {
  setFormData((current) => ({
    ...current,
    areaId: selected?.value || "",
  }));
};
useEffect(() => {
  const fetchStates = async () => {
    setLoadingStates(true);

    try {
      const response = await getStates();
      setStates(response.data || []);
    } catch (error) {
      console.error("Error fetching states:", error);
    } finally {
      setLoadingStates(false);
    }
  };

  fetchStates();
}, []);



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


    const [customTimings, setCustomTimings] = useState([]);
const [showTimingModal, setShowTimingModal] = useState(false);

const [newTiming, setNewTiming] = useState({
  dayOfWeekId: "",
  isOpen: true,
  openingTime: "09:00",
  closingTime: "13:00",
});

  const [formData, setFormData] =
    useState({
      outletName: "",
      merchantId: "",
      outletEmail: "",
      outletPhone: "",
      alternateOutletPhone: "",
updatedBy: loggedInUserId || "",


      isGstApplied: false,
      fssaiNumber: "",
gstNumber: "",


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
      setLoadError("Outlet ID not found.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setLoadError("");

      const response = await getOutletDetails(outletId);

      const data = unwrapResponse(response);

      console.log("GET OUTLET DETAILS:", data);

      if (!data) {
        throw new Error("No outlet details received.");
      }

      if (!mounted) return;

      const { days, custom } = extractOperatingAndCustomDays(data);
      setCustomTimings(custom);

      setFormData({
        outletName: data.outletName || "",
        merchantId: data.merchantId || "",

        outletEmail: data.outletEmail || "",
        outletPhone: data.outletPhone || "",
        alternateOutletPhone:
          data.alternateOutletPhone || "",

        updatedBy: loggedInUserId || "1",

        isGstApplied:
          data.isGstApplied === true,

        fssaiNumber:
          data.fssaiNumber || "",

        gstNumber:
          data.gstNumber || "",

        accountNumber:
          data.accountNumber || "",

        ifscCode:
          data.ifscCode || "",

        bankName:
          data.bankName || "",

        accountHolderName:
          data.accountHolderName || "",

        buildingNumber:
          data.buildingNumber || "",

        road:
          data.road || "",

        landmark:
          data.landmark || "",

        stateId:
          data.stateId || "",

        cityId:
          data.cityId || "",

        areaId:
          data.areaId || "",

        latitude:
          data.latitude ?? "",

        longitude:
          data.longitude ?? "",

        cuisineType:
          extractCuisineIds(data),

        operatingDays: days,
      });

      console.log("FORM DATA LOADED");

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
}, [outletId]);

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
    console.log("LOGGED IN USER ID:", loggedInUserId);
console.log("LOGGED IN ROLE:", loggedInRole);
  };

  /*
   * CUISINE
   */
const handleCuisineChange = (event) => {
  const values = Array.from(
    event.target.selectedOptions
  )
    .map((option) => Number(option.value))
    .filter((id) => !Number.isNaN(id));

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



  const handleNewTimingChange = (field, value) => {
  setNewTiming((previous) => ({
    ...previous,
    [field]: value,
  }));
};


const handleAddTiming = () => {
  if (!newTiming.dayOfWeekId) {
    showError("Please select a day.");
    return;
  }

  if (
    newTiming.isOpen &&
    (!newTiming.openingTime || !newTiming.closingTime)
  ) {
    showError("Please select opening and closing time.");
    return;
  }

  setCustomTimings((previous) => [
    ...previous,
    {
      ...newTiming,
      dayOfWeekId: Number(newTiming.dayOfWeekId),
    },
  ]);

  setNewTiming({
    dayOfWeekId: "",
    isOpen: true,
    openingTime: "09:00",
    closingTime: "13:00",
  });

  setShowTimingModal(false);
};


const handleDeleteCustomTiming = (index) => {
  setCustomTimings((previous) =>
    previous.filter((_, currentIndex) => currentIndex !== index)
  );
};

  /*
   * VALIDATION
   */
const validateForm = () => {
  if (!formData.outletName.trim()) {
    showError("Outlet name is required.");
    return false;
  }

  if (!formData.outletEmail.trim()) {
    showError("Outlet email is required.");
    return false;
  }

  if (!formData.outletPhone.trim()) {
    showError("Outlet phone is required.");
    return false;
  }

  if (!formData.accountNumber.trim()) {
    showError("Account number is required.");
    return false;
  }

  if (!formData.ifscCode.trim()) {
    showError("IFSC code is required.");
    return false;
  }

  if (!formData.bankName.trim()) {
    showError("Bank name is required.");
    return false;
  }

  if (!formData.accountHolderName.trim()) {
    showError("Account holder name is required.");
    return false;
  }

  if (!formData.buildingNumber.trim()) {
    showError("Building number is required.");
    return false;
  }

  if (!formData.road.trim()) {
    showError("Road is required.");
    return false;
  }

  if (!formData.merchantId) {
    showError("Merchant ID was not fetched.");
    return false;
  }

  if (!formData.updatedBy) {
    showError("Updated By is required.");
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

        fssaiNumber: formData.fssaiNumber,
    gstNumber: formData.gstNumber,

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

      operatingDays: [
        ...formData.operatingDays
          .filter((day) => day.isOpen === true)
          .map((day) => ({
            dayOfWeekId: Number(day.dayOfWeekId),
            isOpen: true,
            openingTime: normalizeTime(day.openingTime),
            closingTime: normalizeTime(day.closingTime),
            slotType: day.slotType || "FULL_DAY",
          })),
        ...customTimings
          .filter((timing) => timing.isOpen === true)
          .map((timing) => ({
            dayOfWeekId: Number(timing.dayOfWeekId),
            isOpen: true,
            openingTime: normalizeTime(timing.openingTime),
            closingTime: normalizeTime(timing.closingTime),
            slotType: timing.slotType || "CUSTOM",
          })),
      ],

      updatedBy: Number(formData.updatedBy) || Number(loggedInUserId) || 1,
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
                  type="text"
                  name="updatedBy"
                  value={currentLoggedUser}
                  readOnly
                  className="jippy-outlet-edit-v2-readonly"
                />

                <small style={{ color: "#64748b" }}>
                  Current logged-in user: <strong>{currentLoggedUser}</strong> (ID: {loggedInUserId})
                </small>
              </div>

            </div>

          </section>

          
{/* CUISINE */}
<section className="jippy-outlet-edit-v2-section">

  <div className="jippy-outlet-edit-v2-section-header">
    <div>
      <h2>Cuisine Types</h2>

      <p>
        Select all cuisines applicable to this outlet
      </p>
    </div>
  </div>

<div className="jippy-outlet-edit-v2-cuisine-box">

  <div
    className="cuisine-dropdown"
    onClick={() => setCuisineDropdownOpen((prev) => !prev)}
  >
    <div className="cuisine-dropdown-header">
      <span>
        {formData.cuisineType.length > 0
          ? `${formData.cuisineType.length} cuisine(s) selected`
          : "Select cuisines"}
      </span>

      <span className="cuisine-dropdown-arrow">
        {cuisineDropdownOpen ? "▲" : "▼"}
      </span>
    </div>

    {cuisineDropdownOpen && (
      <div
        className="cuisine-dropdown-menu"
        onClick={(e) => e.stopPropagation()}
      >

        <input
          type="text"
          placeholder="Search cuisine..."
          className="cuisine-search"
          value={cuisineSearch}
          onChange={(e) =>
            setCuisineSearch(e.target.value)
          }
        />

        <div className="cuisine-options">

          {cuisineOptions
            .filter((cuisine) =>
              cuisine.label
                .toLowerCase()
                .includes(cuisineSearch.toLowerCase())
            )
            .map((cuisine) => {

              const isSelected =
                formData.cuisineType.includes(
                  Number(cuisine.value)
                );

              return (
                <div
                  key={cuisine.value}
                  className={`cuisine-option ${
                    isSelected ? "selected" : ""
                  }`}
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      cuisineType: isSelected
                        ? prev.cuisineType.filter(
                            (id) =>
                              Number(id) !==
                              Number(cuisine.value)
                          )
                        : [
                            ...prev.cuisineType,
                            Number(cuisine.value),
                          ],
                    }));
                  }}
                >
                  <span>
                    {cuisine.label}
                  </span>

                  {isSelected && (
                    <span className="cuisine-check">
                      ✓
                    </span>
                  )}
                </div>
              );
            })}

        </div>
      </div>
    )}
  </div>

  {/* SELECTED CUISINES */}

  <div className="jippy-outlet-edit-v2-selected-cuisines">

    {formData.cuisineType.length === 0 ? (
      <span className="no-cuisines">
        No cuisines selected
      </span>
    ) : (
      formData.cuisineType.map((id) => {

        const cuisine = cuisineOptions.find(
          (item) =>
            Number(item.value) === Number(id)
        );

        return (
          <span
            key={id}
            className="jippy-outlet-edit-v2-cuisine-chip"
          >
            {cuisine?.label || `Cuisine ${id}`}

            <button
              type="button"
              onClick={() => {
                setFormData((prev) => ({
                  ...prev,
                  cuisineType:
                    prev.cuisineType.filter(
                      (cuisineId) =>
                        Number(cuisineId) !==
                        Number(id)
                    ),
                }));
              }}
            >
              ×
            </button>
          </span>
        );
      })
    )}

  </div>

</div>

</section>

          {/* GST & COMPLIANCE */}
          <section className="jippy-outlet-edit-v2-section">

            <div className="jippy-outlet-edit-v2-section-header">
              <div>
                <h2>
                  GST & Compliance
                </h2>

                <p>
                  GST applicability and license information
                </p>
              </div>
            </div>

            <label className="jippy-outlet-edit-v2-checkbox" style={{ marginBottom: "18px" }}>

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

            <div className="jippy-outlet-edit-v2-grid">
              <div className="jippy-outlet-edit-v2-field">
                <label>FSSAI Number</label>
                <input
                  type="text"
                  name="fssaiNumber"
                  value={formData.fssaiNumber}
                  onChange={handleChange}
                  placeholder="Enter 14-digit FSSAI number"
                />
              </div>

              <div className="jippy-outlet-edit-v2-field">
                <label>GST Number</label>
                <input
                  type="text"
                  name="gstNumber"
                  value={formData.gstNumber}
                  onChange={handleChange}
                  placeholder="Enter 15-digit GSTIN"
                />
              </div>
            </div>

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
                  <span>*</span>
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
                  <span>*</span>
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
                  <span>*</span>
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
                  <span>*</span>
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
                  <span>*</span>
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
                  <span>*</span>
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
  <label>State</label>

  <Select
    className="jippy-outlet-edit-v2-select"
    classNamePrefix="jippy-outlet-edit-v2-select"
    options={stateOptions}
    value={
      stateOptions.find(
        (item) =>
          item.value === Number(formData.stateId)
      ) || null
    }
    onChange={handleStateChange}
    isLoading={loadingStates}
    isSearchable
    isClearable
    placeholder="Select State"
  />
</div>

            <div className="jippy-outlet-edit-v2-field">
  <label>City</label>

  <Select
    className="jippy-outlet-edit-v2-select"
    classNamePrefix="jippy-outlet-edit-v2-select"
    options={cityOptions}
    value={
      cityOptions.find(
        (item) =>
          item.value === Number(formData.cityId)
      ) || null
    }
    onChange={handleCityChange}
    isLoading={loadingCities}
    isDisabled={!formData.stateId}
    isSearchable
    isClearable
    placeholder="Select City"
  />
</div>
             <div className="jippy-outlet-edit-v2-field">
  <label>Area</label>

  <Select
    className="jippy-outlet-edit-v2-select"
    classNamePrefix="jippy-outlet-edit-v2-select"
    options={areaOptions}
    value={
      areaOptions.find(
        (item) =>
          item.value === Number(formData.areaId)
      ) || null
    }
    onChange={handleAreaChange}
    isLoading={loadingAreas}
    isDisabled={!formData.cityId}
    isSearchable
    isClearable
    placeholder="Select Area"
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

          {/* OPERATING DAYS & TIMINGS */}
          <section className="jippy-outlet-edit-v2-section">

            <div className="jippy-outlet-edit-v2-section-header">
              <div>
                <h2>
                  Operating Days & Timings
                </h2>

                <p>
                  Set standard opening and closing times for each day, plus extra shifts
                </p>
              </div>

              <button
                type="button"
                className="jippy-outlet-edit-v2-add-timing-button"
                onClick={() => {
                  setNewTiming({
                    dayOfWeekId: "1",
                    isOpen: true,
                    openingTime: "09:00",
                    closingTime: "13:00",
                  });
                  setShowTimingModal(true);
                }}
                disabled={saving}
              >
                <span>+</span>
                Add Timing
              </button>
            </div>

            {/* CURRENT TIMINGS TABLE */}
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

                  const dayCustomTimings = customTimings
                    .map((timing, originalIndex) => ({
                      ...timing,
                      originalIndex,
                    }))
                    .filter(
                      (timing) =>
                        Number(timing.dayOfWeekId) ===
                        Number(day.dayOfWeekId)
                    );

                  return (
                    <div
                      key={day.dayOfWeekId}
                      className="jippy-outlet-edit-v2-day-group"
                    >
                      <div
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

                        <button
                          type="button"
                          className="jippy-outlet-edit-v2-inline-add-timing-btn"
                          onClick={() => {
                            setNewTiming({
                              dayOfWeekId: String(day.dayOfWeekId),
                              isOpen: true,
                              openingTime: "17:00",
                              closingTime: "22:00",
                            });
                            setShowTimingModal(true);
                          }}
                          disabled={saving}
                          title={`Add extra timing/shift for ${dayInfo?.name}`}
                        >
                          + Shift
                        </button>

                      </div>

                      {/* EXTRA SHIFTS SHOWN DIRECTLY BELOW THIS DAY'S CURRENT TIMING */}
                      {dayCustomTimings.length > 0 && (
                        <div className="jippy-outlet-edit-v2-day-extra-slots">
                          {dayCustomTimings.map((extra) => (
                            <div
                              key={`extra-${extra.originalIndex}`}
                              className="jippy-outlet-edit-v2-day-extra-item"
                            >
                              <span className="jippy-outlet-edit-v2-extra-pill">
                                Extra Shift ({dayInfo?.short})
                              </span>

                              <span className="jippy-outlet-edit-v2-extra-status">
                                {extra.isOpen ? "Open" : "Closed"}
                              </span>

                              <div className="jippy-outlet-edit-v2-extra-time-inputs">
                                <label>From:</label>
                                <input
                                  type="time"
                                  value={extra.openingTime}
                                  disabled={!extra.isOpen || saving}
                                  onChange={(e) => {
                                    const updated = [...customTimings];
                                    updated[extra.originalIndex] = {
                                      ...updated[extra.originalIndex],
                                      openingTime: e.target.value,
                                    };
                                    setCustomTimings(updated);
                                  }}
                                />

                                <label>To:</label>
                                <input
                                  type="time"
                                  value={extra.closingTime}
                                  disabled={!extra.isOpen || saving}
                                  onChange={(e) => {
                                    const updated = [...customTimings];
                                    updated[extra.originalIndex] = {
                                      ...updated[extra.originalIndex],
                                      closingTime: e.target.value,
                                    };
                                    setCustomTimings(updated);
                                  }}
                                />
                              </div>

                              <button
                                type="button"
                                className="jippy-outlet-edit-v2-extra-delete-btn"
                                onClick={() =>
                                  handleDeleteCustomTiming(extra.originalIndex)
                                }
                                disabled={saving}
                                title="Remove this extra shift"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                    </div>
                  );
                }
              )}

            </div>

            {/* BELOW CURRENT TIMINGS: ALL ADDITIONAL TIMINGS */}
            <div className="jippy-outlet-edit-v2-additional-section-inline">
              <div className="jippy-outlet-edit-v2-additional-header">
                <div>
                  <h3>Additional Timings & Shifts</h3>
                  <p>All extra shifts and custom working hours added below current timings</p>
                </div>

                <button
                  type="button"
                  className="jippy-outlet-edit-v2-add-timing-button"
                  onClick={() => {
                    setNewTiming({
                      dayOfWeekId: "1",
                      isOpen: true,
                      openingTime: "09:00",
                      closingTime: "13:00",
                    });
                    setShowTimingModal(true);
                  }}
                  disabled={saving}
                >
                  <span>+</span>
                  Add Timing
                </button>
              </div>

              {customTimings.length === 0 ? (
                <div className="jippy-outlet-edit-v2-no-custom-timings">
                  No additional timings added yet. Click <strong>"+ Add Timing"</strong> or <strong>"+ Shift"</strong> above to add extra shifts.
                </div>
              ) : (
                <div className="jippy-outlet-edit-v2-custom-timings">
                  {customTimings.map((timing, index) => {
                    const selectedDay = JIPPY_EDIT_DAYS.find(
                      (day) =>
                        day.id === Number(timing.dayOfWeekId)
                    );

                    return (
                      <div
                        key={`custom-${index}`}
                        className="jippy-outlet-edit-v2-custom-row"
                      >
                        {/* DAY */}
                        <select
                          value={timing.dayOfWeekId}
                          onChange={(event) => {
                            const updated = [...customTimings];
                            updated[index] = {
                              ...updated[index],
                              dayOfWeekId: Number(event.target.value),
                            };
                            setCustomTimings(updated);
                          }}
                          disabled={saving}
                          className="jippy-outlet-edit-v2-custom-day-select"
                        >
                          {JIPPY_EDIT_DAYS.map((day) => (
                            <option
                              key={day.id}
                              value={day.id}
                            >
                              {day.name}
                            </option>
                          ))}
                        </select>

                        {/* OPEN / CLOSED */}
                        <label className="jippy-outlet-edit-v2-custom-toggle">
                          <input
                            type="checkbox"
                            checked={timing.isOpen}
                            disabled={saving}
                            onChange={(event) => {
                              const updated = [...customTimings];
                              updated[index] = {
                                ...updated[index],
                                isOpen: event.target.checked,
                              };
                              setCustomTimings(updated);
                            }}
                          />
                          <span className="jippy-outlet-edit-v2-custom-toggle-slider" />
                          <span className="jippy-outlet-edit-v2-custom-toggle-text">
                            {timing.isOpen ? "Open" : "Closed"}
                          </span>
                        </label>

                        {/* OPENING */}
                        <div className="jippy-outlet-edit-v2-custom-time-box">
                          <label>Opening</label>
                          <input
                            type="time"
                            value={timing.openingTime}
                            disabled={!timing.isOpen || saving}
                            onChange={(event) => {
                              const updated = [...customTimings];
                              updated[index] = {
                                ...updated[index],
                                openingTime: event.target.value,
                              };
                              setCustomTimings(updated);
                            }}
                          />
                        </div>

                        {/* CLOSING */}
                        <div className="jippy-outlet-edit-v2-custom-time-box">
                          <label>Closing</label>
                          <input
                            type="time"
                            value={timing.closingTime}
                            disabled={!timing.isOpen || saving}
                            onChange={(event) => {
                              const updated = [...customTimings];
                              updated[index] = {
                                ...updated[index],
                                closingTime: event.target.value,
                              };
                              setCustomTimings(updated);
                            }}
                          />
                        </div>

                        {/* DELETE */}
                        <button
                          type="button"
                          className="jippy-outlet-edit-v2-delete-timing-button"
                          onClick={() =>
                            handleDeleteCustomTiming(index)
                          }
                          disabled={saving}
                          title="Delete timing"
                        >
                          🗑
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </section>


{/* =================================================
    ADD TIMING MODAL
    ================================================= */}

{showTimingModal && (
  <div
    className="jippy-outlet-edit-v2-timing-overlay"
    onClick={() => setShowTimingModal(false)}
  >

    <div
      className="jippy-outlet-edit-v2-timing-modal"
      onClick={(event) => event.stopPropagation()}
    >

      <div className="jippy-outlet-edit-v2-timing-modal-header">

        <div>
          <h3>
            Add Custom Timing
          </h3>

          <p>
            Add a custom day and time for this outlet.
          </p>
        </div>

        <button
          type="button"
          className="jippy-outlet-edit-v2-timing-close"
          onClick={() => setShowTimingModal(false)}
        >
          ×
        </button>

      </div>


      <div className="jippy-outlet-edit-v2-timing-form">

        {/* DAY */}

        <div className="jippy-outlet-edit-v2-timing-field">

          <label>
            Day <span>*</span>
          </label>

          <select
            value={newTiming.dayOfWeekId}
            onChange={(event) =>
              handleNewTimingChange(
                "dayOfWeekId",
                event.target.value
              )
            }
          >

            <option value="">
              Select Day
            </option>

            {JIPPY_EDIT_DAYS.map((day) => (
              <option
                key={day.id}
                value={day.id}
              >
                {day.name}
              </option>
            ))}

          </select>

        </div>


        {/* STATUS */}

        <div className="jippy-outlet-edit-v2-timing-field">

          <label>
            Status
          </label>

          <label className="jippy-outlet-edit-v2-modal-toggle">

            <input
              type="checkbox"
              checked={newTiming.isOpen}
              onChange={(event) =>
                handleNewTimingChange(
                  "isOpen",
                  event.target.checked
                )
              }
            />

            <span className="jippy-outlet-edit-v2-modal-toggle-slider" />

            <span className="jippy-outlet-edit-v2-modal-toggle-text">
              {newTiming.isOpen
                ? "Open"
                : "Closed"}
            </span>

          </label>

        </div>


        {/* OPENING */}

        <div className="jippy-outlet-edit-v2-timing-field">

          <label>
            Opening Time <span>*</span>
          </label>

          <input
            type="time"
            value={newTiming.openingTime}
            disabled={!newTiming.isOpen}
            onChange={(event) =>
              handleNewTimingChange(
                "openingTime",
                event.target.value
              )
            }
          />

        </div>


        {/* CLOSING */}

        <div className="jippy-outlet-edit-v2-timing-field">

          <label>
            Closing Time <span>*</span>
          </label>

          <input
            type="time"
            value={newTiming.closingTime}
            disabled={!newTiming.isOpen}
            onChange={(event) =>
              handleNewTimingChange(
                "closingTime",
                event.target.value
              )
            }
          />

        </div>

      </div>


      <div className="jippy-outlet-edit-v2-timing-actions">

        <button
          type="button"
          className="jippy-outlet-edit-v2-timing-cancel"
          onClick={() => setShowTimingModal(false)}
        >
          Cancel
        </button>

        <button
          type="button"
          className="jippy-outlet-edit-v2-timing-submit"
          onClick={handleAddTiming}
        >
          Add Timing
        </button>

      </div>

    </div>

  </div>
)}

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