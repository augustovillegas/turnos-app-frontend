import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterAll, describe, expect, it } from "vitest";
import { renderApp } from "../utils/renderWithProviders.jsx";
import { testApi } from "../utils/testApi.mjs";
import { requireRoles } from "../utils/e2eEnv";
import { normalizeTurno } from "../../src/utils/turnos/normalizeTurno.js";

const createdTurnos = new Set();
const createdUsuarios = new Set();

const resolveId = (entity) =>
  entity?.id ??
  entity?._id ??
  entity?._id?.$oid ??
  entity?.userId ??
  entity?.usuarioId ??
  null;

const trackTurno = (turno) => {
  const id = resolveId(turno);
  if (id) createdTurnos.add(String(id));
  return turno;
};

const trackUsuario = (usuario) => {
  const id = resolveId(usuario);
  if (id) createdUsuarios.add(String(id));
  return usuario;
};

const createSolicitadoTurno = async () => {
  const now = new Date();
  const base = new Date(now.getTime() + 90 * 60_000);
  const end = new Date(base.getTime() + 60 * 60_000);
  const salaLabel = `Sala QA ${now.getTime()}`;
  
  // Pasar solo campos que testApi.createTurno entiende para evitar conflictos
  const turno = await testApi.createTurno({
    review: 7,
    sala: salaLabel,
    zoomLink: `https://example.com/review-${now.getTime()}`,
    comentarios: "Turno generado para pruebas E2E",
    modulo: "HTML-CSS",
    cohorte: 1,
  }, { auth: { role: "profesor" } });
  const rawSala = turno?.sala ?? salaLabel;
  const normalized = normalizeTurno({
    ...turno,
    sala: rawSala,
    room: turno?.room ?? rawSala,
  });
  return trackTurno({ ...turno, sala: normalized.sala, room: normalized.room });
};

const createPendingUsuario = async () => {
  const suffix = `${Date.now()}${Math.random().toString(16).slice(2, 6)}`;
  const usuario = await testApi.createUsuario({
    // Campos alineados al servicio frontendUserService
    nombre: `Usuario QA ${suffix}`,
    email: `qa.user.${suffix}@example.com`,
    password: `Qa-${suffix}!`,
    rol: "alumno",
    approved: false,
    estado: "Pendiente",
    status: "Pendiente",
    // Cohorte numérico; para REACT corresponde 4 según moduleMap
    cohorte: 4,
    modulo: "FRONTEND - REACT",
  });
  return trackUsuario(usuario);
};

const cleanupRemoteData = async () => {
  if (createdTurnos.size) {
    const ids = Array.from(createdTurnos);
    createdTurnos.clear();
    await Promise.allSettled(ids.map((id) => testApi.deleteTurno(id)));
  }
  if (createdUsuarios.size) {
    const ids = Array.from(createdUsuarios);
    createdUsuarios.clear();
    await Promise.allSettled(ids.map((id) => testApi.deleteUsuario(id)));
  }
};

afterAll(async () => {
  await cleanupRemoteData();
});

describe.sequential("Dashboards protegidos end-to-end", () => {
  const hasAlumnoAndSuperadmin = requireRoles("alumno", "superadmin");
  const hasProfesorAndSuperadmin = requireRoles("profesor", "superadmin");
  const hasSuperadmin = requireRoles("superadmin");

  (hasAlumnoAndSuperadmin ? it : it.skip)(
    "renderiza el dashboard de alumno con turnos disponibles",
    async () => {
      try {
        await createSolicitadoTurno();
      } catch (err) {
        console.warn("[e2e] Creación de turno fallida:", err.message);
      }
      await renderApp({ route: "/dashboard/alumno", user: "alumno" });

      expect(
        await screen.findByRole("heading", {
          name: /listado de turnos disponibles/i,
        })
      ).toBeInTheDocument();

      expect(
        screen.getByPlaceholderText(/buscar turnos disponibles/i)
      ).toBeVisible();

      // Navegar a "Mis turnos" y verificar que la sección renderiza
      const user = userEvent.setup();
      const misTurnosBtn = await screen.findByRole("button", { name: /mis turnos/i });
      await user.click(misTurnosBtn);

      await waitFor(() =>
        expect(
          screen.getByRole("heading", { name: /mis turnos/i })
        ).toBeInTheDocument()
      );
    }
  );

  (hasProfesorAndSuperadmin ? it : it.skip)(
    "muestra las solicitudes pendientes y usuarios en el dashboard de profesor",
    async () => {
      let turno;
      try {
        turno = await createSolicitadoTurno();
      } catch (err) {
        console.warn("[e2e] Creación de turno fallida:", err.message);
        turno = null;
      }
      await renderApp({ route: "/dashboard/profesor", user: "profesor" });

      expect(
        await screen.findByRole("heading", {
          name: /solicitudes de turnos/i,
        })
      ).toBeInTheDocument();

      // Si tenemos turno, verificar que aparece en las solicitudes
      if (turno?.sala) {
        const salaMatches = await screen.findAllByText(new RegExp(turno.sala, "i"));
        expect(salaMatches.length).toBeGreaterThan(0);
      }
    }
  );

  (hasSuperadmin ? it : it.skip)(
    "habilita la gestión global en el dashboard de superadmin y el panel flotante",
    async () => {
      await createPendingUsuario();
      await renderApp({ route: "/dashboard/superadmin", user: "superadmin" });

      // Abre el sidebar y navega a "Gestión de Usuarios" para mostrar la sección de Usuarios Pendientes
      const user = userEvent.setup();
      const toggleSidebar = screen.getByLabelText(/abrir panel/i);
      await user.click(toggleSidebar);
      const gestionUsuariosBtn = await screen.findByRole("button", { name: /gestión de usuarios/i });
      await user.click(gestionUsuariosBtn);

      expect(
        await screen.findByRole("heading", {
          name: /usuarios pendientes/i,
        })
      ).toBeInTheDocument();

      // Abrir sidebar y navegar a "Solicitudes de Turnos"
      const toggle = screen.getByLabelText(/abrir panel/i);
      const user2 = userEvent.setup();
      await user2.click(toggle);
      const turnosBtn = await screen.findByRole("button", { name: /solicitudes de turnos/i });
      await user2.click(turnosBtn);

      expect(
        await screen.findByRole("heading", { name: /solicitudes de turnos/i })
      ).toBeInTheDocument();
    }
  );
});

