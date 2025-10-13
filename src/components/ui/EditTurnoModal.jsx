import { useState, useEffect } from "react";
import { Button } from "./Button";
import {
  validateTurnoForm,
  formValuesFromTurno,
} from "../../utils/turnos/form";

export const EditTurnoModal = ({ turno, onClose, onSave, loading = false }) => {
  const [formData, setFormData] = useState(formValuesFromTurno(turno || null));
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!turno) return;
    setFormData({
      ...formValuesFromTurno(turno),
      comentarios: turno.comentarios || "",
    });
  }, [turno]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSave = () => {
    const validation = validateTurnoForm(formData);
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }
    onSave(formData);
  };

  if (!turno) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-96 rounded-md border-2 border-[#111827] bg-[#E5E5E5] p-6 shadow-lg dark:border-[#333] dark:bg-[#1E1E1E]">
        <h3 className="mb-4 text-lg font-bold text-[#1E3A8A] dark:text-[#93C5FD]">
          Editar turno
        </h3>

        <div className="flex flex-col gap-3">
          <label className="text-sm font-bold dark:text-gray-200">
            Fecha
            <input
              type="date"
              name="fecha"
              value={formData.fecha}
              onChange={handleChange}
              className="mt-1 w-full rounded border border-[#111827] px-2 py-1 text-sm dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200"
            />
            {errors.fecha && (
              <span className="mt-1 text-xs font-semibold text-[#B91C1C]">
                {errors.fecha}
              </span>
            )}
          </label>

          <label className="text-sm font-bold dark:text-gray-200">
            Hora inicio
            <input
              type="time"
              name="horaInicio"
              value={formData.horaInicio}
              onChange={handleChange}
              className="mt-1 w-full rounded border border-[#111827] px-2 py-1 text-sm dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200"
            />
            {errors.horaInicio && (
              <span className="mt-1 text-xs font-semibold text-[#B91C1C]">
                {errors.horaInicio}
              </span>
            )}
          </label>

          <label className="text-sm font-bold dark:text-gray-200">
            Hora fin
            <input
              type="time"
              name="horaFin"
              value={formData.horaFin}
              onChange={handleChange}
              className="mt-1 w-full rounded border border-[#111827] px-2 py-1 text-sm dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200"
            />
            {errors.horaFin && (
              <span className="mt-1 text-xs font-semibold text-[#B91C1C]">
                {errors.horaFin}
              </span>
            )}
          </label>

          <label className="text-sm font-bold dark:text-gray-200">
            Sala
            <select
              name="sala"
              value={formData.sala}
              onChange={handleChange}
              className="mt-1 w-full rounded border border-[#111827] px-2 py-1 text-sm dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200"
            >
              {[...Array(10)].map((_, index) => {
                const value = `Sala ${index + 1}`;
                return (
                  <option key={value} value={value}>
                    {value}
                  </option>
                );
              })}
            </select>
            {errors.sala && (
              <span className="mt-1 text-xs font-semibold text-[#B91C1C]">
                {errors.sala}
              </span>
            )}
          </label>

          <label className="text-sm font-bold dark:text-gray-200">
            Link de Zoom
            <input
              type="url"
              name="zoomLink"
              value={formData.zoomLink}
              onChange={handleChange}
              className="mt-1 w-full rounded border border-[#111827] px-2 py-1 text-sm dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200"
            />
            {errors.zoomLink && (
              <span className="mt-1 text-xs font-semibold text-[#B91C1C]">
                {errors.zoomLink}
              </span>
            )}
          </label>
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>
      </div>
    </div>
  );
};
