import { useState, useEffect } from "react";

export const useLocalStorage = (llave, valorInicial) => {
  const [valor, establecerValor] = useState(() => {
    try {
      const almacenado = localStorage.getItem(llave);
      return almacenado ? JSON.parse(almacenado) : valorInicial;
    } catch (error) {
      console.error("Error al leer LocalStorage", error);
      return valorInicial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(llave, JSON.stringify(valor));
    } catch (error) {
      console.error("Error al guardar en LocalStorage", error);
    }
  }, [llave, valor]);

  return [valor, establecerValor];
};
