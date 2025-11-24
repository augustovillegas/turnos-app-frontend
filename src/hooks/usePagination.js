// === usePagination Hook ===
// Hook reutilizable para manejar lógica de paginación en tablas y listas.
import { useState, useMemo, useEffect, useCallback } from "react";

/**
 * Hook para gestionar paginación de datos.
 * 
 * @param {Array} items - Array de items a paginar
 * @param {number} itemsPerPage - Cantidad de items por página (default: 5)
 * @returns {Object} Estado y métodos de paginación
 */
export const usePagination = (items = [], itemsPerPage = 5) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Resetear página cuando cambian los items
  useEffect(() => {
    setCurrentPage(1);
  }, [items.length]);

  const paginationData = useMemo(() => {
    const totalItems = items.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
    const safePage = Math.min(Math.max(currentPage, 1), totalPages);
    const startIndex = (safePage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    return {
      items: items.slice(startIndex, endIndex),
      totalItems,
      totalPages,
      currentPage: safePage,
      startIndex,
      endIndex,
      hasNext: safePage < totalPages,
      hasPrev: safePage > 1,
    };
  }, [items, currentPage, itemsPerPage]);

  const goToPage = useCallback((page) => {
    const totalPages = Math.ceil(items.length / itemsPerPage) || 1;
    const safePage = Math.min(Math.max(page, 1), totalPages);
    setCurrentPage(safePage);
  }, [items.length, itemsPerPage]);

  const nextPage = useCallback(() => {
    setCurrentPage((prev) => {
      const totalPages = Math.ceil(items.length / itemsPerPage) || 1;
      return prev < totalPages ? prev + 1 : prev;
    });
  }, [items.length, itemsPerPage]);

  const prevPage = useCallback(() => {
    setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev));
  }, []);

  const resetPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  return {
    ...paginationData,
    goToPage,
    setCurrentPage: goToPage,
    nextPage,
    prevPage,
    resetPage,
  };
};
