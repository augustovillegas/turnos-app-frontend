// === Pagination ===
// Componente reutilizable y adaptable para navegación de listas.
import { useState, useEffect } from "react";

const normalizeItemsPerPage = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return 1;
  return Math.trunc(numeric);
};

const clampPage = (proposed, totalPages) => {
  const numeric = Number(proposed);
  if (!Number.isFinite(numeric)) return 1;
  const normalized = Math.trunc(numeric);
  if (normalized < 1) return 1;
  if (normalized > totalPages) return totalPages;
  return normalized;
};

export const Pagination = ({
  totalItems = 0,
  itemsPerPage = 5,
  onPageChange,
  currentPage: controlledPage,
}) => {
  const safeItemsPerPage = normalizeItemsPerPage(itemsPerPage);
  const totalPages = Math.max(
    1,
    Math.ceil(Number(totalItems) / safeItemsPerPage || 0)
  );
  const parsedControlledPage = Number(controlledPage);
  const isControlled = Number.isFinite(parsedControlledPage);
  const initialPage = clampPage(
    isControlled ? parsedControlledPage : 1,
    totalPages
  );
  const [page, setPage] = useState(initialPage);
  const [inputPage, setInputPage] = useState("");
  const effectivePage = isControlled
    ? clampPage(parsedControlledPage, totalPages)
    : page;

  useEffect(() => {
    if (!isControlled) return;
    setPage((prev) => {
      const next = clampPage(parsedControlledPage, totalPages);
      return prev === next ? prev : next;
    });
  }, [parsedControlledPage, isControlled, totalPages]);

  useEffect(() => {
    if (isControlled) return;
    setPage((prev) => {
      const next = clampPage(prev, totalPages);
      if (next !== prev) {
        onPageChange?.(next);
      }
      return next;
    });
  }, [isControlled, totalPages, onPageChange]);

  const handleGoToPage = (newPage) => {
    const nextPage = clampPage(newPage, totalPages);
    if (isControlled) {
      if (nextPage !== effectivePage) {
        onPageChange?.(nextPage);
      }
      return;
    }
    setPage((prev) => {
      if (nextPage === prev) return prev;
      onPageChange?.(nextPage);
      return nextPage;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const target = Number(inputPage);
    if (!isNaN(target)) {
      handleGoToPage(target);
      setInputPage("");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-4">
      {/* Fila principal: anterior / número / siguiente */}
      <div className="flex items-center justify-center gap-2 text-sm font-semibold">
        {/* Botón anterior */}
        <button
          onClick={() => handleGoToPage(effectivePage - 1)}
          disabled={effectivePage === 1}
          className={`flex items-center justify-center gap-1 px-3 py-1 rounded-md border-2 border-[#111827] dark:border-[#444]
                      bg-[#E5E5E5] dark:bg-[#2A2A2A] hover:bg-[#FFD700] dark:hover:bg-[#B8860B]
                      hover:text-black dark:hover:text-white transition
                      ${
                        effectivePage === 1
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
        >
          <i className="bi bi-chevron-left w-4 h-4 sm:hidden"></i>
          <span className="hidden sm:inline">Anterior</span>
        </button>

        {/* Página actual */}
        <span
          className="px-3 py-1 rounded-md border-2 border-[#111827] dark:border-[#444]
                     bg-[#FFD700] dark:bg-[#B8860B] text-black dark:text-white font-bold"
        >
          {effectivePage}
        </span>

        {/* Botón siguiente */}
        <button
          onClick={() => handleGoToPage(effectivePage + 1)}
          disabled={effectivePage === totalPages}
          className={`flex items-center justify-center gap-1 px-3 py-1 rounded-md border-2 border-[#111827] dark:border-[#444]
                      bg-[#E5E5E5] dark:bg-[#2A2A2A] hover:bg-[#FFD700] dark:hover:bg-[#B8860B]
                      hover:text-black dark:hover:text-white transition
                      ${
                        effectivePage === totalPages
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
        >
          <span className="hidden sm:inline">Siguiente</span>
          <i className="bi bi-chevron-right w-4 h-4 sm:hidden"></i>
        </button>
      </div>

      {/* Fila inferior: primera / última */}
      <div className="flex items-center justify-center gap-2 text-sm font-semibold">
        <button
          onClick={() => handleGoToPage(1)}
          disabled={effectivePage === 1}
          className={`flex items-center justify-center gap-1 px-3 py-1 rounded-md border-2 border-[#111827] dark:border-[#444]
                      bg-[#E5E5E5] dark:bg-[#2A2A2A] hover:bg-[#FFD700] dark:hover:bg-[#B8860B]
                      hover:text-black dark:hover:text-white transition
                      ${
                        effectivePage === 1
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
        >
          <i className="bi bi-chevron-double-left w-4 h-4 sm:hidden"></i>
          <span className="hidden sm:inline">Primera</span>
        </button>

        <button
          onClick={() => handleGoToPage(totalPages)}
          disabled={effectivePage === totalPages}
          className={`flex items-center justify-center gap-1 px-3 py-1 rounded-md border-2 border-[#111827] dark:border-[#444]
                      bg-[#E5E5E5] dark:bg-[#2A2A2A] hover:bg-[#FFD700] dark:hover:bg-[#B8860B]
                      hover:text-black dark:hover:text-white transition
                      ${
                        effectivePage === totalPages
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
        >
          <span className="hidden sm:inline">Última</span>
          <i className="bi bi-chevron-double-right w-4 h-4 sm:hidden"></i>
        </button>
      </div>

      {/* Formulario ir a página */}
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
        Página {effectivePage} de {totalPages} ({totalItems} registros)
      </p>
    </div>
  );
};
