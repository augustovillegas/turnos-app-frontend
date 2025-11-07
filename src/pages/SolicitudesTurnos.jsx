import { useEffect, useMemo, useState } from "react";
import { Table } from "../components/ui/Table";
import { Status } from "../components/ui/Status";
import { Skeleton } from "../components/ui/Skeleton";
import { Pagination } from "../components/ui/Pagination";
import { ReviewFilter } from "../components/ui/ReviewFilter";
import { CardTurnosCreados } from "../components/ui/CardTurnosCreados";
import { EmptyRow } from "../components/ui/EmptyRow";
import { ProfesorActions } from "../components/ui/ProfesorActions";
import { TurnoDetail } from "../components/turnos/TurnoDetail";
import { useAppData } from "../context/AppContext";
import { useModal } from "../context/ModalContext";
import { useError } from "../context/ErrorContext";
import { showToast } from "../utils/feedback/toasts";

export const SolicitudesTurnos = ({ turnos = [], isLoading }) => {
  const { updateTurno } = useAppData();
  const { showModal } = useModal();
  const { pushError } = useError();

  // ---- Estado de filtros y paginado ----
  const [filtroReview, setFiltroReview] = useState("todos");
  const [page, setPage] = useState(1);
  const [processingTurno, setProcessingTurno] = useState(null);
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

  const handleAprobar = async (t) => {
    try {
      setProcessingTurno(t.id);
      await updateTurno?.(t.id, { estado: "Aprobado" });
      showToast("Turno aprobado");
    } catch (e) {
      pushError?.(e);
      showToast("No se pudo aprobar el turno", "error");
    } finally {
      setProcessingTurno(null);
    }
  };

  // === Confirmación de rechazo ===
  const confirmRechazo = (t) =>
    new Promise((resolve) => {
      showModal({
        title: "Rechazar turno",
        message:
          t?.fecha && t?.horario
            ? `¿Deseás rechazar el turno del ${t.fecha} a las ${t.horario}? Esta acción no se puede deshacer.`
            : "¿Deseás rechazar este turno? Esta acción no se puede deshacer.",
        type: "warning",
        onClose: () => resolve(false),
        onConfirm: () => resolve(true),
      });
    });

  const handleRechazar = async (t) => {
    // Paso 1: pedir confirmación
    const confirmado = await confirmRechazo(t);
    if (!confirmado) return;

    // Paso 2: ejecutar el rechazo
    try {
      setProcessingTurno(t.id);
      await updateTurno?.(t.id, { estado: "Rechazado" });
      showToast("Turno rechazado", "success");
    } catch (e) {
      pushError?.(e);
      showToast("No se pudo rechazar el turno", "error");
    } finally {
      setProcessingTurno(null);
    }
  };

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
      <TurnoDetail
        turno={turnoSeleccionado}
        turnoId={turnoSeleccionado?.id}
        onVolver={goListar}
      />
    );
  }

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
                  <td className="border border-[#111827] p-2 text-center dark:border-[#333]">
                    {t.review}
                  </td>
                  <td className="border border-[#111827] p-2 text-center dark:border-[#333]">
                    {t.fecha}
                  </td>
                  <td className="border border-[#111827] p-2 text-center dark:border-[#333]">
                    {t.horario}
                  </td>
                  <td className="border border-[#111827] p-2 text-center dark:border-[#333]">
                    {t.sala}
                  </td>
                  <td className="border border-[#111827] p-2 text-center dark:border-[#333]">
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
                  <td className="border border-[#111827] p-2 text-center dark:border-[#333]">
                    <Status status={t.estado} />
                  </td>

                  <td className="border border-[#111827] p-2 text-center dark:border-[#333]">
                    <ProfesorActions
                      item={t}
                      onAprobar={handleAprobar}
                      onRechazar={handleRechazar}
                      onVer={onVer}
                      onCopiarZoom={handleCopiarZoom}
                      disabled={processingTurno === t.id}
                    />
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
