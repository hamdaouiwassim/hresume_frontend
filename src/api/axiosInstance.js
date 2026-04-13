import axios from "axios";
import { toast } from "sonner";
import config from "../config";
import { createPrepareSpaRequest } from "./sanctumPrep";

const axiosInstance = axios.create({
  baseURL: config.API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

export const prepareSpaRequest = createPrepareSpaRequest(axiosInstance);

axiosInstance.interceptors.request.use(
  async (req) => {
    const method = (req.method || "get").toLowerCase();
    if (["post", "put", "patch", "delete"].includes(method)) {
      const skipCsrf =
        req.url?.includes("csrf-token") || req.headers?.["X-Skip-Csrf-Prep"];
      if (!skipCsrf && !req.headers["X-XSRF-TOKEN"]) {
        await prepareSpaRequest(false);
      }
    }

    const token = localStorage.getItem("token");
    if (token) {
      req.headers.Authorization = `Bearer ${token}`;
    }
    if (req.data instanceof FormData) {
      delete req.headers["Content-Type"];
    }
    return req;
  },
  (error) => Promise.reject(error)
);

const formatValidationErrors = (errors) => {
  if (!errors || typeof errors !== "object") {
    return [];
  }

  const errorMessages = [];
  Object.keys(errors).forEach((field) => {
    const fieldErrors = Array.isArray(errors[field])
      ? errors[field]
      : [errors[field]];
    fieldErrors.forEach((errorMsg) => {
      if (errorMsg) {
        const fieldLabel = field
          .replace(/_/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase());
        errorMessages.push(`${fieldLabel}: ${errorMsg}`);
      }
    });
  });

  return errorMessages;
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      const { status, data } = error.response;
      const reqUrl = error.config?.url || "";

      if (status === 419 && !error.config?._csrfRetry) {
        delete axiosInstance.defaults.headers.common["X-XSRF-TOKEN"];
        try {
          await prepareSpaRequest(true);
          const retryConfig = {
            ...error.config,
            _csrfRetry: true,
          };
          return axiosInstance.request(retryConfig);
        } catch {
          return Promise.reject(error);
        }
      }

      if (status === 401) {
        const isSilentAuthCheck =
          reqUrl.includes("/me") || reqUrl.endsWith("me");
        localStorage.removeItem("token");
        if (!isSilentAuthCheck) {
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }

      if (status === 422) {
        const errorData = data || {};
        const errors = errorData.errors || {};
        const message = errorData.message || "Validation failed";

        const formattedErrors = formatValidationErrors(errors);

        if (formattedErrors.length > 0) {
          if (formattedErrors.length === 1) {
            toast.error(formattedErrors[0], {
              duration: 5000,
            });
          } else {
            const errorList = formattedErrors
              .map((err, idx) => `${idx + 1}. ${err}`)
              .join("\n");
            toast.error(message, {
              description: errorList,
              duration: 6000,
            });
          }
        } else {
          toast.error(
            message || "Validation failed. Please check your input.",
            {
              duration: 5000,
            }
          );
        }
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
