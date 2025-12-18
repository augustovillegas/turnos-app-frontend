import { useMemo } from 'react';
import { useAppData } from '../context/AppContext';

/** Operaciones y listado de usuarios agrupados. */
export const useUsuariosData = () => {
  const {
    usuarios,
    loadUsuarios,
    approveUsuario,
    updateUsuarioEstado,
    createUsuarioRemoto,
    updateUsuario,
    deleteUsuarioRemoto,
  } = useAppData();
  return useMemo(() => ({
    usuarios,
    loadUsuarios,
    approveUsuario,
    updateUsuarioEstado,
    createUsuarioRemoto,
    updateUsuario,
    deleteUsuarioRemoto,
  }), [usuarios, loadUsuarios, approveUsuario, updateUsuarioEstado, createUsuarioRemoto, updateUsuario, deleteUsuarioRemoto]);
};
