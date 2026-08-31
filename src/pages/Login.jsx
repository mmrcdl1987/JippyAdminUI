import { useState } from "react";
import { useNavigate } from "react-router-dom";
// import axios from "axios";
import { FM_API } from "../services/api";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "../styles/Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

const handleSubmit = async (e) => {
  e.preventDefault();

  try {

    setLoading(true);

    // const response = await axios.post(
    //   "/api/fm/auth/webLogin",
    //   {
    //     username: email,
    //     password: password,
    //   }
    // );
 const response = await FM_API.post(
  "/api/fm/auth/webLogin",
  {
    username: email,
    password: password,
  }
);

    const userData = response.data;

    console.log("Login Response :", userData);

    // Clear old session
    localStorage.clear();

    // Complete response
    localStorage.setItem(
      "userData",
      JSON.stringify(userData)
    );

    // JWT Token
    localStorage.setItem(
      "token",
      userData.token || ""
    );

    // Username
    localStorage.setItem(
      "username",
      userData.username || ""
    );

    // Role
    localStorage.setItem(
      "role",
      userData.role || ""
    );

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
      JSON.stringify(
        userData.permissions || []
      )
    );

    console.log(
      "Stored Token:",
      localStorage.getItem("token")
    );

    console.log(
      "Stored Role:",
      localStorage.getItem("role")
    );

    console.log(
      "Stored Permissions:",
      localStorage.getItem("permissions")
    );

    if (rememberMe) {
      localStorage.setItem(
        "rememberedUser",
        email
      );
    }

    navigate("/dashboard");

  } catch (error) {

    console.error(
      "Login Error:",
      error
    );

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
        <div className="logo-box">
          <span className="green">Jippy</span>
          <span className="orange">Mart</span>
        </div>

        <h2>Admin Login</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            className="input-field"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            required
          />

          <div className="password-container">
            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              placeholder="Password"
              className="input-field password-input"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
            />

            <span
              className="eye-icon"
              onClick={() =>
                setShowPassword(!showPassword)
              }
            >
              {showPassword ? (
                <FaEyeSlash />
              ) : (
                <FaEye />
              )}
            </span>
          </div>

          <div className="remember">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) =>
                setRememberMe(e.target.checked)
              }
            />
            <label>Remember Me</label>
          </div>

          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading
              ? "LOGGING IN..."
              : "LOGIN"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;