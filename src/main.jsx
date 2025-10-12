import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { AppProviders } from "./context/AppProviders";

import { DashboardAlumno } from "./pages/DashboardAlumno.jsx";
import { DashboardProfesor } from "./pages/DashboardProfesor.jsx";
import { DashboardSuperadmin } from "./pages/DashboardSuperadmin.jsx";
import { Login } from "./pages/Login.jsx";
import { Modal } from "./components/ui/Modal.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AppProviders>
      {/*<App />*/}
      {/*<DashboardAlumno />*/}
      {<DashboardProfesor />}
      {/*<DashboardSuperadmin/>*/}
      {/*<Login/>*/}
      {/*<Modal/>*/}
    </AppProviders>
  </StrictMode>
);
