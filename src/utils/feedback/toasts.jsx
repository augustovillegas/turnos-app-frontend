import toast, { Toaster } from "react-hot-toast";

// Íconos pixelados estilo Win98
const icons = {
  success: <img src="/icons/exito.png" alt="ok" width={18} height={18} />,
  error: <img src="/icons/error.png" alt="error" width={18} height={18} />,
  warning: <img src="/icons/advertencia.png" alt="warning" width={18} height={18} />,
  info: <span style={{ fontWeight: "bold" }}>i</span>,
};

// Estilo base estilo Windows 98
const baseLightStyle = {
  border: "2px solid #808080",
  background: "#C0C0C0",
  color: "#000000",
  fontFamily: "'VT323', monospace",
  fontSize: "1rem",
  padding: "8px 16px",
  letterSpacing: "0.5px",
  textTransform: "uppercase",
  boxShadow: "3px 3px 0px #00000044",
  display: "flex",
  alignItems: "center",
  gap: "8px",
};

// Variante oscura inspirada en modo “terminal”
const baseDarkStyle = {
  ...baseLightStyle,
  border: "2px solid #404040",
  background: "#1C1C1C",
  color: "#E0E0E0",
  boxShadow: "3px 3px 0px #000000aa",
};

// Variantes tipo alerta — Win98 con tonos pastel/grisáceos
const variantLightStyle = {
  success: {
    background: "#DFFFD6",
    borderColor: "#008000",
    color: "#003300",
  },
  error: {
    background: "#FFD6D6",
    borderColor: "#CC0000",
    color: "#330000",
  },
  warning: {
    background: "#FFF6CC",
    borderColor: "#C09000",
    color: "#332800",
  },
  info: {
    background: "#D6E6FF",
    borderColor: "#000080",
    color: "#000040",
  },
};

// Versiones oscuras con contraste ajustado
const variantDarkStyle = {
  success: {
    background: "#1E2E1E",
    borderColor: "#00FF66",
    color: "#BBF7D0",
  },
  error: {
    background: "#2E1E1E",
    borderColor: "#FF4D4D",
    color: "#FECACA",
  },
  warning: {
    background: "#2E2A1E",
    borderColor: "#F5C542",
    color: "#FDE68A",
  },
  info: {
    background: "#1E263A",
    borderColor: "#66A3FF",
    color: "#BFDBFE",
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
