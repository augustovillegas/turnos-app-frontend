import { useState } from "react";
import { motion } from "framer-motion";
import { useForm, Controller } from "react-hook-form";
import { useTheme } from "../context/ThemeContext";
import { useSound } from "../context/SoundContext";
import { useAuth } from "../context/AuthContext";
import { showToast } from "../utils/feedback/toasts";
import { Button } from "../components/ui/Button";
import { LayoutWrapper } from "../components/layout/LayoutWrapper";

const MotionContainer = motion.div;

export const Configuracion = ({ withWrapper = true }) => {
  const { theme, toggleTheme } = useTheme();
  const { muted, toggleMute } = useSound();
  const { usuario: sessionUser } = useAuth();
  const [activeTab, setActiveTab] = useState("perfil");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const { control, handleSubmit, watch, reset, formState: { errors } } = useForm({
    mode: "onChange",
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPassword = watch("newPassword");

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab !== "preferencias") {
      showToast(
        "Estamos trabajando en esta seccion. Pronto tendras novedades.",
        "warning"
      );
    }
  };

  const handleToggleTheme = () => {
    const siguienteTema = theme === "dark" ? "claro" : "oscuro";
    toggleTheme();
    showToast(`Tema ${siguienteTema} activado correctamente.`, "success");
  };

  const handleToggleSound = () => {
    const siguienteEstado = muted ? "activado" : "silenciado";
    toggleMute();
    showToast(`Sonido ${siguienteEstado}.`, muted ? "success" : "info");
  };

  const onSubmitPassword = async (data) => {
    setIsUpdatingPassword(true);
    try {
      // Validación de contraseña nueva
      if (data.newPassword.length < 8) {
        showToast("La contraseña debe tener al menos 8 caracteres", "error");
        return;
      }
      
      if (data.newPassword !== data.confirmPassword) {
        showToast("Las contraseñas no coinciden", "error");
        return;
      }

      // Simulación de actualización (aquí iría la llamada al backend)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showToast("Contraseña actualizada correctamente", "success");
      reset();
    } catch (error) {
      showToast(error.message || "Error al actualizar la contraseña", "error");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Generar avatar provisional con iniciales
  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const userInitials = getInitials(sessionUser?.nombre || sessionUser?.name || "Usuario");
  const userName = sessionUser?.nombre || sessionUser?.name || "Usuario";
  const userEmail = sessionUser?.email || "correo@ejemplo.com";
  const userRole = sessionUser?.rol || sessionUser?.role || "alumno";
  const userCohort = sessionUser?.cohort || sessionUser?.cohorte || "N/A";
  const userModule = sessionUser?.modulo || "N/A";

  const baseClass =
    "flex flex-col gap-6 text-[#111827] dark:text-gray-100 transition-colors duration-300";

  const content = (
    <>
      <h2 className="text-2xl sm:text-3xl font-bold text-white dark:text-[#93C5FD]">
        Configuracion
      </h2>

      <div className="flex flex-wrap gap-3">
        {["perfil", "preferencias", "seguridad"].map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? "primary" : "secondary"}
            onClick={() => handleTabChange(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Button>
        ))}
      </div>

      <MotionContainer
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-[#1E1E1E] border-2 border-[#373c47] dark:border-[#333] rounded-lg p-4 sm:p-6 shadow-md transition-colors duration-300"
      >
        {activeTab === "perfil" && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4 dark:text-gray-100">
              Perfil del usuario
            </h3>

            {/* Avatar y nombre */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b dark:border-gray-700">
              <div className="relative">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-[#1E3A8A] to-[#3B82F6] dark:from-[#60A5FA] dark:to-[#3B82F6] flex items-center justify-center shadow-lg">
                  <span className="text-3xl sm:text-4xl font-bold text-white">
                    {userInitials}
                  </span>
                </div>
                <div className="absolute bottom-0 right-0 w-8 h-8 bg-green-500 rounded-full border-4 border-white dark:border-[#1E1E1E]" 
                     title="Cuenta activa" />
              </div>

              <div className="flex-1 text-center sm:text-left">
                <h4 className="text-2xl font-bold text-[#1E3A8A] dark:text-[#93C5FD] mb-2">
                  {userName}
                </h4>
                <p className="text-gray-600 dark:text-gray-400 mb-1">
                  {userEmail}
                </p>
                <div className="inline-block px-3 py-1 rounded-full bg-[#1E3A8A]/10 dark:bg-[#93C5FD]/20 text-[#1E3A8A] dark:text-[#93C5FD] text-sm font-medium">
                  {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                </div>
              </div>
            </div>

            {/* Información del perfil */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-[#2A2A2A] rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Nombre completo
                </p>
                <p className="text-base font-semibold text-gray-800 dark:text-gray-200">
                  {userName}
                </p>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-[#2A2A2A] rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Correo electrónico
                </p>
                <p className="text-base font-semibold text-gray-800 dark:text-gray-200 break-all">
                  {userEmail}
                </p>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-[#2A2A2A] rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Cohorte
                </p>
                <p className="text-base font-semibold text-gray-800 dark:text-gray-200">
                  Cohorte {userCohort}
                </p>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-[#2A2A2A] rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Módulo actual
                </p>
                <p className="text-base font-semibold text-gray-800 dark:text-gray-200">
                  {userModule}
                </p>
              </div>
            </div>

            <div className="pt-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                💡 Para editar tu información de perfil, contacta con un administrador.
              </p>
            </div>
          </div>
        )}

        {activeTab === "preferencias" && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold dark:text-gray-100">
              Preferencias
            </h3>

            <section className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
              <div className="flex items-center gap-3">
                <img
                  src={theme === "dark" ? "/icons/moon.svg" : "/icons/sun.svg"}
                  alt={theme === "dark" ? "Modo oscuro" : "Modo claro"}
                  className="w-6 h-6"
                />

                <div>
                  <p className="text-gray-800 dark:text-gray-200 font-medium">
                    Tema
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {theme === "dark" ? "Oscuro" : "Claro"}
                  </p>
                </div>
              </div>

              <Button
                variant="primary"
                onClick={handleToggleTheme}
                className="text-center leading-tight sm:leading-normal"
              >
                Cambiar
              </Button>
            </section>

            <section className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
              <div className="flex items-center gap-3">
                <img
                  src={muted ? "/icons/speakerOff.png" : "/icons/speakerOn.png"}
                  alt={muted ? "Sonido desactivado" : "Sonido activado"}
                  className="w-6 h-6"
                />
                <div>
                  <p className="text-gray-800 dark:text-gray-200 font-medium">
                    Sonido
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {muted ? "Desactivado" : "Activado"}
                  </p>
                </div>
              </div>

              <Button
                variant="primary"
                onClick={handleToggleSound}
                className="text-center leading-tight sm:leading-normal"
              >
                {muted ? <>Activar</> : <>Silenciar</>}
              </Button>
            </section>
          </div>
        )}

        {activeTab === "seguridad" && (
          <MotionContainer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            <h3 className="text-xl font-semibold dark:text-gray-100">
              Cambiar contraseña
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Actualiza tu contraseña para mantener tu cuenta segura.
            </p>

            <form onSubmit={handleSubmit(onSubmitPassword)} className="space-y-4">
              {/* Contraseña actual */}
              <div>
                <label 
                  htmlFor="currentPassword" 
                  className="block text-sm font-bold text-[#111827] dark:text-gray-200 mb-2"
                >
                  Contraseña actual *
                </label>
                <Controller
                  name="currentPassword"
                  control={control}
                  rules={{ 
                    required: "La contraseña actual es requerida",
                    minLength: {
                      value: 8,
                      message: "Mínimo 8 caracteres"
                    }
                  }}
                  render={({ field }) => (
                    <input
                      {...field}
                      id="currentPassword"
                      type="password"
                      placeholder="Ingresa tu contraseña actual"
                      className="w-full rounded border border-[#111827]/40 dark:border-[#444] bg-white dark:bg-[#2A2A2A] px-3 py-2 text-sm text-[#111827] dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-[#1E3A8A] focus:outline-none focus:ring-1 focus:ring-[#1E3A8A]"
                    />
                  )}
                />
                {errors.currentPassword && (
                  <p className="mt-1 text-xs font-semibold text-[#B91C1C]">
                    {errors.currentPassword.message}
                  </p>
                )}
              </div>

              {/* Nueva contraseña */}
              <div>
                <label 
                  htmlFor="newPassword" 
                  className="block text-sm font-bold text-[#111827] dark:text-gray-200 mb-2"
                >
                  Nueva contraseña *
                </label>
                <Controller
                  name="newPassword"
                  control={control}
                  rules={{ 
                    required: "La nueva contraseña es requerida",
                    minLength: {
                      value: 8,
                      message: "La contraseña debe tener al menos 8 caracteres"
                    },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                      message: "Debe contener mayúsculas, minúsculas y números"
                    }
                  }}
                  render={({ field }) => (
                    <input
                      {...field}
                      id="newPassword"
                      type="password"
                      placeholder="Mínimo 8 caracteres"
                      className="w-full rounded border border-[#111827]/40 dark:border-[#444] bg-white dark:bg-[#2A2A2A] px-3 py-2 text-sm text-[#111827] dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-[#1E3A8A] focus:outline-none focus:ring-1 focus:ring-[#1E3A8A]"
                    />
                  )}
                />
                {errors.newPassword && (
                  <p className="mt-1 text-xs font-semibold text-[#B91C1C]">
                    {errors.newPassword.message}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Usa al menos 8 caracteres con mayúsculas, minúsculas y números.
                </p>
              </div>

              {/* Confirmar contraseña */}
              <div>
                <label 
                  htmlFor="confirmPassword" 
                  className="block text-sm font-bold text-[#111827] dark:text-gray-200 mb-2"
                >
                  Confirmar nueva contraseña *
                </label>
                <Controller
                  name="confirmPassword"
                  control={control}
                  rules={{ 
                    required: "Debes confirmar la contraseña",
                    validate: value => 
                      value === newPassword || "Las contraseñas no coinciden"
                  }}
                  render={({ field }) => (
                    <input
                      {...field}
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirma tu nueva contraseña"
                      className="w-full rounded border border-[#111827]/40 dark:border-[#444] bg-white dark:bg-[#2A2A2A] px-3 py-2 text-sm text-[#111827] dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-[#1E3A8A] focus:outline-none focus:ring-1 focus:ring-[#1E3A8A]"
                    />
                  )}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs font-semibold text-[#B91C1C]">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Botones de acción */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isUpdatingPassword}
                  className="w-full sm:w-auto"
                >
                  {isUpdatingPassword ? "Actualizando..." : "Actualizar contraseña"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => reset()}
                  disabled={isUpdatingPassword}
                  className="w-full sm:w-auto"
                >
                  Cancelar
                </Button>
              </div>
            </form>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                🔒 Consejos de seguridad
              </h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Usa una contraseña única que no uses en otros sitios</li>
                <li>• Combina letras mayúsculas, minúsculas, números y símbolos</li>
                <li>• Evita información personal fácil de adivinar</li>
                <li>• Cambia tu contraseña regularmente</li>
              </ul>
            </div>
          </MotionContainer>
        )}
      </MotionContainer>
    </>
  );

  if (withWrapper) {
    return (
      <LayoutWrapper
        className={`${baseClass} p-4 sm:p-6 min-h-screen bg-[#017F82] dark:bg-[#0F3D3F]`}
        maxWidthClass="max-w-6xl"
      >
        {content}
      </LayoutWrapper>
    );
  }

  return <div className={`${baseClass} w-full`}>{content}</div>;
};
