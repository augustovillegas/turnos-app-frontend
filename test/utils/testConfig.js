/* eslint-env node */
/**
 * Configuración centralizada de timeouts para tests
 * 
 * Uso:
 * import { TEST_TIMEOUTS } from '@test/utils/testConfig';
 * 
 * await screen.findByRole('button', {}, { timeout: TEST_TIMEOUTS.e2e });
 */

export const TEST_TIMEOUTS = {
  /** Tests unitarios - operaciones síncronas */
  unit: 5_000,
  
  /** Tests de integración - llamadas HTTP reales sin UI */
  integration: 25_000,
  
  /** Tests E2E - render completo + interacción */
  e2e: 30_000,
  
  /** Health checks de API - timeouts cortos para fail-fast */
  apiHealth: 20_000,
  
  /** Operaciones de búsqueda/filtrado en UI */
  search: 12_000,
  
  /** Navegación entre rutas */
  navigation: 15_000,
};

/**
 * Configuración de reintentos para operaciones flaky
 */
export const RETRY_CONFIG = {
  /** Reintentos para fetch de usuario recién creado */
  userFetch: {
    attempts: 12,
    intervalMs: 350,
    timeoutMs: 6_000,
  },
  
  /** Reintentos para operaciones de red transitorias */
  networkRetry: {
    attempts: 3,
    intervalMs: 500,
    timeoutMs: 3_000,
  },
};

/**
 * Configuración de paginación para tests
 */
export const TEST_PAGINATION = {
  itemsPerPage: 5,
  maxTestItems: 10,
};

export default {
  TEST_TIMEOUTS,
  RETRY_CONFIG,
  TEST_PAGINATION,
};
