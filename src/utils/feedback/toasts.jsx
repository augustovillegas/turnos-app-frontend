/* eslint-disable react-refresh/only-export-components */
import toast, { Toaster } from "react-hot-toast";

// Íconos pixelados estilo Win98
const icons = {
  success: <img src="/icons/exito.png" alt="ok" width={18} height={18} />,
  error: <img src="/icons/error.png" alt="error" width={18} height={18} />,
  warning: <img src="/icons/advertencia.png" alt="warning" width={18} height={18} />,
  info: <span style={{ fontWeight: "bold" }}>i</span>,
};

// Estilo base con adaptación fluida y texto en una sola línea
const baseLightStyle = {
  border: "2px solid #808080",
  background: "#D4D4D4",
  color: "#111",
  fontFamily: "'VT323', monospace",
  fontSize: "clamp(0.85rem, 1vw + 0.2rem, 1.1rem)",
  padding: "clamp(6px, 1vw, 10px) clamp(12px, 2vw, 20px)",
  letterSpacing: "0.5px",
  textTransform: "uppercase",
  boxShadow: "3px 3px 0px #00000033",
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  flexWrap: "nowrap",
  gap: "clamp(6px, 1vw, 10px)",
  borderRadius: "4px",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  maxWidth: "min(80vw, 420px)", // límite visual para textos largos
};

// Variante oscura inspirada en modo “terminal”
const baseDarkStyle = {
  ...baseLightStyle,
  border: "2px solid #3a3a3a",
  background: "#181818",
  color: "#EAEAEA",
  boxShadow: "3px 3px 0px #00000088",
};

// Variantes con tonos más equilibrados
const variantLightStyle = {
  success: {
    background: "#E1F7DA",
    borderColor: "#4AAE4A",
    color: "#0C380C",
  },
  error: {
    background: "#F9D7D6",
    borderColor: "#C13C3C",
    color: "#400000",
  },
  warning: {
    background: "#FFF3CC",
    borderColor: "#C89B00",
    color: "#3A2F00",
  },
  info: {
    background: "#DCE8FA",
    borderColor: "#3C6FD1",
    color: "#122E6E",
  },
};

// Versiones oscuras con contraste y legibilidad mejorados
const variantDarkStyle = {
  success: {
    background: "#1F2F23",
    borderColor: "#32D96B",
    color: "#BFFFCB",
  },
  error: {
    background: "#2B1C1C",
    borderColor: "#E85050",
    color: "#FCA5A5",
  },
  warning: {
    background: "#2F2918",
    borderColor: "#E9B43A",
    color: "#FAE08B",
  },
  info: {
    background: "#1C2538",
    borderColor: "#4D8CF7",
    color: "#C7DFFF",
  },
};

const getIsDarkMode = () =>
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-color-scheme: dark)").matches;

const buildStyle = (type) => {
  const dark = getIsDarkMode();
  const base = dark ? baseDarkStyle : baseLightStyle;
  const variant = dark ? variantDarkStyle[type] : variantLightStyle[type];
  return {
    ...base,
    ...(variant || {}),
  };
};

// Función global para lanzar toasts
export function showToast(message, type = "info") {
  const style = buildStyle(type);
  const icon = icons[type] || icons.info;

  const options = {
    icon,
    style,
    duration: 4000,
    position: "top-right",
    className: "retro-toast",
  };

  switch (type) {
    case "success":
      toast.success(message, options);
      break;
    case "error":
      toast.error(message, options);
      break;
    case "warning":
      toast(message, options);
      break;
    case "info":
    default:
      toast(message, options);
      break;
  }
}

// Contenedor principal de toasts
export const RetroToaster = () => (
  <Toaster
    position="top-right"
    reverseOrder={false}
    toastOptions={{
      duration: 4000,
      className: "retro-toast",
    }}
    containerStyle={{
      top: "1rem",
      right: "1rem",
      zIndex: 9999,
    }}
    gutter={10}
  />
);
