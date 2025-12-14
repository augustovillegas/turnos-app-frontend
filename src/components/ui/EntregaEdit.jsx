// === Entrega Edit ===
// Editor de entregas sin carga diferida, usando la entrega ya pasada.
import { useState } from "react";
import { useAppData } from "../../context/AppContext";
import { useModal } from "../../context/ModalContext";
import { showToast } from "../../utils/feedback/toasts";
import { Button } from "../ui/Button";
import { EntregaForm } from "../ui/EntregaForm";

export const EntregaEdit = ({ entrega, onVolver }) => {
  const { updateEntrega } = useAppData();
  const { showModal } = useModal();

  const [formValues, setFormValues] = useState({
    sprint: entrega?.sprint ?? "",
    githubLink: entrega?.githubLink ?? "",
    renderLink: entrega?.renderLink ?? "",
    comentarios: entrega?.comentarios ?? "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = () => {
    const errs = {};
    if (!formValues.sprint) errs.sprint = "El sprint es obligatorio";
    if (!formValues.githubLink?.trim())
      errs.githubLink = "Debe ingresar el enlace de GitHub";

    if (Object.keys(errs).length) {
      setErrors(errs);
      showToast("Revisa los campos antes de guardar", "warning");
      return;
    }

    showModal({
      type: "warning",
      title: "Guardar cambios",
      message: "¿Confirmás los cambios en esta entrega?",
      onConfirm: async () => {
        try {
          await updateEntrega(entrega.id, {
            ...formValues,
            sprint: Number(formValues.sprint),
          });
          showToast("Entrega actualizada correctamente", "success");
          onVolver?.();
        } catch (err) {
          showToast(err.message || "Error al actualizar entrega", "error");
        }
      },
    });
  };

  const handleCancel = () => {
    showModal({
      type: "warning",
      title: "Cancelar edición",
      message: "¿Salir de la edición? Los cambios no guardados se perderán.",
      onConfirm: () => onVolver?.(),
    });
  };

  return (
    <div className="w-full bg-transparent">
      <div className="w-full flex flex-col gap-6">
        <div className="flex items-center justify-between px-4 sm:px-6">
          <h1 className="text-3xl font-bold text-[#1E3A8A] dark:text-[#93C5FD]">
            Editar entrega
          </h1>
        </div>

        <EntregaForm
          sprint={formValues.sprint}
          githubLink={formValues.githubLink}
          renderLink={formValues.renderLink}
          comentarios={formValues.comentarios}
          setSprint={(v) => handleChange("sprint", v)}
          setGithubLink={(v) => handleChange("githubLink", v)}
          setRenderLink={(v) => handleChange("renderLink", v)}
          setComentarios={(v) => handleChange("comentarios", v)}
          errors={errors}
          onAgregar={handleSubmit}
          onVolver={handleCancel}
        />
      </div>
    </div>
  );
};
