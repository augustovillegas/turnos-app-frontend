import axios from "axios";

// =========================================
// Configuración base de la API
// =========================================

// Usa la variable de entorno definida en `.env`
const sanitizarUrlBase = (valor) =>
  typeof valor === "string" ? valor.replace(/\/+$/, "") : "";

// Lee la URL desde las variables de entorno de Vite
const urlBase = sanitizarUrlBase(import.meta.env.VITE_API_BASE_URL);

// Si no existe la variable, lanza un aviso
if (!urlBase) {
  console.warn(
    "[apiClient] ⚠️ No se encontró VITE_API_BASE_URL en las variables de entorno."
  );
}

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
