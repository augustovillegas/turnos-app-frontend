import { useState } from "react";
import { useAppData } from "../../context/AppContext";
import { Button } from "../ui/Button";
import { Status } from "../ui/Status";

export const RequestsPanel = () => {
  const { turnos, setTurnos, totalTurnosSolicitados } = useAppData();
  const [open, setOpen] = useState(false);

  const cancelarTurno = (id) => {
    const nuevos = [...turnos];
    const idx = nuevos.findIndex(t => t.id === id);
    if (idx !== -1) {
      nuevos[idx].estado = "Disponible";
      setTurnos(nuevos);
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
            {turnos.filter(t => t.estado === "Solicitado").length === 0 ? (
              <p className="text-sm text-[#111827]">No hay solicitudes pendientes.</p>
            ) : (
              <ul className="space-y-3">
                {turnos
                  .filter(t => t.estado === "Solicitado")
                  .map(t => (
                    <li key={t.id} className="border-2 border-[#111827] bg-white p-3 rounded-md">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-bold">Review {t.review}</p>
                          <p>{t.fecha} - {t.horario}</p>
                          <p>Sala: {t.sala}</p>
                        </div>
                        <Status status={t.estado} />
                      </div>
                      <div className="text-right mt-2">
                        <Button variant="secondary" onClick={() => cancelarTurno(t.id)}>
                          Cancelar
                        </Button>
                      </div>
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </>
  );
};
