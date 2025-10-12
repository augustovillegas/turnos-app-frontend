import { useState, useRef, useEffect } from "react";
import { ThemeButton } from "../ui/ThemeButton";

export const SideBar = ({ items = [], onSelect, active }) => {
  const [open, setOpen] = useState(false);
  const sidebarRef = useRef(null);

  useEffect(() => {
    const handleInteraction = (e) => {
      const isOutsideSidebar =
        sidebarRef.current && !sidebarRef.current.contains(e.target);
      const isButton = e.target.closest("#sidebar-toggle-btn");

      if (e.type === "mousedown" && isOutsideSidebar && !isButton) {
        setOpen(false);
      }

      // Escape para cerrar
      if (e.type === "keydown" && e.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleInteraction);
    document.addEventListener("keydown", handleInteraction);
    return () => {
      document.removeEventListener("mousedown", handleInteraction);
      document.removeEventListener("keydown", handleInteraction);
    };
  }, []);

  return (
    <>
      {/* Botón flotante fijo */}
      <button
        id="sidebar-toggle-btn"
        onClick={() => setOpen((prev) => !prev)}
        className="fixed z-[60] top-1/2 left-0 transform -translate-y-1/2 
             bg-[#FFD700] dark:bg-[#B8860B] border-2 border-[#111827] dark:border-[#444]
             rounded-r-md shadow-md p-2 hover:opacity-90 transition-all duration-300
             flex items-center justify-center"
        aria-label={open ? "Cerrar panel" : "Abrir panel"}
      >
        <i
          className={`bi ${
            open ? "bi-layout-sidebar-inset-reverse" : "bi-layout-sidebar-inset"
          } text-lg text-black dark:text-white`}
        ></i>
      </button>

      {/* Overlay para cerrar al tocar fuera (opcional si querés mantenerlo siempre) */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setOpen(false)}
        ></div>
      )}

      {/* Sidebar deslizante SIEMPRE oculta por defecto */}
      <aside
        ref={sidebarRef}
        className={`fixed top-0 left-0 z-50 
                    w-64 h-full bg-[#C0C0C0] dark:bg-[#1A1A1A]
                    border-r-2 border-[#111827] dark:border-[#333]
                    flex flex-col transition-transform duration-300 ease-in-out
                    ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Encabezado */}
        <div className="bg-[#1E3A8A] dark:bg-[#0A2E73] text-white px-4 py-3 font-bold text-sm flex items-center gap-2">
          <img src="/icons/odbc-4.png" alt="logo" className="w-5 h-5" />
          Panel de Control
        </div>

        {/* Opciones */}
        <nav className="flex-1 flex flex-col">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onSelect(item.id);
                setOpen(false);
              }}
              className={`flex items-center gap-3 px-4 py-2 text-sm text-left 
                hover:bg-[#FFD700] dark:hover:bg-[#B8860B] hover:text-black dark:hover:text-white
                ${
                  active === item.id
                    ? "bg-[#FFD700] dark:bg-[#B8860B] text-black dark:text-white font-bold"
                    : "text-[#111827] dark:text-gray-200"
                }`}
            >
              <img src={item.icon} alt={item.label} className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Configuración / Cerrar sesión */}
        <div className="border-t-2 border-[#808080] dark:border-[#444] p-2 flex flex-col gap-1">
          <button
            onClick={() => {
              onSelect("config");
              setOpen(false);
            }}
            className={`flex items-center gap-3 px-4 py-2 text-sm text-left 
              hover:bg-[#FFD700] dark:hover:bg-[#B8860B] hover:text-black dark:hover:text-white
              ${
                active === "config"
                  ? "bg-[#FFD700] dark:bg-[#B8860B] text-black dark:text-white font-bold"
                  : "text-[#111827] dark:text-gray-200"
              }`}
          >
            <img
              src="/icons/settings_gear-2.png"
              alt="config"
              className="w-5 h-5"
            />
            Configuración
          </button>
          <button
            onClick={() => {
              onSelect("logout");
              setOpen(false);
            }}
            className="flex items-center gap-3 px-4 py-2 text-sm text-left text-[#DC2626] dark:text-[#F87171] hover:bg-[#FFD700] dark:hover:bg-[#B8860B] hover:text-black dark:hover:text-white"
          >
            <img
              src="/icons/users_key-4.png"
              alt="logout"
              className="w-5 h-5"
            />
            Cerrar sesión
          </button>
        </div>

        {/* Botón de tema */}
        <div className="border-[#808080] dark:border-[#444] p-3 flex justify-center">
          <ThemeButton />
        </div>
      </aside>
    </>
  );
};
