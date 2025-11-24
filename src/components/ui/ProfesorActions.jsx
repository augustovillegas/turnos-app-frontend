import { DropdownActions } from "../ui/DropdownActions";
import { isEstado } from "../../utils/turnos/normalizeEstado";

export const ProfesorActions = ({
  item,
  disabled = false,
  // Turnos callbacks
  onAprobar,
  onRechazar,
  onVer,
  onCopiarZoom,
  onEditar,
  onEliminar,
  // Usuarios callbacks
  onAprobarUsuario,
  onRechazarUsuario,
  onEditarUsuario,
  onEliminarUsuario,
}) => {
  if (!item) return null;
  const estado = String(item.estado || item.status || '').toLowerCase();

  const isTurno = Boolean(item.horario || item.zoomLink || item.start);
  const isUsuario = !isTurno && (item.rol || item.role || item.tipo);

  const options = [];

  if (isTurno) {
    if (isEstado(item.estado || item.status, "Solicitado")) {
      options.push(
        { label: "Aprobar", icon: "/icons/check.png", onClick: () => onAprobar?.(item), disabled },
        { label: "Rechazar", icon: "/icons/close.png", danger: true, onClick: () => onRechazar?.(item), disabled },
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
  } else if (isUsuario) {
    if (estado === "pendiente") {
      options.push(
        { label: "Aprobar usuario", icon: "/icons/check.png", onClick: () => onAprobarUsuario?.(item), disabled },
        { label: "Rechazar usuario", icon: "/icons/close.png", danger: true, onClick: () => onRechazarUsuario?.(item), disabled },
        { divider: true }
      );
    }
    options.push(
      { label: "Editar usuario", icon: "/icons/edit.png", onClick: () => onEditarUsuario?.(item), disabled },
      { label: "Eliminar usuario", icon: "/icons/trash.png", danger: true, onClick: () => onEliminarUsuario?.(item), disabled }
    );
    options.push(
      { divider: true },
      { label: "Ver detalle", icon: "/icons/eye.png", onClick: () => onVer?.(item), disabled }
    );
  }

  return <DropdownActions options={options} />;
};
