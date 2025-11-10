import { DropdownActions } from "../ui/DropdownActions";

export const SuperadminActions = ({
  item,
  onVer,
  onEditar,
  onEliminar,
  onAprobar,
  onRechazar,
  onCopiarZoom,
  disabled = false,
}) => {
  if (!item) return null;
  const estado = String(item.estado || "").toLowerCase();
  const options = [];

  if (estado === "solicitado") {
    options.push(
      { label: "Aprobar", icon: "/icons/check.png", onClick: () => onAprobar?.(item), disabled },
      { label: "Rechazar", icon: "/icons/close.png", danger: true, onClick: () => onRechazar?.(item), disabled },
      { divider: true }
    );
  }

  options.push(
    { label: "Editar", icon: "/icons/edit.png", onClick: () => onEditar?.(item), disabled },
    { label: "Eliminar", icon: "/icons/trash.png", danger: true, onClick: () => onEliminar?.(item), disabled },
    { divider: true },
    { label: "Copiar enlace", icon: "/icons/copy.png", onClick: () => onCopiarZoom?.(item), disabled },
    { label: "Ver detalle", icon: "/icons/eye.png", onClick: () => onVer?.(item), disabled },
  );

  return <DropdownActions options={options} />;
};
