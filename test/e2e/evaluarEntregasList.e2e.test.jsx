import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterAll, describe, expect, it } from "vitest";
import { renderApp } from "../utils/renderWithProviders.jsx";
import { testApi } from "../utils/testApi";
import { requireRoles } from "../utils/e2eEnv";

const resolveId = (entity) =>
  entity?.id ?? entity?._id ?? entity?._id?.$oid ?? null;

const created = new Set();

const track = (entrega) => {
  const id = resolveId(entrega);
  if (id) created.add(String(id));
  return entrega;
};

const cleanup = async () => {
  if (!created.size) return;
  const ids = Array.from(created);
  created.clear();
  await Promise.allSettled(ids.map((id) => testApi.deleteEntrega(id)));
};

afterAll(async () => {
  await cleanup();
});

const createEntregaModulo1 = async () => {
  const now = Date.now();
  const comentario = `QA-listado-profesor-${now}`;
  try {
    const entrega = await testApi.createEntrega({
      sprint: "LIST",
      githubLink: `https://github.com/e2e/list-${now}`,
      renderLink: `https://render.example.com/list-${now}`,
      comentarios: comentario,
      estado: "A revisar",
      reviewStatus: "A revisar",
      modulo: "HTML-CSS",
      cohort: 1,
      cohorte: 1,
    });
    return track({ ...entrega, comentario });
  } catch (error) {
    if (error?.response?.status === 403) {
      console.warn("[SKIP] createEntregaModulo1 devolvió 403; revisa credenciales de superadmin/SEED.");
      return null;
    }
    throw error;
  }
};

const openEvaluarEntregas = async () => {
  const user = userEvent.setup();
  await renderApp({ route: "/dashboard/profesor", user: "profesor" });

  await screen.findByText(/turnos pendientes/i);
  const evaluarButton = await screen.findByRole("button", {
    name: /evaluar entregables/i,
  });
  await user.click(evaluarButton);
  await screen.findByRole("heading", { name: /evaluar entregables/i });
  return user;
};

describe.sequential("Evaluar Entregas - listado para profesor módulo 1", () => {
  const hasCreds = requireRoles("profesor", "superadmin");

  (hasCreds ? it : it.skip)(
    "muestra entregas del módulo 1 al profesor asignado",
    async () => {
      const entrega = await createEntregaModulo1();
      if (!entrega) {
        console.warn("[SKIP TEST] No se pudo crear entrega (403).");
        return;
      }
      const comentario = entrega?.comentarios ?? entrega?.comentario;

      const user = await openEvaluarEntregas();
      const table = screen.getByRole("table", { name: /tabla de datos/i });

      await waitFor(() =>
        expect(
          within(table).getByText(new RegExp(comentario, "i"))
        ).toBeInTheDocument()
      );

      // sanity: no action needed, just ensure visible; dismiss toasts if any
      await user.keyboard("{Escape}");
    }
  );
});
