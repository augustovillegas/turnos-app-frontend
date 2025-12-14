import { DropdownActions } from "../ui/DropdownActions";
import { isEstado, anyEstado } from "../../utils/turnos/normalizeEstado";

export const AlumnoActions = ({
  item,
  tipo = "turno",
  onSolicitar,
  onCancelarTurno,
  onCancelarEntrega,  
  onEditarEntrega,
  onVerDetalle,
  disabled = false,
}) => {
  if (!item) return null;

  const options = [];

  // === ACCIONES PARA TURNOS ===
  if (tipo === "turno") {
    if (isEstado(item.estado, "Disponible")) {
      options.push({
        label: "Solicitar turno",
        icon: "/icons/check.png",
        onClick: () => onSolicitar?.(item),
        disabled,
      });
    } else if (isEstado(item.estado, "Solicitado")) {
      options.push({
        label: "Cancelar turno",
        icon: "/icons/close.png",
        danger: true,
        onClick: () => onCancelarTurno?.(item),
        disabled,
      });
    }
    // Siempre permitir "Ver detalle" si hay handler, sin duplicar
    if (onVerDetalle && !options.some((o) => o.label === "Ver detalle")) {
      options.push({
        label: "Ver detalle",
        icon: "/icons/eye.png",
        onClick: () => onVerDetalle?.(item),
      });
    }
  }

  // === ACCIONES PARA ENTREGAS ===
  if (tipo === "entrega") {
    if (isEstado(item.reviewStatus || item.estado, "A revisar")) {
      options.push({
        label: "Editar entrega",
        icon: "/icons/edit.png",
        onClick: () => onEditarEntrega?.(item),
        disabled,
      });

      options.push({
        label: "Eliminar entrega",
        icon: "/icons/trash.png",
        danger: true,
        onClick: () => onCancelarEntrega?.(item),
        disabled,
      });
    }
    // Siempre permitir "Ver detalle" si hay handler, sin duplicar
    if (onVerDetalle && !options.some((o) => o.label === "Ver detalle")) {
      options.push({
        label: "Ver detalle",
        icon: "/icons/eye.png",
        onClick: () => onVerDetalle?.(item),
      });
    }
  }

  if (options.length === 0) return null;

  return <DropdownActions options={options} />;
};
