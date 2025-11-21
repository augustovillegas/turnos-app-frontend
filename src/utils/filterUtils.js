// === Filter Utilities ===
// Utilidades reutilizables para filtrado de datos.

/**
 * Filtra una colección de datos por múltiples campos.
 * 
 * @param {Array} coleccion - Array de objetos a filtrar
 * @param {Array} campos - Nombres de campos a buscar
 * @param {string} termino - Término de búsqueda
 * @returns {Array} Colección filtrada
 */
export const filtrarDatos = (coleccion, campos, termino) => {
  const consulta = termino.toLowerCase().trim();
  if (!consulta) return coleccion;

  return coleccion.filter((item) =>
    campos.some((field) => {
      const valor = item?.[field];
      if (valor == null) return false;
      return String(valor).toLowerCase().includes(consulta);
    })
  );
};

/**
 * Filtra datos por estado.
 * 
 * @param {Array} items - Items a filtrar
 * @param {string} estado - Estado a buscar
 * @param {string} campo - Campo donde buscar el estado (default: 'estado')
 * @returns {Array} Items filtrados
 */
export const filtrarPorEstado = (items, estado, campo = "estado") => {
  if (!estado || estado === "todos") return items;
  
  return items.filter((item) => {
    const valorEstado = item?.[campo];
    return String(valorEstado).toLowerCase() === estado.toLowerCase();
  });
};

/**
 * Filtra datos por review.
 * 
 * @param {Array} items - Items a filtrar
 * @param {string|number} review - Número de review
 * @returns {Array} Items filtrados
 */
export const filtrarPorReview = (items, review) => {
  if (!review || review === "todos") return items;
  
  return items.filter((item) => item.review === Number(review));
};
