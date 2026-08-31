import React, { useState } from "react";
import "../../styles/Merchants/CreateMerchant.css";
import { FiArrowLeft } from "react-icons/fi";
import { FM_API } from "../../services/api";

function CreateMerchant({ setActivePage }) {

const [loading, setLoading] = useState(false);

const [errors, setErrors] = useState({});

const [merchant, setMerchant] = useState({

firstName: "",
lastName: "",
email: "",
phone: "",

username: "",
password: "",

outletType: "",
// Automatically tracked in background payload, fallback to "Admin"
uploadedBy: localStorage.getItem("loggedInUser") || localStorage.getItem("username") || "Admin",

pan: "",
adhar: "",

accountNumber: "",
ifscCode: "",
bankLocation: "",
nameInBankAccount: "",

dob: "",
fssai: "",
gstNumber: "",

});

const handleChange = (e) => {

const { name, value } = e.target;

setMerchant((prev) => ({

...prev,

[name]: value,

}));

setErrors((prev) => ({

...prev,

[name]: "",

}));

};

const validateForm = () => {

const newErrors = {};

/* ================= FIRST NAME ================= */

if (!merchant.firstName.trim()) {

newErrors.firstName = "First Name is required";

}
else if (
merchant.firstName.length < 2 ||
merchant.firstName.length > 75
) {

newErrors.firstName =
"First Name must be between 2 and 75 characters";

}
else if (!/^[A-Za-z ]+$/.test(merchant.firstName)) {

newErrors.firstName =
"First Name must contain only letters";

}

/* ================= LAST NAME ================= */

if (!merchant.lastName.trim()) {

newErrors.lastName = "Last Name is required";

}
else if (
merchant.lastName.length < 2 ||
merchant.lastName.length > 75
) {

newErrors.lastName =
"Last Name must be between 2 and 75 characters";

}
else if (!/^[A-Za-z ]+$/.test(merchant.lastName)) {

newErrors.lastName =
"Last Name must contain only letters";

}

/* ================= EMAIL ================= */

if (!merchant.email.trim()) {

newErrors.email = "Email is required";

}
else if (merchant.email.length > 150) {

newErrors.email =
"Email cannot exceed 150 characters";

}
else if (
!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(merchant.email)
) {

newErrors.email = "Invalid Email format";

}

/* ================= PHONE ================= */

if (!merchant.phone.trim()) {

newErrors.phone = "Phone Number is required";

}
else if (!/^[6-9]\d{9}$/.test(merchant.phone)) {

newErrors.phone =
"Enter valid 10 digit Indian mobile number";

}

/* ================= USERNAME ================= */

if (!merchant.username.trim()) {

newErrors.username = "Username is required";

}
else if (
merchant.username.length < 4 ||
merchant.username.length > 50
) {

newErrors.username =
"Username must be between 4 and 50 characters";

}

/* ================= PASSWORD ================= */

if (!merchant.password.trim()) {

newErrors.password = "Password is required";

}
else if (
!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=!]).{8,20}$/.test(
merchant.password
)
) {

newErrors.password =
"Password must contain uppercase, lowercase, number and special character";

}

/* ================= OUTLET TYPE ================= */

if (!merchant.outletType) {

newErrors.outletType = "Outlet Type is required";

}
else if (merchant.outletType.length > 50) {

newErrors.outletType =
"Outlet Type cannot exceed 50 characters";

}

/* ================= PAN ================= */

if (!merchant.pan.trim()) {

newErrors.pan = "PAN Number is required";

}
else if (
!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(
merchant.pan
)
) {

newErrors.pan =
"PAN format should be AAAAA9999A";

}

/* ================= AADHAAR ================= */

if (!merchant.adhar.trim()) {

newErrors.adhar =
"Aadhaar Number is required";

}
else if (
!/^[2-9]{1}[0-9]{11}$/.test(
merchant.adhar
)
) {

newErrors.adhar =
"Aadhaar must be a valid 12 digit number";

}

/* ================= ACCOUNT NUMBER ================= */

if (
merchant.accountNumber &&
!/^[0-9]{9,18}$/.test(
merchant.accountNumber
)
) {

newErrors.accountNumber =
"Account Number must be between 9 and 18 digits";

}

/* ================= IFSC ================= */

if (
merchant.ifscCode &&
!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(
merchant.ifscCode
)
) {

newErrors.ifscCode =
"IFSC format should be ABCD0123456";

}

/* ================= BANK LOCATION ================= */

if (
merchant.bankLocation &&
merchant.bankLocation.length > 100
) {

newErrors.bankLocation =
"Bank Location cannot exceed 100 characters";

}

/* ================= NAME IN BANK ================= */

if (
merchant.nameInBankAccount &&
merchant.nameInBankAccount.length > 150
) {

newErrors.nameInBankAccount =
"Name In Bank Account cannot exceed 150 characters";

}

/* ================= DATE OF BIRTH ================= */

if (!merchant.dob) {

newErrors.dob =
"Date Of Birth is required";

}
else if (
!/^(\d{4}-\d{2}-\d{2}|\d{2}-\d{2}-\d{2})$/.test(
merchant.dob
)
) {

newErrors.dob =
"DOB must be YYYY-MM-DD";

}

/* ================= FSSAI ================= */

if (
merchant.fssai &&
!/^\d{14}$/.test(
merchant.fssai
)
) {

newErrors.fssai =
"FSSAI must be exactly 14 digits";

}

/* ================= GST ================= */

if (
merchant.gstNumber &&
!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(
merchant.gstNumber
)
) {

newErrors.gstNumber =
"Invalid GST Number";

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

    const response = await FM_API.post(
      "/api/fm/merchants/createMerchant",
      merchant
    );

    alert(response.data.message);

    setActivePage("outlets");

  } catch (error) {

    console.log(error);

    alert(
      error.response?.data?.message ||
      "Unable to create merchant."
    );

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
onClick={() => setActivePage("outlets")}
>

<FiArrowLeft />

<span>Back</span>

</button>

<h2>Create Merchant</h2>

<p>
Register a new merchant into the Food & Mart system.
</p>

</div>

<form
className="create-merchant-form"
noValidate
>

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
className={
errors.firstName
? "create-merchant-input-error"
: ""
}
/>

{errors.firstName && (
<p className="create-merchant-error">
{errors.firstName}
</p>
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
className={
errors.lastName
? "create-merchant-input-error"
: ""
}
/>

{errors.lastName && (
<p className="create-merchant-error">
{errors.lastName}
</p>
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
className={
errors.email
? "create-merchant-input-error"
: ""
}
/>

{errors.email && (
<p className="create-merchant-error">
{errors.email}
</p>
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
className={
errors.phone
? "create-merchant-input-error"
: ""
}
/>

{errors.phone && (
<p className="create-merchant-error">
{errors.phone}
</p>
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
className={
errors.username
? "create-merchant-input-error"
: ""
}
/>

{errors.username && (
<p className="create-merchant-error">
{errors.username}
</p>
)}

</div>

<div className="create-merchant-field">

<label>
Password
<span className="required-star">*</span>
</label>

<input
type="password"
name="password"
value={merchant.password}
onChange={handleChange}
className={
errors.password
? "create-merchant-input-error"
: ""
}
/>

{errors.password && (
<p className="create-merchant-error">
{errors.password}
</p>
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
Outlet Type
<span className="required-star">*</span>
</label>

<select
name="outletType"
value={merchant.outletType}
onChange={handleChange}
className={
errors.outletType
? "create-merchant-input-error"
: ""
}
>

<option value="">
Select Outlet Type
</option>

<option value="Restaurant">
Restaurant
</option>

<option value="Mart">
Mart
</option>

<option value="Bakery">
Bakery
</option>

<option value="Cafe">
Cafe
</option>

</select>

{errors.outletType && (
<p className="create-merchant-error">
{errors.outletType}
</p>
)}

</div>

{/* Hidden input field for uploadedBy so it's not visible in UI, but passed in payload */}
<input type="hidden" name="uploadedBy" value={merchant.uploadedBy} />

</div>

</div>

{/* ================= GOVERNMENT DETAILS ================= */}

<div className="create-merchant-section">

<h3 className="custom-section-header">
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
className={
errors.pan
? "create-merchant-input-error"
: ""
}
/>

{errors.pan && (
<p className="create-merchant-error">
{errors.pan}
</p>
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
className={
errors.adhar
? "create-merchant-input-error"
: ""
}
/>

{errors.adhar && (
<p className="create-merchant-error">
{errors.adhar}
</p>
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
className={
errors.dob
? "create-merchant-input-error"
: ""
}
/>

{errors.dob && (
<p className="create-merchant-error">
{errors.dob}
</p>
)}

</div>

<div className="create-merchant-field">

<label>
FSSAI Number
</label>

<input
type="text"
name="fssai"
maxLength="14"
value={merchant.fssai}
onChange={handleChange}
className={
errors.fssai
? "create-merchant-input-error"
: ""
}
/>

{errors.fssai && (
<p className="create-merchant-error">
{errors.fssai}
</p>
)}

</div>

<div className="create-merchant-field">

<label>
GST Number
</label>

<input
type="text"
name="gstNumber"
style={{ textTransform: "uppercase" }}
value={merchant.gstNumber}
onChange={handleChange}
className={
errors.gstNumber
? "create-merchant-input-error"
: ""
}
/>

{errors.gstNumber && (
<p className="create-merchant-error">
{errors.gstNumber}
</p>
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
className={
errors.accountNumber
? "create-merchant-input-error"
: ""
}
/>

{errors.accountNumber && (
<p className="create-merchant-error">
{errors.accountNumber}
</p>
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
className={
errors.ifscCode
? "create-merchant-input-error"
: ""
}
/>

{errors.ifscCode && (
<p className="create-merchant-error">
{errors.ifscCode}
</p>
)}

</div>

<div className="create-merchant-field">

<label>Bank Location</label>

<input
type="text"
name="bankLocation"
value={merchant.bankLocation}
onChange={handleChange}
className={
errors.bankLocation
? "create-merchant-input-error"
: ""
}
/>

{errors.bankLocation && (
<p className="create-merchant-error">
{errors.bankLocation}
</p>
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
errors.nameInBankAccount
? "create-merchant-input-error"
: ""
}
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
onClick={() => setActivePage("outlets")}
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