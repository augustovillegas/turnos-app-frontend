// === CreateUsers ===
// Orquestador de vistas para gestión de usuarios (listar, crear, editar).
import { useState } from "react";
import { LayoutWrapper } from "../components/layout/LayoutWrapper";
import { UsuariosList } from "../components/usuarios/UsuariosList";
import { UsuarioForm } from "../components/usuarios/UsuarioForm";
import { UsuarioEdit } from "../components/usuarios/UsuarioEdit";

export const CreateUsers = ({ withWrapper = true }) => {
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

  const containerClass = "text-[#111827] dark:text-gray-100 transition-colors duration-300";
  const Container = withWrapper ? LayoutWrapper : "div";
  const containerProps = withWrapper
    ? { className: containerClass }
    : { className: `w-full flex flex-col gap-6 ${containerClass}` };

  return (
    <Container {...containerProps}>
      {modo === "listar" && (
        <UsuariosList onCrear={handleCrear} onEditar={handleEditar} />
      )}
      {modo === "crear" && <UsuarioForm onVolver={handleVolver} />}
      {modo === "editar" && (
        <UsuarioEdit usuario={usuarioSeleccionado} onVolver={handleVolver} />
      )}
    </Container>
  );
};
