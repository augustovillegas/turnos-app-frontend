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
    // 🔧 Se eliminó el fondo de color sólido (#017F82) para integrar visualmente
    // con el fondo general del DashboardAlumno y evitar doble color de fondo.
    // Se ajustó el padding para ser adaptable en móvil y desktop.
    <div className="w-full p-4 sm:p-6 flex justify-center bg-transparent">
      <div className="w-full max-w-3xl flex flex-col gap-6">
        {/* Contenedor principal del formulario */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onAgregar?.();
          }}
          className="space-y-6 rounded-lg border-2 border-[#111827]/30 bg-white p-4 sm:p-6 shadow-md 
                     dark:border-[#333]/60 dark:bg-[#1E1E1E] transition-colors duration-300"
          autoComplete="off"
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
                className="w-full rounded border px-2 py-2 text-sm dark:border-[#444] 
                           dark:bg-[#2A2A2A] dark:text-gray-200"
                value={sprint}
                onChange={(e) => setSprint(e.target.value)}
                aria-invalid={!!errors.sprint}
                aria-label="Seleccionar número de sprint"
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
                className="w-full rounded border px-2 py-2 text-sm dark:border-[#444] 
                           dark:bg-[#2A2A2A] dark:text-gray-200"
                placeholder="https://github.com/usuario/proyecto"
                value={githubLink}
                onChange={(e) => setGithubLink(e.target.value)}
                aria-label="Enlace del repositorio GitHub"
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
                className="w-full rounded border px-2 py-2 text-sm dark:border-[#444] 
                           dark:bg-[#2A2A2A] dark:text-gray-200"
                placeholder="https://render.com/..."
                value={renderLink}
                onChange={(e) => setRenderLink(e.target.value)}
                aria-label="Enlace de despliegue Render"
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
                className="w-full rounded border px-2 py-2 text-sm dark:border-[#444] 
                           dark:bg-[#2A2A2A] dark:text-gray-200"
                placeholder="Notas adicionales..."
                value={comentarios}
                onChange={(e) => setComentarios(e.target.value)}
                aria-label="Campo de comentarios adicionales"
              />
            </div>
          </div>

          {/* Acciones */}
          <div className="flex flex-col sm:flex-row sm:justify-end gap-3 mt-4">
            {onVolver && (
              <Button
                type="button"
                variant="secondary"
                className="w-full sm:w-auto px-5 py-2 font-semibold"
                onClick={onVolver}
              >
                Volver
              </Button>
            )}
            <Button
              type="submit"
              variant="primary"
              className="w-full sm:w-auto px-5 py-2 font-semibold"
            >
              Agregar Entrega
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
