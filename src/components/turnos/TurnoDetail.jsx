// === Turno Detail ===
// Vista de solo lectura para mostrar la información completa de un turno.
import { useEffect, useState } from "react";
import { useAppData } from "../../context/AppContext";
import { Button } from "../ui/Button";
import { Status } from "../ui/Status";
import { showToast } from "../../utils/feedback/toasts";

export const TurnoDetail = ({ turno, turnoId, onVolver }) => {
  const {findTurnoById} = useAppData();
  const [currentTurno, setCurrentTurno] = useState(turno ?? null);
  const [loadingTurno, setLoadingTurno] = useState(!turno && Boolean(turnoId));
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!turno) return;
    setCurrentTurno(turno);
    setNotFound(false);
    setLoadingTurno(false);
  }, [turno]);

  useEffect(() => {
    if (turno || !turnoId) return;

    let cancelled = false;
    setLoadingTurno(true);
    findTurnoById(turnoId)
      .then((fetched) => {
        if (cancelled) return;
        if (!fetched) {
          setNotFound(true);
          return;
        }
        setCurrentTurno(fetched);
        setNotFound(false);
      })
      .catch((error) => {
        if (cancelled) return;
        showToast(error.message || "No se pudo cargar el turno.", "error");
        setNotFound(true);
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingTurno(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [turno, turnoId, findTurnoById]);

  if (notFound) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#017F82] p-6 dark:bg-[#0F3D3F]">
        <div className="max-w-md rounded-md border-2 border-[#111827] bg-white p-6 text-center dark:border-[#333] dark:bg-[#1E1E1E]">
          <h2 className="mb-2 text-2xl font-bold text-[#B91C1C]">
            Turno no encontrado
          </h2>
          <p className="mb-4 text-sm text-[#374151] dark:text-gray-300">
            Verifica que el recurso exista en la API.
          </p>
          <Button onClick={() => onVolver?.()}>Volver al listado</Button>
        </div>
      </div>
    );
  }

  if (loadingTurno) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#017F82] p-6 dark:bg-[#0F3D3F]">
        <p className="rounded-md border-2 border-[#1E3A8A] bg-white px-4 py-2 font-semibold text-[#1E3A8A] dark:border-[#93C5FD] dark:bg-[#1E1E1E] dark:text-[#93C5FD]">
          Cargando turno...
        </p>
      </div>
    );
  }

  if (!currentTurno) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#017F82] p-6 dark:bg-[#0F3D3F]">
        <p className="rounded-md border-2 border-[#1E3A8A] bg-white px-4 py-2 font-semibold text-[#1E3A8A] dark:border-[#93C5FD] dark:bg-[#1E1E1E] dark:text-[#93C5FD]">
          Sin datos disponibles.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#017F82] p-4 sm:p-6 text-[#111827] transition-colors duration-300 dark:bg-[#0F3D3F] dark:text-gray-100">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
        <Button variant="secondary" onClick={() => onVolver?.()} className="w-fit">
          Volver
        </Button>

        <div className="rounded-md border-2 border-[#111827] bg-white p-6 shadow-lg dark:border-[#333] dark:bg-[#1E1E1E]">
          <h1 className="mb-2 text-2xl sm:text-3xl font-bold text-[#1E3A8A] dark:text-[#93C5FD]">
            Detalle del turno
          </h1>
          <p className="text-sm text-[#4B5563] dark:text-gray-300">
            Información sincronizada con el backend.
          </p>

          <dl className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase text-[#6B7280]">
                Review
              </dt>
              <dd className="text-lg font-semibold">{currentTurno.review}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-[#6B7280]">
                Fecha
              </dt>
              <dd className="text-lg font-semibold">{currentTurno.fecha}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-[#6B7280]">
                Horario
              </dt>
              <dd className="text-lg font-semibold">{currentTurno.horario}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-[#6B7280]">
                Sala
              </dt>
              <dd className="text-lg font-semibold">{currentTurno.sala}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-[#6B7280]">
                Enlace de Zoom
              </dt>
              <dd className="text-lg font-semibold">
                {currentTurno.zoomLink ? (
                  <a
                    href={currentTurno.zoomLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 underline hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-100"
                  >
                    Abrir reunión
                  </a>
                ) : (
                  "Sin enlace"
                )}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-[#6B7280]">
                Estado
              </dt>
              <dd className="flex items-center gap-2">
                <Status status={currentTurno.estado || "Disponible"} />
              </dd>
            </div>
          </dl>

          {currentTurno.comentarios && (
            <div className="mt-6 rounded-md border border-dashed border-[#1E3A8A] p-4 text-sm text-[#1E3A8A] dark:border-[#93C5FD] dark:text-[#93C5FD]">
              <h3 className="mb-1 text-base font-semibold">
                Comentarios internos
              </h3>
              <p>{currentTurno.comentarios}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Default export requerido para lazy(() => import("../components/turnos/TurnoDetail"))
export default TurnoDetail;




