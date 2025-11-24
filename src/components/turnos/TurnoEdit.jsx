// === Turno Edit ===
// Editor completo de turnos con carga diferida y validaciones.
import { useEffect, useMemo, useState } from "react";
import { ItemForm } from "../turnos/ItemForm";
import { useAppData } from "../../context/AppContext";
import { useLoading } from "../../context/LoadingContext";
import { useModal } from "../../context/ModalContext";
import {
  buildTurnoPayloadFromForm,
  formValuesFromTurno,
  validateTurnoForm,
} from "../../utils/turnos/form";
import { showToast } from "../../utils/feedback/toasts";
import { extractFormErrors } from "../../utils/feedback/errorExtractor";
import { Button } from "../ui/Button";

export const TurnoEdit = ({ turno, turnoId, onVolver }) => {
  const { findTurnoById, updateTurno } = useAppData();
  const { isLoading } = useLoading();
  const turnosLoading = isLoading("turnos");
  const { showModal } = useModal();
  const [turnoActual, establecerTurnoActual] = useState(turno ?? null);
  const [valoresFormulario, establecerValoresFormulario] = useState(() =>
    formValuesFromTurno(turno ?? null)
  );
  const [erroresFormulario, establecerErroresFormulario] = useState({});
  const [cargandoTurno, establecerCargandoTurno] = useState(
    !turno && Boolean(turnoId)
  );
  const [sinResultados, establecerSinResultados] = useState(false);

  const identificadorEfectivo = useMemo(
    () => turnoActual?.id ?? turno?.id ?? turnoId ?? null,
    [turnoActual, turno, turnoId]
  );

  useEffect(() => {
    if (!turno) return;
    establecerTurnoActual(turno);
    establecerValoresFormulario(formValuesFromTurno(turno));
    establecerSinResultados(false);
    establecerCargandoTurno(false);
  }, [turno]);

  useEffect(() => {
    if (turno || !turnoId) return;

    let cancelado = false;
    establecerCargandoTurno(true);
    findTurnoById(turnoId)
      .then((resultado) => {
        if (cancelado) return;
        if (!resultado) {
          establecerSinResultados(true);
          return;
        }
        establecerTurnoActual(resultado);
        establecerValoresFormulario(formValuesFromTurno(resultado));
        establecerSinResultados(false);
      })
      .catch((error) => {
        if (cancelado) return;
        showToast(error.message || "No se pudo cargar el turno.", "error");
        establecerSinResultados(true);
      })
      .finally(() => {
        if (!cancelado) {
          establecerCargandoTurno(false);
        }
      });

    return () => {
      cancelado = true;
    };
  }, [turno, turnoId, findTurnoById]);

  const manejarCambioCampo = (nombre, valor) => {
    establecerValoresFormulario((previos) => ({ ...previos, [nombre]: valor }));
    establecerErroresFormulario((previos) => ({ ...previos, [nombre]: "" }));
  };

  const manejarEnvio = () => {
    const erroresDetectados = validateTurnoForm(valoresFormulario);
    if (Object.keys(erroresDetectados).length > 0) {
      establecerErroresFormulario(erroresDetectados);
      showToast(
        "Revisa los campos resaltados antes de guardar los cambios.",
        "warning"
      );
      return;
    }

    if (!identificadorEfectivo) {
      showToast("No encontramos el turno para editar.", "error");
      return;
    }

    showModal({
      type: "warning",
      title: "Guardar cambios",
      message: "¿Confirmás los cambios realizados en este turno?",
      onConfirm: () => {
        void persistirCambios();
      },
    });
  };

  const persistirCambios = async () => {
    try {
      await updateTurno(
        identificadorEfectivo,
        buildTurnoPayloadFromForm(valoresFormulario)
      );
      showToast("Cambios guardados. El turno se actualizó correctamente.");
      onVolver?.();
    } catch (error) {
      // Extraer errores de validación del backend según contrato {message, errores?}
      const formErrors = extractFormErrors(error);
      if (Object.keys(formErrors).length > 0) {
        establecerErroresFormulario(formErrors);
      }
      showToast(
        error.message ||
          "No pudimos actualizar el turno. Inténtalo de nuevo en unos instantes.",
        "error"
      );
    }
  };

  const solicitarSalida = () => {
    showModal({
      type: "warning",
      title: "Cancelar edición",
      message: "¿Salir de la edición? Los cambios sin guardar se perderán.",
      onConfirm: () => {
        onVolver?.();
      },
    });
  };

  if (sinResultados) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#017F82] p-6 dark:bg-[#0F3D3F]">
        <div className="max-w-md rounded-md border-2 border-[#111827] bg-white p-6 text-center dark:border-[#333] dark:bg-[#1E1E1E]">
          <h2 className="mb-2 text-2xl font-bold text-[#B91C1C]">
            No encontramos el turno
          </h2>
          <p className="mb-4 text-sm text-[#374151] dark:text-gray-300">
            Verifica que el recurso exista en la API.
          </p>
          <Button onClick={() => onVolver?.()}>Volver al listado</Button>
        </div>
      </div>
    );
  }

  if (cargandoTurno) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#017F82] p-6 dark:bg-[#0F3D3F]">
        <p className="rounded-md border-2 border-[#1E3A8A] bg-white px-4 py-2 font-semibold text-[#1E3A8A] dark:border-[#93C5FD] dark:bg-[#1E1E1E] dark:text-[#93C5FD]">
          Cargando datos del turno...
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 text-[#111827] dark:text-gray-100 transition-colors duration-300">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1E3A8A] dark:text-[#93C5FD]">
            Editar turno
          </h1>
          <Button variant="secondary" onClick={solicitarSalida}>
            Volver
          </Button>
        </div>

        <ItemForm
          valores={valoresFormulario}
          errores={erroresFormulario}
          alCambiar={manejarCambioCampo}
          alEnviar={manejarEnvio}
          etiquetaEnvio="Actualizar turno"
          estaCargando={turnosLoading}
          alCancelar={solicitarSalida}
        />
      </div>
    </div>
  );
};




