import React from "react";

export const EmptyRow = ({ columns }) => (
  <tr>
    <td
      colSpan={columns?.length || 1}
      className="p-6 text-center text-sm text-gray-100 dark:text-gray-300 font-mono"
    >
      No hay registros.
    </td>
  </tr>
);
