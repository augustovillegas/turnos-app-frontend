// === Turnos List ===
// Tabla principal para CRUD de turnos en la vista administrativa.
import { useEffect, useMemo, useState } from "react";
import { useAppData } from "../../context/AppContext";
import { useLoading } from "../../context/LoadingContext";
import { Table } from "../ui/Table";
import { Button } from "../ui/Button";
import { Status } from "../ui/Status";
import { ReviewFilter } from "../ui/ReviewFilter";
import { CardTurnosCreados } from "../ui/CardTurnosCreados";
import { Pagination } from "../ui/Pagination";
import { SearchBar } from "../ui/SearchBar";
import { useModal } from "../../context/ModalContext";
import { showToast } from "../../utils/feedback/toasts";
import { Skeleton } from "../ui/Skeleton";
import { EmptyRow } from "../ui/EmptyRow";
import { SuperadminActions } from "../ui/SuperadminActions";
import { ProfesorActions } from "../ui/ProfesorActions";

export const TurnosList = ({ role = "profesor", onCrear, onEditar, onVer }) => {
  // --- Datos globales y estado de la lista ---
  const { turnos, loadTurnos, removeTurno, turnosLoading, turnosError } =
    useAppData();
  const [filtroReview, setFiltroReview] = useState("todos");
  const [processingId, setProcessingId] = useState(null);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const { showModal } = useModal();
  const { isLoading } = useLoading();

  useEffect(() => {
    loadTurnos();
  }, [loadTurnos]);

  // --- Derivacion filtrada según review seleccionado ---
  const turnosFiltrados = useMemo(() => {
    if (filtroReview === "todos") return turnos;
    return turnos.filter((turno) => String(turno.review) === filtroReview);
  }, [turnos, filtroReview]);
  const [turnosBuscados, setTurnosBuscados] = useState(turnosFiltrados);

  useEffect(() => {
    setPage(1);
  }, [filtroReview]);
  useEffect(() => {
    setTurnosBuscados(turnosFiltrados);
  }, [turnosFiltrados]);
  useEffect(() => {
    const totalPages = Math.max(
      1,
      Math.ceil((turnosBuscados.length || 0) / ITEMS_PER_PAGE)
    );
    setPage((prev) => {
      if (prev > totalPages) return totalPages;
      if (prev < 1) return 1;
      return prev;
    });
  }, [turnosBuscados, ITEMS_PER_PAGE]);

  // --- Paginacion base para tabla y tarjetas ---
  const paginatedTurnos = useMemo(() => {
    const totalPages = Math.ceil((turnosBuscados.length || 0) / ITEMS_PER_PAGE);
    const currentPage = Math.min(page, totalPages || 1);
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return turnosBuscados.slice(start, start + ITEMS_PER_PAGE);
  }, [page, turnosBuscados, ITEMS_PER_PAGE]);

  const totalTurnos = turnosBuscados.length;
  const currentPage = Math.min(
    page,
    Math.ceil((turnosBuscados.length || 0) / ITEMS_PER_PAGE) || 1
  );
  const showLoader = turnosLoading || isLoading("turnos");
  const hasTurnos = turnosBuscados.length > 0;

  // --- Eliminacion con confirmacion estilo Win98 ---
  const handleConfirmarEliminacion = (turno) => {
    showModal({
      type: "warning",
      title: "Eliminar turno",
      message: `¿Seguro que deseas eliminar la sala ${turno.sala}?`,
      onConfirm: async () => {
        setProcessingId(turno.id);
        try {
          await removeTurno(turno.id);
          showToast("Turno eliminado con éxito.", "success");
        } catch (error) {
          showToast(error.message || "No se pudo eliminar el turno.", "error");
        } finally {
          setProcessingId(null);
        }
      },
    });
  };

  // --- Acciones del dropdown (compartidas) ---
  const handleCopiarZoom = async (turno) => {
    try {
      if (!turno.zoomLink) {
        showToast("Este turno no tiene enlace de Zoom.", "error");
        return;
      }
      await navigator.clipboard.writeText(turno.zoomLink);
      showToast("Enlace copiado al portapapeles.", "success");
    } catch {
      showToast("No se pudo copiar el enlace.", "error");
    }
  };

  const handleAprobar = (turno) => {
    showToast(
      `Aprobar turno #${turno.id} — pendiente de implementar`,
      "success"
    );
  };
  const handleRechazar = (turno) => {
    showToast(
      `Rechazar turno #${turno.id} — pendiente de implementar`,
      "success"
    );
  };

  return (
    <div className="p-6 text-[#111827] transition-colors duration-300 dark:text-gray-100 rounded-lg">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-[#1E3A8A] dark:text-[#93C5FD]">
              Gestión de Turnos
            </h1>
          </div>
          <Button
            variant="primary"
            onClick={() => onCrear?.()}
            className="w-full md:w-auto"
          >
            Crear nuevo turno
          </Button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-3 sm:mb-4">
          {/* Izquierda: Search fluida */}
          <div className="order-1 sm:order-none flex-1 min-w-0">
            <SearchBar
              fluid
              className="w-full"
              inputClassName="h-10"
              data={turnosFiltrados}
              fields={[
                "sala",
                "fecha",
                "horario",
                "estado",
                "review",
                "comentarios",
              ]}
              placeholder="Buscar por sala, fecha o estado"
              onSearch={(results) => {
                setTurnosBuscados(results);
                setPage(1);
              }}
            />
          </div>

          {/* Derecha: ReviewFilter tal cual */}
          <div className="order-2 sm:order-none shrink-0">
            <ReviewFilter value={filtroReview} onChange={setFiltroReview} />
          </div>
        </div>

        {turnosError && (
          <div className="rounded-md border-2 border-[#B91C1C] bg-[#FEE2E2] p-3 text-sm font-semibold text-[#B91C1C]">
            {turnosError}. Trabajando con datos locales.
          </div>
        )}

        <div className="hidden sm:block">
          {showLoader ? (
            <div className="space-y-3 py-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} height="2.75rem" />
              ))}
            </div>
          ) : (
            <Table
              columns={[
                "Review",
                "Fecha",
                "Horario",
                "Sala",
                "Zoom",
                "Estado",
                "Acción",
              ]}
              data={paginatedTurnos || []}
              minWidth="min-w-[680px]"
              containerClass="px-4"
              renderRow={(turno) => (
                <>
                  <td className="border border-[#111827] p-2 dark:border-[#333] dark:text-gray-200">
                    {turno.review}
                  </td>
                  <td className="border border-[#111827] p-2 dark:border-[#333] dark:text-gray-200">
                    {turno.fecha}
                  </td>
                  <td className="border border-[#111827] p-2 dark:border-[#333] dark:text-gray-200">
                    {turno.horario}
                  </td>
                  <td className="border border-[#111827] p-2 dark:border-[#333] dark:text-gray-200">
                    {turno.sala}
                  </td>
                  <td className="border p-2 text-center dark:border-[#333]">
                    {turno.zoomLink && (
                      <a href={turno.zoomLink} target="_blank" rel="noreferrer">
                        <img
                          src="/icons/video_-2.png"
                          alt="Zoom"
                          className="w-5 h-5 mx-auto hover:opacity-80"
                        />
                      </a>
                    )}
                  </td>
                  <td className="border border-[#111827] p-2 dark:border-[#333]">
                    <Status status={turno.estado || "Disponible"} />
                  </td>
                  <td className="border border-[#111827] p-2 dark:border-[#333]">
                    <div className="flex items-center justify-center">
                      {role === "superadmin" ? (
                        <SuperadminActions
                          item={turno}
                          onVer={onVer ? (t) => onVer(t) : undefined}
                          onEditar={onEditar ? (t) => onEditar(t) : undefined}
                          onEliminar={() => handleConfirmarEliminacion(turno)}
                          onAprobar={handleAprobar}
                          onRechazar={handleRechazar}
                          onCopiarZoom={handleCopiarZoom}
                          disabled={showLoader || processingId === turno.id}
                        />
                      ) : (
                        <ProfesorActions
                          item={turno}
                          onVer={onVer ? (t) => onVer(t) : undefined}
                          onEditar={onEditar ? (t) => onEditar(t) : undefined}
                          onEliminar={() => handleConfirmarEliminacion(turno)}
                          onAprobar={handleAprobar}
                          onRechazar={handleRechazar}
                          onCopiarZoom={handleCopiarZoom}
                          disabled={showLoader || processingId === turno.id}
                        />
                      )}
                    </div>
                  </td>
                </>
              )}
            />
          )}
        </div>

        <div className="mt-4 space-y-4 px-2 sm:hidden">
          {showLoader ? (
            <div className="space-y-3 py-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} height="4rem" />
              ))}
            </div>
          ) : hasTurnos ? (
            paginatedTurnos.map((turno) => (
              <CardTurnosCreados
                key={turno.id}
                turno={turno}
                onVer={onVer ? () => onVer(turno) : undefined}
                onEditar={() => onEditar?.(turno)}
                onEliminar={() => handleConfirmarEliminacion(turno)}
                disabled={showLoader || processingId === turno.id}
              />
            ))
          ) : (
            <div className="rounded-md border-2 border-[#111827]/40 bg-white p-6 text-center shadow-md dark:border-[#333] dark:bg-[#1E1E1E]">
              <EmptyRow
                columns={[
                  "Review",
                  "Fecha",
                  "Horario",
                  "Sala",
                  "Zoom",
                  "Estado",
                  "Acción",
                ]}
              />
            </div>
          )}
        </div>

        {!showLoader && (
          <Pagination
            totalItems={totalTurnos}
            itemsPerPage={ITEMS_PER_PAGE}
            currentPage={currentPage}
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  );
};
