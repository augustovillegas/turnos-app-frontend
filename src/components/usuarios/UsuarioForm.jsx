// === Usuario Form ===

// Formulario para crear nuevos usuarios.

import { useState, useMemo, useEffect } from "react";

import { useForm, Controller } from "react-hook-form";

import { useAppData } from "../../context/AppContext";

import { useLoading } from "../../context/LoadingContext";

import { useError } from "../../context/ErrorContext";

import { useAuth } from "../../context/AuthContext";

import { Button } from "../ui/Button";

import { showToast } from "../../utils/feedback/toasts";

import { extractFormErrors } from "../../utils/feedback/errorExtractor";

import { MODULE_OPTIONS, ensureModuleLabel } from "../../utils/moduleMap";

import { validateSelections } from "../../utils/usuarios/helpers";



const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

const DEFAULT_COHORT = 1;

const DEFAULT_MODULE = MODULE_OPTIONS[0]?.label ?? "HTML-CSS";



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

  modulo: DEFAULT_MODULE,

  password: "",

  passwordConfirm: "",

});



export const UsuarioForm = ({ onVolver }) => {

  const { createUsuarioRemoto, loadUsuarios, usuarios } = useAppData();

  const { isLoading } = useLoading();

  const { pushError } = useError();

  const { usuario: sessionUser } = useAuth();

  const creadorId = sessionUser?.id || sessionUser?._id;

  const creadorNombre = sessionUser?.name || sessionUser?.nombre || "Sistema";



  const loggedRole = String(sessionUser?.rol ?? sessionUser?.role ?? "").toLowerCase();



  const allowedRoles = useMemo(() => {

    if (loggedRole === "superadmin") return ROLE_PERMISSIONS.superadmin;

    if (loggedRole === "profesor") return ROLE_PERMISSIONS.profesor;

    return [];

  }, [loggedRole]);



  const [formValues, setFormValues] = useState(buildDefaultForm(allowedRoles[0]));

  const [formErrors, setFormErrors] = useState({});

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



  const handleFieldChange = (event) => {

    const { name, value } = event.target;

    if (name === "tipo" && value && !allowedRoles.includes(String(value))) {

      showToast("No tienes permisos para ese rol", "error");

      return;

    }

    setFormValues((prev) => ({ ...prev, [name]: value }));

  };



  const handleSubmit_rhf = async (event) => {

    event.preventDefault();

    await handleSubmit_execute(formValues);

  };



  const validateEmailUnique = (email) =>

    !usuarios.some((u) => u.email.toLowerCase() === email.toLowerCase());



  const validateCustomPassword = (password, confirm) => {

    if (!password || !confirm) {

      showToast("Completa y confirma la password personalizada", "error");

      return null;

    }

    if (password.length < 8) {

      showToast("Password mínimo 8 caracteres", "error");

      return null;

    }

    if (password !== confirm) {

      showToast("Las passwords no coinciden", "error");

      return null;

    }

    return password;

  };



  const handleSubmit_execute = async (data) => {



    const nombre = data.nombre.trim();

    const email = data.email.trim();

    const identificador = data.identificador.trim();

    const cohorteRaw = data.cohorte.trim();

    const moduloLabel = ensureModuleLabel(data.modulo) ?? DEFAULT_MODULE;



    if (!nombre || !email || !cohorteRaw || !moduloLabel) {

      showToast("Todos los campos obligatorios deben estar completos", "error");

      return;

    }

    if (!EMAIL_REGEX.test(email)) {

      showToast("Email no válido", "error");

      return;

    }

    if (!validateEmailUnique(email)) {

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



    const payload = {

      nombre,

      email,

      rol: targetRole,

      cohort: cohortNumber,

      modulo: moduloLabel,

      ...(identificador ? { identificador } : {}),

      creador: creadorNombre,

      creadorId: creadorId,

    };



    const passwordValue = data.password.trim();

    const passwordConfirm = data.passwordConfirm.trim();



    if (passwordValue || passwordConfirm) {

      const custom = validateCustomPassword(passwordValue, passwordConfirm);

      if (!custom) return;

      payload.password = custom;

    } else {

      const defaultPassword = DEFAULT_PASSWORDS[targetRole] || DEFAULT_PASSWORDS.alumno;

      payload.password = defaultPassword;

    }



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

                    className="mt-1 block w-full rounded border border-[#111827]/40 bg-white px-3 py-2 text-sm text-[#111827] shadow-sm focus:border-[#1E3A8A] focus:outline-none focus:ring-1 focus:ring-[#1E3A8A] dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200"

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

                    onChange={(e) => {

                      field.onChange(e);

                      handleFieldChange(e);

                    }}

                    className="mt-1 block w-full rounded border border-[#111827]/40 bg-white px-3 py-2 text-sm text-[#111827] shadow-sm focus:border-[#1E3A8A] focus:outline-none focus:ring-1 focus:ring-[#1E3A8A] dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200"

                  >

                    {MODULE_OPTIONS.map((option) => (

                      <option key={option.value} value={option.label}>

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
                Password (opcional)
              </label>
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    id={FIELD_IDS.password}
                    type="password"
                    placeholder="Dejar vacío para usar la default"
                    data-testid="field-password"
                    onChange={(e) => {
                      field.onChange(e)
                      handleFieldChange(e)
                    }}
                    className="mt-1 block w-full rounded border border-[#111827]/40 bg-white px-3 py-2 text-sm text-[#111827] shadow-sm placeholder:text-[#6B7280] focus:border-[#1E3A8A] focus:outline-none focus:ring-1 focus:ring-[#1E3A8A] dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200 dark:placeholder:text-gray-500"
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
                    type="password"
                    placeholder="Requerido solo si ingresas una password"
                    data-testid="field-password-confirm"
                    onChange={(e) => {
                      field.onChange(e)
                      handleFieldChange(e)
                    }}
                    className="mt-1 block w-full rounded border border-[#111827]/40 bg-white px-3 py-2 text-sm text-[#111827] shadow-sm placeholder:text-[#6B7280] focus:border-[#1E3A8A] focus:outline-none focus:ring-1 focus:ring-[#1E3A8A] dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200 dark:placeholder:text-gray-500"
                  />
                )}
              />
            </div>
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




