/**
 * Componente ventana retro-estilizada
 * Props:
 * - title: título de la ventana
 * - icon: clase Bootstrap Icon opcional (ej. "bi-calendar-check")
 * - children: contenido interno
 */

export const Window = ({ title, icon, image, children }) => {
  return (
    <div className="border-2 border-[#111827] dark:border-[#333] shadow-lg bg-white dark:bg-[#1E1E1E] rounded overflow-hidden min-h-[250px] transition-colors duration-300">
      {/* Barra de título */}
      <div className="bg-[#1E3A8A] dark:bg-[#0A2E73] text-white flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-2">
          {icon && <i className={`bi ${icon} text-lg`}></i>}
          <span className="font-bold text-lg">{title}</span>
        </div>
        <div className="flex gap-1">
          <div className="w-3 h-3 bg-gray-200 dark:bg-gray-500 border border-white dark:border-[#777]"></div>
          <div className="w-3 h-3 bg-gray-200 dark:bg-gray-500 border border-white dark:border-[#777]"></div>
          <div className="w-3 h-3 bg-gray-200 dark:bg-gray-500 border border-white dark:border-[#777]"></div>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-6 text-left flex flex-col items-center text-[#111827] dark:text-gray-200 transition-colors duration-300">
        {image && (
          <img
            src={image}
            alt={title}
            className="w-16 h-16 mb-4 object-contain"
          />
        )}
        {children}
      </div>
    </div>
  );
};



