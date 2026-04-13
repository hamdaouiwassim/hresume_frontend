const raw = (import.meta.env.VITE_API_URL || "").trim();
const API_URL = raw.endsWith("/") ? raw : `${raw}/`;
const API_ORIGIN = API_URL.replace(/\/?api\/$/i, "/");

const config = {
  API_URL,
  API_ORIGIN,
};

export default config;
