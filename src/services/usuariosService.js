// === Usuarios Service ===
// Clientes HTTP para usuarios.
import { apiClient } from "./apiClient";
import { ensureModuleLabel } from "../utils/moduleMap";

const RESOURCE = "/usuarios"; // CRUD solo superadmin
const AUTH_RESOURCE = "/auth/usuarios"; // Listado accesible a profesor y superadmin

// Helper para construir body de actualización, reutilizado por endpoints /usuarios y /auth/usuarios
// Solo envía campos presentes; evita mandar strings vacíos que rompen validaciones.
// Cohorte: identificador numérico de camada (NO filtro)
// Modulo: String con enum - CLAVE DE FILTRADO
const buildUpdateBody = (payload = {}) => {
  const moduloLabel = ensureModuleLabel(payload.modulo);

  let cohorteNumber = null;
  const rawCohorte = payload.cohorte;
  if (rawCohorte != null) {
    const n = Number(String(rawCohorte).trim());
    if (Number.isFinite(n)) cohorteNumber = Math.trunc(n);
  }

  const body = {};

  const resolvedName = payload.nombre ?? payload.name;
  if (resolvedName != null) body.nombre = resolvedName;

  const resolvedEmail = payload.email;
  if (resolvedEmail != null) body.email = resolvedEmail;

  const resolvedRole = payload.rol ?? payload.tipo ?? payload.role;
  if (resolvedRole != null) {
    body.rol = resolvedRole;
  }

  const resolvedEstado = payload.estado ?? payload.status;
  if (resolvedEstado != null) {
    body.estado = resolvedEstado;
    body.status = resolvedEstado;
  }

  if (cohorteNumber != null) {
    body.cohorte = cohorteNumber;
  }

  if (payload.identificador !== undefined) {
    body.identificador = payload.identificador;
  }

  if (moduloLabel) body.modulo = moduloLabel;

  if (payload.password) {
    body.password = payload.password;
  }

  return body;
};

// Listado de usuarios sin enriquecimiento automático
// Backend es responsable de retornar campos completos (modulo, cohorte, rol)
export const getUsuarios = async (params = {}) => {
  const response = await apiClient.get(RESOURCE, { params });
  return response?.data ?? [];
};

/** Aprueba usuario pendiente. */
export const approveUsuario = (id) =>
  apiClient.patch(`/auth/aprobar/${id}`).then((response) => response.data);

/** Actualiza estado/status del usuario. */
export const updateUsuarioEstado = (id, estado) =>
  apiClient
    .put(`${RESOURCE}/${id}`, {
      estado,
      status: estado,
    })
    .then((response) => response.data);

/** Crea un usuario (creador admin o registro). */
export const createUsuario = async (payload = {}) => {
  const moduloLabel = ensureModuleLabel(payload.modulo);

  // Resolver cohorte numérico - es solo identificador de camada, NO filtro
  let cohorteNumber = null;
  const rawCohorte = payload.cohorte;
  if (rawCohorte != null) {
    const n = Number(String(rawCohorte).trim());
    if (Number.isFinite(n)) cohorteNumber = Math.trunc(n);
  }

  // Estado canónico (Pendiente/Aprobado/Rechazado) por defecto "Pendiente"
  const estadoCanonico = payload.estado ?? payload.status ?? "Pendiente";

  const data = {
    nombre: payload.nombre ?? payload.name ?? "",
    email: payload.email ?? "",
    password: payload.password,
    rol: payload.rol ?? payload.tipo ?? payload.role ?? "alumno",
    status: estadoCanonico,
    estado: estadoCanonico,
    ...(cohorteNumber != null ? { cohorte: cohorteNumber } : {}),
    ...(moduloLabel ? { modulo: moduloLabel } : {}),
  };

  try {
    const r = await apiClient.post(RESOURCE, data);
    return r?.data;
  } catch (err) {
    // Fallback si no hay permisos suficientes (403)
    if (err?.response?.status === 403) {
      const res = await apiClient.post("/auth/register", data);
      return res?.data;
    }
    throw err;
  }
};

/** Actualiza usuario por ID. */
export const updateUsuario = (id, payload = {}) =>
  apiClient.put(`${RESOURCE}/${id}`, buildUpdateBody(payload)).then((r) => r.data);

// Endpoint alternativo accesible para profesor (auth scope)
export const updateUsuarioAuth = (id, payload = {}) =>
  apiClient.put(`${AUTH_RESOURCE}/${id}`, buildUpdateBody(payload)).then((r) => r.data);

// Eliminar usuario
/** Elimina usuario por ID. */
export const deleteUsuario = (id) =>
  apiClient.delete(`${RESOURCE}/${id}`).then((r) => r.data);
