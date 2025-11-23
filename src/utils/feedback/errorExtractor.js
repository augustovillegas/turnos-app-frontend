/**
 * Extractor de errores según contrato unificado del backend
 * Formato esperado: { message: string, errores?: [{campo: string, mensaje: string}] }
 * 
 * Elimina dependencias de campos legacy (msg, code, status en body)
 */

/**
 * Extrae el mensaje principal del error
 * @param {Error} error - Error de Axios u otro
 * @param {string} fallback - Mensaje por defecto si no se encuentra uno
 * @returns {string} Mensaje de error
 */
export const extractErrorMessage = (error, fallback = "Ha ocurrido un error") => {
  // Prioridad 1: mensaje del backend (contrato unificado)
  const backendMessage = error?.response?.data?.message;
  if (backendMessage) return backendMessage;

  // Prioridad 2: mensaje de la excepción de red
  if (error?.message) return error.message;

  // Prioridad 3: fallback genérico
  return fallback;
};

/**
 * Extrae el array de errores de validación por campo
 * @param {Error} error - Error de Axios
 * @returns {Array<{campo: string, mensaje: string}>} Array de errores o []
 */
export const extractFieldErrors = (error) => {
  const backendErrors = error?.response?.data?.errores;
  if (Array.isArray(backendErrors)) {
    return backendErrors.filter((e) => e.campo && e.mensaje);
  }
  return [];
};

/**
 * Extrae el código de estado HTTP
 * @param {Error} error - Error de Axios
 * @returns {number|null} Código de estado o null
 */
export const extractStatusCode = (error) => {
  return error?.response?.status ?? null;
};

/**
 * Formatea mensaje completo incluyendo errores de validación
 * @param {Error} error - Error de Axios
 * @param {string} fallback - Mensaje genérico
 * @returns {string} Mensaje formateado
 */
export const formatErrorMessage = (error, fallback = "Ha ocurrido un error") => {
  const message = extractErrorMessage(error, fallback);
  const fieldErrors = extractFieldErrors(error);

  if (fieldErrors.length === 0) {
    return message;
  }

  const errorList = fieldErrors
    .map((e) => `${e.campo}: ${e.mensaje}`)
    .join("; ");

  return `${message}. Detalles: ${errorList}`;
};

/**
 * Convierte errores de campo a un objeto para formularios
 * @param {Error} error - Error de Axios
 * @returns {Object} Objeto {campo: mensaje}
 */
export const extractFormErrors = (error) => {
  const fieldErrors = extractFieldErrors(error);
  return fieldErrors.reduce((acc, e) => {
    acc[e.campo] = e.mensaje;
    return acc;
  }, {});
};
