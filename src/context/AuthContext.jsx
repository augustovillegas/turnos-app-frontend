/* eslint-disable react-refresh/only-export-components */
// === Auth Context ===
// Gestiona sesión básica con token/user almacenado en localStorage.
import { createContext, useContext, useEffect, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // --- Estado inicial: recupera usuario guardado si existe ---
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    try {
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error("No se pudo leer el usuario almacenado", error);
      return null;
    }
  });

  const token = localStorage.getItem("token");

  // --- Propaga cambios de sesión entre pestañas ---
  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === "user") {
        if (event.newValue) {
          try {
            setUser(JSON.parse(event.newValue));
          } catch (error) {
            console.error("No se pudo parsear el usuario desde storage", error);
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
      if (event.key === "token" && !event.newValue) {
        setUser(null);
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const logout = () => {
    // --- Limpia credenciales y reinicia sesión ---
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, token, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
