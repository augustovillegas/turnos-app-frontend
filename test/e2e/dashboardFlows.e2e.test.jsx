import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { fixtures } from "../utils/mocks/fixtures";
import { renderApp } from "../utils/renderWithProviders.jsx";

describe.sequential("Dashboards protegidos end-to-end", () => {
  it("renderiza el dashboard de alumno con turnos disponibles", async () => {
    await renderApp({ route: "/dashboard/alumno", user: "alumno" });

    expect(
      await screen.findByRole("heading", {
        name: /listado de turnos disponibles/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText(/buscar turnos disponibles/i)
    ).toBeVisible();

    expect(
      screen.getAllByText(/sala/i).length
    ).toBeGreaterThan(0);
  });

  it("muestra las solicitudes pendientes y usuarios en el dashboard de profesor", async () => {
    await renderApp({ route: "/dashboard/profesor", user: "profesor" });

    expect(
      await screen.findByRole("heading", {
        name: /solicitudes de turnos/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText(/buscar solicitudes/i)
    ).toBeInTheDocument();

    const solicitud = fixtures.turnos.find(
      (turno) => turno.estado === "Solicitado"
    );
    await waitFor(() =>
      expect(screen.getByText(solicitud.sala)).toBeInTheDocument()
    );
  });

  it("habilita la gesti��n global en el dashboard de superadmin y el panel flotante", async () => {
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
      screen.getByText(/review 1/i)
    ).toBeInTheDocument();
  });
});
