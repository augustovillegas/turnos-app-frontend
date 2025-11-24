// === Pagination Utilities ===
// Generic pagination helper for list views
// ARQUITECTURA: Centraliza lógica de paginación reutilizable;
// evita duplicación en componentes de lista (CreateUsers, dashboards).

/**
 * Pagina un array de items
 * @param {Array} items - Items a paginar
 * @param {number} page - Página actual (1-indexed)
 * @param {number} perPage - Items por página
 * @returns {{currentPage: number, totalPages: number, totalItems: number, items: Array}}
 */
const __paginateCache = new WeakMap();

export const paginate = (items, page, perPage) => {
  if (!Array.isArray(items)) {
    return { currentPage: 1, totalPages: 1, totalItems: 0, items: [] };
  }
  const keyObj = items; // referencia del array
  let cacheForList = __paginateCache.get(keyObj);
  const signature = perPage + '|' + page + '|' + items.length;
  if (cacheForList && cacheForList[signature]) {
    return cacheForList[signature];
  }
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const start = (currentPage - 1) * perPage;
  const result = {
    currentPage,
    totalPages,
    totalItems: total,
    items: items.slice(start, start + perPage),
  };
  if (!cacheForList) {
    cacheForList = {};
    __paginateCache.set(keyObj, cacheForList);
  }
  cacheForList[signature] = result;
  return result;
};
