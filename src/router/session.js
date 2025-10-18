import { redirect } from "react-router-dom";

const ROLE_HOME = {
  alumno: "/dashboard/alumno",
  profesor: "/dashboard/profesor",
  superadmin: "/dashboard/superadmin",
};

const getStorage = () => {
  if (typeof window !== "undefined" && window.localStorage) {
    return window.localStorage;
  }
  if (typeof globalThis !== "undefined" && globalThis.localStorage) {
    return globalThis.localStorage;
  }
  return null;
};

const storage = getStorage();

const safeParse = (value) => {
  if (typeof value !== "string") return null;
  try {
    return JSON.parse(value);
  } catch (error) {
    console.error("[session] Failed to parse stored user", error);
    return null;
  }
};

export const defaultHomeForRole = (role) => ROLE_HOME[role] || "/";

export const getStoredSession = () => {
  if (!storage) return null;
  const token = storage.getItem("token");
  const rawUser = storage.getItem("user");
  if (!token || !rawUser) return null;
  const user = safeParse(rawUser);
  if (!user) return null;
  return { token, user };
};

export const requireAuth = (roles = []) => {
  const session = getStoredSession();
  if (!session) {
    throw redirect("/login");
  }

  const role = session.user?.role;
  if (roles.length > 0 && (!role || !roles.includes(role))) {
    throw redirect(defaultHomeForRole(role));
  }

  return session;
};

export const redirectIfAuthenticated = () => {
  const session = getStoredSession();
  if (session?.user?.role) {
    throw redirect(defaultHomeForRole(session.user.role));
  }
  return null;
};
