// === Search Bar ===
// Campo de busqueda reutilizable con filtrado in-memory segun los campos indicados.
import { useState, useEffect } from "react";

export const SearchBar = ({
  data = [],
  onSearch,
  fields = [],
  placeholder = "Buscar...",
}) => {
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!onSearch) return;

    const lowerQuery = query.toLowerCase().trim();

    if (lowerQuery === "") {
      onSearch(data);
      return;
    }

    const filtered = data.filter((item) =>
      fields.some((field) => {
        const value = String(item?.[field] ?? "").toLowerCase();
        return value.includes(lowerQuery);
      })
    );

    onSearch(filtered);
  }, [query, data, fields, onSearch]);

  return (
    <div className="w-full flex justify-center mb-4">
      <div className="relative w-full max-w-md">
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-2 rounded-md border-2 border-[#111827] dark:border-[#444]
                     bg-[#E5E5E5] dark:bg-[#2A2A2A] text-[#111827] dark:text-gray-200
                     focus:outline-none focus:ring-2 focus:ring-[#FFD700] dark:focus:ring-[#B8860B]
                     placeholder:text-gray-500 dark:placeholder:text-gray-400
                     transition duration-200"
        />
        <i
          className="bi bi-search absolute right-3 top-1/2 -translate-y-1/2 text-[#111827] dark:text-gray-300 text-lg"
          title="Buscar"
        ></i>
      </div>
    </div>
  );
};
