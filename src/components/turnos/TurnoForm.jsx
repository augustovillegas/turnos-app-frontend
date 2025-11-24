// === Turno Form ===
// Formulario para crear nuevos turnos desde cualquier dashboard autorizado.
import { useState } from "react";
import { ItemForm } from "../turnos/ItemForm";
import { useAppData } from "../../context/AppContext";
import { useLoading } from "../../context/LoadingContext";
import {
  buildTurnoPayloadFromForm,
  formValuesFromTurno,
  validateTurnoForm,
} from "../../utils/turnos/form";
import { showToast } from "../../utils/feedback/toasts";
import { extractFormErrors } from "../../utils/feedback/errorExtractor";
import { Button } from "../ui/Button";

import { useAuth } from "../../context/AuthContext";

export const TurnoForm = ({ onVolver }) => {
  // --- Estado local y helpers del formulario ---
  const { createTurno } = useAppData();
  const { isLoading } = useLoading();
  const { usuario: sessionUser } = useAuth();
  const turnosLoading = isLoading("turnos");
  const [valoresFormulario, establecerValoresFormulario] = useState(() =>
    formValuesFromTurno(null)
  );
  const [erroresFormulario, establecerErroresFormulario] = useState({});

  const manejarCambioCampo = (nombre, valor) => {
    establecerValoresFormulario((previos) => ({ ...previos, [nombre]: valor }));
    establecerErroresFormulario((previos) => ({ ...previos, [nombre]: "" }));
  };

  const manejarEnvio = async () => {
    const erroresDetectados = validateTurnoForm(valoresFormulario);
    if (Object.keys(erroresDetectados).length > 0) {
      establecerErroresFormulario(erroresDetectados);
      showToast("Revisa los datos del formulario.", "warning");
      return;
    }

    try {
      const creadorInfo = {
        id: sessionUser?.id || sessionUser?._id,
        nombre: sessionUser?.name || sessionUser?.nombre || "Sistema",
      };
      await createTurno(buildTurnoPayloadFromForm(valoresFormulario, creadorInfo));
      showToast("Turno creado correctamente.");
      onVolver?.();
    } catch (error) {
      // Extraer errores de validación del backend según contrato {message, errores?}
      const formErrors = extractFormErrors(error);
      if (Object.keys(formErrors).length > 0) {
        establecerErroresFormulario(formErrors);
      }
      showToast(error.message || "No se pudo crear el turno.", "error");
    }
  };

  return (
    <div className="min-h-screen bg-[#017F82] p-4 sm:p-6 transition-colors duration-300 dark:bg-[#0F3D3F]">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1E3A8A] dark:text-[#93C5FD]">
            Crear turno
          </h1>
          <Button variant="secondary" onClick={() => onVolver?.()}>
            Volver
          </Button>
        </div>

        <ItemForm
          valores={valoresFormulario}
          errores={erroresFormulario}
          alCambiar={manejarCambioCampo}
          alEnviar={manejarEnvio}
          etiquetaEnvio="Guardar turno"
          estaCargando={turnosLoading}
        />
      </div>
    </div>
  );
};





