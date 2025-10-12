import { createContext, useContext, useEffect, useMemo } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [turnos, setTurnos] = useLocalStorage("turnos", []);
  const [entregas, setEntregas] = useLocalStorage("entregas", []);
  const [usuarios, setUsuarios] = useLocalStorage("usuarios", []);

  // ✅ Sincroniza datos si cambia el localStorage en otra pestaña
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "turnos" && e.newValue) setTurnos(JSON.parse(e.newValue));
      if (e.key === "entregas" && e.newValue)
        setEntregas(JSON.parse(e.newValue));
      if (e.key === "usuarios" && e.newValue)
        setUsuarios(JSON.parse(e.newValue));
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [setTurnos, setEntregas, setUsuarios]);

  // ✅ Métricas derivadas memoizadas
  const { totalTurnosSolicitados, totalEntregas, totalUsuarios } =
    useMemo(() => {
      return {
        totalTurnosSolicitados: turnos.filter((t) => t.estado === "Solicitado")
          .length,
        totalEntregas: entregas.length,
        totalUsuarios: usuarios.length,
      };
    }, [turnos, entregas, usuarios]);

  return (
    <AppContext.Provider
      value={{
        turnos,
        setTurnos,
        entregas,
        setEntregas,
        usuarios,
        setUsuarios,
        totalTurnosSolicitados,
        totalEntregas,
        totalUsuarios,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppData = () => useContext(AppContext);
