import { AppProvider } from "./AppContext";
import { ThemeProvider } from "./ThemeContext";

// Envuelve ambos contextos, para mantener un punto de entrada limpio.
export const AppProviders = ({ children }) => (
  <ThemeProvider>
    <AppProvider>{children}</AppProvider>
  </ThemeProvider>
);
