import { STATUS_STYLES } from "../../utils/constants";

const STATUS_MAP = {
  desaprobado: "Desaprobado",
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
  return (
    <span
      role="status"
      aria-live="polite"
      className={`px-4 py-1 rounded text-xs font-bold border-2 border-[#111827] dark:border-[#333] shadow-sm 
                  transition-all duration-500 ease-in-out transform hover:scale-105  
                  ${STATUS_STYLES[normalized] || "bg-gray-300 text-black dark:bg-[#333] dark:text-gray-200"}`}
    >
      {normalized}
    </span>
  );
};

