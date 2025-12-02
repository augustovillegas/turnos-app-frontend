/* eslint-env node */
import axios from "axios";
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import process from "node:process";

// Ensure .env is loaded for ESM context
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, "../../.env") });

const sanitizeBaseUrl = (value) =>
  typeof value === "string" ? value.replace(/\/+$/, "") : "";

const getActiveBaseUrl = () => {
  const fromEnv = process.env.VITE_API_BASE_URL || "";
  const candidate = sanitizeBaseUrl(fromEnv);
  if (!candidate) {
    throw new Error(
      "[realBackendSession] Define VITE_API_BASE_URL para las pruebas E2E (sin fallback)."
    );
  }
  return candidate;
};

const ROLE_ENV_VARS = {
  alumno: {
    email: "TEST_E2E_ALUMNO_EMAIL",
    password: "TEST_E2E_ALUMNO_PASSWORD",
  },
  profesor: {
    email: "TEST_E2E_PROFESOR_EMAIL",
    password: "TEST_E2E_PROFESOR_PASSWORD",
  },
  superadmin: {
    email: "TEST_E2E_SUPERADMIN_EMAIL",
    password: "TEST_E2E_SUPERADMIN_PASSWORD",
  },
};

const resolveTimeout = () => {
  const raw = process.env.TEST_E2E_HTTP_TIMEOUT || process.env.VITEST_HTTP_TIMEOUT;
  if (!raw) return 15_000; // reducir default para acelerar fallos en E2E
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : 15_000;
};

const createHttpClient = (token) =>
  axios.create({
    baseURL: getActiveBaseUrl(),
    timeout: resolveTimeout(),
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

const persistSession = ({ token, user }) => {
  if (!token || !user) return;
  if (typeof localStorage === "undefined" || localStorage === null) return;
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
};

export const clearStoredSession = () => {
  if (typeof localStorage !== "undefined" && localStorage !== null) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("turnos");
    localStorage.removeItem("entregas");
    localStorage.removeItem("usuarios");
  }
};

const resolveRoleCredentials = (auth = {}) => {
  if (auth.email && auth.password) {
    return {
      role: auth.role ? String(auth.role).toLowerCase() : undefined,
      email: auth.email,
      password: auth.password,
    };
  }
  const role = String(auth.role || "").toLowerCase();
  const envConfig = ROLE_ENV_VARS[role];
  if (!envConfig) {
    throw new Error(
      `[realBackendSession] No se configuraron credenciales para el rol "${auth.role}".`
    );
  }
  const email = process.env[envConfig.email];
  const password = process.env[envConfig.password];
  if (!email || !password) {
    throw new Error(
      `[realBackendSession] Define ${envConfig.email}/${envConfig.password} en tu entorno para autenticar el rol "${role}".`
    );
  }
  return { role, email, password };
};

export const getApiBaseUrl = () => getActiveBaseUrl();

export const getBackendClient = (token) => createHttpClient(token);

// Cache simple por rol para evitar logins repetidos en cada request de test.
const sessionCache = new Map();
const CACHE_TTL_MS = 5 * 60_000; // 5 minutos

export const resolveAuthSession = async (authConfig, { persist = false } = {}) => {
  if (!authConfig) {
    if (persist) {
      clearStoredSession();
    }
    return null;
  }

  if (typeof authConfig === "string") {
    return resolveAuthSession({ role: authConfig }, { persist });
  }

  if (authConfig.token && authConfig.user) {
    if (persist) {
      persistSession(authConfig);
    }
    return authConfig;
  }

  const { email, password, role } = resolveRoleCredentials(authConfig);
  const cacheKey = `${role}:${email}`;
  const cached = sessionCache.get(cacheKey);
  if (cached && cached.expires > Date.now()) {
    if (persist) persistSession(cached.session);
    return cached.session;
  }
  const client = createHttpClient();
  try {
    const response = await client.post("/auth/login", { email, password });
    const token = response.data?.token;
    const user = response.data?.user;
    if (!token || !user) {
      throw new Error(
        `[realBackendSession] Respuesta inválida al autenticar ${role || email}. Status: ${response.status}, Data: ${JSON.stringify(response.data)}`
      );
    }
    const session = { token, user };
    sessionCache.set(cacheKey, { session, expires: Date.now() + CACHE_TTL_MS });
    if (persist) persistSession(session);
    return session;
  } catch (error) {
    const statusCode = error.response?.status;
    const errorMsg = error.response?.data?.message || error.message;
    throw new Error(
      `[realBackendSession] Auth failed for ${role}/${email}. Status: ${statusCode}, Message: ${errorMsg}`
    );
  }
};
