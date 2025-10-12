import { LandingPage } from "./pages/LandingPage";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { RequestsPanel } from "./components/overlay/RequestsPanel";

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
    
      <main className="flex-grow">
        <LandingPage />
      </main>

      {/* Panel lateral flotante */}
      <RequestsPanel />

      {/* Footer fijo en todo momento */}
      <Footer />
    </div>
  );
}

export default App;


