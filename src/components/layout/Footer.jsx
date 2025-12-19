import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeButton } from "../ui/ThemeButton";
import { Window } from "../ui/Window";

export const Footer = () => {
  const [open, setOpen] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    else document.removeEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const menuItems = [
    { label: "Iniciar sesión", path: "/login" },
    { label: "Contacto", path: "/contacto" },
  ];

  const desktopShortcut = {
    label: "Landing",
    path: "/",
    icon: "/icons/escritorio.png",
  };

  const certificateShortcut = {
    label: "Certificado",
    icon: "/icons/certificado.png",
  };

  return (
    <footer
      role="contentinfo"
      aria-label="Información del sitio y navegación principal"
      className="fixed bottom-0 left-0 z-50 flex h-10 w-full items-center justify-between border-t border-[#808080] bg-[#C0C0C0] px-2 text-sm font-sans transition-colors duration-300 dark:border-[#444] dark:bg-[#1E1E1E]"
    >
      <div className="relative flex items-center gap-2" ref={menuRef}>
        <button
          onClick={() => setOpen(!open)}
          aria-haspopup="true"
          aria-expanded={open}
          aria-controls="footer-menu"
          aria-label="Abrir menú principal"
          className="flex items-center gap-2 px-3 py-1
                     bg-[#E5E5E5] dark:bg-[#2A2A2A] border-2 
                     border-t-white border-l-white 
                     border-b-[#808080] border-r-[#808080] 
                     dark:border-t-[#555] dark:border-l-[#555]
                     dark:border-b-[#222] dark:border-r-[#222]
                     cursor-pointer hover:bg-[#dcdcdc] dark:hover:bg-[#3A3A3A]
                     active:border-t-[#808080] active:border-l-[#808080] 
                     active:border-b-white active:border-r-white
                     dark:active:border-t-[#222] dark:active:border-l-[#222]
                     dark:active:border-b-[#666] dark:active-border-r-[#666]
                     transition-all"
        >
          <span className="font-bold text-[#111827] dark:text-gray-200">
            Inicio
          </span>
        </button>

        {/* Separador estilo Win98 */}
        <div className="h-6 w-[2px] bg-[#808080] shadow-[1px_0_0_#fff]" aria-hidden="true" />

        {/* Acceso rápido a landing */}
        <button
          onClick={() => navigate(desktopShortcut.path)}
          aria-label="Ir a la landing"
          className="flex items-center gap-1 px-1 py-1 bg-transparent border-none hover:bg-[#dcdcdc] dark:hover:bg-[#3A3A3A] focus:outline-none focus:ring-2 focus:ring-[#FFD700] transition-all"
        >
          <img
            src={desktopShortcut.icon}
            alt="Landing"
            className="h-6 w-6 [image-rendering:pixelated]"
          />
        </button>

        {/* Acceso rápido a certificado (misma estética que escritorio) */}
        <button
          onClick={() => setShowCertificate(true)}
          aria-label="Ver certificado del proyecto"
          className="flex items-center gap-1 px-1 py-1 bg-transparent border-none hover:bg-[#dcdcdc] dark:hover:bg-[#3A3A3A] focus:outline-none focus:ring-2 focus:ring-[#FFD700] transition-all"
        >
          <img
            src={certificateShortcut.icon}
            alt="Certificado"
            className="h-6 w-6 [image-rendering:pixelated]"
          />
        </button>

        {open && (
          <div
            id="footer-menu"
            className="absolute bottom-10 left-0 w-48 overflow-hidden rounded-md border-2 border-[#111827] bg-[#E5E5E5] shadow-lg animate-fadeIn dark:border-[#555] dark:bg-[#2A2A2A]"
          >
            <div className="bg-[#1E3A8A] px-3 py-1 text-sm font-bold text-white dark:bg-[#0A2E73]">
              Menú
            </div>
            <ul className="flex flex-col">
              {menuItems.map((item) => (
                <li key={item.label}>
                  <button
                    onClick={() => {
                      navigate(item.path);
                      setOpen(false);
                    }}
                    className="block w-full px-4 py-2 text-left text-[#111827] hover:bg-[#FFD700] hover:text-black transition dark:text-gray-200 dark:hover:bg-[#B8860B] dark:hover:text-white"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
              <li className="border-t border-[#808080] dark:border-[#444]">
                <div className="flex items-center justify-center gap-3 p-2">
                  <ThemeButton />
                </div>
              </li>
            </ul>
          </div>
        )}
      </div>

      <div
        className="mr-1 flex items-center gap-4 px-3 py-1 border-2 border-t-[#808080] border-l-[#808080] border-b-white border-r-white bg-[#e5e5e570] text-[#111827] transition-colors duration-300 dark:border-t-[#444] dark:border-l-[#444] dark:border-b-[#222] dark:border-r-[#222] dark:bg-[#2b2b2b] dark:text-gray-300"
      >
        <a
          className="text-xs text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          href="https://www.linkedin.com/in/augustovillegas/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Desarrollador Augusto Villegas en LinkedIn (abre en una nueva pestaña)"
        >
          Dev. Augusto Villegas
        </a>
      </div>

      {showCertificate && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg">
            <Window title="Certificado del Proyecto">
              <p className="text-center text-sm leading-relaxed text-[#0f172a] dark:text-gray-200">
                Este proyecto fue desarrollado como entrega final de la Diplomatura Full Stack en
                Desarrollo Web de la Universidad Nacional de Catamarca, integrando los conocimientos
                y prácticas adquiridas a lo largo de la cursada.
              </p>
              <div className="mt-4 flex justify-center">
                <button
                  type="button"
                  onClick={() => setShowCertificate(false)}
                  className="rounded-md border-2 border-[#111827] bg-[#FFD700] px-4 py-1 text-sm font-semibold text-[#111827] shadow-[3px_3px_0_#111827] hover:-translate-y-0.5 dark:border-[#0f172a]"
                >
                  Cerrar
                </button>
              </div>
            </Window>
          </div>
        </div>
      )}
    </footer>
  );
};
