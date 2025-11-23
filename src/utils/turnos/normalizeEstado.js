// Normalización centralizada de estados de turnos/entregas
// Uso: normalizeEstado(valor) => "disponible" | "solicitado" | etc (lowercase)
// Evita repetición de String(x).toLowerCase() y tolera null/undefined

export const normalizeEstado = (value) => {
  if (value == null) return "";
  return String(value).trim().toLowerCase();
};

export const isEstado = (value, target) => {
  return normalizeEstado(value) === normalizeEstado(target);
};

export const anyEstado = (value, targets = []) => {
  const norm = normalizeEstado(value);
  return targets.some((t) => normalizeEstado(t) === norm);
};
