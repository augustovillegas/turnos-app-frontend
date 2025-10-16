import { useEffect, useRef } from "react";

export const Modal = ({
  title = "¿Estás seguro que deseas realizar esta acción?",
  message = "Esta operación no se puede deshacer.",
  type = "warning", // success | error | warning | info
  children,
  onClose,
  onConfirm,
}) => {
  const modalRef = useRef(null);

  // Manejo de foco al abrir
  useEffect(() => {
    if (modalRef.current) modalRef.current.focus();
  }, []);

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    else if (onClose) onClose();
  };

  // Definir ícono según tipo
  const icons = {
    success: "/icons/exito.png",
    error: "/icons/error.png",
    warning: "/icons/advertencia.png",
    info: "/icons/msg_warning-0.png",
  };

  const colors = {
    success: "bg-[#C6F6D5] dark:bg-[#14532D]",
    error: "bg-[#FEE2E2] dark:bg-[#7F1D1D]",
    warning: "bg-[#FEF3C7] dark:bg-[#78350F]",
    info: "bg-[#DBEAFE] dark:bg-[#1E3A8A]",
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className={`relative border-2 border-[#111827] dark:border-[#333] 
                    ${colors[type]} p-6 rounded-md w-96 shadow-[4px_4px_0_#808080] 
                    dark:shadow-[4px_4px_0_#222] transition-all duration-300`}
      >
        {/* Encabezado con icono */}
        <div className="flex items-start gap-3 mb-4">
          <img src={icons[type]} alt={type} className="w-10 h-10 mt-1" />
          <div>
            <h3 className="font-bold text-[#1E3A8A] dark:text-[#93C5FD] text-lg mb-1">
              {title}
            </h3>
            <p className="text-[#111827] dark:text-gray-300 text-sm">
              {message}
            </p>
          </div>
        </div>

        {children && (
          <div className="dark:text-gray-200 text-[#111827] mb-4">
            {children}
          </div>
        )}

        {/* Botones */}
        <div className="flex justify-end mt-4 space-x-3">
          <button
            onClick={onClose}
            className="bg-[#DC2626] dark:bg-[#991B1B] text-white px-3 py-1 rounded border-2 border-[#111827] dark:border-[#555] active:translate-x-[2px] active:translate-y-[2px]"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className="bg-[#FFD700] dark:bg-[#C9A300] text-black dark:text-white px-3 py-1 rounded border-2 border-[#111827] dark:border-[#555] active:translate-x-[2px] active:translate-y-[2px]"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};
