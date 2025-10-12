export const Modal = ({
  title = "¿Estás seguro que deseas realizar esta acción?",
  message = "Esta operación no se puede deshacer.",
  children,
  onClose,
  onConfirm,
}) => {
  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    else if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#E5E5E5] dark:bg-[#1E1E1E] border-2 border-[#111827] dark:border-[#333] p-6 rounded-md w-96 shadow-xl transition-colors duration-300">
        {/* Encabezado con icono de advertencia */}
        <div className="flex items-start gap-3 mb-4">
          <img
            src="/icons/msg_warning-0.png"
            alt="Advertencia"
            className="w-10 h-10 mt-1"
          />
          <div>
            <h3 className="font-bold text-[#1E3A8A] dark:text-[#93C5FD] text-lg mb-1 transition-colors duration-300">
              {title}
            </h3>
            <p className="text-[#111827] dark:text-gray-300 text-sm">
              {message}
            </p>
          </div>
        </div>

        {/* Contenido adicional (si se pasa como children) */}
        {children && (
          <div className="dark:text-gray-200 text-[#111827] mb-4">
            {children}
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex justify-end mt-4 space-x-4">
          <button
            onClick={onClose}
            className="bg-[#DC2626] dark:bg-[#991B1B] text-white px-3 py-1 rounded border-2 border-[#111827] dark:border-[#555] hover:opacity-90 shadow-md transition-colors duration-300"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className="bg-[#FFD700] dark:bg-[#C9A300] text-black dark:text-white px-3 py-1 rounded border-2 border-[#111827] dark:border-[#555] hover:opacity-90 shadow-md transition-colors duration-300"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};




