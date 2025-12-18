import { useEffect, useMemo, useRef, useState } from "react";
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

  // Evitar mostrar loader cuando no hay cambios nuevos en datos ya cargados
  const dataSignature = useMemo(() => JSON.stringify(rows), [rows]);
  const lastSignatureRef = useRef(null);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [shouldShowLoader, setShouldShowLoader] = useState(false);

  useEffect(() => {
    if (isLoading) {
      const changed = !hasLoadedOnce || dataSignature !== lastSignatureRef.current;
      if (changed) {
        setShouldShowLoader(true);
      }
    } else {
      setShouldShowLoader(false);
      lastSignatureRef.current = dataSignature;
      setHasLoadedOnce(true);
    }
  }, [isLoading, dataSignature, hasLoadedOnce]);

  const showLoader = shouldShowLoader;

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
        <div className={`w-full overflow-x-auto sm:rounded-md ${containerClass}`}>
          {/* Mostrar skeleton encima pero mantener la tabla en el DOM para accesibilidad/testing */}
          {showLoader && (
            <Skeleton lines={4} className="py-4" />
          )}
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
      </div>
      {/* Mobile */}
      <div className="mt-4 space-y-4 md:hidden" data-testid={`${testId}-mobile`}>
        {showLoader ? (
          <Skeleton lines={3} className="py-3" />
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
