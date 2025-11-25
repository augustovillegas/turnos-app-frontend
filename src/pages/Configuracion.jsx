import { useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import { useSound } from "../context/SoundContext";
import { showToast } from "../utils/feedback/toasts";
import { Button } from "../components/ui/Button";
import { LayoutWrapper } from "../components/layout/LayoutWrapper";

const MotionContainer = motion.div;

export const Configuracion = ({ withWrapper = true }) => {
  const { theme, toggleTheme } = useTheme();
  const { muted, toggleMute } = useSound();
  const [activeTab, setActiveTab] = useState("perfil");

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "preferencias") {
      showToast("Personaliza tu experiencia desde aqui.", "info");
    } else {
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
          <div>
            <h3 className="text-xl font-semibold mb-3 dark:text-gray-100">
              Perfil del usuario
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              Aqui podras ver y editar tus datos personales.
            </p>
            <p className="italic text-gray-500 dark:text-gray-400 mt-2">
              (Seccion en construccion)
            </p>
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
          >
            <h3 className="text-xl font-semibold mb-3 dark:text-gray-100">
              Seguridad
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              Aqui podras cambiar tu contraseña o gestionar autenticacion.
            </p>
            <p className="italic text-gray-500 dark:text-gray-400 mt-2">
              (Seccion en construccion)
            </p>
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
