import axios from "axios";
import config from "../config";

// Create instance
const axiosInstance = axios.create({
  baseURL: config.API_URL, // change to your API URL
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor: add token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // store token after login
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Remove Content-Type for FormData to let browser set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or unauthorized
      localStorage.removeItem("token");
      window.location.href = "/login"; // redirect to login
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
