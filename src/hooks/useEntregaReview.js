// === useEntregaReview ===
// Encapsula la lógica de aprobación / desaprobación de entregas.
// Maneja estado de procesamiento y exposición de handlers estables.
import { useState, useCallback } from 'react';

export const useEntregaReview = ({ updateEntrega, showToast }) => {
  const [processingEntregaId, setProcessingEntregaId] = useState(null);

  const actualizarEstado = useCallback(async (entrega, nuevoEstado) => {
    if (!entrega?.id) return;
    setProcessingEntregaId(entrega.id);
    try {
      await updateEntrega(entrega.id, { reviewStatus: nuevoEstado });
      showToast?.(
        nuevoEstado === 'Aprobado'
          ? 'Entrega aprobada correctamente.'
          : 'Entrega desaprobada.'
      );
    } catch (error) {
      showToast?.(error.message || 'No se pudo actualizar la entrega.', 'error');
    } finally {
      setProcessingEntregaId(null);
    }
  }, [updateEntrega, showToast]);

  const handleAprobarEntrega = useCallback(
    (entrega) => actualizarEstado(entrega, 'Aprobado'),
    [actualizarEstado]
  );

  const handleDesaprobarEntrega = useCallback(
    (entrega) => actualizarEstado(entrega, 'Desaprobado'),
    [actualizarEstado]
  );

  return { processingEntregaId, handleAprobarEntrega, handleDesaprobarEntrega };
};
