import { DropdownActions } from "../ui/DropdownActions";

export const ProfesorActions = ({
  item,
  onAprobar,
  onRechazar,
  onVer,
  onVerDetalle,
  onCopiarZoom,
  onEditar,      
  onEliminar,    
  disabled = false,
}) => {
  if (!item) return null;

  const estado = String(item.estado || "").toLowerCase();
  const options = [];

  // 1) Gestión de solicitudes (solo si el turno está solicitado)
  if (estado === "solicitado") {
    options.push(
      { label: "Aprobar",  icon: "/icons/check.png", onClick: () => onAprobar?.(item),  disabled },
      { label: "Rechazar", icon: "/icons/close.png", danger: true, onClick: () => onRechazar?.(item), disabled },
      { divider: true }
    );
  }

  // 2) Edición / Eliminación (nuevo en Profesor)
  options.push(
    { label: "Editar turno",   icon: "/icons/edit.png",  onClick: () => onEditar?.(item),   disabled },
    { label: "Eliminar turno", icon: "/icons/trash.png", danger: true, onClick: () => onEliminar?.(item), disabled },
  );

  // 3) Utilidades
  options.push(
    { divider: true },
    { label: "Copiar enlace", icon: "/icons/copy.png", onClick: () => onCopiarZoom?.(item), disabled },
    { label: "Ver detalle",   icon: "/icons/eye.png",  onClick: () => onVer?.(item),       disabled },
  );

  return <DropdownActions options={options} />;
};
