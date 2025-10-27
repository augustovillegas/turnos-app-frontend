/* eslint-disable react-refresh/only-export-components */
// === Auth Context ===
// Gestiona sesión básica con token/usuario almacenado en localStorage.
import { createContext, useContext, useEffect, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // --- Estado inicial: recupera usuario y token guardados si existen ---
  const [usuario, establecerUsuario] = useState(() => {
    const almacenado = localStorage.getItem("user");
    try {
      return almacenado ? JSON.parse(almacenado) : null;
    } catch (error) {
      console.error("No se pudo leer el usuario almacenado", error);
      return null;
    }
  });
  const [token, establecerToken] = useState(() => localStorage.getItem("token"));

  // --- Propaga cambios de sesión entre pestañas ---
  useEffect(() => {
    const manejarStorage = (evento) => {
      if (evento.key === "user") {
        if (evento.newValue) {
          try {
            establecerUsuario(JSON.parse(evento.newValue));
          } catch (error) {
            console.error(
              "No se pudo interpretar el usuario desde storage",
              error
            );
            establecerUsuario(null);
          }
        } else {
          establecerUsuario(null);
        }
      }
      if (evento.key === "token") {
        establecerToken(evento.newValue || null);
        if (!evento.newValue) {
          establecerUsuario(null);
        }
      }
    };

    window.addEventListener("storage", manejarStorage);
    return () => window.removeEventListener("storage", manejarStorage);
  }, []);

  const actualizarSesion = (siguienteToken, siguienteUsuario) => {
    if (siguienteToken) {
      localStorage.setItem("token", siguienteToken);
      establecerToken(siguienteToken);
    } else {
      localStorage.removeItem("token");
      establecerToken(null);
    }

    if (siguienteUsuario) {
      localStorage.setItem("user", JSON.stringify(siguienteUsuario));
      establecerUsuario(siguienteUsuario);
    } else {
      localStorage.removeItem("user");
      establecerUsuario(null);
    }
  };

  const iniciarSesion = (siguienteToken, siguienteUsuario) => {
    actualizarSesion(siguienteToken, siguienteUsuario);
  };

  const cerrarSesion = () => {
    // --- Limpia credenciales y reinicia sesión ---
    actualizarSesion(null, null);
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        establecerUsuario,
        token,
        actualizarSesion,
        iniciarSesion,
        cerrarSesion,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
