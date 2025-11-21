import axios from "axios";

const sanitizeBaseUrl = (value) =>
  typeof value === "string" ? value.replace(/\/+$/, "") : "";

const API_BASE_URL = sanitizeBaseUrl(
  process.env.TEST_E2E_API_BASE_URL ||
    process.env.API_BASE_URL ||
    process.env.VITE_API_BASE_URL ||
    "http://localhost:3000"
);

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

const createHttpClient = (token) =>
  axios.create({
    baseURL: API_BASE_URL,
    timeout: 25_000,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    // Forzar adaptador HTTP de Node para evitar "Network Error" en jsdom
    adapter: "http",
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

export const getApiBaseUrl = () => API_BASE_URL;

export const getBackendClient = (token) => createHttpClient(token);

export const resolveAuthSession = async (
  authConfig,
  { persist = false } = {}
) => {
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
  const client = createHttpClient();
  const response = await client.post("/auth/login", {
    email,
    password,
  });
  const token = response.data?.token;
  const user = response.data?.user;
  if (!token || !user) {
    throw new Error(
      `[realBackendSession] Respuesta inválida al autenticar ${
        role || email
      }.`
    );
  }
  const session = { token, user };
  if (persist) {
    persistSession(session);
  }
  return session;
};
