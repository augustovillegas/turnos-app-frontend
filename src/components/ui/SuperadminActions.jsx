import { DropdownActions } from "../ui/DropdownActions";

export const SuperadminActions = ({
  item,
  // acciones comunes
  onVer,
  onEditar,
  onEliminar,
  // aprobar / rechazar (turnos o usuarios)
  onAprobar,
  onRechazar,
  // turnos: copiar enlace zoom
  onCopiarZoom,
  disabled = false,
}) => {
  if (!item) return null;

  // Detectar tipo de recurso (turno vs usuario)
  const isTurno = Boolean(item.horario || item.zoomLink || item.start);
  const isUsuario = !isTurno && Boolean(item.rol || item.role || item.tipo);
  const estado = String(item.estado || item.status || "").toLowerCase();

  const options = [];

  // === TURNOS ===
  if (isTurno) {
    if (estado === "solicitado") {
      options.push(
        { label: "Aprobar turno", icon: "/icons/check.png", onClick: () => onAprobar?.(item), disabled },
        { label: "Rechazar turno", icon: "/icons/close.png", danger: true, onClick: () => onRechazar?.(item), disabled },
        { divider: true }
      );
    }
    options.push(
      { label: "Editar turno", icon: "/icons/edit.png", onClick: () => onEditar?.(item), disabled },
      { label: "Eliminar turno", icon: "/icons/trash.png", danger: true, onClick: () => onEliminar?.(item), disabled }
    );
    options.push(
      { divider: true },
      { label: "Copiar enlace", icon: "/icons/copy.png", onClick: () => onCopiarZoom?.(item), disabled },
      { label: "Ver detalle", icon: "/icons/eye.png", onClick: () => onVer?.(item), disabled }
    );
  }

  // === USUARIOS ===
  if (isUsuario) {
    if (estado === "pendiente") {
      options.push(
        { label: "Aprobar usuario", icon: "/icons/check.png", onClick: () => onAprobar?.(item), disabled },
        { label: "Rechazar usuario", icon: "/icons/close.png", danger: true, onClick: () => onRechazar?.(item), disabled },
        { divider: true }
      );
    }
    if (onEditar) {
      options.push({ label: "Editar usuario", icon: "/icons/edit.png", onClick: () => onEditar?.(item), disabled });
    }
    if (onEliminar) {
      options.push({ label: "Eliminar usuario", icon: "/icons/trash.png", danger: true, onClick: () => onEliminar?.(item), disabled });
    }
    options.push(
      { divider: true },
      { label: "Ver detalle", icon: "/icons/eye.png", onClick: () => onVer?.(item), disabled }
    );
  }

  if (!options.length) return null; // nada que mostrar
  return <DropdownActions options={options} />;
};
