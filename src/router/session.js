import { redirect } from "react-router-dom";

const INICIO_POR_ROL = {
  alumno: "/dashboard/alumno",
  profesor: "/dashboard/profesor",
  superadmin: "/dashboard/superadmin",
};

const obtenerStorage = () => {
  if (typeof window !== "undefined" && window.localStorage) {
    return window.localStorage;
  }
  if (typeof globalThis !== "undefined" && globalThis.localStorage) {
    return globalThis.localStorage;
  }
  return null;
};

const storage = obtenerStorage();

const parseoSeguro = (valor) => {
  if (typeof valor !== "string") return null;
  try {
    return JSON.parse(valor);
  } catch (error) {
    console.error("[session] No se pudo interpretar el usuario", error);
    return null;
  }
};

export const rutaInicioPorRol = (rol) => INICIO_POR_ROL[rol] || "/";

export const obtenerSesionAlmacenada = () => {
  if (!storage) return null;
  const token = storage.getItem("token");
  const usuarioPlano = storage.getItem("user");
  if (!token || !usuarioPlano) return null;
  const usuario = parseoSeguro(usuarioPlano);
  if (!usuario) return null;
  return { token, user: usuario };
};

export const requerirAutenticacion = (roles = []) => {
  const sesion = obtenerSesionAlmacenada();
  if (!sesion) {
    throw redirect("/login");
  }

  const rol = sesion.user?.role;
  if (roles.length > 0 && (!rol || !roles.includes(rol))) {
    throw redirect(rutaInicioPorRol(rol));
  }

  return sesion;
};

export const redirigirSiAutenticado = () => {
  const sesion = obtenerSesionAlmacenada();
  if (sesion?.user?.role) {
    throw redirect(rutaInicioPorRol(sesion.user.role));
  }
  return null;
};
