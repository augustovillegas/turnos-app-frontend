import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeButton } from "../ui/ThemeButton";

export const Footer = () => {
  const [open, setOpen] = useState(false);
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

  return (
    <footer
      className="
        fixed bottom-0 left-0 w-full h-10 z-50
        bg-[#C0C0C0] dark:bg-[#1E1E1E]
        flex items-center justify-between px-2
        border-t border-[#808080] dark:border-[#444]
        text-sm font-sans transition-colors duration-300
      "
    >
      <div className="relative flex items-center gap-2" ref={menuRef}>
        <button
          onClick={() => setOpen(!open)}
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
                     dark:active:border-b-[#666] dark:active:border-r-[#666]
                     transition-all"
        >
          <span className="font-bold text-[#111827] dark:text-gray-200">
            Inicio
          </span>
        </button>

        {open && (
          <div className="absolute bottom-10 left-0 w-48 bg-[#E5E5E5] dark:bg-[#2A2A2A] border-2 border-[#111827] dark:border-[#555] shadow-lg rounded-md overflow-hidden animate-fadeIn">
            <div className="bg-[#1E3A8A] dark:bg-[#0A2E73] text-white px-3 py-1 font-bold text-sm">
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
                    className="block w-full text-left px-4 py-2 text-[#111827] dark:text-gray-200 hover:bg-[#FFD700] dark:hover:bg-[#B8860B] hover:text-black dark:hover:text-white transition"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
              <li className="border-t border-[#808080] dark:border-[#444]">
                <div className="p-2 flex justify-center items-center gap-3">
                  <ThemeButton />
                </div>
              </li>
            </ul>
          </div>
        )}
      </div>

      <div
        className="flex items-center gap-4 px-3 py-1 mr-1
             bg-[#e5e5e570] dark:bg-[#2b2b2b] border-2 
             border-t-[#808080] dark:border-t-[#444] 
             border-l-[#808080] dark:border-l-[#444] 
             border-b-white dark:border-b-[#222] 
             border-r-white dark:border-r-[#222]
             text-[#111827] dark:text-gray-300 transition-colors duration-300"
      >
        <a
          className="text-xs text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300"
          href="https://www.linkedin.com/in/augustovillegas/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Dev. Augusto Villegas
        </a>
      </div>
    </footer>
  );
};
