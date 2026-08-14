const DEFAULT_DEV = "http://localhost:5001/api";
const DEFAULT_PROD = "https://kartapi.shieldxkart.com/api";

export const API_URL = String(
  import.meta.env.VITE_API_URL || (import.meta.env.PROD ? DEFAULT_PROD : DEFAULT_DEV)
)
  .trim()
  .replace(/\/+$/, "");

export const API_ORIGIN = API_URL.replace(/\/api(?:\/v1)?$/i, "") || API_URL;

export const SOCKET_URL = API_ORIGIN;
