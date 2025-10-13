// === Turnos Service ===
// Clientes HTTP para CRUD de turnos.
import { apiClient, withLatency } from "./apiClient";

const RESOURCE = "/turnos";

const mapTurnoPayload = (payload) => ({
  review: Number(payload.review) || 0,
  fecha: payload.fecha,
  horario: payload.horario,
  sala: payload.sala,
  zoomLink: payload.zoomLink || "",
  estado: payload.estado || "Disponible",
  start: payload.start || "",
  end: payload.end || "",
  comentarios: payload.comentarios || "",
});

export const getTurnos = (params = {}) =>
  withLatency(apiClient.get(RESOURCE, { params })).then(
    (response) => response.data ?? []
  );

export const getTurnoById = (id) =>
  withLatency(apiClient.get(`${RESOURCE}/${id}`)).then(
    (response) => response.data
  );

export const createTurno = (payload) =>
  withLatency(apiClient.post(RESOURCE, mapTurnoPayload(payload))).then(
    (response) => response.data
  );

export const updateTurno = (id, payload) =>
  withLatency(apiClient.put(`${RESOURCE}/${id}`, mapTurnoPayload(payload))).then(
    (response) => response.data
  );

export const deleteTurno = (id) =>
  withLatency(apiClient.delete(`${RESOURCE}/${id}`)).then(
    (response) => response.data
  );
