// === Usuarios Service ===
// Clientes HTTP para usuarios.
import { apiClient } from "./apiClient";
/**
 * Obtiene listado de usuarios.
 * @param {Object} params
 * @param {Object} opciones
 * @returns {Promise<Array>}
 */
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

// Listado de usuarios: priorizar el módulo principal (/usuarios) y completar con /auth/usuarios si faltan campos (cohorte, modulo, rol).
export const getUsuarios = async (params = {}, opciones = {}) => {
  const { preferAuth = false } = opciones;
  const primary = preferAuth ? AUTH_RESOURCE : RESOURCE;
  const secondary = preferAuth ? RESOURCE : AUTH_RESOURCE;

  const fetchList = async (endpoint) => {
    const response = await apiClient.get(endpoint, { params });
    return response?.data ?? [];
  };

  try {
    const primaryList = await fetchList(primary);
    // Si todos los registros traen cohorte/modulo/rol, no hay que pedir más
    const needsEnrichment = Array.isArray(primaryList)
      ? primaryList.some(
          (u) =>
            u?.cohorte == null &&
            u?.cohort == null &&
            (u?.modulo == null || u?.modulo === "") // modulo también es usado para derivar cohorte en UI
        )
      : false;

    if (!needsEnrichment || !secondary) {
      return primaryList;
    }

    // Intentar completar con el endpoint alternativo
    let secondaryList = [];
    try {
      secondaryList = await fetchList(secondary);
    } catch (err) {
      // Si el alternativo falla por permisos, devolver lo que ya tenemos
      if (err?.response?.status === 403) return primaryList;
      throw err;
    }

    const byKey = (u) =>
      String(u?._id || u?.id || u?.email || "").toLowerCase().trim();

    const secondaryMap = new Map(
      (secondaryList || []).map((u) => [byKey(u), u])
    );

    return (primaryList || []).map((u) => {
      const key = byKey(u);
      const alt = secondaryMap.get(key);
      if (!alt) return u;
      // Completar solo los campos faltantes para no pisar datos
      return {
        ...u,
        ...(u.cohorte == null && u.cohort == null
          ? {
              cohorte: alt.cohorte ?? alt.cohort ?? u.cohorte ?? u.cohort ?? null,
              cohort: alt.cohort ?? alt.cohorte ?? u.cohort ?? u.cohorte ?? null,
            }
          : {}),
        ...(u.modulo == null && alt.modulo != null ? { modulo: alt.modulo } : {}),
        ...(u.rol == null && alt.rol != null ? { rol: alt.rol } : {}),
        ...(u.role == null && alt.role != null ? { role: alt.role } : {}),
      };
    });
  } catch (error) {
    // Fallback de permisos: si el endpoint elegido no está autorizado, intentar el alternativo directo
    const status = error?.response?.status;
    if (secondary && status === 403) {
      const response = await apiClient.get(secondary, { params });
      return response?.data ?? [];
    }
    throw error;
  }
};

/** Aprueba usuario pendiente. */
export const approveUsuario = (id) =>
  apiClient
    .patch(`/auth/aprobar/${id}`)
    .then((response) => response.data);

/** Actualiza estado/status del usuario. */
export const updateUsuarioEstado = (id, estado) =>
  apiClient
    .put(`${RESOURCE}/${id}`, {
      estado,
      status: estado,
    })
    .then((response) => response.data);

// Crear usuario (registro). Se asume endpoint público/privado existente.
// Usa /auth/register si se maneja registro con autenticación.
/** Crea un usuario (o registra fallback). */
export const createUsuario = async (payload = {}) => {
  const moduloLabel = sanitizeModuleLabel(payload.modulo ?? payload.module);

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

  // Canonical payload: preferir claves actuales del backend (name/status)
  const baseName = payload.nombre ?? payload.name ?? "";
  const data = {
    name: baseName,
    nombre: baseName, // compatibilidad con despliegues legacy
    email: payload.email ?? "",
    password: payload.password, // validada por el formulario
    rol: payload.rol ?? payload.tipo ?? payload.role ?? "alumno",
    role: payload.rol ?? payload.tipo ?? payload.role ?? "alumno",
    status: estadoCanonico,
    estado: estadoCanonico, // compatibilidad
    ...(cohortNumber != null ? { cohorte: cohortNumber, cohort: cohortNumber } : {}),
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
    // Fallback solo si el endpoint no existe (404)
    if (status === 404) {
      const registerPayload = {
        nombre: data.nombre,
        email: data.email,
        password: data.password,
        rol: data.rol,
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

/** Actualiza usuario por ID. */
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
/** Elimina usuario por ID. */
export const deleteUsuario = (id) =>
  apiClient.delete(`${RESOURCE}/${id}`).then((r) => r.data);
