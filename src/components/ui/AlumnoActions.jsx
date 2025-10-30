import { DropdownActions } from "../ui/DropdownActions";

export const AlumnoActions = ({
  item,
  tipo = "turno", // "turno" | "entrega"
  onSolicitar,
  onCancelarTurno,
  onCancelarEntrega,
  disabled = false,
}) => {
  if (!item) return null;

  const options = [];

  if (tipo === "turno") {
    const estado = String(item.estado || "").toLowerCase();

    if (estado === "disponible") {
      options.push({
        label: "Solicitar turno",
        icon: "/icons/check.png", // ✅ icono verde de confirmar
        onClick: () => onSolicitar?.(item),
        disabled,
      });
    } else if (estado === "solicitado") {
      options.push({
        label: "Cancelar turno",
        icon: "/icons/close.png", // ✅ icono rojo de cancelar
        danger: true,
        onClick: () => onCancelarTurno?.(item),
        disabled,
      });
    } else if (["aprobado", "rechazado"].includes(estado)) {
      options.push({
        label: "Ver detalle",
        icon: "/icons/eye.png", // ✅ icono azul de “ver”
        onClick: () => console.log("Detalle del turno", item),
      });
    }
  }

  if (tipo === "entrega") {
    const estado = String(item.reviewStatus || "").toLowerCase();

    if (estado === "a revisar") {
      options.push({
        label: "Elminar entrega",
        icon: "/icons/trash.png", // ✅ icono papelera
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
