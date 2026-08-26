import { useEffect, useState } from "react";
import Select from "react-select";
import "../styles/OutletCreate.css";

import {
  createOutlet,
  getStates,
  getCitiesByState,
  getAreasByCity,
} from "../services/outletService";

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
const cuisineOptions = [
  { value: 1, label: "Indian" },
  { value: 2, label: "Chinese" },
  { value: 3, label: "Arabian" },
  { value: 4, label: "Italian" },
  { value: 5, label: "South Indian" },
  { value: 6, label: "North Indian" },
];

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
     LOCATION
     ===================================================== */

  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);

  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingAreas, setLoadingAreas] = useState(false);


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

    const cuisineType = selected
      ? selected.map((item) => item.value)
      : [];

    setForm((current) => ({
      ...current,
      cuisineType,
    }));

    setErrors((current) => ({
      ...current,
      cuisineType: "",
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
        "Merchant ID is required.";
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
       FSSAI
       @NotBlank
       exactly 14 digits
       ----------------------------------------------------- */

    if (!form.fssaiNumber.trim()) {

      newErrors.fssaiNumber =
        "FSSAI Number is required.";

    } else if (
      !/^\d{14}$/.test(
        form.fssaiNumber.trim()
      )
    ) {

      newErrors.fssaiNumber =
        "FSSAI Number must contain exactly 14 digits.";
    }


    /* -----------------------------------------------------
       GST
       @NotBlank
       exact backend pattern
       ----------------------------------------------------- */

    const gstNumber =
      form.gstNumber
        .trim()
        .toUpperCase();

    const gstRegex =
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

    if (!gstNumber) {

      newErrors.gstNumber =
        "GST Number is required.";

    } else if (!gstRegex.test(gstNumber)) {

      newErrors.gstNumber =
        "Invalid GST Number.";
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
        form.fssaiNumber.trim(),

      gstNumber:
        form.gstNumber
          .trim()
          .toUpperCase(),

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

      operatingDays,

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


            {/* MERCHANT ID */}

            <div className="jippy-outlet-create-field">

              <label>
                Merchant ID <span>*</span>
              </label>

              <input
                name="merchantId"
                type="number"
                value={form.merchantId}
                onChange={handleChange}
                placeholder="Enter merchant ID"
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
                    form.cuisineType.includes(
                      item.value
                    )
                )}
                onChange={
                  handleCuisineChange
                }
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


            {/* FSSAI */}

            <div className="jippy-outlet-create-field">

              <label>
                FSSAI Number <span>*</span>
              </label>

              <input
                name="fssaiNumber"
                value={form.fssaiNumber}
                onChange={handleChange}
                maxLength={14}
                placeholder="14-digit FSSAI number"
              />

              {errors.fssaiNumber && (
                <small>
                  {errors.fssaiNumber}
                </small>
              )}

            </div>


            {/* GST */}

            <div className="jippy-outlet-create-field">

              <label>
                GST Number <span>*</span>
              </label>

              <input
                name="gstNumber"
                value={form.gstNumber}
                onChange={handleChange}
                maxLength={15}
                placeholder="36ABCDE1234F1Z5"
              />

              {errors.gstNumber && (
                <small>
                  {errors.gstNumber}
                </small>
              )}

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