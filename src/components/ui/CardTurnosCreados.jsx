import { Button } from "./Button";
import { Status } from "./Status";

export const CardTurnosCreados = ({
  turno,
  onEditar,
  onEliminar,
  onCancelarAccion,
}) => {
  return (
    <div className="border-2 border-[#111827] dark:border-[#333] rounded-md p-3 bg-white dark:bg-[#1E1E1E] shadow-md space-y-2">
      <div className="flex items-start justify-between gap-2">
        <p className="font-bold text-[#1E3A8A] dark:text-[#93C5FD]">
          Review {turno.review}
        </p>
        <Status status={turno.estado || "Disponible"} />
      </div>

      <div className="grid grid-cols-1 gap-1 text-sm dark:text-gray-200">
        <p><strong>Fecha:</strong> {turno.fecha}</p>
        <p><strong>Horario:</strong> {turno.horario}</p>
        <p><strong>Sala:</strong> {turno.sala}</p>

        {turno.zoomLink && (
          <p className="mt-1">
            <a
              href={turno.zoomLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300"
            >
              <img
                src="/icons/video_-2.png"
                alt="Zoom"
                className="w-5 h-5"
              />
              Enlace Zoom
            </a>
          </p>
        )}
      </div>

      <div className="pt-2">
        {turno.estado === "Disponible" ? (
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="secondary"
              className="py-1 w-full flex items-center justify-center gap-1"
              onClick={onEditar}
            >
              <i className="bi bi-pencil-square text-sm"></i> Editar
            </Button>
            <Button
              variant="danger"
              className="py-1 w-full flex items-center justify-center gap-1"
              onClick={onEliminar}
            >
              <i className="bi bi-trash text-sm"></i> Eliminar
            </Button>
          </div>
        ) : (
          <Button
            variant="secondary"
            className="py-1 w-full"
            onClick={onCancelarAccion}
          >
            Cancelar acción
          </Button>
        )}
      </div>
    </div>
  );
};
