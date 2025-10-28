// === App Shell ===
// Configura rutas publicas/privadas y expone el enrutador principal listo para tests.
import { useMemo } from "react";
import { RouterProvider } from "react-router-dom";
import { createAppRouter } from "./router/createAppRouter";

function App({ router: enrutadorInyectado } = {}) {
  // --- Raiz del front: react-router + contenedor de notificaciones ---
  const enrutador = useMemo(
    () => enrutadorInyectado ?? createAppRouter(),
    [enrutadorInyectado]
  );

  return (
    <>
      <RouterProvider
        router={enrutador}
        future={{
          v7_startTransition: true,
        }}
      />
    </>
  );
}

export default App;
