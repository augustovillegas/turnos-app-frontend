// === Turnos Service ===
// Clientes HTTP para CRUD de turnos.
import { apiClient } from "./apiClient";

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
