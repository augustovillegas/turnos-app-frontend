import { useMemo } from 'react';
import { useAppData } from '../context/AppContext';

/** Agrupa entregas y operaciones relacionadas. */
export const useEntregasData = () => {
  const { entregas, loadEntregas, createEntrega, updateEntrega, removeEntrega } = useAppData();
  return useMemo(() => ({
    entregas,
    loadEntregas,
    createEntrega,
    updateEntrega,
    removeEntrega,
  }), [entregas, loadEntregas, createEntrega, updateEntrega, removeEntrega]);
};
