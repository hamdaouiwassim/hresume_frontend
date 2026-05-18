const raw = (import.meta.env.VITE_API_URL || "").trim();
const API_URL = raw.endsWith("/") ? raw : `${raw}/`;
const API_ORIGIN = API_URL.replace(/\/?api\/$/i, "/");

/** "default" | "compact" — shorter hero copy from translations */
const LANDING_HERO_VARIANT = (import.meta.env.VITE_LANDING_HERO_VARIANT || "default")
  .trim()
  .toLowerCase();

/** YouTube watch URL or embed URL; empty = no iframe (placeholder UI on welcome) */
const WALKTHROUGH_VIDEO_URL = (import.meta.env.VITE_WALKTHROUGH_VIDEO_URL || "").trim();

/** Landing page product walkthrough block (see docs/hidden-sections/product-walkthrough.md) */
const SHOW_WALKTHROUGH_SECTION =
  (import.meta.env.VITE_SHOW_WALKTHROUGH_SECTION || "").trim().toLowerCase() === "true";

const config = {
  API_URL,
  API_ORIGIN,
  LANDING_HERO_VARIANT,
  WALKTHROUGH_VIDEO_URL,
  SHOW_WALKTHROUGH_SECTION,
};

export default config;
