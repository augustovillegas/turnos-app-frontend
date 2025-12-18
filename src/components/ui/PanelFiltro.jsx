import { useCallback, useEffect, useMemo, useState } from "react";
import { SearchBar } from "./SearchBar";
import { Button } from "./Button";
import { MODULE_OPTIONS, ensureModuleLabel } from "../../utils/moduleMap";

const ROLE_FIELDS = ["nombre", "name", "email", "rol", "role", "tipo", "modulo", "cohorte"];
const DEFAULT_DATE_FIELDS = ["createdAt", "fechaAlta", "fecha", "updatedAt"];

const parseDate = (value) => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

export const PanelFiltro = ({
  data = [],
  onChange,
  className = "",
  showAlphaSort = true,
  searchFields = ROLE_FIELDS,
  testId = "panel-filtro",
  dateFields = DEFAULT_DATE_FIELDS,
  sprintField = null,
  reviewField = null,
}) => {
  const [searchResults, setSearchResults] = useState(data);
  const [modulosSeleccionados, setModulosSeleccionados] = useState([]);
  const [cohorte, setCohorte] = useState("");
  const [sprint, setSprint] = useState("");
  const [reviewsSeleccionadas, setReviewsSeleccionadas] = useState([]);
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [orden, setOrden] = useState("none");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setSearchResults(data);
  }, [data]);

  const filtered = useMemo(() => {
    const base = Array.isArray(searchResults) ? searchResults : data;
    let out = base;

    if (modulosSeleccionados.length > 0) {
      const targetModules = modulosSeleccionados.map(ensureModuleLabel);
      out = out.filter((item) => targetModules.includes(ensureModuleLabel(item?.modulo)));
    }

    if (cohorte) {
      const c = Number(cohorte);
      if (Number.isFinite(c)) {
        out = out.filter((item) => Number(item?.cohorte) === c);
      }
    }

    if (sprint && sprintField) {
      const s = Number(sprint);
      if (Number.isFinite(s)) {
        out = out.filter((item) => Number(item?.[sprintField]) === s);
      }
    }

    if (reviewsSeleccionadas.length > 0 && reviewField) {
      const selectedReviews = reviewsSeleccionadas.map((v) => String(v).toLowerCase());
      out = out.filter((item) => {
        const val = item?.[reviewField];
        if (val === undefined || val === null || val === "") return false;
        return selectedReviews.includes(String(val).toLowerCase());
      });
    }

    if (desde || hasta) {
      const from = desde ? parseDate(desde) : null;
      const to = hasta ? parseDate(hasta) : null;
      out = out.filter((item) => {
        const dateValue = (dateFields || DEFAULT_DATE_FIELDS)
          .map((k) => parseDate(item?.[k]))
          .find(Boolean);
        if (!from && !to) return true;
        if (!dateValue) return true;
        if (from && dateValue < from) return false;
        if (to && dateValue > to) return false;
        return true;
      });
    }

    if (showAlphaSort && orden !== "none") {
      out = [...out].sort((a, b) => {
        const A = String(a?.nombre ?? a?.name ?? a?.email ?? "").toLowerCase();
        const B = String(b?.nombre ?? b?.name ?? b?.email ?? "").toLowerCase();
        return orden === "asc" ? A.localeCompare(B) : B.localeCompare(A);
      });
    }

    return out;
  }, [
    searchResults,
    modulosSeleccionados,
    reviewsSeleccionadas,
    cohorte,
    sprint,
    reviewField,
    sprintField,
    desde,
    hasta,
    orden,
    data,
    showAlphaSort,
    dateFields,
  ]);

  const handleSearch = useCallback(
    (results) => {
      setSearchResults(Array.isArray(results) ? results : data);
    },
    [data]
  );

  const handleApply = useCallback(() => {
    onChange?.(filtered);
  }, [filtered, onChange]);

  const resetFilters = () => {
    setModulosSeleccionados([]);
    setCohorte("");
    setSprint("");
    setReviewsSeleccionadas([]);
    setDesde("");
    setHasta("");
    setOrden("none");
    setSearchResults(data);
    onChange?.(data);
  };

  const toggleModulo = (value) => {
    setModulosSeleccionados((prev) =>
      prev.includes(value) ? prev.filter((m) => m !== value) : [...prev, value]
    );
  };

  const toggleReview = (value) => {
    setReviewsSeleccionadas((prev) =>
      prev.includes(value) ? prev.filter((r) => r !== value) : [...prev, value]
    );
  };

  const cohorteOptions = useMemo(() => {
    return Array.from(
      new Set(
        (Array.isArray(data) ? data : [])
          .map((it) => it?.cohorte)
          .filter((v) => v !== undefined && v !== null && v !== "")
          .map((v) => Number(v))
          .filter(Number.isFinite)
      )
    ).sort((a, b) => a - b);
  }, [data]);

  const toggleCohorte = (value) => {
    setCohorte((prev) => (prev === String(value) ? "" : String(value)));
  };

  const reviewOptions = useMemo(() => {
    return Array.from(
      new Set(
        (Array.isArray(data) ? data : [])
          .map((it) => it?.[reviewField])
          .filter((v) => v !== undefined && v !== null && v !== "")
          .map((v) => String(v))
      )
    ).sort((a, b) => {
      const na = Number(a);
      const nb = Number(b);
      if (Number.isFinite(na) && Number.isFinite(nb)) return na - nb;
      return a.localeCompare(b);
    });
  }, [data, reviewField]);

  const chipBaseClass =
    "inline-flex items-center gap-2 rounded-full border-2 px-3 py-1.5 text-sm transition-colors duration-150";
  const chipActiveClass =
    "border-[#0F3D3F] bg-[#E5F0FF] text-[#0F3D3F] dark:border-[#93C5FD] dark:bg-[#0B1B3D] dark:text-[#93C5FD]";
  const chipInactiveClass =
    "border-[#111827]/30 bg-white text-[#111827] hover:border-[#1E3A8A] focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#FFD700] dark:border-[#444] dark:bg-[#1E1E1E] dark:text-gray-200 dark:hover:border-[#93C5FD] dark:focus:ring-[#B8860B]";

  return (
    <div data-testid={testId} className={`w-full px-4 ${className}`}>
      <div className="w-full rounded-md border-2 border-[#111827]/30 bg-white p-3 shadow-sm dark:border-[#333] dark:bg-[#1E1E1E]">
        <div className="flex flex-col gap-3">
          <div className="flex-1">
            <SearchBar
              data={data}
              fields={searchFields}
              placeholder="Buscar"
              onSearch={handleSearch}
            />
          </div>
          <button
            type="button"
            className="w-full flex items-center justify-between gap-3 rounded-md border-2 border-[#111827]/40 bg-[#F4F4F4] px-4 py-2 text-sm font-semibold text-[#111827] shadow-sm transition hover:border-[#1E3A8A] hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#FFD700] dark:border-[#444] dark:bg-[#1E1E1E] dark:text-gray-100 dark:hover:border-[#93C5FD] dark:hover:bg-[#0F172A] dark:focus:ring-[#B8860B]"
            onClick={() => setOpen((prev) => !prev)}
            aria-expanded={open}
            aria-controls={`${testId}-panel`}
          >
            <span className="flex items-center gap-2">
              <i className="bi bi-filter"></i>
              Filtros avanzados
            </span>
            <i className={`bi ${open ? "bi-chevron-up" : "bi-chevron-down"} text-base`}></i>
          </button>
        </div>

        {open && (
          <div id={`${testId}-panel`} className="mt-3 flex flex-col gap-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex flex-col gap-2 md:col-span-3">
                <p className="text-xs font-bold text-[#111827] dark:text-gray-200">Modulo</p>
                <div className="flex flex-wrap gap-2">
                  {MODULE_OPTIONS.map((m) => {
                    const active = modulosSeleccionados.includes(m.value);
                    return (
                      <button
                        key={m.value}
                        type="button"
                        onClick={() => toggleModulo(m.value)}
                        onKeyDown={(evt) => {
                          if (evt.key === "Enter" || evt.key === " ") {
                            evt.preventDefault();
                            toggleModulo(m.value);
                          }
                        }}
                        aria-label={`Modulo ${m.label} ${active ? "seleccionado" : "no seleccionado"}`}
                        className={`${chipBaseClass} ${
                          active ? chipActiveClass : chipInactiveClass
                        }`}
                        aria-pressed={active}
                      >
                        <span className={`h-2 w-2 rounded-full ${active ? "bg-[#0F3D3F] dark:bg-[#93C5FD]" : "bg-gray-400 dark:bg-gray-500"}`}></span>
                        {m.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <p className="text-xs font-bold text-[#111827] dark:text-gray-200">Cohorte</p>
                <div className="flex flex-wrap gap-2">
                  {cohorteOptions.length === 0 ? (
                    <input
                      id="filtro-cohorte"
                      type="number"
                      min={1}
                      value={cohorte}
                      onChange={(e) => setCohorte(e.target.value)}
                      placeholder="Ej: 3"
                      className="w-full rounded border border-[#111827]/40 px-2 py-2 text-sm dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200"
                    />
                  ) : (
                    cohorteOptions.map((opt) => {
                      const active = String(opt) === String(cohorte);
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => toggleCohorte(opt)}
                          onKeyDown={(evt) => {
                            if (evt.key === "Enter" || evt.key === " ") {
                              evt.preventDefault();
                              toggleCohorte(opt);
                            }
                          }}
                          aria-label={`Cohorte ${opt} ${active ? "seleccionada" : "no seleccionada"}`}
                          className={`${chipBaseClass} ${
                            active ? chipActiveClass : chipInactiveClass
                          }`}
                          aria-pressed={active}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${
                              active ? "bg-[#0F3D3F] dark:bg-[#93C5FD]" : "bg-gray-400 dark:bg-gray-500"
                            }`}
                          ></span>
                          Cohorte {opt}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {sprintField && (
                <div className="flex flex-col gap-1">
                  <label htmlFor="filtro-sprint" className="text-xs font-bold text-[#111827] dark:text-gray-200">Sprint</label>
                  <input
                    id="filtro-sprint"
                    type="number"
                    min={1}
                    value={sprint}
                    onChange={(e) => setSprint(e.target.value)}
                    placeholder="Ej: 1"
                    className="w-full rounded border border-[#111827]/40 px-2 py-2 text-sm dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200"
                  />
                </div>
              )}

              {reviewField && reviewOptions.length > 0 && (
                <div className="flex flex-col gap-2 md:col-span-2">
                  <p className="text-xs font-bold text-[#111827] dark:text-gray-200">Review</p>
                  <div className="flex flex-wrap gap-2">
                    {reviewOptions.map((opt) => {
                      const active = reviewsSeleccionadas.includes(opt);
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => toggleReview(opt)}
                          onKeyDown={(evt) => {
                            if (evt.key === "Enter" || evt.key === " ") {
                              evt.preventDefault();
                              toggleReview(opt);
                            }
                          }}
                          aria-label={`Review ${opt} ${active ? "seleccionada" : "no seleccionada"}`}
                          className={`${chipBaseClass} ${
                            active ? chipActiveClass : chipInactiveClass
                          }`}
                          aria-pressed={active}
                        >
                          <span className={`h-2 w-2 rounded-full ${active ? "bg-[#0F3D3F] dark:bg-[#93C5FD]" : "bg-gray-400 dark:bg-gray-500"}`}></span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1">
                <label
                  htmlFor="filtro-orden"
                  className="text-xs font-bold text-[#111827] dark:text-gray-200"
                >
                  Orden alfabetico (por nombre)
                </label>
                <select
                  id="filtro-orden"
                  value={orden}
                  onChange={(e) => setOrden(e.target.value)}
                  className="w-full rounded border border-[#111827]/40 px-2 py-2 text-sm dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200"
                  disabled={!showAlphaSort}
                >
                  <option value="none">Sin ordenar</option>
                  <option value="asc">A -&gt; Z</option>
                  <option value="desc">Z -&gt; A</option>
                </select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label htmlFor="filtro-desde" className="text-xs font-bold text-[#111827] dark:text-gray-200">Fecha desde</label>
                <input
                  id="filtro-desde"
                  type="date"
                  value={desde}
                  onChange={(e) => setDesde(e.target.value)}
                  className="w-full rounded border border-[#111827]/40 px-2 py-2 text-sm dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="filtro-hasta" className="text-xs font-bold text-[#111827] dark:text-gray-200">Fecha hasta</label>
                <input
                  id="filtro-hasta"
                  type="date"
                  value={hasta}
                  onChange={(e) => setHasta(e.target.value)}
                  className="w-full rounded border border-[#111827]/40 px-2 py-2 text-sm dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
              <Button variant="secondary" onClick={resetFilters} className="w-full sm:w-auto">
                Limpiar filtros
              </Button>
              <Button variant="primary" onClick={handleApply} className="w-full sm:w-auto">
                Aplicar filtros
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
