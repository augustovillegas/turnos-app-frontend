// Catálogo declarativo de KPIs por dominio/rol.
// Cada KPI expone una función pura para obtener el valor desde los índices preparados en selectors.

export const KPI_DEFINITIONS = [
  // --- Alumnos ---
  {
    key: "sa_students_total",
    label: "Alumnos totales",
    domain: "alumnos",
    group: "Población",
    format: "int",
    visibleWhen: ({ role }) => role === "superadmin",
    getValue: (ctx) => ctx.indexes.students.total,
  },
  {
    key: "prof_students_total",
    label: "Alumnos asignados",
    domain: "alumnos",
    group: "Población",
    format: "int",
    visibleWhen: ({ role }) => role === "profesor",
    getValue: (ctx) => ctx.indexes.students.total,
  },
  {
    key: "students_active",
    label: "Alumnos activos",
    domain: "alumnos",
    group: "Engagement",
    format: "int",
    getValue: (ctx) => ctx.indexes.students.active,
  },
  {
    key: "students_inactive",
    label: "Alumnos inactivos",
    domain: "alumnos",
    group: "Engagement",
    format: "int",
    getValue: (ctx) => ctx.indexes.students.inactive,
  },
  {
    key: "students_recent_30d",
    label: "Altas últimos 30d",
    domain: "alumnos",
    group: "Growth",
    format: "int",
    getValue: (ctx) => ctx.indexes.students.new30d,
  },
  {
    key: "students_recursantes",
    label: "Recursantes",
    domain: "alumnos",
    group: "Quality",
    format: "int",
    getValue: (ctx) => ctx.indexes.students.recursantes,
  },

  // --- Entregables ---
  {
    key: "deliverables_total_range",
    label: "Entregables en rango",
    domain: "entregables",
    group: "Backlog",
    format: "int",
    getValue: (ctx) => ctx.indexes.deliverables.totalInRange,
  },
  {
    key: "deliverables_pending",
    label: "Pendientes de corrección",
    domain: "entregables",
    group: "Backlog",
    format: "int",
    getValue: (ctx) => ctx.indexes.deliverables.toGrade,
  },
  {
    key: "deliverables_overdue",
    label: "Entregables atrasados",
    domain: "entregables",
    group: "Backlog",
    format: "int",
    getValue: (ctx) => ctx.indexes.deliverables.overdue,
  },
  {
    key: "deliverables_approved",
    label: "Aprobados",
    domain: "entregables",
    group: "Calidad",
    format: "int",
    getValue: (ctx) => ctx.indexes.deliverables.approved,
  },
  {
    key: "deliverables_rejected",
    label: "Desaprobados",
    domain: "entregables",
    group: "Calidad",
    format: "int",
    getValue: (ctx) => ctx.indexes.deliverables.rejected,
  },
  {
    key: "deliverables_reviewed_7d",
    label: "Corregidos (7d)",
    domain: "entregables",
    group: "Ritmo",
    format: "int",
    getValue: (ctx) => ctx.indexes.deliverables.graded7d,
  },

  // --- Turnos ---
  {
    key: "appointments_next_7d",
    label: "Turnos próximos (7d)",
    domain: "turnos",
    group: "Agenda",
    format: "int",
    getValue: (ctx) => ctx.indexes.appointments.next7d,
  },
  {
    key: "appointments_today",
    label: "Turnos de hoy",
    domain: "turnos",
    group: "Agenda",
    format: "int",
    getValue: (ctx) => ctx.indexes.appointments.today,
  },
  {
    key: "appointments_approved",
    label: "Aprobados",
    domain: "turnos",
    group: "Estado",
    format: "int",
    getValue: (ctx) => ctx.indexes.appointments.approved,
  },
  {
    key: "appointments_cancelled",
    label: "Cancelados",
    domain: "turnos",
    group: "Estado",
    format: "int",
    getValue: (ctx) => ctx.indexes.appointments.cancelled,
  },
  {
    key: "appointments_occupancy",
    label: "Ocupación",
    domain: "turnos",
    group: "Capacidad",
    format: "percent",
    getValue: (ctx) => ctx.indexes.appointments.occupancy,
  },
  {
    key: "appointments_noshow_rate",
    label: "No-show",
    domain: "turnos",
    group: "Capacidad",
    format: "percent",
    getValue: (ctx) => ctx.indexes.appointments.noShowRate,
  },
];

export const CHART_DEFINITIONS = [
  {
    key: "students_by_module",
    title: "Distribucion por modulo",
    domain: "alumnos",
    visibleWhen: () => true,
    getSeries: (ctx) => ctx.indexes.students.byModule.slice(0, 5),
  },
  {
    key: "students_engagement_mix",
    title: "Engagement alumnos",
    domain: "alumnos",
    type: "pie",
    visibleWhen: () => true,
    getSeries: (ctx) => {
      const total = ctx.indexes.students.total || 0;
      if (total === 0) return [];
      const base = [
        { name: "Activos", value: ctx.indexes.students.active },
        { name: "Inactivos", value: ctx.indexes.students.inactive },
        { name: "Recursantes", value: ctx.indexes.students.recursantes },
      ];
      return base.map((item) => ({
        ...item,
        percent:
          total > 0 ? Math.round(((item.value || 0) / total) * 100) : 0,
      }));
    },
  },
  {
    key: "deliverables_by_status",
    title: "Estado de entregables",
    domain: "entregables",
    type: "pie",
    visibleWhen: () => true,
    getSeries: (ctx) => {
      const total = ctx.indexes.deliverables.total || 0;
      if (total === 0) return [];
      return ctx.indexes.deliverables.byStatus.map((item) => ({
        ...item,
        percent:
          total > 0 ? Math.round(((item.value || 0) / total) * 100) : 0,
      }));
    },
  },
  {
    key: "appointments_by_status",
    title: "Estado de turnos",
    domain: "turnos",
    type: "pie",
    visibleWhen: () => true,
    getSeries: (ctx) => {
      const total = ctx.indexes.appointments.total || 0;
      if (total === 0) return [];
      return ctx.indexes.appointments.byStatus.map((item) => ({
        ...item,
        percent:
          total > 0 ? Math.round(((item.value || 0) / total) * 100) : 0,
      }));
    },
  },
];
