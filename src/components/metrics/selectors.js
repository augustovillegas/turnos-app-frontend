import { ensureModuleLabel } from "../../utils/moduleMap";

const parseDateSafe = (value) => {
  if (!value) return null;
  const direct = new Date(value);
  if (!Number.isNaN(direct.getTime())) return direct;
  if (typeof value === "string" && value.includes("/")) {
    const [dd, mm, yyyy] = value.split("/").map(Number);
    if (dd && mm && yyyy) {
      const parsed = new Date(yyyy, mm - 1, dd);
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    }
  }
  return null;
};

const isWithinDays = (value, days) => {
  if (!days) return true;
  const date = parseDateSafe(value);
  if (!date) return false;
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  return diff >= 0 && diff <= days * 24 * 60 * 60 * 1000;
};

const normalizeStatus = (value) =>
  typeof value === "string" ? value.trim().toLowerCase() : "";

const applyScope = (collection = [], scope = {}) => {
  if (!scope) return collection;
  const moduloScoped = ensureModuleLabel(scope.modulo);
  const cohorteScoped = scope.cohorte ? Number(scope.cohorte) : null;
  return collection.filter((item) => {
    const modulo = ensureModuleLabel(item?.modulo);
    const moduloMatch = moduloScoped ? modulo === moduloScoped : true;
    const cohorteMatch =
      cohorteScoped != null && item?.cohorte != null
        ? Number(item.cohorte) === cohorteScoped
        : true;
    return moduloMatch && cohorteMatch;
  });
};

export const buildKpiIndexes = ({
  usuarios = [],
  entregas = [],
  turnos = [],
  filters = {},
  scope = {},
}) => {
  const timeWindow =
    typeof filters?.range === "string" && filters.range.endsWith("d")
      ? Number(filters.range.replace("d", ""))
      : null;

  // --- Alumnos ---
  const estudiantesScoped = applyScope(
    (usuarios || []).filter(
      (u) => normalizeStatus(u.rol ?? u.role) === "alumno"
    ),
    scope
  );

  const studentsByModuleMap = estudiantesScoped.reduce((acc, user) => {
    const label = ensureModuleLabel(user.modulo) || "Sin módulo";
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {});
  const studentsByModule = Object.entries(studentsByModuleMap)
    .map(([label, value]) => ({ name: label, value, label }))
    .sort((a, b) => b.value - a.value);

  const studentsByCohortMap = estudiantesScoped.reduce((acc, user) => {
    const cohorte = user?.cohorte != null ? Number(user.cohorte) : null;
    if (cohorte == null || Number.isNaN(cohorte)) return acc;
    acc[cohorte] = (acc[cohorte] || 0) + 1;
    return acc;
  }, {});

  const students = {
    total: estudiantesScoped.length,
    active: estudiantesScoped.filter((u) => {
      const status = normalizeStatus(u.estado ?? u.status);
      return (
        status === "activo" ||
        status === "aprobado" ||
        status === "approved" ||
        status === "active"
      );
    }).length,
    inactive: estudiantesScoped.filter((u) => {
      const status = normalizeStatus(u.estado ?? u.status);
      return status === "pendiente" || status === "inactivo" || status === "inactive";
    }).length,
    recursantes: estudiantesScoped.filter((u) =>
      normalizeStatus(u.estado ?? u.status).includes("recurs")
    ).length,
    new30d: estudiantesScoped.filter((u) =>
      isWithinDays(u.creadoEn ?? u.createdAt, 30)
    ).length,
    new7d: estudiantesScoped.filter((u) =>
      isWithinDays(u.creadoEn ?? u.createdAt, 7)
    ).length,
    byModule: studentsByModule,
    byCohort: Object.entries(studentsByCohortMap)
      .map(([name, value]) => ({ name: `Cohorte ${name}`, value: Number(value) }))
      .sort((a, b) => b.value - a.value),
  };

  // --- Entregables ---
  const entregasScoped = applyScope(entregas, scope);
  const deliverablesByStatusMap = entregasScoped.reduce((acc, entrega) => {
    const status = normalizeStatus(entrega.reviewStatus ?? entrega.estado);
    const label =
      status === "aprobado"
        ? "Aprobado"
        : status.includes("desap") || status === "rechazado"
        ? "Desaprobado"
        : status.includes("revisar") || status === "pendiente"
        ? "A revisar"
        : entrega.reviewStatus || entrega.estado || "Sin estado";
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {});

  const deliverables = {
    total: entregasScoped.length,
    totalInRange: entregasScoped.filter((e) =>
      isWithinDays(e.createdAt ?? e.fechaEntrega, timeWindow)
    ).length,
    toGrade: entregasScoped.filter((e) =>
      normalizeStatus(e.reviewStatus ?? e.estado).includes("revisar")
    ).length,
    approved: entregasScoped.filter((e) =>
      normalizeStatus(e.reviewStatus ?? e.estado).includes("aproba")
    ).length,
    rejected: entregasScoped.filter((e) =>
      normalizeStatus(e.reviewStatus ?? e.estado).includes("desaprob")
    ).length,
    overdue: entregasScoped.filter((e) => {
      const fecha = parseDateSafe(e.fechaEntrega);
      if (!fecha) return false;
      const today = new Date();
      const isPast = fecha.getTime() < today.setHours(0, 0, 0, 0);
      const status = normalizeStatus(e.reviewStatus ?? e.estado);
      return isPast && !status.includes("aproba");
    }).length,
    graded7d: entregasScoped.filter((e) =>
      isWithinDays(e.updatedAt ?? e.fechaEntrega, 7)
    ).length,
    byStatus: Object.entries(deliverablesByStatusMap).map(
      ([name, value]) => ({ name, value })
    ),
  };

  // --- Turnos ---
  const turnosScoped = applyScope(turnos, scope);
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).getTime();
  const sevenDaysLater = startOfToday + 7 * 24 * 60 * 60 * 1000;

  const toTimestamp = (turno) => {
    const fecha =
      parseDateSafe(turno.fechaISO) ??
      parseDateSafe(turno.fecha) ??
      parseDateSafe(turno.start);
    return fecha?.getTime() ?? null;
  };

  let occupied = 0;
  let noShowCount = 0;
  const appointmentsByStatusMap = {};

  turnosScoped.forEach((t) => {
    const status = normalizeStatus(t.estado ?? t.status);
    const displayStatus = t.estado ?? t.status ?? "Sin estado";
    appointmentsByStatusMap[displayStatus] =
      (appointmentsByStatusMap[displayStatus] || 0) + 1;
    if (status && status !== "disponible") occupied += 1;
    if (status.includes("no show") || status.includes("no-show") || status.includes("ausente")) {
      noShowCount += 1;
    }
  });

  const appointments = {
    total: turnosScoped.length,
    next7d: turnosScoped.filter((t) => {
      const ts = toTimestamp(t);
      return ts != null && ts >= startOfToday && ts <= sevenDaysLater;
    }).length,
    today: turnosScoped.filter((t) => {
      const ts = toTimestamp(t);
      return ts != null && ts >= startOfToday && ts < startOfToday + 24 * 60 * 60 * 1000;
    }).length,
    approved: turnosScoped.filter((t) =>
      normalizeStatus(t.estado ?? t.status).includes("aproba")
    ).length,
    cancelled: turnosScoped.filter((t) =>
      normalizeStatus(t.estado ?? t.status).includes("cancel")
    ).length,
    occupancy:
      turnosScoped.length === 0
        ? 0
        : Math.min(100, Math.round((occupied / turnosScoped.length) * 100)),
    noShowRate:
      turnosScoped.length === 0
        ? 0
        : Math.min(100, Math.round((noShowCount / turnosScoped.length) * 100)),
    byStatus: Object.entries(appointmentsByStatusMap).map(
      ([name, value]) => ({ name, value })
    ),
  };

  const indexes = { students, deliverables, appointments };

  return {
    filters,
    scope,
    indexes,
    students,
    deliverables,
    appointments,
  };
};
