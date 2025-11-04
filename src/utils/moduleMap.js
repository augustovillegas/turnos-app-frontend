// Module mapping helpers aligned with backend utils/moduleMap.mjs
const MODULE_LABELS = Object.freeze({
  1: "HTML-CSS",
  2: "JAVASCRIPT",
  3: "NODE",
  4: "REACT",
});

const normalizeLabelKey = (value) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.replace(/[_\s]+/g, "-").toUpperCase();
};

const LABEL_TO_MODULE = Object.freeze(
  Object.entries(MODULE_LABELS).reduce((acc, [moduleNumber, label]) => {
    acc[label] = Number(moduleNumber);
    return acc;
  }, {})
);

export const moduleToLabel = (value) => {
  if (value == null) return null;
  const numeric = Number(String(value).trim());
  if (!Number.isFinite(numeric)) return null;
  const normalized = Math.trunc(numeric);
  return MODULE_LABELS[normalized] ?? null;
};

export const labelToModule = (value) => {
  if (value == null) return null;
  const numericCandidate = Number(String(value).trim());
  if (Number.isFinite(numericCandidate) && MODULE_LABELS[Math.trunc(numericCandidate)]) {
    return Math.trunc(numericCandidate);
  }
  const normalizedLabel = normalizeLabelKey(String(value));
  if (!normalizedLabel) return null;
  return LABEL_TO_MODULE[normalizedLabel] ?? null;
};

export const ensureModuleLabel = (value) => {
  if (value == null) return null;
  const fromNumber = moduleToLabel(value);
  if (fromNumber) return fromNumber;
  const normalizedLabel = normalizeLabelKey(String(value));
  if (!normalizedLabel) return null;
  return LABEL_TO_MODULE[normalizedLabel] ? normalizedLabel : null;
};

export const matchesModule = (value, targetLabel) => {
  const target = ensureModuleLabel(targetLabel);
  if (!target) return false;
  const candidate = ensureModuleLabel(value);
  return candidate ? candidate === target : false;
};

export const MODULE_OPTIONS = Object.freeze(
  Object.entries(MODULE_LABELS).map(([moduleNumber, label]) => ({
    value: Number(moduleNumber),
    label,
  }))
);

export { MODULE_LABELS };
