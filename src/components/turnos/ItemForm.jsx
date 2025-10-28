import { Button } from "../ui/Button";

export const ItemForm = ({
  valores,
  errores,
  alCambiar,
  alEnviar,
  etiquetaEnvio,
  estaCargando = false,
  alCancelar,
}) => {
  const manejarCambio = (evento) => {
    const { name, value } = evento.target;
    alCambiar(name, value);
  };

  return (
    <form
      onSubmit={(evento) => {
        evento.preventDefault();
        alEnviar();
      }}
      className="space-y-4 rounded-md border-2 border-[#111827] bg-white p-4 dark:border-[#333] dark:bg-[#1E1E1E]"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-bold text-[#111827] dark:text-gray-200">
            Review *
          </label>
          <select
            name="review"
            value={valores.review}
            onChange={manejarCambio}
            className="w-full rounded border px-2 py-1 text-sm dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200"
          >
            {[1, 2, 3, 4, 5].map((review) => (
              <option key={review} value={review}>
                Review {review}
              </option>
            ))}
          </select>
          {errores.review && (
            <p className="mt-1 text-xs font-semibold text-[#B91C1C]">
              {errores.review}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-bold text-[#111827] dark:text-gray-200">
            Fecha *
          </label>
          <input
            type="date"
            name="fecha"
            value={valores.fecha}
            onChange={manejarCambio}
            className="w-full rounded border px-2 py-1 text-sm dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200"
          />
          {errores.fecha && (
            <p className="mt-1 text-xs font-semibold text-[#B91C1C]">
              {errores.fecha}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-bold text-[#111827] dark:text-gray-200">
            Hora inicio *
          </label>
          <input
            type="time"
            name="horaInicio"
            value={valores.horaInicio}
            onChange={manejarCambio}
            className="w-full rounded border px-2 py-1 text-sm dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200"
          />
          {errores.horaInicio && (
            <p className="mt-1 text-xs font-semibold text-[#B91C1C]">
              {errores.horaInicio}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-bold text-[#111827] dark:text-gray-200">
            Hora fin *
          </label>
          <input
            type="time"
            name="horaFin"
            value={valores.horaFin}
            onChange={manejarCambio}
            className="w-full rounded border px-2 py-1 text-sm dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200"
          />
          {errores.horaFin && (
            <p className="mt-1 text-xs font-semibold text-[#B91C1C]">
              {errores.horaFin}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-bold text-[#111827] dark:text-gray-200">
            Sala o espacio *
          </label>
          <input
            type="text"
            name="sala"
            value={valores.sala}
            onChange={manejarCambio}
            placeholder="Sala 101"
            className="w-full rounded border px-2 py-1 text-sm dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200"
          />
          {errores.sala && (
            <p className="mt-1 text-xs font-semibold text-[#B91C1C]">
              {errores.sala}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-bold text-[#111827] dark:text-gray-200">
            Enlace de Zoom *
          </label>
          <input
            type="url"
            name="zoomLink"
            value={valores.zoomLink}
            onChange={manejarCambio}
            placeholder="https://zoom.us/..."
            className="w-full rounded border px-2 py-1 text-sm dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200"
          />
          {errores.zoomLink && (
            <p className="mt-1 text-xs font-semibold text-[#B91C1C]">
              {errores.zoomLink}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-bold text-[#111827] dark:text-gray-200">
          Comentarios internos
        </label>
        <textarea
          name="comentarios"
          value={valores.comentarios}
          onChange={manejarCambio}
          rows={3}
          className="w-full rounded border px-2 py-1 text-sm dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200"
        />
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:justify-end">
        {alCancelar && (
          <Button
            type="button"
            variant="secondary"
            className="md:w-auto"
            onClick={alCancelar}
            disabled={estaCargando}
          >
            Cancelar
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          className="md:w-auto"
          disabled={estaCargando}
        >
          {estaCargando ? "Procesando..." : etiquetaEnvio}
        </Button>
      </div>
    </form>
  );
};

