// Module mapping helpers aligned with backend utils/moduleMap.mjs
const MODULE_LABELS = Object.freeze({
  1: "HTML-CSS",
  2: "JAVASCRIPT",
  3: "BACKEND - NODE JS",
  4: "FRONTEND - REACT",
});

const normalizeLabelKey = (value) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const collapsedHyphen = trimmed.replace(/\s*-\s*/g, "-");
  return collapsedHyphen.replace(/[_\s]+/g, "-").replace(/-{2,}/g, "-").toUpperCase();
};

const NUMBER_TO_LABEL = Object.freeze({ ...MODULE_LABELS });
const NORMALIZED_LABEL_TO_LABEL = Object.freeze(
  Object.values(MODULE_LABELS).reduce((acc, label) => {
    const normalized = normalizeLabelKey(label);
    if (normalized) {
      acc[normalized] = label;
    }
    return acc;
  }, {})
);
const LABEL_TO_NUMBER = Object.freeze(
  Object.entries(MODULE_LABELS).reduce((acc, [num, label]) => {
    acc[label] = Number(num);
    return acc;
  }, {})
);

export const moduleToLabel = (value) => {
  if (value == null) return null;
  const numeric = Number(String(value).trim());
  if (Number.isFinite(numeric)) {
    const normalized = Math.trunc(numeric);
    return NUMBER_TO_LABEL[normalized] ?? null;
  }
  const normalizedLabel = normalizeLabelKey(String(value));
  if (!normalizedLabel) return null;
  return NORMALIZED_LABEL_TO_LABEL[normalizedLabel] ?? null;
};

export const ensureModuleLabel = moduleToLabel;

export const labelToModule = (value) => {
  if (value == null) return null;
  const numericCandidate = Number(String(value).trim());
  if (Number.isFinite(numericCandidate) && NUMBER_TO_LABEL[Math.trunc(numericCandidate)]) {
    return Math.trunc(numericCandidate);
  }
  const label = ensureModuleLabel(value);
  if (!label) return null;
  return LABEL_TO_NUMBER[label] ?? null;
};

export const matchesModule = (value, targetLabel) => {
  const target = ensureModuleLabel(targetLabel);
  if (!target) return false;
  const candidate = ensureModuleLabel(value);
  return candidate ? candidate === target : false;
};

/**
 * Verifica si un objeto coincide con un módulo/cohorte específico.
 * Utilizado para filtrar datos por módulo en dashboards de profesor/alumno.
 * 
 * @param {Object} obj - Objeto a verificar
 * @param {string|null} moduloEtiqueta - Etiqueta del módulo (ej: "JAVASCRIPT")
 * @param {number|null} cohortAsignado - Número de cohorte
 * @returns {boolean} True si coincide
 */
export const coincideModulo = (obj, moduloEtiqueta, cohortAsignado) => {
  if (!obj || typeof obj !== "object") return false;
  if (!moduloEtiqueta && cohortAsignado == null) return true;

  const normalizeScalar = (valor) => {
    if (valor == null) return null;
    const texto = String(valor).trim();
    return texto.length ? texto : null;
  };

  const campos = [
    normalizeScalar(obj?.modulo),
    normalizeScalar(obj?.module),
    normalizeScalar(obj?.moduloSlug),
    normalizeScalar(obj?.moduleCode),
    normalizeScalar(obj?.moduleNumber),
    normalizeScalar(obj?.cohort),
    normalizeScalar(obj?.cohorte),
    normalizeScalar(obj?.cohortId),
    obj?.moduloId,
    normalizeScalar(obj?.datos?.modulo),
    normalizeScalar(obj?.datos?.module),
    normalizeScalar(obj?.datos?.moduloSlug),
    normalizeScalar(obj?.datos?.moduleCode),
    normalizeScalar(obj?.datos?.moduleNumber),
    normalizeScalar(obj?.datos?.cohort),
  ];

  const cohortes = [
    normalizeScalar(obj?.cohort),
    normalizeScalar(obj?.cohorte),
    normalizeScalar(obj?.cohortId),
    normalizeScalar(obj?.datos?.cohort),
  ];

  const hasModuleMeta = campos.some((valor) => valor != null);
  const hasCohortMeta = cohortes.some((valor) => {
    if (valor == null) return false;
    const numero = Number(valor);
    if (Number.isFinite(numero)) return numero > 0;
    const normalizado = labelToModule(valor);
    return normalizado != null;
  });
  const hasMetaInfo = hasModuleMeta || hasCohortMeta;

  // Verificar coincidencia por etiqueta de módulo
  if (moduloEtiqueta && campos.some((valor) => matchesModule(valor, moduloEtiqueta))) {
    return true;
  }

  // Verificar coincidencia por número de cohorte
  if (cohortAsignado != null) {
    const matchesCohort = cohortes.some((valor) => {
      if (valor == null) return false;
      const numero = Number(valor);
      if (Number.isFinite(numero) && numero > 0) {
        return Math.trunc(numero) === cohortAsignado;
      }
      const normalizado = labelToModule(valor);
      return normalizado != null && normalizado === cohortAsignado;
    });
    if (matchesCohort) return true;
  }

  // Si el slot no trae metadatos de modulo/cohorte, no filtrar para evitar descartes
  if (!hasMetaInfo) return true;

  return false;
};

export const MODULE_OPTIONS = Object.freeze(
  Object.entries(NUMBER_TO_LABEL).map(([moduleNumber, label]) => ({
    value: Number(moduleNumber),
    label,
  }))
);

export { MODULE_LABELS };
