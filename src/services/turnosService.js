// === Turnos Service ===
// Clientes HTTP para CRUD de turnos (slots).
import { apiClient } from "./apiClient";

const RESOURCE = "/slots";

const normalizeFechaIso = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) {
    return date.toISOString().slice(0, 10);
  }
  if (typeof value === "string" && value.includes("/")) {
    const [dd, mm, yyyy] = value.split("/").map(Number);
    if (dd && mm && yyyy) {
      return new Date(yyyy, mm - 1, dd).toISOString().slice(0, 10);
    }
  }
  return null;
};

/**
 * Construye el payload del turno con los campos vigentes del backend.
 * @param {Object} payload
 * @param {Object} options
 * @param {boolean} options.includeDefaults
 * @returns {Object}
 */
const mapTurnoPayload = (payload = {}, options = {}) => {
  const { includeDefaults = false } = options;
  const result = {};

  const resolvedReview = payload.reviewNumber ?? payload.review;
  const reviewNumber = resolvedReview != null ? Number(resolvedReview) : undefined;
  if (!Number.isNaN(reviewNumber)) {
    result.reviewNumber = reviewNumber;
  } else if (includeDefaults) {
    result.reviewNumber = 1;
  }

  const fechaIso = normalizeFechaIso(payload.fecha ?? payload.start ?? payload.end);
  if (fechaIso) {
    result.fecha = fechaIso;
  } else if (includeDefaults) {
    result.fecha = "";
  }

  if (payload.horario !== undefined) {
    result.horario = payload.horario;
  }

  if (payload.sala !== undefined) {
    const salaNum = Number(String(payload.sala).trim());
    result.sala = Number.isFinite(salaNum) && salaNum > 0 ? salaNum : payload.sala;
  } else if (includeDefaults) {
    result.sala = 1;
  }

  if (payload.zoomLink !== undefined) {
    result.zoomLink = payload.zoomLink?.trim?.() ?? payload.zoomLink;
  }

  if (payload.start !== undefined) result.start = payload.start;
  if (payload.end !== undefined) result.end = payload.end;

  try {
    const deriveHM = (iso) => new Date(iso).toISOString().slice(11, 16);
    if (payload.start && !payload.startTime) {
      result.startTime = deriveHM(payload.start);
    }
    if (payload.end && !payload.endTime) {
      result.endTime = deriveHM(payload.end);
    }
  } catch {
    // Ignorar derivación fallida de start/end time
  }

  if (payload.comentarios !== undefined || payload.comment !== undefined) {
    result.comentarios = payload.comentarios ?? payload.comment ?? "";
  }

  const resolvedEstado = payload.estado ?? payload.reviewStatus;
  if (resolvedEstado !== undefined) {
    result.estado = resolvedEstado;
  } else if (includeDefaults) {
    result.estado = "Disponible";
  }
  if (payload.reviewStatus !== undefined) {
    result.reviewStatus = payload.reviewStatus;
  }

  if (payload.titulo !== undefined || payload.title !== undefined) {
    result.titulo = payload.titulo ?? payload.title ?? "";
  }
  if (payload.descripcion !== undefined || payload.description !== undefined) {
    result.descripcion = payload.descripcion ?? payload.description ?? "";
  }

  if (payload.modulo !== undefined) {
    result.modulo = payload.modulo;
  }

  if (payload.cohorte !== undefined) {
    const parsed = Number(payload.cohorte);
    if (Number.isFinite(parsed)) {
      result.cohorte = Math.trunc(parsed);
    }
  }

  return result;
};

/**
 * Lista turnos/slots.
 * @param {Object} params
 * @returns {Promise<Array>}
 */
export const getTurnos = (params = {}) =>
  apiClient.get(RESOURCE, { params }).then((response) => response.data ?? []);

// Alias para compatibilidad (antes en slotsService)
export const getSlots = getTurnos;

/**
 * Obtiene turno por ID.
 * @param {string|number} id
 * @returns {Promise<Object>}
 */
export const getTurnoById = (id) =>
  apiClient.get(`${RESOURCE}/${id}`).then((response) => response.data);

/**
 * Crea un turno.
 * @param {Object} payload
 * @returns {Promise<Object>}
 */
export const createTurno = (payload) => {
  const mapped = mapTurnoPayload(payload, { includeDefaults: true });
  return apiClient.post(RESOURCE, mapped).then((response) => response.data);
};

/**
 * Actualiza un turno.
 * @param {string|number} id
 * @param {Object} payload
 * @returns {Promise<Object>}
 */
export const updateTurno = (id, payload) =>
  apiClient.put(`${RESOURCE}/${id}`, mapTurnoPayload(payload)).then((response) => response.data);

/**
 * Elimina un turno.
 * @param {string|number} id
 * @returns {Promise<any>}
 */
export const deleteTurno = (id) =>
  apiClient.delete(`${RESOURCE}/${id}`).then((response) => response.data);

// === Operaciones de slots (alumno) ===

/** Solicita un slot como alumno. */
export const solicitarSlot = (id) =>
  apiClient.patch(`${RESOURCE}/${id}/solicitar`).then((r) => r.data);

/** Cancela solicitud de slot. */
export const cancelarSlot = (id) =>
  apiClient.patch(`${RESOURCE}/${id}/cancelar`).then((r) => r.data);

// Cambio de estado (aprobado/pendiente/cancelado) para profesor/superadmin
/** Actualiza estado del slot. */
export const actualizarEstadoSlot = (id, estado) =>
  apiClient.patch(`${RESOURCE}/${id}/estado`, { estado }).then((r) => r.data);
