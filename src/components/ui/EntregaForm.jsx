import { Button } from "./Button";

export const EntregaForm = ({
  sprint,
  githubLink,
  renderLink,
  comentarios,
  setSprint,
  setGithubLink,
  setRenderLink,
  setComentarios,
  errors = {},
  onAgregar,
  onVolver,
}) => {
  return (
    <div className="p-6 text-[#111827] transition-colors duration-300 dark:text-gray-100">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <div className="flex items-center justify-between">
          {onVolver && (
            <Button
              variant="secondary"
              onClick={onVolver}
              className="px-6 py-2"
              aria-label="Volver al listado de entregas"
            >
              Volver
            </Button>
          )}
          <h2 className="text-3xl font-bold text-[#1E3A8A] transition-colors duration-300 dark:text-[#93C5FD]">
            Nueva Entrega
          </h2>
        </div>

        <div className="rounded-md border-2 border-[#111827] bg-white p-6 shadow-md transition-colors duration-300 dark:border-[#333] dark:bg-[#1E1E1E]">
          <div className="flex flex-col gap-4">
            <div>
              <label
                htmlFor="sprint-select"
                className="mb-1 block text-sm font-bold dark:text-gray-200"
              >
                Sprint *
              </label>
              <select
                id="sprint-select"
                className="w-full rounded border px-2 py-1 dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200"
                value={sprint}
                onChange={(e) => setSprint(e.target.value)}
                aria-invalid={!!errors.sprint}
              >
                <option value="">Seleccionar Sprint</option>
                {[1, 2, 3, 4, 5].map((s) => (
                  <option key={s} value={s}>{`Sprint ${s}`}</option>
                ))}
              </select>
              {errors.sprint && (
                <p id="sprint-error" className="mt-1 text-xs font-semibold text-[#B91C1C]">
                  {errors.sprint}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="github-link"
                className="mb-1 block text-sm font-bold dark:text-gray-200"
              >
                Link de GitHub *
              </label>
              <input
                id="github-link"
                type="url"
                className="w-full rounded border px-2 py-1 dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200"
                placeholder="https://github.com/usuario/proyecto"
                value={githubLink}
                onChange={(e) => setGithubLink(e.target.value)}
                aria-invalid={!!errors.githubLink}
                aria-describedby={errors.githubLink ? "github-error" : undefined}
              />
              {errors.githubLink && (
                <p id="github-error" className="mt-1 text-xs font-semibold text-[#B91C1C]">
                  {errors.githubLink}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="render-link"
                className="mb-1 block text-sm font-bold dark:text-gray-200"
              >
                Link de Render
              </label>
              <input
                id="render-link"
                type="url"
                className="w-full rounded border px-2 py-1 dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200"
                placeholder="https://render.com/..."
                value={renderLink}
                onChange={(e) => setRenderLink(e.target.value)}
                aria-invalid={!!errors.renderLink}
                aria-describedby={errors.renderLink ? "render-error" : undefined}
              />
              {errors.renderLink && (
                <p id="render-error" className="mt-1 text-xs font-semibold text-[#B91C1C]">
                  {errors.renderLink}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="comentarios"
                className="mb-1 block text-sm font-bold dark:text-gray-200"
              >
                Comentarios
              </label>
              <textarea
                id="comentarios"
                rows="3"
                className="w-full rounded border px-2 py-1 dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200"
                placeholder="Notas adicionales..."
                value={comentarios}
                onChange={(e) => setComentarios(e.target.value)}
              />
            </div>

            <div className="mt-4 flex justify-center">
              <Button
                variant="primary"
                className="px-6 py-2"
                onClick={onAgregar}
                aria-label="Agregar nueva entrega"
              >
                Agregar Entrega
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
