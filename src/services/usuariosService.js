// === Usuarios Service ===
// Clientes HTTP para usuarios.
import { apiClient } from "./apiClient";
import {
  MODULE_OPTIONS,
  ensureModuleLabel,
  labelToModule,
} from "../utils/moduleMap";

const RESOURCE = "/usuarios"; // CRUD solo superadmin
const AUTH_RESOURCE = "/auth/usuarios"; // Listado accesible a profesor y superadmin
const MODULE_LABEL_FALLBACK = MODULE_OPTIONS[0]?.label ?? "HTML-CSS";
const sanitizeModuleLabel = (value) =>
  ensureModuleLabel(value ?? null) ?? MODULE_LABEL_FALLBACK;

// Listado de usuarios: se intenta endpoint de auth primero (más permisivo)
export const getUsuarios = (params = {}, opciones = {}) => {
  const { preferAuth = true } = opciones;
  const target = preferAuth ? AUTH_RESOURCE : RESOURCE;
  return apiClient
    .get(target, { params })
    .then((response) => response.data ?? [])
    .catch((error) => {
      // Fallback: si se usó auth y falló por permisos y se solicitó fallback
      const status = error?.response?.status;
      if (preferAuth && status === 403) {
        return apiClient
          .get(RESOURCE, { params })
          .then((r) => r.data ?? []);
      }
      throw error;
    });
};

export const approveUsuario = (id) =>
  apiClient
    .patch(`/auth/aprobar/${id}`)
    .then((response) => response.data);

export const updateUsuarioEstado = (id, estado) =>
  apiClient
    .put(`${RESOURCE}/${id}`, {
      estado,
      status: estado,
    })
    .then((response) => response.data);

// Crear usuario (registro). Se asume endpoint público/privado existente.
// Usa /auth/register si se maneja registro con autenticación.
export const createUsuario = async (payload = {}) => {
  const moduloLabel = ensureModuleLabel(payload.modulo ?? payload.module)
    ? sanitizeModuleLabel(payload.modulo ?? payload.module)
    : null;

  // Resolver cohorte numérico (prioriza valor explícito, luego derivado de módulo)
  let cohortNumber = null;
  const rawCohort = payload.cohorte ?? payload.cohort;
  if (rawCohort != null) {
    const n = Number(String(rawCohort).trim());
    if (Number.isFinite(n)) cohortNumber = Math.trunc(n);
  }
  if (cohortNumber == null && moduloLabel) {
    const fromModule = labelToModule(moduloLabel);
    if (fromModule != null) cohortNumber = fromModule;
  }

  // Estado canónico (Pendiente/Aprobado/Rechazado) por defecto usar "Pendiente"
  const estadoCanonico = payload.estado ?? payload.status ?? "Pendiente";

  const data = {
    name: payload.nombre ?? payload.name ?? "",
    email: payload.email ?? "",
    password: payload.password, // Debe venir validada desde el formulario
    role: payload.rol ?? payload.tipo ?? payload.role ?? "alumno",
    rol: payload.rol ?? payload.role ?? payload.tipo ?? "alumno",
    tipo: payload.tipo ?? payload.rol ?? payload.role ?? "alumno",
    estado: estadoCanonico,
    status: estadoCanonico,
    ...(cohortNumber != null ? { cohort: cohortNumber, cohorte: cohortNumber } : {}),
    ...(moduloLabel ? { modulo: moduloLabel } : {}),
  };

  // Preferir endpoint de gestión admin cuando hay token (superadmin)
  const endpoint = "/usuarios";
  const resolveByEmail = async (email) => {
    try {
      const list = await getUsuarios({}, { preferAuth: true });
      return list.find((u) => String(u.email || "").toLowerCase() === String(email).toLowerCase());
    } catch {
      return undefined;
    }
  };
  try {
    const r = await apiClient.post(endpoint, data);
    const created = r?.data;
    if (created?.id || created?._id) return created;
    const found = await resolveByEmail(data.email);
    if (found) return found;
    return created;
  } catch (err) {
    const status = err?.response?.status;
    if (status === 400 || status === 404 || status === 403) {
      // Fallback a registro autenticado si el endpoint admin no acepta el formato
      const registerPayload = {
        nombre: payload.nombre ?? payload.name ?? data.name,
        email: data.email,
        password: data.password,
        rol: payload.rol ?? payload.role ?? payload.tipo ?? data.role,
        tipo: payload.tipo ?? payload.rol ?? payload.role ?? data.role,
        ...(data.cohorte != null ? { cohorte: data.cohorte } : {}),
        ...(data.modulo ? { modulo: data.modulo } : {}),
      };
      const res = await apiClient.post("/auth/register", registerPayload);
      const created = res?.data;
      if (created?.id || created?._id) return created;
      const found = await resolveByEmail(data.email);
      if (found) return found;
      return created;
    }
    throw err;
  }
};

export const updateUsuario = (id, payload = {}) => {
  const moduloLabel = ensureModuleLabel(payload.modulo ?? payload.module)
    ? sanitizeModuleLabel(payload.modulo ?? payload.module)
    : null;

  // Derivar número de cohorte (prioriza campo explícito, luego módulo)
  let cohortNumber = null;
  const rawCohort = payload.cohorte ?? payload.cohort;
  if (rawCohort != null) {
    const n = Number(String(rawCohort).trim());
    if (Number.isFinite(n)) cohortNumber = Math.trunc(n);
  }
  if (cohortNumber == null && moduloLabel) {
    const fromModule = labelToModule(moduloLabel);
    if (fromModule != null) cohortNumber = fromModule;
  }

  const body = {
    name: payload.nombre ?? payload.name ?? "",
    email: payload.email ?? "",
    role: payload.rol ?? payload.tipo ?? payload.role ?? "alumno",
    ...(cohortNumber != null ? { cohort: cohortNumber, cohorte: cohortNumber } : {}),
    ...(payload.identificador !== undefined ? { identificador: payload.identificador } : {}),
    ...(moduloLabel ? { modulo: moduloLabel } : {}),
    ...(payload.password ? { password: payload.password } : {}),
  };

  return apiClient.put(`${RESOURCE}/${id}`, body).then((r) => r.data);
};

// Eliminar usuario
export const deleteUsuario = (id) =>
  apiClient.delete(`${RESOURCE}/${id}`).then((r) => r.data);
