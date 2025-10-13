// === Pagination ===
// Componente reutilizable para navegar listas largas en bloques.
import { useState, useEffect } from "react";

/**
 * Pagination Component
 * @param {number} totalItems - Total de elementos a paginar
 * @param {number} itemsPerPage - Elementos por página (default: 5)
 * @param {function} onPageChange - Callback(page) => void
 * @param {number} currentPage - Página actual (opcional si se controla externamente)
 */
export const Pagination = ({
  totalItems = 0,
  itemsPerPage = 5,
  onPageChange,
  currentPage: controlledPage,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const [page, setPage] = useState(controlledPage || 1);
  const [inputPage, setInputPage] = useState("");

  // Si el componente es controlado externamente
  useEffect(() => {
    if (controlledPage) setPage(controlledPage);
  }, [controlledPage]);

  const goToPage = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    onPageChange?.(newPage);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const target = Number(inputPage);
    if (!isNaN(target)) {
      goToPage(target);
      setInputPage("");
    }
  };

  // Rango visible de páginas (ej: 1 2 3 4 5 ...)
  const getPageNumbers = () => {
    const delta = 2;
    const start = Math.max(1, page - delta);
    const end = Math.min(totalPages, page + delta);
    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  if (totalPages <= 1) return null; // no renderiza si no hay varias páginas

  return (
    <div className="flex flex-col items-center justify-center gap-2 py-4">
      {/* Controles principales */}
      <div className="flex flex-wrap items-center justify-center gap-2 text-sm font-semibold">
        <button
          onClick={() => goToPage(1)}
          disabled={page === 1}
          className={`px-3 py-1 rounded-md border-2 border-[#111827] dark:border-[#444] bg-[#E5E5E5] dark:bg-[#2A2A2A]
                      hover:bg-[#FFD700] dark:hover:bg-[#B8860B] hover:text-black dark:hover:text-white
                      ${page === 1 ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          ⏮ Primera
        </button>
        <button
          onClick={() => goToPage(page - 1)}
          disabled={page === 1}
          className={`px-3 py-1 rounded-md border-2 border-[#111827] dark:border-[#444] bg-[#E5E5E5] dark:bg-[#2A2A2A]
                      hover:bg-[#FFD700] dark:hover:bg-[#B8860B] hover:text-black dark:hover:text-white
                      ${page === 1 ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          ◀ Anterior
        </button>

        {/* Números de página */}
        {getPageNumbers().map((num) => (
          <button
            key={num}
            onClick={() => goToPage(num)}
            className={`px-3 py-1 rounded-md border-2 border-[#111827] dark:border-[#444]
                        transition-colors duration-300
                        ${
                          num === page
                            ? "bg-[#FFD700] dark:bg-[#B8860B] text-black dark:text-white font-bold"
                            : "bg-[#E5E5E5] dark:bg-[#2A2A2A] text-[#111827] dark:text-gray-200 hover:bg-[#FFD700] dark:hover:bg-[#B8860B] hover:text-black dark:hover:text-white"
                        }`}
          >
            {num}
          </button>
        ))}

        <button
          onClick={() => goToPage(page + 1)}
          disabled={page === totalPages}
          className={`px-3 py-1 rounded-md border-2 border-[#111827] dark:border-[#444] bg-[#E5E5E5] dark:bg-[#2A2A2A]
                      hover:bg-[#FFD700] dark:hover:bg-[#B8860B] hover:text-black dark:hover:text-white
                      ${page === totalPages ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          Siguiente ▶
        </button>
        <button
          onClick={() => goToPage(totalPages)}
          disabled={page === totalPages}
          className={`px-3 py-1 rounded-md border-2 border-[#111827] dark:border-[#444] bg-[#E5E5E5] dark:bg-[#2A2A2A]
                      hover:bg-[#FFD700] dark:hover:bg-[#B8860B] hover:text-black dark:hover:text-white
                      ${page === totalPages ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          Última ⏭
        </button>
      </div>

      {/* Ir a página específica */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 mt-2 text-xs sm:text-sm"
      >
        <label className="text-[#111827] dark:text-gray-200">
          Ir a página:
        </label>
        <input
          type="number"
          min="1"
          max={totalPages}
          value={inputPage}
          onChange={(e) => setInputPage(e.target.value)}
          className="w-16 rounded border-2 border-[#111827] dark:border-[#444]
                     bg-white dark:bg-[#2A2A2A] px-2 py-1 text-center text-[#111827] dark:text-gray-200
                     focus:outline-none focus:ring-2 focus:ring-[#FFD700] dark:focus:ring-[#B8860B]"
        />
        <button
          type="submit"
          className="px-3 py-1 rounded-md border-2 border-[#111827] dark:border-[#444]
                     bg-[#E5E5E5] dark:bg-[#2A2A2A] hover:bg-[#FFD700] dark:hover:bg-[#B8860B]
                     hover:text-black dark:hover:text-white transition"
        >
          Ir
        </button>
      </form>

      {/* Info resumen */}
      <p className="text-xs text-[#111827] dark:text-gray-300 mt-1">
        Página {page} de {totalPages} ({totalItems} registros)
      </p>
    </div>
  );
};
