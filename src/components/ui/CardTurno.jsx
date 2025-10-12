import { Button } from "./Button";
import { Status } from "./Status";

export const CardTurno = ({ turno, onSolicitar, onCancelar, onAprobar, onRechazar }) => {
  return (
    <div className="border-2 border-[#111827] dark:border-[#333] rounded-md p-3 bg-white dark:bg-[#1E1E1E] shadow-md space-y-2">
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
            className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300"
          >
            Enlace Zoom
          </a>
        </p>
      )}

      {(onSolicitar || onCancelar || onAprobar || onRechazar) && (
        <div className="flex justify-end gap-2">
          {onSolicitar && turno.estado === "Disponible" && (
            <Button variant="primary" className="w-full" onClick={onSolicitar}>
              Solicitar turno
            </Button>
          )}
          {onCancelar && turno.estado === "Solicitado" && (
            <Button variant="secondary" className="w-full" onClick={onCancelar}>
              Cancelar solicitud
            </Button>
          )}
          {onAprobar && turno.estado === "Solicitado" && (
            <Button variant="success" className="w-full" onClick={onAprobar}>
              Aprobar
            </Button>
          )}
          {onRechazar && turno.estado === "Solicitado" && (
            <Button variant="danger" className="w-full" onClick={onRechazar}>
              Rechazar
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
