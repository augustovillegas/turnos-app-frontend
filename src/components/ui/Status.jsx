export const Status = ({ status }) => {
  const styles = {
    Aprobado: "bg-[#16A34A] text-white dark:bg-[#15803D]",
    Desaprobado: "bg-[#DC2626] text-white dark:bg-[#991B1B]",
    Rechazado: "bg-[#DC2626] text-white dark:bg-[#991B1B]",
    "A revisar": "bg-[#F59E0B] text-black dark:bg-[#B45309] dark:text-white",
    Solicitado: "bg-[#3B82F6] text-white dark:bg-[#1D4ED8]",
    Disponible: "bg-gray-200 text-black dark:bg-[#444] dark:text-gray-100",
  };

  return (
    <span
      role="status"
      aria-live="polite"
      className={`px-4 py-1 rounded text-xs font-bold border-2 border-[#111827] dark:border-[#333] shadow-sm 
                  transition-all duration-500 ease-in-out transform hover:scale-105  
                  ${styles[status] || "bg-gray-300 text-black dark:bg-[#333] dark:text-gray-200"}`}
    >
      {status}
    </span>
  );
};



