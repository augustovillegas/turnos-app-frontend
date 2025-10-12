import PropTypes from "prop-types";

/**
 * Filtro reutilizable por número de Review (1–10)
 * - Recibe value y onChange como props controladas
 * - Se usa en dashboards y pantallas de creación de turnos
 */
export const ReviewFilter = ({
  value,
  onChange,
  label = "Filtrar por Review",
  className = "",
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      <label className="block text-sm font-bold mb-1 text-[#111827] dark:text-gray-200">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border border-[#111827] dark:border-[#444] px-2 py-1 rounded dark:bg-[#2A2A2A] dark:text-gray-200 transition-colors duration-300"
      >
        <option value="todos">Todos</option>
        {[...Array(10)].map((_, i) => (
          <option key={i + 1} value={i + 1}>
            Review {i + 1}
          </option>
        ))}
      </select>
    </div>
  );
};

ReviewFilter.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string,
  className: PropTypes.string,
};
