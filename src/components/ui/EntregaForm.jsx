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
    <div className="min-h-screen bg-[#017F82] p-6 transition-colors duration-300 dark:bg-[#0F3D3F] text-[#111827] dark:text-gray-100">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        {/* Encabezado */}
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
        </div>

        {/* Contenedor principal */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onAgregar?.();
          }}
          className="space-y-6 rounded-md border-2 border-[#111827] bg-white p-6 shadow-md 
                     dark:border-[#333] dark:bg-[#1E1E1E] transition-colors duration-300"
        >
          {/* Grid responsiva */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Sprint */}
            <div className="md:col-span-2">
              <label
                htmlFor="sprint-select"
                className="mb-1 block text-sm font-bold dark:text-gray-200"
              >
                Sprint *
              </label>
              <select
                id="sprint-select"
                className="w-full rounded border px-2 py-1 text-sm dark:border-[#444] 
                           dark:bg-[#2A2A2A] dark:text-gray-200"
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
                <p className="mt-1 text-xs font-semibold text-[#B91C1C]">
                  {errors.sprint}
                </p>
              )}
            </div>

            {/* GitHub */}
            <div className="md:col-span-2">
              <label
                htmlFor="github-link"
                className="mb-1 block text-sm font-bold dark:text-gray-200"
              >
                Link de GitHub *
              </label>
              <input
                id="github-link"
                type="url"
                className="w-full rounded border px-2 py-1 text-sm dark:border-[#444] 
                           dark:bg-[#2A2A2A] dark:text-gray-200"
                placeholder="https://github.com/usuario/proyecto"
                value={githubLink}
                onChange={(e) => setGithubLink(e.target.value)}
              />
              {errors.githubLink && (
                <p className="mt-1 text-xs font-semibold text-[#B91C1C]">
                  {errors.githubLink}
                </p>
              )}
            </div>

            {/* Render */}
            <div className="md:col-span-2">
              <label
                htmlFor="render-link"
                className="mb-1 block text-sm font-bold dark:text-gray-200"
              >
                Link de Render
              </label>
              <input
                id="render-link"
                type="url"
                className="w-full rounded border px-2 py-1 text-sm dark:border-[#444] 
                           dark:bg-[#2A2A2A] dark:text-gray-200"
                placeholder="https://render.com/..."
                value={renderLink}
                onChange={(e) => setRenderLink(e.target.value)}
              />
              {errors.renderLink && (
                <p className="mt-1 text-xs font-semibold text-[#B91C1C]">
                  {errors.renderLink}
                </p>
              )}
            </div>

            {/* Comentarios */}
            <div className="md:col-span-2">
              <label
                htmlFor="comentarios"
                className="mb-1 block text-sm font-bold dark:text-gray-200"
              >
                Comentarios
              </label>
              <textarea
                id="comentarios"
                rows="3"
                className="w-full rounded border px-2 py-1 text-sm dark:border-[#444] 
                           dark:bg-[#2A2A2A] dark:text-gray-200"
                placeholder="Notas adicionales..."
                value={comentarios}
                onChange={(e) => setComentarios(e.target.value)}
              />
            </div>
          </div>

          {/* Acciones */}
          <div className="flex flex-col gap-3 md:flex-row md:justify-end">
            {onVolver && (
              <Button
                type="button"
                variant="secondary"
                className="w-full md:w-auto px-6 py-2"
                onClick={onVolver}
              >
                Volver
              </Button>
            )}
            <Button
              type="submit"
              variant="primary"
              className="w-full md:w-auto px-6 py-2"
            >
              Agregar Entrega
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
