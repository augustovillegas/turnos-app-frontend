import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterAll, describe, expect, it } from "vitest";
import { renderApp } from "../utils/renderWithProviders.jsx";
import { remoteTestApi } from "../utils/remoteTestApi";
import { requireRoles } from "../utils/e2eEnv";

const createdTurnos = new Set();
const createdUsuarios = new Set();

const resolveId = (entity) =>
  entity?.id ??
  entity?._id ??
  entity?._id?.$oid ??
  entity?.userId ??
  entity?.usuarioId ??
  null;

const futureSlot = () => {
  const base = new Date(Date.now() + 90 * 60_000);
  const end = new Date(base.getTime() + 60 * 60_000);
  const formatTime = (date) => date.toISOString().slice(11, 16);
  return {
    fecha: base.toISOString().slice(0, 10),
    horario: `${formatTime(base)} - ${formatTime(end)}`,
    start: base.toISOString(),
    end: end.toISOString(),
  };
};

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
  const now = Date.now();
  const turno = await remoteTestApi.createTurno({
    review: 7,
    // Backend espera room/sala numérico; usar un valor estable y único
    sala: Math.floor(now / 60000),
    zoomLink: `https://example.com/review-${now}`,
    estado: "Solicitado",
    comentarios: "Turno generado para pruebas E2E",
    modulo: "FRONTEND - REACT",
    ...futureSlot(),
  });
  return trackTurno(turno);
};

const createPendingUsuario = async () => {
  const suffix = `${Date.now()}${Math.random().toString(16).slice(2, 6)}`;
  const usuario = await remoteTestApi.createUsuario({
    // Campos alineados al servicio frontendUserService
    nombre: `Usuario QA ${suffix}`,
    email: `qa.user.${suffix}@example.com`,
    password: `Qa-${suffix}!`,
    rol: "alumno",
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
    await Promise.allSettled(ids.map((id) => remoteTestApi.deleteTurno(id)));
  }
  if (createdUsuarios.size) {
    const ids = Array.from(createdUsuarios);
    createdUsuarios.clear();
    await Promise.allSettled(ids.map((id) => remoteTestApi.deleteUsuario(id)));
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
      const turno = await createSolicitadoTurno();
      await renderApp({ route: "/dashboard/alumno", user: "alumno" });

      expect(
        await screen.findByRole("heading", {
          name: /listado de turnos disponibles/i,
        })
      ).toBeInTheDocument();

      expect(
        screen.getByPlaceholderText(/buscar turnos disponibles/i)
      ).toBeVisible();

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
      const turno = await createSolicitadoTurno();
      await renderApp({ route: "/dashboard/profesor", user: "profesor" });

      expect(
        await screen.findByRole("heading", {
          name: /solicitudes de turnos/i,
        })
      ).toBeInTheDocument();

      expect(
        screen.getByPlaceholderText(/buscar solicitudes/i)
      ).toBeInTheDocument();

      await waitFor(() =>
        expect(
          screen.getByText(new RegExp(turno.sala, "i"))
        ).toBeInTheDocument()
      );
    }
  );

  (hasSuperadmin ? it : it.skip)(
    "habilita la gestión global en el dashboard de superadmin y el panel flotante",
    async () => {
      const usuarioPendiente = await createPendingUsuario();
      await renderApp({ route: "/dashboard/superadmin", user: "superadmin" });

      expect(
        await screen.findByRole("heading", {
          name: /usuarios pendientes/i,
        })
      ).toBeInTheDocument();

      const solicitudesButton = screen.getByRole("button", {
        name: /solicitudes \(\d+\)/i,
      });
      expect(solicitudesButton).toBeVisible();

      const user = userEvent.setup();
      await user.click(solicitudesButton);

      expect(
        await screen.findByText(/solicitudes activas/i)
      ).toBeInTheDocument();
      expect(
        await screen.findByText(new RegExp(usuarioPendiente.name, "i"))
      ).toBeInTheDocument();
    }
  );
});
