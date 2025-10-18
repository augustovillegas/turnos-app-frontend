// === Providers compartidos ===
// Composición de Auth, Theme y App data para que el arbol tenga contexto listo.
import { AuthProvider } from "./AuthContext";
import { AppProvider } from "./AppContext";
import { ThemeProvider } from "./ThemeContext";
import { SoundProvider } from "./SoundContext";
import { ModalProvider } from "./ModalContext";
import { LoadingProvider } from "./LoadingContext";
import { ErrorProvider } from "./ErrorContext";

// Se mantiene el orden original de providers y se agrega ErrorProvider junto a AppProvider.
export const AppProviders = ({ children }) => (
  <AuthProvider>
    <ThemeProvider>
      <SoundProvider>
        <ModalProvider>
          <LoadingProvider>
            <ErrorProvider>
              <AppProvider>{children}</AppProvider>
            </ErrorProvider>
          </LoadingProvider>
        </ModalProvider>
      </SoundProvider>
    </ThemeProvider>
  </AuthProvider>
);
