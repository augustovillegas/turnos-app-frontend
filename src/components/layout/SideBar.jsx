import { useState, useRef, useEffect } from "react";
import { ThemeButton } from "../ui/ThemeButton";

export const SideBar = ({ items = [], onSelect, active }) => {
  const [abierto, establecerAbierto] = useState(false);
  const referenciaPanel = useRef(null);

  useEffect(() => {
    const manejarInteraccion = (evento) => {
      const clicFuera =
        referenciaPanel.current &&
        !referenciaPanel.current.contains(evento.target);
      const esBotonToggle = evento.target.closest("#sidebar-toggle-btn");

      if (evento.type === "mousedown" && clicFuera && !esBotonToggle) {
        establecerAbierto(false);
      }

      if (evento.type === "keydown" && evento.key === "Escape") {
        establecerAbierto(false);
      }
    };

    document.addEventListener("mousedown", manejarInteraccion);
    document.addEventListener("keydown", manejarInteraccion);
    return () => {
      document.removeEventListener("mousedown", manejarInteraccion);
      document.removeEventListener("keydown", manejarInteraccion);
    };
  }, []);

  const manejarSeleccion = (identificador) => {
    onSelect(identificador);
    establecerAbierto(false);
  };

  return (
    <>
      {/* Botón flotante tipo switch */}
      <button
        id="sidebar-toggle-btn"
        onClick={() => establecerAbierto((previo) => !previo)}
        className="fixed top-1/2 left-0 z-[60] flex -translate-y-1/2 items-center justify-center
                   rounded-r-md border-2 border-[#111827] bg-[#FFD700] p-2 shadow-md
                   hover:opacity-90 transition-all duration-300
                   dark:border-[#444] dark:bg-[#B8860B]"
        aria-label={abierto ? "Cerrar panel" : "Abrir panel"}
        aria-expanded={abierto}
        aria-controls="sidebar-panel"
      >
        <i
          className={`bi ${
            abierto
              ? "bi-layout-sidebar-inset-reverse"
              : "bi-layout-sidebar-inset"
          } text-lg text-black dark:text-white`}
        ></i>
      </button>

      {/* Overlay al abrir */}
      {abierto && (
        <div
          className="fixed inset-0 z-40 bg-black/40 transition-opacity duration-300"
          onClick={() => establecerAbierto(false)}
          aria-hidden="true"
        ></div>
      )}

      {/* Sidebar deslizable */}
      <aside
        id="sidebar-panel"
        ref={referenciaPanel}
        className={`fixed top-0 left-0 z-50 h-full w-64 
                    bg-[#C0C0C0] dark:bg-[#1A1A1A] 
                    border-r-2 border-[#111827] dark:border-[#333]
                    shadow-2xl flex flex-col
                    transition-transform duration-300 ease-in-out
                    ${abierto ? "translate-x-0" : "-translate-x-full"}`}
        role="navigation"
        aria-label="Menú lateral"
      >
        {/* Encabezado */}
        <div className="bg-[#1E3A8A] dark:bg-[#0A2E73] text-white font-bold text-sm flex items-center gap-2 px-4 py-3">
          <img src="/icons/odbc-4.png" alt="logo" className="w-5 h-5" />
          Panel de Control
        </div>

        {/* Opciones */}
        <nav className="flex-1 flex flex-col" aria-label="Secciones del panel">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => manejarSeleccion(item.id)}
              className={`flex items-center gap-3 px-4 py-2 text-sm text-left 
                        hover:bg-[#FFD700] hover:text-black 
                        dark:hover:bg-[#B8860B] dark:hover:text-white
                        ${
                          active === item.id
                            ? "bg-[#FFD700] text-black dark:bg-[#B8860B] dark:text-white font-bold"
                            : "text-[#111827] dark:text-gray-200"
                        }`}
              aria-current={active === item.id ? "page" : undefined}
            >
              <img src={item.icon} alt={item.label} className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Configuración / Cerrar sesión */}
        <div className="border-t-2 border-[#808080] dark:border-[#444] p-2 flex flex-col gap-1">
          <button
            onClick={() => manejarSeleccion("config")}
            className={`flex items-center gap-3 px-4 py-2 text-sm text-left
                      hover:bg-[#FFD700] hover:text-black
                      dark:hover:bg-[#B8860B] dark:hover:text-white
                      ${
                        active === "config"
                          ? "bg-[#FFD700] text-black dark:bg-[#B8860B] dark:text-white font-bold"
                          : "text-[#111827] dark:text-gray-200"
                      }`}
            aria-current={active === "config" ? "page" : undefined}
          >
            <img
              src="/icons/settings_gear-2.png"
              alt="Configuración"
              className="w-5 h-5"
            />
            Configuración
          </button>
          <button
            onClick={() => manejarSeleccion("cerrar-sesion")}
            className="flex items-center gap-3 px-4 py-2 text-sm text-left
                      text-[#DC2626] dark:text-[#F87171]
                      hover:bg-[#FFD700] hover:text-black
                      dark:hover:bg-[#B8860B] dark:hover:text-white"
          >
            <img
              src="/icons/users_key-4.png"
              alt="Cerrar sesión"
              className="w-5 h-5"
            />
            Cerrar sesión
          </button>
        </div>

        {/* Botón de tema */}
        <div className="border-t border-[#808080] dark:border-[#444] p-3 flex justify-center">
          <ThemeButton />
        </div>
      </aside>
    </>
  );
};
