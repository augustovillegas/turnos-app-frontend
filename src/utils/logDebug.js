import { DEBUG_ENABLED } from './constants';

export const logDebug = (scope, ...data) => {
  if (!DEBUG_ENABLED) return;
  try {
    console.log(`[debug:${scope}]`, ...data);
  } catch {}
};
