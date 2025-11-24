import { useEffect, useMemo, useState } from "react";
import { Table } from "../components/ui/Table";
import { CardUsuario } from "../components/ui/CardUsuario";
import { Button } from "../components/ui/Button";
import { Pagination } from "../components/ui/Pagination";
import { ListToolbar } from "../components/ui/ListToolbar";
import { SearchBar } from "../components/ui/SearchBar";
import { useAppData } from "../context/AppContext";
import { useLoading } from "../context/LoadingContext";
import { useModal } from "../context/ModalContext";
import { useError } from "../context/ErrorContext";
import { useAuth } from "../context/AuthContext";
import { showToast } from "../utils/feedback/toasts";
import { extractFormErrors } from "../utils/feedback/errorExtractor";
import { MODULE_OPTIONS, ensureModuleLabel } from "../utils/moduleMap";
import {
  mapUsuario,
  validateSelections,
} from "../utils/usuarios/helpers";
import { paginate } from "../utils/pagination";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
const DEFAULT_COHORT = 1;
const DEFAULT_MODULE = MODULE_OPTIONS[0]?.label ?? "HTML-CSS";

// Passwords por defecto según rol (backend las puede validar/requerir)
const DEFAULT_PASSWORDS = {
  alumno: "Alumno-fullstack-2025",
  profesor: "Prof-fullstack-2025",
  superadmin: "Superadmin-fullstack-2025",
};

const ROLE_PERMISSIONS = {
  superadmin: ["alumno", "profesor", "superadmin"],
  profesor: ["alumno"],
};

const ROLE_LABELS = {
  alumno: "Alumno",
  profesor: "Profesor",
  superadmin: "Superadmin",
};

const USER_TABLE_COLUMNS = [
  "Nombre",
  "Tipo",
  "Email",
  "Cohorte",
  "Modulo",
  "Acciones",
];

const FIELD_IDS = Object.freeze({
  tipo: "create-user-type",
  nombre: "create-user-nombre",
  email: "create-user-email",
  identificador: "create-user-identificador",
  cohorte: "create-user-cohorte",
  modulo: "create-user-modulo",
  password: "create-user-password",
  passwordConfirm: "create-user-password-confirm",
});

// Helper local: construye valores por defecto del formulario basado en rol permitido
const buildDefaultForm = (tipo = "alumno") => ({
  tipo: tipo || "alumno",
  nombre: "",
  email: "",
  identificador: "",
  cohorte: String(DEFAULT_COHORT),
  modulo: DEFAULT_MODULE,
  password: "",
  passwordConfirm: "",
});

export const CreateUsers = () => {
  const {
    usuarios,
    loadUsuarios,
    createUsuarioRemoto,
    updateUsuarioRemoto,
    deleteUsuarioRemoto,
  } = useAppData() || {};
  const { isLoading } = useLoading();
  const { showModal } = useModal();
  const { pushError } = useError();
  const { usuario: sessionUser } = useAuth() || {};

  const loggedRole = String(
    sessionUser?.rol ?? sessionUser?.role ?? ""
  ).toLowerCase();

  const allowedRoles = useMemo(() => {
    if (loggedRole === "superadmin") return ROLE_PERMISSIONS.superadmin;
    if (loggedRole === "profesor") return ROLE_PERMISSIONS.profesor;
    return [];
  }, [loggedRole]);


  const [editingId, setEditingId] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [formValues, setFormValues] = useState(
    buildDefaultForm(allowedRoles[0])
  );
  const [formErrors, setFormErrors] = useState({});
  const [filtered, setFiltered] = useState([]);
  const [page, setPage] = useState(1);

  // Indica si el rol autenticado puede gestionar usuarios
  const canManageUsers = allowedRoles.length > 0;

  // Solo cargar usuarios si el rol tiene permiso para administrar
  useEffect(() => {
    if (!canManageUsers) {
      return;
    }

    loadUsuarios?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canManageUsers]);

  useEffect(() => {
    setFormValues((prev) => {
      if (allowedRoles.includes(prev.tipo)) return prev;
      return buildDefaultForm(allowedRoles[0]);
    });
  }, [allowedRoles]);

  const personas = useMemo(
    () => (Array.isArray(usuarios) ? usuarios.map(mapUsuario) : []),
    [usuarios]
  );

  useEffect(() => {
    setFiltered(personas);
    setPage(1);
  }, [personas]);

  const paginated = useMemo(
    () => paginate(filtered, page, 8),
    [filtered, page]
  );

  const isBusy =
    Boolean(processingId) ||
    isLoading("usuarios") ||
    isLoading("usuarios-create") ||
    isLoading("usuarios-update") ||
    isLoading("usuarios-delete");

  const handleSearch = (results) => {
    setFiltered(
      Array.isArray(results) && results.length ? results : personas
    );
    setPage(1);
  };

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    if (
      name === "tipo" &&
      value &&
      !allowedRoles.includes(String(value))
    ) {
      showToast("No tienes permisos para ese rol", "error");
      return;
    }
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormValues(buildDefaultForm(allowedRoles[0]));
    setFormErrors({});
    setEditingId(null);
  };

  const getPersona = (id) =>
    personas.find((persona) => String(persona.id) === String(id));

  const handleEditar = (target) => {
    if (!canManageUsers) {
      showToast("No tienes permisos para editar usuarios", "error");
      return;
    }

    const persona =
      typeof target === "object" && target
        ? target
        : getPersona(target);

    if (!persona) return;

    const tipo = String(persona.tipo || "alumno").toLowerCase();
    if (!allowedRoles.includes(tipo)) {
      showToast("No puedes editar este tipo de usuario", "error");
      return;
    }

    setEditingId(persona.id);
    setFormValues({
      tipo,
      nombre: persona.nombre || "",
      email: persona.email || "",
      identificador: persona.identificador || "",
      cohorte: persona.cohorte || String(DEFAULT_COHORT),
      modulo: ensureModuleLabel(persona.modulo) ?? DEFAULT_MODULE,
      password: "",
      passwordConfirm: "",
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canManageUsers) {
      showToast("No tienes permisos para crear usuarios", "error");
      return;
    }

    const nombre = formValues.nombre.trim();
    const email = formValues.email.trim();
    const identificador = formValues.identificador.trim();
    const cohorteRaw = formValues.cohorte.trim();
    const moduloLabel = ensureModuleLabel(formValues.modulo) ?? DEFAULT_MODULE;

    if (!nombre || !email || !cohorteRaw || !moduloLabel) {
      showToast("Todos los campos obligatorios deben estar completos", "error");
      return;
    }
    if (!EMAIL_REGEX.test(email)) {
      showToast("Email no valido", "error");
      return;
    }
    if (!validateEmailUnique(email, editingId)) {
      showToast("Email ya registrado", "error");
      return;
    }
    if (!validateSelections(cohorteRaw, moduloLabel)) {
      showToast("Cohorte o modulo no valido", "error");
      return;
    }
    // Validar identificador si el backend lo requiere
    if (identificador && identificador.length < 3) {
      showToast("Identificador debe tener al menos 3 caracteres", "error");
      return;
    }

    const cohortNumber = Number.parseInt(cohorteRaw, 10);
    const isCreating = !editingId;
    const targetRole = formValues.tipo || allowedRoles[0] || "alumno";

    const payload = {
      nombre,
      email,
      rol: targetRole,
      cohort: cohortNumber,
      modulo: moduloLabel,
      ...(identificador ? { identificador } : {}),
    };

    const passwordValue = formValues.password.trim();
    const passwordConfirm = formValues.passwordConfirm.trim();
    if (isCreating) {
      if (passwordValue || passwordConfirm) {
        const custom = validateCustomPassword(passwordValue, passwordConfirm);
        if (!custom) return;
        payload.password = custom;
      } else {
        // Usar password por defecto según rol
        const defaultPassword = DEFAULT_PASSWORDS[targetRole] || DEFAULT_PASSWORDS.alumno;
        payload.password = defaultPassword;
      }
    } else if (passwordValue || passwordConfirm) {
      const custom = validateCustomPassword(passwordValue, passwordConfirm);
      if (!custom) return;
      payload.password = custom;
    }

    setProcessingId(editingId || "creating");
    try {
      setFormErrors({}); // Limpiar errores previos
      if (isCreating) {
        await createUsuarioRemoto?.(payload);
      } else {
        await updateUsuarioRemoto?.(editingId, payload);
      }
      resetForm();
      await loadUsuarios?.();
    } catch (error) {
      // Extraer errores de validación del backend según contrato {message, errores?}
      const fieldErrors = extractFormErrors(error);
      if (Object.keys(fieldErrors).length > 0) {
        setFormErrors(fieldErrors);
      }
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Error al procesar la operacion";
      pushError?.(message);
      showToast(message, "error");
    } finally {
      setProcessingId(null);
    }
  };

  const handleEliminar = (persona) => {
    if (!canManageUsers) {
      showToast("No tienes permisos para eliminar usuarios", "error");
      return;
    }

    const objetivo =
      typeof persona === "object" && persona
        ? persona
        : getPersona(persona);
    if (!objetivo) return;

    const tipo = String(objetivo.tipo || "alumno").toLowerCase();
    if (!allowedRoles.includes(tipo)) {
      showToast("No puedes eliminar este tipo de usuario", "error");
      return;
    }

    const confirmar = () => {
      setProcessingId(objetivo.id);
      deleteUsuarioRemoto?.(objetivo.id)
        .then(() => {
          if (editingId === objetivo.id) resetForm();
          loadUsuarios?.();
        })
        .catch((error) => {
          const message =
            error?.response?.data?.message ||
            error?.message ||
            "No se pudo eliminar el usuario";
          pushError?.(message);
          showToast(message, "error");
        })
        .finally(() => setProcessingId(null));
    };

    if (showModal) {
      showModal({
        type: "warning",
        title: "Eliminar usuario",
        message: `Eliminar a "${objetivo.nombre}"? Esta accion no se puede deshacer.`,
        onConfirm: confirmar,
      });
    } else {
      confirmar();
    }
  };

  const validateEmailUnique = (email, excludeId) =>
    !personas.some(
      (persona) =>
        persona.email.toLowerCase() === email.toLowerCase() &&
        (!excludeId || String(persona.id) !== String(excludeId))
    );

  const validateCustomPassword = (password, confirm) => {
    if (!password || !confirm) {
      showToast("Completa y confirma la password personalizada", "error");
      return null;
    }
    if (password.length < 8) {
      showToast("Password minimo 8 caracteres", "error");
      return null;
    }
    if (password !== confirm) {
      showToast("Las passwords no coinciden", "error");
      return null;
    }
    return password;
  };

  if (!canManageUsers) {
    return (
      <section className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-900 dark:border-red-400/40 dark:bg-red-950/30 dark:text-red-100">
        <h1 className="text-2xl font-bold">Acceso no autorizado</h1>
        <p className="mt-2 text-sm">
          Tu rol actual no permite crear ni administrar usuarios.
        </p>
      </section>
    );
  }

  // ARQUITECTURA: Layout estandarizado con padding uniforme, max-width consistente.
  // Alineado con patrón visual de EvaluarEntregas/TurnoForm para coherencia UI.
  // Helpers (paginate, mapUsuario, validateSelections) movidos a utils/ para reutilización.
  return (
    <div className="p-6 text-[#111827] dark:text-gray-100 transition-colors duration-300 rounded-lg">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <section className="space-y-6" data-testid="create-users-section">
          <div className="space-y-6" data-testid="create-users-container">
            <ListToolbar
              title={editingId ? "Editar usuario" : "Crear nuevo usuario"}
              total={Array.isArray(personas) ? personas.length : 0}
              filtered={filtered.length}
              loading={isLoading("usuarios")}
              onRefresh={() => loadUsuarios?.()}
              currentPage={paginated.currentPage}
              totalPages={paginated.totalPages}
              testId="create-users-toolbar"
            >
              <SearchBar
                data={personas}
                onSearch={handleSearch}
                fields={["nombre", "email", "tipo", "cohorte", "modulo", "identificador"]}
                placeholder="Buscar por nombre, email, cohorte, modulo..."
              />
              <Button
                variant="secondary"
                type="button"
                className="px-4 py-2"
                onClick={resetForm}
                disabled={isBusy}
              >
                Limpiar
              </Button>
            </ListToolbar>
            <form
              onSubmit={handleSubmit}
              className="space-y-4 rounded-md border-2 border-[#111827]/30 bg-white p-4 shadow-md dark:border-[#333]/60 dark:bg-[#1E1E1E]"
              data-testid="create-users-form"
            >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            <div>
              <label
                htmlFor={FIELD_IDS.tipo}
                className="block text-xs font-bold text-[#111827] dark:text-gray-200"
              >
                Tipo de usuario
              </label>
              <select
                id={FIELD_IDS.tipo}
                name="tipo"
                value={formValues.tipo}
                onChange={handleFieldChange}
                disabled={Boolean(editingId)}
                className="mt-1 block w-full rounded border border-[#111827]/40 bg-white px-3 py-2 text-sm text-[#111827] shadow-sm focus:border-[#1E3A8A] focus:outline-none focus:ring-1 focus:ring-[#1E3A8A] disabled:bg-gray-100 dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200"
                data-testid="field-tipo"
              >
                {allowedRoles.map((role) => (
                  <option key={role} value={role}>
                    {ROLE_LABELS[role] ?? role}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor={FIELD_IDS.nombre}
                className="block text-xs font-bold text-[#111827] dark:text-gray-200"
              >
                Nombre completo
              </label>
              <input
                id={FIELD_IDS.nombre}
                name="nombre"
                value={formValues.nombre}
                onChange={handleFieldChange}
                required
                placeholder="Nombre y apellido"
                className="mt-1 block w-full rounded border border-[#111827]/40 bg-white px-3 py-2 text-sm text-[#111827] shadow-sm placeholder:text-[#6B7280] focus:border-[#1E3A8A] focus:outline-none focus:ring-1 focus:ring-[#1E3A8A] dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200 dark:placeholder:text-gray-500"
                data-testid="field-nombre"
              />
              {formErrors.nombre && (
                <p className="mt-1 text-xs font-semibold text-[#B91C1C]">
                  {formErrors.nombre}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor={FIELD_IDS.email}
                className="block text-xs font-bold text-[#111827] dark:text-gray-200"
              >
                Email
              </label>
              <input
                id={FIELD_IDS.email}
                name="email"
                type="email"
                value={formValues.email}
                onChange={handleFieldChange}
                required
                placeholder="correo@ejemplo.com"
                className="mt-1 block w-full rounded border border-[#111827]/40 bg-white px-3 py-2 text-sm text-[#111827] shadow-sm placeholder:text-[#6B7280] focus:border-[#1E3A8A] focus:outline-none focus:ring-1 focus:ring-[#1E3A8A] dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200 dark:placeholder:text-gray-500"
                data-testid="field-email"
              />
              {formErrors.email && (
                <p className="mt-1 text-xs font-semibold text-[#B91C1C]">
                  {formErrors.email}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor={FIELD_IDS.identificador}
                className="block text-xs font-bold text-[#111827] dark:text-gray-200"
              >
                Identificador (opcional)
              </label>
              <input
                id={FIELD_IDS.identificador}
                name="identificador"
                value={formValues.identificador}
                onChange={handleFieldChange}
                placeholder="Legajo / ID interno"
                className="mt-1 block w-full rounded border border-[#111827]/40 bg-white px-3 py-2 text-sm text-[#111827] shadow-sm placeholder:text-[#6B7280] focus:border-[#1E3A8A] focus:outline-none focus:ring-1 focus:ring-[#1E3A8A] dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200 dark:placeholder:text-gray-500"
                data-testid="field-identificador"
              />
            </div>
            <div>
              <label
                htmlFor={FIELD_IDS.cohorte}
                className="block text-xs font-bold text-[#111827] dark:text-gray-200"
              >
                Cohorte
              </label>
              <input
                id={FIELD_IDS.cohorte}
                name="cohorte"
                type="number"
                min={1}
                value={formValues.cohorte}
                onChange={handleFieldChange}
                className="mt-1 block w-full rounded border border-[#111827]/40 bg-white px-3 py-2 text-sm text-[#111827] shadow-sm focus:border-[#1E3A8A] focus:outline-none focus:ring-1 focus:ring-[#1E3A8A] dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200"
                data-testid="field-cohorte"
              />
            </div>
            <div>
              <label
                htmlFor={FIELD_IDS.modulo}
                className="block text-xs font-bold text-[#111827] dark:text-gray-200"
              >
                Modulo
              </label>
              <select
                id={FIELD_IDS.modulo}
                name="modulo"
                value={formValues.modulo}
                onChange={handleFieldChange}
                className="mt-1 block w-full rounded border border-[#111827]/40 bg-white px-3 py-2 text-sm text-[#111827] shadow-sm focus:border-[#1E3A8A] focus:outline-none focus:ring-1 focus:ring-[#1E3A8A] dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200"
                data-testid="field-modulo"
              >
                {MODULE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.label}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2" data-testid="password-fields">
            <div>
              <label
                htmlFor={FIELD_IDS.password}
                className="block text-xs font-bold text-[#111827] dark:text-gray-200"
              >
                Password (opcional)
              </label>
              <input
                id={FIELD_IDS.password}
                name="password"
                type="password"
                value={formValues.password}
                onChange={handleFieldChange}
                placeholder="Dejar vacio para usar la default"
                className="mt-1 block w-full rounded border border-[#111827]/40 bg-white px-3 py-2 text-sm text-[#111827] shadow-sm placeholder:text-[#6B7280] focus:border-[#1E3A8A] focus:outline-none focus:ring-1 focus:ring-[#1E3A8A] dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200 dark:placeholder:text-gray-500"
                data-testid="field-password"
              />
            </div>
            <div>
              <label
                htmlFor={FIELD_IDS.passwordConfirm}
                className="block text-xs font-bold text-[#111827] dark:text-gray-200"
              >
                Confirmar password
              </label>
              <input
                id={FIELD_IDS.passwordConfirm}
                name="passwordConfirm"
                type="password"
                value={formValues.passwordConfirm}
                onChange={handleFieldChange}
                placeholder="Requerido solo si ingresas una password"
                className="mt-1 block w-full rounded border border-[#111827]/40 bg-white px-3 py-2 text-sm text-[#111827] shadow-sm placeholder:text-[#6B7280] focus:border-[#1E3A8A] focus:outline-none focus:ring-1 focus:ring-[#1E3A8A] dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200 dark:placeholder:text-gray-500"
                data-testid="field-password-confirm"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2" data-testid="form-actions">
            <Button type="submit" variant="primary" disabled={isBusy} data-testid="btn-guardar">
              {editingId ? "Guardar cambios" : "Guardar"}
            </Button>
            {editingId && (
              <Button
                type="button"
                variant="secondary"
                disabled={isBusy}
                onClick={resetForm}
                data-testid="btn-cancelar"
              >
                Cancelar
              </Button>
            )}
          </div>
            </form>
          </div>

          <div className="space-y-4" data-testid="users-table-container">
            {/* Desktop Table */}
            <div className="hidden sm:block">
              <Table
                columns={USER_TABLE_COLUMNS}
                data={paginated.items}
                containerClass="px-4"
                minWidth="min-w-[680px]"
                renderRow={(persona) => (
                  <>
                    <td className="border p-2 dark:border-[#333] font-medium">{persona.nombre}</td>
                    <td className="border p-2 dark:border-[#333] capitalize">{ROLE_LABELS[persona.tipo] ?? persona.tipo}</td>
                    <td className="border p-2 dark:border-[#333]">{persona.email}</td>
                    <td className="border p-2 dark:border-[#333]">{persona.cohorte}</td>
                    <td className="border p-2 dark:border-[#333]">{persona.modulo}</td>
                    <td className="border p-2 dark:border-[#333] text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="xs"
                          variant="secondary"
                          disabled={isBusy}
                          onClick={() => handleEditar(persona)}
                          data-testid={`btn-editar-${persona.id}`}
                        >
                          Editar
                        </Button>
                        <Button
                          size="xs"
                          variant="danger"
                          disabled={isBusy}
                          onClick={() => handleEliminar(persona)}
                          data-testid={`btn-eliminar-${persona.id}`}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </td>
                  </>
                )}
              >
                {paginated.items.length === 0 && (
                  <tr>
                    <td colSpan={USER_TABLE_COLUMNS.length} className="p-4 text-center text-sm italic">
                      No hay usuarios para mostrar.
                    </td>
                  </tr>
                )}
              </Table>
            </div>
            {/* Mobile Cards */}
            <div className="sm:hidden space-y-3" data-testid="users-mobile-cards">
              {paginated.items.length === 0 ? (
                <p className="p-4 text-center text-sm italic">No hay usuarios para mostrar.</p>
              ) : (
                paginated.items.map((persona) => (
                  <CardUsuario
                    key={persona.id}
                    usuario={persona}
                    onEditar={handleEditar}
                    onEliminar={handleEliminar}
                    disabled={isBusy}
                  />
                ))
              )}
            </div>
            {paginated.items.length > 0 && (
              <div className="flex justify-end">
                <Pagination
                  currentPage={paginated.currentPage}
                  totalPages={paginated.totalPages}
                  onPageChange={setPage}
                  data-testid="pagination-users"
                />
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
