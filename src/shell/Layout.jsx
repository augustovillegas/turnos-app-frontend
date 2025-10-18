import { Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { RequestsPanel } from "../components/overlay/RequestsPanel";
import { Loader } from "../components/ui/Loader";

export const Layout = () => {
  const location = useLocation();

  const isDashboard = location.pathname.startsWith("/dashboard");
  const isLandingOrLogin =
    location.pathname === "/" || location.pathname === "/login";

  return (
    <div className="flex min-h-screen flex-col bg-[#F4F4F4] dark:bg-[#0F3D3F] transition-colors duration-300">
      {isLandingOrLogin && <Header />}

      <main className="flex-1">
        <Suspense fallback={<Loader />}>
          <Outlet />
        </Suspense>
      </main>

      {isDashboard && <RequestsPanel />}
      {isLandingOrLogin && <Footer />}
    </div>
  );
};
