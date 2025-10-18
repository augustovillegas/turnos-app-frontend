// === App Shell ===
// Configura rutas públicas/privadas y provee layout general de landing + dashboards.
import { useMemo } from "react";
import { RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { createAppRouter } from "./router/createAppRouter";

function App() {
  // --- Raíz del front: react-router + contenedor de toasts ---
  const router = useMemo(() => createAppRouter(), []);

  return (
    <>
      <RouterProvider
        router={router}
        future={{
          v7_startTransition: true,
        }}
      />
      <ToastContainer />
    </>
  );
}

export default App;
