// === Entregas Service ===
// Clientes HTTP para entregas.
import { apiClient } from "./apiClient";

const RESOURCE = "/entregas";

// Panel /entregas (profesor/superadmin) - acepta más campos que /submissions
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

  // Panel /entregas puede aceptar reviewStatus
  const reviewStatus = payload.reviewStatus ?? payload.estado ?? "A revisar";
  result.reviewStatus = reviewStatus;

  // Panel /entregas puede requerir student (alumnoId)
  if (payload.alumnoId !== undefined) {
    result.student = payload.alumnoId;
  } else if (payload.student !== undefined) {
    result.student = payload.student;
  } else if (payload.alumno?.id !== undefined) {
    result.student = payload.alumno.id;
  } else if (payload.alumno?._id !== undefined) {
    result.student = payload.alumno._id;
  }

  // assignment si está disponible
  if (payload.assignment !== undefined) {
    result.assignment = payload.assignment;
  }

  return result;
};

export const getEntregas = (params = {}) => {
  console.log("[entregasService] getEntregas: Llamando a", RESOURCE, "con params:", params);
  return apiClient
    .get(RESOURCE, { params })
    .then((response) => {
      console.log("[entregasService] getEntregas: Respuesta recibida:", {
        status: response.status,
        dataLength: response.data?.length ?? 0,
        headers: response.headers
      });
      return response.data ?? [];
    })
    .catch((error) => {
      console.error("[entregasService] getEntregas: Error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    });
};

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
