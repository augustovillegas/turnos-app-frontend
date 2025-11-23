// === normalizeEntrega ===
// Normaliza la forma de una entrega para consumo consistente en la UI.
export const normalizeEntrega = (raw = {}) => {
  if (!raw || typeof raw !== "object") return raw;
  // Estados canónicos en backend para submissions: "A revisar", "Aprobado", "Desaprobado".
  const estadoDerivado = raw.estado ?? raw.reviewStatus ?? raw.status ?? "A revisar";
  const resolvedId = raw.id ?? raw._id ?? raw.$id ?? null;
  const temporalId = !resolvedId ? `temp-${crypto?.randomUUID?.() || Date.now()}` : resolvedId;

  return {
    ...raw,
    id: temporalId,
    alumno: raw.alumno ?? raw.student ?? raw.alumnoNombre ?? null,
    alumnoId: raw.alumnoId ?? raw.studentId ?? null,
    alumnoEmail: raw.alumnoEmail ?? raw.studentEmail ?? raw.email ?? null,
    modulo: raw.modulo ?? raw.module ?? null,
    sprint: raw.sprint ?? null,
    githubLink: raw.githubLink ?? raw.link ?? "",
    renderLink: raw.renderLink ?? "",
    reviewLink: raw.reviewLink ?? raw.deployLink ?? raw.previewLink ?? raw.renderLink ?? "",
    comentarios: raw.comentarios ?? raw.comment ?? "",
    estado: estadoDerivado,
    status: estadoDerivado,
    fechaEntrega: raw.fechaEntrega ?? raw.date ?? null,
  };
};

export const normalizeEntregasCollection = (arr) =>
  Array.isArray(arr) ? arr.map((e) => normalizeEntrega(e)) : [];
