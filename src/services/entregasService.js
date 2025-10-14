// === Entregas Service ===
// Clientes HTTP para entregas.
import { apiClient } from "./apiClient";

const RESOURCE = "/entregas";

export const getEntregas = (params = {}) =>
  apiClient
    .get(RESOURCE, { params })
    .then((response) => response.data ?? []);
