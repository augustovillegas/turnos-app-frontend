// === normalizeAssignment ===
// Normaliza la forma de una asignación para consumo consistente en la UI.
export const normalizeAssignment = (raw = {}) => {
  if (!raw || typeof raw !== "object") return raw;
  const resolvedId = raw.id ?? raw._id ?? raw.$id ?? null;
  const temporalId = !resolvedId ? `temp-${crypto?.randomUUID?.() || Date.now()}` : resolvedId;

  return {
    ...raw,
    id: temporalId,
    modulo: raw.modulo ?? raw.module ?? null,
    title: raw.title ?? raw.titulo ?? "",
    description: raw.description ?? raw.descripcion ?? "",
    dueDate: raw.dueDate ?? raw.fecha ?? null,
    createdBy: raw.createdBy ?? raw.profesorId ?? null,
    cohorte: raw.cohorte ?? raw.cohort ?? null,
  };
};

export const normalizeAssignmentsCollection = (arr) =>
  Array.isArray(arr) ? arr.map((a) => normalizeAssignment(a)) : [];
