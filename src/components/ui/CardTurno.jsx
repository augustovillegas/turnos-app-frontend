import { Button } from "./Button";
import { Status } from "./Status";
import { isEstado } from "../../utils/turnos/normalizeEstado";

export const CardTurno = ({
  turno,
  onSolicitar,
  onCancelar,
  onAprobar,
  onRechazar,
  onVer,
  disabled = false,
}) => {
  return (
    <div className="space-y-2 sm:space-y-3 rounded-md border-2 border-[#111827] bg-white p-3 sm:p-4 shadow-md dark:border-[#333] dark:bg-[#1E1E1E]">
      <div className="flex justify-between">
        <p className="font-bold text-[#1E3A8A] dark:text-[#93C5FD]">
          Review {turno.review}
        </p>
        <Status status={turno.estado || "Disponible"} />
      </div>

      <p className="text-sm dark:text-gray-200">
        <strong>Fecha:</strong> {turno.fecha}
      </p>
      <p className="text-sm dark:text-gray-200">
        <strong>Horario:</strong> {turno.horario}
      </p>
      <p className="text-sm dark:text-gray-200">
        <strong>Sala:</strong> {turno.sala}
      </p>

      {turno.zoomLink && (
        <p className="text-sm">
          <a
            href={turno.zoomLink}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Enlace Zoom
          </a>
        </p>
      )}

      {(onSolicitar || onCancelar || onAprobar || onRechazar || onVer) && (
        <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
          {onSolicitar && isEstado(turno.estado, "Disponible") && (
            <Button
              variant="primary"
              className="w-full sm:w-auto"
              onClick={onSolicitar}
              disabled={disabled}
            >
              Solicitar turno
            </Button>
          )}
          {onCancelar && isEstado(turno.estado, "Solicitado") && (
            <Button
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={onCancelar}
              disabled={disabled}
            >
              Cancelar solicitud
            </Button>
          )}
          {onAprobar && isEstado(turno.estado, "Solicitado") && (
            <Button
              variant="success"
              className="w-full sm:w-auto"
              onClick={onAprobar}
              disabled={disabled}
            >
              Aprobar
            </Button>
          )}
          {onRechazar && isEstado(turno.estado, "Solicitado") && (
            <Button
              variant="danger"
              className="w-full sm:w-auto"
              onClick={onRechazar}
              disabled={disabled}
            >
              Rechazar
            </Button>
          )}

          {onVer && (
            <Button
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={onVer}
              disabled={disabled}
            >
              Ver detalle
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
