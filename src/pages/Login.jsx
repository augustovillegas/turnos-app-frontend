import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { showToast } from "../utils/feedback/toasts";
import { useAuth } from "../context/AuthContext";
import { apiClient } from "../services/apiClient";
import { DialUpModal } from "../components/ui/DialUpModal";
import { defaultHomeForRole } from "../router/session";

export const Login = () => {
  const navigate = useNavigate();
  const { login: authenticate } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loadingServer, setLoadingServer] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setLoadingServer(true);
    setModalMessage("Conectando con el servidor remoto...");

    try {
      console.log("[Login] Enviando solicitud de autenticacion", { email });
      const response = await apiClient.post("/auth/login", { email, password });

      console.log("[Login] Respuesta recibida", {
        status: response?.status,
        hasData: Boolean(response?.data),
      });

      const data = response?.data;
      if (!data) throw new Error("Respuesta invalida del servidor");

      if (!data?.user?.isApproved) {
        showToast("Tu cuenta aun no fue aprobada.", "warning");
        return;
      }

      authenticate(data.token, data.user);

      const role = data.user?.role;
      navigate(defaultHomeForRole(role));
    } catch (error) {
      console.error("[Login] Error al autenticar", {
        status: error?.response?.status,
        data: error?.response?.data,
        message: error?.message,
      });
      const isNetworkError =
        error?.code === "ERR_NETWORK" || error?.message === "Network Error";
      const message =
        error?.friendlyMessage ||
        error?.response?.data?.message ||
        (isNetworkError
          ? "No se pudo conectar con el servidor. Verifica tu conexi��n e intentalo nuevamente."
          : error?.message) ||
        "Error de autenticacion";
      showToast(message, "error");
    } finally {
      setTimeout(() => {
        setLoadingServer(false);
        setSubmitting(false);
      }, 1500);
    }
  };

  const handleCancel = () => {
    setEmail("");
    setPassword("");
    navigate("/");
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center bg-[#017F82] dark:bg-[#0F3D3F] transition-colors duration-300">
      <DialUpModal show={loadingServer} message={modalMessage} />

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
            <form className="flex flex-col gap-4" onSubmit={handleLogin}>
              <div>
                <label className="block text-sm font-bold text-[#111827] dark:text-gray-200 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="alguien@turnosapp.com"
                  className="w-full border-2 border-[#111827] dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#FFD700] dark:focus:ring-[#B8860B] transition-colors duration-300"
                  disabled={submitting}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#111827] dark:text-gray-200 mb-1">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Escribe tu contraseña"
                  className="w-full border-2 border-[#111827] dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#FFD700] dark:focus:ring-[#B8860B] transition-colors duration-300"
                  disabled={submitting}
                  required
                />
              </div>

              <div className="flex gap-2 mt-2">
                <Button
                  variant="primary"
                  type="submit"
                  className="flex-1"
                  disabled={submitting}
                >
                  {submitting ? "Procesando..." : "Aceptar"}
                </Button>
                <Button
                  variant="secondary"
                  type="button"
                  className="flex-1"
                  onClick={handleCancel}
                  disabled={submitting}
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
