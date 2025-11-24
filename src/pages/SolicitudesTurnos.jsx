import { useEffect, useMemo, useState, useCallback } from "react";
import { Table } from "../components/ui/Table";
import { Status } from "../components/ui/Status";
import { formatDateForTable } from "../utils/formatDateForTable";
import { Skeleton } from "../components/ui/Skeleton";
import { Pagination } from "../components/ui/Pagination";
import { ReviewFilter } from "../components/ui/ReviewFilter";
import { CardTurnosCreados } from "../components/ui/CardTurnosCreados";
import { EmptyRow } from "../components/ui/EmptyRow";
import { ProfesorActions } from "../components/ui/ProfesorActions";
import { SuperadminActions } from "../components/ui/SuperadminActions";
import { SearchBar } from "../components/ui/SearchBar";
import { useAuth } from "../context/AuthContext";
import { useAppData } from "../context/AppContext";
import { Suspense, lazy } from "react";
import { usePagination } from "../hooks/usePagination";
import { useApproval } from "../hooks/useApproval";

const TurnoDetail = lazy(() => import("../components/turnos/TurnoDetail"));

// Columnas estáticas (memo implícito al quedar fuera del componente)
const SOLICITUDES_COLUMNS = [
  "Review",
  "Fecha",
  "Horario",
  "Sala",
  "Zoom",
  "Estado",
  "Acciones",
];
import { showToast } from "../utils/feedback/toasts";

export const SolicitudesTurnos = ({ turnos = [], isLoading }) => {
  const { updateTurno, loadTurnos } = useAppData();
  const { usuario: usuarioActual } = useAuth();
  const isSuperadmin = usuarioActual?.role === "superadmin";

  // ---- Estado de filtros ----
  const [filtroReview, setFiltroReview] = useState("todos");
  const ITEMS_PER_PAGE = 5;

  const [modo, setModo] = useState("listar");
  const [turnoSeleccionado, setTurnoSeleccionado] = useState(null);
  const goListar = () => {
    setModo("listar");
    setTurnoSeleccionado(null);
  };

  const onVer = (turno) => {
    setTurnoSeleccionado(turno ?? null);
    setModo("detalle");
  };

  const turnosSolicitados = useMemo(
    () => turnos.filter((t) => String(t.estado).toLowerCase() === "solicitado"),
    [turnos]
  );

  const filtrados = useMemo(() => {
    if (filtroReview === "todos") return turnosSolicitados;
    return turnosSolicitados.filter((t) => t.review === Number(filtroReview));
  }, [turnosSolicitados, filtroReview]);

  // Estado para resultados de búsqueda (parte del pipeline de filtrado)
  const [turnosBuscados, setTurnosBuscados] = useState(filtrados);

  // Actualizar base de búsqueda cuando cambian filtros externos
  useEffect(() => {
    setTurnosBuscados(filtrados);
  }, [filtrados]);

  // Hook de paginación sobre el resultado final (filtrado + búsqueda)
  const paginated = usePagination(turnosBuscados, ITEMS_PER_PAGE);

  // Resetear página cuando cambia el filtro
  useEffect(() => {
    paginated.resetPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroReview]);

  // Handler de búsqueda desde SearchBar
  const handleSearch = useCallback(
    (results) => {
      setTurnosBuscados(Array.isArray(results) ? results : filtrados);
      paginated.resetPage();
    },
    [filtrados, paginated]
  );

  // Hook de aprobación/rechazo
  const { handleApprove, handleReject, processingId } = useApproval({
    onApprove: async (t) => {
      await updateTurno?.(t.id, { estado: "Aprobado" });
    },
    onReject: async (t) => {
      await updateTurno?.(t.id, { estado: "Rechazado" });
    },
    messages: {
      approveTitle: "Aprobar turno",
      approveMessage: "¿Confirmar aprobación del turno?",
      approveSuccess: "Turno aprobado",
      approveError: "No se pudo aprobar el turno",
      rejectTitle: "Rechazar turno",
      rejectMessage: "¿Deseás rechazar este turno? Esta acción no se puede deshacer.",
      rejectSuccess: "Turno rechazado",
      rejectError: "No se pudo rechazar el turno",
    },
  });

  const handleAprobar = handleApprove;
  const handleRechazar = handleReject;
  const processingTurno = processingId;

  const handleCopiarZoom = async (t) => {
    try {
      if (!t?.zoomLink) {
        showToast("Este turno no tiene link de Zoom", "warning");
        return;
      }
      await navigator.clipboard.writeText(t.zoomLink);
      showToast("Link de Zoom copiado", "success");
    } catch (e) {
      showToast("No se pudo copiar el link", "error");
    }
  };

  // ---------- RENDER POR MODO ----------
  if (modo === "detalle") {
    return (
      <Suspense fallback={<div className="p-6"><Skeleton height="8rem" /></div>}>
        <TurnoDetail
          turno={turnoSeleccionado}
          turnoId={turnoSeleccionado?.id}
          onVolver={goListar}
        />
      </Suspense>
    );
  }

  return (
    <div className="p-6 text-[#111827] dark:text-gray-100 rounded-lg">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#1E3A8A] dark:text-[#93C5FD]">
          Solicitudes de Turnos
        </h2>

        {/* Filtros y búsqueda */}
        <div className="flex flex-col gap-2">
          <ReviewFilter value={filtroReview} onChange={setFiltroReview} />
          <SearchBar
            data={filtrados}
            fields={["horario", "sala", "zoomLink", "estado"]}
            onSearch={handleSearch}
            placeholder="Buscar por horario, sala, zoom o estado"
          />
        </div>

        {/* Desktop */}
        <div className="hidden sm:block">
          <Table
            columns={SOLICITUDES_COLUMNS}
            data={paginated.items}
            minWidth="min-w-[680px]"
            containerClass="px-4"
            isLoading={isLoading}
            renderRow={(t) => (
                <>
                  <td className="border border-[#111827] p-2 text-center dark:border-[#333]">
                    {t.review}
                  </td>
                  <td className="border border-[#111827] p-2 text-center dark:border-[#333]">
                    {formatDateForTable(t.fecha)}
                  </td>
                  <td className="border border-[#111827] p-2 text-center dark:border-[#333]">
                    {t.horario}
                  </td>
                  <td className="border border-[#111827] p-2 text-center dark:border-[#333]">
                    {t.sala}
                  </td>
                  <td className="border border-[#111827] p-2 text-center dark:border-[#333]">
                    {t.zoomLink && (
                      <a href={t.zoomLink} target="_blank" rel="noreferrer" aria-label="Abrir enlace Zoom" role="link">
                        <img
                          src="/icons/video_-2.png"
                          alt="Zoom"
                          className="mx-auto h-5 w-5 hover:opacity-80"
                        />
                      </a>
                    )}
                  </td>
                  <td className="border border-[#111827] p-2 text-center dark:border-[#333]">
                    <Status status={t.estado} />
                  </td>

                  <td className="border border-[#111827] p-2 text-center dark:border-[#333]">
                    {isSuperadmin ? (
                      <SuperadminActions
                        item={t}
                        onAprobar={handleAprobar}
                        onRechazar={handleRechazar}
                        onVer={onVer}
                        onCopiarZoom={handleCopiarZoom}
                        disabled={processingTurno === t.id}
                      />
                    ) : (
                      <ProfesorActions
                        item={t}
                        onAprobar={handleAprobar}
                        onRechazar={handleRechazar}
                        onVer={onVer}
                        onCopiarZoom={handleCopiarZoom}
                        disabled={processingTurno === t.id}
                      />
                    )}
                  </td>
                </>
              )}
            >
              {paginated.items.length === 0 && (
                <EmptyRow columns={SOLICITUDES_COLUMNS} />
              )}
            </Table>
        </div>

        {/* Mobile */}
        <div className="mt-4 space-y-4 px-2 sm:hidden">
          {isLoading ? (
            <div className="space-y-3 py-4">
              {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                <Skeleton key={i} height="4.5rem" />
              ))}
            </div>
          ) : paginated.items.length > 0 ? (
            paginated.items.map((t) => (
              <CardTurnosCreados
                key={t.id}
                turno={t}
                onVer={() => onVer(t)}
                onAprobar={() => handleAprobar(t)}
                onRechazar={() => handleRechazar(t)}
                onCopiarZoom={() => handleCopiarZoom(t)}
                disabled={processingTurno === t.id}
              />
            ))
          ) : (
            <EmptyRow.Mobile message="No hay solicitudes de turnos." />
          )}
        </div>

        {!isLoading && (
          <Pagination
            totalItems={paginated.totalItems}
            itemsPerPage={ITEMS_PER_PAGE}
            currentPage={paginated.currentPage}
            onPageChange={paginated.goToPage}
          />
        )}
      </div>
    </div>
  );
};
