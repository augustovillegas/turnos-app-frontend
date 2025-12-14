// === normalizeTurno ===
// Normaliza la forma de un turno para consumo consistente en la UI.
export const normalizeTurno = (raw = {}) => {
  if (!raw || typeof raw !== "object") return raw;
  const estadoDerivado = raw.estado ?? raw.status ?? "Disponible";
  const resolvedId = raw.id ?? raw._id ?? raw.$id ?? null;
  const temporalId = !resolvedId ? `temp-${crypto?.randomUUID?.() || Date.now()}` : resolvedId;
  const rawSala = raw.sala ?? raw.room ?? "";
  const salaText = rawSala != null ? String(rawSala).trim() : "";
  const salaDisplay = salaText ? (/^sala/i.test(salaText) ? salaText : `Sala ${salaText}`) : "";
  const salaNumeric = salaText ? Number(salaText.replace(/^sala\s*/i, "")) : NaN;
  const roomValue =
    raw.room ?? (Number.isFinite(salaNumeric) ? salaNumeric : raw.sala ?? salaText ?? "");
  const salaResolvedBase = salaDisplay || salaText || (resolvedId ? `Sala ${resolvedId}` : "");
  const salaResolved = salaResolvedBase;

    // Canonicalización de reviewStatus
    const rawReviewStatus = raw.reviewStatus ?? raw.review_state ?? raw.reviewStatusTexto ?? raw.reviewEstado ?? raw.reviewState ?? null;
    const lowered = typeof rawReviewStatus === "string" ? rawReviewStatus.trim().toLowerCase() : null;
    let reviewStatusCanon = null;
    switch (lowered) {
      case "a revisar":
      case "por revisar":
      case "pendiente":
      case "pending":
      case "to review":
        reviewStatusCanon = "A revisar";
        break;
      case "aprobado":
      case "approved":
      case "ok":
        reviewStatusCanon = "Aprobado";
        break;
      case "desaprobado":
      case "rechazado":
      case "failed":
      case "rejected":
        reviewStatusCanon = "Desaprobado";
        break;
      default:
        reviewStatusCanon = rawReviewStatus ?? null;
    }
  return {
    ...raw,
    id: temporalId,
    modulo: raw.modulo ?? raw.module ?? null,
    profesorId: raw.profesorId ?? raw.profesor ?? raw.createdBy ?? null,
    solicitanteId: raw.solicitanteId ?? raw.student ?? raw.alumnoId ?? null,
    solicitanteNombre: raw.solicitanteNombre ?? raw.studentNombre ?? raw.studentName ?? raw.alumno ?? raw.alumnoNombre ?? null,
    estado: estadoDerivado,
    status: estadoDerivado,
    fecha: raw.fecha ?? raw.date ?? raw.start ?? null,
    sala: salaResolved,
    reviewStatus: reviewStatusCanon,
    horario: raw.horario ?? raw.startTime ?? null,
    duracion: raw.duracion ?? raw.duration ?? null,
    comentarios: raw.comentarios ?? raw.comment ?? "",
    // Campos opcionales inicializados para evitar renders tardíos o formato inconsistente
    zoomLink: raw.zoomLink ?? "",
    room: roomValue ?? "", // soporte alias posible
    reviewNumber: raw.reviewNumber ?? raw.review ?? null,
  };
};

export const normalizeTurnosCollection = (arr) =>
  Array.isArray(arr) ? arr.map((t) => normalizeTurno(t)) : [];
