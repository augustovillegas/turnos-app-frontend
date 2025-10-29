// === EmptyRow ===
// Componente reutilizable para mostrar un estado vacío tanto en tablas (desktop) como en tarjetas (mobile).

export const EmptyRow = ({ columns }) => (
  <tr>
    <td
      colSpan={columns?.length || 1}
      className="p-6 text-center text-sm text-gray-500 dark:text-gray-300 font-mono"
    >
      No hay registros.
    </td>
  </tr>
);

// Variante móvil (tarjetas o secciones sin tabla)
EmptyRow.Mobile = ({ message = "No hay registros." }) => (
  <div className="rounded-md border-2 border-[#111827]/30 bg-white p-6 text-center shadow-md dark:border-[#333] dark:bg-[#1E1E1E]">
    <p className="text-sm font-mono text-gray-700 dark:text-gray-300">
      {message}
    </p>
  </div>
);
