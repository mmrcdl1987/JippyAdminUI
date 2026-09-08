import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Merchants/EditMerchant.css";
import { FiArrowLeft, FiX } from "react-icons/fi";
import { 
  getStates, 
  getCitiesByState, 
  getAreasByCity 
} from "../../services/managerAreaService";
import {
  getMerchantProfile,
  getMerchantAddress,
  updateMerchantProfile
} from "../../services/merchantService";
import { FM_API } from "../../services/api";

function EditMerchant({ setActivePage }) {
  const navigate = useNavigate();
  const merchantId = localStorage.getItem("merchantId");

  const handleBack = () => {
    if (typeof setActivePage === "function") {
      setActivePage("merchants");
    } else {
      navigate("/dashboard/merchants");
    }
  };

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [errors, setErrors] = useState({});
  
  // State for dropdown options
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loadingAddress, setLoadingAddress] = useState(false);

  // State for file uploads
  const [aadharFile, setAadharFile] = useState(null);
  const [panFile, setPanFile] = useState(null);
  const [aadharFileName, setAadharFileName] = useState("");
  const [panFileName, setPanFileName] = useState("");
  
  // Track existing files
  const [existingAadhar, setExistingAadhar] = useState("");
  const [existingPan, setExistingPan] = useState("");

  const [merchant, setMerchant] = useState({
    merchantId: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    username: "",
    password: "",
    outletType: "",
    uploadedBy: localStorage.getItem("loggedInUser") || localStorage.getItem("username") || "Admin",
    pan: "",
    adhar: "",
    accountNumber: "",
    ifscCode: "",
    bankLocation: "",
    nameInBankAccount: "",
    dob: "",
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

  // Fetch merchant data on mount
  useEffect(() => {
    if (merchantId) {
      fetchMerchantData();
    } else {
      setLoadingData(false);
      alert("No merchant selected. Please go back and select a merchant.");
      handleBack();
    }
  }, [merchantId]);

  // Fetch all merchant data
  const fetchMerchantData = async () => {
    setLoadingData(true);
    try {
      // Fetch states, profile, and address in parallel
      const [statesRes, profileRes, addressRes] = await Promise.allSettled([
        getStates(),
        getMerchantProfile(merchantId),
        getMerchantAddress(merchantId),
      ]);

      // Handle states
      if (statesRes.status === "fulfilled" && statesRes.value) {
        const statesData = statesRes.value?.data || statesRes.value || [];
        setStates(Array.isArray(statesData) ? statesData : []);
      }

      // Handle profile
      let profileData = null;
      if (profileRes.status === "fulfilled" && profileRes.value) {
        profileData = profileRes.value?.data || profileRes.value;
        console.log("Profile Data:", profileData);
      }

      // Handle address
      let addressData = null;
      if (addressRes.status === "fulfilled" && addressRes.value) {
        addressData = addressRes.value?.data || addressRes.value;
        console.log("Address Data:", addressData);
      }

      // Populate form with data
      const stateId = addressData?.stateId || profileData?.stateId || "";
      const cityId = addressData?.cityId || profileData?.cityId || "";
      const areaId = addressData?.areaId || profileData?.areaId || "";

      // Extract full name / first & last name
      const fullMerchantName = profileData?.merchantName || "";
      const nameParts = fullMerchantName ? fullMerchantName.trim().split(" ") : [];
      const parsedFirstName = profileData?.firstName || (nameParts.length > 0 ? nameParts[0] : "");
      const parsedLastName = profileData?.lastName || (nameParts.length > 1 ? nameParts.slice(1).join(" ") : "");

      const parsedEmail = profileData?.merchantEmail || profileData?.email || "";
      const parsedPhone = profileData?.merchantPhone || profileData?.phone || "";
      const parsedUsername = profileData?.username || profileData?.merchantUsername || (parsedEmail ? parsedEmail.split("@")[0] : "");
      const parsedOutletType = profileData?.outletType || profileData?.merchantBusinessType || profileData?.businessType || "";
      const parsedPan = profileData?.pan || profileData?.panNumber || "";
      const parsedAdhar = profileData?.adhar || profileData?.aadharNumber || profileData?.adharNumber || "";

      // Set merchant data
      setMerchant({
        merchantId: profileData?.merchantId || profileData?.id || merchantId || "",
        firstName: parsedFirstName,
        lastName: parsedLastName,
        email: parsedEmail,
        phone: parsedPhone,
        username: parsedUsername,
        password: "", // Don't populate password for security
        outletType: parsedOutletType,
        uploadedBy: profileData?.uploadedBy || localStorage.getItem("loggedInUser") || "Admin",
        pan: parsedPan,
        adhar: parsedAdhar,
        accountNumber: profileData?.accountNumber || "",
        ifscCode: profileData?.ifscCode || "",
        bankLocation: profileData?.bankLocation || profileData?.bankName || "",
        nameInBankAccount: profileData?.nameInBankAccount || profileData?.accountHolderName || profileData?.accountHolder || "",
        dob: profileData?.dob || profileData?.dateOfBirth || "",
        buildingNumber: addressData?.buildingNumber || profileData?.buildingNumber || "",
        road: addressData?.road || addressData?.roadName || profileData?.road || "",
        landmark: addressData?.landmark || profileData?.landmark || "",
        stateId: stateId ? String(stateId) : "",
        cityId: cityId ? String(cityId) : "",
        areaId: areaId ? String(areaId) : "",
        latitude: addressData?.latitude || profileData?.latitude || "",
        longitude: addressData?.longitude || profileData?.longitude || "",
        // Bank IDs needed for update
        bankId: profileData?.bankId || null,
        recipientId: profileData?.recipientId || null,
        status: profileData?.status || "ACTIVE",
        userType: profileData?.userType || "MERCHANT",
      });

      // Track existing documents
      const aadharDoc = profileData?.aadhaarNumberUrl || profileData?.aadharDocumentUrl || profileData?.aadharDocument;
      const panDoc = profileData?.panNumberUrl || profileData?.panDocumentUrl || profileData?.panDocument;
      if (aadharDoc) {
        setExistingAadhar(aadharDoc);
      }
      if (panDoc) {
        setExistingPan(panDoc);
      }

      // Load cities and areas if state/city exist
      if (stateId) {
        await fetchCitiesForState(stateId);
      }
      if (cityId) {
        await fetchAreasForCity(cityId);
      }

    } catch (error) {
      console.error("Error fetching merchant data:", error);
      alert("Error loading merchant data. Please try again.");
    } finally {
      setLoadingData(false);
    }
  };

  // Helper: Fetch cities for a state
  const fetchCitiesForState = async (stateId) => {
    try {
      const response = await getCitiesByState(stateId);
      const citiesData = response?.data || response || [];
      setCities(citiesData);
    } catch (error) {
      console.error("Error fetching cities:", error);
    }
  };

  // Helper: Fetch areas for a city
  const fetchAreasForCity = async (cityId) => {
    try {
      const response = await getAreasByCity(cityId);
      const areasData = response?.data || response || [];
      setAreas(areasData);
    } catch (error) {
      console.error("Error fetching areas:", error);
    }
  };

  // Fetch states
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

  // Fetch cities based on stateId
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
      setMerchant(prev => ({ ...prev, cityId: "", areaId: "" }));
    } catch (error) {
      console.error("Error fetching cities:", error);
      setCities([]);
    } finally {
      setLoadingAddress(false);
    }
  };

  // Fetch areas based on cityId
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
      setMerchant(prev => ({ ...prev, areaId: "" }));
    } catch (error) {
      console.error("Error fetching areas:", error);
      setAreas([]);
    } finally {
      setLoadingAddress(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setMerchant((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    // Handle cascading dropdowns
    if (name === "stateId") {
      fetchCities(value);
    }
    if (name === "cityId") {
      fetchAreas(value);
    }
  };

  // Handle file uploads
  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size should be less than 5MB");
        e.target.value = "";
        return;
      }
      
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        alert("Please upload PDF, JPG, JPEG, or PNG files only");
        e.target.value = "";
        return;
      }

      if (fileType === "aadhar") {
        setAadharFile(file);
        setAadharFileName(file.name);
        setErrors((prev) => ({ ...prev, aadhar: "" }));
      } else if (fileType === "pan") {
        setPanFile(file);
        setPanFileName(file.name);
        setErrors((prev) => ({ ...prev, pan: "" }));
      }
    }
  };

  // Handle removing documents
  const handleRemoveDocument = (fileType) => {
    if (fileType === "aadhar") {
      setAadharFile(null);
      setAadharFileName("");
      const fileInput = document.getElementById('aadhar-file-input');
      if (fileInput) fileInput.value = '';
    } else if (fileType === "pan") {
      setPanFile(null);
      setPanFileName("");
      const fileInput = document.getElementById('pan-file-input');
      if (fileInput) fileInput.value = '';
    }
  };

  // Handle removing existing documents
  const handleRemoveExistingDocument = (fileType) => {
    if (fileType === "aadhar") {
      setExistingAadhar("");
    } else if (fileType === "pan") {
      setExistingPan("");
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // First Name
    if (!merchant.firstName.trim()) {
      newErrors.firstName = "First Name is required";
    } else if (merchant.firstName.length < 2 || merchant.firstName.length > 75) {
      newErrors.firstName = "First Name must be between 2 and 75 characters";
    } else if (!/^[A-Za-z ]+$/.test(merchant.firstName)) {
      newErrors.firstName = "First Name must contain only letters";
    }

    // Last Name
    if (!merchant.lastName.trim()) {
      newErrors.lastName = "Last Name is required";
    } else if (merchant.lastName.length < 2 || merchant.lastName.length > 75) {
      newErrors.lastName = "Last Name must be between 2 and 75 characters";
    } else if (!/^[A-Za-z ]+$/.test(merchant.lastName)) {
      newErrors.lastName = "Last Name must contain only letters";
    }

    // Email
    if (!merchant.email.trim()) {
      newErrors.email = "Email is required";
    } else if (merchant.email.length > 150) {
      newErrors.email = "Email cannot exceed 150 characters";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(merchant.email)) {
      newErrors.email = "Invalid Email format";
    }

    // Phone
    if (!merchant.phone.trim()) {
      newErrors.phone = "Phone Number is required";
    } else if (!/^[6-9]\d{9}$/.test(merchant.phone)) {
      newErrors.phone = "Enter valid 10 digit Indian mobile number";
    }

    // Username
    if (!merchant.username.trim()) {
      newErrors.username = "Username is required";
    } else if (merchant.username.length < 4 || merchant.username.length > 50) {
      newErrors.username = "Username must be between 4 and 50 characters";
    }

    // Password (optional on edit, but validate if provided)
    if (merchant.password && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=!]).{8,20}$/.test(merchant.password)) {
      newErrors.password = "Password must contain uppercase, lowercase, number and special character";
    }

    // Outlet Type
    if (!merchant.outletType) {
      newErrors.outletType = "Outlet Type is required";
    }

    // PAN
    if (!merchant.pan.trim()) {
      newErrors.pan = "PAN Number is required";
    } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(merchant.pan)) {
      newErrors.pan = "PAN format should be AAAAA9999A";
    }

    // Aadhaar
    if (!merchant.adhar.trim()) {
      newErrors.adhar = "Aadhaar Number is required";
    } else if (!/^[2-9]{1}[0-9]{11}$/.test(merchant.adhar)) {
      newErrors.adhar = "Aadhaar must be a valid 12 digit number";
    }

    // Address
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

    if (!merchant.stateId) {
      newErrors.stateId = "State is required";
    }

    if (!merchant.cityId) {
      newErrors.cityId = "City is required";
    }

    if (!merchant.areaId) {
      newErrors.areaId = "Area is required";
    }

    if (merchant.latitude && !/^-?\d+(\.\d+)?$/.test(merchant.latitude.trim())) {
      newErrors.latitude = "Enter a valid latitude (e.g. 17.4455)";
    }

    if (merchant.longitude && !/^-?\d+(\.\d+)?$/.test(merchant.longitude.trim())) {
      newErrors.longitude = "Enter a valid longitude (e.g. 78.3788)";
    }

    // Bank
    if (merchant.accountNumber && !/^[0-9]{9,18}$/.test(merchant.accountNumber)) {
      newErrors.accountNumber = "Account Number must be between 9 and 18 digits";
    }

    if (merchant.ifscCode && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(merchant.ifscCode)) {
      newErrors.ifscCode = "IFSC format should be ABCD0123456";
    }

    if (merchant.bankLocation && merchant.bankLocation.length > 100) {
      newErrors.bankLocation = "Bank Location cannot exceed 100 characters";
    }

    if (merchant.nameInBankAccount && merchant.nameInBankAccount.length > 150) {
      newErrors.nameInBankAccount = "Name In Bank Account cannot exceed 150 characters";
    }

    // DOB
    if (!merchant.dob) {
      newErrors.dob = "Date Of Birth is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const formattedMerchantName = `${merchant.firstName?.trim() || ''} ${merchant.lastName?.trim() || ''}`.trim();

      // Prepare merchant DTO exact matching backend FmMerchantWithBankDto
      const merchantData = {
        merchantId: merchantId ? parseInt(merchantId, 10) : null,
        merchantName: formattedMerchantName || merchant.merchantName || "",
        merchantEmail: merchant.email?.trim() || "",
        merchantPhone: merchant.phone?.trim() || "",
        businessType: merchant.outletType || merchant.businessType || "Retail",
        status: merchant.status || "ACTIVE",
        
        buildingNumber: merchant.buildingNumber?.trim() || "",
        road: merchant.road?.trim() || "",
        landmark: merchant.landmark?.trim() || "",
        stateId: merchant.stateId ? parseInt(merchant.stateId, 10) : null,
        cityId: merchant.cityId ? parseInt(merchant.cityId, 10) : null,
        areaId: merchant.areaId ? parseInt(merchant.areaId, 10) : null,

        bankId: merchant.bankId ? parseInt(merchant.bankId, 10) : null,
        recipientId: merchant.recipientId ? parseInt(merchant.recipientId, 10) : null,
        accountNumber: merchant.accountNumber?.trim() || "",
        ifscCode: merchant.ifscCode?.trim()?.toUpperCase() || "",
        bankName: merchant.bankLocation?.trim() || merchant.bankName || "",
        accountHolderName: merchant.nameInBankAccount?.trim() || merchant.accountHolderName || "",
        userType: merchant.userType || "MERCHANT",
        
        aadharNumber: merchant.adhar?.trim() || "",
        panNumber: merchant.pan?.trim()?.toUpperCase() || "",
        aadhaarNumberUrl: existingAadhar || merchant.aadhaarNumberUrl || null,
        panNumberUrl: existingPan || merchant.panNumberUrl || null,
      };

      // Create FormData object
      const formData = new FormData();

      // Append merchant data as JSON blob under 'data' part
      formData.append('data', new Blob([JSON.stringify(merchantData)], {
        type: 'application/json'
      }));

      // Append multipart files if selected
      if (aadharFile) {
        formData.append('aadhar', aadharFile);
      }
      if (panFile) {
        formData.append('pan', panFile);
      }

      // Send update request using service
      const response = await updateMerchantProfile(formData);

      alert(response?.message || "Merchant updated successfully!");
      handleBack();

    } catch (error) {
      console.error("Error updating merchant:", error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors?.[0]?.defaultMessage ||
                          "Unable to update merchant. Please check all fields.";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loadingData) {
    return (
      <div className="create-merchant-page">
        <div className="create-merchant-container">
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <h3>⏳ Loading Merchant Details...</h3>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="create-merchant-page">
      <div className="create-merchant-container">
        <div className="create-merchant-header">
          <button
            className="create-merchant-back-btn"
            onClick={handleBack}
          >
            <FiArrowLeft />
            <span>Back</span>
          </button>
          <h2>Edit Merchant</h2>
          <p>
            Update merchant details in the Food & Mart system.
          </p>
        </div>

        <form className="create-merchant-form" noValidate>
          {/* ================= PERSONAL DETAILS ================= */}
          <div className="create-merchant-section">
            <h3 className="create-merchant-section-header">
              Personal Details
            </h3>
            <div className="create-merchant-grid">
              <div className="create-merchant-field">
                <label>
                  First Name
                  <span className="required-star">*</span>
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
                  Last Name
                  <span className="required-star">*</span>
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
                  Email
                  <span className="required-star">*</span>
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
                  Phone Number
                  <span className="required-star">*</span>
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

          {/* ================= LOGIN DETAILS ================= */}
          <div className="create-merchant-section">
            <h3 className="create-merchant-section-header">
              Login Details
            </h3>
            <div className="create-merchant-grid">
              <div className="create-merchant-field">
                <label>
                  Username
                  <span className="required-star">*</span>
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
                <label>Password <span style={{ fontSize: '12px', color: '#6b7280' }}>(Leave blank to keep current)</span></label>
                <input
                  type="password"
                  name="password"
                  value={merchant.password}
                  onChange={handleChange}
                  className={errors.password ? "create-merchant-input-error" : ""}
                  placeholder="Enter new password (optional)"
                />
                {errors.password && (
                  <p className="create-merchant-error">{errors.password}</p>
                )}
              </div>
            </div>
          </div>

          {/* ================= ADDRESS DETAILS ================= */}
          <div className="create-merchant-section">
            <h3 className="create-merchant-section-header">
              Address Details
            </h3>
            <div className="create-merchant-grid">
              <div className="create-merchant-field">
                <label>
                  Building No.
                  <span className="required-star">*</span>
                </label>
                <input
                  type="text"
                  name="buildingNumber"
                  value={merchant.buildingNumber}
                  onChange={handleChange}
                  className={errors.buildingNumber ? "create-merchant-input-error" : ""}
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
                  State
                  <span className="required-star">*</span>
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
                    <option value="" disabled>No states available</option>
                  )}
                </select>
                {errors.stateId && (
                  <p className="create-merchant-error">{errors.stateId}</p>
                )}
              </div>

              <div className="create-merchant-field">
                <label>
                  City
                  <span className="required-star">*</span>
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
                    <option value="" disabled>Please select a state first</option>
                  )}
                </select>
                {errors.cityId && (
                  <p className="create-merchant-error">{errors.cityId}</p>
                )}
              </div>

              <div className="create-merchant-field">
                <label>
                  Area
                  <span className="required-star">*</span>
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
                    <option value="" disabled>Please select a city first</option>
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

          {/* ================= BUSINESS DETAILS ================= */}
          <div className="create-merchant-section">
            <h3 className="create-merchant-section-header">
              Business Details
            </h3>
            <div className="create-merchant-grid">
              <div className="create-merchant-field">
                <label>
                  Merchant Type
                  <span className="required-star">*</span>
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

          {/* ================= GOVERNMENT DETAILS ================= */}
          <div className="create-merchant-section">
            <h3 className="create-merchant-section-header">
              Government Details
            </h3>
            <div className="create-merchant-grid">
              <div className="create-merchant-field">
                <label>
                  PAN Number
                  <span className="required-star">*</span>
                </label>
                <input
                  type="text"
                  name="pan"
                  style={{ textTransform: "uppercase" }}
                  value={merchant.pan}
                  onChange={handleChange}
                  className={errors.pan ? "create-merchant-input-error" : ""}
                  placeholder="e.g., ABCDE1234F"
                />
                {errors.pan && (
                  <p className="create-merchant-error">{errors.pan}</p>
                )}
              </div>

              <div className="create-merchant-field">
                <label>
                  Aadhaar Number
                  <span className="required-star">*</span>
                </label>
                <input
                  type="text"
                  name="adhar"
                  maxLength="12"
                  value={merchant.adhar}
                  onChange={handleChange}
                  className={errors.adhar ? "create-merchant-input-error" : ""}
                  placeholder="Enter 12 digit Aadhaar number"
                />
                {errors.adhar && (
                  <p className="create-merchant-error">{errors.adhar}</p>
                )}
              </div>

              <div className="create-merchant-field">
                <label>
                  Date of Birth
                  <span className="required-star">*</span>
                </label>
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
            </div>
          </div>

          {/* ================= DOCUMENT UPLOADS ================= */}
          <div className="create-merchant-section">
            <h3 className="create-merchant-section-header">
              Document Uploads
            </h3>
            <div className="create-merchant-grid">
              <div className="create-merchant-field">
                <label>Aadhaar Document</label>
                <div className="create-merchant-file-upload-wrapper">
                  <input
                    id="aadhar-file-input"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(e, "aadhar")}
                    className="create-merchant-file-input"
                  />
                  {existingAadhar && (
                    <div className="create-merchant-file-info">
                      <span className="create-merchant-file-name">📎 Existing: {existingAadhar}</span>
                      <button
                        type="button"
                        className="create-merchant-remove-file-btn"
                        onClick={() => handleRemoveExistingDocument("aadhar")}
                        title="Remove existing Aadhaar document"
                      >
                        <FiX />
                      </button>
                    </div>
                  )}
                  {aadharFileName && (
                    <div className="create-merchant-file-info">
                      <span className="create-merchant-file-name">📎 New: {aadharFileName}</span>
                      <button
                        type="button"
                        className="create-merchant-remove-file-btn"
                        onClick={() => handleRemoveDocument("aadhar")}
                        title="Remove new Aadhaar document"
                      >
                        <FiX />
                      </button>
                    </div>
                  )}
                </div>
                {errors.aadhar && (
                  <p className="create-merchant-error">{errors.aadhar}</p>
                )}
              </div>

              <div className="create-merchant-field">
                <label>PAN Document</label>
                <div className="create-merchant-file-upload-wrapper">
                  <input
                    id="pan-file-input"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(e, "pan")}
                    className="create-merchant-file-input"
                  />
                  {existingPan && (
                    <div className="create-merchant-file-info">
                      <span className="create-merchant-file-name">📎 Existing: {existingPan}</span>
                      <button
                        type="button"
                        className="create-merchant-remove-file-btn"
                        onClick={() => handleRemoveExistingDocument("pan")}
                        title="Remove existing PAN document"
                      >
                        <FiX />
                      </button>
                    </div>
                  )}
                  {panFileName && (
                    <div className="create-merchant-file-info">
                      <span className="create-merchant-file-name">📎 New: {panFileName}</span>
                      <button
                        type="button"
                        className="create-merchant-remove-file-btn"
                        onClick={() => handleRemoveDocument("pan")}
                        title="Remove new PAN document"
                      >
                        <FiX />
                      </button>
                    </div>
                  )}
                </div>
                {errors.pan && (
                  <p className="create-merchant-error">{errors.pan}</p>
                )}
              </div>
            </div>
          </div>

          {/* ================= BANK DETAILS ================= */}
          <div className="create-merchant-section">
            <h3 className="create-merchant-section-header">
              Bank Details
            </h3>
            <div className="create-merchant-grid">
              <div className="create-merchant-field">
                <label>Account Number</label>
                <input
                  type="text"
                  name="accountNumber"
                  value={merchant.accountNumber}
                  onChange={handleChange}
                  className={errors.accountNumber ? "create-merchant-input-error" : ""}
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
                  className={errors.nameInBankAccount ? "create-merchant-input-error" : ""}
                  placeholder="Account holder name"
                />
                {errors.nameInBankAccount && (
                  <p className="create-merchant-error">{errors.nameInBankAccount}</p>
                )}
              </div>
            </div>
          </div>

          <div className="create-merchant-button-row">
            <button
              type="button"
              className="create-merchant-cancel-btn"
              onClick={handleBack}
            >
              Cancel
            </button>
            <button
              type="button"
              className="create-merchant-save-btn"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Merchant"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditMerchant;