// === useAlumnoTurnos ===
// Encapsula lógica de solicitar y cancelar turnos para el alumno.
// Previene recreaciones de handlers y coordina estado de procesamiento.
import { useState, useCallback } from 'react';
import { isEstado } from '../utils/turnos/normalizeEstado';

export const useAlumnoTurnos = ({
  alumnoId,
  solicitarTurno,
  cancelarTurno,
  showModal,
  pushError,
  showToast,
}) => {
  const [processingTurno, setProcessingTurno] = useState(null);

  const handleSolicitarTurno = useCallback(async (turno) => {
    if (!turno || !isEstado(turno.estado, 'disponible') || !alumnoId) return;
    setProcessingTurno(turno.id);
    try {
      await solicitarTurno(turno.id);
      showToast?.('Turno solicitado correctamente', 'success');
    } catch (error) {
      pushError?.('Error al solicitar turno', { description: error.message });
    } finally {
      setProcessingTurno(null);
    }
  }, [alumnoId, solicitarTurno, pushError, showToast]);

  const handleCancelarTurno = useCallback((turno) => {
    if (!turno || !isEstado(turno.estado, 'solicitado')) return;
    showModal?.({
      type: 'warning',
      title: 'Cancelar solicitud',
      message: `¿Cancelar la solicitud para la sala ${turno.sala}?`,
      onConfirm: async () => {
        setProcessingTurno(turno.id);
        try {
          await cancelarTurno(turno.id);
          showToast?.('Solicitud cancelada', 'info');
        } catch (error) {
          pushError?.('Error al cancelar turno', { description: error.message });
        } finally {
          setProcessingTurno(null);
        }
      },
    });
  }, [cancelarTurno, showModal, pushError, showToast]);

  return { processingTurno, handleSolicitarTurno, handleCancelarTurno };
};
