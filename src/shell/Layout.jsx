import { Suspense } from "react";
import { Outlet, useLocation, Navigate } from "react-router-dom";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { RequestsPanel } from "../components/overlay/RequestsPanel";
import { Loader } from "../components/ui/Loader";
import { useAuth } from "../context/AuthContext";

export const Layout = () => {
  const location = useLocation();

  const esDashboard = location.pathname.startsWith("/dashboard");
  const esLandingOLogin =
    location.pathname === "/" || location.pathname === "/login";
  const { usuario, token } = useAuth();
  const mostrarPanelSolicitudes = esDashboard && usuario && token;

  if (esDashboard && (!usuario || !token)) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F4F4F4] dark:bg-[#0F3D3F] transition-colors duration-300">
      {esLandingOLogin && <Header />}

      <main className="flex-1">
        <Suspense fallback={<Loader />}>
          <Outlet />
        </Suspense>
      </main>

      {mostrarPanelSolicitudes && <RequestsPanel />}
      {esLandingOLogin && <Footer />}
    </div>
  );
};
