// Core helpers to build, validate y mapear datos de turnos desde formularios.

const ensureTwoDigits = (value) => value.toString().padStart(2, "0");

const buildIsoDate = (date, time) => {
  const [hours, minutes] = time.split(":").map(Number);
  const target = new Date(date);
  target.setHours(hours, minutes, 0, 0);
  return target.toISOString();
};

const formatHorario = (startIso, endIso) => {
  const options = { hour: "2-digit", minute: "2-digit", hour12: false };
  const start = new Date(startIso).toLocaleTimeString([], options);
  const end = new Date(endIso).toLocaleTimeString([], options);
  return `${start} - ${end}`;
};

const normalizeFecha = (value) => {
  if (!value) return "";
  if (value.includes("/")) {
    const [day, month, year] = value.split("/");
    if (day && month && year) {
      return `${year}-${ensureTwoDigits(month)}-${ensureTwoDigits(day)}`;
    }
  }
  return value;
};

export const buildTurnoPayloadFromForm = (values) => {
  // Construye el payload listo para enviar al backend a partir del formulario.
  const start = buildIsoDate(values.fecha, values.horaInicio);
  const end = buildIsoDate(values.fecha, values.horaFin);

  const fecha = normalizeFecha(values.fecha);

  return {
    review: Number(values.review),
    fecha,
    horario: formatHorario(start, end),
    sala: values.sala.trim(),
    zoomLink: values.zoomLink.trim(),
    estado: values.estado || "Disponible",
    start,
    end,
    comentarios: values.comentarios?.trim() || "",
  };
};

export const formValuesFromTurno = (turno) => {
  // Convierte un turno existente en valores compatibles con el formulario edit/create.
  const today = new Date();
  const todayString = `${today.getFullYear()}-${ensureTwoDigits(
    today.getMonth() + 1
  )}-${ensureTwoDigits(today.getDate())}`;

  if (!turno) {
    return {
      review: "1",
      fecha: todayString,
      horaInicio: "",
      horaFin: "",
      sala: "",
      zoomLink: "",
      comentarios: "",
    };
  }

  const baseDate = turno.start
    ? new Date(turno.start)
    : turno.fecha
    ? new Date(turno.fecha.split("/").reverse().join("-"))
    : new Date();

  const dateString = `${baseDate.getFullYear()}-${ensureTwoDigits(
    baseDate.getMonth() + 1
  )}-${ensureTwoDigits(baseDate.getDate())}`;

  const [horaInicio = "", horaFin = ""] = (turno.horario || "").split(" - ");

  const mappedDate =
    turno.start || turno.fecha ? dateString : todayString;

  return {
    review: String(turno.review ?? 1),
    fecha: mappedDate,
    horaInicio,
    horaFin,
    sala: turno.sala ?? "",
    zoomLink: turno.zoomLink ?? "",
    comentarios: turno.comentarios ?? "",
  };
};

export const validateTurnoForm = (values) => {
  // Valida campos clave del formulario y devuelve un mapa de errores.
  const errors = {};
  if (!values.fecha) errors.fecha = "La fecha es obligatoria.";
  if (!values.horaInicio) errors.horaInicio = "Ingresá una hora de inicio.";
  if (!values.horaFin) errors.horaFin = "Ingresá una hora de fin.";
  if (!values.sala.trim()) errors.sala = "La sala es obligatoria.";
  if (!values.review || Number(values.review) <= 0) {
    errors.review = "Seleccioná un review válido.";
  }
  if (!values.zoomLink.trim()) {
    errors.zoomLink = "Proporcioná un enlace de Zoom.";
  }

  if (values.fecha && values.horaInicio && values.horaFin) {
    const start = buildIsoDate(values.fecha, values.horaInicio);
    const end = buildIsoDate(values.fecha, values.horaFin);
    if (new Date(end) <= new Date(start)) {
      errors.horaFin = "La hora de fin debe ser posterior al inicio.";
    }
  }

  return errors;
};
