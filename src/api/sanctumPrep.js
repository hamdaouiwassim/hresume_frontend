import axios from "axios";
import config from "../config";

const cookieAxios = axios.create({
  baseURL: config.API_ORIGIN,
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

export function createPrepareSpaRequest(apiClient) {
  return async function prepareSpaRequest(force = false) {
    if (!force && apiClient.defaults.headers.common["X-XSRF-TOKEN"]) {
      return;
    }

    await cookieAxios.get("sanctum/csrf-cookie");
    const { data } = await apiClient.get("csrf-token");
    const csrf = data?.csrf_token;
    if (csrf) {
      apiClient.defaults.headers.common["X-XSRF-TOKEN"] = csrf;
    }
  };
}
