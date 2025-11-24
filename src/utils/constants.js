// Centralized application constants (low-risk additive)

// Map de estilos CSS (Tailwind classes) por estado normalizado.
export const STATUS_STYLES = {
  'A revisar': 'bg-[#F59E0B] text-black dark:bg-[#B45309] dark:text-white',
  Aprobado: 'bg-[#16A34A] text-white dark:bg-[#15803D]',
  Rechazado: 'bg-[#DC2626] text-white dark:bg-[#991B1B]',
  Desaprobado: 'bg-[#DC2626] text-white dark:bg-[#991B1B]',
  Solicitado: 'bg-[#3B82F6] text-white dark:bg-[#1D4ED8]',
  Disponible: 'bg-gray-200 text-black dark:bg-[#444] dark:text-gray-100',
  Pendiente: 'bg-[#F59E0B] text-black dark:bg-[#B45309] dark:text-white',
};

export const STATUS_LABELS = Object.keys(STATUS_STYLES);

export const USER_ROLES = ['Alumno','Profesor','Superadmin'];

export const DEBUG_ENABLED = import.meta?.env?.VITE_DEBUG === '1';
