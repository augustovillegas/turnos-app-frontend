import { ensureModuleLabel } from "../moduleMap";

const toNumber = (value) => {
  if (value == null) return null;
  const parsed = Number(String(value).trim());
  return Number.isFinite(parsed) ? Math.trunc(parsed) : null;
};

// Normaliza la forma de una entrega para consumo consistente en la UI.
// DTO actualizado: {id, sprint, githubLink, renderLink, comentarios, reviewStatus, estado, alumno, alumnoId, student, modulo, cohorte, fechaEntrega}
export const normalizeEntrega = (raw = {}) => {
  if (!raw || typeof raw !== "object") return raw;

  const modulo =
    ensureModuleLabel(raw.modulo) ??
    ensureModuleLabel(raw.assignment?.modulo) ??
    null;

  const cohorte =
    toNumber(raw.cohorte) ??
    toNumber(raw.assignment?.cohorte) ??
    null;

  const resolvedId = raw.id ?? raw._id ?? null;
  const temporalId = resolvedId ?? `temp-${crypto?.randomUUID?.() || Date.now()}`;
  const reviewStatus = raw.reviewStatus ?? raw.estado ?? "A revisar";
  const alumnoNombre = raw.alumno ?? raw.alumnoNombre ?? raw.studentName ?? "-";
  const alumnoId =
    raw.alumnoId ??
    (typeof raw.student === "object" ? raw.student?._id ?? raw.student?.id : raw.student) ??
    raw.studentId ??
    null;

  const sprintVal = toNumber(raw.sprint);

  return {
    id: temporalId,
    alumno: alumnoNombre,
    alumnoNombre,
    alumnoId,
    student: alumnoId,
    sprint: sprintVal ?? raw.sprint ?? null,
    githubLink: raw.githubLink ?? "",
    renderLink: raw.renderLink ?? "",
    comentarios: raw.comentarios ?? "",
    reviewStatus,
    estado: raw.estado ?? reviewStatus,
    fechaEntrega: raw.fechaEntrega ?? raw.createdAt ?? null,
    createdAt: raw.createdAt ?? null,
    updatedAt: raw.updatedAt ?? null,
    modulo,
    cohorte,
  };
};

export const normalizeEntregasCollection = (arr) =>
  Array.isArray(arr) ? arr.map((e) => normalizeEntrega(e)) : [];
