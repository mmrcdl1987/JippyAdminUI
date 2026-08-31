import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const API = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

const FM_API = axios.create({
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

  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  return config;
};

const responseInterceptor = (response) => response;

const errorInterceptor = (error) => {
  if (error.response) {
    const isProductNotFoundError = 
      error.response.status === 404 && 
      error.config?.url?.includes("/api/fm/products/outlets/");

    if (isProductNotFoundError) {
      return Promise.resolve(error.response);
    }

    switch (error.response.status) {
      case 401:
        localStorage.clear();
        window.location.href = "/login";
        break;
      case 403:
<<<<<<< HEAD
        console.warn("API 403 Forbidden: Access Denied");
=======
        alert("Access Denied");
>>>>>>> 58bcec160de07627f468f5c20d960241d842ba41
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

API.interceptors.request.use(requestInterceptor, errorInterceptor);
FM_API.interceptors.request.use(requestInterceptor, errorInterceptor);
API.interceptors.response.use(responseInterceptor, errorInterceptor);
FM_API.interceptors.response.use(responseInterceptor, errorInterceptor);

// =============================================
// Banner Designer API Export
// =============================================
export const getBannerDesignerData = async () => {
  try {
    const response = await FM_API.get("/api/fm/banner-designer"); 
    return response.data;
  } catch (error) {
    console.error("Error fetching banner designer data:", error);
    throw error;
  }
};

// Upload / Update Banner Images API Function with explicit full path
export const uploadBannerImages = async (outletSubscriptionPlanId, updatedBy, formData) => {
  try {
    const response = await FM_API.post("/api/fm/outlet-subscription-plans/upload-banners", formData, {
      params: {
        outletSubscriptionPlanId,
        updatedBy,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error uploading banner images:", error);
    throw error;
  }
};

export { API, FM_API };
export default API;