import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "./Button";

/**
 * DropdownActions — Menú contextual retro coherente con el Dashboard
 * - Usa Button para coherencia visual
 * - Darkmode inline (clase "dark" en <html>)
 * - Renderiza el menú en portal para evitar recortes/scroll de la tabla
 * - FIX: clicks dentro del menú ya no se consideran "outside click"
 */

export const DropdownActions = ({ options = [], align = "right" }) => {
  const [open, setOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const buttonRef = useRef(null);   // ref del botón/trigger
  const menuRef = useRef(null);     // ref del menú (en el portal)

  // Cerrar al hacer click fuera (pero ignorar clicks dentro del botón o del menú)
  useEffect(() => {
    const handlePointerDown = (e) => {
      const btn = buttonRef.current;
      const menu = menuRef.current;
      if (btn && btn.contains(e.target)) return;   // clic sobre el trigger
      if (menu && menu.contains(e.target)) return; // clic dentro del menú
      setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown, true);
    document.addEventListener("touchstart", handlePointerDown, true);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown, true);
      document.removeEventListener("touchstart", handlePointerDown, true);
    };
  }, []);

  // Detectar si conviene abrir hacia arriba
  useEffect(() => {
    if (!open || !buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const distanceFromBottom = window.innerHeight - rect.bottom;
    setOpenUpward(distanceFromBottom < 150);
  }, [open]);

  // Paleta
  const colors = {
    light: {
      background: "#E5E5E5",
      border: "#111827",
      text: "#111827",
      hoverBg: "#D0D0D0",
      shadow: "#00000033",
      danger: "#B22222",
      groupHeader: "#1E3A8A",
    },
    dark: {
      background: "#1E1E1E",
      border: "#444",
      text: "#E0E0E0",
      hoverBg: "#2A2A2A",
      shadow: "#00000088",
      danger: "#FF6B6B",
      groupHeader: "#93C5FD",
    },
  };

  const isDark =
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark");
  const theme = isDark ? colors.dark : colors.light;

  const handleItemClick = (item) => {
    if (!item.disabled) {
      item.onClick?.();
      setOpen(false);
    }
  };

  const renderItems = (opts) =>
    opts.map((item, i) => {
      if (item.divider) {
        return (
          <li
            key={`divider-${i}`}
            style={{
              borderTop: `1px solid ${theme.border}`,
              margin: "4px 0",
              opacity: 0.6,
            }}
          />
        );
      }
      const disabled = item.disabled;
      return (
        <li
          key={`opt-${i}`}
          onClick={() => handleItemClick(item)}
          onMouseEnter={(e) =>
            !disabled && (e.currentTarget.style.background = theme.hoverBg)
          }
          onMouseLeave={(e) =>
            !disabled && (e.currentTarget.style.background = theme.background)
          }
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "5px 12px",
            cursor: disabled ? "not-allowed" : "pointer",
            color: disabled ? "#888" : item.danger ? theme.danger : theme.text,
            fontWeight: item.danger ? "bold" : "normal",
            transition: "background 0.15s ease",
            whiteSpace: "nowrap",
            opacity: disabled ? 0.6 : 1,
          }}
        >
          {item.icon && (
            <img
              src={item.icon}
              alt=""
              style={{ width: "16px", height: "16px", opacity: disabled ? 0.3 : 0.9 }}
            />
          )}
          {item.label}
        </li>
      );
    });

  // Menú en portal (posición calculada relativa al botón)
  const portalMenu =
    open && buttonRef.current
      ? createPortal(
          <ul
            ref={menuRef}
            style={{
              position: "fixed",
              // Posición Y: arriba o abajo según espacio
              top:
                (buttonRef.current.getBoundingClientRect().top || 0) +
                (openUpward
                  ? -5 // un pequeño offset hacia arriba; el "alto" lo maneja el flujo interno
                  : (buttonRef.current.offsetHeight || 0) + 5),
              // Posición X: alinear derecha/izquierda del botón
              left:
                (buttonRef.current.getBoundingClientRect().left || 0) +
                (align === "right"
                  ? buttonRef.current.offsetWidth - 170 // 170px ~ minWidth del menú
                  : 0),
              zIndex: 10000,
              background: theme.background,
              border: `2px solid ${theme.border}`,
              boxShadow: `3px 3px 0 ${theme.shadow}`,
              borderRadius: "4px",
              minWidth: "170px",
              padding: "4px 0",
              margin: 0,
              listStyle: "none",
              fontSize: "0.95rem",
              color: theme.text,
              animation: "fadeIn 0.15s ease-out",
              // Si abre hacia arriba, dejamos que su propio contenido crezca hacia arriba:
              transform: openUpward ? "translateY(-100%)" : "none",
            }}
          >
            {renderItems(options)}
          </ul>,
          document.body
        )
      : null;

  return (
    <div
      ref={buttonRef}
      style={{
        position: "relative",
        display: "inline-block",
        fontFamily: "'VT323', monospace",
      }}
    >
      <Button
        variant="secondary"
        className="!px-2 !py-1 !rounded-[3px] font-mono"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Menú de acciones"
      >
        ⋮
      </Button>
      {portalMenu}
    </div>
  );
};

// Animación retro (inyección única en documento)
if (
  typeof document !== "undefined" &&
  !document.getElementById("dropdown-fadein-style")
) {
  const style = document.createElement("style");
  style.id = "dropdown-fadein-style";
  style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-3px); }
    to { opacity: 1; transform: translateY(0); }
  }`;
  document.head.appendChild(style);
}

