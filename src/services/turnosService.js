// === Turnos Service ===
// Clientes HTTP para CRUD de turnos.
// MIGRADO: Ahora usa /slots en lugar de /turnos (consolidación backend Nov 2025)
import { apiClient } from "./apiClient";
/**
 * Convierte a número si es posible, devolviendo el valor original si no.
 * @param {any} value
 * @returns {any}
 */

const RESOURCE = "/slots";

const toNumberIfPossible = (value) => {
  if (value === undefined) return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? value : parsed;
};

/**
 * Construye el payload del turno mapeando alias y valores derivados.
 * @param {Object} payload
 * @param {Object} options
 * @param {boolean} options.includeDefaults
 * @returns {Object}
 */
const mapTurnoPayload = (payload = {}, options = {}) => {
  const { includeDefaults = false } = options;
  const result = {};

  const resolvedReview = payload.review ?? payload.reviewNumber;
  const reviewValue = toNumberIfPossible(resolvedReview);
  if (reviewValue !== undefined) {
    result.review = reviewValue;
    // Alias comun en algunos despliegues
    result.reviewNumber = reviewValue;
  } else if (includeDefaults) {
    result.review = 0;
  }

  const maybeAssign = (key, value, allowDefault = false) => {
    if (value !== undefined) {
      result[key] = value;
    } else if (includeDefaults && allowDefault) {
      result[key] = "";
    }
  };

  // Backend almacena 'fecha' como DD/MM/YYYY; acepta 'date' en payload.
  // Conservar 'date' si viene explícito para evitar desfases de zona horaria con start/end.
  maybeAssign("date", payload.date);
  if (payload.date && !payload.fecha) {
    result.fecha = payload.date;
  } else {
    maybeAssign("fecha", payload.fecha);
  }
  maybeAssign("horario", payload.horario);
  // Backend espera 'sala' como Number
  if (payload.sala !== undefined) {
    const salaText = String(payload.sala).trim();
    const digits = salaText.replace(/[^0-9]/g, "");
    const numSala = Number(digits);
    result.sala = Number.isFinite(numSala) && numSala > 0 ? numSala : payload.sala;
  } else if (includeDefaults) {
    result.sala = 0;
  }
  // Mapear 'room' numerico requerido por backend (ReviewSlot)
  if (payload.room !== undefined) {
    const roomNum = Number(payload.room);
    result.room = Number.isNaN(roomNum) ? payload.room : roomNum;
  }
  maybeAssign("zoomLink", payload.zoomLink?.trim?.() ?? payload.zoomLink, true);
  maybeAssign("start", payload.start);
  maybeAssign("end", payload.end);
  // Mapear 'date' ISO segment si no viene explícito (para validación Path `date` is required)
  if (!result.date && (payload.start || payload.end)) {
    try {
      const iso = payload.start || payload.end;
      if (iso) {
        const isoPart = new Date(iso).toISOString().slice(0, 10);
        result.date = isoPart;
        // También mapear a formato DD/MM/YYYY si backend lo transforma a fecha interna 'fecha'
        const [yyyy, mm, dd] = isoPart.split("-");
        if (yyyy && mm && dd && !result.fecha) {
          result.fecha = `${dd}/${mm}/${yyyy}`;
        }
      }
    } catch {
      // Ignorar si no puede derivar fecha
    }
  }
  // Derivar HH:mm cuando sea posible (algunos backends lo esperan)
  try {
    const deriveHM = (iso) =>
      new Date(iso).toISOString().slice(11, 16);
    if (payload.start && !payload.startTime) {
      result.startTime = deriveHM(payload.start);
    }
    if (payload.end && !payload.endTime) {
      result.endTime = deriveHM(payload.end);
    }
  } catch {
    // Si falla el parseo, continuar sin comentario derivado
  }
  maybeAssign("comentarios", payload.comentarios ?? payload.comment, true);

  const resolvedEstado =
    payload.estado ?? payload.reviewStatus ?? (includeDefaults ? "Disponible" : undefined);
  if (resolvedEstado !== undefined) {
    result.estado = resolvedEstado;
    result.reviewStatus = payload.reviewStatus ?? resolvedEstado;
  }

  if (payload.titulo !== undefined || payload.title !== undefined) {
    result.titulo = payload.titulo ?? payload.title ?? "";
  }
  if (payload.descripcion !== undefined || payload.description !== undefined) {
    result.descripcion = payload.descripcion ?? payload.description ?? "";
  }

  const duracionValue = toNumberIfPossible(payload.duracion ?? payload.duration);
  if (duracionValue !== undefined) {
    result.duracion = duracionValue;
  }

  // Alias de módulo: aceptar moduleLabel/moduloLabel además de modulo/module
  const resolvedModulo = payload.modulo ?? payload.module;
  if (resolvedModulo !== undefined) {
    result.modulo = resolvedModulo;
    result.module = resolvedModulo; // enviar alias directo por si el backend mapea ambos
  } else if (includeDefaults) {
    result.modulo = "";
    result.module = "";
  }

  if (
    payload.solicitanteId !== undefined ||
    payload.student !== undefined ||
    payload.alumnoId !== undefined
  ) {
    result.solicitanteId = payload.solicitanteId ?? payload.student ?? payload.alumnoId;
  }

  if (
    payload.profesorId !== undefined ||
    payload.profesor !== undefined ||
    payload.createdBy !== undefined
  ) {
    result.profesorId = payload.profesorId ?? payload.profesor ?? payload.createdBy;
  }

  // Calcular duracion si no viene provista
  if ((result.start || payload.start) && (result.end || payload.end)) {
    try {
      const startDate = new Date(result.start || payload.start);
      const endDate = new Date(result.end || payload.end);
      const minutes = Math.max(0, Math.round((endDate - startDate) / 60000));
      if (minutes && result.duracion === undefined) {
        result.duracion = minutes;
      }
    } catch {
      // DerivaciИn de duraciИn fallida; continuar sin ajustar
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
  console.log("[turnosService] createTurno input:", payload);
  console.log("[turnosService] createTurno mapped:", mapped);
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
// Estas funciones estaban en slotsService, ahora unificadas aquí tras consolidación backend

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
