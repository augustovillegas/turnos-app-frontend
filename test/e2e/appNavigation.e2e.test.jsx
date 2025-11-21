import { screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderApp } from "../utils/renderWithProviders.jsx";
import { requireRoles } from "../utils/e2eEnv";

describe("Navegacion publica de la aplicacion", () => {
  it("muestra la landing page con su CTA principal", async () => {
    await renderApp({ route: "/" });

    await waitFor(() =>
      expect(
        screen.getByRole("heading", {
          name: /universidad nacional de catamarca/i,
        })
      ).toBeInTheDocument()
    );

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /ingresar a la app/i })
      ).toBeVisible()
    );
  });

  it("redirecciona a login cuando un visitante accede a un dashboard", async () => {
    await renderApp({ route: "/dashboard/alumno" });

    await waitFor(() =>
      expect(screen.getByText(/iniciar sesi.n/i)).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /aceptar/i })).toBeInTheDocument()
    );
  });

  const hasProfesorCreds = requireRoles("profesor");

  (hasProfesorCreds ? it : it.skip)(
    "renderiza correctamente la gestion de turnos publica",
    async () => {
      await renderApp({ route: "/items", user: "profesor" });

      await screen.findAllByRole("heading");
      const heading = await screen.findByRole(
        "heading",
        { name: /gesti.n de turnos/i },
        { timeout: 15_000 }
      );
      expect(heading).toBeInTheDocument();
    }
  );
});
