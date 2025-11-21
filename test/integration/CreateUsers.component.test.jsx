import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, beforeEach, vi } from "vitest";

const mockAppData = {
  usuarios: [],
  loadUsuarios: vi.fn().mockResolvedValue([]),
  createUsuarioRemoto: vi.fn().mockResolvedValue({ id: "user-1" }),
  updateUsuarioRemoto: vi.fn(),
  deleteUsuarioRemoto: vi.fn(),
};

const mockAuth = {
  usuario: { role: "superadmin", rol: "superadmin" },
};

const mockLoading = {
  isLoading: vi.fn().mockReturnValue(false),
};

const mockModal = {
  showModal: vi.fn(),
};

const mockError = {
  pushError: vi.fn(),
};

vi.mock("../../src/context/AppContext", () => ({
  useAppData: () => mockAppData,
}));

vi.mock("../../src/context/AuthContext", () => ({
  useAuth: () => mockAuth,
}));

vi.mock("../../src/context/LoadingContext", () => ({
  useLoading: () => mockLoading,
}));

vi.mock("../../src/context/ModalContext", () => ({
  useModal: () => mockModal,
}));

vi.mock("../../src/context/ErrorContext", () => ({
  useError: () => mockError,
}));

import { CreateUsers } from "../../src/pages/CreateUsers";

const buildEmail = () =>
  `usuario.test.${Date.now()}-${Math.random().toString(16).slice(2, 6)}@example.com`;

const renderCreateUsers = async (role = "superadmin") => {
  mockAuth.usuario = { role, rol: role };
  mockAppData.loadUsuarios.mockResolvedValue([]);
  mockAppData.createUsuarioRemoto.mockResolvedValue({
    id: "generated-id",
  });
  mockAppData.updateUsuarioRemoto.mockResolvedValue({});
  mockAppData.deleteUsuarioRemoto.mockResolvedValue({});
  mockLoading.isLoading.mockReturnValue(false);

  const view = render(<CreateUsers />);
  if (role !== "alumno") {
    await waitFor(() => expect(mockAppData.loadUsuarios).toHaveBeenCalled());
  }

  return view;
};

const fillBaseForm = async ({
  user,
  nombre = "Usuario Test",
  email = buildEmail(),
} = {}) => {
  await user.clear(screen.getByLabelText(/Nombre completo/i));
  await user.type(screen.getByLabelText(/Nombre completo/i), nombre);
  await user.clear(screen.getByLabelText(/^Email/i));
  await user.type(screen.getByLabelText(/^Email/i), email);
  return { email };
};

describe("CreateUsers component (UI + reglas de negocio)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("bloquea el acceso cuando el rol actual es alumno", async () => {
    await renderCreateUsers("alumno");
    expect(
      screen.getByText(/Acceso no autorizado/i)
    ).toBeInTheDocument();
    // En modo alumno no debería intentar cargar usuarios ni mostrar acción de agregar
    expect(mockAppData.loadUsuarios).not.toHaveBeenCalled();
    expect(
      screen.queryByRole("button", { name: /Guardar/i })
    ).not.toBeInTheDocument();
  });

  it("permite a un profesor crear solo alumnos usando la password por defecto", async () => {
    const user = userEvent.setup();
    await renderCreateUsers("profesor");

    const select = screen.getByLabelText(/Tipo de usuario/i);
    const options = within(select).getAllByRole("option");
    expect(options).toHaveLength(1);
    expect(options[0]).toHaveTextContent(/alumno/i);

    const { email } = await fillBaseForm({ user });

    await user.click(screen.getByRole("button", { name: /Guardar/i }));

    await waitFor(() =>
      expect(mockAppData.createUsuarioRemoto).toHaveBeenCalledTimes(1)
    );
    const payload = mockAppData.createUsuarioRemoto.mock.calls[0][0];
    expect(payload.rol).toBe("alumno");
    expect(payload.password).toBe("Alumno-fullstack-2025");
    expect(payload.email).toBe(email);
  });

  it("habilita a superadmin a elegir roles (incluido profesor) y aplica el password por defecto", async () => {
    const user = userEvent.setup();
    await renderCreateUsers("superadmin");

    const select = screen.getByLabelText(/Tipo de usuario/i);
    expect(
      within(select).getByRole("option", { name: /superadmin/i })
    ).toBeInTheDocument();

    await user.selectOptions(select, "profesor");

    const { email } = await fillBaseForm({
      user,
      nombre: "Profesor Automatizado",
    });

    await user.click(screen.getByRole("button", { name: /Guardar/i }));

    await waitFor(() =>
      expect(mockAppData.createUsuarioRemoto).toHaveBeenCalledTimes(1)
    );
    const payload = mockAppData.createUsuarioRemoto.mock.calls[0][0];
    expect(payload.rol).toBe("profesor");
    expect(payload.password).toBe("Prof-fullstack-2025");
    expect(payload.email).toBe(email);
  });
});
