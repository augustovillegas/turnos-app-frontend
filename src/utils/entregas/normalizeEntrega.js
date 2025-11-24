import { ensureModuleLabel, labelToModule } from "../moduleMap";

const toNumber = (value) => {
  if (value == null) return null;
  const parsed = Number(String(value).trim());
  return Number.isFinite(parsed) ? Math.trunc(parsed) : null;
};

// Normaliza la forma de una entrega para consumo consistente en la UI.
// Segun CONFIGURACION_FRONTEND.md: Submission DTO no tiene "estado", solo "reviewStatus".
export const normalizeEntrega = (raw = {}) => {
  if (!raw || typeof raw !== "object") return raw;

  const assignmentData =
    raw.assignment && typeof raw.assignment === "object" ? raw.assignment : null;

  // Deriva modulo y cohorte desde assignment cuando no vienen en el root
  const resolvedModuleLabel =
    [
      raw.modulo,
      raw.module,
      raw.moduleLabel,
      raw.moduleCode,
      raw.moduleNumber,
      assignmentData?.modulo,
      assignmentData?.module,
      assignmentData?.moduleLabel,
      assignmentData?.moduleCode,
      assignmentData?.moduleNumber,
      assignmentData?.cohorte,
      assignmentData?.cohort,
      assignmentData?.cohortId,
    ]
      .map((value) => ensureModuleLabel(value))
      .find(Boolean) || null;

  const resolvedModuleNumber =
    labelToModule(resolvedModuleLabel) ??
    labelToModule(
      assignmentData?.moduleCode ??
        assignmentData?.moduleNumber ??
        raw.moduleCode ??
        raw.moduleNumber
    );

  const resolvedCohort =
    [
      raw.cohorte,
      raw.cohort,
      raw.cohortId,
      assignmentData?.cohorte,
      assignmentData?.cohort,
      assignmentData?.cohortId,
    ]
      .map((value) => toNumber(value))
      .find((value) => value != null) ?? null;

  const reviewStatus = raw.reviewStatus ?? "A revisar";
  const resolvedId = raw.id ?? raw._id ?? null;
  const temporalId = !resolvedId ? `temp-${crypto?.randomUUID?.() || Date.now()}` : resolvedId;

  const alumnoNombre = raw.alumnoNombre ?? "-";

  const modulo = resolvedModuleLabel ?? raw.modulo ?? assignmentData?.modulo ?? null;

  return {
    ...raw,
    id: temporalId,
    alumno: alumnoNombre,
    alumnoId: raw.student ?? null, // Backend envia ObjectId del alumno como "student"
    sprint: raw.sprint ?? null,
    githubLink: raw.githubLink ?? "",
    renderLink: raw.renderLink ?? "-", // Backend default: "-"
    comentarios: raw.comentarios ?? "-", // Backend default: "-"
    reviewStatus, // Estados: "Pendiente" | "A revisar" | "Aprobado" | "Desaprobado" | "Rechazado"
    fechaEntrega: raw.createdAt ?? null, // Backend usa createdAt como fecha de entrega
    createdAt: raw.createdAt ?? null,
    updatedAt: raw.updatedAt ?? null,
    assignment: raw.assignment ?? null, // ObjectId o objeto de la asignacion (opcional)
    modulo,
    module: modulo,
    moduleLabel: modulo,
    moduleCode: resolvedModuleNumber ?? raw.moduleCode ?? null,
    moduleNumber: resolvedModuleNumber ?? raw.moduleNumber ?? null,
    cohorte: resolvedCohort ?? raw.cohorte ?? null,
    cohort: resolvedCohort ?? raw.cohort ?? null,
    cohortId: resolvedCohort ?? raw.cohortId ?? null,
  };
};

export const normalizeEntregasCollection = (arr) =>
  Array.isArray(arr) ? arr.map((e) => normalizeEntrega(e)) : [];
