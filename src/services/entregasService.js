// === Entregas Service ===
// Adaptado a los contratos vigentes de /submissions.
import { apiClient } from "./apiClient";

const RESOURCE = "/submissions";

// Mapea payload de entrega alineado a Submission.
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

  // Backend acepta reviewStatus opcional (alias estado).
  const reviewStatus = payload.reviewStatus ?? payload.estado;
  if (reviewStatus !== undefined) {
    result.reviewStatus = reviewStatus;
  }

  // Identificador del alumno.
  if (payload.alumnoId !== undefined) {
    result.student = payload.alumnoId;
  } else if (payload.student !== undefined) {
    result.student = payload.student;
  } else if (payload.alumno?.id !== undefined) {
    result.student = payload.alumno.id;
  } else if (payload.alumno?._id !== undefined) {
    result.student = payload.alumno._id;
  }

  if (payload.assignment !== undefined) {
    result.assignment = payload.assignment;
  }

  return result;
};

/** Lista entregas globales (filtradas por rol automáticamente). */
export const getEntregas = (params = {}) =>
  apiClient.get(RESOURCE, { params }).then((response) => response.data ?? []);

/** Crea una entrega (requiere slot reservado y rol alumno). */
export const createEntrega = (payload = {}) => {
  const slotId = payload.slotId ?? payload.turnoId ?? payload.slot;
  if (!slotId) {
    throw new Error("Falta slotId para registrar la entrega.");
  }
  return apiClient
    .post(`${RESOURCE}/${slotId}`, mapEntregaPayload(payload))
    .then((response) => response.data);
};

/** Actualiza una entrega. */
export const updateEntrega = (id, payload) =>
  apiClient.put(`${RESOURCE}/${id}`, mapEntregaPayload(payload)).then((response) => response.data);

/** Elimina una entrega. */
export const deleteEntrega = (id) =>
  apiClient.delete(`${RESOURCE}/${id}`).then((response) => response.data);
