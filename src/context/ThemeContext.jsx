/* eslint-disable react-refresh/only-export-components */
// === Theme Context ===
// Controla la clase dark en <html> y guarda la preferencia del usuario.
import {
  createContext,
  useContext,
  useLayoutEffect,
  useEffect,
  useCallback,
} from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";

const ThemeContext = createContext();

const systemPreference = () => {
  if (typeof window === "undefined") return "light";
  if (typeof window.matchMedia !== "function") return "light";
  try {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  } catch {
    return "light";
  }
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useLocalStorage("theme", systemPreference());

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === "light" ? "dark" : "light"));
  }, [setTheme]);

  // --- Aplica el tema antes del primer paint para evitar flicker ---
  useLayoutEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [theme]);

  // --- Si no hay preferencia guardada, consulta la del sistema ---
  useEffect(() => {
    if (!localStorage.getItem("theme")) {
      setTheme(systemPreference());
    }
  }, [setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
