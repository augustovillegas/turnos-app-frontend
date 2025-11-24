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

  // ---- LÓGICA PARA EL CUADRO DE NÚMEROS (máx. 5) ----
  const maxButtons = 5;
  let startPage = 1;
  let endPage = totalPages;

  if (totalPages > maxButtons) {
    const half = Math.floor(maxButtons / 2);
    startPage = effectivePage - half;
    endPage = effectivePage + half;

    if (startPage < 1) {
      startPage = 1;
      endPage = maxButtons;
    } else if (endPage > totalPages) {
      endPage = totalPages;
      startPage = totalPages - maxButtons + 1;
    }
  }

  const pageNumbers = [];
  for (let p = startPage; p <= endPage; p++) {
    pageNumbers.push(p);
  }

  return (
    <nav 
      className="flex flex-col items-center gap-4 py-3 px-2"
      role="navigation"
      aria-label="Paginación"
    >
      {/* Contenedor principal con mejor organización visual */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
        
        {/* Grupo de navegación optimizado para todas las resoluciones */}
        <div className="inline-flex items-center gap-1.5 rounded-lg bg-white dark:bg-[#1E1E1E] p-1.5 shadow-lg border-2 border-[#111827]/20 dark:border-[#444]/60">
          
          {/* Primera página */}
          <button
            onClick={() => handleGoToPage(1)}
            disabled={effectivePage === 1}
            aria-label="Primera página"
            className={`
              inline-flex items-center justify-center min-w-[2.25rem] h-9 px-2.5 rounded-md
              font-semibold text-sm transition-all duration-200 shadow-sm
              border-2 border-[#111827]/30 dark:border-[#444]/50
              ${
                effectivePage === 1
                  ? "bg-[#E5E5E5]/50 dark:bg-[#2A2A2A]/50 text-[#111827]/40 dark:text-gray-500 cursor-not-allowed opacity-50"
                  : "bg-[#E5E5E5] dark:bg-[#2A2A2A] text-[#111827] dark:text-gray-200 hover:bg-[#FFD700] dark:hover:bg-[#C9A300] hover:text-black dark:hover:text-white hover:border-[#FFD700] dark:hover:border-[#C9A300] hover:shadow-md active:scale-95"
              }
            `}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
            <span className="hidden md:inline ml-1">Primera</span>
          </button>

          {/* Anterior */}
          <button
            onClick={() => handleGoToPage(effectivePage - 1)}
            disabled={effectivePage === 1}
            aria-label="Página anterior"
            className={`
              inline-flex items-center justify-center min-w-[2.25rem] h-9 px-2.5 rounded-md
              font-semibold text-sm transition-all duration-200 shadow-sm
              border-2 border-[#111827]/30 dark:border-[#444]/50
              ${
                effectivePage === 1
                  ? "bg-[#E5E5E5]/50 dark:bg-[#2A2A2A]/50 text-[#111827]/40 dark:text-gray-500 cursor-not-allowed opacity-50"
                  : "bg-[#E5E5E5] dark:bg-[#2A2A2A] text-[#111827] dark:text-gray-200 hover:bg-[#FFD700] dark:hover:bg-[#C9A300] hover:text-black dark:hover:text-white hover:border-[#FFD700] dark:hover:border-[#C9A300] hover:shadow-md active:scale-95"
              }
            `}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline ml-1">Prev</span>
          </button>

          {/* Separador visual solo en desktop */}
          <div className="hidden sm:block w-px h-6 bg-[#111827]/20 dark:bg-[#444]/40 mx-0.5"></div>

          {/* Números de página con diseño mejorado */}
          <div className="inline-flex items-center gap-1">
            {pageNumbers.map((num) => (
              <button
                key={num}
                onClick={() => handleGoToPage(num)}
                disabled={num === effectivePage}
                aria-label={`Página ${num}`}
                aria-current={num === effectivePage ? "page" : undefined}
                className={`
                  inline-flex items-center justify-center min-w-[2.25rem] h-9 px-2.5 rounded-md
                  font-bold text-sm transition-all duration-200 shadow-sm
                  border-2
                  ${
                    num === effectivePage
                      ? "bg-[#FFD700] dark:bg-[#C9A300] text-black dark:text-white border-[#FFD700] dark:border-[#C9A300] shadow-md scale-105 cursor-default ring-2 ring-[#FFD700]/30 dark:ring-[#C9A300]/30"
                      : "bg-[#E5E5E5] dark:bg-[#2A2A2A] text-[#111827] dark:text-gray-200 border-[#111827]/30 dark:border-[#444]/50 hover:bg-[#FFD700]/80 dark:hover:bg-[#C9A300]/80 hover:text-black dark:hover:text-white hover:border-[#FFD700] dark:hover:border-[#C9A300] hover:shadow-md active:scale-95"
                  }
                `}
              >
                {num}
              </button>
            ))}
          </div>

          {/* Separador visual solo en desktop */}
          <div className="hidden sm:block w-px h-6 bg-[#111827]/20 dark:bg-[#444]/40 mx-0.5"></div>

          {/* Siguiente */}
          <button
            onClick={() => handleGoToPage(effectivePage + 1)}
            disabled={effectivePage === totalPages}
            aria-label="Página siguiente"
            className={`
              inline-flex items-center justify-center min-w-[2.25rem] h-9 px-2.5 rounded-md
              font-semibold text-sm transition-all duration-200 shadow-sm
              border-2 border-[#111827]/30 dark:border-[#444]/50
              ${
                effectivePage === totalPages
                  ? "bg-[#E5E5E5]/50 dark:bg-[#2A2A2A]/50 text-[#111827]/40 dark:text-gray-500 cursor-not-allowed opacity-50"
                  : "bg-[#E5E5E5] dark:bg-[#2A2A2A] text-[#111827] dark:text-gray-200 hover:bg-[#FFD700] dark:hover:bg-[#C9A300] hover:text-black dark:hover:text-white hover:border-[#FFD700] dark:hover:border-[#C9A300] hover:shadow-md active:scale-95"
              }
            `}
          >
            <span className="hidden sm:inline mr-1">Sig</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Última página */}
          <button
            onClick={() => handleGoToPage(totalPages)}
            disabled={effectivePage === totalPages}
            aria-label="Última página"
            className={`
              inline-flex items-center justify-center min-w-[2.25rem] h-9 px-2.5 rounded-md
              font-semibold text-sm transition-all duration-200 shadow-sm
              border-2 border-[#111827]/30 dark:border-[#444]/50
              ${
                effectivePage === totalPages
                  ? "bg-[#E5E5E5]/50 dark:bg-[#2A2A2A]/50 text-[#111827]/40 dark:text-gray-500 cursor-not-allowed opacity-50"
                  : "bg-[#E5E5E5] dark:bg-[#2A2A2A] text-[#111827] dark:text-gray-200 hover:bg-[#FFD700] dark:hover:bg-[#C9A300] hover:text-black dark:hover:text-white hover:border-[#FFD700] dark:hover:border-[#C9A300] hover:shadow-md active:scale-95"
              }
            `}
          >
            <span className="hidden md:inline mr-1">Última</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Información de resumen con mejor presentación */}
      <div className="flex items-center gap-2 text-xs font-medium text-[#111827] dark:text-gray-300 bg-[#E5E5E5]/40 dark:bg-[#2A2A2A]/40 px-3 py-1.5 rounded-full border border-[#111827]/10 dark:border-[#444]/30">
        <span className="hidden xs:inline">Mostrando página</span>
        <span className="font-bold text-[#1E3A8A] dark:text-[#93C5FD]">{effectivePage}</span>
        <span>de</span>
        <span className="font-bold text-[#1E3A8A] dark:text-[#93C5FD]">{totalPages}</span>
        <span className="hidden sm:inline">•</span>
        <span className="hidden sm:inline">{totalItems} registro{totalItems !== 1 ? 's' : ''}</span>
      </div>
    </nav>
  )
}