// === Slots Service ===
// DEPRECADO: Funciones migradas a turnosService tras consolidación backend (Nov 2025)
// Este archivo ahora re-exporta desde turnosService para mantener compatibilidad
// Endpoints consolidados en /slots (antes /turnos duplicado fue eliminado)

export {
  getSlots,
  solicitarSlot,
  cancelarSlot,
  actualizarEstadoSlot,
} from "./turnosService";
