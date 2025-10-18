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

export const TurnosList = ({ onCrear, onEditar, onVer }) => {
  // --- Datos globales y estado de la lista ---
  const { turnos, loadTurnos, removeTurno, turnosLoading, turnosError } = useAppData();
  const [filtroReview, setFiltroReview] = useState("todos");
  const [processingId, setProcessingId] = useState(null);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const { showModal } = useModal();
  const { isLoading } = useLoading();

  useEffect(() => {
    loadTurnos();
  }, [loadTurnos]);

  // --- Derivacion filtrada seg�n review seleccionado ---
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
          showToast("Turno eliminado con éxito.");
        } catch (error) {
          showToast(error.message || "No se pudo eliminar el turno.", "error");
        } finally {
          setProcessingId(null);
        }
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#017F82] p-6 text-[#111827] transition-colors duration-300 dark:bg-[#0F3D3F] dark:text-gray-100">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-[#1E3A8A] dark:text-[#93C5FD]">
              Gestion de Turnos
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

        <ReviewFilter value={filtroReview} onChange={setFiltroReview} />
        <SearchBar
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
          ) : hasTurnos ? (
            <Table
              columns={[
                "Review",
                "Fecha",
                "Horario",
                "Sala",
                "Zoom",
                "Estado",
                "Accion",
              ]}
              data={paginatedTurnos}
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
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      {onVer && (
                        <button
                          type="button"
                          className="px-3 py-1 text-sm font-semibold underline"
                          onClick={() => onVer?.(turno)}
                          disabled={showLoader || processingId === turno.id}
                        >
                          Ver
                        </button>
                      )}
                      <Button
                        variant="secondary"
                        onClick={() => onEditar?.(turno)}
                        disabled={showLoader || processingId === turno.id}
                        className="text-sm"
                      >
                        Editar
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleConfirmarEliminacion(turno)}
                        disabled={showLoader || processingId === turno.id}
                        className="text-sm"
                      >
                        Eliminar
                      </Button>
                    </div>
                  </td>
                </>
              )}
            />
          ) : (
            <p className="py-6 text-center text-sm text-gray-100 dark:text-gray-300">
              No hay turnos para mostrar.
            </p>
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
            <p className="text-center text-sm text-gray-100 dark:text-gray-300">
              No hay turnos para mostrar.
            </p>
          )}
        </div>

        {!showLoader && hasTurnos && (
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
