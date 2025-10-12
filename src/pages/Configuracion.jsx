import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { Button } from "../components/ui/Button";

export const Configuracion = () => {
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("perfil");

  return (
    <div className="flex flex-col gap-6 p-6 min-h-screen bg-[#017F82] dark:bg-[#0F3D3F] transition-colors duration-300">
      <h2 className="text-3xl font-bold text-white dark:text-[#93C5FD]">
        Configuración
      </h2>

      {/* Barra de navegación interna */}
      <div className="flex flex-wrap gap-3">
        <Button
          variant={activeTab === "perfil" ? "primary" : "secondary"}
          onClick={() => setActiveTab("perfil")}
        >
          Perfil
        </Button>
        <Button
          variant={activeTab === "preferencias" ? "primary" : "secondary"}
          onClick={() => setActiveTab("preferencias")}
        >
          Preferencias
        </Button>
        <Button
          variant={activeTab === "seguridad" ? "primary" : "secondary"}
          onClick={() => setActiveTab("seguridad")}
        >
          Seguridad
        </Button>
      </div>

      {/* Sección dinámica según pestaña */}
      <div className="bg-white dark:bg-[#1E1E1E] border-2 border-[#111827] dark:border-[#333] rounded-lg p-6 shadow-md transition-colors duration-300">
        {activeTab === "perfil" && (
          <div>
            <h3 className="text-xl font-semibold mb-3 dark:text-gray-100">
              Perfil del usuario
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              Aquí podrás ver y editar tus datos personales.
            </p>
            <p className="italic text-gray-500 dark:text-gray-400 mt-2">
              (Sección en construcción)
            </p>
          </div>
        )}

        {activeTab === "preferencias" && (
          <div>
            <h3 className="text-xl font-semibold mb-3 dark:text-gray-100">
              Preferencias
            </h3>
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-700 dark:text-gray-300">
                Tema actual:
              </span>
              <span className="font-semibold capitalize dark:text-gray-100">
                {theme === "dark" ? "Oscuro" : "Claro"}
              </span>
            </div>
            <Button variant="primary" onClick={toggleTheme}>
              Cambiar tema
            </Button>
          </div>
        )}

        {activeTab === "seguridad" && (
          <div>
            <h3 className="text-xl font-semibold mb-3 dark:text-gray-100">
              Seguridad
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              Aquí podrás cambiar tu contraseña o gestionar autenticación.
            </p>
            <p className="italic text-gray-500 dark:text-gray-400 mt-2">
              (Sección en construcción)
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
