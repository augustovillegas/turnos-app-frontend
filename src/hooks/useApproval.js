// === useApproval Hook ===
// Hook reutilizable para manejar aprobación/rechazo con confirmación modal.
import { useState, useCallback, useMemo } from "react";
import { useModal } from "../context/ModalContext";
import { useError } from "../context/ErrorContext";
import { showToast } from "../utils/feedback/toasts";

/**
 * Hook para gestionar aprobación/rechazo de items con confirmación.
 * 
 * @param {Object} config - Configuración del hook
 * @param {Function} config.onApprove - Función async para aprobar (recibe item)
 * @param {Function} config.onReject - Función async para rechazar (recibe item)
 * @param {Object} config.messages - Mensajes personalizados
 * @returns {Object} Métodos y estado de aprobación
 */
export const useApproval = ({
  onApprove,
  onReject,
  messages = {},
}) => {
  const [processingId, setProcessingId] = useState(null);
  const { showModal } = useModal();
  const { pushError } = useError();

  const defaultMessages = useMemo(() => ({
    approveTitle: "Aprobar",
    approveMessage: "¿Confirmar aprobación?",
    approveSuccess: "Aprobado correctamente",
    approveError: "No se pudo aprobar",
    rejectTitle: "Rechazar",
    rejectMessage: "¿Confirmar rechazo? Esta acción no se puede deshacer.",
    rejectSuccess: "Rechazado correctamente",
    rejectError: "No se pudo rechazar",
  }), []);

  const msgs = useMemo(() => ({
    ...defaultMessages,
    ...messages,
  }), [messages, defaultMessages]);

  const handleApprove = useCallback(async (item) => {
    if (!item?.id) return;

    const itemName = item.nombre || item.email || item.sala || item.fecha || "este elemento";
    
    showModal({
      type: "warning",
      title: msgs.approveTitle,
      message: msgs.approveMessage.replace("{name}", itemName),
      onConfirm: async () => {
        setProcessingId(item.id);
        try {
          await onApprove?.(item);
          showToast(msgs.approveSuccess);
        } catch (error) {
          const errorMsg = error?.message || msgs.approveError;
          showToast(errorMsg, "error");
          if (pushError) {
            pushError(msgs.approveError, {
              description: errorMsg,
            });
          }
        } finally {
          setProcessingId(null);
        }
      },
    });
  }, [onApprove, showModal, pushError, msgs]);

  const handleReject = useCallback(async (item) => {
    if (!item?.id) return;

    const itemName = item.nombre || item.email || item.sala || item.fecha || "este elemento";

    showModal({
      type: "warning",
      title: msgs.rejectTitle,
      message: msgs.rejectMessage.replace("{name}", itemName),
      onConfirm: async () => {
        setProcessingId(item.id);
        try {
          await onReject?.(item);
          showToast(msgs.rejectSuccess);
        } catch (error) {
          const errorMsg = error?.message || msgs.rejectError;
          showToast(errorMsg, "error");
          if (pushError) {
            pushError(msgs.rejectError, {
              description: errorMsg,
            });
          }
        } finally {
          setProcessingId(null);
        }
      },
    });
  }, [onReject, showModal, pushError, msgs]);

  return {
    handleApprove,
    handleReject,
    processingId,
    isProcessing: (id) => processingId === id,
  };
};
