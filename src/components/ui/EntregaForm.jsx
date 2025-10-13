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
    <div className="bg-white dark:bg-[#1E1E1E] border-2 border-[#111827] dark:border-[#333] p-4 rounded-md mb-6 transition-colors duration-300">
      <div className="mb-3">
        <label className="block text-sm font-bold mb-1 dark:text-gray-200">Sprint *</label>
        <select
          className="w-full border px-2 py-1 rounded dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200"
          value={sprint}
          onChange={(e) => setSprint(e.target.value)}
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
      <div className="mb-3">
        <label className="block text-sm font-bold mb-1 dark:text-gray-200">Link de GitHub *</label>
        <input
          type="url"
          className="w-full border px-2 py-1 rounded dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200"
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
      <div className="mb-3">
        <label className="block text-sm font-bold mb-1 dark:text-gray-200">Link de Render</label>
        <input
          type="url"
          className="w-full border px-2 py-1 rounded dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200"
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
      <div className="mb-3">
        <label className="block text-sm font-bold mb-1 dark:text-gray-200">Comentarios</label>
        <textarea
          rows="3"
          className="w-full border px-2 py-1 rounded dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200"
          placeholder="Notas adicionales..."
          value={comentarios}
          onChange={(e) => setComentarios(e.target.value)}
        />
      </div>
      <Button variant="primary" className="py-2 w-full" onClick={onAgregar}>
        Agregar Entrega
      </Button>
    </div>
  );
};
