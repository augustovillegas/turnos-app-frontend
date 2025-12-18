// === useUsuarioValidation Hook ===
// Hook personalizado para validaciones de usuarios compartidas entre crear/editar
import { useCallback } from "react";
import { ensureModuleLabel } from "../utils/moduleMap";
import { validateSelections } from "../utils/usuarios/helpers";
import { showToast } from "../utils/feedback/toasts";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

export const useUsuarioValidation = () => {
  /**
   * Valida email único en la lista de usuarios
   * @param {string} email - Email a validar
   * @param {Array} usuarios - Lista de usuarios existentes
   * @param {string} currentUserId - ID del usuario actual (para edición)
   * @returns {boolean} True si el email es único
   */
  const validateEmailUnique = useCallback((email, usuarios = [], currentUserId = null) => {
    const emailLower = email.toLowerCase();
    return !usuarios.some((u) => {
      const isSameUser = currentUserId && (String(u.id) === String(currentUserId) || String(u._id) === String(currentUserId));
      return !isSameUser && u.email.toLowerCase() === emailLower;
    });
  }, []);

  /**
   * Valida password personalizada y su confirmación
   * @param {string} password - Password a validar
   * @param {string} confirm - Confirmación de password
   * @returns {string|null|false} Password válida, null si no se ingresó, false si es inválida
   */
  const validateCustomPassword = useCallback((password, confirm) => {
    if (!password && !confirm) return null;
    
    if (!password || !confirm) {
      showToast("Completa y confirma la password si deseas cambiarla", "error");
      return false;
    }
    
    if (password.length < 8) {
      showToast("Password mínimo 8 caracteres", "error");
      return false;
    }
    
    if (password !== confirm) {
      showToast("Las passwords no coinciden", "error");
      return false;
    }
    
    return password;
  }, []);

  /**
   * Valida formulario completo de usuario
   * @param {Object} formData - Datos del formulario
   * @param {Array} usuarios - Lista de usuarios existentes
   * @param {string} currentUserId - ID del usuario actual (para edición)
   * @returns {Object} { isValid: boolean, errors: Object }
   */
  const validateForm = useCallback((formData, usuarios = [], currentUserId = null) => {
    const errors = {};
    
    const nombre = formData.nombre?.trim() || "";
    const email = formData.email?.trim() || "";
    const identificador = formData.identificador?.trim() || "";
    const cohorteRaw = formData.cohorte?.trim() || "";
    const moduloLabel = ensureModuleLabel(formData.modulo);

    // Validar campos obligatorios
    if (!nombre) {
      errors.nombre = "Nombre es obligatorio";
      showToast("El nombre es obligatorio", "error");
    }

    if (!email) {
      errors.email = "Email es obligatorio";
      showToast("El email es obligatorio", "error");
    } else if (!EMAIL_REGEX.test(email)) {
      errors.email = "Email no válido";
      showToast("Email no válido", "error");
    } else if (!validateEmailUnique(email, usuarios, currentUserId)) {
      errors.email = "Email ya registrado";
      showToast(currentUserId ? "Email ya registrado por otro usuario" : "Email ya registrado", "error");
    }

    if (!cohorteRaw) {
      errors.cohorte = "Cohorte es obligatoria";
      showToast("La cohorte es obligatoria", "error");
    }

    if (!moduloLabel) {
      errors.modulo = "Módulo es obligatorio";
      showToast("Debes seleccionar un módulo", "error");
    }

    // Validar cohorte y módulo juntos
    if (cohorteRaw && moduloLabel && !validateSelections(cohorteRaw, moduloLabel)) {
      errors.cohorte = "Cohorte o módulo no válido";
      errors.modulo = "Cohorte o módulo no válido";
      showToast("Cohorte o módulo no válido", "error");
    }

    // Validar identificador si se proporciona
    if (identificador && identificador.length < 3) {
      errors.identificador = "Identificador debe tener al menos 3 caracteres";
      showToast("Identificador debe tener al menos 3 caracteres", "error");
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }, [validateEmailUnique]);

  return {
    validateEmailUnique,
    validateCustomPassword,
    validateForm
  };
};
