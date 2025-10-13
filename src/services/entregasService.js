// === Entregas Service ===
// Clientes HTTP para entregas.
import { apiClient, withLatency } from "./apiClient";

const RESOURCE = "/entregas";

export const getEntregas = (params = {}) =>
  withLatency(apiClient.get(RESOURCE, { params })).then(
    (response) => response.data ?? []
  );
