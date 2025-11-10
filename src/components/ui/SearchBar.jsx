// === Search Bar ===
// Campo de busqueda reutilizable con filtrado in-memory segun los campos indicados.
import { useState, useEffect, useRef } from "react";

const filtrarDatos = (coleccion, campos, termino) => {
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

export const SearchBar = ({
  data = [],
  onSearch,
  fields = [],
  placeholder = "Buscar...",
  className = "",
  inputClassName = "",
  fluid = false,
}) => {
  const [query, setQuery] = useState("");
  const latestOnSearch = useRef(onSearch);
  const latestData = useRef(data);

  useEffect(() => {
    latestOnSearch.current = onSearch;
  }, [onSearch]);

  useEffect(() => {
    latestData.current = data;
    if (!query.trim()) return;
    const handler = latestOnSearch.current;
    if (typeof handler !== "function") return;
    handler(filtrarDatos(data, fields, query));
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

  return (
    <div className="w-full flex justify-center mb-4">
      <div className="relative w-full max-w-md">
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full px-4 py-2 rounded-md border-2 border-[#111827] dark:border-[#444]
                     bg-[#E5E5E5] dark:bg-[#2A2A2A] text-[#111827] dark:text-gray-200
                     focus:outline-none focus:ring-2 focus:ring-[#FFD700] dark:focus:ring-[#B8860B]
                     placeholder:text-gray-500 dark:placeholder:text-gray-400
                     transition duration-200"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-7 top-1/2 -translate-y-1/2 text-[#111827] dark:text-gray-300 text-lg"
            title="Limpiar"
          >
            ×
          </button>
        )}
        <i
          className="bi bi-search absolute right-3 top-1/2 -translate-y-1/2 text-[#111827] dark:text-gray-300 text-lg"
          title="Buscar"
        ></i>
      </div>
    </div>
  );
};
