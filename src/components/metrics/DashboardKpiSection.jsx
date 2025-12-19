import { useEffect, useMemo, useState } from "react";
import { LayoutWrapper } from "../layout/LayoutWrapper";
import { useIndicators } from "./useIndicators";
import { ensureModuleLabel } from "../../utils/moduleMap";

// Paleta sólida inspirada en el look Windows 98 que usa el resto del panel.
const DOMAIN_COLORS = {
  alumnos: "#1E3A8A", // azul encabezado
  entregables: "#0F766E", // verde azulado principal
  turnos: "#B45309", // naranja tostado para contrastar
};

const RANGE_OPTIONS = [
  { value: "7d", label: "Últimos 7 días" },
  { value: "30d", label: "Últimos 30 días" },
  { value: "90d", label: "Últimos 90 días" },
  { value: "all", label: "Todo el histórico" },
];

// Breves descripciones para mostrar en el ícono de información.
const KPI_DESCRIPTIONS = {
  sa_students_total: "Total de alumnos en plataforma (sin filtros de módulo/cohorte).",
  prof_students_total: "Alumnos asignados al profesor actual.",
  students_active: "Alumnos con estado activo/aprobado.",
  students_inactive: "Alumnos con estado pendiente o inactivo.",
  students_recent_30d: "Altas de alumnos en los últimos 30 días.",
  students_recursantes: "Alumnos marcados como recursantes.",
  deliverables_total_range: "Entregables creados dentro del rango seleccionado.",
  deliverables_pending: "Entregables entregados pero aún sin corrección.",
  deliverables_overdue: "Entregables vencidos sin aprobación.",
  deliverables_approved: "Entregables aprobados.",
  deliverables_rejected: "Entregables desaprobados o rechazados.",
  deliverables_reviewed_7d: "Entregables corregidos en los últimos 7 días.",
  appointments_next_7d: "Turnos agendados para los próximos 7 días.",
  appointments_today: "Turnos agendados para hoy.",
  appointments_approved: "Turnos en estado aprobado.",
  appointments_cancelled: "Turnos cancelados/rechazados.",
  appointments_occupancy: "Porcentaje de turnos ocupados sobre el total listados.",
  appointments_noshow_rate: "Porcentaje de turnos marcados como no-show/ausente.",
};

const resolveAccent = (domain) => DOMAIN_COLORS[domain] || "#1F2937";

const KpiCard = ({ kpi, domain, onInfo }) => {
  const description = KPI_DESCRIPTIONS[kpi.key] || "Indicador calculado con los filtros y el alcance vigentes.";

  return (
    <div className="flex flex-col gap-2 rounded-lg border-2 border-[#111827] bg-[#E5E7EB] p-4 shadow-[4px_4px_0_#111827] dark:border-[#333] dark:bg-[#1E1E1E]">
      <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#1f2937] dark:text-gray-200">
        {kpi.group || "KPI"}
      </span>
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-lg font-bold text-[#0f172a] dark:text-white">{kpi.label}</h3>
        <button
          type="button"
          className="flex h-6 w-6 items-center justify-center rounded-full border border-[#111827] bg-white text-xs font-bold text-[#0f172a] shadow-[2px_2px_0_#111827] dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-100"
          title={description}
          aria-label={`Información: ${description}`}
          onClick={() => onInfo?.(kpi, description)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onInfo?.(kpi, description);
            }
          }}
          style={{ outline: "none", boxShadow: "none" }}
          onFocus={(e) => {
            e.currentTarget.style.boxShadow = "0 0 0 3px #B8860B";
          }}
          onBlur={(e) => {
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          i
        </button>
      </div>
      <div className="text-3xl font-black text-[#0b3b3c] dark:text-white">{kpi.display}</div>
      {kpi.hint && (
        <p className="text-xs text-[#0f172a]/80 dark:text-gray-300">
          {kpi.hint}
        </p>
      )}
      <div
        className="h-1.5 w-full rounded-full"
        style={{ backgroundColor: resolveAccent(domain) }}
      />
    </div>
  );
};

const ChartPreview = ({ def, domain }) => {
  const max = useMemo(
    () =>
      def.series.reduce(
        (highest, item) =>
          item?.value != null && Number(item.value) > highest ? Number(item.value) : highest,
        0
      ) || 1,
    [def.series]
  );

  return (
    <div className="rounded-lg border-2 border-[#111827] bg-[#F8FAFC] p-4 shadow-[4px_4px_0_#111827] dark:border-[#333] dark:bg-[#1E1E1E]">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-[#0f172a] dark:text-white">{def.title}</h4>
        <span className="text-[11px] font-semibold uppercase tracking-wide text-[#0f172a]/70 dark:text-gray-300">
          Snapshot
        </span>
      </div>
      <div className="space-y-3">
        {def.series.map((item) => {
          const pct = Math.min(100, Math.round((Number(item.value || 0) / max) * 100));
          return (
            <div key={`${def.key}-${item.name}`} className="space-y-1">
              <div className="flex items-center justify-between text-xs font-medium text-[#0f172a] dark:text-gray-200">
                <span className="truncate">{item.name}</span>
                <span>{item.value ?? 0}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-sm border border-[#cbd5e1] bg-[#e2e8f0] dark:border-[#444] dark:bg-[#2A2A2A]">
                <div
                  className="h-full"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: resolveAccent(domain),
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const DashboardKpiSection = ({
  role = "superadmin",
  usuarios = [],
  turnos = [],
  entregas = [],
  scope = {},
  withWrapper = false,
}) => {
  const [range, setRange] = useState("30d");
  const [activeDomain, setActiveDomain] = useState("alumnos");
  const [infoModal, setInfoModal] = useState(null);

  const filters = useMemo(() => ({ range }), [range]);

  const { kpisByDomain, chartDefsByDomain } = useIndicators({
    usuarios,
    turnos,
    entregas,
    role,
    filters,
    scope,
  });

  const domains = useMemo(() => {
    const available = Object.keys(kpisByDomain);
    if (available.includes(activeDomain)) return available;
    return available;
  }, [kpisByDomain, activeDomain]);

  useEffect(() => {
    if (!domains.includes(activeDomain) && domains.length > 0) {
      setActiveDomain(domains[0]);
    }
  }, [domains, activeDomain]);

  const Container = withWrapper ? LayoutWrapper : "div";
  const containerProps = withWrapper
    ? { className: "text-[#0f172a] dark:text-gray-100" }
    : { className: "flex w-full flex-col gap-6 text-[#0f172a] dark:text-gray-100" };

  const scopeLabel = useMemo(() => {
    if (!scope) return null;
    const parts = [];
    if (scope.modulo) parts.push(`Módulo ${ensureModuleLabel(scope.modulo)}`);
    if (scope.cohorte) parts.push(`Cohorte ref. ${scope.cohorte}`); // cohorte solo como referencia numérica
    return parts.length ? `Contexto: ${parts.join(" · ")}` : null;
  }, [scope]);

  const currentKpis = kpisByDomain[activeDomain] || [];
  const charts = chartDefsByDomain[activeDomain] || [];

  return (
    <Container {...containerProps}>
      <div className="rounded-xl border-2 border-[#111827] bg-[#C0C0C0] p-5 shadow-[6px_6px_0_#111827] dark:border-[#333] dark:bg-[#1E1E1E]">
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0f172a] dark:text-gray-200">
              Panel de métricas
            </p>
            <h2 className="text-2xl font-black text-[#0f172a] dark:text-white">
              Salud del proyecto y foco operativo
            </h2>
            <p className="text-sm text-[#0f172a]/80 dark:text-gray-300">
              Visión curada por dominio con datos listos para graficar.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 rounded-md border-2 border-[#111827] bg-white px-2 py-1 text-xs font-semibold shadow-[3px_3px_0_#111827] dark:border-[#333] dark:bg-[#1E1E1E] dark:text-gray-100">
              <span>Rango</span>
              <select
                value={range}
                onChange={(e) => setRange(e.target.value)}
                className="rounded-sm border border-[#111827] bg-[#F1F5F9] px-2 py-1 text-xs font-semibold text-[#0f172a] outline-none dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200"
              >
                {RANGE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
            {scopeLabel && (
              <span className="rounded-md border-2 border-[#111827] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide shadow-[3px_3px_0_#111827] dark:border-[#333] dark:bg-[#1E1E1E] dark:text-gray-100">
                {scopeLabel}
              </span>
            )}
            <span className="rounded-md border-2 border-[#111827] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide shadow-[3px_3px_0_#111827] dark:border-[#333] dark:bg-[#1E1E1E] dark:text-gray-100">
              Rol: {role}
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-xl border-2 border-[#111827] bg-white p-4 shadow-[6px_6px_0_#111827] dark:border-[#333] dark:bg-[#1E1E1E]">
        <div className="mb-4 flex flex-wrap gap-2">
          {domains.map((domain) => (
            <button
              key={domain}
              onClick={() => setActiveDomain(domain)}
              className={`rounded-md border-2 px-3 py-2 text-sm font-semibold transition bg-[#F3F4F6] dark:bg-[#1E1E1E] ${
                activeDomain === domain
                  ? "border-[#111827] text-white shadow-[3px_3px_0_#111827] dark:border-[#333] dark:shadow-[3px_3px_0_#000000]"
                  : "border-[#111827] text-[#0f172a] hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#111827] dark:border-[#444] dark:text-gray-100 dark:hover:-translate-y-0.5 dark:hover:shadow-[3px_3px_0_#000000]"
              }`}
              style={activeDomain === domain ? { backgroundColor: resolveAccent(domain) } : undefined}
            >
              {domain === "alumnos" && "Alumnos"}
              {domain === "entregables" && "Entregables"}
              {domain === "turnos" && "Turnos"}
              {!["alumnos", "entregables", "turnos"].includes(domain) && domain}
            </button>
          ))}
        </div>

        {currentKpis.length === 0 ? (
          <div className="rounded-md border-2 border-dashed border-[#111827] bg-[#F8FAFC] p-6 text-center text-sm text-[#0f172a]/80 dark:border-[#333] dark:bg-[#1E1E1E] dark:text-gray-300">
            No hay KPIs disponibles para este dominio todavía.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {currentKpis.map((kpi) => (
              <KpiCard
                key={kpi.key}
                kpi={kpi}
                domain={activeDomain}
                onInfo={(item, desc) => setInfoModal({ title: item.label, description: desc })}
              />
            ))}
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {charts.length > 0 ? (
            charts.map((chart) => (
              <ChartPreview key={chart.key} def={chart} domain={activeDomain} />
            ))
          ) : (
            <div className="rounded-md border-2 border-dashed border-[#111827] bg-[#F8FAFC] p-6 text-center text-sm text-[#0f172a]/80 dark:border-[#333] dark:bg-[#1E1E1E] dark:text-gray-200">
              Próximamente gráficos interactivos. Los datos ya están listos para enchufar.
            </div>
          )}
        </div>
      </div>
      {infoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-[90%] max-w-md rounded-lg border-2 border-[#111827] bg-[#E5E7EB] p-5 shadow-[8px_8px_0_#111827] dark:border-[#333] dark:bg-[#1E1E1E]">
            <div className="mb-3 flex items-start justify-between gap-3">
              <h3 className="text-lg font-bold text-[#0f172a] dark:text-white">
                {infoModal.title}
              </h3>
              <button
                type="button"
                onClick={() => setInfoModal(null)}
                className="rounded-full border border-[#111827] bg-white px-2 text-sm font-bold text-[#0f172a] shadow-[2px_2px_0_#111827] hover:bg-[#FFD700] focus:outline-none focus:ring-2 focus:ring-[#FFD700] dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-100"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-[#0f172a] dark:text-gray-200">{infoModal.description}</p>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setInfoModal(null)}
                className="rounded-md border-2 border-[#111827] bg-[#FFD700] px-4 py-1 text-sm font-semibold text-[#111827] shadow-[3px_3px_0_#111827] hover:translate-y-[-1px] dark:border-[#555] dark:bg-[#C9A300] dark:text-white dark:shadow-[3px_3px_0_#000000]"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
};
