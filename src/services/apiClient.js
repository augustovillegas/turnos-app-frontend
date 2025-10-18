import axios from "axios";

const DEV_BASE_URL = "http://localhost:3000";
const PROD_BASE_URL =
  import.meta.env?.VITE_PROD_API_BASE_URL ||
  "https://servidor-turnosapp-dip-fullstack.onrender.com/";

const sanitizeBaseUrl = (value) =>
  typeof value === "string" ? value.replace(/\/+$/, "") : "";

const resolveBaseUrl = () => {
  const explicit = sanitizeBaseUrl(import.meta.env?.VITE_API_BASE_URL);
  if (explicit) return explicit;

  const isDevEnv =
    typeof import.meta !== "undefined" &&
    import.meta.env &&
    (import.meta.env.DEV === true ||
      String(import.meta.env.MODE).toLowerCase() === "development");

  const fallback = isDevEnv ? DEV_BASE_URL : PROD_BASE_URL;
  return sanitizeBaseUrl(fallback);
};

const baseURL = resolveBaseUrl();

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

const normalizeRequestPath = (url) => {
  if (!url) return "";
  try {
    const parsed = new URL(url, baseURL || DEV_BASE_URL);
    return parsed.pathname || "";
  } catch {
    return url;
  }
};

const shouldRedirectOn401 = (error) => {
  if (error?.response?.status !== 401) {
    return false;
  }

  const hasStoredToken = Boolean(storage?.getItem("token"));
  const hadAuthHeader = Boolean(error?.config?.headers?.Authorization);
  const path = normalizeRequestPath(error?.config?.url);
  const publicAuthRoutes = ["/auth/login", "/auth/register", "/auth/forgot"];

  if (publicAuthRoutes.some((route) => path.startsWith(route))) {
    return false;
  }

  return hasStoredToken && hadAuthHeader;
};

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
    if (shouldRedirectOn401(error)) {
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
