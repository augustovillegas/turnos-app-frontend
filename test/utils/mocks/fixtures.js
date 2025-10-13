// === Test Fixtures ===
// Datos base compartidos entre handlers y suites de pruebas.

export const fixtures = {
  turnos: [
    {
      id: "turno-1",
      review: 1,
      fecha: "2025-01-15",
      horario: "09:00 - 10:00",
      sala: "Sala A",
      zoomLink: "https://example.com/a",
      estado: "Solicitado",
      start: "2025-01-15T12:00:00.000Z",
      end: "2025-01-15T13:00:00.000Z",
      comentarios: "Pendiente de confirmacion",
    },
    {
      id: "turno-2",
      review: 2,
      fecha: "2025-01-16",
      horario: "11:00 - 12:00",
      sala: "Sala B",
      zoomLink: "https://example.com/b",
      estado: "Disponible",
      start: "2025-01-16T14:00:00.000Z",
      end: "2025-01-16T15:00:00.000Z",
      comentarios: "",
    },
    {
      id: "turno-3",
      review: 3,
      fecha: "2025-01-17",
      horario: "14:00 - 15:00",
      sala: "Sala C",
      zoomLink: "https://example.com/c",
      estado: "Aprobado",
      start: "2025-01-17T17:00:00.000Z",
      end: "2025-01-17T18:00:00.000Z",
      comentarios: "Revisado por el profesor",
    },
  ],
  entregas: [
    {
      id: "entrega-1",
      sprint: "Sprint 1",
      alumno: "Juan Perez",
      githubLink: "https://github.com/example/repo",
      renderLink: "https://deploy.example.com",
      comentarios: "Revisar responsive",
      estado: "Pendiente",
      reviewStatus: "A revisar",
    },
  ],
  usuarios: [
    { id: "usuario-1", nombre: "Carla Alvarez", rol: "Alumno", estado: "Pendiente" },
    { id: "usuario-2", nombre: "Martin Gomez", rol: "Profesor", estado: "Aprobado" },
    { id: "usuario-3", nombre: "Laura Di Leo", rol: "Alumno", estado: "Pendiente" },
  ],
};

export const authFixtures = {
  alumno: {
    id: "alumno-1",
    role: "alumno",
    cohort: "Modulo 1",
    email: "alumno@example.com",
    nombre: "Alumno Test",
  },
  profesor: {
    id: "profesor-1",
    role: "profesor",
    cohort: "Modulo 1",
    email: "profesor@example.com",
    nombre: "Profesor Test",
  },
  superadmin: {
    id: "superadmin-1",
    role: "superadmin",
    email: "admin@example.com",
    nombre: "Superadmin Test",
  },
};

export const cloneFixtures = () => ({
  turnos: fixtures.turnos.map((turno) => ({ ...turno })),
  entregas: fixtures.entregas.map((entrega) => ({ ...entrega })),
  usuarios: fixtures.usuarios.map((usuario) => ({ ...usuario })),
});

let autoIncrement = 1000;

export const nextTurnoId = () => {
  autoIncrement += 1;
  return `turno-${autoIncrement}`;
};
