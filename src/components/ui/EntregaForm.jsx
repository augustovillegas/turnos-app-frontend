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
    <div className="min-h-screen bg-[#017F82] transition-colors duration-300 dark:bg-[#0F3D3F] flex flex-col items-center">
      {/* 🎨 Botón y título fuera del recuadro */}
      <div className="w-full max-w-5xl flex flex-col gap-4 mt-8">
        <div className="flex justify-between items-center">
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
          <h2 className="text-2xl font-bold text-[#1E3A8A] dark:text-[#93C5FD]">
            Nueva Entrega
          </h2>
        </div>
      </div>

      {/* 🎨 Recuadro del formulario */}
      <div className="w-full max-w-5xl bg-white dark:bg-[#1E1E1E] border-2 border-[#111827] dark:border-[#333] p-6 rounded-md shadow-md mt-4 mb-8 transition-colors duration-300">
        <div className="flex flex-col gap-4">
          {/* Campo Sprint */}
          <div>
            <label
              htmlFor="sprint-select"
              className="block text-sm font-bold mb-1 dark:text-gray-200"
            >
              Sprint *
            </label>
            <select
              id="sprint-select"
              className="w-full border px-2 py-1 rounded dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200"
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
              <p
                id="sprint-error"
                className="mt-1 text-xs font-semibold text-[#B91C1C]"
              >
                {errors.sprint}
              </p>
            )}
          </div>

          {/* Campo GitHub */}
          <div>
            <label
              htmlFor="github-link"
              className="block text-sm font-bold mb-1 dark:text-gray-200"
            >
              Link de GitHub *
            </label>
            <input
              id="github-link"
              type="url"
              className="w-full border px-2 py-1 rounded dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200"
              placeholder="https://github.com/usuario/proyecto"
              value={githubLink}
              onChange={(e) => setGithubLink(e.target.value)}
              aria-invalid={!!errors.githubLink}
              aria-describedby={errors.githubLink ? "github-error" : undefined}
            />
            {errors.githubLink && (
              <p
                id="github-error"
                className="mt-1 text-xs font-semibold text-[#B91C1C]"
              >
                {errors.githubLink}
              </p>
            )}
          </div>

          {/* Campo Render */}
          <div>
            <label
              htmlFor="render-link"
              className="block text-sm font-bold mb-1 dark:text-gray-200"
            >
              Link de Render
            </label>
            <input
              id="render-link"
              type="url"
              className="w-full border px-2 py-1 rounded dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200"
              placeholder="https://render.com/..."
              value={renderLink}
              onChange={(e) => setRenderLink(e.target.value)}
              aria-invalid={!!errors.renderLink}
              aria-describedby={errors.renderLink ? "render-error" : undefined}
            />
            {errors.renderLink && (
              <p
                id="render-error"
                className="mt-1 text-xs font-semibold text-[#B91C1C]"
              >
                {errors.renderLink}
              </p>
            )}
          </div>

          {/* Campo Comentarios */}
          <div>
            <label
              htmlFor="comentarios"
              className="block text-sm font-bold mb-1 dark:text-gray-200"
            >
              Comentarios
            </label>
            <textarea
              id="comentarios"
              rows="3"
              className="w-full border px-2 py-1 rounded dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200"
              placeholder="Notas adicionales..."
              value={comentarios}
              onChange={(e) => setComentarios(e.target.value)}
            />
          </div>

          {/* Botón principal */}
          <div className="flex justify-center mt-4">
            <Button
              variant="primary"
              className="py-2 px-6"
              onClick={onAgregar}
              aria-label="Agregar nueva entrega"
            >
              Agregar Entrega
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
