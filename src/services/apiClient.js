import axios from "axios";

const DEFAULT_DEV_BASE_URL = "http://localhost:3000";
const DEFAULT_PROD_BASE_URL =
  import.meta.env?.VITE_PROD_API_BASE_URL ||
  "https://servidor-turnosapp-dip-fullstack.onrender.com/";

// Resolve backend base URL prioritising the Vite override.
const sanitizeBaseUrl = (value) =>
  value?.replace(/\/+$/, "") || "";

const baseURL = sanitizeBaseUrl(
  import.meta.env?.VITE_API_BASE_URL ||
    (import.meta.env?.DEV ? DEFAULT_DEV_BASE_URL : DEFAULT_PROD_BASE_URL)
);

export const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

const getStorage = () => {
  if (typeof globalThis !== "undefined" && globalThis.localStorage) {
    return globalThis.localStorage;
  }
  if (typeof window !== "undefined" && window.localStorage) {
    return window.localStorage;
  }
  return null;
};

const storage = getStorage();

// Attach JWT automatically if it exists in localStorage.
apiClient.interceptors.request.use(
  (config) => {
    const token = storage?.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Uniformly handle common auth errors.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("[apiClient] Sesion expirada o token invalido");
      storage?.removeItem("token");
      storage?.removeItem("user");
      if (typeof window !== "undefined" && window.location) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);
