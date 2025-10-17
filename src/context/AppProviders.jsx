// === Providers compartidos ===
// Composición de Auth, Theme y App data para que el arbol tenga contexto listo.
import { AuthProvider } from "./AuthContext";
import { AppProvider } from "./AppContext";
import { ThemeProvider } from "./ThemeContext";
import { SoundProvider } from "./SoundContext";
import { ModalProvider } from "./ModalContext";
import { LoadingProvider } from "./LoadingContext";

// Envuelve ambos contextos, para mantener un punto de entrada limpio.
export const AppProviders = ({ children }) => (
  <AuthProvider>
    <ThemeProvider>
      <SoundProvider>
        <ModalProvider>
          <LoadingProvider>
            <AppProvider>{children}</AppProvider>
          </LoadingProvider>
        </ModalProvider>
      </SoundProvider>
    </ThemeProvider>
  </AuthProvider>
);
