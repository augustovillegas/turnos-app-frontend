/**
 * Componente de tabla genérica reutilizable
 *
 * Diseño por defecto:
 * - Bordes negros definidos
 * - Encabezado azul oscuro con texto blanco
 * - Celdas centradas
 * - Fondo blanco / gris oscuro (modo oscuro)
 * - Estilo limpio, profesional y coherente con DashboardProfesor
 *
 * Props:
 * - columns: array con nombres de columnas
 * - data: array de objetos con la información
 * - renderRow: función opcional para renderizar una fila personalizada
 * - containerClass: clases extra para el contenedor scrollable
 * - className: clases extra para la tabla
 * - minWidth: ancho mínimo de la tabla
 */
export const Table = ({
  columns = [],
  data = [],
  renderRow,
  containerClass = "",
  className = "",
  minWidth = "min-w-[800px]",
}) => {
  return (
    <div className={`w-full overflow-x-auto ${containerClass}`}>
      <table
        className={`w-full ${minWidth} border-2 border-[#111827] dark:border-[#333]
                    bg-white dark:bg-[#1E1E1E] text-sm text-center
                    transition-colors duration-300 ${className}`}
      >
        {/* ===== Encabezado ===== */}
        <thead className="bg-[#1E3A8A] dark:bg-[#0A2E73] text-white">
          <tr>
            {columns.map((col, i) => (
              <th
                key={i}
                className="p-2 border border-[#111827] dark:border-[#333] font-semibold"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>

        {/* ===== Cuerpo ===== */}
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="p-4 text-center text-gray-600 dark:text-gray-400"
              >
                No hay datos para mostrar
              </td>
            </tr>
          ) : (
            data.map((item, i) => (
              <tr key={i} className="transition-colors duration-200">
                {renderRow
                  ? renderRow(item, i)
                  : Object.values(item).map((val, j) => (
                      <td
                        key={j}
                        className="border border-[#111827] dark:border-[#333] 
                                 p-2 text-[#111827] dark:text-gray-200 align-middle"
                      >
                        {val}
                      </td>
                    ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
