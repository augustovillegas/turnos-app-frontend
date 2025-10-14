import axios from "axios";

const FALLBACK_BASE_URL =
  "https://servidor-turnosapp-dip-fullstack.onrender.com";

// Resolve backend base URL prioritising the Vite override.
const sanitizeBaseUrl = (value) =>
  value?.replace(/\/+$/, "") || "";

const baseURL = sanitizeBaseUrl(
  import.meta.env?.VITE_API_BASE_URL || FALLBACK_BASE_URL
);

export const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT automatically if it exists in localStorage.
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
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
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
