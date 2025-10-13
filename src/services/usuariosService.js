// === Usuarios Service ===
// Clientes HTTP para usuarios.
import { apiClient, withLatency } from "./apiClient";

const RESOURCE = "/usuarios";

export const getUsuarios = (params = {}) =>
  withLatency(apiClient.get(RESOURCE, { params })).then(
    (response) => response.data ?? []
  );
