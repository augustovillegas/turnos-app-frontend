// === Auth Context ===
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import { showToast } from "../utils/feedback/toasts"; // ⬅️ añadido

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const normalizeUser = (user) => {
    if (!user || typeof user !== "object") return null;
    const role = user.rol ?? user.role ?? user.tipo ?? null;
    const moduloGuardado = user.modulo ?? null;
    return {
      ...user,
      ...(role ? { rol: role, role } : {}),
      modulo: moduloGuardado,
    };
  };

  // --- Estado inicial: recupera usuario y token guardados si existen ---
  const [usuario, establecerUsuario] = useState(() => {
    const almacenado = localStorage.getItem("user");
    try {
      if (!almacenado) return null;
      const parsed = JSON.parse(almacenado);
      return normalizeUser(parsed);
    } catch (error) {
      console.error("No se pudo leer el usuario almacenado", error);
      showToast("Error al leer el usuario almacenado", "error");
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
            establecerUsuario(normalizeUser(JSON.parse(evento.newValue)));
          } catch (error) {
            console.error(
              "No se pudo interpretar el usuario desde storage",
              error
            );
            showToast("Error al sincronizar usuario desde storage", "error");
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

  // --- Función auxiliar para persistir o limpiar sesión ---
  const actualizarSesion = (siguienteToken, siguienteUsuario) => {
    try {
      const normalizado = normalizeUser(siguienteUsuario);
      if (siguienteToken) {
        localStorage.setItem("token", siguienteToken);
        establecerToken(siguienteToken);
      } else {
        localStorage.removeItem("token");
        establecerToken(null);
      }

      if (normalizado) {
        localStorage.setItem("user", JSON.stringify(normalizado));
        establecerUsuario(normalizado);
      } else {
        localStorage.removeItem("user");
        establecerUsuario(null);
      }
    } catch (error) {
      console.error("Error al actualizar la sesión", error);
      showToast("Error al guardar los datos de sesión", "error");
    }
  };

  // --- Métodos públicos ---
  const iniciarSesion = (siguienteToken, siguienteUsuario) => {
    actualizarSesion(siguienteToken, siguienteUsuario);
    showToast("Sesión iniciada correctamente", "success"); 
  };

  const cerrarSesion = () => {
    actualizarSesion(null, null);
    showToast("Sesión cerrada", "info"); 
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
