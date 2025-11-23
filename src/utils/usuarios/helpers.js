// === Usuario Utilities ===
// Helpers específicos para lógica de usuarios
// ARQUITECTURA: Mappers y validadores extraídos de CreateUsers.jsx
// para centralización y testabilidad. Usa normalizeUsuario del módulo base.

import { ensureModuleLabel } from "../moduleMap";
import { normalizeUsuario } from "./normalizeUsuario";

const DEFAULT_COHORT = 1;
const DEFAULT_MODULE = "HTML-CSS";

/**
 * Genera un ID único para usuario temporal
 * @returns {string} ID único
 */
const generateId = () => {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return `usuario-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

/**
 * Mapea un usuario raw del backend a estructura UI consistente
 * @param {Object} entry - Usuario raw
 * @returns {Object} Usuario normalizado
 */
export const mapUsuario = (entry) => {
  const normalized = normalizeUsuario(entry) ?? {};
  const tipo = String(
    normalized.rol ?? normalized.role ?? "alumno"
  ).toLowerCase();
  return {
    id: normalized.id ?? normalized._id ?? generateId(),
    tipo,
    nombre: normalized.nombre ?? normalized.name ?? "",
    email: normalized.email ?? "",
    identificador: normalized.identificador ?? "",
    cohorte:
      normalized.cohorte ??
      normalized.cohort ??
      String(DEFAULT_COHORT),
    modulo:
      ensureModuleLabel(normalized.modulo ?? normalized.module) ??
      DEFAULT_MODULE,
    estado: normalized.estado ?? normalized.status ?? "",
  };
};

/**
 * Valida cohorte y módulo seleccionados
 * @param {string|number} cohorte - Cohorte a validar
 * @param {string} modulo - Módulo a validar
 * @returns {boolean} True si válidos
 */
export const validateSelections = (cohorte, modulo) => {
  const cohortNumber = Number.parseInt(cohorte, 10);
  if (!Number.isFinite(cohortNumber) || cohortNumber <= 0) {
    return false;
  }
  return Boolean(ensureModuleLabel(modulo));
};
