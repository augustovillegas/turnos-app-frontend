import { useState } from "react";

export const NavBar = () => {
  const [open, setOpen] = useState(false);

  const navItems = [
    {
      id: 1,
      label: "Iniciar Sesión",
      href: "/login",
      icon: "bi-box-arrow-in-right",
    },
    { id: 2, label: "Registrarme", href: "/registro", icon: "bi-person-plus" },
    { id: 3, label: "Contacto", href: "#contacto", icon: "bi-envelope" },
  ];

  return (
    <>
      // Desktop menu
      <nav className="hidden md:flex gap-6">
        {navItems.map((item) => (
          <a
            key={item.id}
            href={item.href}
            className="flex items-center gap-2 hover:text-[#FFD700] transition"
          >
            <i className={`bi ${item.icon}`}></i>
            <span>{item.label}</span>
          </a>
        ))}
      </nav>
      // Mobile hamburger
      <div className="md:hidden relative">
        <button
          className={`bg-[#E5E5E5] border-2 border-[#111827] px-2 py-1 flex items-center gap-2 shadow-sm 
                     active:border-t-white active:border-l-white active:border-b-[#111827] active:border-r-[#111827]`}
          onClick={() => setOpen(!open)}
        >
          <i className="bi bi-list text-black text-lg"></i>
        </button>
        // Dropdown estilo ventana retro
        {open && (
          <div className="absolute right-0 mt-2 w-56 border-2 border-[#111827] bg-[#E5E5E5] shadow-lg rounded overflow-hidden z-50">
            // Barra de título retro
            <div className="bg-[#1E3A8A] text-white px-3 py-1 text-left text-sm font-bold">
              Menú
            </div>
            //Items
            <div className="flex flex-col">
              {navItems.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  className="px-4 py-2 flex items-center gap-2 text-[#111827] hover:bg-[#FFD700] hover:text-black transition"
                  onClick={() => setOpen(false)}
                >
                  <i className={`bi ${item.icon}`}></i>
                  <span>{item.label}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};
