import "../styles/CreateDriver.css";

import { useState } from "react";

function CreateDriver({ setActivePage }) {

  /* =========================================================
     INITIAL FORM
     ========================================================= */

  const initialForm = {
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",

    nomineeName: "",
    nomineePhoneNumber: "",
    isNomineeVerified: false,

    familyMemberName: "",
    familyMemberPhoneNumber: "",
    isFamilyMemberVerified: false,

    aadharNumber: "",
    drivingLicenseNumber: "",
    rcCopy: "",

    buildingNumber: "",
    road: "",
    landmark: "",

    cityId: "",
    stateId: "",
    areaId: "",

    password: "",
  };


  const [formData, setFormData] = useState(initialForm);

  const [errors, setErrors] = useState({});

  const [loading, setLoading] = useState(false);

  const [notification, setNotification] = useState({
    show: false,
    type: "",
    message: "",
  });


  /* =========================================================
     SHOW NOTIFICATION
     ========================================================= */

  const showNotification = (type, message) => {

    setNotification({
      show: true,
      type,
      message,
    });

    setTimeout(() => {

      setNotification({
        show: false,
        type: "",
        message: "",
      });

    }, 4000);

  };


  /* =========================================================
     VALIDATION
     MATCHES BACKEND DriverDto
     ========================================================= */

  const validateForm = () => {

    const newErrors = {};

    /* -------------------------------------------------------
       FIRST NAME
    ------------------------------------------------------- */

    if (!formData.firstName.trim()) {

      newErrors.firstName =
        "First name is required";

    } else if (formData.firstName.length > 50) {

      newErrors.firstName =
        "First name cannot exceed 50 characters";

    } else if (!/^[A-Za-z ]+$/.test(formData.firstName)) {

      newErrors.firstName =
        "First name can contain only letters and spaces";

    }


    /* -------------------------------------------------------
       LAST NAME
    ------------------------------------------------------- */

    if (!formData.lastName.trim()) {

      newErrors.lastName =
        "Last name is required";

    } else if (formData.lastName.length > 50) {

      newErrors.lastName =
        "Last name cannot exceed 50 characters";

    } else if (!/^[A-Za-z ]+$/.test(formData.lastName)) {

      newErrors.lastName =
        "Last name can contain only letters and spaces";

    }


    /* -------------------------------------------------------
       PHONE
    ------------------------------------------------------- */

    if (!formData.phoneNumber.trim()) {

      newErrors.phoneNumber =
        "Phone number is required";

    } else if (!/^[6-9]\d{9}$/.test(formData.phoneNumber)) {

      newErrors.phoneNumber =
        "Phone number must be a valid 10-digit Indian mobile number";

    }


    /* -------------------------------------------------------
       EMAIL
    ------------------------------------------------------- */

    if (!formData.email.trim()) {

      newErrors.email =
        "Email is required";

    } else if (
      !/^[A-Za-z0-9._%+-]+@gmail\.com$/.test(
        formData.email
      )
    ) {

      newErrors.email =
        "Email must be a valid Gmail address";

    }


    /* -------------------------------------------------------
       NOMINEE NAME
    ------------------------------------------------------- */

    if (!formData.nomineeName.trim()) {

      newErrors.nomineeName =
        "Nominee name is required";

    } else if (formData.nomineeName.length > 50) {

      newErrors.nomineeName =
        "Nominee name must be less than 50 characters";

    } else if (
      !/^[A-Za-z ]+$/.test(formData.nomineeName)
    ) {

      newErrors.nomineeName =
        "Nominee name can contain only letters and spaces";

    }


    /* -------------------------------------------------------
       NOMINEE PHONE
    ------------------------------------------------------- */

    if (!formData.nomineePhoneNumber.trim()) {

      newErrors.nomineePhoneNumber =
        "Nominee phone number is required";

    } else if (
      !/^[0-9]{10}$/.test(
        formData.nomineePhoneNumber
      )
    ) {

      newErrors.nomineePhoneNumber =
        "Nominee phone number must be 10 digits";

    }


    /* -------------------------------------------------------
       FAMILY MEMBER NAME
    ------------------------------------------------------- */

    if (!formData.familyMemberName.trim()) {

      newErrors.familyMemberName =
        "Family member name is required";

    } else if (
      formData.familyMemberName.length > 50
    ) {

      newErrors.familyMemberName =
        "Family member name must be less than 50 characters";

    } else if (
      !/^[A-Za-z ]+$/.test(
        formData.familyMemberName
      )
    ) {

      newErrors.familyMemberName =
        "Family member name can contain only letters and spaces";

    }


    /* -------------------------------------------------------
       FAMILY MEMBER PHONE
    ------------------------------------------------------- */

    if (!formData.familyMemberPhoneNumber.trim()) {

      newErrors.familyMemberPhoneNumber =
        "Family member phone number is required";

    } else if (
      !/^[6-9]\d{9}$/.test(
        formData.familyMemberPhoneNumber
      )
    ) {

      newErrors.familyMemberPhoneNumber =
        "Family member phone number must be a valid 10-digit Indian mobile number";

    }


    /* -------------------------------------------------------
       AADHAAR
    ------------------------------------------------------- */

    if (!formData.aadharNumber.trim()) {

      newErrors.aadharNumber =
        "Aadhaar number is required";

    } else if (
      !/^\d{12}$/.test(formData.aadharNumber)
    ) {

      newErrors.aadharNumber =
        "Aadhaar number must contain exactly 12 digits";

    }


    /* -------------------------------------------------------
       DRIVING LICENSE
    ------------------------------------------------------- */

    if (!formData.drivingLicenseNumber.trim()) {

      newErrors.drivingLicenseNumber =
        "Driving license number is required";

    } else if (
      !/^[A-Z]{2}[0-9]{2}[0-9]{11}$/.test(
        formData.drivingLicenseNumber
      )
    ) {

      newErrors.drivingLicenseNumber =
        "Invalid driving license number format. Example: TS0920200012345";

    }


    /* -------------------------------------------------------
       RC COPY
    ------------------------------------------------------- */

    if (!formData.rcCopy.trim()) {

      newErrors.rcCopy =
        "RC copy number is required";

    } else if (
      !/^[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{1,4}$/.test(
        formData.rcCopy
      )
    ) {

      newErrors.rcCopy =
        "Invalid RC number format. Example: TS09EF5678";

    }


    /* -------------------------------------------------------
       BUILDING NUMBER
    ------------------------------------------------------- */

    if (!formData.buildingNumber.trim()) {

      newErrors.buildingNumber =
        "Building number is required";

    } else if (
      formData.buildingNumber.length > 50
    ) {

      newErrors.buildingNumber =
        "Building number cannot exceed 50 characters";

    }


    /* -------------------------------------------------------
       ROAD
    ------------------------------------------------------- */

    if (!formData.road.trim()) {

      newErrors.road =
        "Road is required";

    } else if (formData.road.length > 100) {

      newErrors.road =
        "Road cannot exceed 100 characters";

    }


    /* -------------------------------------------------------
       LANDMARK
    ------------------------------------------------------- */

    if (!formData.landmark.trim()) {

      newErrors.landmark =
        "Landmark is required";

    } else if (formData.landmark.length > 150) {

      newErrors.landmark =
        "Landmark cannot exceed 150 characters";

    }


    /* -------------------------------------------------------
       STATE ID
    ------------------------------------------------------- */

    if (!formData.stateId) {

      newErrors.stateId =
        "State ID is required";

    } else if (
      !Number.isInteger(Number(formData.stateId)) ||
      Number(formData.stateId) <= 0
    ) {

      newErrors.stateId =
        "State ID must be greater than zero";

    }


    /* -------------------------------------------------------
       CITY ID
    ------------------------------------------------------- */

    if (!formData.cityId) {

      newErrors.cityId =
        "City ID is required";

    } else if (
      !Number.isInteger(Number(formData.cityId)) ||
      Number(formData.cityId) <= 0
    ) {

      newErrors.cityId =
        "City ID must be greater than zero";

    }


    /* -------------------------------------------------------
       AREA ID
    ------------------------------------------------------- */

    if (!formData.areaId) {

      newErrors.areaId =
        "Area ID is required";

    } else if (
      !Number.isInteger(Number(formData.areaId)) ||
      Number(formData.areaId) <= 0
    ) {

      newErrors.areaId =
        "Area ID must be greater than zero";

    }


    /* -------------------------------------------------------
       PASSWORD
    ------------------------------------------------------- */

    if (!formData.password.trim()) {

      newErrors.password =
        "Password is required";

    } else if (
      formData.password.length < 8 ||
      formData.password.length > 20
    ) {

      newErrors.password =
        "Password must be between 8 and 20 characters";

    } else if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=!]).{8,20}$/.test(
        formData.password
      )
    ) {

      newErrors.password =
        "Password must contain uppercase, lowercase, number and special character";

    }


    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;

  };


  /* =========================================================
     HANDLE INPUT
     ========================================================= */

  const handleChange = (event) => {

    const {
      name,
      value,
      type,
      checked,
    } = event.target;


    let finalValue =
      type === "checkbox"
        ? checked
        : value;


    /* -------------------------------------------------------
       PHONE / NUMBER RESTRICTIONS
    ------------------------------------------------------- */

    if (
      name === "phoneNumber" ||
      name === "nomineePhoneNumber" ||
      name === "familyMemberPhoneNumber" ||
      name === "aadharNumber"
    ) {

      finalValue = value.replace(/\D/g, "");

    }


    /* -------------------------------------------------------
       STATE / CITY / AREA
    ------------------------------------------------------- */

    if (
      name === "stateId" ||
      name === "cityId" ||
      name === "areaId"
    ) {

      finalValue = value.replace(/\D/g, "");

    }


    /* -------------------------------------------------------
       UPPERCASE DOCUMENT NUMBERS
    ------------------------------------------------------- */

    if (
      name === "drivingLicenseNumber" ||
      name === "rcCopy"
    ) {

      finalValue = value.toUpperCase();

    }


    setFormData((previous) => ({
      ...previous,
      [name]: finalValue,
    }));


    /* Remove error while user corrects field */

    if (errors[name]) {

      setErrors((previous) => {

        const updated = {
          ...previous,
        };

        delete updated[name];

        return updated;

      });

    }

  };


  /* =========================================================
     API CALL
     ========================================================= */

  const handleSubmit = async (event) => {

    event.preventDefault();


    /* Validate before API */

    const isValid = validateForm();

    if (!isValid) {

      showNotification(
        "error",
        "Please correct the highlighted fields before submitting."
      );

      return;

    }


    setLoading(true);


    try {

      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken") ||
        localStorage.getItem("authorization");


      const payload = {

        firstName:
          formData.firstName.trim(),

        lastName:
          formData.lastName.trim(),

        phoneNumber:
          formData.phoneNumber,

        email:
          formData.email.trim(),

        nomineeName:
          formData.nomineeName.trim(),

        nomineePhoneNumber:
          formData.nomineePhoneNumber,

        isNomineeVerified:
          Boolean(formData.isNomineeVerified),

        familyMemberName:
          formData.familyMemberName.trim(),

        familyMemberPhoneNumber:
          formData.familyMemberPhoneNumber,

        isFamilyMemberVerified:
          Boolean(formData.isFamilyMemberVerified),

        aadharNumber:
          formData.aadharNumber,

        drivingLicenseNumber:
          formData.drivingLicenseNumber.toUpperCase(),

        rcCopy:
          formData.rcCopy.toUpperCase(),

        buildingNumber:
          formData.buildingNumber.trim(),

        road:
          formData.road.trim(),

        landmark:
          formData.landmark.trim(),

        cityId:
          Number(formData.cityId),

        stateId:
          Number(formData.stateId),

        areaId:
          Number(formData.areaId),

        password:
          formData.password,

      };


      /* -----------------------------------------------------
         API REQUEST

         Change this URL only if your api.js already
         provides a configured Axios instance.
      ----------------------------------------------------- */

      const response = await fetch(
        "http://srv1617582.hstgr.cloud:8084/api/driver/postDriverDetails",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Accept: "*/*",

            ...(token
              ? {
                  Authorization:
                    token.startsWith("Bearer ")
                      ? token
                      : `Bearer ${token}`,
                }
              : {}),
          },

          body: JSON.stringify(payload),

        }
      );


      /* -----------------------------------------------------
         HANDLE BACKEND VALIDATION / ERROR
      ----------------------------------------------------- */

      if (!response.ok) {

        let errorMessage =
          "Failed to create driver.";

        try {

          const errorData =
            await response.json();

          if (
            errorData?.message
          ) {

            errorMessage =
              errorData.message;

          } else if (
            errorData?.error
          ) {

            errorMessage =
              errorData.error;

          }

        } catch {

          // Response was not JSON.

        }


        throw new Error(
          errorMessage
        );

      }


      /* -----------------------------------------------------
         SUCCESS
      ----------------------------------------------------- */

      showNotification(
        "success",
        "Driver created successfully!"
      );


      setFormData(initialForm);

      setErrors({});


    } catch (error) {

      console.error(
        "Create Driver Error:",
        error
      );


      showNotification(
        "error",
        error.message ||
          "Something went wrong while creating the driver."
      );

    } finally {

      setLoading(false);

    }

  };


  /* =========================================================
     FIELD COMPONENT
  ========================================================= */

  const renderInput = (
    name,
    label,
    type = "text",
    placeholder = "",
    maxLength
  ) => {

    return (

      <div className="jippy-create-driver-field">

        <label htmlFor={name}>

          {label}

          <span className="jippy-create-driver-required">
            *
          </span>

        </label>


        <input
          id={name}
          name={name}
          type={type}
          value={formData[name]}
          onChange={handleChange}
          placeholder={placeholder}
          maxLength={maxLength}
          className={
            errors[name]
              ? "jippy-create-driver-input jippy-create-driver-input-error"
              : "jippy-create-driver-input"
          }
        />


        {errors[name] && (

          <span className="jippy-create-driver-error">
            {errors[name]}
          </span>

        )}

      </div>

    );

  };


  /* =========================================================
     RENDER
  ========================================================= */

  return (

    <div className="jippy-create-driver-page">


      {/* =====================================================
          NOTIFICATION
      ===================================================== */}

      {notification.show && (

        <div
          className={`jippy-driver-notification ${
            notification.type === "success"
              ? "jippy-driver-notification-success"
              : "jippy-driver-notification-error"
          }`}
        >

          <div className="jippy-driver-notification-icon">

            {notification.type === "success"
              ? "✓"
              : "!"}

          </div>


          <div className="jippy-driver-notification-content">

            <strong>
              {notification.type === "success"
                ? "Success"
                : "Error"}
            </strong>

            <span>
              {notification.message}
            </span>

          </div>


          <button
            type="button"
            onClick={() =>
              setNotification({
                show: false,
                type: "",
                message: "",
              })
            }
          >
            ×
          </button>

        </div>

      )}


      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="jippy-create-driver-header">

        <button
          type="button"
          className="jippy-create-driver-back-btn"
          onClick={() =>
            setActivePage("allDrivers")
          }
        >
          ← Back
        </button>


        <h2>
          Create Driver
        </h2>


        <p>
          Add a new driver with personal, KYC and address details.
        </p>

      </div>


      {/* =====================================================
          FORM
      ===================================================== */}

      <form
        className="jippy-create-driver-form"
        onSubmit={handleSubmit}
        noValidate
      >


        {/* ===================================================
            PERSONAL DETAILS
        =================================================== */}

        <section className="jippy-create-driver-section">

          <h3>
            Personal Details
          </h3>


          <div className="jippy-create-driver-grid">

            {renderInput(
              "firstName",
              "First Name",
              "text",
              "Enter first name",
              50
            )}


            {renderInput(
              "lastName",
              "Last Name",
              "text",
              "Enter last name",
              50
            )}


            {renderInput(
              "phoneNumber",
              "Phone Number",
              "tel",
              "Enter 10-digit mobile number",
              10
            )}


            {renderInput(
              "email",
              "Email",
              "email",
              "example@gmail.com"
            )}

          </div>

        </section>


        {/* ===================================================
            NOMINEE DETAILS
        =================================================== */}

        <section className="jippy-create-driver-section">

          <h3>
            Nominee Details
          </h3>


          <div className="jippy-create-driver-grid">

            {renderInput(
              "nomineeName",
              "Nominee Name",
              "text",
              "Enter nominee name",
              50
            )}


            {renderInput(
              "nomineePhoneNumber",
              "Nominee Phone Number",
              "tel",
              "Enter nominee phone number",
              10
            )}

          </div>


          <label className="jippy-create-driver-checkbox">

            <input
              type="checkbox"
              name="isNomineeVerified"
              checked={
                formData.isNomineeVerified
              }
              onChange={handleChange}
            />

            <span>
              Nominee Verified
            </span>

          </label>

        </section>


        {/* ===================================================
            FAMILY MEMBER DETAILS
        =================================================== */}

        <section className="jippy-create-driver-section">

          <h3>
            Family Member Details
          </h3>


          <div className="jippy-create-driver-grid">

            {renderInput(
              "familyMemberName",
              "Family Member Name",
              "text",
              "Enter family member name",
              50
            )}


            {renderInput(
              "familyMemberPhoneNumber",
              "Family Member Phone Number",
              "tel",
              "Enter family member phone number",
              10
            )}

          </div>


          <label className="jippy-create-driver-checkbox">

            <input
              type="checkbox"
              name="isFamilyMemberVerified"
              checked={
                formData.isFamilyMemberVerified
              }
              onChange={handleChange}
            />

            <span>
              Family Member Verified
            </span>

          </label>

        </section>


        {/* ===================================================
            KYC DETAILS
        =================================================== */}

        <section className="jippy-create-driver-section">

          <h3>
            KYC Details
          </h3>


          <div className="jippy-create-driver-grid">

            {renderInput(
              "aadharNumber",
              "Aadhaar Number",
              "text",
              "Enter 12-digit Aadhaar number",
              12
            )}


            {renderInput(
              "drivingLicenseNumber",
              "Driving License Number",
              "text",
              "Example: TS0920200012345"
            )}


            {renderInput(
              "rcCopy",
              "RC Number",
              "text",
              "Example: TS09EF5678"
            )}

          </div>

        </section>


        {/* ===================================================
            ADDRESS DETAILS
        =================================================== */}

        <section className="jippy-create-driver-section">

          <h3>
            Address Details
          </h3>


          <div className="jippy-create-driver-grid">

            {renderInput(
              "buildingNumber",
              "Building Number",
              "text",
              "Example: 10-2-15",
              50
            )}


            {renderInput(
              "road",
              "Road",
              "text",
              "Enter road name",
              100
            )}


            {renderInput(
              "landmark",
              "Landmark",
              "text",
              "Enter nearest landmark",
              150
            )}


            {renderInput(
              "stateId",
              "State ID",
              "number",
              "Enter state ID"
            )}


            {renderInput(
              "cityId",
              "City ID",
              "number",
              "Enter city ID"
            )}


            {renderInput(
              "areaId",
              "Area ID",
              "number",
              "Enter area ID"
            )}

          </div>

        </section>


        {/* ===================================================
            ACCOUNT DETAILS
        =================================================== */}

        <section className="jippy-create-driver-section">

          <h3>
            Account Details
          </h3>


          <div className="jippy-create-driver-grid">

            {renderInput(
              "password",
              "Password",
              "password",
              "Enter driver password"
            )}

          </div>


          <div className="jippy-create-driver-password-hint">

            Password must contain:

            <ul>

              <li>
                8–20 characters
              </li>

              <li>
                At least one uppercase letter
              </li>

              <li>
                At least one lowercase letter
              </li>

              <li>
                At least one number
              </li>

              <li>
                At least one special character
              </li>

            </ul>

          </div>

        </section>


        {/* ===================================================
            BUTTONS
        =================================================== */}

        <div className="jippy-create-driver-actions">

          <button
            type="button"
            className="jippy-create-driver-cancel-btn"
            disabled={loading}
            onClick={() =>
              setActivePage("allDrivers")
            }
          >
            Cancel
          </button>


          <button
            type="submit"
            className="jippy-create-driver-submit-btn"
            disabled={loading}
          >

            {loading
              ? "Creating Driver..."
              : "Create Driver"}

          </button>

        </div>


      </form>

    </div>

  );
}

export default CreateDriver;