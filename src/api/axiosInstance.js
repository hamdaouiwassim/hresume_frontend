import axios from "axios";
import { toast } from "sonner";
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

// Helper function to format validation errors
const formatValidationErrors = (errors) => {
  if (!errors || typeof errors !== 'object') {
    return [];
  }
  
  const errorMessages = [];
  Object.keys(errors).forEach((field) => {
    const fieldErrors = Array.isArray(errors[field]) ? errors[field] : [errors[field]];
    fieldErrors.forEach((errorMsg) => {
      if (errorMsg) {
        // Format: "Field name: error message"
        const fieldLabel = field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        errorMessages.push(`${fieldLabel}: ${errorMsg}`);
      }
    });
  });
  
  return errorMessages;
};

// Response interceptor: handle errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      
      // Handle 401 Unauthorized
      if (status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login"; // redirect to login
        return Promise.reject(error);
      }
      
      // Handle 422 Validation Errors
      if (status === 422) {
        const errorData = data || {};
        const errors = errorData.errors || {};
        const message = errorData.message || "Validation failed";
        
        // Format validation errors for toast
        const formattedErrors = formatValidationErrors(errors);
        
        if (formattedErrors.length > 0) {
          // Show first error as main message, and list all errors
          if (formattedErrors.length === 1) {
            toast.error(formattedErrors[0], {
              duration: 5000,
            });
          } else {
            // Show main message and list all errors in description
            // Create a formatted list of errors
            const errorList = formattedErrors.map((err, idx) => `${idx + 1}. ${err}`).join('\n');
            toast.error(message, {
              description: errorList,
              duration: 6000,
            });
          }
        } else {
          // Fallback to general message if no formatted errors
          toast.error(message || "Validation failed. Please check your input.", {
            duration: 5000,
          });
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
