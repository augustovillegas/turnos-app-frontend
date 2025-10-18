// === App Shell ===
// Configura rutas públicas/privadas y provee layout general de landing + dashboards.
import { Suspense, useMemo } from "react";
import {
  Outlet,
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
  useLocation,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { LandingPage } from "./pages/LandingPage";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { RequestsPanel } from "./components/overlay/RequestsPanel";
import { CreateTurnos } from "./pages/CreateTurnos";
import { DashboardAlumno } from "./pages/DashboardAlumno";
import { DashboardProfesor } from "./pages/DashboardProfesor";
import { DashboardSuperadmin } from "./pages/DashboardSuperadmin";
import { Login } from "./pages/Login";
import { PrivateRoute } from "./components/auth/PrivateRoute";
import { Loader } from "./components/ui/Loader";

function Layout() {
  // --- Determina qué elementos globales mostrar según la ruta ---
  const location = useLocation();

  const isDashboard = location.pathname.startsWith("/dashboard");
  const isLandingOrLogin =
    location.pathname === "/" || location.pathname === "/login";

  return (
    <div className="flex min-h-screen flex-col bg-[#F4F4F4] dark:bg-[#0F3D3F] transition-colors duration-300">
      {/* Navbar solo en landing y login */}
      {isLandingOrLogin && <Header />}

      <main className="flex-1">
        <Suspense fallback={<Loader />}>
          <Outlet />
        </Suspense>
      </main>

      {/* RequestsPanel solo en dashboards */}
      {isDashboard && <RequestsPanel />}

      {/* Footer solo en landing y login */}
      {isLandingOrLogin && <Footer />}
    </div>
  );
}

const createAppRouter = () =>
  createBrowserRouter(
    createRoutesFromElements(
      <Route element={<Layout />}>
        <Route index element={<LandingPage />} />
        <Route path="login" element={<Login />} />
        <Route
          path="dashboard/alumno"
          element={
            <PrivateRoute roles={["alumno"]}>
              <DashboardAlumno />
            </PrivateRoute>
          }
        />
        <Route
          path="dashboard/profesor"
          element={
            <PrivateRoute roles={["profesor"]}>
              <DashboardProfesor />
            </PrivateRoute>
          }
        />
        <Route
          path="dashboard/superadmin"
          element={
            <PrivateRoute roles={["superadmin"]}>
              <DashboardSuperadmin />
            </PrivateRoute>
          }
        />
        <Route path="items" element={<CreateTurnos />} />
      </Route>
    ),
    {
      future: {
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      },
    }
  );

function App() {
  // --- Raíz del front: react-router + contenedor de toasts ---
  const router = useMemo(() => createAppRouter(), []);

  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer />
    </>
  );
}

export default App;
export { createAppRouter };
