import { screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderApp } from "../utils/renderWithProviders.jsx";

describe("Navegacion publica de la aplicacion", () => {
  it("muestra la landing page con su CTA principal", async () => {
    renderApp({ route: "/" });

    const heroHeading = await screen.findByRole("heading", {
      name: /portal de gestion academica/i,
    });
    expect(heroHeading).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /ingresar a la app/i })
    ).toBeVisible();
  });

  it("redirecciona a login cuando un visitante accede a un dashboard", async () => {
    renderApp({ route: "/dashboard/alumno" });

    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: /iniciar sesion/i })
      ).toBeInTheDocument()
    );
    expect(
      screen.getByRole("button", { name: /aceptar/i })
    ).toBeInTheDocument();
  });

  it("renderiza correctamente la gestion de turnos publica", async () => {
    renderApp({ route: "/items" });

    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: /gestion de turnos/i })
      ).toBeInTheDocument()
    );
  });
});
