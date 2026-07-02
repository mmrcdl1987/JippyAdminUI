import axios from "axios";

// =============================================
// Base URL
// =============================================
// const BASE_URL = "http://localhost:8084";
 const BASE_URL = import.meta.env.VITE_API_BASE_URL;

console.log("Base URL:", BASE_URL);
// const BASE_URL = import.meta.env.VITE_API_BASE_URL;
// =============================================
// Common Axios Instance
// =============================================
const API = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// =============================================
// Food & Mart API Instance
// =============================================
export const FM_API = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// =============================================
// Request Interceptor
// =============================================
const requestInterceptor = (config) => {

  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  console.log("==================================");
  console.log("API REQUEST");
  console.log(config.method?.toUpperCase());
  console.log(config.baseURL + config.url);
  console.log(config.data);
  console.log("==================================");

  return config;

};

// =============================================
// Response Interceptor
// =============================================
const responseInterceptor = (response) => {

  console.log("==================================");
  console.log("API SUCCESS");
  console.log(response.config.url);
  console.log(response.data);
  console.log("==================================");

  return response;

};

// =============================================
// Error Interceptor
// =============================================
const errorInterceptor = (error) => {

  console.log("==================================");
  console.log("API ERROR");
  console.log(error);
  console.log("==================================");

  if (error.response) {

    switch (error.response.status) {

      case 401:

        localStorage.clear();

        window.location.href = "/login";

        break;

      case 403:

        alert("Access Denied");

        break;

      case 500:

        alert("Internal Server Error");

        break;

      default:

        break;
    }
  }

  return Promise.reject(error);

};

// =============================================
// Register Interceptors
// =============================================
API.interceptors.request.use(
  requestInterceptor,
  errorInterceptor
);

FM_API.interceptors.request.use(
  requestInterceptor,
  errorInterceptor
);

API.interceptors.response.use(
  responseInterceptor,
  errorInterceptor
);

FM_API.interceptors.response.use(
  responseInterceptor,
  errorInterceptor
);

// =============================================
// Banner Designer APIs
// =============================================

export const getBannerDesignerData = async () => {

  const response = await FM_API.get(
    "/api/fm/banner-designer"
  );

  return response.data;

};

// =============================================
// Future Banner APIs
// =============================================

export const getBannerDesignerById = async (id) => {

  const response = await FM_API.get(
    `/api/fm/banner-designer/${id}`
  );

  return response.data;

};

export const createBannerDesigner = async (payload) => {

  const response = await FM_API.post(
    "/api/fm/banner-designer",
    payload
  );

  return response.data;

};

export const updateBannerDesigner = async (id, payload) => {

  const response = await FM_API.put(
    `/api/fm/banner-designer/${id}`,
    payload
  );

  return response.data;

};

export const deleteBannerDesigner = async (id) => {

  const response = await FM_API.delete(
    `/api/fm/banner-designer/${id}`
  );

  return response.data;

};

// =============================================
// Export
// =============================================

export { API };

export default API;