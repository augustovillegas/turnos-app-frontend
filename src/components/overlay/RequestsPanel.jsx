// === Floating Requests Panel ===
// Permite revisar, paginar y cancelar turnos solicitados desde cualquier dashboard.
import { useEffect, useMemo, useState } from "react";
import { useAppData } from "../../context/AppContext";
import { Button } from "../ui/Button";
import { Status } from "../ui/Status";
import { showToast } from "../../utils/feedback/toasts";
import {
  buildTurnoPayloadFromForm,
  formValuesFromTurno,
} from "../../utils/turnos/form";
import { Pagination } from "../ui/Pagination";

export const RequestsPanel = () => {
  const { turnos, updateTurno, turnosLoading, totalTurnosSolicitados } =
    useAppData();
  const [open, setOpen] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const ITEMS_PER_PAGE = 5;
  const [page, setPage] = useState(1);

  // --- Deriva el listado de solicitudes activas ---
  const solicitudes = useMemo(
    () => turnos.filter((t) => t.estado === "Solicitado"),
    [turnos]
  );
  const totalSolicitudes = solicitudes.length;

  // --- Al abrir el panel vuelve a la primera pagina ---
  useEffect(() => {
    if (open) {
      setPage(1);
    }
  }, [open]);

  // --- Ajusta la pagina si cambia la cantidad total ---
  useEffect(() => {
    const totalPages = Math.max(
      1,
      Math.ceil((totalSolicitudes || 0) / ITEMS_PER_PAGE)
    );
    setPage((prev) => {
      if (totalSolicitudes === 0) return 1;
      if (prev > totalPages) return totalPages;
      if (prev < 1) return 1;
      return prev;
    });
  }, [totalSolicitudes, ITEMS_PER_PAGE]);

  // --- Paginacion client-side para mostrar bloques pequenos ---
  const paginatedSolicitudes = useMemo(() => {
    const totalPages =
      Math.ceil((totalSolicitudes || 0) / ITEMS_PER_PAGE) || 1;
    const currentPage = Math.min(Math.max(page, 1), totalPages);
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return {
      items: solicitudes.slice(start, start + ITEMS_PER_PAGE),
      totalItems: totalSolicitudes,
      totalPages,
      currentPage,
    };
  }, [solicitudes, totalSolicitudes, page, ITEMS_PER_PAGE]);

  // --- Devuelve un turno solicitado a estado disponible ---
  const cancelarTurno = async (id) => {
    const turno = turnos.find((item) => String(item.id) === String(id));
    if (!turno) return;
    const confirmado = window.confirm(
      `Cancelar la solicitud del turno "${turno.sala}"?`
    );
    if (!confirmado) return;
    setProcessingId(id);
    try {
      const payload = buildTurnoPayloadFromForm({
        ...formValuesFromTurno(turno),
        review: turno.review,
        comentarios: turno.comentarios || "",
        estado: "Disponible",
      });
      await updateTurno(turno.id, payload);
      showToast("Solicitud cancelada. El turno volviÃƒÂ³ a estar disponible.");
    } catch (error) {
      showToast(
        error.message ||
          "No pudimos cancelar la solicitud. Intentalo nuevamente en unos segundos.",
        "error"
      );
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-16 right-4 z-50 bg-[#FFD700] text-black border-2 border-[#111827] rounded-full px-4 py-2 font-bold shadow-md hover:opacity-90"
      >
        Solicitudes ({totalTurnosSolicitados})
      </button>

      {open && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)}></div>
          <div className="absolute right-0 top-0 h-full w-80 bg-[#E5E5E5] border-l-2 border-[#111827] shadow-xl p-4 overflow-y-auto">
            <div className="flex justify-between mb-3">
              <h3 className="font-bold text-[#1E3A8A]">Solicitudes activas</h3>
              <Button variant="secondary" onClick={() => setOpen(false)}>Cerrar</Button>
            </div>
            {totalSolicitudes === 0 ? (
              <p className="text-sm text-[#111827]">No hay solicitudes pendientes.</p>
            ) : (
              <>
                <ul className="space-y-3">
                  {paginatedSolicitudes.items.map((t) => (
                    <li
                      key={t.id}
                      className="border-2 border-[#111827] bg-white p-3 rounded-md"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-bold">Review {t.review}</p>
                          <p>
                            {t.fecha} - {t.horario}
                          </p>
                          <p>Sala: {t.sala}</p>
                        </div>
                        <Status status={t.estado} />
                      </div>
                      <div className="text-right mt-2">
                        <Button
                          variant="secondary"
                          onClick={() => cancelarTurno(t.id)}
                          disabled={turnosLoading || processingId === t.id}
                        >
                          {processingId === t.id ? "Procesando..." : "Cancelar"}
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
                <Pagination
                  totalItems={paginatedSolicitudes.totalItems}
                  itemsPerPage={ITEMS_PER_PAGE}
                  currentPage={paginatedSolicitudes.currentPage}
                  onPageChange={setPage}
                />
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};
