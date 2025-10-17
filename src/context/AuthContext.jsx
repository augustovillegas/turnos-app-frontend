/* eslint-disable react-refresh/only-export-components */
// === Auth Context ===
// Gestiona sesión básica con token/user almacenado en localStorage.
import { createContext, useContext, useEffect, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // --- Estado inicial: recupera usuario y token guardados si existen ---
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    try {
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error("No se pudo leer el usuario almacenado", error);
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem("token"));

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
      if (event.key === "token") {
        setToken(event.newValue || null);
        if (!event.newValue) {
          setUser(null);
        }
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const setSession = (nextToken, nextUser) => {
    if (nextToken) {
      localStorage.setItem("token", nextToken);
      setToken(nextToken);
    } else {
      localStorage.removeItem("token");
      setToken(null);
    }

    if (nextUser) {
      localStorage.setItem("user", JSON.stringify(nextUser));
      setUser(nextUser);
    } else {
      localStorage.removeItem("user");
      setUser(null);
    }
  };

  const login = (nextToken, nextUser) => {
    setSession(nextToken, nextUser);
  };

  const logout = () => {
    // --- Limpia credenciales y reinicia sesión ---
    setSession(null, null);
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, token, setSession, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
