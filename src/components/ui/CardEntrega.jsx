import { Button } from "./Button";
import { Status } from "./Status";

export const CardEntrega = ({ entrega, onCancelar, onEditar, disabled = false }) => { 
  if (!entrega) return null;

  return (
    <div className="w-full flex flex-col gap-3 rounded-lg border-2 border-[#111827]/40 bg-white p-4 shadow-md transition-colors duration-300 dark:border-[#333] dark:bg-[#1E1E1E] overflow-hidden">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-lg font-bold text-[#1E3A8A] dark:text-[#93C5FD]">
          Sprint {entrega.sprint ?? "-"}
        </h3>
        <Status status={entrega.reviewStatus || entrega.estado || "A revisar"} />
      </div>

      <div className="flex flex-col gap-1 text-sm text-[#111827] dark:text-gray-200">
        <p className="break-words text-sm overflow-hidden text-ellipsis">
          <strong>GitHub:</strong>{" "}
          {entrega.githubLink ? (
            <a
              href={entrega.githubLink}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 underline dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 break-words"
            >
              {entrega.githubLink}
            </a>
          ) : (
            "-"
          )}
        </p>

        <p className="break-words text-sm overflow-hidden text-ellipsis">
          <strong>Render:</strong>{" "}
          {entrega.renderLink ? (
            <a
              href={entrega.renderLink}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 underline dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              {entrega.renderLink}
            </a>
          ) : (
            "-"
          )}
        </p>

        <p className="break-words text-sm overflow-hidden text-ellipsis">
          <strong>Comentarios:</strong>{" "}
          {entrega.comentarios?.trim() !== "" ? entrega.comentarios : "-"}
        </p>
      </div>

      {entrega.reviewStatus === "A revisar" && (
        <div className="flex justify-end pt-2 gap-2">
          <Button
            variant="outline"
            onClick={() => onEditar?.(entrega)}
            disabled={disabled}
            className="w-full md:w-auto py-1"
          >
            Editar
          </Button>
          <Button
            variant="danger"
            onClick={() => onCancelar?.(entrega)}
            disabled={disabled}
            className="w-full md:w-auto py-1"
          >
            Cancelar
          </Button>
        </div>
      )}
    </div>
  );
};

