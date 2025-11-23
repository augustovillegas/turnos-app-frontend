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
export const paginate = (items, page, perPage) => {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const start = (currentPage - 1) * perPage;
  return {
    currentPage,
    totalPages,
    totalItems: total,
    items: items.slice(start, start + perPage),
  };
};
