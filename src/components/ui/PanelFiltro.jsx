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
  const [modulo, setModulo] = useState("");
  const [cohorte, setCohorte] = useState("");
  const [sprint, setSprint] = useState("");
  const [review, setReview] = useState("");
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

    if (modulo) {
      const target = ensureModuleLabel(modulo);
      out = out.filter((item) => ensureModuleLabel(item?.modulo) === target);
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

    if (review && reviewField) {
      out = out.filter((item) => {
        const val = item?.[reviewField];
        if (val === undefined || val === null || val === "") return false;
        const selNum = Number(review);
        const valNum = Number(val);
        if (Number.isFinite(selNum) && Number.isFinite(valNum)) {
          return valNum === selNum;
        }
        return String(val).toLowerCase() === String(review).toLowerCase();
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
  }, [searchResults, modulo, cohorte, desde, hasta, orden, data, showAlphaSort]);

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
    setModulo("");
    setCohorte("");
    setSprint("");
    setReview("");
    setDesde("");
    setHasta("");
    setOrden("none");
    setSearchResults(data);
    onChange?.(data);
  };

  return (
    <div data-testid={testId} className={`w-full px-4 ${className}`}>
      <div className="w-full rounded-md border-2 border-[#111827]/30 bg-white p-3 shadow-sm dark:border-[#333] dark:bg-[#1E1E1E]">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 sm:flex sm:items-center">
            <SearchBar
              data={data}
              fields={searchFields}
              placeholder="Buscar"
              onSearch={handleSearch}
            />
          </div>
          <div className="sm:flex sm:items-center">
            <Button
              type="button"
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={() => setOpen((prev) => !prev)}
              aria-expanded={open}
              aria-controls={`${testId}-panel`}
            >
              Filtro
            </Button>
          </div>
        </div>

        {open && (
          <div id={`${testId}-panel`} className="mt-3 flex flex-col gap-3 md:gap-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col gap-1">
                <label htmlFor="filtro-modulo" className="text-xs font-bold text-[#111827] dark:text-gray-200">Módulo</label>
                <select
                  id="filtro-modulo"
                  value={modulo}
                  onChange={(e) => setModulo(e.target.value)}
                  className="w-full rounded border border-[#111827]/40 px-2 py-2 text-sm dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200"
                >
                  <option value="">Todos</option>
                  {MODULE_OPTIONS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="filtro-cohorte" className="text-xs font-bold text-[#111827] dark:text-gray-200">Cohorte</label>
                <input
                  id="filtro-cohorte"
                  type="number"
                  min={1}
                  value={cohorte}
                  onChange={(e) => setCohorte(e.target.value)}
                  placeholder="Ej: 3"
                  className="w-full rounded border border-[#111827]/40 px-2 py-2 text-sm dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200"
                />
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

              {reviewField && (
                <div className="flex flex-col gap-1">
                  <label htmlFor="filtro-review" className="text-xs font-bold text-[#111827] dark:text-gray-200">Review</label>
                  <select
                    id="filtro-review"
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    className="w-full rounded border border-[#111827]/40 px-2 py-2 text-sm dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200"
                  >
                    <option value="">Todos</option>
                    {Array.from(
                      new Set(
                        (Array.isArray(data) ? data : [])
                          .map((it) => it?.[reviewField])
                          .filter((v) => v !== undefined && v !== null && v !== "")
                          .map((v) => String(v))
                      )
                    )
                      .sort((a, b) => {
                        const na = Number(a);
                        const nb = Number(b);
                        if (Number.isFinite(na) && Number.isFinite(nb)) return na - nb;
                        return a.localeCompare(b);
                      })
                      .map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              <div className="flex flex-col gap-1">
                <label htmlFor="filtro-orden" className="text-xs font-bold text-[#111827] dark:text-gray-200">Orden alfabético</label>
                <select
                  id="filtro-orden"
                  value={orden}
                  onChange={(e) => setOrden(e.target.value)}
                  className="w-full rounded border border-[#111827]/40 px-2 py-2 text-sm dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200"
                  disabled={!showAlphaSort}
                >
                  <option value="none">Sin ordenar</option>
                  <option value="asc">A → Z</option>
                  <option value="desc">Z → A</option>
                </select>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
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
