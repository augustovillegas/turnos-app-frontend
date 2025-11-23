import axios from "axios";

// =========================================
// Configuración base de la API
// =========================================

// Utilidades de URL base (robusto en Vite, Node y navegador)
const sanitizarUrlBase = (valor) =>
  typeof valor === "string" ? valor.replace(/\/+$/, "") : "";

const leerVarEntorno = (key) => {
  try {
    // Preferir Vite env cuando esté disponible
    // NOTA: en bundlers, Vite reemplaza import.meta.env en build time
    const viteEnv = typeof import.meta !== "undefined" ? import.meta.env : undefined;
    if (viteEnv && typeof viteEnv[key] === "string") return viteEnv[key];
  } catch {}
  try {
    // Compatibilidad con Node (tests/scripts)
    if (typeof process !== "undefined" && process.env && process.env[key]) {
      return process.env[key];
    }
  } catch {}
  try {
    // Permitir override en runtime (útil en integraciones E2E)
    if (typeof globalThis !== "undefined" && globalThis[key]) return globalThis[key];
  } catch {}
  return undefined;
};

const resolverBaseUrl = () => {
  const candidates = [
    leerVarEntorno("VITE_API_BASE_URL"),
  ].map(sanitizarUrlBase);

  let elegido = candidates.find((v) => v);

  if (!elegido) {
    // Fallback razonable: mismo origen (útil en dev proxies)
    if (typeof window !== "undefined" && window.location?.origin) {
      elegido = sanitizarUrlBase(window.location.origin);
      console.warn(
        "[apiClient] ⚠️ Usando origin del navegador como baseURL:", elegido
      );
    } else {
      console.warn(
        "[apiClient] ⚠️ No se encontró VITE_API_BASE_URL ni origin del navegador. Usando baseURL relativa."
      );
      elegido = ""; // relativa
    }
  }

  return elegido;
};

let urlBase = resolverBaseUrl();

// Permitir override programático en tiempo de ejecución (tests/e2e)
export const setApiBaseUrl = (nuevoBaseUrl) => {
  urlBase = sanitizarUrlBase(nuevoBaseUrl);
  apiClient.defaults.baseURL = urlBase;
};

// Crea el cliente Axios configurado
export const apiClient = axios.create({
  baseURL: urlBase,
  headers: {
    "Content-Type": "application/json",
  },
});

// =========================================
// Manejo de almacenamiento local
// =========================================
const obtenerStorage = () => {
  if (typeof globalThis !== "undefined" && globalThis.localStorage) {
    return globalThis.localStorage;
  }
  if (typeof window !== "undefined" && window.localStorage) {
    return window.localStorage;
  }
  return null;
};

const almacenamiento = obtenerStorage();

// =========================================
// Utilidades internas
// =========================================
const normalizarRutaSolicitud = (url) => {
  if (!url) return "";
  try {
    const analizada = new URL(url, urlBase);
    return analizada.pathname || "";
  } catch {
    return url;
  }
};

const debeRedirigirPor401 = (error) => {
  if (error?.response?.status !== 401) {
    return false;
  }

  const existeToken = Boolean(almacenamiento?.getItem("token"));
  const teniaHeaderAuth = Boolean(error?.config?.headers?.Authorization);
  const ruta = normalizarRutaSolicitud(error?.config?.url);
  const rutasPublicas = ["/auth/login", "/auth/register", "/auth/forgot"];

  if (rutasPublicas.some((target) => ruta.startsWith(target))) {
    return false;
  }

  return existeToken && teniaHeaderAuth;
};

// =========================================
// Interceptores
// =========================================

// Adjunta el JWT automáticamente
apiClient.interceptors.request.use(
  (config) => {
    const token = almacenamiento?.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Manejo uniforme de errores 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (debeRedirigirPor401(error)) {
      console.warn("[apiClient] Sesión expirada o token inválido");
      almacenamiento?.removeItem("token");
      almacenamiento?.removeItem("user");
      if (typeof window !== "undefined" && window.location) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);
