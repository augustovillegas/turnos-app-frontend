// === ErrorContext (Windows 98 look) ===
/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { showToast } from "../utils/feedback/toasts"; // ⬅️ añadido

const ErrorContext = createContext(undefined);

let idSeq = 0;
const nextId = () => {
  idSeq += 1;
  return idSeq;
};

const WIN98_BORDER =
  "border-2 border-t-white border-l-white border-b-[#808080] border-r-[#808080]";
const WIN98_BTN =
  "px-3 py-1 bg-[#D3D3D3] " +
  WIN98_BORDER +
  " active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white";

export const ErrorProvider = ({
  children,
  autoDismissMs = 6000,
  maxStack = 3,
}) => {
  const [items, setItems] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    if (timers.current[id]) {
      clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
    setItems((prev) => prev.filter((it) => it.id !== id));
  }, []);

  // --- Función base para crear mensajes ---
  const pushBase = useCallback(
    (level, message, options = {}) => {
      const id = nextId();
      const payload = {
        id,
        level,
        title:
          options.title ??
          (level === "error"
            ? "Error"
            : level === "warning"
            ? "Advertencia"
            : "Información"),
        message: typeof message === "string" ? message : JSON.stringify(message),
        ts: Date.now(),
        sticky: Boolean(options.sticky),
      };

      setItems((prev) => [payload, ...prev].slice(0, maxStack));

      // --- Dispara toast global según el nivel ---
      try {
        switch (level) {
          case "error":
            showToast(payload.message, "error");
            break;
          case "warning":
            showToast(payload.message, "warning");
            break;
          case "info":
          default:
            showToast(payload.message, "info");
            break;
        }
      } catch {
        // Toast fallback error - silent fail
      }

      // --- Autodescarta mensajes no sticky ---
      if (!payload.sticky && autoDismissMs > 0) {
        timers.current[id] = setTimeout(() => {
          setItems((prev) => prev.filter((it) => it.id !== id));
        }, autoDismissMs);
      }

      return id;
    },
    [autoDismissMs, maxStack]
  );

  const pushError = useCallback(
    (message, options) => pushBase("error", message, options),
    [pushBase]
  );

  const pushWarning = useCallback(
    (message, options) => pushBase("warning", message, options),
    [pushBase]
  );

  const pushInfo = useCallback(
    (message, options) => pushBase("info", message, options),
    [pushBase]
  );

  useEffect(
    () => () => {
      Object.values(timers.current).forEach(clearTimeout);
      timers.current = {};
    },
    []
  );

  const value = useMemo(
    () => ({
      pushError,
      pushWarning,
      pushInfo,
      dismiss,
      errors: items,
    }),
    [pushError, pushWarning, pushInfo, dismiss, items]
  );

  return (
    <ErrorContext.Provider value={value}>
      {children}
      <ErrorViewport98 items={items} onDismiss={dismiss} />
    </ErrorContext.Provider>
  );
};

export const useError = () => useContext(ErrorContext);

export const ErrorViewport98 = ({ items, onDismiss }) => {
  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3">
      {items.map((it) => (
        <div
          key={it.id}
          role="alertdialog"
          aria-live="assertive"
          aria-label={it.title}
          className={`max-w-sm w-80 bg-[#C0C0C0] text-black shadow ${WIN98_BORDER}`}
        >
          <div className="flex items-center justify-between px-2 py-1 bg-[#000080] text-white">
            <span className="text-sm font-bold">
              {it.title}{" "}
              {it.level === "error"
                ? "(X)"
                : it.level === "warning"
                ? "(!)"
                : "(i)"}
            </span>
            <button
              onClick={() => onDismiss(it.id)}
              className="text-white hover:opacity-80 focus:outline-none"
              aria-label="Cerrar"
              title="Cerrar"
              type="button"
            >
              X
            </button>
          </div>

          <div className="p-3 text-sm">{it.message}</div>

          <div className="flex justify-end gap-2 p-2">
            <button
              className={WIN98_BTN}
              onClick={() => onDismiss(it.id)}
              type="button"
            >
              OK
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

