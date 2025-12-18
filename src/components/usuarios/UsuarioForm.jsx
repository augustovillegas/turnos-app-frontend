// === Usuario Form ===

// Formulario para crear nuevos usuarios.

import { useState, useMemo, useEffect } from "react";

import { useForm, Controller } from "react-hook-form";

import { useAppData } from "../../context/AppContext";

import { useLoading } from "../../context/LoadingContext";

import { useError } from "../../context/ErrorContext";

import { useAuth } from "../../context/AuthContext";

import { useUsuarioValidation } from "../../hooks/useUsuarioValidation";

import { Button } from "../ui/Button";

import { showToast } from "../../utils/feedback/toasts";

import { extractFormErrors } from "../../utils/feedback/errorExtractor";

import { MODULE_OPTIONS, ensureModuleLabel } from "../../utils/moduleMap";

import { validateSelections } from "../../utils/usuarios/helpers";



const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

const DEFAULT_COHORT = 1;



// Password por rol dinámica basada en año actual con sufijo aleatorio para mayor seguridad.
const generatePasswordByRole = (rol) => {
  const currentYear = new Date().getFullYear();
  const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
  const rolePasswords = {
    alumno: `Alumno${currentYear}-${randomSuffix}#`,
    profesor: `Profesor${currentYear}-${randomSuffix}#`,
    superadmin: `Superadmin${currentYear}-${randomSuffix}#`,
  };
  return rolePasswords[rol] || `User${currentYear}-${randomSuffix}#`;
};

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



const buildDefaultForm = (tipo = "alumno") => ({

  tipo: tipo || "alumno",

  nombre: "",

  email: "",

  identificador: "",

  cohorte: String(DEFAULT_COHORT),

  modulo: "",

  password: "",

  passwordConfirm: "",

});



export const UsuarioForm = ({ usuario, onVolver }) => {

  const { createUsuarioRemoto, loadUsuarios, usuarios } = useAppData();

  const { isLoading } = useLoading();

  const { pushError } = useError();

  const { usuario: sessionUser } = useAuth();

  const { validateCustomPassword: validatePassword, validateEmailUnique } = useUsuarioValidation();

  const professorModuleLabel =
    ensureModuleLabel(
      sessionUser?.modulo
    );
  const professorHasModule = Boolean(professorModuleLabel);

  const creadorId = sessionUser?.id || sessionUser?._id;

  const creadorNombre = sessionUser?.name || sessionUser?.nombre || "Sistema";



  const loggedRole = String(sessionUser?.rol ?? sessionUser?.role ?? "").toLowerCase();

  // Log de debugging: verificar configuración del usuario autenticado
  useEffect(() => {
    console.log('[UsuarioForm] Usuario autenticado:', {
      rol: loggedRole,
      professorModuleLabel,
      professorHasModule,
      puedeCrearUsuarios: loggedRole === 'profesor' || loggedRole === 'superadmin'
    });
  }, [loggedRole, professorModuleLabel, professorHasModule]);

  const allowedRoles = useMemo(() => {

    if (loggedRole === "superadmin") return ROLE_PERMISSIONS.superadmin;

    if (loggedRole === "profesor") return ROLE_PERMISSIONS.profesor;

    return [];

  }, [loggedRole]);


  // Inicializar formValues con datos del usuario si está en modo edición
  const initialFormValues = useMemo(() => {
    if (usuario) {
      return {
        tipo: usuario.rol || usuario.tipo || "",
        nombre: usuario.nombre || "",
        email: usuario.email || "",
        identificador: usuario.identificador || "",
        cohorte: String(usuario.cohorte ?? ""),
        modulo: usuario.modulo || "",
        password: "",
        passwordConfirm: "",
      };
    }
    const defaultForm = buildDefaultForm(allowedRoles[0]);
    if (loggedRole === "profesor") {
      return { ...defaultForm, modulo: professorModuleLabel || "" };
    }
    return defaultForm;
  }, [usuario, allowedRoles, loggedRole, professorModuleLabel]);


  const moduleOptions = useMemo(() => {
    if (loggedRole === "profesor" && professorHasModule) {
      return [{ value: professorModuleLabel, label: professorModuleLabel }];
    }
    // Mostrar placeholder para obligar selección manual cuando no hay módulo precargado
    return [{ value: "", label: "Selecciona módulo" }, ...MODULE_OPTIONS];
  }, [loggedRole, professorHasModule, professorModuleLabel]);

  const [formValues, setFormValues] = useState(initialFormValues);

  // Sincronizar cuando cambia el usuario seleccionado
  useEffect(() => {
    setFormValues(initialFormValues);
  }, [initialFormValues]);

  const [formErrors, setFormErrors] = useState({});

  const [useCustomPassword, setUseCustomPassword] = useState(false);

  const { control, watch, setValue } = useForm({

    mode: "onChange",

    defaultValues: formValues,

  });



  const valoresActuales = watch();

  useEffect(() => {

    Object.keys(formValues).forEach((key) => {

      if (valoresActuales[key] !== formValues[key]) {

        setValue(key, formValues[key]);

      }

    });

  }, [formValues, setValue, valoresActuales]);



  const isBusy = isLoading("usuarios-create");

  // Validación preventiva: profesor debe tener módulo asignado
  useEffect(() => {
    if (loggedRole === "profesor" && !professorHasModule) {
      showToast("Tu usuario no tiene módulo asignado. Contacta al administrador.", "error");
      pushError?.("Profesor sin módulo asignado - No puede crear usuarios");
      // Permitir que se muestre el error antes de volver
      const timer = setTimeout(() => {
        onVolver?.();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [loggedRole, professorHasModule, pushError, onVolver]);



  const handleFieldChange = (event) => {

    const { name, value } = event.target;

    if (name === "tipo" && value && !allowedRoles.includes(String(value))) {

      showToast("No tienes permisos para ese rol", "error");

      return;

    }

    setFormValues((prev) => {

      const updated = { ...prev, [name]: value };

      if (name === "tipo" && !useCustomPassword) {

        const newPassword = generatePasswordByRole(value);

        updated.password = newPassword;

        updated.passwordConfirm = newPassword;

      }

      return updated;

    });

  };



  const handleSubmit_rhf = async (event) => {

    event.preventDefault();

    await handleSubmit_execute(formValues);

  };



  const handleSubmit_execute = async (data) => {



    const nombre = data.nombre.trim();

    const email = data.email.trim();

    const identificador = data.identificador.trim();

    const cohorteRaw = data.cohorte.trim();

    const moduloLabel = loggedRole === "profesor" && professorHasModule
      ? professorModuleLabel
      : ensureModuleLabel(data.modulo);

    console.log('[UsuarioForm] Módulo calculado:', {
      rol: loggedRole,
      esProfConModulo: loggedRole === "profesor" && professorHasModule,
      moduloDelProfesor: professorModuleLabel,
      moduloSeleccionado: data.modulo,
      moduloFinal: moduloLabel
    });

    if (!nombre || !email || !cohorteRaw || !moduloLabel) {

      showToast("Todos los campos obligatorios deben estar completos", "error");

      return;

    }

    if (!EMAIL_REGEX.test(email)) {

      showToast("Email no válido", "error");

      return;

    }

    if (!validateEmailUnique(email, usuarios)) {

      showToast("Email ya registrado", "error");

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



    const cohortNumber = Number.parseInt(cohorteRaw, 10);

    const targetRole = data.tipo || allowedRoles[0] || "alumno";

    // IMPORTANTE: Cohorte y módulo son independientes
    // - cohorte: camada de alumnos (1, 2, 3...) - Solo identificador visual
    // - modulo: materia/contenido (HTML-CSS, JAVASCRIPT, etc.) - CLAVE DE FILTRADO con enum

    const payload = {

      nombre,

      email,

      rol: targetRole,

      cohorte: cohortNumber,

      modulo: moduloLabel,


      ...(identificador ? { identificador } : {}),

      creador: creadorNombre,

      creadorId: creadorId,

    };



    const passwordValue = data.password.trim();

    const passwordConfirm = data.passwordConfirm.trim();



    if (passwordValue || passwordConfirm) {

      const custom = validatePassword(passwordValue, passwordConfirm);

      if (!custom) return;

      payload.password = custom;

    } else {

      const defaultPassword = DEFAULT_PASSWORDS[targetRole] || DEFAULT_PASSWORDS.alumno;

      payload.password = defaultPassword;

    }

    console.log('[UsuarioForm] Payload a enviar:', {
      cohorte: payload.cohorte,
      modulo: payload.modulo,
      payload
    });



    try {

      setFormErrors({});

      await createUsuarioRemoto(payload);

      showToast("Usuario creado correctamente", "success");

      await loadUsuarios?.();

      onVolver?.();

    } catch (error) {

      const fieldErrors = extractFormErrors(error);

      if (Object.keys(fieldErrors).length > 0) {

        setFormErrors(fieldErrors);

      }

      const message = error?.response?.data?.message || error?.message || "Error al crear usuario";

      pushError?.(message);

      showToast(message, "error");

    }

  };



  return (

    <div className="p-4 sm:p-6 text-[#111827] dark:text-gray-100 transition-colors duration-300 rounded-lg">

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2
            data-testid="create-users-heading"
            className="text-2xl sm:text-3xl font-bold text-[#1E3A8A] dark:text-[#93C5FD]"
          >
            Crear nuevo usuario
          </h2>
          <Button onClick={onVolver} variant="secondary" className="w-full sm:w-auto">
            Volver al listado
          </Button>
        </div>

        <form
          onSubmit={handleSubmit_rhf}
          className="space-y-4 rounded-md border-2 border-[#111827]/30 bg-white p-4 shadow-md dark:border-[#333]/60 dark:bg-[#1E1E1E]"
        >

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">

            <div>
              <label htmlFor={FIELD_IDS.tipo} className="block text-xs font-bold text-[#111827] dark:text-gray-200">
                Tipo de usuario
              </label>
              <Controller
                name="tipo"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    id={FIELD_IDS.tipo}
                    onChange={(e) => {
                      field.onChange(e);
                      handleFieldChange(e);
                    }}
                    className="mt-1 block w-full rounded border border-[#111827]/40 bg-white px-3 py-2 text-sm text-[#111827] shadow-sm focus:border-[#1E3A8A] focus:outline-none focus:ring-1 focus:ring-[#1E3A8A] dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200 disabled:bg-gray-100 dark:disabled:bg-[#1A1A1A] disabled:cursor-not-allowed"
                  >
                    {allowedRoles.map((role) => (
                      <option key={role} value={role}>
                        {ROLE_LABELS[role] ?? role}
                      </option>
                    ))}
                  </select>
                )}
              />
            </div>

            <div>
              <label htmlFor={FIELD_IDS.nombre} className="block text-xs font-bold text-[#111827] dark:text-gray-200">
                Nombre completo
              </label>
              <Controller
                name="nombre"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    id={FIELD_IDS.nombre}
                    required
                    placeholder="Nombre y apellido"
                    onChange={(e) => {
                      field.onChange(e);
                      handleFieldChange(e);
                    }}
                    className="mt-1 block w-full rounded border border-[#111827]/40 bg-white px-3 py-2 text-sm text-[#111827] shadow-sm placeholder:text-[#6B7280] focus:border-[#1E3A8A] focus:outline-none focus:ring-1 focus:ring-[#1E3A8A] dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200 dark:placeholder:text-gray-500"
                  />
                )}
              />
              {formErrors.nombre && <p className="mt-1 text-xs font-semibold text-[#B91C1C]">{formErrors.nombre}</p>}
            </div>

            <div>
              <label htmlFor={FIELD_IDS.email} className="block text-xs font-bold text-[#111827] dark:text-gray-200">
                Email
              </label>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    id={FIELD_IDS.email}
                    type="email"
                    required
                    placeholder="correo@ejemplo.com"
                    onChange={(e) => {
                      field.onChange(e);
                      handleFieldChange(e);
                    }}
                    className="mt-1 block w-full rounded border border-[#111827]/40 bg-white px-3 py-2 text-sm text-[#111827] shadow-sm placeholder:text-[#6B7280] focus:border-[#1E3A8A] focus:outline-none focus:ring-1 focus:ring-[#1E3A8A] dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200 dark:placeholder:text-gray-500"
                  />
                )}
              />
              {formErrors.email && <p className="mt-1 text-xs font-semibold text-[#B91C1C]">{formErrors.email}</p>}
            </div>

            <div>
              <label htmlFor={FIELD_IDS.identificador} className="block text-xs font-bold text-[#111827] dark:text-gray-200">
                Identificador (opcional)
              </label>
              <Controller
                name="identificador"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    id={FIELD_IDS.identificador}
                    placeholder="Legajo / ID interno"
                    onChange={(e) => {
                      field.onChange(e);
                      handleFieldChange(e);
                    }}
                    className="mt-1 block w-full rounded border border-[#111827]/40 bg-white px-3 py-2 text-sm text-[#111827] shadow-sm placeholder:text-[#6B7280] focus:border-[#1E3A8A] focus:outline-none focus:ring-1 focus:ring-[#1E3A8A] dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200 dark:placeholder:text-gray-500"
                  />
                )}
              />
            </div>

            <div>
              <label htmlFor={FIELD_IDS.cohorte} className="block text-xs font-bold text-[#111827] dark:text-gray-200">
                Cohorte
              </label>
              <Controller
                name="cohorte"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    id={FIELD_IDS.cohorte}
                    type="number"
                    min={1}
                    onChange={(e) => {
                      field.onChange(e);
                      handleFieldChange(e);
                    }}
                    className="mt-1 block w-full rounded border border-[#111827]/40 bg-white px-3 py-2 text-sm text-[#111827] shadow-sm focus:border-[#1E3A8A] focus:outline-none focus:ring-1 focus:ring-[#1E3A8A] dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200"
                  />
                )}
              />
            </div>

            <div>
              <label htmlFor={FIELD_IDS.modulo} className="block text-xs font-bold text-[#111827] dark:text-gray-200">
                Módulo
              </label>
              <Controller
                name="modulo"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    id={FIELD_IDS.modulo}
                    disabled={loggedRole === "profesor" && professorHasModule}
                    onChange={(e) => {
                      field.onChange(e);
                      handleFieldChange(e);
                    }}
                    className="mt-1 block w-full rounded border border-[#111827]/40 bg-white px-3 py-2 text-sm text-[#111827] shadow-sm focus:border-[#1E3A8A] focus:outline-none focus:ring-1 focus:ring-[#1E3A8A] dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200"
                  >
                    {moduleOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}
              />
            </div>

          </div>



          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor={FIELD_IDS.password} className="block text-xs font-bold text-[#111827] dark:text-gray-200">
                Password
              </label>
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    id={FIELD_IDS.password}
                    type="text"
                    disabled={!useCustomPassword}
                    placeholder={useCustomPassword ? "Ingrese contraseña" : generatePasswordByRole(formValues.tipo)}
                    data-testid="field-password"
                    onChange={(e) => {
                      field.onChange(e)
                      handleFieldChange(e)
                    }}
                    className="mt-1 block w-full rounded border border-[#111827]/40 bg-white px-3 py-2 text-sm text-[#111827] shadow-sm placeholder:text-[#6B7280] focus:border-[#1E3A8A] focus:outline-none focus:ring-1 focus:ring-[#1E3A8A] dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200 dark:placeholder:text-gray-500 disabled:bg-gray-100 dark:disabled:bg-[#1A1A1A] disabled:cursor-not-allowed"
                  />
                )}
              />
            </div>

            <div>
              <label htmlFor={FIELD_IDS.passwordConfirm} className="block text-xs font-bold text-[#111827] dark:text-gray-200">
                Confirmar password
              </label>
              <Controller
                name="passwordConfirm"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    id={FIELD_IDS.passwordConfirm}
                    type="text"
                    disabled={!useCustomPassword}
                    placeholder={useCustomPassword ? "Confirme contraseña" : "Generada automáticamente"}
                    data-testid="field-password-confirm"
                    onChange={(e) => {
                      field.onChange(e)
                      handleFieldChange(e)
                    }}
                    className="mt-1 block w-full rounded border border-[#111827]/40 bg-white px-3 py-2 text-sm text-[#111827] shadow-sm placeholder:text-[#6B7280] focus:border-[#1E3A8A] focus:outline-none focus:ring-1 focus:ring-[#1E3A8A] dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200 dark:placeholder:text-gray-500 disabled:bg-gray-100 dark:disabled:bg-[#1A1A1A] disabled:cursor-not-allowed"
                  />
                )}
              />
            </div>
          </div>

          {/* Checkbox desplazado debajo de los inputs para no truncar elementos */}
          <div className="mt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={useCustomPassword}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setUseCustomPassword(checked);
                  if (!checked) {
                    const newPassword = generatePasswordByRole(formValues.tipo);
                    setFormValues(prev => ({
                      ...prev,
                      password: newPassword,
                      passwordConfirm: newPassword
                    }));
                    setValue('password', newPassword);
                    setValue('passwordConfirm', newPassword);
                  } else {
                    setFormValues(prev => ({
                      ...prev,
                      password: '',
                      passwordConfirm: ''
                    }));
                    setValue('password', '');
                    setValue('passwordConfirm', '');
                  }
                }}
                className="rounded border-[#111827]/40 dark:border-[#444]"
              />
              <span className="text-xs text-[#111827] dark:text-gray-200">Usar contraseña personalizada</span>
            </label>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="submit"
              variant="primary"
              disabled={isBusy}
              className="w-full sm:w-auto"
              data-testid="btn-guardar"
            >
              Crear usuario
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={onVolver}
              disabled={isBusy}
              className="w-full sm:w-auto"
              data-testid="btn-cancelar"
            >
              Cancelar
            </Button>
          </div>


        </form>

      </div>

    </div>

  );

};



