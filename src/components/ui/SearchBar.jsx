// === Search Bar ===
// Campo de búsqueda reutilizable, sin imponer layout; deja que el contenedor decida.
import { useState, useEffect, useRef } from "react";
import { filtrarDatos } from "../../utils/filterUtils";

const DEBOUNCE_MS = 300;

export const SearchBar = ({
  data = [],
  onSearch,
  fields = [],
  placeholder = "Buscar...",
  centered = false,
  withBottomSpacing = false,
  maxWidthClassName = "",
  className = "",
  containerClassName = "",
  inputClassName = "",
}) => {
  const [query, setQuery] = useState("");
  const latestOnSearch = useRef(onSearch);
  const latestData = useRef(data);
  const debounceTimer = useRef(null);

  useEffect(() => {
    latestOnSearch.current = onSearch;
  }, [onSearch]);

  useEffect(() => {
    latestData.current = data;
    if (!query.trim()) return;
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      const handler = latestOnSearch.current;
      if (typeof handler !== "function") return;
      handler(filtrarDatos(data, fields, query));
    }, DEBOUNCE_MS);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [data, fields, query]);

  const handleChange = (event) => {
    const value = event.target.value;
    setQuery(value);
    const handler = latestOnSearch.current;
    if (typeof handler !== "function") return;
    const resultados = filtrarDatos(latestData.current, fields, value);
    handler(resultados);
  };

  const handleClear = () => {
    setQuery("");
    const handler = latestOnSearch.current;
    if (typeof handler === "function") {
      handler(latestData.current);
    }
  };

  const wrapperClasses = [
    "w-full",
    centered ? "flex justify-center" : "",
    withBottomSpacing ? "mb-4" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const containerClasses = ["w-full", maxWidthClassName, containerClassName].filter(Boolean).join(" ");

  return (
    <div className={wrapperClasses}>
      <div className={containerClasses}>
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={handleChange}
            placeholder={placeholder}
            className={`w-full rounded-md border-2 border-[#111827] bg-[#E5E5E5] px-4 py-2 pl-10 text-[#111827] shadow-sm transition duration-200 focus:outline-none focus:ring-2 focus:ring-[#FFD700] dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200 dark:focus:ring-[#B8860B] placeholder:text-gray-500 dark:placeholder:text-gray-400 ${inputClassName}`}
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-7 top-1/2 -translate-y-1/2 text-lg text-[#111827] dark:text-gray-300"
              title="Limpiar"
            >
              ×
            </button>
          )}
          <i
            className="bi bi-search absolute right-3 top-1/2 -translate-y-1/2 text-lg text-[#111827] dark:text-gray-300"
            title="Buscar"
          ></i>
        </div>
      </div>
    </div>
  );
};
