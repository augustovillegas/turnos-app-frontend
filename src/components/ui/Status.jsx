const STATUS_MAP = {
  desaprobado: "Rechazado",
  rechazado: "Rechazado",
  aprobado: "Aprobado",
  solicitado: "Solicitado",
  disponible: "Disponible",
  pendiente: "Pendiente",
  "a revisar": "A revisar",
};

const normalizeStatus = (value) => {
  if (!value && value !== 0) return "Sin estado";
  const stringValue = String(value).trim();
  if (!stringValue) return "Sin estado";
  const mapped = STATUS_MAP[stringValue.toLowerCase()];
  return mapped || stringValue;
};

export const Status = ({ status }) => {
  const normalized = normalizeStatus(status);
  const styles = {
    "A revisar": "bg-[#F59E0B] text-black dark:bg-[#B45309] dark:text-white",
    Aprobado: "bg-[#16A34A] text-white dark:bg-[#15803D]",
    Rechazado: "bg-[#DC2626] text-white dark:bg-[#991B1B]",
    Solicitado: "bg-[#3B82F6] text-white dark:bg-[#1D4ED8]",
    Disponible: "bg-gray-200 text-black dark:bg-[#444] dark:text-gray-100",
    Pendiente: "bg-[#F59E0B] text-black dark:bg-[#B45309] dark:text-white",
  };

  return (
    <span
      role="status"
      aria-live="polite"
      className={`px-4 py-1 rounded text-xs font-bold border-2 border-[#111827] dark:border-[#333] shadow-sm 
                  transition-all duration-500 ease-in-out transform hover:scale-105  
                  ${styles[normalized] || "bg-gray-300 text-black dark:bg-[#333] dark:text-gray-200"}`}
    >
      {normalized}
    </span>
  );
};

