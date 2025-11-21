// Helpers centrales para construir, validar y mapear datos de turnos.

const asegurarDosDigitos = (valor) => valor.toString().padStart(2, "0");

const construirFechaIso = (fecha, hora) => {
  const [horas, minutos] = hora.split(":").map(Number);
  const objetivo = new Date(fecha);
  objetivo.setHours(horas, minutos, 0, 0);
  return objetivo.toISOString();
};

const formatearHorario = (inicioIso, finIso) => {
  const opciones = { hour: "2-digit", minute: "2-digit", hour12: false };
  const inicio = new Date(inicioIso).toLocaleTimeString([], opciones);
  const fin = new Date(finIso).toLocaleTimeString([], opciones);
  return `${inicio} - ${fin}`;
};

const normalizarFecha = (valor) => {
  if (!valor) return "";
  if (valor.includes("/")) {
    const [dia, mes, anio] = valor.split("/");
    if (dia && mes && anio) {
      return `${anio}-${asegurarDosDigitos(mes)}-${asegurarDosDigitos(dia)}`;
    }
  }
  return valor;
};

export const construirPayloadTurnoDesdeFormulario = (valores) => {
  const inicio = construirFechaIso(valores.fecha, valores.horaInicio);
  const fin = construirFechaIso(valores.fecha, valores.horaFin);
  const fechaNormalizada = normalizarFecha(valores.fecha);
  const [yyyy, mm, dd] = fechaNormalizada.split('-');
  const fechaDDMMYYYY = yyyy && mm && dd ? `${dd}/${mm}/${yyyy}` : fechaNormalizada;
  const toHM = (iso) => new Date(iso).toISOString().slice(11, 16);
  const duracion = Math.max(0, Math.round((new Date(fin) - new Date(inicio)) / 60000));

  const numericSala = (() => {
    const raw = valores.sala.trim();
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : Math.floor(Date.now() / 60000);
  })();

  return {
    review: Number(valores.review),
    reviewNumber: Number(valores.review),
    fecha: fechaDDMMYYYY,
    date: fechaNormalizada,
    horario: formatearHorario(inicio, fin),
    sala: numericSala,
    room: numericSala,
    zoomLink: valores.zoomLink.trim(),
    estado: valores.estado || "Disponible",
    start: inicio,
    end: fin,
    dateISO: inicio.slice(0, 10),
    startTime: toHM(inicio),
    endTime: toHM(fin),
    duracion,
    titulo: valores.titulo?.trim?.() || "Turno Test",
    descripcion: valores.descripcion?.trim?.() || "Generado por pruebas",
    modulo: valores.modulo?.trim?.() || "HTML-CSS",
    comentarios: valores.comentarios?.trim() || "",
  };
};

export const obtenerValoresFormularioDesdeTurno = (turno) => {
  const hoy = new Date();
  const fechaHoy = `${hoy.getFullYear()}-${asegurarDosDigitos(
    hoy.getMonth() + 1
  )}-${asegurarDosDigitos(hoy.getDate())}`;

  if (!turno) {
    return {
      review: "1",
      fecha: fechaHoy,
      horaInicio: "",
      horaFin: "",
      sala: "",
      zoomLink: "",
      comentarios: "",
    };
  }

  const fechaBase = turno.start
    ? new Date(turno.start)
    : turno.fecha
    ? new Date(turno.fecha.split("/").reverse().join("-"))
    : new Date();

  const fechaFormateada = `${fechaBase.getFullYear()}-${asegurarDosDigitos(
    fechaBase.getMonth() + 1
  )}-${asegurarDosDigitos(fechaBase.getDate())}`;

  const [horaInicio = "", horaFin = ""] = (turno.horario || "").split(" - ");
  const fechaResultante =
    turno.start || turno.fecha ? fechaFormateada : fechaHoy;

  return {
    review: String(turno.review ?? 1),
    fecha: fechaResultante,
    horaInicio,
    horaFin,
    sala: String(turno.sala ?? turno.room ?? ""),
    zoomLink: turno.zoomLink ?? "",
    comentarios: turno.comentarios ?? "",
  };
};

export const validarFormularioTurno = (valores) => {
  const errores = {};
  if (!valores.fecha) errores.fecha = "La fecha es obligatoria.";
  if (!valores.horaInicio) errores.horaInicio = "Ingresa una hora de inicio.";
  if (!valores.horaFin) errores.horaFin = "Ingresa una hora de fin.";
  if (!valores.sala.trim()) errores.sala = "La sala es obligatoria.";
  else if (Number.isNaN(Number(valores.sala))) {
    errores.sala = "Debe ser un número válido.";
  } else if (Number(valores.sala) <= 0) {
    errores.sala = "Debe ser mayor a 0.";
  }
  if (!valores.review || Number(valores.review) <= 0) {
    errores.review = "Selecciona un review valido.";
  }
  if (!valores.zoomLink.trim()) {
    errores.zoomLink = "Proporciona un enlace de Zoom.";
  }

  if (valores.fecha && valores.horaInicio && valores.horaFin) {
    const inicio = construirFechaIso(valores.fecha, valores.horaInicio);
    const fin = construirFechaIso(valores.fecha, valores.horaFin);
    if (new Date(fin) <= new Date(inicio)) {
      errores.horaFin = "La hora de fin debe ser posterior al inicio.";
    }
  }

  return errores;
};

// Alias temporales para mantener compatibilidad con el resto del codigo.
export const buildTurnoPayloadFromForm = construirPayloadTurnoDesdeFormulario;
export const formValuesFromTurno = obtenerValoresFormularioDesdeTurno;
export const validateTurnoForm = validarFormularioTurno;

