// === Usuario Edit ===
// Editor completo para usuarios existentes con validaciones.
import { useEffect, useState, useMemo, useCallback } from "react";
import { useAppData } from "../../context/AppContext";
import { useLoading } from "../../context/LoadingContext";
import { useError } from "../../context/ErrorContext";
import { useAuth } from "../../context/AuthContext";
import { useModal } from "../../context/ModalContext";
import { Button } from "../ui/Button";
import { showToast } from "../../utils/feedback/toasts";
import { extractFormErrors } from "../../utils/feedback/errorExtractor";
import { MODULE_OPTIONS, ensureModuleLabel } from "../../utils/moduleMap";
import { validateSelections } from "../../utils/usuarios/helpers";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
const DEFAULT_COHORT = 1;
const DEFAULT_MODULE = MODULE_OPTIONS[0]?.label ?? "HTML-CSS";

const ROLE_PERMISSIONS = {
  superadmin: ["alumno", "profesor", "superadmin"],
  profesor: ["alumno"],
};

const ROLE_LABELS = {
  alumno: "Alumno",
  profesor: "Profesor",
  superadmin: "Superadmin",
};

const FIELD_IDS = Object.freeze({
  tipo: "edit-user-type",
  nombre: "edit-user-nombre",
  email: "edit-user-email",
  identificador: "edit-user-identificador",
  cohorte: "edit-user-cohorte",
  modulo: "edit-user-modulo",
  password: "edit-user-password",
  passwordConfirm: "edit-user-password-confirm",
});

const buildEditForm = (usuario) => ({
  tipo: String(usuario?.rol ?? usuario?.tipo ?? usuario?.role ?? "alumno").toLowerCase(),
  nombre: usuario?.nombre ?? "",
  email: usuario?.email ?? "",
  identificador: usuario?.identificador ?? "",
  cohorte: String(usuario?.cohort ?? usuario?.cohorte ?? DEFAULT_COHORT),
  modulo: ensureModuleLabel(usuario?.modulo) ?? DEFAULT_MODULE,
  password: "",
  passwordConfirm: "",
});

export const UsuarioEdit = ({ usuario, usuarioId, onVolver }) => {
  const { updateUsuario, findUsuarioById, usuarios, loadUsuarios } = useAppData();
  const { isLoading } = useLoading();
  const { pushError } = useError();
  const { usuario: sessionUser } = useAuth();
  const { showModal } = useModal();

  const loggedRole = String(sessionUser?.rol ?? sessionUser?.role ?? "").toLowerCase();

  const allowedRoles = useMemo(() => {
    if (loggedRole === "superadmin") return ROLE_PERMISSIONS.superadmin;
    if (loggedRole === "profesor") return ROLE_PERMISSIONS.profesor;
    return [];
  }, [loggedRole]);

  const [usuarioActual, setUsuarioActual] = useState(usuario ?? null);
  const [formValues, setFormValues] = useState(() => buildEditForm(usuario ?? null));
  const [formErrors, setFormErrors] = useState({});
  const [loadingUsuario, setLoadingUsuario] = useState(!usuario && Boolean(usuarioId));
  const [notFound, setNotFound] = useState(false);

  const isBusy = isLoading("usuarios-update");

  const identificadorEfectivo = useMemo(
    () => usuarioActual?.id ?? usuario?.id ?? usuarioId ?? null,
    [usuarioActual, usuario, usuarioId]
  );

  useEffect(() => {
    if (!usuario) return;
    setUsuarioActual(usuario);
    setFormValues(buildEditForm(usuario));
    setNotFound(false);
    setLoadingUsuario(false);
  }, [usuario]);

  useEffect(() => {
    if (usuario || !usuarioId) return;

    let cancelled = false;
    setLoadingUsuario(true);
    findUsuarioById(usuarioId)
      .then((result) => {
        if (cancelled) return;
        if (!result) {
          setNotFound(true);
          return;
        }
        setUsuarioActual(result);
        setFormValues(buildEditForm(result));
        setNotFound(false);
      })
      .catch((error) => {
        if (cancelled) return;
        showToast(error.message || "No se pudo cargar el usuario.", "error");
        setNotFound(true);
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingUsuario(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [usuario, usuarioId, findUsuarioById]);

  const handleFieldChange = useCallback((event) => {
    const { name, value } = event.target;
    if (name === "tipo" && value && !allowedRoles.includes(String(value))) {
      showToast("No tienes permisos para cambiar a ese rol", "error");
      return;
    }
    setFormValues((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  }, [allowedRoles]);

  const validateEmailUnique = useCallback((email, currentId) => {
    return !usuarios.some(
      (u) => u.id !== currentId && u.email.toLowerCase() === email.toLowerCase()
    );
  }, [usuarios]);

  const validateCustomPassword = useCallback((password, confirm) => {
    if (!password && !confirm) return null;
    if (!password || !confirm) {
      showToast("Completa y confirma la password si deseas cambiarla", "error");
      return false;
    }
    if (password.length < 8) {
      showToast("Password mínimo 8 caracteres", "error");
      return false;
    }
    if (password !== confirm) {
      showToast("Las passwords no coinciden", "error");
      return false;
    }
    return password;
  }, []);

  const handleSubmit = useCallback((event) => {
    event.preventDefault();

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
      showToast("Email no válido", "error");
      return;
    }
    if (!validateEmailUnique(email, identificadorEfectivo)) {
      showToast("Email ya registrado por otro usuario", "error");
      return;
    }
    if (!validateSelections(cohorteRaw, moduloLabel)) {
      showToast("Cohorte o módulo no válido", "error");
      return;
    }
    if (identificador && identificador.length < 3) {
      showToast("Identificador debe tener al menos 3 caracteres", "error");
      return;
    }

    if (!identificadorEfectivo) {
      showToast("No se encontró el usuario para editar", "error");
      return;
    }

    showModal({
      type: "warning",
      title: "Guardar cambios",
      message: "¿Confirmas los cambios realizados en este usuario?",
      onConfirm: async () => {
        await persistirCambios();
      },
    });
  }, [formValues, identificadorEfectivo, validateEmailUnique, showModal]);

  const persistirCambios = async () => {
    const nombre = formValues.nombre.trim();
    const email = formValues.email.trim();
    const identificador = formValues.identificador.trim();
    const cohorteRaw = formValues.cohorte.trim();
    const moduloLabel = ensureModuleLabel(formValues.modulo) ?? DEFAULT_MODULE;
    const cohortNumber = Number.parseInt(cohorteRaw, 10);
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

    const customPasswordResult = validateCustomPassword(passwordValue, passwordConfirm);
    if (customPasswordResult === false) return;
    if (customPasswordResult) {
      payload.password = customPasswordResult;
    }

    try {
      setFormErrors({});
      await updateUsuario(identificadorEfectivo, payload);
      showToast("Cambios guardados. Usuario actualizado correctamente.", "success");
      await loadUsuarios?.();
      onVolver?.();
    } catch (error) {
      const fieldErrors = extractFormErrors(error);
      if (Object.keys(fieldErrors).length > 0) {
        setFormErrors(fieldErrors);
      }
      const message = error?.response?.data?.message || error?.message || "Error al actualizar usuario";
      pushError?.(message);
      showToast(message, "error");
    }
  };

  const solicitarSalida = useCallback(() => {
    showModal({
      type: "warning",
      title: "Cancelar edición",
      message: "¿Salir de la edición? Los cambios sin guardar se perderán.",
      onConfirm: () => {
        onVolver?.();
      },
    });
  }, [showModal, onVolver]);

  if (notFound) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 transition-colors duration-300">
        <div className="max-w-md rounded-md border-2 border-[#111827] bg-white p-6 text-center dark:border-[#333] dark:bg-[#1E1E1E]">
          <h2 className="mb-2 text-2xl font-bold text-[#B91C1C]">Usuario no encontrado</h2>
          <p className="mb-4 text-sm text-[#374151] dark:text-gray-300">
            Verifica que el usuario exista en la base de datos.
          </p>
          <Button onClick={onVolver} variant="primary">
            Volver al listado
          </Button>
        </div>
      </div>
    );
  }

  if (loadingUsuario) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 transition-colors duration-300">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[#1E3A8A] border-t-transparent"></div>
          <p className="text-lg font-semibold text-[#111827] dark:text-gray-200">
            Cargando usuario...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 text-[#111827] dark:text-gray-100 transition-colors duration-300 rounded-lg">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-[#1E3A8A] dark:text-[#93C5FD]">
            Editar usuario
          </h2>
          <Button onClick={solicitarSalida} variant="secondary">
            Volver al listado
          </Button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-md border-2 border-[#111827]/30 bg-white p-4 shadow-md dark:border-[#333]/60 dark:bg-[#1E1E1E]"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            <div>
              <label htmlFor={FIELD_IDS.tipo} className="block text-xs font-bold text-[#111827] dark:text-gray-200">
                Tipo de usuario
              </label>
              <select
                id={FIELD_IDS.tipo}
                name="tipo"
                value={formValues.tipo}
                onChange={handleFieldChange}
                className="mt-1 block w-full rounded border border-[#111827]/40 bg-white px-3 py-2 text-sm text-[#111827] shadow-sm focus:border-[#1E3A8A] focus:outline-none focus:ring-1 focus:ring-[#1E3A8A] dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200"
              >
                {allowedRoles.map((role) => (
                  <option key={role} value={role}>
                    {ROLE_LABELS[role] ?? role}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor={FIELD_IDS.nombre} className="block text-xs font-bold text-[#111827] dark:text-gray-200">
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
              />
              {formErrors.nombre && <p className="mt-1 text-xs font-semibold text-[#B91C1C]">{formErrors.nombre}</p>}
            </div>

            <div>
              <label htmlFor={FIELD_IDS.email} className="block text-xs font-bold text-[#111827] dark:text-gray-200">
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
              />
              {formErrors.email && <p className="mt-1 text-xs font-semibold text-[#B91C1C]">{formErrors.email}</p>}
            </div>

            <div>
              <label htmlFor={FIELD_IDS.identificador} className="block text-xs font-bold text-[#111827] dark:text-gray-200">
                Identificador (opcional)
              </label>
              <input
                id={FIELD_IDS.identificador}
                name="identificador"
                value={formValues.identificador}
                onChange={handleFieldChange}
                placeholder="Legajo / ID interno"
                className="mt-1 block w-full rounded border border-[#111827]/40 bg-white px-3 py-2 text-sm text-[#111827] shadow-sm placeholder:text-[#6B7280] focus:border-[#1E3A8A] focus:outline-none focus:ring-1 focus:ring-[#1E3A8A] dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200 dark:placeholder:text-gray-500"
              />
            </div>

            <div>
              <label htmlFor={FIELD_IDS.cohorte} className="block text-xs font-bold text-[#111827] dark:text-gray-200">
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
              />
            </div>

            <div>
              <label htmlFor={FIELD_IDS.modulo} className="block text-xs font-bold text-[#111827] dark:text-gray-200">
                Módulo
              </label>
              <select
                id={FIELD_IDS.modulo}
                name="modulo"
                value={formValues.modulo}
                onChange={handleFieldChange}
                className="mt-1 block w-full rounded border border-[#111827]/40 bg-white px-3 py-2 text-sm text-[#111827] shadow-sm focus:border-[#1E3A8A] focus:outline-none focus:ring-1 focus:ring-[#1E3A8A] dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200"
              >
                {MODULE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.label}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor={FIELD_IDS.password} className="block text-xs font-bold text-[#111827] dark:text-gray-200">
                Nueva password (opcional)
              </label>
              <input
                id={FIELD_IDS.password}
                name="password"
                type="password"
                value={formValues.password}
                onChange={handleFieldChange}
                placeholder="Dejar vacío para no cambiar"
                className="mt-1 block w-full rounded border border-[#111827]/40 bg-white px-3 py-2 text-sm text-[#111827] shadow-sm placeholder:text-[#6B7280] focus:border-[#1E3A8A] focus:outline-none focus:ring-1 focus:ring-[#1E3A8A] dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200 dark:placeholder:text-gray-500"
              />
            </div>

            <div>
              <label htmlFor={FIELD_IDS.passwordConfirm} className="block text-xs font-bold text-[#111827] dark:text-gray-200">
                Confirmar nueva password
              </label>
              <input
                id={FIELD_IDS.passwordConfirm}
                name="passwordConfirm"
                type="password"
                value={formValues.passwordConfirm}
                onChange={handleFieldChange}
                placeholder="Requerido solo si cambias la password"
                className="mt-1 block w-full rounded border border-[#111827]/40 bg-white px-3 py-2 text-sm text-[#111827] shadow-sm placeholder:text-[#6B7280] focus:border-[#1E3A8A] focus:outline-none focus:ring-1 focus:ring-[#1E3A8A] dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200 dark:placeholder:text-gray-500"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" variant="primary" disabled={isBusy}>
              Guardar cambios
            </Button>
            <Button type="button" variant="secondary" onClick={solicitarSalida} disabled={isBusy}>
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
