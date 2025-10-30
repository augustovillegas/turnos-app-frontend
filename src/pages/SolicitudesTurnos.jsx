import { useEffect, useMemo, useState } from "react";
import { Table } from "../components/ui/Table";
import { Button } from "../components/ui/Button";
import { Status } from "../components/ui/Status";
import { Skeleton } from "../components/ui/Skeleton";
import { Pagination } from "../components/ui/Pagination";
import { ReviewFilter } from "../components/ui/ReviewFilter";
import { CardTurno } from "../components/ui/CardTurno";
import { useAppData } from "../context/AppContext";
import { useModal } from "../context/ModalContext";
import { useError } from "../context/ErrorContext";
import { showToast } from "../utils/feedback/toasts";
import { buildTurnoPayloadFromForm,  formValuesFromTurno } from "../utils/turnos/form";
import { EmptyRow } from "../components/ui/EmptyRow";

export const SolicitudesTurnos = ({ turnos = [], isLoading }) => {
  const { updateTurno } = useAppData();
  const { showModal } = useModal();
  const { pushError } = useError();

  const [filtroReview, setFiltroReview] = useState("todos");
  const [processingTurno, setProcessingTurno] = useState(null);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const turnosSolicitados = useMemo(
    () => turnos.filter((t) => String(t.estado).toLowerCase() === "solicitado"),
    [turnos]
  );

  const aplicarFiltro = (lista) => {
    if (filtroReview === "todos") return lista;
    return lista.filter((t) => t.review === Number(filtroReview));
  };

  const filtrados = aplicarFiltro(turnosSolicitados);

  const paginated = useMemo(() => {
    const totalPages = Math.ceil(filtrados.length / ITEMS_PER_PAGE) || 1;
    const currentPage = Math.min(Math.max(page, 1), totalPages);
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return {
      items: filtrados.slice(start, start + ITEMS_PER_PAGE),
      totalItems: filtrados.length,
      totalPages,
      currentPage,
    };
  }, [filtrados, page]);

  useEffect(() => setPage(1), [filtroReview]);

  const handleAprobar = async (turno) => {
    setProcessingTurno(turno.id);
    try {
      const payload = buildTurnoPayloadFromForm({
        ...formValuesFromTurno(turno),
        estado: "Aprobado",
      });
      await updateTurno(turno.id, payload);
      showToast("Turno aprobado correctamente");
    } catch (error) {
      pushError("Error al aprobar turno", { description: error?.message });
    } finally {
      setProcessingTurno(null);
    }
  };

  const handleRechazar = (turno) => {
    showModal({
      type: "warning",
      title: "Rechazar turno",
      message: `¿Confirmas el rechazo del turno para la sala ${turno.sala}?`,
      onConfirm: async () => {
        setProcessingTurno(turno.id);
        try {
          const payload = buildTurnoPayloadFromForm({
            ...formValuesFromTurno(turno),
            estado: "Rechazado",
          });
          await updateTurno(turno.id, payload);
          showToast("Turno rechazado correctamente");
        } catch (error) {
          pushError("Error al rechazar turno", { description: error?.message });
        } finally {
          setProcessingTurno(null);
        }
      },
    });
  };

  return (
    <div className="p-6 text-[#111827] dark:text-gray-100 rounded-lg">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <h2 className="text-3xl font-bold text-[#1E3A8A] dark:text-[#93C5FD]">
          Solicitudes de Turnos
        </h2>

        <ReviewFilter value={filtroReview} onChange={setFiltroReview} />

        {/* Desktop */}
        <div className="hidden sm:block">
          {isLoading ? (
            <div className="space-y-3 py-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} height="2.75rem" />
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
              data={paginated.items}
              minWidth="min-w-[680px]"
              containerClass="px-4"
              renderRow={(t) => (
                <>
                  <td className="border p-2 text-center">{t.review}</td>
                  <td className="border p-2 text-center">{t.fecha}</td>
                  <td className="border p-2 text-center">{t.horario}</td>
                  <td className="border p-2 text-center">{t.sala}</td>
                  <td className="border p-2 text-center">
                    {t.zoomLink && (
                      <a href={t.zoomLink} target="_blank" rel="noreferrer">
                        <img
                          src="/icons/video_-2.png"
                          alt="Zoom"
                          className="mx-auto h-5 w-5 hover:opacity-80"
                        />
                      </a>
                    )}
                  </td>
                  <td className="border p-2 text-center">
                    <Status status={t.estado} />
                  </td>
                  <td className="border p-2 text-center">
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="success"
                        className="py-1"
                        onClick={() => handleAprobar(t)}
                        disabled={processingTurno === t.id}
                      >
                        Aprobar
                      </Button>
                      <Button
                        variant="danger"
                        className="py-1"
                        onClick={() => handleRechazar(t)}
                        disabled={processingTurno === t.id}
                      >
                        Rechazar
                      </Button>
                    </div>
                  </td>
                </>
              )}
            >
              {!paginated.items.length && (
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
              )}
            </Table>
          )}
        </div>

        {/* Mobile */}
        <div className="mt-4 space-y-4 px-2 sm:hidden">
          {isLoading ? (
            <div className="space-y-3 py-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} height="4.5rem" />
              ))}
            </div>
          ) : paginated.items.length > 0 ? (
            paginated.items.map((t) => (
              <CardTurno
                key={t.id}
                turno={t}
                onAprobar={() => handleAprobar(t)}
                onRechazar={() => handleRechazar(t)}
                disabled={processingTurno === t.id}
              />
            ))
          ) : (
            <EmptyRow.Mobile />
          )}
        </div>

        {!isLoading && (
          <Pagination
            totalItems={paginated.totalItems}
            itemsPerPage={ITEMS_PER_PAGE}
            currentPage={paginated.currentPage}
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  );
};
