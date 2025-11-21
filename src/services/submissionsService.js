// === Submissions Service ===
// Endpoints orientados al flujo del alumno (/submissions)
import { apiClient } from "./apiClient";

// Listar entregas del usuario (alumno/profesor/superadmin con permisos)
export const getSubmissionsByUser = (userId) =>
  apiClient.get(`/submissions/${userId}`).then((r) => r.data ?? []);

// Obtener detalle (usado para edición / lectura puntual)
export const getSubmissionDetail = (id) =>
  apiClient.get(`/submissions/detail/${id}`).then((r) => r.data);

// Crear entrega vinculada a un slot reservado
export const createSubmission = (slotId, payload = {}) =>
  apiClient.post(`/submissions/${slotId}`, mapSubmissionPayload(payload)).then((r) => r.data);

// Actualizar entrega
export const updateSubmission = (id, payload = {}) =>
  apiClient.put(`/submissions/${id}`, mapSubmissionPayload(payload)).then((r) => r.data);

// Eliminar entrega
export const deleteSubmission = (id) =>
  apiClient.delete(`/submissions/${id}`).then((r) => r.data);

// Normaliza el payload para enviar sólo los campos esperados
const mapSubmissionPayload = (payload = {}) => {
  const out = {};
  if (payload.githubLink !== undefined) out.githubLink = payload.githubLink?.trim() ?? "";
  if (payload.renderLink !== undefined) out.renderLink = payload.renderLink?.trim() ?? "";
  if (payload.comentarios !== undefined) out.comentarios = payload.comentarios ?? "";
  if (payload.sprint !== undefined) {
    const sprintVal = Number(payload.sprint);
    out.sprint = Number.isNaN(sprintVal) ? payload.sprint : sprintVal;
  }
  // Estados canónicos; si se recibe alias lo dejamos y backend normaliza
  const estadoBase = payload.estado ?? payload.reviewStatus ?? "A revisar";
  out.estado = estadoBase;
  out.reviewStatus = payload.reviewStatus ?? estadoBase;
  if (payload.modulo !== undefined) out.modulo = payload.modulo;
  return out;
};
