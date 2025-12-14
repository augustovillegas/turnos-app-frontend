import { useForm, Controller } from "react-hook-form";
import { useEffect } from "react";
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
  const { control, handleSubmit, watch, setValue } = useForm({
    mode: "onChange",
    defaultValues: valores,
  });

  const valoresActuales = watch();

  useEffect(() => {
    Object.keys(valores).forEach((key) => {
      if (valoresActuales[key] !== valores[key]) {
        setValue(key, valores[key]);
      }
    });
  }, [valores, setValue, valoresActuales]);

  const manejarCambio = (name) => (event) => {
    const { value } = event.target;
    alCambiar(name, value);
  };

  return (
    <form
      onSubmit={handleSubmit(() => alEnviar())}
      className="space-y-4 rounded-md border-2 border-[#111827] bg-white p-4 dark:border-[#333] dark:bg-[#1E1E1E]"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-bold text-[#111827] dark:text-gray-200">
            Review *
          </label>
          <Controller
            name="review"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                onChange={(e) => {
                  field.onChange(e);
                  manejarCambio("review")(e);
                }}
                className="w-full rounded border px-2 py-1 text-sm dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200"
              >
                {[1, 2, 3, 4, 5].map((review) => (
                  <option key={review} value={review}>
                    Review {review}
                  </option>
                ))}
              </select>
            )}
          />
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
          <Controller
            name="fecha"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="date"
                onChange={(e) => {
                  field.onChange(e);
                  manejarCambio("fecha")(e);
                }}
                className="w-full rounded border px-2 py-1 text-sm dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200"
              />
            )}
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
          <Controller
            name="horaInicio"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="time"
                onChange={(e) => {
                  field.onChange(e);
                  manejarCambio("horaInicio")(e);
                }}
                className="w-full rounded border px-2 py-1 text-sm dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200"
              />
            )}
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
          <Controller
            name="horaFin"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="time"
                onChange={(e) => {
                  field.onChange(e);
                  manejarCambio("horaFin")(e);
                }}
                className="w-full rounded border px-2 py-1 text-sm dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200"
              />
            )}
          />
          {errores.horaFin && (
            <p className="mt-1 text-xs font-semibold text-[#B91C1C]">
              {errores.horaFin}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-bold text-[#111827] dark:text-gray-200">
            Número de sala (room) *
          </label>
          <Controller
            name="sala"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="number"
                min={1}
                placeholder="101"
                onChange={(e) => {
                  field.onChange(e);
                  manejarCambio("sala")(e);
                }}
                className="w-full rounded border px-2 py-1 text-sm dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200"
              />
            )}
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
          <Controller
            name="zoomLink"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="url"
                placeholder="https://zoom.us/..."
                onChange={(e) => {
                  field.onChange(e);
                  manejarCambio("zoomLink")(e);
                }}
                className="w-full rounded border px-2 py-1 text-sm dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200"
              />
            )}
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
        <Controller
          name="comentarios"
          control={control}
          render={({ field }) => (
            <textarea
              {...field}
              rows={3}
              onChange={(e) => {
                field.onChange(e);
                manejarCambio("comentarios")(e);
              }}
              className="w-full rounded border px-2 py-1 text-sm dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200"
            />
          )}
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

