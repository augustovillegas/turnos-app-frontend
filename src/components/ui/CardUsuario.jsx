// === CardUsuario ===
// Tarjeta responsive para listado de usuarios en mobile.
// Alineada visualmente con CardTurno y CardEntrega (bordes fuertes, fondo adaptativo, acciones al pie).
import { Button } from "./Button";

export const CardUsuario = ({ usuario, onEditar, onEliminar, disabled = false }) => {
  if (!usuario) return null;
  return (
    <div className="space-y-2 rounded-md border-2 border-[#111827] bg-white p-3 shadow-md transition-colors duration-300 dark:border-[#333] dark:bg-[#1E1E1E]">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-lg font-bold text-[#1E3A8A] dark:text-[#93C5FD]">
          {usuario.nombre || "Sin nombre"}
        </h3>
        <span className="text-xs font-semibold px-3 py-1 rounded bg-[#1E3A8A] text-white dark:bg-[#0A2E73]">
          {usuario.tipo}
        </span>
      </div>
      <div className="flex flex-col gap-1 text-sm text-[#111827] dark:text-gray-200">
        <p className="break-words"><strong>Email:</strong> {usuario.email}</p>
        <p><strong>Cohorte:</strong> {usuario.cohorte}</p>
        <p className="break-words"><strong>Módulo:</strong> {usuario.modulo}</p>
        {usuario.identificador && (
          <p><strong>ID:</strong> {usuario.identificador}</p>
        )}
      </div>
      <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
        <Button
          size="xs"
          variant="secondary"
          disabled={disabled}
          onClick={() => onEditar?.(usuario)}
          className="w-full sm:w-auto"
        >
          Editar
        </Button>
        <Button
          size="xs"
          variant="danger"
          disabled={disabled}
          onClick={() => onEliminar?.(usuario)}
          className="w-full sm:w-auto"
        >
          Eliminar
        </Button>
      </div>
    </div>
  );
};
