// Module mapping helpers aligned with backend utils/moduleMap.mjs
const MODULE_LABELS = Object.freeze([
  "HTML-CSS",
  "JAVASCRIPT",
  "BACKEND - NODE JS",
  "FRONTEND - REACT",
]);

const normalizeLabelKey = (value) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const collapsedHyphen = trimmed.replace(/\s*-\s*/g, "-");
  return collapsedHyphen.replace(/[_\s]+/g, "-").replace(/-{2,}/g, "-").toUpperCase();
};

const NORMALIZED_LABEL_TO_LABEL = Object.freeze(
  MODULE_LABELS.reduce((acc, label) => {
    const normalized = normalizeLabelKey(label);
    if (normalized) {
      acc[normalized] = label;
    }
    return acc;
  }, {})
);
// Alias flexibles para valores comunes que llegan desde emails, slugs u otras variantes
const MODULE_ALIAS = Object.freeze({
  BACKEND: "BACKEND - NODE JS",
  "BACK-END": "BACKEND - NODE JS",
  NODE: "BACKEND - NODE JS",
  NODEJS: "BACKEND - NODE JS",
  "NODE-JS": "BACKEND - NODE JS",
  FRONTEND: "FRONTEND - REACT",
  "FRONT-END": "FRONTEND - REACT",
  REACT: "FRONTEND - REACT",
  JS: "JAVASCRIPT",
  JAVASCRIPT: "JAVASCRIPT",
  HTML: "HTML-CSS",
  CSS: "HTML-CSS",
  "HTML-CSS": "HTML-CSS",
});

export const moduleToLabel = (value) => {
  if (value == null) return null;
  const normalizedLabel = normalizeLabelKey(String(value));
  if (!normalizedLabel) return null;
  return NORMALIZED_LABEL_TO_LABEL[normalizedLabel] ?? MODULE_ALIAS[normalizedLabel] ?? null;
};

export const ensureModuleLabel = moduleToLabel;

export const matchesModule = (value, targetLabel) => {
  const target = ensureModuleLabel(targetLabel);
  if (!target) return false;
  const candidate = ensureModuleLabel(value);
  return candidate ? candidate === target : false;
};

/**
 * Verifica si un objeto coincide con un módulo específico (STRING ENUM).
 * ARQUITECTURA: El filtrado por módulo (String) es el criterio principal.
 * La cohorte (Number) es solo metadato, NO se usa para filtrado.
 * 
 * @param {Object} obj - Objeto a verificar
 * @param {string|null} moduloEtiqueta - Etiqueta del módulo (ej: "JAVASCRIPT", "HTML-CSS")
 * @returns {boolean} True si coincide
 */
export const coincideModulo = (obj, moduloEtiqueta) => {
  if (!obj || typeof obj !== "object") return false;
  if (!moduloEtiqueta) return true;

  // Buscar modulo en el objeto (prioridad: modulo explícito)
  const campos = [obj?.modulo];

  return campos.some((valor) => matchesModule(valor, moduloEtiqueta));
};

export const MODULE_OPTIONS = Object.freeze(
  MODULE_LABELS.map((label) => ({
    value: label,
    label,
  }))
);

export { MODULE_LABELS };
