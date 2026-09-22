import React, { useState, useEffect, useRef } from "react";
import "../../styles/Merchants/CreateMerchant.css";
import { FiArrowLeft, FiEye, FiEyeOff, FiX } from "react-icons/fi";
import {
  getStates,
  getCitiesByState,
  getAreasByCity,
} from "../../services/managerAreaService";
import { FM_API } from "../../services/api";

function CreateMerchant({ setActivePage }) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // State for dropdown options
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loadingAddress, setLoadingAddress] = useState(false);

  // State for password visibility
  const [showPassword, setShowPassword] = useState(false);

  // State for Document Files & Data URLs
  const [aadharFile, setAadharFile] = useState(null);
  const [panFile, setPanFile] = useState(null);
  const [fssaiFile, setFssaiFile] = useState(null);
  const [gstFile, setGstFile] = useState(null);

  const [aadhaarNumberUrl, setAadhaarNumberUrl] = useState("");
  const [panNumberUrl, setPanNumberUrl] = useState("");
  const [fssaiDocumentUrl, setFssaiDocumentUrl] = useState("");
  const [gstDocumentUrl, setGstDocumentUrl] = useState("");

  const aadharFileInputRef = useRef(null);
  const panFileInputRef = useRef(null);
  const fssaiFileInputRef = useRef(null);
  const gstFileInputRef = useRef(null);

  const [merchant, setMerchant] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    username: "",
    password: "",
    outletType: "",
    uploadedBy:
      localStorage.getItem("loggedInUser") ||
      localStorage.getItem("username") ||
      "Admin",
    pan: "",
    adhar: "",
    accountNumber: "",
    ifscCode: "",
    bankLocation: "",
    nameInBankAccount: "",
    dob: "",
    fssai: "",
    gstNumber: "",
    // Address fields
    buildingNumber: "",
    road: "",
    landmark: "",
    stateId: "",
    cityId: "",
    areaId: "",
    latitude: "",
    longitude: "",
  });

  // Fetch states on component mount
  useEffect(() => {
    fetchStates();
  }, []);

  const fetchStates = async () => {
    try {
      setLoadingAddress(true);
      const response = await getStates();
      const statesData = response?.data || response || [];
      setStates(statesData);
    } catch (error) {
      console.error("Error fetching states:", error);
      setStates([]);
    } finally {
      setLoadingAddress(false);
    }
  };

  const fetchCities = async (stateId) => {
    if (!stateId) {
      setCities([]);
      setAreas([]);
      return;
    }
    try {
      setLoadingAddress(true);
      const response = await getCitiesByState(stateId);
      const citiesData = response?.data || response || [];
      setCities(citiesData);
      setAreas([]);
      setMerchant((prev) => ({ ...prev, cityId: "", areaId: "" }));
    } catch (error) {
      console.error("Error fetching cities:", error);
      setCities([]);
    } finally {
      setLoadingAddress(false);
    }
  };

  const fetchAreas = async (cityId) => {
    if (!cityId) {
      setAreas([]);
      return;
    }
    try {
      setLoadingAddress(true);
      const response = await getAreasByCity(cityId);
      const areasData = response?.data || response || [];
      setAreas(areasData);
      setMerchant((prev) => ({ ...prev, areaId: "" }));
    } catch (error) {
      console.error("Error fetching areas:", error);
      setAreas([]);
    } finally {
      setLoadingAddress(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let val = value;

    // Automatically sanitize and normalize inputs
    if (name === "pan") {
      val = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);
    } else if (name === "ifscCode") {
      val = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 11);
    } else if (name === "gstNumber") {
      val = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 15);
    } else if (name === "fssai") {
      val = value.replace(/\D/g, "").slice(0, 14);
    } else if (name === "phone") {
      val = value.replace(/\D/g, "").slice(0, 10);
    } else if (name === "adhar") {
      val = value.replace(/\D/g, "").slice(0, 12);
    } else if (name === "accountNumber") {
      val = value.replace(/\D/g, "").slice(0, 18);
    }

    setMerchant((prev) => ({
      ...prev,
      [name]: val,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    if (name === "stateId") fetchCities(val);
    if (name === "cityId") fetchAreas(val);
  };

  const handleFileChange = (e, docType) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File size should be less than 5MB");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === "string" ? reader.result : "";
      if (docType === "aadhar") {
        setAadharFile(file);
        setAadhaarNumberUrl(dataUrl);
      } else if (docType === "pan") {
        setPanFile(file);
        setPanNumberUrl(dataUrl);
      } else if (docType === "fssai") {
        setFssaiFile(file);
        setFssaiDocumentUrl(dataUrl);
      } else if (docType === "gst") {
        setGstFile(file);
        setGstDocumentUrl(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = (docType) => {
    if (docType === "aadhar") {
      setAadharFile(null);
      setAadhaarNumberUrl("");
      if (aadharFileInputRef.current) aadharFileInputRef.current.value = "";
    } else if (docType === "pan") {
      setPanFile(null);
      setPanNumberUrl("");
      if (panFileInputRef.current) panFileInputRef.current.value = "";
    } else if (docType === "fssai") {
      setFssaiFile(null);
      setFssaiDocumentUrl("");
      if (fssaiFileInputRef.current) fssaiFileInputRef.current.value = "";
    } else if (docType === "gst") {
      setGstFile(null);
      setGstDocumentUrl("");
      if (gstFileInputRef.current) gstFileInputRef.current.value = "";
    }
  };

  const validateForm = () => {
    const newErrors = {};

    /* FIRST NAME */
    if (!merchant.firstName.trim()) {
      newErrors.firstName = "First Name is required";
    } else if (
      merchant.firstName.length < 2 ||
      merchant.firstName.length > 75
    ) {
      newErrors.firstName = "First Name must be between 2 and 75 characters";
    } else if (!/^[A-Za-z ]+$/.test(merchant.firstName)) {
      newErrors.firstName = "First Name must contain only letters";
    }

    /* LAST NAME */
    if (!merchant.lastName.trim()) {
      newErrors.lastName = "Last Name is required";
    } else if (merchant.lastName.length < 2 || merchant.lastName.length > 75) {
      newErrors.lastName = "Last Name must be between 2 and 75 characters";
    } else if (!/^[A-Za-z ]+$/.test(merchant.lastName)) {
      newErrors.lastName = "Last Name must contain only letters";
    }

    /* EMAIL */
    if (!merchant.email.trim()) {
      newErrors.email = "Email is required";
    } else if (merchant.email.length > 150) {
      newErrors.email = "Email cannot exceed 150 characters";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(merchant.email)) {
      newErrors.email = "Invalid Email format";
    }

    /* PHONE */
    const phoneVal = (merchant.phone || "").trim().replace(/[\s-]/g, "");
    if (!phoneVal) {
      newErrors.phone = "Phone Number is required";
    } else if (!/^[6-9]\d{9}$/.test(phoneVal)) {
      newErrors.phone = "Enter valid 10 digit Indian mobile number";
    }

    /* USERNAME */
    if (!merchant.username.trim()) {
      newErrors.username = "Username is required";
    } else if (merchant.username.length < 4 || merchant.username.length > 50) {
      newErrors.username = "Username must be between 4 and 50 characters";
    }

    /* PASSWORD */
    if (!merchant.password) {
      newErrors.password = "Password is required";
    } else if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=!]).{8,20}$/.test(
        merchant.password
      )
    ) {
      newErrors.password =
        "Password must contain uppercase, lowercase, number and special character";
    }

    /* OUTLET TYPE */
    if (!merchant.outletType) {
      newErrors.outletType = "Outlet Type is required";
    } else if (merchant.outletType.length > 50) {
      newErrors.outletType = "Outlet Type cannot exceed 50 characters";
    }

    /* PAN (optional, validate format only if provided) */
    const panVal = (merchant.pan || "").trim().toUpperCase().replace(/\s/g, "");
    if (panVal && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(panVal)) {
      newErrors.pan = "PAN format should be AAAAA9999A";
    }

    /* AADHAAR (optional, validate format only if provided) */
    const adharVal = (merchant.adhar || "").trim().replace(/[\s-]/g, "");
    if (adharVal && !/^[2-9]{1}[0-9]{11}$/.test(adharVal)) {
      newErrors.adhar = "Aadhaar must be a valid 12 digit number";
    }

    /* FSSAI (optional, validate only if provided) */
    const fssaiVal = (merchant.fssai || "").trim();
    if (fssaiVal && !/^[0-9]{14}$/.test(fssaiVal)) {
      newErrors.fssai = "FSSAI must be a 14 digit number";
    }

    /* GST (optional, validate only if provided) */
    const gstVal = (merchant.gstNumber || "").trim().toUpperCase().replace(/\s/g, "");
    if (
      gstVal &&
      !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i.test(gstVal)
    ) {
      newErrors.gstNumber = "Enter a valid GST number (e.g. 36ABCDE1234F1Z5)";
    }

    /* ADDRESS FIELDS */
    if (!merchant.buildingNumber.trim()) {
      newErrors.buildingNumber = "Building No is required";
    } else if (merchant.buildingNumber.length > 500) {
      newErrors.buildingNumber = "Building Number cannot exceed 500 characters";
    }

    if (merchant.road && merchant.road.length > 100) {
      newErrors.road = "Road cannot exceed 100 characters";
    }

    if (merchant.landmark && merchant.landmark.length > 150) {
      newErrors.landmark = "Landmark cannot exceed 150 characters";
    }

    if (!merchant.stateId) newErrors.stateId = "State is required";
    if (!merchant.cityId) newErrors.cityId = "City is required";
    if (!merchant.areaId) newErrors.areaId = "Area is required";

    if (
      merchant.latitude &&
      !/^-?\d+(\.\d+)?$/.test(merchant.latitude.trim())
    ) {
      newErrors.latitude = "Enter a valid latitude (e.g. 17.4455)";
    }
    if (
      merchant.longitude &&
      !/^-?\d+(\.\d+)?$/.test(merchant.longitude.trim())
    ) {
      newErrors.longitude = "Enter a valid longitude (e.g. 78.3788)";
    }

    /* ACCOUNT NUMBER */
    const accVal = (merchant.accountNumber || "").trim().replace(/[\s-]/g, "");
    if (accVal && !/^[0-9]{9,18}$/.test(accVal)) {
      newErrors.accountNumber = "Account Number must be between 9 and 18 digits";
    }

    /* IFSC */
    const ifscVal = (merchant.ifscCode || "").trim().toUpperCase().replace(/\s/g, "");
    if (ifscVal && !/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(ifscVal)) {
      newErrors.ifscCode = "IFSC format should be ABCD0123456";
    }

    /* BANK LOCATION */
    if (merchant.bankLocation && merchant.bankLocation.length > 100) {
      newErrors.bankLocation = "Bank Location cannot exceed 100 characters";
    }

    /* NAME IN BANK */
    if (
      merchant.nameInBankAccount &&
      merchant.nameInBankAccount.length > 150
    ) {
      newErrors.nameInBankAccount =
        "Name In Bank Account cannot exceed 150 characters";
    }

    /* DOB (optional, validate format only if provided) */
    if (merchant.dob && !/^(\d{4}-\d{2}-\d{2})/.test(merchant.dob)) {
      newErrors.dob = "DOB must be YYYY-MM-DD";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      // Prepare JSON payload — sanitize strings and convert IDs to integers
      const payload = {
        ...merchant,
        firstName: (merchant.firstName || "").trim(),
        lastName: (merchant.lastName || "").trim(),
        email: (merchant.email || "").trim(),
        username: (merchant.username || "").trim(),
        buildingNumber: (merchant.buildingNumber || "").trim(),
        road: (merchant.road || "").trim(),
        landmark: (merchant.landmark || "").trim(),
        bankLocation: (merchant.bankLocation || "").trim(),
        nameInBankAccount: (merchant.nameInBankAccount || "").trim(),
        pan: (merchant.pan || "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10),
        ifscCode: (merchant.ifscCode || "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 11),
        gstNumber: (merchant.gstNumber || "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 15),
        fssai: (merchant.fssai || "").trim().replace(/\D/g, "").slice(0, 14),
        adhar: (merchant.adhar || "").trim().replace(/\D/g, "").slice(0, 12),
        phone: (merchant.phone || "").trim().replace(/\D/g, "").slice(0, 10),
        accountNumber: (merchant.accountNumber || "").trim().replace(/\D/g, "").slice(0, 18),
        stateId: merchant.stateId ? parseInt(merchant.stateId) : null,
        cityId: merchant.cityId ? parseInt(merchant.cityId) : null,
        areaId: merchant.areaId ? parseInt(merchant.areaId) : null,
      };

      // Strip empty optional fields so backend only receives them if provided
      if (!payload.pan) delete payload.pan;
      if (!payload.adhar) delete payload.adhar;
      if (!payload.dob) delete payload.dob;
      if (!payload.fssai) delete payload.fssai;
      if (!payload.gstNumber) delete payload.gstNumber;
      if (!payload.accountNumber) delete payload.accountNumber;
      if (!payload.ifscCode) delete payload.ifscCode;
      if (!payload.bankLocation) delete payload.bankLocation;
      if (!payload.nameInBankAccount) delete payload.nameInBankAccount;
      if (!payload.road) delete payload.road;
      if (!payload.landmark) delete payload.landmark;
      if (!payload.latitude) delete payload.latitude;
      if (!payload.longitude) delete payload.longitude;

      // Attach documents if provided
      if (aadhaarNumberUrl) {
        payload.aadhaarNumberUrl = aadhaarNumberUrl;
        payload.aadharDocumentUrl = aadhaarNumberUrl;
        payload.aadharDocument = aadhaarNumberUrl;
      }
      if (panNumberUrl) {
        payload.panNumberUrl = panNumberUrl;
        payload.panDocumentUrl = panNumberUrl;
        payload.panDocument = panNumberUrl;
      }
      if (fssaiDocumentUrl) {
        payload.fssaiDocumentUrl = fssaiDocumentUrl;
      }
      if (gstDocumentUrl) {
        payload.gstDocumentUrl = gstDocumentUrl;
      }

      if (merchant.pan) {
        payload.panNumber = payload.pan;
      }
      if (merchant.adhar) {
        payload.aadharNumber = payload.adhar;
      }

      const response = await FM_API.post(
        "/api/fm/merchants/createMerchant",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      alert(response.data?.message || "Merchant created successfully!");
      setActivePage("merchants");
    } catch (error) {
      console.error("Error creating merchant:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.defaultMessage ||
        "Unable to create merchant. Please check all fields.";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-merchant-page">
      <div className="create-merchant-container">
        <div className="create-merchant-header">
          <button
            className="create-merchant-back-btn"
            onClick={() => setActivePage("merchants")}
          >
            <FiArrowLeft />
            <span>Back</span>
          </button>
          <h2>Create Merchant</h2>
          <p>Register a new merchant into the Food & Mart system.</p>
        </div>

        <form className="create-merchant-form" noValidate>
          {/* PERSONAL DETAILS */}
          <div className="create-merchant-section">
            <h3 className="create-merchant-section-header">Personal Details</h3>
            <div className="create-merchant-grid">
              <div className="create-merchant-field">
                <label>
                  First Name<span className="required-star">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={merchant.firstName}
                  onChange={handleChange}
                  className={errors.firstName ? "create-merchant-input-error" : ""}
                  placeholder="Enter first name"
                />
                {errors.firstName && (
                  <p className="create-merchant-error">{errors.firstName}</p>
                )}
              </div>

              <div className="create-merchant-field">
                <label>
                  Last Name<span className="required-star">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={merchant.lastName}
                  onChange={handleChange}
                  className={errors.lastName ? "create-merchant-input-error" : ""}
                  placeholder="Enter last name"
                />
                {errors.lastName && (
                  <p className="create-merchant-error">{errors.lastName}</p>
                )}
              </div>

              <div className="create-merchant-field">
                <label>
                  Email<span className="required-star">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={merchant.email}
                  onChange={handleChange}
                  className={errors.email ? "create-merchant-input-error" : ""}
                  placeholder="Enter email address"
                />
                {errors.email && (
                  <p className="create-merchant-error">{errors.email}</p>
                )}
              </div>

              <div className="create-merchant-field">
                <label>
                  Phone Number<span className="required-star">*</span>
                </label>
                <input
                  type="text"
                  name="phone"
                  maxLength="10"
                  value={merchant.phone}
                  onChange={handleChange}
                  className={errors.phone ? "create-merchant-input-error" : ""}
                  placeholder="Enter 10 digit mobile number"
                />
                {errors.phone && (
                  <p className="create-merchant-error">{errors.phone}</p>
                )}
              </div>
            </div>
          </div>

          {/* LOGIN DETAILS */}
          <div className="create-merchant-section">
            <h3 className="create-merchant-section-header">Login Details</h3>
            <div className="create-merchant-grid">
              <div className="create-merchant-field">
                <label>
                  Username<span className="required-star">*</span>
                </label>
                <input
                  type="text"
                  name="username"
                  value={merchant.username}
                  onChange={handleChange}
                  className={errors.username ? "create-merchant-input-error" : ""}
                  placeholder="Choose a username"
                />
                {errors.username && (
                  <p className="create-merchant-error">{errors.username}</p>
                )}
              </div>

              <div className="create-merchant-field">
                <label>
                  Password<span className="required-star">*</span>
                </label>
                <div className="create-merchant-password-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={merchant.password}
                    onChange={handleChange}
                    className={errors.password ? "create-merchant-input-error" : ""}
                    placeholder="Create a strong password"
                  />
                  <button
                    type="button"
                    className="create-merchant-password-toggle"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {errors.password && (
                  <p className="create-merchant-error">{errors.password}</p>
                )}
              </div>
            </div>
          </div>

          {/* ADDRESS DETAILS */}
          <div className="create-merchant-section">
            <h3 className="create-merchant-section-header">Address Details</h3>
            <div className="create-merchant-grid">
              <div className="create-merchant-field">
                <label>
                  Building No.<span className="required-star">*</span>
                </label>
                <input
                  type="text"
                  name="buildingNumber"
                  value={merchant.buildingNumber}
                  onChange={handleChange}
                  className={
                    errors.buildingNumber ? "create-merchant-input-error" : ""
                  }
                  placeholder="e.g., 12-34, House No. 56"
                />
                {errors.buildingNumber && (
                  <p className="create-merchant-error">{errors.buildingNumber}</p>
                )}
              </div>

              <div className="create-merchant-field">
                <label>Road/Street</label>
                <input
                  type="text"
                  name="road"
                  value={merchant.road}
                  onChange={handleChange}
                  className={errors.road ? "create-merchant-input-error" : ""}
                  placeholder="Enter road or street name"
                />
                {errors.road && (
                  <p className="create-merchant-error">{errors.road}</p>
                )}
              </div>

              <div className="create-merchant-field">
                <label>Landmark</label>
                <input
                  type="text"
                  name="landmark"
                  value={merchant.landmark}
                  onChange={handleChange}
                  className={errors.landmark ? "create-merchant-input-error" : ""}
                  placeholder="Nearby landmark"
                />
                {errors.landmark && (
                  <p className="create-merchant-error">{errors.landmark}</p>
                )}
              </div>

              <div className="create-merchant-field">
                <label>
                  State<span className="required-star">*</span>
                </label>
                <select
                  name="stateId"
                  value={merchant.stateId}
                  onChange={handleChange}
                  className={errors.stateId ? "create-merchant-input-error" : ""}
                  disabled={loadingAddress}
                >
                  <option value="">Select State</option>
                  {states && states.length > 0 ? (
                    states.map((state) => (
                      <option key={state.stateId} value={state.stateId}>
                        {state.stateName}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      No states available
                    </option>
                  )}
                </select>
                {errors.stateId && (
                  <p className="create-merchant-error">{errors.stateId}</p>
                )}
              </div>

              <div className="create-merchant-field">
                <label>
                  City<span className="required-star">*</span>
                </label>
                <select
                  name="cityId"
                  value={merchant.cityId}
                  onChange={handleChange}
                  className={errors.cityId ? "create-merchant-input-error" : ""}
                  disabled={loadingAddress || !merchant.stateId}
                >
                  <option value="">Select City</option>
                  {cities && cities.length > 0 ? (
                    cities.map((city) => (
                      <option key={city.cityId} value={city.cityId}>
                        {city.cityName}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      Please select a state first
                    </option>
                  )}
                </select>
                {errors.cityId && (
                  <p className="create-merchant-error">{errors.cityId}</p>
                )}
              </div>

              <div className="create-merchant-field">
                <label>
                  Area<span className="required-star">*</span>
                </label>
                <select
                  name="areaId"
                  value={merchant.areaId}
                  onChange={handleChange}
                  className={errors.areaId ? "create-merchant-input-error" : ""}
                  disabled={loadingAddress || !merchant.cityId}
                >
                  <option value="">Select Area</option>
                  {areas && areas.length > 0 ? (
                    areas.map((area) => (
                      <option key={area.areaId} value={area.areaId}>
                        {area.areaName}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      Please select a city first
                    </option>
                  )}
                </select>
                {errors.areaId && (
                  <p className="create-merchant-error">{errors.areaId}</p>
                )}
              </div>

              <div className="create-merchant-field">
                <label>Latitude</label>
                <input
                  type="text"
                  name="latitude"
                  value={merchant.latitude}
                  onChange={handleChange}
                  className={errors.latitude ? "create-merchant-input-error" : ""}
                  placeholder="e.g. 17.4455"
                />
                {errors.latitude && (
                  <p className="create-merchant-error">{errors.latitude}</p>
                )}
              </div>

              <div className="create-merchant-field">
                <label>Longitude</label>
                <input
                  type="text"
                  name="longitude"
                  value={merchant.longitude}
                  onChange={handleChange}
                  className={errors.longitude ? "create-merchant-input-error" : ""}
                  placeholder="e.g. 78.3788"
                />
                {errors.longitude && (
                  <p className="create-merchant-error">{errors.longitude}</p>
                )}
              </div>
            </div>
          </div>

          {/* BUSINESS DETAILS */}
          <div className="create-merchant-section">
            <h3 className="create-merchant-section-header">Business Details</h3>
            <div className="create-merchant-grid">
              <div className="create-merchant-field">
                <label>
                  Merchant Type<span className="required-star">*</span>
                </label>
                <select
                  name="outletType"
                  value={merchant.outletType}
                  onChange={handleChange}
                  className={errors.outletType ? "create-merchant-input-error" : ""}
                >
                  <option value="">Select Outlet Type</option>
                  <option value="Outlet">Outlet</option>
                  <option value="Mart">Mart</option>
                </select>
                {errors.outletType && (
                  <p className="create-merchant-error">{errors.outletType}</p>
                )}
              </div>
              <input type="hidden" name="uploadedBy" value={merchant.uploadedBy} />
            </div>
          </div>

          {/* GOVERNMENT DETAILS */}
          <div className="create-merchant-section">
            <h3 className="create-merchant-section-header">Government Details</h3>
            <div className="create-merchant-grid">
              <div className="create-merchant-field">
                <label>PAN Number</label>
                <input
                  type="text"
                  name="pan"
                  style={{ textTransform: "uppercase" }}
                  value={merchant.pan}
                  onChange={handleChange}
                  className={errors.pan ? "create-merchant-input-error" : ""}
                  placeholder="e.g., ABCDE1234F (optional)"
                />
                {errors.pan && (
                  <p className="create-merchant-error">{errors.pan}</p>
                )}
              </div>

              <div className="create-merchant-field">
                <label>Aadhaar Number</label>
                <input
                  type="text"
                  name="adhar"
                  maxLength="12"
                  value={merchant.adhar}
                  onChange={handleChange}
                  className={errors.adhar ? "create-merchant-input-error" : ""}
                  placeholder="Enter 12 digit Aadhaar number (optional)"
                />
                {errors.adhar && (
                  <p className="create-merchant-error">{errors.adhar}</p>
                )}
              </div>

              <div className="create-merchant-field">
                <label>Date of Birth</label>
                <input
                  type="date"
                  name="dob"
                  value={merchant.dob}
                  onChange={handleChange}
                  className={errors.dob ? "create-merchant-input-error" : ""}
                />
                {errors.dob && (
                  <p className="create-merchant-error">{errors.dob}</p>
                )}
              </div>

              <div className="create-merchant-field">
                <label>FSSAI Number</label>
                <input
                  type="text"
                  name="fssai"
                  maxLength="14"
                  value={merchant.fssai}
                  onChange={handleChange}
                  className={errors.fssai ? "create-merchant-input-error" : ""}
                  placeholder="Enter 14 digit FSSAI number (optional)"
                />
                {errors.fssai && (
                  <p className="create-merchant-error">{errors.fssai}</p>
                )}
              </div>

              <div className="create-merchant-field">
                <label>GST Number</label>
                <input
                  type="text"
                  name="gstNumber"
                  style={{ textTransform: "uppercase" }}
                  value={merchant.gstNumber}
                  onChange={handleChange}
                  className={errors.gstNumber ? "create-merchant-input-error" : ""}
                  placeholder="e.g., 36ABCDE1234F1Z5 (optional)"
                />
                {errors.gstNumber && (
                  <p className="create-merchant-error">{errors.gstNumber}</p>
                )}
              </div>
            </div>
          </div>

          {/* KYC DOCUMENTS */}
          <div className="create-merchant-section">
            <h3 className="create-merchant-section-header">KYC Documents (Optional)</h3>
            <div className="create-merchant-grid">
              <div className="create-merchant-field">
                <label>Aadhaar Card Document</label>
                <div className="create-merchant-file-upload-wrapper">
                  <input
                    ref={aadharFileInputRef}
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileChange(e, "aadhar")}
                    className="create-merchant-file-input"
                  />
                  {aadharFile && (
                    <div className="create-merchant-file-info">
                      <span className="create-merchant-file-name" title={aadharFile.name}>
                        📄 {aadharFile.name}
                      </span>
                      <span className="create-merchant-file-size">
                        {(aadharFile.size / 1024).toFixed(1)} KB
                      </span>
                      <button
                        type="button"
                        className="create-merchant-remove-file-btn"
                        onClick={() => handleRemoveFile("aadhar")}
                        title="Remove file"
                      >
                        <FiX />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="create-merchant-field">
                <label>PAN Card Document</label>
                <div className="create-merchant-file-upload-wrapper">
                  <input
                    ref={panFileInputRef}
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileChange(e, "pan")}
                    className="create-merchant-file-input"
                  />
                  {panFile && (
                    <div className="create-merchant-file-info">
                      <span className="create-merchant-file-name" title={panFile.name}>
                        📄 {panFile.name}
                      </span>
                      <span className="create-merchant-file-size">
                        {(panFile.size / 1024).toFixed(1)} KB
                      </span>
                      <button
                        type="button"
                        className="create-merchant-remove-file-btn"
                        onClick={() => handleRemoveFile("pan")}
                        title="Remove file"
                      >
                        <FiX />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="create-merchant-field">
                <label>FSSAI Certificate</label>
                <div className="create-merchant-file-upload-wrapper">
                  <input
                    ref={fssaiFileInputRef}
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileChange(e, "fssai")}
                    className="create-merchant-file-input"
                  />
                  {fssaiFile && (
                    <div className="create-merchant-file-info">
                      <span className="create-merchant-file-name" title={fssaiFile.name}>
                        📄 {fssaiFile.name}
                      </span>
                      <span className="create-merchant-file-size">
                        {(fssaiFile.size / 1024).toFixed(1)} KB
                      </span>
                      <button
                        type="button"
                        className="create-merchant-remove-file-btn"
                        onClick={() => handleRemoveFile("fssai")}
                        title="Remove file"
                      >
                        <FiX />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="create-merchant-field">
                <label>GST Certificate</label>
                <div className="create-merchant-file-upload-wrapper">
                  <input
                    ref={gstFileInputRef}
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileChange(e, "gst")}
                    className="create-merchant-file-input"
                  />
                  {gstFile && (
                    <div className="create-merchant-file-info">
                      <span className="create-merchant-file-name" title={gstFile.name}>
                        📄 {gstFile.name}
                      </span>
                      <span className="create-merchant-file-size">
                        {(gstFile.size / 1024).toFixed(1)} KB
                      </span>
                      <button
                        type="button"
                        className="create-merchant-remove-file-btn"
                        onClick={() => handleRemoveFile("gst")}
                        title="Remove file"
                      >
                        <FiX />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* BANK DETAILS */}
          <div className="create-merchant-section">
            <h3 className="create-merchant-section-header">Bank Details</h3>
            <div className="create-merchant-grid">
              <div className="create-merchant-field">
                <label>Account Number</label>
                <input
                  type="text"
                  name="accountNumber"
                  value={merchant.accountNumber}
                  onChange={handleChange}
                  className={
                    errors.accountNumber ? "create-merchant-input-error" : ""
                  }
                  placeholder="Enter bank account number"
                />
                {errors.accountNumber && (
                  <p className="create-merchant-error">{errors.accountNumber}</p>
                )}
              </div>

              <div className="create-merchant-field">
                <label>IFSC Code</label>
                <input
                  type="text"
                  name="ifscCode"
                  style={{ textTransform: "uppercase" }}
                  value={merchant.ifscCode}
                  onChange={handleChange}
                  className={errors.ifscCode ? "create-merchant-input-error" : ""}
                  placeholder="e.g., SBIN0001234"
                />
                {errors.ifscCode && (
                  <p className="create-merchant-error">{errors.ifscCode}</p>
                )}
              </div>

              <div className="create-merchant-field">
                <label>Bank Location</label>
                <input
                  type="text"
                  name="bankLocation"
                  value={merchant.bankLocation}
                  onChange={handleChange}
                  className={errors.bankLocation ? "create-merchant-input-error" : ""}
                  placeholder="Branch location"
                />
                {errors.bankLocation && (
                  <p className="create-merchant-error">{errors.bankLocation}</p>
                )}
              </div>

              <div className="create-merchant-field">
                <label>Name In Bank Account</label>
                <input
                  type="text"
                  name="nameInBankAccount"
                  value={merchant.nameInBankAccount}
                  onChange={handleChange}
                  className={
                    errors.nameInBankAccount ? "create-merchant-input-error" : ""
                  }
                  placeholder="Account holder name"
                />
                {errors.nameInBankAccount && (
                  <p className="create-merchant-error">
                    {errors.nameInBankAccount}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="create-merchant-button-row">
            <button
              type="button"
              className="create-merchant-cancel-btn"
              onClick={() => setActivePage("merchants")}
            >
              Cancel
            </button>
            <button
              type="button"
              className="create-merchant-save-btn"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Merchant"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateMerchant;