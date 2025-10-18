// === Turnos Service ===
// Clientes HTTP para CRUD de turnos.
import { apiClient } from "./apiClient";

const RESOURCE = "/turnos";

const mapTurnoPayload = (payload) => {
  const base = {
    review: Number(payload.review) || 0,
    fecha: payload.fecha,
    horario: payload.horario,
    sala: payload.sala,
    zoomLink: payload.zoomLink || "",
    estado: payload.estado || "Disponible",
    start: payload.start || "",
    end: payload.end || "",
    comentarios: payload.comentarios || "",
  };

  if (payload.titulo !== undefined) {
    base.titulo = payload.titulo ?? "";
  }
  if (payload.descripcion !== undefined) {
    base.descripcion = payload.descripcion ?? "";
  }
  if (payload.modulo !== undefined) {
    base.modulo = payload.modulo ?? "";
  }
  if (payload.duracion !== undefined) {
    const durationValue = Number(payload.duracion);
    base.duracion = Number.isNaN(durationValue) ? payload.duracion : durationValue;
  }
  if (payload.solicitanteId !== undefined) {
    base.solicitanteId = payload.solicitanteId;
  }
  if (payload.profesorId !== undefined) {
    base.profesorId = payload.profesorId;
  }
  return base;
};

export const getTurnos = (params = {}) =>
  apiClient
    .get(RESOURCE, { params })
    .then((response) => response.data ?? []);

export const getTurnoById = (id) =>
  apiClient
    .get(`${RESOURCE}/${id}`)
    .then((response) => response.data);

export const createTurno = (payload) =>
  apiClient
    .post(RESOURCE, mapTurnoPayload(payload))
    .then((response) => response.data);

export const updateTurno = (id, payload) =>
  apiClient
    .put(`${RESOURCE}/${id}`, mapTurnoPayload(payload))
    .then((response) => response.data);

export const deleteTurno = (id) =>
  apiClient
    .delete(`${RESOURCE}/${id}`)
    .then((response) => response.data);
