import { Status } from "./Status";

export const CardEntrega = ({ entrega, onCancelar }) => {
  return (
    <div className="border-2 border-[#111827] dark:border-[#333] rounded-md p-4 bg-white dark:bg-[#1E1E1E] shadow space-y-2">
      <p className="font-bold text-[#1E3A8A] dark:text-[#93C5FD]">
        Sprint {entrega.sprint}
      </p>
      <p className="text-sm dark:text-gray-200">
        <strong>GitHub:</strong>{" "}
        <a
          href={entrega.githubLink}
          target="_blank"
          rel="noreferrer"
          className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300"
        >
          {entrega.githubLink}
        </a>
      </p>
      {entrega.renderLink && (
        <p className="text-sm dark:text-gray-200">
          <strong>Render:</strong>{" "}
          <a
            href={entrega.renderLink}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300"
          >
            {entrega.renderLink}
          </a>
        </p>
      )}
      {entrega.comentarios && (
        <p className="text-sm dark:text-gray-200">
          <strong>Comentarios:</strong> {entrega.comentarios}
        </p>
      )}
      <div className="flex justify-between items-center pt-1">
        <Status status={entrega.reviewStatus} />
        {entrega.reviewStatus === "A revisar" && onCancelar && (
          <button
            onClick={onCancelar}
            className="bg-red-600 text-white px-3 py-1 text-sm rounded hover:bg-red-700"
          >
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
};
