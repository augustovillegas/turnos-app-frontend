// === formatDateForTable ===
// Centraliza el formato de fecha para tablas evitando cambios de estilo.
// Recibe string/Date y retorna "DD/MM/YYYY HH:mm" (24h) o "-" si inválido.
export const formatDateForTable = (input) => {
  if (!input) return "-";
  const date = input instanceof Date ? input : new Date(input);
  if (isNaN(date.getTime())) return "-";
  const pad = (n) => String(n).padStart(2, "0");
  const d = pad(date.getDate());
  const m = pad(date.getMonth() + 1);
  const y = date.getFullYear();
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());
  return `${d}/${m}/${y} ${hh}:${mm}`;
};
