// === normalizeUsuario ===
// Normaliza la forma de un usuario para su consumo consistente en la UI.
// Deriva campos faltantes de variantes usadas en distintas respuestas (name vs nombre, role vs rol, etc.)
// Garantiza estado textual a partir de status/estado.
export const normalizeUsuario = (raw = {}) => {
  if (!raw || typeof raw !== "object") return raw;
  const estadoDerivado =
    raw?.estado ??
    raw?.status ??
      "Pendiente";

  // Determinar id: no usar email como id persistente, si falta _id/id marcar como temporal
  const resolvedId = raw.id ?? raw._id ?? raw.$id ?? null;
  const temporalId = !resolvedId ? `temp-${crypto?.randomUUID?.() || Date.now()}` : resolvedId;

  return {
    ...raw,
    id: temporalId,
    nombre: raw.nombre ?? raw.name ?? raw.email ?? "",
    rol: raw.rol ?? raw.role ?? "alumno",
    estado: estadoDerivado,
    status: estadoDerivado,
    cohort:
      raw.cohort ??
      raw.cohorte ??
      raw.cohortId ??
      raw.datos?.cohort ??
      raw.datos?.cohorte ??
      null,
    cohorte:
      raw.cohorte ??
      raw.cohort ??
      raw.cohortId ??
      raw.datos?.cohorte ??
      raw.datos?.cohort ??
      null,
    modulo:
      raw.modulo ??
      raw.module ??
      raw.moduleLabel ??
      raw.moduloSlug ??
      raw.moduleCode ??
      raw.moduleNumber ??
      raw.datos?.modulo ??
      raw.datos?.module ??
      null,
  };
};

export const normalizeUsuariosCollection = (arr) =>
  Array.isArray(arr) ? arr.map((u) => normalizeUsuario(u)) : [];
