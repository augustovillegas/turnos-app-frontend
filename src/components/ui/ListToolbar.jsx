import { useState } from "react";
import { Button } from "./Button";

// Reusable toolbar for data listing components.
// Props:
//  - title: string heading
//  - total: total items count (before filtering)
//  - filtered: count after current filters/search
//  - loading: boolean (disables refresh)
//  - onRefresh: callback to reload data
//  - children: extra controls (filters, selects, buttons)
//  - rightSlot: alternative React node for right aligned area (optional)
export const ListToolbar = ({
  title,
  total = 0,
  filtered = 0,
  loading = false,
  onRefresh,
  children,
  rightSlot,
  currentPage,
  totalPages,
  testId = "list-toolbar",
}) => {
  const showCounts = total != null && filtered != null;
  const showPageInfo =
    typeof currentPage === "number" && typeof totalPages === "number";
  const [internalLoading, setInternalLoading] = useState(false);

  const handleRefresh = async () => {
    if (!onRefresh || loading || internalLoading) return;
    try {
      const maybePromise = onRefresh();
      if (maybePromise && typeof maybePromise.then === "function") {
        setInternalLoading(true);
        await maybePromise.catch(() => {});
      }
    } finally {
      setInternalLoading(false);
    }
  };

  const effectiveLoading = loading || internalLoading;

  return (
    <div
      data-testid={testId}
      className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
    >
      <div className="space-y-1">
        {title && (
          <h2
            className="text-3xl font-bold text-[#1E3A8A] dark:text-[#93C5FD]"
            data-testid={`${testId}-title`}
          >
            {title}
          </h2>
        )}
        {(showCounts || showPageInfo) && (
          <p
            className="text-sm font-medium text-[#111827] dark:text-gray-300 flex flex-wrap gap-2"
            data-testid={`${testId}-meta`}
          >
            {showCounts && (
              <span>
                Mostrando <span className="font-bold">{filtered}</span>
                {filtered !== total && (
                  <>
                    {" "}de <span className="font-bold">{total}</span>
                  </>
                )}
              </span>
            )}
            {showPageInfo && (
              <span>
                Página <span className="font-bold">{currentPage}</span> de
                {" "}
                <span className="font-bold">{totalPages}</span>
              </span>
            )}
          </p>
        )}
      </div>
      <div
        className="flex flex-wrap items-center gap-3"
        data-testid={`${testId}-controls`}
      >
        {children}
        {rightSlot}
        {onRefresh && (
          <Button
            variant="secondary"
            className="px-3 py-1"
            onClick={handleRefresh}
            disabled={effectiveLoading}
            data-testid={`${testId}-refresh`}
          >
            {effectiveLoading ? "Actualizando..." : "Refrescar"}
          </Button>
        )}
      </div>
    </div>
  );
};
