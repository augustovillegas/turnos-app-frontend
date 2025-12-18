// === normalizeAssignment ===
// Normaliza la forma de una asignación para consumo consistente en la UI.
export const normalizeAssignment = (raw = {}) => {
  if (!raw || typeof raw !== "object") return raw;
  const resolvedId = raw.id ?? raw._id ?? raw.$id ?? null;
  const temporalId = resolvedId ?? `temp-${crypto?.randomUUID?.() || Date.now()}`;

  return {
    id: temporalId,
    title: raw.title ?? raw.titulo ?? "",
    description: raw.description ?? raw.descripcion ?? "",
    dueDate: raw.dueDate ?? raw.fecha ?? null,
    modulo: raw.modulo ?? null,
    cohorte:
      raw.cohorte != null && Number.isFinite(Number(raw.cohorte))
        ? Number(raw.cohorte)
        : null,
    createdBy: raw.createdBy ?? raw.profesorId ?? null,
  };
};

export const normalizeAssignmentsCollection = (arr) =>
  Array.isArray(arr) ? arr.map((a) => normalizeAssignment(a)) : [];
