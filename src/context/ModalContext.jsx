import { createContext, useContext, useState, useCallback } from "react";
import { Modal } from "../components/ui/Modal"; // Ajustar path según tu estructura

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
  const [modalData, setModalData] = useState({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
    onConfirm: null,
    onClose: null,
    children: null,
  });

  const showModal = useCallback(
    ({ type = "info", title = "", message = "", onConfirm, onClose, children }) => {
      setModalData({
        isOpen: true,
        type,
        title,
        message,
        onConfirm,
        onClose,
        children,
      });
    },
    []
  );

  const closeModal = useCallback(() => {
    setModalData((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const handleConfirm = useCallback(() => {
    if (modalData.onConfirm) modalData.onConfirm();
    closeModal();
  }, [modalData, closeModal]);

  return (
    <ModalContext.Provider value={{ showModal, closeModal }}>
      {children}
      {modalData.isOpen && (
        <Modal
          title={modalData.title}
          message={modalData.message}
          type={modalData.type}
          onConfirm={handleConfirm}
          onClose={modalData.onClose || closeModal}
        >
          {modalData.children}
        </Modal>
      )}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal debe usarse dentro de un ModalProvider");
  }
  return context;
};
