import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FM_API } from "../services/api";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FiUser, FiLock, FiShield, FiArrowRight } from "react-icons/fi";
import "../styles/Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const remembered = localStorage.getItem("rememberedUser");
    if (remembered) {
      setEmail(remembered);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await FM_API.post("/api/fm/auth/webLogin", {
        username: email,
        password: password,
      });

      const userData = response.data;
      console.log("Login Response :", userData);

      // Clear old session
      localStorage.clear();

      // Complete response
      localStorage.setItem("userData", JSON.stringify(userData));

      // JWT Token
      localStorage.setItem("token", userData.token || "");

      // Username
      localStorage.setItem("username", userData.username || "");

      // Role
      localStorage.setItem("role", userData.role || "");

      // User ID & Approver ID
      const userIdVal = userData.userId || userData.id || userData.employeeId || "";
      localStorage.setItem("userId", String(userIdVal));
      localStorage.setItem("approverId", String(userIdVal));
      if (userData.employeeId) {
        localStorage.setItem("employeeId", String(userData.employeeId));
      }

      // Permissions
      localStorage.setItem(
        "permissions",
        JSON.stringify(userData.permissions || [])
      );

      console.log("Stored Token:", localStorage.getItem("token"));
      console.log("Stored Role:", localStorage.getItem("role"));
      console.log("Stored Permissions:", localStorage.getItem("permissions"));

      if (rememberMe) {
        localStorage.setItem("rememberedUser", email);
      } else {
        localStorage.removeItem("rememberedUser");
      }

      sessionStorage.setItem("justLoggedIn", "true");

      navigate("/dashboard");
    } catch (error) {
      console.error("Login Error:", error);
      alert(
        error?.response?.data?.message ||
        error?.response?.data ||
        "Invalid Username or Password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Brand Header */}
        <div style={{ textAlign: "center" }}>
          <div className="login-badge-pill">
            <span className="pill-dot"></span>
            Management Portal
          </div>

          <div className="logo-box">
            <span className="green">Jippy</span>
            <span className="orange">Mart</span>
          </div>

          <h2>Admin Login</h2>
          <p className="login-subtitle">
            Enter your credentials to access the store management system
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Username Input Group */}
          <div className="login-input-group">
            <FiUser className="login-input-icon" />
            <input
              type="text"
              placeholder="Username or Email"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
            />
          </div>

          {/* Password Input Group */}
          <div className="login-input-group password-group">
            <FiLock className="login-input-icon" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="input-field password-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <span
              className="eye-icon"
              onClick={() => setShowPassword(!showPassword)}
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {/* Options Row */}
          <div className="login-options">
            <label className="remember">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember Me</span>
            </label>

            <span
              onClick={() => navigate("/forgot-password")}
              className="forgot-password-link"
            >
              Forgot Password?
            </span>
          </div>

          {/* Submit Button */}
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="login-btn-spinner"></span>
                <span>LOGGING IN...</span>
              </>
            ) : (
              <>
                <span>SIGN IN TO DASHBOARD</span>
                <FiArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Security Footer */}
        <div className="login-footer-security">
          <FiShield size={14} />
          <span>Encrypted 256-Bit SSL Admin Access</span>
        </div>
      </div>
    </div>
  );
}

export default Login;