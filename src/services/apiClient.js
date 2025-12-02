import axios from "axios";

// =========================================
// Configuración base de la API
// =========================================

// Utilidades de URL base (robusto en Vite, Node y navegador)
const sanitizarUrlBase = (valor) =>
  typeof valor === "string" ? valor.replace(/\/+$/, "") : "";

const leerVarEntorno = (key) => {
  // Preferir Vite env cuando este disponible (reemplazado en build time)
  const viteEnv =
    typeof import.meta !== "undefined" && import.meta?.env ? import.meta.env : undefined;
  if (viteEnv && typeof viteEnv[key] === "string") return viteEnv[key];

  // Compatibilidad con Node (tests/scripts) sin depender de "process" global
  const nodeEnv =
    typeof globalThis !== "undefined" && globalThis.process?.env
      ? globalThis.process.env
      : undefined;
  if (nodeEnv && nodeEnv[key]) {
    return nodeEnv[key];
  }

  // Permitir override en runtime (util en integraciones E2E)
  if (typeof globalThis !== "undefined" && globalThis[key]) return globalThis[key];
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
  async (error) => {
    if (debeRedirigirPor401(error)) {
      console.warn("[apiClient] Sesión expirada o token inválido");
      almacenamiento?.removeItem("token");
      almacenamiento?.removeItem("user");
      if (typeof window !== "undefined" && window.location) {
        window.location.href = "/login";
      }
    }
    // Retry simple para métodos idempotentes (GET) si VITE_API_RETRY>0
    const maxRetriesRaw = leerVarEntorno("VITE_API_RETRY");
    const maxRetries = Number(maxRetriesRaw) || 0;
    const config = error.config || {};
    if (maxRetries > 0 && config.method === 'get') {
      config.__retryCount = config.__retryCount || 0;
      if (config.__retryCount < maxRetries) {
        config.__retryCount += 1;
        const delayMs = 300 * config.__retryCount; // backoff lineal simple
        await new Promise(r => setTimeout(r, delayMs));
        return apiClient(config);
      }
    }
    return Promise.reject(error);
  }
);

// Helper opcional para usar AbortController con solicitudes manuales.
export const apiGetWithAbort = (url, config = {}) => {
  const controller = new AbortController();
  const promise = apiClient.get(url, { ...config, signal: controller.signal });
  return { promise, abort: () => controller.abort() };
};

