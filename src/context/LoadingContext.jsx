import {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
} from "react";

/**
 * Contexto global de carga para manejar múltiples recursos de forma centralizada.
 * - Permite saber qué secciones están cargando (turnos, entregas, usuarios, etc.)
 * - Compatible con loaders locales (no los reemplaza)
 * - Código simple, sin dependencias externas
 */

const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
  const countersRef = useRef({});
  const [, forceRender] = useState(0);

  const _update = (key, delta) => {
    countersRef.current[key] = Math.max(
      0,
      (countersRef.current[key] || 0) + delta
    );
    forceRender((x) => x + 1);
  };

  const start = useCallback((key) => _update(key, 1), []);
  const stop = useCallback((key) => _update(key, -1), []);
  const isLoading = useCallback(
    (key) => (countersRef.current[key] || 0) > 0,
    []
  );

  const anyLoading = Object.values(countersRef.current).some((v) => v > 0);

  const track = useCallback(
    async (key, promise) => {
      start(key);
      try {
        return await promise;
      } finally {
        stop(key);
      }
    },
    [start, stop]
  );

  return (
    <LoadingContext.Provider
      value={{ start, stop, isLoading, track, anyLoading }}
    >
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => useContext(LoadingContext);
