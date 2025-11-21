// === normalizeTurno ===
// Normaliza la forma de un turno para consumo consistente en la UI.
export const normalizeTurno = (raw = {}) => {
  if (!raw || typeof raw !== "object") return raw;
  const estadoDerivado = raw.estado ?? raw.status ?? "Disponible";
  const resolvedId = raw.id ?? raw._id ?? raw.$id ?? null;
  const temporalId = !resolvedId ? `temp-${crypto?.randomUUID?.() || Date.now()}` : resolvedId;

  return {
    ...raw,
    id: temporalId,
    modulo: raw.modulo ?? raw.module ?? null,
    profesorId: raw.profesorId ?? raw.profesor ?? raw.createdBy ?? null,
    solicitanteId: raw.solicitanteId ?? raw.student ?? null,
    estado: estadoDerivado,
    status: estadoDerivado,
    fecha: raw.fecha ?? raw.date ?? raw.start ?? null,
    horario: raw.horario ?? raw.startTime ?? null,
    duracion: raw.duracion ?? raw.duration ?? null,
    comentarios: raw.comentarios ?? raw.comment ?? "",
    zoomLink: raw.zoomLink ?? "",
  };
};

export const normalizeTurnosCollection = (arr) =>
  Array.isArray(arr) ? arr.map((t) => normalizeTurno(t)) : [];
