// === Usuarios Service ===
// Clientes HTTP para usuarios.
import { apiClient } from "./apiClient";

const RESOURCE = "/usuarios";

export const getUsuarios = (params = {}) =>
  apiClient
    .get(RESOURCE, { params })
    .then((response) => response.data ?? []);

export const approveUsuario = (id) =>
  apiClient
    .patch(`/auth/aprobar/${id}`)
    .then((response) => response.data);

export const updateUsuarioEstado = (id, estado) =>
  apiClient
    .patch(`/auth/usuarios/${id}`, {
      estado,
      status: estado,
    })
    .then((response) => response.data);
