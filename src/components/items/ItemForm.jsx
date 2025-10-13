import { Button } from "../ui/Button";

export const ItemForm = ({
  values,
  errors,
  onChange,
  onSubmit,
  submitLabel,
  loading = false,
  onCancel,
}) => {
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    onChange(name, value);
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
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
            value={values.review}
            onChange={handleInputChange}
            className="w-full rounded border px-2 py-1 text-sm dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200"
          >
            {[1, 2, 3, 4, 5].map((review) => (
              <option key={review} value={review}>
                Review {review}
              </option>
            ))}
          </select>
          {errors.review && (
            <p className="mt-1 text-xs font-semibold text-[#B91C1C]">
              {errors.review}
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
            value={values.fecha}
            onChange={handleInputChange}
            className="w-full rounded border px-2 py-1 text-sm dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200"
          />
          {errors.fecha && (
            <p className="mt-1 text-xs font-semibold text-[#B91C1C]">
              {errors.fecha}
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
            value={values.horaInicio}
            onChange={handleInputChange}
            className="w-full rounded border px-2 py-1 text-sm dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200"
          />
          {errors.horaInicio && (
            <p className="mt-1 text-xs font-semibold text-[#B91C1C]">
              {errors.horaInicio}
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
            value={values.horaFin}
            onChange={handleInputChange}
            className="w-full rounded border px-2 py-1 text-sm dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200"
          />
          {errors.horaFin && (
            <p className="mt-1 text-xs font-semibold text-[#B91C1C]">
              {errors.horaFin}
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
            value={values.sala}
            onChange={handleInputChange}
            placeholder="Sala 101"
            className="w-full rounded border px-2 py-1 text-sm dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200"
          />
          {errors.sala && (
            <p className="mt-1 text-xs font-semibold text-[#B91C1C]">
              {errors.sala}
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
            value={values.zoomLink}
            onChange={handleInputChange}
            placeholder="https://zoom.us/..."
            className="w-full rounded border px-2 py-1 text-sm dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200"
          />
          {errors.zoomLink && (
            <p className="mt-1 text-xs font-semibold text-[#B91C1C]">
              {errors.zoomLink}
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
          value={values.comentarios}
          onChange={handleInputChange}
          rows={3}
          className="w-full rounded border px-2 py-1 text-sm dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200"
        />
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:justify-end">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            className="md:w-auto"
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          className="md:w-auto"
          disabled={loading}
        >
          {loading ? "Procesando..." : submitLabel}
        </Button>
      </div>
    </form>
  );
};

