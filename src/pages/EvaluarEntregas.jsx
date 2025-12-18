// === Evaluar Entregas ===
// Panel para revisar, aprobar o rechazar entregables pendientes.
import { useEffect, useMemo, useState, useRef } from "react";
import { useAppData } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { useLoading } from "../context/LoadingContext";
import { anyEstado } from "../utils/turnos/normalizeEstado";
import { Table } from "../components/ui/Table";
import { Button } from "../components/ui/Button";
import { DropdownActions } from "../components/ui/DropdownActions";
import { Status } from "../components/ui/Status";
import { LayoutWrapper } from "../components/layout/LayoutWrapper";
import { formatDateForTable } from "../utils/formatDateForTable";
import { SearchBar } from "../components/ui/SearchBar";
import { Pagination } from "../components/ui/Pagination";
import { showToast } from "../utils/feedback/toasts";
import { paginate } from "../utils/pagination";
import { useEntregaReview } from "../hooks/useEntregaReview";

export const EvaluarEntregas = ({ withWrapper = true }) => {
  // Agregamos loadEntregas para disparar la carga si la vista se monta directamente (ruta profunda)
  const { entregas, updateEntrega, loadEntregas } = useAppData();
  const { usuario: usuarioActual } = useAuth();
  const { isLoading } = useLoading();
  const ITEMS_PER_PAGE = 5;
  const [page, setPage] = useState(1);
  const [filterStatus] = useState("Pendientes"); // "Pendientes" | specific reviewStatus | "Todos"
  const hasLoadedRef = useRef(false);

  // Eliminado efecto vacío que causaba render redundante sin lógica

  // Carga defensiva: si el profesor/superadmin entra directo a /evaluar-entregas sin pasar por el dashboard
  useEffect(() => {
    if (!usuarioActual) return;
    if (hasLoadedRef.current) return; // Evitar loop infinito
    const rol = usuarioActual?.rol ?? usuarioActual?.role;
    if (rol === "profesor" || rol === "superadmin") {
      hasLoadedRef.current = true;
      loadEntregas?.();
    }
  }, [usuarioActual, loadEntregas]);

  // Extraído a hook useEntregaReview
  const { processingEntregaId, handleAprobarEntrega, handleDesaprobarEntrega } = useEntregaReview({
    updateEntrega,
    showToast,
  });

  const esPendiente = (e) => {
    const estadoActual = e?.reviewStatus || "";
    return anyEstado(estadoActual, ["Pendiente", "A revisar"]) || !estadoActual;
  };

  
  // Filtrado por módulo delegado completamente al backend (permissionUtils). Se usa listado directo.
  const entregasFiltradas = useMemo(() => {
    const result = Array.isArray(entregas) ? entregas : [];
    return result;
  }, [entregas]);

  // Base: ya filtradas por módulo (o no, próximamente se removerá redundancia)
  const entregasPendientes = useMemo(() => entregasFiltradas.filter(esPendiente), [entregasFiltradas]);

  // Aplicar filtro de estado seleccionado
  const entregasFiltradasPorEstado = useMemo(() => {
    let result;
    if (filterStatus === "Todos") {
      result = entregasFiltradas;
    } else if (filterStatus === "Pendientes") {
      result = entregasPendientes;
    } else {
      result = entregasFiltradas.filter((e) => e?.reviewStatus === filterStatus);
    }
    return result;
  }, [filterStatus, entregasFiltradas, entregasPendientes]);

  const [entregasBuscadas, setEntregasBuscadas] = useState(entregasFiltradasPorEstado);

  useEffect(() => {
    setEntregasBuscadas(entregasFiltradasPorEstado);
    setPage(1); // Reset página cuando cambia dataset filtrado
  }, [entregasFiltradasPorEstado]);

  const paginatedEntregasPendientes = useMemo(
    () => paginate(entregasBuscadas, page, ITEMS_PER_PAGE),
    [entregasBuscadas, page]
  );

  // Simplificación: usar sólo reviewStatus proveniente del backend/normalizador.
  const getEstadoUI = (e) => e?.reviewStatus || "A revisar";

  const containerClass = "text-[#111827] transition-colors duration-300 dark:text-gray-100 rounded-lg";
  const Container = withWrapper ? LayoutWrapper : "div";
  const containerProps = withWrapper
    ? { className: containerClass }
    : { className: `w-full flex flex-col gap-6 ${containerClass}` };

  return (
    <Container {...containerProps}>
        <h2 className="text-2xl sm:text-3xl font-bold text-[#1E3A8A] dark:text-[#93C5FD]">
          Evaluar Entregables
        </h2>

        <SearchBar
          data={entregasFiltradasPorEstado}
          fields={[
            "sprint",
            "alumno",
            "githubLink",
            "renderLink",
            "comentarios",
            "reviewStatus",
          ]}
          placeholder="Buscar entregables"
          onSearch={(results) => {
            setEntregasBuscadas(results);
            setPage(1);
          }}
        />

        <Table
          responsive
          testId="evaluar-entregas"
          columns={[
            "Sprint",
            "Alumno",
            "GitHub",
            "Render",
            "Comentarios",
            "Fecha",
            "Estado",
            "Acciones",
          ]}
          data={paginatedEntregasPendientes.items || []}
          minWidth="min-w-[680px]"
          containerClass="px-4"
          isLoading={isLoading("entregas")}
          emptyMessage="No hay entregas pendientes."
          renderRow={(e) => (
            <>
              <td className="border p-2 text-center">Sprint {e.sprint}</td>
              <td className="border p-2 text-center">
                {e.alumno || "Sin asignar"}
              </td>
              <td className="border p-2 text-center">
                {e.githubLink ? (
                  <a
                    href={e.githubLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    GitHub
                  </a>
                ) : (
                  "No entregado"
                )}
              </td>
              <td className="border p-2 text-center">
                {e.renderLink ? (
                  <a
                    href={e.renderLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Render
                  </a>
                ) : (
                  "No entregado"
                )}
              </td>
              <td className="border p-2 text-center">
                {e.comentarios || "-"}
              </td>
              <td className="border p-2 text-center">
                {formatDateForTable(e.fechaEntrega) || "-"}
              </td>
              <td className="border p-2 text-center">
                <Status status={getEstadoUI(e)} />
              </td>
              <td className="border p-2 text-center">
                {esPendiente(e) ? (
                  <DropdownActions
                    options={[
                      {
                        label: "Aprobar",
                        icon: "/icons/check.png",
                        onClick: () => handleAprobarEntrega(e),
                        disabled: processingEntregaId === e.id,
                      },
                      {
                        label: "Desaprobar",
                        icon: "/icons/close.png",
                        danger: true,
                        onClick: () => handleDesaprobarEntrega(e),
                        disabled: processingEntregaId === e.id,
                      },
                    ]}
                  />
                ) : (
                  <span className="text-xs opacity-60">-</span>
                )}
              </td>
            </>
          )}
          renderMobileCard={(e) => (
            <div className="space-y-2 sm:space-y-3 rounded-md border-2 border-[#111827] bg-white p-3 sm:p-4 shadow-md dark:border-[#333] dark:bg-[#1E1E1E]">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-lg font-bold text-[#1E3A8A] dark:text-[#93C5FD]">
                  Sprint {e.sprint}
                </h3>
                <Status status={getEstadoUI(e)} />
              </div>

              <div className="flex flex-col gap-1 text-sm text-[#111827] dark:text-gray-200">
                <p>
                  <strong>Alumno:</strong> {e.alumno || "Sin asignar"}
                </p>
                <p>
                  <strong>Fecha:</strong> {formatDateForTable(e.fechaEntrega) || "-"}
                </p>
                <p>
                  <strong>Comentarios:</strong> {e.comentarios || "-"}
                </p>
              </div>

              <div className="flex justify-between text-sm">
                <a
                  href={e.githubLink || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className={`${
                    e.githubLink
                      ? "text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      : "text-gray-400 cursor-not-allowed"
                  }`}
                >
                  GitHub
                </a>
                <a
                  href={e.renderLink || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className={`${
                    e.renderLink
                      ? "text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      : "text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Render
                </a>
              </div>

              {esPendiente(e) && (
                <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
                  <Button
                    variant="success"
                    className="w-full sm:w-auto"
                    onClick={() => handleAprobarEntrega(e)}
                    disabled={processingEntregaId === e.id}
                  >
                    Aprobar
                  </Button>
                  <Button
                    variant="danger"
                    className="w-full sm:w-auto"
                    onClick={() => handleDesaprobarEntrega(e)}
                    disabled={processingEntregaId === e.id}
                  >
                    Desaprobar
                  </Button>
                </div>
              )}
            </div>
          )}
        />

        <Pagination
          totalItems={paginatedEntregasPendientes.totalItems}
          itemsPerPage={ITEMS_PER_PAGE}
          currentPage={paginatedEntregasPendientes.currentPage}
          onPageChange={setPage}
        />
    </Container>
  );
};






