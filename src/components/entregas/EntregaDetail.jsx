// === Entrega Detail ===
// Vista de solo lectura para mostrar la información completa de una entrega.
import { Button } from "../ui/Button";
import { Status } from "../ui/Status";

export const EntregaDetail = ({ entrega, onVolver }) => {
  if (!entrega) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#017F82] p-6 dark:bg-[#0F3D3F]">
        <p className="rounded-md border-2 border-[#1E3A8A] bg-white px-4 py-2 font-semibold text-[#1E3A8A] dark:border-[#93C5FD] dark:bg-[#1E1E1E] dark:text-[#93C5FD]">
          Sin datos disponibles.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#017F82] p-6 text-[#111827] transition-colors duration-300 dark:bg-[#0F3D3F] dark:text-gray-100">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
        <Button variant="secondary" onClick={() => onVolver?.()} className="w-fit">
          Volver
        </Button>

        <div className="rounded-md border-2 border-[#111827] bg-white p-6 shadow-lg dark:border-[#333] dark:bg-[#1E1E1E]">
          <h1 className="mb-2 text-2xl sm:text-3xl font-bold text-[#1E3A8A] dark:text-[#93C5FD]">
            Detalle de la entrega
          </h1>
          <p className="text-sm text-[#4B5563] dark:text-gray-300">
            Información sincronizada con el backend.
          </p>

          <dl className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase text-[#6B7280]">
                Sprint
              </dt>
              <dd className="text-lg font-semibold">{entrega.sprint}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-[#6B7280]">
                Estado
              </dt>
              <dd className="mt-1">
                <Status status={entrega.reviewStatus || entrega.estado} />
              </dd>
            </div>
            <div className="md:col-span-2">
              <dt className="text-xs font-semibold uppercase text-[#6B7280]">
                Enlace de GitHub
              </dt>
              <dd className="text-lg font-semibold">
                {entrega.githubLink ? (
                  <a
                    href={entrega.githubLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 underline hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-100"
                  >
                    {entrega.githubLink}
                  </a>
                ) : (
                  "Sin enlace"
                )}
              </dd>
            </div>
            <div className="md:col-span-2">
              <dt className="text-xs font-semibold uppercase text-[#6B7280]">
                Enlace de Render
              </dt>
              <dd className="text-lg font-semibold">
                {entrega.renderLink ? (
                  <a
                    href={entrega.renderLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 underline hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-100"
                  >
                    {entrega.renderLink}
                  </a>
                ) : (
                  "Sin enlace"
                )}
              </dd>
            </div>
            {entrega.comentarios && (
              <div className="md:col-span-2">
                <dt className="text-xs font-semibold uppercase text-[#6B7280]">
                  Comentarios
                </dt>
                <dd className="text-base text-[#374151] dark:text-gray-300 whitespace-pre-wrap">
                  {entrega.comentarios}
                </dd>
              </div>
            )}
            {entrega.notaProfesor && (
              <div className="md:col-span-2">
                <dt className="text-xs font-semibold uppercase text-[#6B7280]">
                  Nota del Profesor
                </dt>
                <dd className="text-base text-[#374151] dark:text-gray-300 whitespace-pre-wrap">
                  {entrega.notaProfesor}
                </dd>
              </div>
            )}
            {(entrega.creador || entrega.creadorId) && (
              <div>
                <dt className="text-xs font-semibold uppercase text-[#6B7280]">
                  Creado por
                </dt>
                <dd className="text-lg font-semibold">{entrega.creador || `ID: ${entrega.creadorId}`}</dd>
              </div>
            )}
            {entrega.id && (
              <div className="md:col-span-2">
                <dt className="text-xs font-semibold uppercase text-[#6B7280]">
                  ID del Sistema
                </dt>
                <dd className="text-sm font-mono text-[#6B7280]">{entrega.id || entrega._id}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
};
