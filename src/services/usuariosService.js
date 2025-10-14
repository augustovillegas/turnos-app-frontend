// === Usuarios Service ===
// Clientes HTTP para usuarios.
import { apiClient } from "./apiClient";

const RESOURCE = "/usuarios";

export const getUsuarios = (params = {}) =>
  apiClient
    .get(RESOURCE, { params })
    .then((response) => response.data ?? []);
