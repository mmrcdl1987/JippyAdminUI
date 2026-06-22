import axios from "axios";

// Through Gateway (8084)
const API = axios.create({
  baseURL: "http://localhost:8084",
});

// Food & Mart through Gateway
export const FM_API = axios.create({
  baseURL: "http://localhost:8084",
});

// Common interceptor
const addToken = (config) => {

  const token = localStorage.getItem("token");

  console.log("================================");
  console.log("TOKEN FROM LOCAL STORAGE:", token);
  console.log("REQUEST URL:", config.url);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log("AUTH HEADER ADDED");
  } else {
    console.log("NO TOKEN FOUND");
  }

  console.log("================================");

  return config;
};

API.interceptors.request.use(
  addToken,
  (error) => Promise.reject(error)
);

FM_API.interceptors.request.use(
  addToken,
  (error) => Promise.reject(error)
);

API.interceptors.response.use(
  (response) => response,
  (error) => {

    console.log("API ERROR:", error);

    if (
      error.response &&
      error.response.status === 401
    ) {

      console.log("401 UNAUTHORIZED");

      localStorage.clear();

      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default API;