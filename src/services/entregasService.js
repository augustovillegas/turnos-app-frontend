// === Entregas Service ===
// Clientes HTTP para entregas.
import { apiClient } from "./apiClient";

const RESOURCE = "/entregas";

const mapEntregaPayload = (payload = {}) => {
  const result = {};

  if (payload.sprint !== undefined) {
    const sprintValue = Number(payload.sprint);
    result.sprint = Number.isNaN(sprintValue) ? payload.sprint : sprintValue;
  }
  if (payload.githubLink !== undefined) {
    result.githubLink = payload.githubLink?.trim() ?? "";
  }
  if (payload.renderLink !== undefined) {
    result.renderLink = payload.renderLink?.trim() ?? "";
  }
  if (payload.comentarios !== undefined) {
    result.comentarios = payload.comentarios ?? "";
  }

  const resolvedEstado =
    payload.estado ?? payload.reviewStatus ?? "A revisar";
  result.estado = resolvedEstado;
  result.reviewStatus = payload.reviewStatus ?? resolvedEstado;

  if (payload.alumnoId !== undefined) {
    result.alumnoId = payload.alumnoId;
  } else if (payload.alumno?.id !== undefined) {
    result.alumnoId = payload.alumno.id;
  } else if (payload.alumno?._id !== undefined) {
    result.alumnoId = payload.alumno._id;
  }

  if (payload.modulo !== undefined) {
    result.modulo = payload.modulo ?? "";
  }

  return result;
};

export const getEntregas = (params = {}) =>
  apiClient
    .get(RESOURCE, { params })
    .then((response) => response.data ?? []);

export const createEntrega = (payload) =>
  apiClient
    .post(RESOURCE, mapEntregaPayload(payload))
    .then((response) => response.data);

export const updateEntrega = (id, payload) =>
  apiClient
    .put(`${RESOURCE}/${id}`, mapEntregaPayload(payload))
    .then((response) => response.data);

export const deleteEntrega = (id) =>
  apiClient
    .delete(`${RESOURCE}/${id}`)
    .then((response) => response.data);
