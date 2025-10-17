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
}) => {
  return (
    <div className="max-w-5xl mx-auto w-full bg-white dark:bg-[#1E1E1E] border-2 border-[#111827] dark:border-[#333] p-4 rounded-md mb-6 transition-colors duration-300">
      <div className="mb-3">
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

      <div className="mb-3">
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

      <div className="mb-3">
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

      <div className="mb-3">
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

      <Button
        variant="primary"
        className="py-2 mx-auto"
        onClick={onAgregar}
        aria-label="Agregar nueva entrega"
      >
        Agregar Entrega
      </Button>
    </div>
  );
};
