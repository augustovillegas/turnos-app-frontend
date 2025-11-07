import { Button } from "./Button";
import { Status } from "./Status";

export const CardTurnosCreados = ({
  turno,
  onEditar,
  onEliminar,
  onCancelarAccion,
  onVer,  
  onAprobar,
  onRechazar,
  onCopiarZoom,
  disabled = false,
}) => {
  const tieneAccionesAprobacion = Boolean(onAprobar || onRechazar);

  return (
    <div className="space-y-2 rounded-md border-2 border-[#111827] bg-white p-3 shadow-md dark:border-[#333] dark:bg-[#1E1E1E]">
      <div className="flex items-start justify-between gap-2">
        <p className="font-bold text-[#1E3A8A] dark:text-[#93C5FD]">
          Review {turno.review}
        </p>
        <Status status={turno.estado || "Disponible"} />
      </div>

      <div className="grid grid-cols-1 gap-1 text-sm dark:text-gray-200">
        <p>
          <strong>Fecha:</strong> {turno.fecha}
        </p>
        <p>
          <strong>Horario:</strong> {turno.horario}
        </p>
        <p>
          <strong>Sala:</strong> {turno.sala}
        </p>

        {turno.zoomLink && (
          <p className="mt-1">
            <a
              href={turno.zoomLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <img src="/icons/video_-2.png" alt="Zoom" className="h-5 w-5" />
              Enlace Zoom
            </a>
          </p>
        )}
      </div>

      <div className="pt-2 space-y-2">
        {onVer && (
          <Button
            variant="secondary"
            className="w-full py-1"
            onClick={onVer}
            disabled={disabled}
          >
            Ver detalle
          </Button>
        )}

        {/* NUEVO: Si vienen onAprobar/onRechazar, mostramos esos botones (uso principal en SolicitudesTurnos mobile) */}
        {tieneAccionesAprobacion ? (
          <div className="grid grid-cols-2 gap-2">
            {onAprobar && (
              <Button
                variant="secondary"
                className="flex w-full items-center justify-center gap-1 py-1"
                onClick={onAprobar}
                disabled={disabled}
              >
                <i className="bi bi-check-lg text-sm" />
                Aprobar
              </Button>
            )}
            {onRechazar && (
              <Button
                variant="danger"
                className="flex w-full items-center justify-center gap-1 py-1"
                onClick={onRechazar}
                disabled={disabled}
              >
                <i className="bi bi-x-lg text-sm" />
                Rechazar
              </Button>
            )}
          </div>
        ) : (
          // Comportamiento ORIGINAL se mantiene cuando no estamos en flujo de aprobación
          <>
            {turno.estado === "Disponible" ? (
              <div className="grid grid-cols-2 gap-2">
                {onEditar && (
                  <Button
                    variant="secondary"
                    className="flex w-full items-center justify-center gap-1 py-1"
                    onClick={onEditar}
                    disabled={disabled}
                  >
                    <i className="bi bi-pencil-square text-sm" />
                    Editar
                  </Button>
                )}
                {onEliminar && (
                  <Button
                    variant="danger"
                    className="flex w-full items-center justify-center gap-1 py-1"
                    onClick={onEliminar}
                    disabled={disabled}
                  >
                    <i className="bi bi-trash text-sm" />
                    Eliminar
                  </Button>
                )}
              </div>
            ) : (
              onCancelarAccion && (
                <Button
                  variant="secondary"
                  className="w-full py-1"
                  onClick={onCancelarAccion}
                  disabled={disabled}
                >
                  Cancelar acción
                </Button>
              )
            )}
          </>
        )}

        {/* Opcional: copiar Zoom si necesitás en mobile */}
        {onCopiarZoom && turno.zoomLink && (
          <Button
            variant="secondary"
            className="w-full py-1"
            onClick={onCopiarZoom}
            disabled={disabled}
          >
            Copiar link (Zoom)
          </Button>
        )}
      </div>
    </div>
  );
};

