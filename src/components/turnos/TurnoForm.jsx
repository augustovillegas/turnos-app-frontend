// === Turno Form ===
// Formulario para crear nuevos turnos desde cualquier dashboard autorizado.
import { useState } from "react";
import { ItemForm } from "../items/ItemForm";
import { useAppData } from "../../context/AppContext";
import {
  buildTurnoPayloadFromForm,
  formValuesFromTurno,
  validateTurnoForm,
} from "../../utils/turnos/form";
import { showToast } from "../../utils/feedback/toasts";
import { Button } from "../ui/Button";

export const TurnoForm = ({ onVolver }) => {
  // --- Estado local y helpers del formulario ---
  const { createTurno, turnosLoading } = useAppData();
  const [values, setValues] = useState(() => formValuesFromTurno(null));
  const [errors, setErrors] = useState({});

  const handleChange = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async () => {
    const nextErrors = validateTurnoForm(values);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      showToast("Revisa los datos del formulario.", "warning");
      return;
    }

    try {
      await createTurno(buildTurnoPayloadFromForm(values));
      showToast("Turno creado correctamente.");
      onVolver?.();
    } catch (error) {
      showToast(error.message || "No se pudo crear el turno.", "error");
    }
  };

  return (
    <div className="min-h-screen bg-[#017F82] p-6 transition-colors duration-300 dark:bg-[#0F3D3F]">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-[#1E3A8A] dark:text-[#93C5FD]">
            Crear turno
          </h1>
          <Button variant="secondary" onClick={() => onVolver?.()}>
            Volver
          </Button>
        </div>

        <ItemForm
          values={values}
          errors={errors}
          onChange={handleChange}
          onSubmit={handleSubmit}
          submitLabel="Guardar turno"
          loading={turnosLoading}
        />
      </div>
    </div>
  );
};
