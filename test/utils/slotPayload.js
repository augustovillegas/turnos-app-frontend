// Helpers para construir/normalizar payloads de slots según contrato vigente.

const MODULE_LABEL_FROM_NUMBER = {
  1: "HTML-CSS",
  2: "JAVASCRIPT",
  3: "BACKEND - NODE JS",
  4: "FRONTEND - REACT",
};

export const buildSlotPayload = ({
  review = 1,
  offsetDays = 7,
  modulo = "HTML-CSS",
  cohorte = 1,
  sala,
} = {}) => {
  const base = new Date(Date.now() + offsetDays * 24 * 60 * 60 * 1000);
  const start = new Date(base.setHours(10, 0, 0, 0));
  const end = new Date(base.setHours(11, 0, 0, 0));
  const toHm = (d) => d.toISOString().slice(11, 16);
  return {
    reviewNumber: review,
    fecha: start.toISOString().slice(0, 10),
    start: start.toISOString(),
    end: end.toISOString(),
    startTime: toHm(start),
    endTime: toHm(end),
    horario: `${toHm(start)} - ${toHm(end)}`,
    sala: sala ?? Math.floor(Math.random() * 500) + 1,
    zoomLink: "https://zoom.example.com/e2e",
    comentarios: "Slot generado para e2e",
    modulo,
    cohorte,
    estado: "Disponible",
  };
};

export const normalizeSlotPayload = (payload = {}) => {
  const reviewNumber = payload.reviewNumber ?? payload.review ?? 1;
  const modulo =
    payload.modulo ??
    MODULE_LABEL_FROM_NUMBER[payload.moduleNumber] ??
    "HTML-CSS";
  const sala = payload.sala ?? payload.room ?? Math.floor(Math.random() * 500) + 1;
  const fecha = payload.fecha ?? payload.date ?? new Date().toISOString().slice(0, 10);
  const startTime = payload.startTime ?? payload.start?.slice?.(11, 16) ?? null;
  const endTime = payload.endTime ?? payload.end?.slice?.(11, 16) ?? null;

  const deriveIsoFromParts = (time) => {
    if (!fecha || !time) return undefined;
    try {
      return new Date(`${fecha}T${time}`).toISOString();
    } catch {
      return undefined;
    }
  };

  const start = payload.start ?? deriveIsoFromParts(startTime);
  const end = payload.end ?? deriveIsoFromParts(endTime);
  const horario =
    payload.horario ?? (startTime && endTime ? `${startTime} - ${endTime}` : undefined);

  return {
    reviewNumber,
    fecha,
    start,
    end,
    startTime,
    endTime,
    horario,
    sala,
    zoomLink: payload.zoomLink ?? "https://zoom.example.com/e2e",
    comentarios: payload.comentarios ?? payload.comment ?? "",
    modulo,
    cohorte: payload.cohorte ?? payload.cohort ?? 1,
    estado: payload.estado ?? "Disponible",
  };
};

export const moduleLabelFromNumber = MODULE_LABEL_FROM_NUMBER;

