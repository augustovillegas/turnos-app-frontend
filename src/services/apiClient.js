// =======================
// API CLIENT CONFIGURATION
// =======================
// Este archivo configura la conexion automatica con el servidor de Render.
// Si Render no responde en 60 segundos, cambia al backend local.

import axios from "axios";

export const RENDER_URL =
  "https://servidor-turnosapp-dip-fullstack.onrender.com";
export const LOCAL_URL = "http://localhost:5000";
const DIAL_UP_TIMEOUT_MS = 60000;
const API_PREFIX = "/api";

let serverBaseURL = RENDER_URL;
let apiBaseURL = `${serverBaseURL}${API_PREFIX}`;

export const apiClient = axios.create({
  baseURL: apiBaseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

const applyBaseURL = (nextServerBaseURL) => {
  serverBaseURL = nextServerBaseURL;
  apiBaseURL = `${nextServerBaseURL}${API_PREFIX}`;
  apiClient.defaults.baseURL = apiBaseURL;
};

// =======================
// Funcion: Verifica conexion con Render
// =======================
export async function checkServerConnection() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DIAL_UP_TIMEOUT_MS);

  try {
    const response = await fetch(`${RENDER_URL}/api/auth/ping`, {
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(
        `Ping a Render respondio con estado ${response.status ?? "desconocido"}`
      );
    }

    applyBaseURL(RENDER_URL);
    console.log("[dial-up] Conectado a Render");
  } catch (error) {
    console.warn(
      "[dial-up] Render no respondio en 60s. Usando localhost.",
      error
    );
    applyBaseURL(LOCAL_URL);
  } finally {
    clearTimeout(timeoutId);
  }

  return serverBaseURL;
}

export const withLatency = (promise, delayMs = 0) => {
  if (!delayMs) {
    return promise;
  }

  return Promise.all([
    promise,
    new Promise((resolve) => setTimeout(resolve, delayMs)),
  ]).then(([result]) => result);
};

export default apiClient;
