import axios from "axios";

/**
 * Cliente HTTP centralizado para la aplicación.
 * Se conecta directamente al servidor desplegado en Render.
 * 
 * Si existe la variable de entorno VITE_API_URL, se usará como prioridad.
 * En caso contrario, usará la URL de Render por defecto.
 */

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL;

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Interceptor de solicitudes
 * Agrega automáticamente el token JWT si está guardado en localStorage.
 */
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

/**
 * Interceptor de respuestas
 * Maneja errores comunes (401, 403, etc.) de forma uniforme.
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("[apiClient] Sesión expirada o token inválido");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

