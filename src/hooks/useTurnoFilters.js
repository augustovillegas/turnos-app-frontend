// === useTurnoFilters ===
// Hook compartido para filtrado de turnos por review, módulo y estado.
// ARQUITECTURA: Filtra por modulo (String enum), no por cohorte (cohorte es solo metadato)
import { useMemo, useState, useCallback } from 'react';
import { coincideModulo } from '../utils/moduleMap';

export const useTurnoFilters = ({ turnos = [], moduloEtiqueta = null }) => {
  const [filtroReview, setFiltroReview] = useState('todos');
  const [filtroEstado, setFiltroEstado] = useState(null);

  const turnosFiltrados = useMemo(() => {
    let resultado = Array.isArray(turnos) ? turnos : [];

    // Filtro por módulo STRING ENUM
    if (moduloEtiqueta) {
      resultado = resultado.filter((t) => coincideModulo(t, moduloEtiqueta));
    }

    // Filtro por review
    if (filtroReview !== 'todos') {
      const reviewNum = Number(filtroReview);
      resultado = resultado.filter((t) => t.review === reviewNum);
    }

    // Filtro por estado
    if (filtroEstado) {
      resultado = resultado.filter((t) => 
        String(t.estado || '').toLowerCase() === String(filtroEstado).toLowerCase()
      );
    }

    return resultado;
  }, [turnos, moduloEtiqueta, filtroReview, filtroEstado]);

  const resetFiltros = useCallback(() => {
    setFiltroReview('todos');
    setFiltroEstado(null);
  }, []);

  return {
    turnosFiltrados,
    filtroReview,
    setFiltroReview,
    filtroEstado,
    setFiltroEstado,
    resetFiltros,
  };
};
