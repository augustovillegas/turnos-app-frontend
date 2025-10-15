// === Providers compartidos ===
// Composición de Auth, Theme y App data para que el arbol tenga contexto listo.
import React from "react";
import { AuthProvider } from "./AuthContext";
import { AppProvider } from "./AppContext";
import { ThemeProvider } from "./ThemeContext";

// Envuelve ambos contextos, para mantener un punto de entrada limpio.
export const AppProviders = ({ children }) => (
  <AuthProvider>
    <ThemeProvider>
      <AppProvider>{children}</AppProvider>
    </ThemeProvider>
  </AuthProvider>
);
