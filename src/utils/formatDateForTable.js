// === formatDateForTable ===
// Centraliza el formato de fecha para tablas evitando cambios de estilo.
// Recibe string/Date y retorna "DD/MM/YYYY HH:mm" (24h) o "-" si inválido.
export const formatDateForTable = (input) => {
  if (!input) return "-";

  // Caso 1: formato DD/MM/YYYY sin hora (lo mostramos tal cual)
  if (typeof input === "string") {
    const pureDateMatch = input.match(/^([0-9]{2})\/([0-9]{2})\/([0-9]{4})$/);
    if (pureDateMatch) {
      return input; // la tabla ya muestra horario separado
    }
  }

  // Caso 2: formato YYYY-MM-DD (sin hora) -> convertir a DD/MM/YYYY
  if (typeof input === "string") {
    const isoDateOnly = input.match(/^([0-9]{4})-([0-9]{2})-([0-9]{2})$/);
    if (isoDateOnly) {
      const [, y, m, d] = isoDateOnly;
      return `${d}/${m}/${y}`;
    }
  }

  // Intentar parsear como Date estándar / ISO
  const dateObj = input instanceof Date ? input : new Date(input);
  if (isNaN(dateObj.getTime())) return "-";
  const pad = (n) => String(n).padStart(2, "0");
  const d = pad(dateObj.getDate());
  const m = pad(dateObj.getMonth() + 1);
  const y = dateObj.getFullYear();
  const hh = pad(dateObj.getHours());
  const mm = pad(dateObj.getMinutes());

  // Si hora es 00:00 y el input original no traía hora explícita, mostrar solo fecha
  if (typeof input === "string" && /T/.test(input) === false && hh === "00" && mm === "00") {
    return `${d}/${m}/${y}`;
  }

  return `${d}/${m}/${y} ${hh}:${mm}`;
};
