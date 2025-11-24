import { EmptyRow } from "./EmptyRow";
import { Skeleton } from "./Skeleton";

/**
 * ARQUITECTURA (Fusion GenericTable):
 * Este componente ahora soporta un modo responsive opcional que reemplaza
 * al antiguo `GenericTable.jsx`, consolidando lógica de:
 *  - Render desktop + mobile cards
 *  - Skeletons de loading
 *  - Mensajes de vacío móviles
 *  - Test IDs estables para E2E
 * Mantiene compatibilidad retro: si `responsive` es false (default) renderiza
 * únicamente la tabla clásica sin wrappers adicionales.
 *
 * Diseñado para mantener el aspecto retro del proyecto:
 * - Bordes marcados
 * - Encabezado azul oscuro
 * - Sombras suaves
 * - Texto centrado
 */
export const Table = ({
  // Base props
  columns = [],
  data = [],
  renderRow,
  containerClass = "",
  className = "",
  minWidth = "min-w-[680px]",
  fixedHeader = false,
  // Responsive fusion props
  responsive = false,
  renderMobileCard,
  isLoading = false,
  testId = "generic-table",
  emptyMessage = "No hay elementos para mostrar.",
}) => {
  const normalizedColumns = Array.isArray(columns) ? columns : [];
  const rows = Array.isArray(data) ? data : [];
  const hasData = rows.length > 0;
  const showLoader = isLoading;

  // --- Modo clásico (retro compatible) ---
  if (!responsive) {
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
  }

  // --- Modo responsive (derivado de GenericTable) ---
  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block" data-testid={`${testId}-desktop`}>
        {showLoader ? (
          <div className="space-y-3 py-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} height="2.75rem" />
            ))}
          </div>
        ) : (
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
        )}
      </div>
      {/* Mobile */}
      <div className="mt-4 space-y-4 px-2 md:hidden" data-testid={`${testId}-mobile`}>
        {showLoader ? (
          <div className="space-y-3 py-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} height="4rem" />
            ))}
          </div>
        ) : hasData && renderMobileCard ? (
          rows.map((item, index) => (
            <div key={item?.id ?? item?._id ?? `mobile-card-${index}`}>
              {renderMobileCard(item, index)}
            </div>
          ))
        ) : !hasData ? (
          <EmptyRow.Mobile message={emptyMessage} />
        ) : null}
      </div>
    </>
  );
};
