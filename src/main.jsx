// === Punto de entrada ===
// Monta la app con providers compartidos y estilos globales.
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { AppProviders } from "./context/AppProviders";
import { ErrorBoundary } from './components/ui/ErrorBoundary.jsx';

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AppProviders>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </AppProviders>
  </StrictMode>
);
