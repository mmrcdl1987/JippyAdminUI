import axios from "axios";

// Existing service (8086)
const API = axios.create({
  baseURL: "http://localhost:8086/api",
});

// Food & Mart service (8080)
export const FM_API = axios.create({
  baseURL: "http://localhost:8080/api",
});

// Attach JWT token automatically
FM_API.interceptors.request.use(
  (config) => {

    const token =
      localStorage.getItem("token");

    if (token) {

      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default API;