import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FM_API } from "../services/api";
import "../styles/Login.css";

function ForgotPassword() {
  const [step, setStep] = useState(1); // Step 1: Send OTP, Step 2: Validate OTP, Step 3: Reset Password
  const [email, setEmail] = useState("");
  const [userType, setUserType] = useState("ADMIN");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // State for password visibility
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const userTypes = [
    "ADMIN",
    "SUPERADMIN",
    "MERCHANT",
    "DRIVER",
    "DELIVERY_PARTNER",
  ];

  // Handler for Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      alert("Please enter your email.");
      return;
    }

    if (!userType) {
      alert("Please select user type.");
      return;
    }

    try {
      setLoading(true);

      const response = await FM_API.post(
        "/api/fm/forgetPasswordForUserTypeBySendingOtpToMail",
        {
          email: email.trim(),
          userType: userType,
        }
      );

      console.log("Send OTP Response:", response.data);
      alert("OTP sent successfully to your registered email.");
      
      // Move to Step 2 (Validate OTP)
      setStep(2);
    } catch (error) {
      console.error("Send OTP Error:", error);

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        (typeof error?.response?.data === "string"
          ? error.response.data
          : null) ||
        "Failed to send OTP. Please check your email and user type.";

      alert(message);
    } finally {
      setLoading(false);
    }
  };

  // Handler for Step 2: Validate OTP
  const handleValidateOtp = async (e) => {
    e.preventDefault();

    if (!otp.trim()) {
      alert("Please enter the OTP.");
      return;
    }

    try {
      setLoading(true);

      const response = await FM_API.post(
        "/api/fm/validateForgotPasswordOTP",
        {
          email: email.trim(),
          userType: userType,
          otp: otp.trim(),
        }
      );

      console.log("Validate OTP Response:", response.data);
      alert("OTP validated successfully!");

      // Move to Step 3 (Reset Password screen)
      setStep(3);
    } catch (error) {
      console.error("Validate OTP Error:", error);

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        (typeof error?.response?.data === "string"
          ? error.response.data
          : null) ||
        "Invalid OTP. Please try again.";

      alert(message);
    } finally {
      setLoading(false);
    }
  };

  // Handler for Step 3: Update/Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!newPassword.trim()) {
      alert("Please enter a new password.");
      return;
    }

    try {
      setLoading(true);

      const response = await FM_API.post(
        "/api/fm/updateForgotPassword",
        {
          email: email.trim(),
          userType: userType,
          newPassword: newPassword.trim(),
        }
      );

      console.log("Update Password Response:", response.data);
      alert("Password updated successfully! Please login with your new password.");
      
      // Navigate back to login
      navigate("/");
    } catch (error) {
      console.error("Update Password Error:", error);

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        (typeof error?.response?.data === "string"
          ? error.response.data
          : null) ||
        "Failed to update password. Please try again.";

      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">

        {/* Logo */}
        <div className="logo-box">
          <span className="green">Jippy</span>
          <span className="orange">Mart</span>
        </div>

        {/* Title */}
        <h2>
          {step === 1 && "Forgot Password"}
          {step === 2 && "Verify OTP"}
          {step === 3 && "Reset Password"}
        </h2>

        {/* Description */}
        <p
          style={{
            fontSize: "0.85rem",
            color: "#666",
            marginBottom: "1.5rem",
            textAlign: "center",
            lineHeight: "1.4",
          }}
        >
          {step === 1 && "Enter your email address and we'll send you an OTP to reset your password."}
          {step === 2 && <>Enter the OTP sent to<br /><strong>{email}</strong></>}
          {step === 3 && <>Enter your new password for<br /><strong>{email}</strong></>}
        </p>

        {/* STEP 1: Send OTP Form */}
        {step === 1 && (
          <form onSubmit={handleSendOtp}>
            <input
              type="email"
              placeholder="Enter your email"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              style={{ marginBottom: "1rem" }}
            />

            <div style={{ marginBottom: "1rem", textAlign: "left" }}>
              <label
                style={{
                  fontSize: "0.85rem",
                  color: "#444",
                  display: "block",
                  marginBottom: "5px",
                }}
              >
                User Type
              </label>

              <select
                className="input-field"
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
                required
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  backgroundColor: "#fff",
                }}
              >
                {userTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="login-btn"
              disabled={loading}
              style={{ marginBottom: "1rem", cursor: loading ? "not-allowed" : "pointer" }}
            >
              {loading ? "SENDING OTP..." : "SEND OTP"}
            </button>
          </form>
        )}

        {/* STEP 2: Validate OTP Form */}
        {step === 2 && (
          <form onSubmit={handleValidateOtp}>
            <input
              type="text"
              placeholder="Enter OTP"
              className="input-field"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              disabled={loading}
              style={{ marginBottom: "1rem" }}
            />

            <button
              type="submit"
              className="login-btn"
              disabled={loading}
              style={{ marginBottom: "1rem", cursor: loading ? "not-allowed" : "pointer" }}
            >
              {loading ? "VERIFYING..." : "VERIFY OTP"}
            </button>

            <div style={{ textAlign: "center", marginBottom: "0.5rem" }}>
              <span
                onClick={() => !loading && setStep(1)}
                style={{ color: "#666", cursor: loading ? "default" : "pointer", fontSize: "0.85rem", textDecoration: "underline" }}
              >
                Change Email / User Type
              </span>
            </div>
          </form>
        )}

        {/* STEP 3: Reset Password Form with Eye Icon */}
        {step === 3 && (
          <form onSubmit={handleResetPassword}>
            <div style={{ position: "relative", marginBottom: "1rem" }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                className="input-field"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={loading}
                style={{ width: "100%", paddingRight: "40px" }}
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                  fontSize: "1.1rem",
                  color: "#666",
                  userSelect: "none",
                }}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </span>
            </div>

            <button
              type="submit"
              className="login-btn"
              disabled={loading}
              style={{ marginBottom: "1rem", cursor: loading ? "not-allowed" : "pointer" }}
            >
              {loading ? "RESETTING..." : "RESET PASSWORD"}
            </button>
          </form>
        )}

        {/* Back to Login */}
        <div style={{ textAlign: "center" }}>
          <span
            onClick={() => !loading && navigate("/")}
            style={{ color: "#007bff", cursor: loading ? "default" : "pointer", fontSize: "0.9rem" }}
          >
            Back to Login
          </span>
        </div>

      </div>
    </div>
  );
}

export default ForgotPassword;