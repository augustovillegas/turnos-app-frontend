// === Turno Edit ===
// Editor completo de turnos con carga diferida y validaciones.
import { useEffect, useMemo, useState } from "react";
import { ItemForm } from "../items/ItemForm";
import { useAppData } from "../../context/AppContext";
import { buildTurnoPayloadFromForm, formValuesFromTurno, validateTurnoForm } from "../../utils/turnos/form";
import { showToast } from "../../utils/feedback/toasts";
import { Button } from "../ui/Button";

export const TurnoEdit = ({ turno, turnoId, onVolver }) => {
  // --- Contexto y estados locales para manejar la edicion ---
  const { findTurnoById, updateTurno, turnosLoading } = useAppData();
  const [currentTurno, setCurrentTurno] = useState(turno ?? null);
  const [values, setValues] = useState(() => formValuesFromTurno(turno ?? null));
  const [errors, setErrors] = useState({});
  const [loadingTurno, setLoadingTurno] = useState(!turno && Boolean(turnoId));
  const [notFound, setNotFound] = useState(false);

  const effectiveId = useMemo(
    () => currentTurno?.id ?? turno?.id ?? turnoId ?? null,
    [currentTurno, turno, turnoId]
  );

  useEffect(() => {
    if (!turno) return;
    setCurrentTurno(turno);
    setValues(formValuesFromTurno(turno));
    setNotFound(false);
    setLoadingTurno(false);
  }, [turno]);

  useEffect(() => {
    if (turno || !turnoId) return;

    let cancelled = false;
    setLoadingTurno(true);
    findTurnoById(turnoId)
      .then((fetched) => {
        if (cancelled) return;
        if (!fetched) {
          setNotFound(true);
          return;
        }
        setCurrentTurno(fetched);
        setValues(formValuesFromTurno(fetched));
        setNotFound(false);
      })
      .catch((error) => {
        if (cancelled) return;
        showToast(error.message || "No se pudo cargar el turno.", "error");
        setNotFound(true);
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingTurno(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [turno, turnoId, findTurnoById]);

  // --- Sincroniza cambios del formulario con el estado local ---
  const handleChange = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // --- Guarda cambios confirmados y valida la informacion ---
  const handleSubmit = async () => {
    const nextErrors = validateTurnoForm(values);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      showToast(
        "Revisá los campos resaltados antes de guardar los cambios.",
        "warning"
      );
      return;
    }

    if (!effectiveId) {
      showToast(
        "No encontramos el turno para editar. Volvé a intentarlo desde el listado.",
        "error"
      );
      return;
    }

    const confirmed = window.confirm(
      "¿Guardar los cambios realizados en este turno?"
    );
    if (!confirmed) return;

    try {
      await updateTurno(effectiveId, buildTurnoPayloadFromForm(values));
      showToast("Cambios guardados. El turno se actualizó correctamente.");
      onVolver?.();
    } catch (error) {
      showToast(
        error.message ||
          "No pudimos actualizar el turno. Intentá de nuevo en unos instantes.",
        "error"
      );
    }
  };

  if (notFound) {
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

  if (loadingTurno) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#017F82] p-6 dark:bg-[#0F3D3F]">
        <p className="rounded-md border-2 border-[#1E3A8A] bg-white px-4 py-2 font-semibold text-[#1E3A8A] dark:border-[#93C5FD] dark:bg-[#1E1E1E] dark:text-[#93C5FD]">
          Cargando datos del turno...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#017F82] p-6 transition-colors duration-300 dark:bg-[#0F3D3F]">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-[#1E3A8A] dark:text-[#93C5FD]">
            Editar turno
          </h1>
          <Button
            variant="secondary"
            onClick={() => {
              if (
                window.confirm(
                  "¿Salir de la edición? Los cambios sin guardar se perderán."
                )
              ) {
                onVolver?.();
              }
            }}
          >
            Cancelar
          </Button>
        </div>

        <ItemForm
          values={values}
          errors={errors}
          onChange={handleChange}
          onSubmit={handleSubmit}
          submitLabel="Actualizar turno"
          loading={turnosLoading}
        />
      </div>
    </div>
  );
};
