import { DropdownActions } from "../ui/DropdownActions";

export const ProfesorActions = ({
  item,
  onAprobar,
  onRechazar,
  onVer,
  onVerDetalle,
  onCopiarZoom,
  disabled = false,
}) => {
  if (!item) return null;

  const estado = String(item.estado || "").toLowerCase();
  const options = [];

  // Acciones principales en estado "solicitado"
  if (estado === "solicitado") {
    options.push(
      {
        label: "Aprobar",
        icon: "/icons/check.png",
        onClick: () => onAprobar?.(item),
        disabled,
      },
      {
        label: "Rechazar",
        icon: "/icons/close.png",
        danger: true,
        onClick: () => onRechazar?.(item),
        disabled,
      }
    );
  }

  // Utilidad: copiar link de Zoom si está disponible
  options.push({
    label: "Copiar enlace",
    icon: "/icons/copy.png",
    onClick: () => onCopiarZoom?.(item),
    disabled,
  });

  // Siempre incluir "Ver detalle" (no dejar vacío otros estados)
  options.push({
    label: "Ver detalle",
    icon: "/icons/eye.png",
    onClick: () => {
      if (onVer) return onVer(item);
      if (onVerDetalle) return onVerDetalle(item);
    },
    disabled,
  });

  return <DropdownActions options={options} />;
};
