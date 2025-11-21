import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterAll, describe, expect, it } from "vitest";
import { renderApp } from "../utils/renderWithProviders.jsx";
import { remoteTestApi } from "../utils/remoteTestApi";
import { requireRoles } from "../utils/e2eEnv";

const resolveId = (entity) =>
  entity?.id ?? entity?._id ?? entity?._id?.$oid ?? null;

const buildEmail = () =>
  `usuario.e2e.${Date.now()}-${Math.random().toString(16).slice(2, 6)}@example.com`;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const waitForUsuarioByEmail = async (email, timeoutMs = 10_000) => {
  const normalized = String(email).toLowerCase();
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const usuarios = await remoteTestApi.listUsuarios();
    const match = usuarios.find(
      (entry) => String(entry.email || "").toLowerCase() === normalized
    );
    if (match) {
      return match;
    }
    await sleep(400);
  }
  throw new Error(
    `No se encontró el usuario "${email}" en la API real después de ${timeoutMs}ms.`
  );
};

const createdUsuarioIds = new Set();

const scheduleCleanup = (entity) => {
  const id = typeof entity === "string" ? entity : resolveId(entity);
  if (id) {
    createdUsuarioIds.add(String(id));
  }
};

const cleanupUsuarios = async () => {
  if (!createdUsuarioIds.size) return;
  const ids = Array.from(createdUsuarioIds);
  createdUsuarioIds.clear();
  await Promise.allSettled(ids.map((id) => remoteTestApi.deleteUsuario(id)));
};

afterAll(async () => {
  await cleanupUsuarios();
});

const createSeedUsuario = async (overrides = {}) => {
  const suffix = `${Date.now()}${Math.random().toString(16).slice(2, 6)}`;
  const usuario = await remoteTestApi.createUsuario({
    name: overrides.name ?? `Seed QA ${suffix}`,
    email: overrides.email ?? `seed.qa.${suffix}@example.com`,
    password: overrides.password ?? `Seed-${suffix}!`,
    role: overrides.role ?? "alumno",
    cohort: overrides.cohort ?? "Modulo 1",
    modulo: overrides.modulo ?? "FRONTEND - REACT",
  });
  scheduleCleanup(usuario);
  return usuario;
};

describe.sequential("CreateUsers - flujo end-to-end", () => {
  const hasProfesorAndSuperadmin = requireRoles("profesor", "superadmin");
  const hasSuperadmin = requireRoles("superadmin");

  (hasProfesorAndSuperadmin ? it : it.skip)(
    "restringe a los profesores a crear solo alumnos y refleja el alta",
    async () => {
      const user = userEvent.setup();
      await renderApp({ route: "/cargar", user: "profesor" });

      await screen.findByRole("heading", { name: /crear nuevo usuario/i });

      const tipoSelect = screen.getByLabelText(/tipo de usuario/i);
      const options = within(tipoSelect).getAllByRole("option");
      expect(options).toHaveLength(1);
      expect(options[0]).toHaveTextContent(/alumno/i);

      const nombreField = screen.getByLabelText(/nombre completo/i);
      const emailField = screen.getByLabelText(/^email/i);

      const nuevoNombre = `Alumno QA ${Date.now()}`;
      const nuevoEmail = buildEmail();

      await user.clear(nombreField);
      await user.type(nombreField, nuevoNombre);
      await user.clear(emailField);
      await user.type(emailField, nuevoEmail);

      await user.click(screen.getByRole("button", { name: /guardar/i }));

      await waitFor(() =>
        expect(screen.getByText(nuevoNombre)).toBeInTheDocument()
      );
      expect(screen.getByText(nuevoEmail)).toBeInTheDocument();

      const creado = await waitForUsuarioByEmail(nuevoEmail);
      scheduleCleanup(creado);
      await remoteTestApi.deleteUsuario(resolveId(creado));

      expect(
        screen.getByRole("heading", { name: /crear nuevo usuario/i })
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /cancelar/i })
      ).not.toBeInTheDocument();
    }
  );

  (hasSuperadmin ? it : it.skip)(
    "permite a un superadmin crear, editar y eliminar usuarios",
    async () => {
      const seedUser = await createSeedUsuario();
      const user = userEvent.setup();
      await renderApp({ route: "/cargar", user: "superadmin" });

      await screen.findByRole("heading", { name: /crear nuevo usuario/i });
      await waitFor(() =>
        expect(
          screen.getByText(new RegExp(seedUser.name, "i"))
        ).toBeInTheDocument()
      );

      const nombreField = screen.getByLabelText(/nombre completo/i);
      const emailField = screen.getByLabelText(/^email/i);

      const nuevoNombre = `Profes QA ${Date.now()}`;
      const nuevoEmail = buildEmail();

      await user.clear(nombreField);
      await user.type(nombreField, nuevoNombre);
      await user.clear(emailField);
      await user.type(emailField, nuevoEmail);
      await user.selectOptions(
        screen.getByLabelText(/tipo de usuario/i),
        "profesor"
      );
      await user.selectOptions(
        screen.getByLabelText(/modulo/i),
        "FRONTEND - REACT"
      );

      await user.click(screen.getByRole("button", { name: /guardar/i }));

      await waitFor(() =>
        expect(screen.getByText(nuevoNombre)).toBeInTheDocument()
      );

      const seedRow = screen.getByText(new RegExp(seedUser.name, "i")).closest(
        "tr"
      );
      await user.click(
        within(seedRow).getByRole("button", { name: /editar/i })
      );

      await screen.findByRole("heading", { name: /editar usuario/i });
      const editingNombreField = screen.getByLabelText(/nombre completo/i);
      expect(editingNombreField).toHaveValue(seedUser.name);
      await user.clear(editingNombreField);
      await user.type(editingNombreField, `${seedUser.name} Editado`);
      const cancelButton = screen.getByRole("button", { name: /cancelar/i });
      await user.click(cancelButton);
      await waitFor(() =>
        expect(
          screen.getByRole("heading", { name: /crear nuevo usuario/i })
        ).toBeInTheDocument()
      );

      const creadoRow = screen.getByText(nuevoNombre).closest("tr");
      await user.click(
        within(creadoRow).getByRole("button", { name: /eliminar/i })
      );

      const confirmButton = await screen.findByRole("button", {
        name: /confirmar/i,
      });
      await user.click(confirmButton);

      await waitFor(() =>
        expect(screen.queryByText(nuevoNombre)).not.toBeInTheDocument()
      );

      const creado = await waitForUsuarioByEmail(nuevoEmail);
      scheduleCleanup(creado);
      await remoteTestApi.deleteUsuario(resolveId(creado));
    }
  );
});
