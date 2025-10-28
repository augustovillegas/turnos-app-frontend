// === Pagination ===
// Componente reutilizable y adaptable para navegación de listas.
import { useState, useEffect } from "react";

export const Pagination = ({
  totalItems = 0,
  itemsPerPage = 5,
  onPageChange,
  currentPage: controlledPage,
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const [page, setPage] = useState(controlledPage || 1);
  const [inputPage, setInputPage] = useState("");

  useEffect(() => {
    if (controlledPage) setPage(controlledPage);
  }, [controlledPage]);

  const handleGoToPage = (newPage) => {
    const nextPage = Math.min(Math.max(newPage, 1), totalPages);
    if (nextPage === page) return;
    setPage(nextPage);
    onPageChange?.(nextPage);
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
          onClick={() => handleGoToPage(page - 1)}
          disabled={page === 1}
          className={`flex items-center justify-center gap-1 px-3 py-1 rounded-md border-2 border-[#111827] dark:border-[#444]
                      bg-[#E5E5E5] dark:bg-[#2A2A2A] hover:bg-[#FFD700] dark:hover:bg-[#B8860B]
                      hover:text-black dark:hover:text-white transition
                      ${page === 1 ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <img src="/src/left.svg" alt="prev" className="w-4 h-4 sm:hidden" />
          <span className="hidden sm:inline">Anterior</span>
        </button>

        {/* Página actual */}
        <span
          className="px-3 py-1 rounded-md border-2 border-[#111827] dark:border-[#444]
                     bg-[#FFD700] dark:bg-[#B8860B] text-black dark:text-white font-bold"
        >
          {page}
        </span>

        {/* Botón siguiente */}
        <button
          onClick={() => handleGoToPage(page + 1)}
          disabled={page === totalPages}
          className={`flex items-center justify-center gap-1 px-3 py-1 rounded-md border-2 border-[#111827] dark:border-[#444]
                      bg-[#E5E5E5] dark:bg-[#2A2A2A] hover:bg-[#FFD700] dark:hover:bg-[#B8860B]
                      hover:text-black dark:hover:text-white transition
                      ${
                        page === totalPages
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
        >
          <span className="hidden sm:inline">Siguiente</span>
          <img src="/src/right.svg" alt="next" className="w-4 h-4 sm:hidden" />
        </button>
      </div>

      {/* Fila inferior: primera / última */}
      <div className="flex items-center justify-center gap-2 text-sm font-semibold">
        <button
          onClick={() => handleGoToPage(1)}
          disabled={page === 1}
          className={`flex items-center justify-center gap-1 px-3 py-1 rounded-md border-2 border-[#111827] dark:border-[#444]
                      bg-[#E5E5E5] dark:bg-[#2A2A2A] hover:bg-[#FFD700] dark:hover:bg-[#B8860B]
                      hover:text-black dark:hover:text-white transition
                      ${page === 1 ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <img src="/src/first.svg" alt="first" className="w-4 h-4 sm:hidden" />
          <span className="hidden sm:inline">Primera</span>
        </button>

        <button
          onClick={() => handleGoToPage(totalPages)}
          disabled={page === totalPages}
          className={`flex items-center justify-center gap-1 px-3 py-1 rounded-md border-2 border-[#111827] dark:border-[#444]
                      bg-[#E5E5E5] dark:bg-[#2A2A2A] hover:bg-[#FFD700] dark:hover:bg-[#B8860B]
                      hover:text-black dark:hover:text-white transition
                      ${
                        page === totalPages
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
        >
          <span className="hidden sm:inline">Última</span>
          <img src="/src/last.svg" alt="last" className="w-4 h-4 sm:hidden" />
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
        Página {page} de {totalPages} ({totalItems} registros)
      </p>
    </div>
  );
};
