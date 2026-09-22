import { useEffect, useMemo, useState, useRef } from "react";
import Select from "react-select";
import { FiX, FiFileText } from "react-icons/fi";
import "../styles/OutletCreate.css";

import {
  createOutlet,
  getStates,
  getCitiesByState,
  getAreasByCity,
  getCuisineTypes,
} from "../services/outletService";
import { getAllMerchants } from "../services/merchantService";

const DAYS = [
  { id: 1, name: "Monday" },
  { id: 2, name: "Tuesday" },
  { id: 3, name: "Wednesday" },
  { id: 4, name: "Thursday" },
  { id: 5, name: "Friday" },
  { id: 6, name: "Saturday" },
  { id: 7, name: "Sunday" },
];

/*
 * IMPORTANT:
 * Backend expects Integer[] for cuisineType.
 * Replace these IDs with the actual cuisine IDs
 * from your backend/master data API when available.
 */
// const cuisineOptions = [
//   { value: 1, label: "Indian" },
//   { value: 2, label: "Chinese" },
//   { value: 3, label: "Arabian" },
//   { value: 4, label: "Italian" },
//   { value: 5, label: "South Indian" },
//   { value: 6, label: "North Indian" },
// ];

function OutletCreate({ setActivePage }) {

  /* =====================================================
     FORM
     ===================================================== */

  const [form, setForm] = useState({
    outletName: "",
    merchantId: "",
    cuisineType: [],

    outletPhone: "",
    alternateOutletPhone: "",
    outletEmail: "",

    fssaiNumber: "",
    gstNumber: "",

    username: "",
    password: "",

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

    updatedBy: 101,
  });


  /* =====================================================
     MERCHANTS
     ===================================================== */

  const [merchants, setMerchants] = useState([]);
  const [loadingMerchants, setLoadingMerchants] = useState(false);

  /* =====================================================
     LOCATION
     ===================================================== */

  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);

  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingAreas, setLoadingAreas] = useState(false);

  const [cuisineOptions, setCuisineOptions] = useState([]);

  /* =====================================================
     DOCUMENTS (FSSAI & GST - OPTIONAL)
     ===================================================== */

  const [fssaiFile, setFssaiFile] = useState(null);
  const [fssaiDocumentUrl, setFssaiDocumentUrl] = useState("");
  const fssaiFileInputRef = useRef(null);

  const [gstFile, setGstFile] = useState(null);
  const [gstDocumentUrl, setGstDocumentUrl] = useState("");
  const gstFileInputRef = useRef(null);


  /* =====================================================
     OPERATING DAYS
     ===================================================== */

  const [operatingDays, setOperatingDays] = useState(
    DAYS.map((day) => ({
      dayOfWeekId: day.id,
      isOpen: true,
      openingTime: "09:00",
      closingTime: "22:00",
    }))
  );


  const [customTimings, setCustomTimings] = useState([]);

const [showTimingModal, setShowTimingModal] = useState(false);

const [newTiming, setNewTiming] = useState({
  dayOfWeekId: "",
  isOpen: true,
  openingTime: "09:00",
  closingTime: "22:00",
});

const handleNewTimingChange = (field, value) => {
  setNewTiming((current) => ({
    ...current,
    [field]: value,
  }));
};

const handleAddTiming = () => {
  if (!newTiming.dayOfWeekId) {
    showNotification("error", "Please select a day.");
    return;
  }

  const timing = {
    dayOfWeekId: Number(newTiming.dayOfWeekId),
    isOpen: newTiming.isOpen,
    openingTime: newTiming.openingTime,
    closingTime: newTiming.closingTime,
  };

  setCustomTimings((current) => [
    ...current,
    timing,
  ]);

  setNewTiming({
    dayOfWeekId: "",
    isOpen: true,
    openingTime: "09:00",
    closingTime: "22:00",
  });

  setShowTimingModal(false);
};

const handleDeleteCustomTiming = (index) => {
  setCustomTimings((current) =>
    current.filter((_, timingIndex) => timingIndex !== index)
  );
};


  /* =====================================================
     UI STATE
     ===================================================== */

  const [submitting, setSubmitting] = useState(false);

  const [errors, setErrors] = useState({});

  const [notification, setNotification] = useState({
    type: "",
    message: "",
  });


  /* =====================================================
     NOTIFICATION
     ===================================================== */

  const showNotification = (type, message) => {

    setNotification({
      type,
      message,
    });

    setTimeout(() => {
      setNotification({
        type: "",
        message: "",
      });
    }, 4500);
  };


  /* =====================================================
     FORM CHANGE
     ===================================================== */

  const handleChange = (event) => {

    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: "",
    }));
  };


  /* =====================================================
     DOCUMENT CHANGE & REMOVE HANDLERS
     ===================================================== */

  const handleDocumentChange = (e, docType) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showNotification("error", "File size should be less than 5MB");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === "string" ? reader.result : "";
      if (docType === "fssai") {
        setFssaiFile(file);
        setFssaiDocumentUrl(dataUrl);
      } else if (docType === "gst") {
        setGstFile(file);
        setGstDocumentUrl(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveDocument = (docType) => {
    if (docType === "fssai") {
      setFssaiFile(null);
      setFssaiDocumentUrl("");
      if (fssaiFileInputRef.current) fssaiFileInputRef.current.value = "";
    } else if (docType === "gst") {
      setGstFile(null);
      setGstDocumentUrl("");
      if (gstFileInputRef.current) gstFileInputRef.current.value = "";
    }
  };


  /* =====================================================
     FETCH MERCHANTS
     ===================================================== */

  useEffect(() => {
    const fetchMerchants = async () => {
      try {
        setLoadingMerchants(true);
        const response = await getAllMerchants();
        const list = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.content)
          ? response.content
          : Array.isArray(response?.data?.data)
          ? response.data.data
          : [];
        setMerchants(list);
      } catch (error) {
        console.error("Failed to fetch merchants:", error);
      } finally {
        setLoadingMerchants(false);
      }
    };

    fetchMerchants();
  }, []);

  const merchantOptions = useMemo(() => {
    return merchants.map((m) => {
      const id = m.merchantId || m.id;
      const name =
        m.merchantName ||
        m.name ||
        m.businessName ||
        `${m.firstName || ""} ${m.lastName || ""}`.trim() ||
        `Merchant #${id}`;
      return {
        value: id,
        label: `${name} (ID: ${id})`,
        merchant: m,
      };
    });
  }, [merchants]);

  const handleMerchantChange = (selected) => {
    setForm((current) => ({
      ...current,
      merchantId: selected ? selected.value : "",
    }));
    setErrors((current) => ({
      ...current,
      merchantId: "",
    }));
  };

  const filterMerchantOption = (option, inputValue) => {
    if (!inputValue) return true;
    const search = inputValue.toLowerCase();
    const labelMatch = option.label?.toLowerCase().includes(search);
    const valueMatch = String(option.value).toLowerCase().includes(search);
    const phoneMatch = option.data?.merchant?.phone
      ? String(option.data.merchant.phone).toLowerCase().includes(search)
      : false;
    const emailMatch = option.data?.merchant?.email
      ? String(option.data.merchant.email).toLowerCase().includes(search)
      : false;
    return Boolean(labelMatch || valueMatch || phoneMatch || emailMatch);
  };

  useEffect(() => {
  const fetchCuisineTypes = async () => {
    try {
      const response = await getCuisineTypes();

      const cuisines = response?.data?.data || response?.data || [];

      setCuisineOptions(
        cuisines.map((cuisine) => ({
          value: cuisine.cuisineTypeId,
          label: cuisine.cuisineTypeName,
        }))
      );
    } catch (error) {
      console.error("Failed to fetch cuisine types:", error);
    }
  };

  fetchCuisineTypes();
}, []);

  /* =====================================================
     LOAD STATES
     ===================================================== */

  useEffect(() => {

    const loadStates = async () => {

      try {

        setLoadingStates(true);

        const response = await getStates();

        const data = Array.isArray(response?.data)
          ? response.data
          : [];

        setStates(data);

      } catch (error) {

        console.error(
          "Failed to fetch states:",
          error
        );

        showNotification(
          "error",
          "Unable to load states."
        );

      } finally {

        setLoadingStates(false);

      }
    };

    loadStates();

  }, []);


  /* =====================================================
     STATE CHANGE
     ===================================================== */

  const handleStateChange = async (selected) => {

    const stateId = selected?.value || "";

    setForm((current) => ({
      ...current,
      stateId,
      cityId: "",
      areaId: "",
    }));

    setCities([]);
    setAreas([]);

    setErrors((current) => ({
      ...current,
      stateId: "",
      cityId: "",
      areaId: "",
    }));

    if (!stateId) {
      return;
    }

    try {

      setLoadingCities(true);

      const response =
        await getCitiesByState(stateId);

      const data = Array.isArray(response?.data)
        ? response.data
        : [];

      setCities(data);

    } catch (error) {

      console.error(
        "Failed to fetch cities:",
        error
      );

      showNotification(
        "error",
        "Unable to load cities."
      );

    } finally {

      setLoadingCities(false);

    }
  };


  /* =====================================================
     CITY CHANGE
     ===================================================== */

  const handleCityChange = async (selected) => {

    const cityId = selected?.value || "";

    setForm((current) => ({
      ...current,
      cityId,
      areaId: "",
    }));

    setAreas([]);

    setErrors((current) => ({
      ...current,
      cityId: "",
      areaId: "",
    }));

    if (!cityId) {
      return;
    }

    try {

      setLoadingAreas(true);

      const response =
        await getAreasByCity(cityId);

      const data = Array.isArray(response?.data)
        ? response.data
        : [];

      setAreas(data);

    } catch (error) {

      console.error(
        "Failed to fetch areas:",
        error
      );

      showNotification(
        "error",
        "Unable to load areas."
      );

    } finally {

      setLoadingAreas(false);

    }
  };


  /* =====================================================
     CUISINE CHANGE
     ===================================================== */

const handleCuisineChange = (selected) => {
  setForm((prev) => ({
    ...prev,
    cuisineType: selected
      ? selected.map((item) => item.value)
      : [],
  }));
};


  /* =====================================================
     AREA CHANGE
     ===================================================== */

  const handleAreaChange = (selected) => {

    setForm((current) => ({
      ...current,
      areaId: selected?.value || "",
    }));

    setErrors((current) => ({
      ...current,
      areaId: "",
    }));
  };


  /* =====================================================
     OPERATING DAY TOGGLE
     ===================================================== */

  const handleDayToggle = (dayId) => {

    setOperatingDays((current) =>
      current.map((day) =>
        day.dayOfWeekId === dayId
          ? {
              ...day,
              isOpen: !day.isOpen,
            }
          : day
      )
    );
  };


  /* =====================================================
     OPERATING DAY TIME
     ===================================================== */

  const handleDayTimeChange = (
    dayId,
    field,
    value
  ) => {

    setOperatingDays((current) =>
      current.map((day) =>
        day.dayOfWeekId === dayId
          ? {
              ...day,
              [field]: value,
            }
          : day
      )
    );
  };


  /* =====================================================
     VALIDATION
     Based directly on FmOutletRequestDTO
     ===================================================== */

  const validateForm = () => {

    const newErrors = {};

    /* -----------------------------------------------------
       OUTLET NAME
       @NotBlank
       @Size(max = 100)
       ----------------------------------------------------- */

    if (!form.outletName.trim()) {

      newErrors.outletName =
        "Outlet name is required.";

    } else if (form.outletName.trim().length > 100) {

      newErrors.outletName =
        "Outlet name must not exceed 100 characters.";
    }


    /* -----------------------------------------------------
       MERCHANT ID
       @NotNull
       ----------------------------------------------------- */

    if (!form.merchantId) {

      newErrors.merchantId =
        "Please select a merchant.";
    }


    /* -----------------------------------------------------
       CUISINE TYPE
       @NotNull
       @Size(min = 1)
       ----------------------------------------------------- */

    if (
      !Array.isArray(form.cuisineType) ||
      form.cuisineType.length === 0
    ) {

      newErrors.cuisineType =
        "At least one cuisine type is required.";
    }


    /* -----------------------------------------------------
       OUTLET PHONE
       ----------------------------------------------------- */

    if (!form.outletPhone.trim()) {

      newErrors.outletPhone =
        "Outlet phone is required.";

    } else if (
      !/^[6-9]\d{9}$/.test(
        form.outletPhone.trim()
      )
    ) {

      newErrors.outletPhone =
        "Outlet phone must be a valid 10-digit Indian mobile number.";
    }


    /* -----------------------------------------------------
       ALTERNATE PHONE
       @Pattern
       Not @NotBlank, so optional
       ----------------------------------------------------- */

    if (
      form.alternateOutletPhone.trim() &&
      !/^[6-9]\d{9}$/.test(
        form.alternateOutletPhone.trim()
      )
    ) {

      newErrors.alternateOutletPhone =
        "Alternate outlet phone must be a valid 10-digit Indian mobile number.";
    }


    /* -----------------------------------------------------
       EMAIL
       @NotBlank
       @Email
       ----------------------------------------------------- */

    if (!form.outletEmail.trim()) {

      newErrors.outletEmail =
        "Outlet email is required.";

    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        form.outletEmail.trim()
      )
    ) {

      newErrors.outletEmail =
        "Invalid email format.";
    }


    /* -----------------------------------------------------
       FSSAI (Optional)
       exactly 14 digits if entered
       ----------------------------------------------------- */

    const fssaiVal = (form.fssaiNumber || "").trim();
    if (fssaiVal && !/^\d{14}$/.test(fssaiVal)) {
      newErrors.fssaiNumber =
        "FSSAI Number must contain exactly 14 digits.";
    }


    /* -----------------------------------------------------
       GST (Optional)
       exact backend pattern if entered
       ----------------------------------------------------- */

    const gstVal = (form.gstNumber || "")
      .trim()
      .toUpperCase();

    const gstRegex =
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

    if (gstVal && !gstRegex.test(gstVal)) {
      newErrors.gstNumber =
        "Invalid GST Number format (e.g. 36ABCDE1234F1Z5).";
    }


    /* -----------------------------------------------------
       USERNAME
       @NotBlank
       @Size(min = 4, max = 50)
       ----------------------------------------------------- */

    if (!form.username.trim()) {

      newErrors.username =
        "Username is required.";

    } else if (
      form.username.trim().length < 4 ||
      form.username.trim().length > 50
    ) {

      newErrors.username =
        "Username must contain 4 to 50 characters.";
    }


    /* -----------------------------------------------------
       PASSWORD
       8-20 chars
       lowercase
       uppercase
       number
       special character
       ----------------------------------------------------- */

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=!]).{8,20}$/;

    if (!form.password) {

      newErrors.password =
        "Password is required.";

    } else if (
      !passwordRegex.test(form.password)
    ) {

      newErrors.password =
        "Password must contain uppercase, lowercase, number and special character (8-20 characters).";
    }


    /* -----------------------------------------------------
       ACCOUNT NUMBER
       9-18 digits
       ----------------------------------------------------- */

    if (!form.accountNumber.trim()) {

      newErrors.accountNumber =
        "Account number is required.";

    } else if (
      !/^[0-9]{9,18}$/.test(
        form.accountNumber.trim()
      )
    ) {

      newErrors.accountNumber =
        "Account number must contain 9 to 18 digits.";
    }


    /* -----------------------------------------------------
       IFSC
       ----------------------------------------------------- */

    if (!form.ifscCode.trim()) {

      newErrors.ifscCode =
        "IFSC code is required.";

    } else if (
      !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(
        form.ifscCode.trim().toUpperCase()
      )
    ) {

      newErrors.ifscCode =
        "Invalid IFSC Code.";
    }


    /* -----------------------------------------------------
       BANK NAME
       @NotBlank
       @Size(max = 100)
       ----------------------------------------------------- */

    if (!form.bankName.trim()) {

      newErrors.bankName =
        "Bank name is required.";

    } else if (
      form.bankName.trim().length > 100
    ) {

      newErrors.bankName =
        "Bank name must not exceed 100 characters.";
    }


    /* -----------------------------------------------------
       ACCOUNT HOLDER
       ----------------------------------------------------- */

    if (!form.accountHolderName.trim()) {

      newErrors.accountHolderName =
        "Account holder name is required.";

    } else if (
      form.accountHolderName.trim().length > 100
    ) {

      newErrors.accountHolderName =
        "Account holder name must not exceed 100 characters.";
    }


    /* -----------------------------------------------------
       BUILDING
       ----------------------------------------------------- */

    if (!form.buildingNumber.trim()) {

      newErrors.buildingNumber =
        "Building number is required.";

    } else if (
      form.buildingNumber.trim().length > 50
    ) {

      newErrors.buildingNumber =
        "Building number must not exceed 50 characters.";
    }


    /* -----------------------------------------------------
       ROAD
       ----------------------------------------------------- */

    if (!form.road.trim()) {

      newErrors.road =
        "Road is required.";

    } else if (
      form.road.trim().length > 100
    ) {

      newErrors.road =
        "Road must not exceed 100 characters.";
    }


    /* -----------------------------------------------------
       LANDMARK
       Optional
       max 150
       ----------------------------------------------------- */

    if (
      form.landmark.trim().length > 150
    ) {

      newErrors.landmark =
        "Landmark must not exceed 150 characters.";
    }


    /* -----------------------------------------------------
       STATE / CITY / AREA
       DTO currently does NOT have @NotNull on these.
       We therefore don't force them as backend-required.
       ----------------------------------------------------- */


    /* -----------------------------------------------------
       LATITUDE / LONGITUDE
       No validation annotations in DTO.
       We only validate if user entered them.
       ----------------------------------------------------- */

    if (
      form.latitude.trim() &&
      Number.isNaN(Number(form.latitude.trim()))
    ) {

      newErrors.latitude =
        "Latitude must be a valid number.";
    }

    if (
      form.longitude.trim() &&
      Number.isNaN(Number(form.longitude.trim()))
    ) {

      newErrors.longitude =
        "Longitude must be a valid number.";
    }


    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };


  /* =====================================================
     CREATE OUTLET
     ===================================================== */

  const handleSubmit = async (event) => {

    event.preventDefault();

    const isValid = validateForm();

    if (!isValid) {

      showNotification(
        "error",
        "Please correct the highlighted fields."
      );

      return;
    }


    const payload = {

      outletName:
        form.outletName.trim(),

      merchantId:
        Number(form.merchantId),

      cuisineType:
        form.cuisineType,

      outletPhone:
        form.outletPhone.trim(),

      alternateOutletPhone:
        form.alternateOutletPhone.trim() ||
        null,

      outletEmail:
        form.outletEmail.trim(),

      fssaiNumber:
        form.fssaiNumber.trim() || null,

      gstNumber:
        form.gstNumber
          .trim()
          .toUpperCase() || null,

      fssaiDocumentUrl:
        fssaiDocumentUrl || null,

      fssaiDocument:
        fssaiDocumentUrl || null,

      gstDocumentUrl:
        gstDocumentUrl || null,

      gstDocument:
        gstDocumentUrl || null,

      username:
        form.username.trim(),

      password:
        form.password,

      accountNumber:
        form.accountNumber.trim(),

      ifscCode:
        form.ifscCode
          .trim()
          .toUpperCase(),

      bankName:
        form.bankName.trim(),

      accountHolderName:
        form.accountHolderName.trim(),

      buildingNumber:
        form.buildingNumber.trim(),

      road:
        form.road.trim(),

      landmark:
        form.landmark.trim() ||
        null,

      stateId:
        form.stateId
          ? Number(form.stateId)
          : null,

      cityId:
        form.cityId
          ? Number(form.cityId)
          : null,

      areaId:
        form.areaId
          ? Number(form.areaId)
          : null,

      latitude:
        form.latitude.trim() ||
        null,

      longitude:
        form.longitude.trim() ||
        null,

      // operatingDays,

      operatingDays: [
  ...operatingDays,
  ...customTimings,
],

      updatedBy:
        form.updatedBy,
    };


    console.log(
      "CREATE OUTLET PAYLOAD:",
      payload
    );


    try {

      setSubmitting(true);

      const response =
        await createOutlet(payload);

      console.log(
        "CREATE OUTLET RESPONSE:",
        response
      );


      if (response?.success === false) {

        throw new Error(
          response?.message ||
            "Failed to create outlet."
        );
      }


      showNotification(
        "success",
        response?.message ||
          "Outlet created successfully."
      );


      setTimeout(() => {

        if (setActivePage) {

          setActivePage(
            "allOutletsList"
          );

        }

      }, 1200);

    } catch (error) {

      console.error(
        "Create outlet failed:",
        error
      );


      const backendResponse =
        error?.response?.data;


     console.error(
  "BACKEND ERROR RESPONSE:",
  JSON.stringify(
    backendResponse,
    null,
    2
  )
);
console.error(
  "FULL AXIOS ERROR:",
  error.response
);


      let message =
        "Failed to create outlet.";


      if (
        backendResponse?.message
      ) {

        message =
          backendResponse.message;

      } else if (
        backendResponse?.errors
      ) {

        if (
          typeof backendResponse.errors ===
          "object"
        ) {

          message =
            Object.values(
              backendResponse.errors
            ).join(" ");

        } else {

          message =
            String(
              backendResponse.errors
            );
        }

      } else if (
        error?.message
      ) {

        message =
          error.message;
      }


      showNotification(
        "error",
        message
      );

    } finally {

      setSubmitting(false);

    }
  };


  /* =====================================================
     SELECT OPTIONS
     ===================================================== */

  const stateOptions =
    states.map((state) => ({
      value:
        state.stateId ??
        state.id,
      label:
        state.stateName ??
        state.name,
    }));


  const cityOptions =
    cities.map((city) => ({
      value:
        city.cityId ??
        city.id,
      label:
        city.cityName ??
        city.name,
    }));


  const areaOptions =
    areas.map((area) => ({
      value:
        area.areaId ??
        area.id,
      label:
        area.areaName ??
        area.name,
    }));


  return (

    <div className="jippy-outlet-create-page">

      {/* =================================================
          NOTIFICATION POPUP
          ================================================= */}

      {notification.message && (

        <div
          className={`jippy-outlet-create-notification ${
            notification.type === "success"
              ? "jippy-outlet-create-notification-success"
              : "jippy-outlet-create-notification-error"
          }`}
        >

          <div className="jippy-outlet-create-notification-icon">
            {notification.type === "success"
              ? "✓"
              : "!"}
          </div>


          <div className="jippy-outlet-create-notification-content">

            <strong>
              {notification.type === "success"
                ? "Success"
                : "Validation Error"}
            </strong>

            <span>
              {notification.message}
            </span>

          </div>


          <button
            type="button"
            onClick={() =>
              setNotification({
                type: "",
                message: "",
              })
            }
          >
            ×
          </button>

        </div>

      )}


      {/* =================================================
          HEADER
          ================================================= */}

      <div className="jippy-outlet-create-header">

        <button
          type="button"
          className="jippy-outlet-create-back-btn"
          onClick={() =>
            setActivePage(
              "allOutletsList"
            )
          }
        >
          ← Back
        </button>


        <h1>
          Create Outlet
        </h1>


        <p>
          Add a new restaurant outlet to JippyMart.
        </p>

      </div>


      <form
        className="jippy-outlet-create-form"
        onSubmit={handleSubmit}
        noValidate
      >

        {/* =================================================
            BASIC INFORMATION
            ================================================= */}

        <section className="jippy-outlet-create-section">

          <h2>
            Basic Information
          </h2>


          <div className="jippy-outlet-create-grid">

            {/* OUTLET NAME */}

            <div className="jippy-outlet-create-field">

              <label>
                Outlet Name <span>*</span>
              </label>

              <input
                name="outletName"
                value={form.outletName}
                onChange={handleChange}
                maxLength={100}
                placeholder="Enter outlet name"
              />

              {errors.outletName && (
                <small>
                  {errors.outletName}
                </small>
              )}

            </div>


            {/* MERCHANT */}

            <div className="jippy-outlet-create-field">

              <label>
                Merchant <span>*</span>
              </label>

              <Select
                className="jippy-outlet-create-select"
                classNamePrefix="jippy-outlet-create-select"
                isLoading={loadingMerchants}
                isSearchable
                isClearable
                options={merchantOptions}
                value={
                  merchantOptions.find(
                    (item) => String(item.value) === String(form.merchantId)
                  ) || null
                }
                onChange={handleMerchantChange}
                filterOption={filterMerchantOption}
                placeholder={
                  loadingMerchants
                    ? "Loading merchants..."
                    : "Select or search merchant..."
                }
                noOptionsMessage={() =>
                  loadingMerchants
                    ? "Loading merchants..."
                    : "No merchants found"
                }
              />

              {errors.merchantId && (
                <small>
                  {errors.merchantId}
                </small>
              )}

            </div>


            {/* CUISINE */}

            <div className="jippy-outlet-create-field">

              <label>
                Cuisine Type <span>*</span>
              </label>

              <Select
  className="jippy-outlet-create-select"
  classNamePrefix="jippy-outlet-create-select"
  isMulti
  isSearchable
  isClearable
  options={cuisineOptions}
  value={cuisineOptions.filter(
    (item) =>
      form.cuisineType.includes(item.value)
  )}
  onChange={handleCuisineChange}
  placeholder="Select cuisine types"
/>

              {errors.cuisineType && (
                <small>
                  {errors.cuisineType}
                </small>
              )}

            </div>


            {/* OUTLET PHONE */}

            <div className="jippy-outlet-create-field">

              <label>
                Outlet Phone <span>*</span>
              </label>

              <input
                name="outletPhone"
                value={form.outletPhone}
                onChange={handleChange}
                maxLength={10}
                placeholder="10-digit mobile number"
              />

              {errors.outletPhone && (
                <small>
                  {errors.outletPhone}
                </small>
              )}

            </div>


            {/* ALTERNATE PHONE */}

            <div className="jippy-outlet-create-field">

              <label>
                Alternate Phone
              </label>

              <input
                name="alternateOutletPhone"
                value={
                  form.alternateOutletPhone
                }
                onChange={handleChange}
                maxLength={10}
                placeholder="Optional"
              />

              {errors.alternateOutletPhone && (
                <small>
                  {errors.alternateOutletPhone}
                </small>
              )}

            </div>


            {/* EMAIL */}

            <div className="jippy-outlet-create-field">

              <label>
                Outlet Email <span>*</span>
              </label>

              <input
                name="outletEmail"
                type="email"
                value={form.outletEmail}
                onChange={handleChange}
                placeholder="outlet@gmail.com"
              />

              {errors.outletEmail && (
                <small>
                  {errors.outletEmail}
                </small>
              )}

            </div>


            {/* FSSAI NUMBER */}

            <div className="jippy-outlet-create-field">

              <label>
                FSSAI Number <span className="jippy-outlet-create-optional-tag">(Optional)</span>
              </label>

              <input
                name="fssaiNumber"
                value={form.fssaiNumber}
                onChange={handleChange}
                maxLength={14}
                placeholder="Enter 14-digit FSSAI number"
              />

              {errors.fssaiNumber && (
                <small>
                  {errors.fssaiNumber}
                </small>
              )}

            </div>


            {/* FSSAI DOCUMENT */}

            <div className="jippy-outlet-create-field">

              <label>
                FSSAI Certificate / Document <span className="jippy-outlet-create-optional-tag">(Optional)</span>
              </label>

              <div className="jippy-outlet-file-upload-wrapper">
                <input
                  ref={fssaiFileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleDocumentChange(e, "fssai")}
                  className="jippy-outlet-file-input"
                  id="fssai-document-input"
                />

                {fssaiFile && (
                  <div className="jippy-outlet-file-info">
                    <span className="jippy-outlet-file-name" title={fssaiFile.name}>
                      <FiFileText /> {fssaiFile.name}
                    </span>
                    <span className="jippy-outlet-file-size">
                      {(fssaiFile.size / 1024).toFixed(1)} KB
                    </span>
                    <button
                      type="button"
                      className="jippy-outlet-remove-file-btn"
                      onClick={() => handleRemoveDocument("fssai")}
                      title="Remove file"
                    >
                      <FiX />
                    </button>
                  </div>
                )}
              </div>

            </div>


            {/* GST NUMBER */}

            <div className="jippy-outlet-create-field">

              <label>
                GST Number <span className="jippy-outlet-create-optional-tag">(Optional)</span>
              </label>

              <input
                name="gstNumber"
                value={form.gstNumber}
                onChange={handleChange}
                maxLength={15}
                placeholder="Enter GST number (e.g. 36ABCDE1234F1Z5)"
              />

              {errors.gstNumber && (
                <small>
                  {errors.gstNumber}
                </small>
              )}

            </div>


            {/* GST DOCUMENT */}

            <div className="jippy-outlet-create-field">

              <label>
                GST Certificate / Document <span className="jippy-outlet-create-optional-tag">(Optional)</span>
              </label>

              <div className="jippy-outlet-file-upload-wrapper">
                <input
                  ref={gstFileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleDocumentChange(e, "gst")}
                  className="jippy-outlet-file-input"
                  id="gst-document-input"
                />

                {gstFile && (
                  <div className="jippy-outlet-file-info">
                    <span className="jippy-outlet-file-name" title={gstFile.name}>
                      <FiFileText /> {gstFile.name}
                    </span>
                    <span className="jippy-outlet-file-size">
                      {(gstFile.size / 1024).toFixed(1)} KB
                    </span>
                    <button
                      type="button"
                      className="jippy-outlet-remove-file-btn"
                      onClick={() => handleRemoveDocument("gst")}
                      title="Remove file"
                    >
                      <FiX />
                    </button>
                  </div>
                )}
              </div>

            </div>

          </div>

        </section>


        {/* =================================================
            ACCOUNT INFORMATION
            ================================================= */}

        <section className="jippy-outlet-create-section">

          <h2>
            Account Information
          </h2>


          <div className="jippy-outlet-create-grid">

            <div className="jippy-outlet-create-field">

              <label>
                Username <span>*</span>
              </label>

              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                minLength={4}
                maxLength={50}
                placeholder="Enter username"
              />

              {errors.username && (
                <small>
                  {errors.username}
                </small>
              )}

            </div>


            <div className="jippy-outlet-create-field">

              <label>
                Password <span>*</span>
              </label>

              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                maxLength={20}
                placeholder="Enter password"
              />

              {errors.password && (
                <small>
                  {errors.password}
                </small>
              )}

              <div className="jippy-outlet-create-password-hint">
                Must contain:
                <ul>
                  <li>8–20 characters</li>
                  <li>Uppercase letter</li>
                  <li>Lowercase letter</li>
                  <li>Number</li>
                  <li>Special character</li>
                </ul>
              </div>

            </div>

          </div>

        </section>


        {/* =================================================
            BANK DETAILS
            ================================================= */}

        <section className="jippy-outlet-create-section">

          <h2>
            Bank Account Details
          </h2>


          <div className="jippy-outlet-create-grid">

            <div className="jippy-outlet-create-field">

              <label>
                Account Number <span>*</span>
              </label>

              <input
                name="accountNumber"
                value={form.accountNumber}
                onChange={handleChange}
                maxLength={18}
                placeholder="9–18 digit account number"
              />

              {errors.accountNumber && (
                <small>
                  {errors.accountNumber}
                </small>
              )}

            </div>


            <div className="jippy-outlet-create-field">

              <label>
                IFSC Code <span>*</span>
              </label>

              <input
                name="ifscCode"
                value={form.ifscCode}
                onChange={handleChange}
                maxLength={11}
                placeholder="SBIN0001234"
                style={{
                  textTransform: "uppercase",
                }}
              />

              {errors.ifscCode && (
                <small>
                  {errors.ifscCode}
                </small>
              )}

            </div>


            <div className="jippy-outlet-create-field">

              <label>
                Bank Name <span>*</span>
              </label>

              <input
                name="bankName"
                value={form.bankName}
                onChange={handleChange}
                maxLength={100}
                placeholder="Enter bank name"
              />

              {errors.bankName && (
                <small>
                  {errors.bankName}
                </small>
              )}

            </div>


            <div className="jippy-outlet-create-field">

              <label>
                Account Holder Name <span>*</span>
              </label>

              <input
                name="accountHolderName"
                value={form.accountHolderName}
                onChange={handleChange}
                maxLength={100}
                placeholder="Enter account holder name"
              />

              {errors.accountHolderName && (
                <small>
                  {errors.accountHolderName}
                </small>
              )}

            </div>

          </div>

        </section>


        {/* =================================================
            ADDRESS & LOCATION
            ================================================= */}

        <section className="jippy-outlet-create-section">

          <h2>
            Address & Location
          </h2>


          <div className="jippy-outlet-create-grid">

            <div className="jippy-outlet-create-field">

              <label>
                Building Number <span>*</span>
              </label>

              <input
                name="buildingNumber"
                value={form.buildingNumber}
                onChange={handleChange}
                maxLength={50}
                placeholder="10-1-20"
              />

              {errors.buildingNumber && (
                <small>
                  {errors.buildingNumber}
                </small>
              )}

            </div>


            <div className="jippy-outlet-create-field">

              <label>
                Road <span>*</span>
              </label>

              <input
                name="road"
                value={form.road}
                onChange={handleChange}
                maxLength={100}
                placeholder="Main Road"
              />

              {errors.road && (
                <small>
                  {errors.road}
                </small>
              )}

            </div>


            <div className="jippy-outlet-create-field">

              <label>
                Landmark
              </label>

              <input
                name="landmark"
                value={form.landmark}
                onChange={handleChange}
                maxLength={150}
                placeholder="Near Metro Station"
              />

              {errors.landmark && (
                <small>
                  {errors.landmark}
                </small>
              )}

            </div>


            <div className="jippy-outlet-create-field">

              <label>
                State
              </label>

              <Select
                className="jippy-outlet-create-select"
                classNamePrefix="jippy-outlet-create-select"
                options={stateOptions}
                value={
                  stateOptions.find(
                    (item) =>
                      item.value ===
                      Number(form.stateId)
                  ) || null
                }
                onChange={
                  handleStateChange
                }
                isLoading={
                  loadingStates
                }
                isSearchable
                isClearable
                placeholder="Select State"
              />

              {errors.stateId && (
                <small>
                  {errors.stateId}
                </small>
              )}

            </div>


            <div className="jippy-outlet-create-field">

              <label>
                City
              </label>

              <Select
                className="jippy-outlet-create-select"
                classNamePrefix="jippy-outlet-create-select"
                options={cityOptions}
                value={
                  cityOptions.find(
                    (item) =>
                      item.value ===
                      Number(form.cityId)
                  ) || null
                }
                onChange={
                  handleCityChange
                }
                isLoading={
                  loadingCities
                }
                isDisabled={
                  !form.stateId
                }
                isSearchable
                isClearable
                placeholder="Select City"
              />

              {errors.cityId && (
                <small>
                  {errors.cityId}
                </small>
              )}

            </div>


            <div className="jippy-outlet-create-field">

              <label>
                Area
              </label>

              <Select
                className="jippy-outlet-create-select"
                classNamePrefix="jippy-outlet-create-select"
                options={areaOptions}
                value={
                  areaOptions.find(
                    (item) =>
                      item.value ===
                      Number(form.areaId)
                  ) || null
                }
                onChange={
                  handleAreaChange
                }
                isLoading={
                  loadingAreas
                }
                isDisabled={
                  !form.cityId
                }
                isSearchable
                isClearable
                placeholder="Select Area"
              />

              {errors.areaId && (
                <small>
                  {errors.areaId}
                </small>
              )}

            </div>


            <div className="jippy-outlet-create-field">

              <label>
                Latitude
              </label>

              <input
                name="latitude"
                value={form.latitude}
                onChange={handleChange}
                placeholder="17.4940"
              />

              {errors.latitude && (
                <small>
                  {errors.latitude}
                </small>
              )}

            </div>


            <div className="jippy-outlet-create-field">

              <label>
                Longitude
              </label>

              <input
                name="longitude"
                value={form.longitude}
                onChange={handleChange}
                placeholder="78.3990"
              />

              {errors.longitude && (
                <small>
                  {errors.longitude}
                </small>
              )}

            </div>

          </div>

        </section>


        {/* =================================================
            OPERATING HOURS
            ================================================= */}

        <section className="jippy-outlet-create-section">
<h2>
  Operating Hours
</h2>


          <div className="jippy-outlet-create-days">

            {DAYS.map((day) => {

              const dayData =
                operatingDays.find(
                  (item) =>
                    item.dayOfWeekId ===
                    day.id
                );


              return (

                <div
                  className="jippy-outlet-create-day-row"
                  key={day.id}
                >

                  <div className="jippy-outlet-create-day-name">
                    {day.name}
                  </div>


                  <label className="jippy-outlet-create-toggle">

                    <input
                      type="checkbox"
                      checked={
                        dayData?.isOpen ?? true
                      }
                      onChange={() =>
                        handleDayToggle(
                          day.id
                        )
                      }
                    />

                    <span>
                      {dayData?.isOpen
                        ? "Open"
                        : "Closed"}
                    </span>

                  </label>


                  <div className="jippy-outlet-create-time">

                    <label>
                      Opening
                    </label>

                    <input
                      type="time"
                      value={
                        dayData?.openingTime ||
                        "09:00"
                      }
                      disabled={
                        !dayData?.isOpen
                      }
                      onChange={(event) =>
                        handleDayTimeChange(
                          day.id,
                          "openingTime",
                          event.target.value
                        )
                      }
                    />

                  </div>


                  <div className="jippy-outlet-create-time">

                    <label>
                      Closing
                    </label>

                    <input
                      type="time"
                      value={
                        dayData?.closingTime ||
                        "22:00"
                      }
                      disabled={
                        !dayData?.isOpen
                      }
                      onChange={(event) =>
                        handleDayTimeChange(
                          day.id,
                          "closingTime",
                          event.target.value
                        )
                      }
                    />

                  </div>

                </div>

              );

            })}

          </div>

        </section>

{/* =================================================
    ADDITIONAL TIMINGS
    ================================================= */}

<section className="jippy-outlet-create-section jippy-outlet-create-additional-section">

  <div className="jippy-outlet-create-section-header">

    <div>
      <h2>
        Additional Timings
      </h2>

      <p className="jippy-outlet-create-additional-description">
        Add extra working hours for any day (e.g. different shift).
      </p>
    </div>

    <button
      type="button"
      className="jippy-outlet-create-add-timing-btn"
      onClick={() => setShowTimingModal(true)}
    >
      <span>+</span>
      Add Timing
    </button>

  </div>


  {customTimings.length > 0 && (
    <div className="jippy-outlet-create-custom-timings">

      {customTimings.map((timing, index) => {

        const selectedDay = DAYS.find(
          (day) =>
            day.id === Number(timing.dayOfWeekId)
        );

        return (
          <div
            className="jippy-outlet-create-custom-row"
            key={`custom-${index}`}
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
              className="jippy-outlet-create-custom-day-select"
            >

              {DAYS.map((day) => (
                <option
                  key={day.id}
                  value={day.id}
                >
                  {day.name}
                </option>
              ))}

            </select>


            {/* OPEN / CLOSED */}

            <label className="jippy-outlet-create-toggle">

              <input
                type="checkbox"
                checked={timing.isOpen}
                onChange={(event) => {

                  const updated = [...customTimings];

                  updated[index] = {
                    ...updated[index],
                    isOpen: event.target.checked,
                  };

                  setCustomTimings(updated);
                }}
              />

              <span>
                {timing.isOpen ? "Open" : "Closed"}
              </span>

            </label>


            {/* OPENING */}

            <div className="jippy-outlet-create-time">

              <label>
                Opening
              </label>

              <input
                type="time"
                value={timing.openingTime}
                disabled={!timing.isOpen}
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

            <div className="jippy-outlet-create-time">

              <label>
                Closing
              </label>

              <input
                type="time"
                value={timing.closingTime}
                disabled={!timing.isOpen}
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
              className="jippy-outlet-create-delete-timing-btn"
              onClick={() =>
                handleDeleteCustomTiming(index)
              }
              title="Delete timing"
            >
              🗑
            </button>

          </div>
        );
      })}

    </div>
  )}

</section>


{showTimingModal && (
  <div
    className="jippy-outlet-create-timing-overlay"
    onClick={() => setShowTimingModal(false)}
  >

    <div
      className="jippy-outlet-create-timing-modal"
      onClick={(event) => event.stopPropagation()}
    >

      <div className="jippy-outlet-create-timing-modal-header">

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
          className="jippy-outlet-create-timing-close"
          onClick={() => setShowTimingModal(false)}
        >
          ×
        </button>

      </div>


      <div className="jippy-outlet-create-timing-form">

        {/* DAY */}

        <div className="jippy-outlet-create-timing-field">

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

            {DAYS.map((day) => (
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

        <div className="jippy-outlet-create-timing-field">

          <label>
            Status
          </label>

          <label className="jippy-outlet-create-modal-toggle">

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

            <span className="jippy-outlet-create-toggle-slider"></span>

            <span className="jippy-outlet-create-toggle-text">
              {newTiming.isOpen
                ? "Open"
                : "Closed"}
            </span>

          </label>

        </div>


        {/* OPENING TIME */}

        <div className="jippy-outlet-create-timing-field">

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


        {/* CLOSING TIME */}

        <div className="jippy-outlet-create-timing-field">

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


      <div className="jippy-outlet-create-timing-actions">

        <button
          type="button"
          className="jippy-outlet-create-timing-cancel-btn"
          onClick={() => setShowTimingModal(false)}
        >
          Cancel
        </button>

        <button
          type="button"
          className="jippy-outlet-create-timing-submit-btn"
          onClick={handleAddTiming}
        >
          Add Timing
        </button>

      </div>

    </div>

  </div>
)}

        {/* =================================================
            ACTIONS
            ================================================= */}

        <div className="jippy-outlet-create-actions">

          <button
            type="button"
            className="jippy-outlet-create-cancel-btn"
            disabled={submitting}
            onClick={() =>
              setActivePage(
                "allOutletsList"
              )
            }
          >
            Cancel
          </button>


          <button
            type="submit"
            className="jippy-outlet-create-submit-btn"
            disabled={submitting}
          >
            {submitting
              ? "Creating..."
              : "Create Outlet"}
          </button>

        </div>

      </form>

    </div>
  );
}

export default OutletCreate;