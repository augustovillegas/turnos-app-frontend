import { screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderApp } from "../utils/renderWithProviders.jsx";

describe("Navegacion publica de la aplicacion", () => {
  it("muestra la landing page con su CTA principal", async () => {
    await renderApp({ route: "/" });

    const heroHeading = await screen.findByRole("heading", {
      name: /portal de gesti��n acadǸmica/i,
    });
    expect(heroHeading).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /ingresar a la app/i })
    ).toBeVisible();
  });

  it("redirecciona a login cuando un visitante accede a un dashboard", async () => {
    await renderApp({ route: "/dashboard/alumno" });

    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: /iniciar sesi��n/i })
      ).toBeInTheDocument()
    );
    expect(
      screen.getByRole("button", { name: /aceptar/i })
    ).toBeInTheDocument();
  });

  it("renderiza correctamente la gesti��n de turnos pǧblica", async () => {
    await renderApp({ route: "/items" });

    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: /gesti��n de turnos/i })
      ).toBeInTheDocument()
    );
  });
});
