// === Floating Requests Panel ===
// Panel lateral para revisar y liberar turnos solicitados sin dejar el dashboard.
import { useEffect, useMemo, useState } from "react";
import { useAppData } from "../../context/AppContext";
import { useModal } from "../../context/ModalContext";
import { Button } from "../ui/Button";
import { Status } from "../ui/Status";
import { showToast } from "../../utils/feedback/toasts";
import {
  buildTurnoPayloadFromForm,
  formValuesFromTurno,
} from "../../utils/turnos/form";
import { Pagination } from "../ui/Pagination";

const TURNOS_POR_PAGINA = 5;

export const RequestsPanel = () => {
  const { turnos, updateTurno, turnosLoading, totalTurnosSolicitados } =
    useAppData();
  const { showModal } = useModal();
  const [panelAbierto, establecerPanelAbierto] = useState(false);
  const [turnoProcesandoId, establecerTurnoProcesandoId] = useState(null);
  const [pagina, establecerPagina] = useState(1);

  const solicitudesPendientes = useMemo(
    () => turnos.filter((turno) => turno.estado === "Solicitado"),
    [turnos]
  );
  const totalSolicitudes = solicitudesPendientes.length;

  useEffect(() => {
    if (panelAbierto) {
      establecerPagina(1);
    }
  }, [panelAbierto]);

  useEffect(() => {
    const paginasTotales = Math.max(
      1,
      Math.ceil((totalSolicitudes || 0) / TURNOS_POR_PAGINA)
    );
    establecerPagina((paginaActual) => {
      if (totalSolicitudes === 0) return 1;
      if (paginaActual > paginasTotales) return paginasTotales;
      if (paginaActual < 1) return 1;
      return paginaActual;
    });
  }, [totalSolicitudes]);

  const solicitudesPaginadas = useMemo(() => {
    const paginasTotales =
      Math.ceil((totalSolicitudes || 0) / TURNOS_POR_PAGINA) || 1;
    const paginaNormalizada = Math.min(Math.max(pagina, 1), paginasTotales);
    const inicio = (paginaNormalizada - 1) * TURNOS_POR_PAGINA;
    return {
      items: solicitudesPendientes.slice(
        inicio,
        inicio + TURNOS_POR_PAGINA
      ),
      totalItems: totalSolicitudes,
      totalPages: paginasTotales,
      currentPage: paginaNormalizada,
    };
  }, [solicitudesPendientes, totalSolicitudes, pagina]);

  const gestionarCancelacionTurno = (turnoId) => {
    const turno = turnos.find((item) => String(item.id) === String(turnoId));
    if (!turno) {
      showToast("No encontramos el turno seleccionado.", "error");
      return;
    }

    showModal({
      type: "warning",
      title: "Cancelar solicitud",
      message: `¿Cancelar la solicitud del turno "${turno.sala}"?`,
      onConfirm: () => {
        void ejecutarCancelacion(turno);
      },
    });
  };

  const ejecutarCancelacion = async (turno) => {
    establecerTurnoProcesandoId(turno.id);
    try {
      const payload = buildTurnoPayloadFromForm({
        ...formValuesFromTurno(turno),
        review: turno.review,
        comentarios: turno.comentarios || "",
        estado: "Disponible",
      });
      await updateTurno(turno.id, payload);
      showToast("Solicitud cancelada. El turno volvió a estar disponible.");
    } catch (error) {
      showToast(
        error.message ||
          "No pudimos cancelar la solicitud. Inténtalo nuevamente en unos segundos.",
        "error"
      );
    } finally {
      establecerTurnoProcesandoId(null);
    }
  };

  return (
    <>
      <button
        onClick={() => establecerPanelAbierto((previo) => !previo)}
        className="fixed bottom-16 right-4 z-50 bg-[#FFD700] text-black border-2 border-[#111827] rounded-full px-4 py-2 font-bold shadow-md hover:opacity-90"
      >
        Solicitudes ({totalTurnosSolicitados})
      </button>

      {panelAbierto && (
        <div className="fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => establecerPanelAbierto(false)}
          ></div>
          <div className="absolute right-0 top-0 h-full w-80 bg-[#E5E5E5] border-l-2 border-[#111827] shadow-xl p-4 overflow-y-auto">
            <div className="flex justify-between mb-3">
              <h3 className="font-bold text-[#1E3A8A]">Solicitudes activas</h3>
              <Button
                variant="secondary"
                onClick={() => establecerPanelAbierto(false)}
              >
                Cerrar
              </Button>
            </div>

            {totalSolicitudes === 0 ? (
              <p className="text-sm text-[#111827]">
                No hay solicitudes pendientes.
              </p>
            ) : (
              <>
                <ul className="space-y-3">
                  {solicitudesPaginadas.items.map((turno) => (
                    <li
                      key={turno.id}
                      className="border-2 border-[#111827] bg-white p-3 rounded-md"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-bold">Review {turno.review}</p>
                          <p>
                            {turno.fecha} - {turno.horario}
                          </p>
                          <p>Sala: {turno.sala}</p>
                        </div>
                        <Status status={turno.estado} />
                      </div>
                      <div className="text-right mt-2">
                        <Button
                          variant="secondary"
                          onClick={() => gestionarCancelacionTurno(turno.id)}
                          disabled={
                            turnosLoading || turnoProcesandoId === turno.id
                          }
                        >
                          {turnoProcesandoId === turno.id
                            ? "Procesando..."
                            : "Cancelar"}
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
                <Pagination
                  totalItems={solicitudesPaginadas.totalItems}
                  itemsPerPage={TURNOS_POR_PAGINA}
                  currentPage={solicitudesPaginadas.currentPage}
                  onPageChange={establecerPagina}
                />
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};
