// === CreateUsers ===
// Orquestador de vistas para gestión de usuarios (listar, crear, editar).
import { useState } from "react";
import { UsuariosList } from "../components/usuarios/UsuariosList";
import { UsuarioForm } from "../components/usuarios/UsuarioForm";
import { UsuarioEdit } from "../components/usuarios/UsuarioEdit";

export const CreateUsers = () => {
  const [modo, setModo] = useState("listar");
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

  const handleCrear = () => {
    setUsuarioSeleccionado(null);
    setModo("crear");
  };

  const handleEditar = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setModo("editar");
  };

  const handleVolver = () => {
    setModo("listar");
    setUsuarioSeleccionado(null);
  };

  return (
    <div className="mx-auto w-full max-w-6xl p-4 sm:p-6 text-[#111827] dark:text-gray-100 transition-colors duration-300">
        {modo === "listar" && (
          <UsuariosList onCrear={handleCrear} onEditar={handleEditar} />
        )}
        {modo === "crear" && <UsuarioForm onVolver={handleVolver} />}
        {modo === "editar" && (
          <UsuarioEdit usuario={usuarioSeleccionado} onVolver={handleVolver} />
        )}
    </div>
  );
};
