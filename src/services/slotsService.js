// === Slots Service ===
// Endpoints para operaciones de alumno/profesor sobre turnos base (/slots)
import { apiClient } from "./apiClient";

const RESOURCE = "/slots";

export const getSlots = (params = {}) =>
  apiClient.get(RESOURCE, { params }).then((r) => r.data ?? []);

export const solicitarSlot = (id) =>
  apiClient.patch(`${RESOURCE}/${id}/solicitar`).then((r) => r.data);

export const cancelarSlot = (id) =>
  apiClient.patch(`${RESOURCE}/${id}/cancelar`).then((r) => r.data);

// Cambio de estado (aprobado/pendiente/cancelado) para profesor/superadmin
export const actualizarEstadoSlot = (id, estado) =>
  apiClient
    .patch(`${RESOURCE}/${id}/estado`, { estado })
    .then((r) => r.data);
