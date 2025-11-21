import { EmptyRow } from "./EmptyRow";

/**
 * Componente de tabla genérica reutilizable
 *
 * Diseñado para mantener el aspecto retro del proyecto:
 * - Bordes marcados
 * - Encabezado azul oscuro
 * - Sombras suaves
 * - Texto centrado
 *
 * Props:
 * - columns: array con nombres de columnas
 * - data: array de objetos con la información
 * - renderRow: función opcional para renderizar una fila personalizada
 * - containerClass: clases extra para el contenedor scrollable
 * - className: clases extra para la tabla
 * - minWidth: ancho mínimo de la tabla
 * - fixedHeader: encabezado fijo opcional
 */
export const Table = ({
  columns = [],
  data = [],
  renderRow,
  containerClass = "",
  className = "",
  minWidth = "min-w-[680px]",
  fixedHeader = false,
}) => {
  const normalizedColumns = Array.isArray(columns) ? columns : [];
  const rows = Array.isArray(data) ? data : [];
  const hasData = rows.length > 0;

  return (
    <div className={`w-full overflow-x-auto sm:rounded-md ${containerClass}`}>
      <table
        role="table"
        aria-label="Tabla de datos"
        className={`w-full max-w-full ${minWidth} border-2 border-[#111827] dark:border-[#333]
              bg-white dark:bg-[#1E1E1E] text-sm text-center
              transition-colors duration-300 ${className}`}
      >
        <thead
          role="rowgroup"
          className={`${fixedHeader ? "sticky top-0 z-10" : ""} 
                      bg-[#1E3A8A] dark:bg-[#0A2E73] text-white`}
        >
          <tr role="row">
            {normalizedColumns.map((col, i) => (
              <th
                key={i}
                scope="col"
                role="columnheader"
                className="p-2 border border-[#111827] dark:border-[#333] font-semibold"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>

        <tbody role="rowgroup">
          {hasData ? (
            rows.map((item, i) => (
              <tr
                key={item?.id ?? item?._id ?? `row-${i}`}
                role="row"
                className="transition-colors duration-200 hover:bg-[#C0C0C0]/30 dark:hover:bg-[#2A2A2A]/40"
              >
                {renderRow
                  ? renderRow(item, i)
                  : Object.values(item).map((val, j) => (
                      <td
                        key={j}
                        role="cell"
                        className="border border-[#111827] dark:border-[#333] 
                                   p-2 text-[#111827] dark:text-gray-200 align-middle"
                      >
                        {val}
                      </td>
                    ))}
              </tr>
            ))
          ) : (
            <EmptyRow columns={normalizedColumns} />
          )}
        </tbody>
      </table>
    </div>
  );
};
