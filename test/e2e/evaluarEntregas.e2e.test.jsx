import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterAll, describe, expect, it } from "vitest";
import { renderApp } from "../utils/renderWithProviders.jsx";
import { remoteTestApi } from "../utils/remoteTestApi";
import { requireRoles } from "../utils/e2eEnv";

const resolveId = (entity) =>
  entity?.id ?? entity?._id ?? entity?._id?.$oid ?? null;

const createdEntregas = new Set();

const trackEntrega = (entrega) => {
  const id = resolveId(entrega);
  if (id) createdEntregas.add(String(id));
  return entrega;
};

const cleanupEntregas = async () => {
  if (!createdEntregas.size) return;
  const ids = Array.from(createdEntregas);
  createdEntregas.clear();
  await Promise.allSettled(ids.map((id) => remoteTestApi.deleteEntrega(id)));
};

afterAll(async () => {
  await cleanupEntregas();
});

const createEntregaPendiente = async (tag) => {
  const now = Date.now();
  const comentario = `QA ${tag} ${now}`;
  const entrega = await remoteTestApi.createEntrega({
    sprint: tag,
    githubLink: `https://github.com/e2e/entrega-${tag}-${now}`,
    renderLink: `https://render.example.com/e2e-${tag}-${now}`,
    comentarios: comentario,
    estado: "A revisar",
    reviewStatus: "A revisar",
    modulo: "HTML-CSS",
  });
  trackEntrega(entrega);
  return { entrega, comentario };
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

describe.sequential("Evaluar Entregas - end-to-end", () => {
  const hasProfesorAndSuperadmin = requireRoles("profesor", "superadmin");

  (hasProfesorAndSuperadmin ? it : it.skip)(
    "filtra, aprueba y desaprueba entregables pendientes",
    async () => {
      const primera = await createEntregaPendiente("alpha");
      const segunda = await createEntregaPendiente("beta");
      const user = await openEvaluarEntregas();
      const table = screen.getByRole("table", { name: /tabla de datos/i });

      const getRowByComentario = (comentario) => {
        const cell = within(table).queryByText(new RegExp(comentario, "i"));
        return cell ? cell.closest("tr") : null;
      };

      await waitFor(() =>
        expect(getRowByComentario(primera.comentario)).toBeTruthy()
      );
      await waitFor(() =>
        expect(getRowByComentario(segunda.comentario)).toBeTruthy()
      );

      const primeraRow = getRowByComentario(primera.comentario);
      await user.click(
        within(primeraRow).getByRole("button", { name: /^aprobar$/i })
      );
      await waitFor(() =>
        expect(getRowByComentario(primera.comentario)).toBeNull()
      );

      const segundaRow = getRowByComentario(segunda.comentario);
      await user.click(
        within(segundaRow).getByRole("button", { name: /^desaprobar$/i })
      );
      await waitFor(() =>
        expect(getRowByComentario(segunda.comentario)).toBeNull()
      );

      expect(await screen.findByText(/no hay registros/i)).toBeInTheDocument();
    }
  );
});
