import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { showToast } from "../utils/feedback/toasts";
import { useAuth } from "../context/AuthContext";
import { apiClient } from "../services/apiClient";
import { DialUpModal } from "../components/ui/DialUpModal";
import { rutaInicioPorRol } from "../router/session";

export const Login = () => {
  const navigate = useNavigate();
  const { iniciarSesion } = useAuth();
  const [correo, establecerCorreo] = useState("");
  const [contrasena, establecerContrasena] = useState("");
  const [enviando, establecerEnviando] = useState(false);
  const [cargandoServidor, establecerCargandoServidor] = useState(false);
  const [mensajeModal, establecerMensajeModal] = useState("");

  const manejarIngreso = async (evento) => {
    evento.preventDefault();
    if (enviando) return;

    establecerEnviando(true);
    establecerCargandoServidor(true);
    establecerMensajeModal("Conectando con el servidor remoto...");

    try {
      console.log("[Login] Enviando solicitud de autenticación", { correo });
      const respuesta = await apiClient.post("/auth/login", {
        email: correo,
        password: contrasena,
      });

      console.log("[Login] Respuesta recibida", {
        status: respuesta?.status,
        hasData: Boolean(respuesta?.data),
      });

      const datos = respuesta?.data;
      if (!datos) throw new Error("Respuesta inválida del servidor");

      if (!datos?.user?.isApproved) {
        showToast(
          "Todavía no aprobamos tu cuenta. Revísala con un administrador.",
          "warning"
        );
        return;
      }

      iniciarSesion(datos.token, datos.user);

      const rol = datos.user?.role;
      navigate(rutaInicioPorRol(rol));
    } catch (error) {
      console.error("[Login] Error al autenticar", {
        status: error?.response?.status,
        data: error?.response?.data,
        message: error?.message,
      });
      const esErrorRed =
        error?.code === "ERR_NETWORK" || error?.message === "Network Error";
      const mensaje =
        error?.friendlyMessage ||
        error?.response?.data?.message ||
        (esErrorRed
          ? "No se pudo conectar con el servidor. Verifica tu conexión e inténtalo nuevamente."
          : error?.message) ||
        "Error de autenticación";
      showToast(mensaje, "error");
    } finally {
      setTimeout(() => {
        establecerCargandoServidor(false);
        establecerEnviando(false);
      }, 1500);
    }
  };

  const manejarCancelar = () => {
    establecerCorreo("");
    establecerContrasena("");
    navigate("/");
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center bg-[#017F82] dark:bg-[#0F3D3F] transition-colors duration-300">
      <DialUpModal show={cargandoServidor} message={mensajeModal} />

      <div className="bg-[#E5E5E5] dark:bg-[#1E1E1E] border-2 border-[#111827] dark:border-[#333] rounded-md shadow-lg max-w-md mx-4 overflow-hidden transition-colors duration-300">
        <div className="bg-[#1E3A8A] dark:bg-[#0A2E73] text-white flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm">Iniciar sesión</span>
          </div>
        </div>

        <div className="flex p-6">
          <div className="flex items-start justify-center pr-6">
            <img
              src="/icons/users_key-4.png"
              alt="User Keys"
              className="w-16 h-16"
            />
          </div>

          <div className="flex-1">
            <form className="flex flex-col gap-4" onSubmit={manejarIngreso}>
              <div>
                <label className="block text-sm font-bold text-[#111827] dark:text-gray-200 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={correo}
                  onChange={(evento) => establecerCorreo(evento.target.value)}
                  placeholder="alguien@turnosapp.com"
                  className="w-full border-2 border-[#111827] dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#FFD700] dark:focus:ring-[#B8860B] transition-colors duration-300"
                  disabled={enviando}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#111827] dark:text-gray-200 mb-1">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={contrasena}
                  onChange={(evento) => establecerContrasena(evento.target.value)}
                  placeholder="Escribe tu contraseña"
                  className="w-full border-2 border-[#111827] dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#FFD700] dark:focus:ring-[#B8860B] transition-colors duration-300"
                  disabled={enviando}
                  required
                />
              </div>

              <div className="flex gap-2 mt-2">
                <Button
                  variant="primary"
                  type="submit"
                  className="flex-1"
                  disabled={enviando}
                >
                  {enviando ? "Procesando..." : "Aceptar"}
                </Button>
                <Button
                  variant="secondary"
                  type="button"
                  className="flex-1"
                  onClick={manejarCancelar}
                  disabled={enviando}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
