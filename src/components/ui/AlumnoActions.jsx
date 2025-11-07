import { DropdownActions } from "../ui/DropdownActions";

export const AlumnoActions = ({
  item,
  tipo = "turno",
  onSolicitar,
  onCancelarTurno,
  onCancelarEntrega,  
  onEditarEntrega,
  disabled = false,
}) => {
  if (!item) return null;

  const options = [];

  // === ACCIONES PARA TURNOS ===
  if (tipo === "turno") {
    const estado = String(item.estado || "").toLowerCase();

    if (estado === "disponible") {
      options.push({
        label: "Solicitar turno",
        icon: "/icons/check.png",
        onClick: () => onSolicitar?.(item),
        disabled,
      });
    } else if (estado === "solicitado") {
      options.push({
        label: "Cancelar turno",
        icon: "/icons/close.png",
        danger: true,
        onClick: () => onCancelarTurno?.(item),
        disabled,
      });
    } else if (["aprobado", "rechazado"].includes(estado)) {
      options.push({
        label: "Ver detalle",
        icon: "/icons/eye.png",
        onClick: () => console.log("Detalle del turno", item),
      });
    }
  }

  // === ACCIONES PARA ENTREGAS ===
  if (tipo === "entrega") {
    const estado = String(item.reviewStatus || "").toLowerCase();

    if (estado === "a revisar") {
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
    } else {
      options.push({
        label: "Ver detalle",
        icon: "/icons/eye.png",
        onClick: () => console.log("Detalle de entrega", item),
      });
    }
  }

  if (options.length === 0) return null;

  return <DropdownActions options={options} />;
};
