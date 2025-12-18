import { useMemo } from "react";
import { KPI_DEFINITIONS, CHART_DEFINITIONS } from "./kpiDefinitions";
import { buildKpiIndexes } from "./selectors";

const formatValue = (value, format) => {
  if (value == null || Number.isNaN(value)) return "—";
  if (format === "percent") {
    const num = typeof value === "number" ? value : Number(value);
    return `${Math.max(0, Math.min(100, Math.round(num)))}%`;
  }
  if (format === "days") return `${value} días`;
  if (format === "time") return `${value}h`;
  return value.toLocaleString("es-AR");
};

export const useIndicators = ({
  usuarios,
  entregas,
  turnos,
  role,
  filters,
  scope,
}) => {
  const context = useMemo(
    () =>
      buildKpiIndexes({
        usuarios: usuarios || [],
        entregas: entregas || [],
        turnos: turnos || [],
        filters: filters || {},
        scope,
      }),
    [usuarios, entregas, turnos, filters, scope]
  );

  const kpisByDomain = useMemo(() => {
    const entries = KPI_DEFINITIONS.filter((def) =>
      def.visibleWhen ? def.visibleWhen({ role, filters, scope }) : true
    )
      .map((def) => {
        const value = def.getValue?.({ ...context, role, filters, scope }) ?? null;
        return {
          ...def,
          value,
          display: formatValue(value, def.format),
        };
      })
      .filter((item) => item.value != null || item.format === "percent");

    return entries.reduce((acc, item) => {
      const domain = item.domain || "otros";
      if (!acc[domain]) acc[domain] = [];
      acc[domain].push(item);
      return acc;
    }, {});
  }, [context, role, filters, scope]);

  const chartDefsByDomain = useMemo(() => {
    const entries = CHART_DEFINITIONS.filter((def) =>
      def.visibleWhen ? def.visibleWhen({ role, filters, scope }) : true
    )
      .map((def) => ({
        ...def,
        series: def.getSeries?.({ ...context, role, filters, scope }) || [],
      }))
      .filter((def) => Array.isArray(def.series) && def.series.length > 0);

    return entries.reduce((acc, item) => {
      const domain = item.domain || "otros";
      if (!acc[domain]) acc[domain] = [];
      acc[domain].push(item);
      return acc;
    }, {});
  }, [context, role, filters, scope]);

  return {
    kpisByDomain,
    chartDefsByDomain,
    context,
  };
};
