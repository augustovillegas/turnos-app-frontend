import { useMemo } from 'react';
import { useAppData } from '../context/AppContext';

/**
 * Hook de conveniencia para acceder y operar sobre turnos.
 * Retorna datos y acciones agrupadas sin modificar contratos existentes.
 */
export const useTurnosData = () => {
  const {
    turnos,
    loadTurnos,
    solicitarTurno,
    cancelarTurno,
    createTurno,
    updateTurno,
    removeTurno,
    findTurnoById,
  } = useAppData();

  return useMemo(() => ({
    turnos,
    loadTurnos,
    solicitarTurno,
    cancelarTurno,
    createTurno,
    updateTurno,
    removeTurno,
    findTurnoById,
  }), [turnos, loadTurnos, solicitarTurno, cancelarTurno, createTurno, updateTurno, removeTurno, findTurnoById]);
};
