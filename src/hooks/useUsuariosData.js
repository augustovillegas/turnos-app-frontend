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
    updateUsuarioRemoto,
    deleteUsuarioRemoto,
  } = useAppData();
  return useMemo(() => ({
    usuarios,
    loadUsuarios,
    approveUsuario,
    updateUsuarioEstado,
    createUsuarioRemoto,
    updateUsuarioRemoto,
    deleteUsuarioRemoto,
  }), [usuarios, loadUsuarios, approveUsuario, updateUsuarioEstado, createUsuarioRemoto, updateUsuarioRemoto, deleteUsuarioRemoto]);
};
