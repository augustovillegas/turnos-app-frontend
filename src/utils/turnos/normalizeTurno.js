// === normalizeTurno ===
// Normaliza la forma de un turno (slot) según el DTO del backend.

const deriveFechaIso = (value) => {
  if (!value) return null;
  try {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) {
      return d.toISOString().slice(0, 10);
    }
    if (typeof value === "string" && value.includes("/")) {
      const [dd, mm, yyyy] = value.split("/").map(Number);
      if (dd && mm && yyyy) {
        return new Date(yyyy, mm - 1, dd).toISOString().slice(0, 10);
      }
    }
  } catch {
    return null;
  }
  return null;
};

const normalizeReviewStatus = (value) => {
  const lowered = typeof value === "string" ? value.trim().toLowerCase() : null;
  switch (lowered) {
    case "a revisar":
    case "por revisar":
    case "pendiente":
    case "pending":
    case "to review":
      return "A revisar";
    case "aprobado":
    case "approved":
    case "ok":
      return "Aprobado";
    case "desaprobado":
    case "rechazado":
    case "failed":
    case "rejected":
      return "Desaprobado";
    default:
      return value ?? null;
  }
};

export const normalizeTurno = (raw = {}) => {
  if (!raw || typeof raw !== "object") return raw;

  const estadoDerivado = raw.estado ?? raw.status ?? "Disponible";
  const resolvedId = raw.id ?? raw._id ?? raw.$id ?? null;
  const temporalId = resolvedId ?? `temp-${crypto?.randomUUID?.() || Date.now()}`;
  const salaValue = raw.sala ?? "";
  const salaNumber = Number(salaValue);
  const fechaIso = deriveFechaIso(raw.fecha ?? raw.fechaISO ?? raw.start ?? null);
  const horario =
    raw.horario ??
    (raw.startTime && raw.endTime ? `${raw.startTime} - ${raw.endTime}` : raw.startTime ?? null);
  const reviewValue = raw.reviewNumber ?? raw.review ?? 1;

  return {
    id: temporalId,
    creador: raw.creador ?? raw.createdByName ?? raw.creadorNombre ?? null,
    creadorId: raw.creadorId ?? raw.createdBy ?? null,
    modulo: raw.modulo ?? null,
    titulo: raw.titulo ?? raw.title ?? null,
    descripcion: raw.descripcion ?? raw.description ?? "",
    duracion: raw.duracion ?? null,
    profesorId: raw.profesorId ?? raw.profesor ?? raw.createdBy ?? null,
    solicitanteId: raw.solicitanteId ?? raw.student ?? raw.alumnoId ?? null,
    solicitanteNombre: raw.solicitanteNombre ?? raw.alumno ?? raw.alumnoNombre ?? null,
    estado: estadoDerivado,
    reviewStatus: normalizeReviewStatus(raw.reviewStatus),
    fecha: raw.fecha ?? raw.start ?? null,
    fechaISO: fechaIso,
    sala: Number.isFinite(salaNumber) ? salaNumber : salaValue,
    horario,
    duracion: raw.duracion ?? null,
    comentarios: raw.comentarios ?? raw.comment ?? "",
    zoomLink: raw.zoomLink ?? "",
    review: reviewValue,
    reviewNumber: reviewValue,
    cohorte: raw.cohorte ?? null,
  };
};

export const normalizeTurnosCollection = (arr) =>
  Array.isArray(arr) ? arr.map((t) => normalizeTurno(t)) : [];
