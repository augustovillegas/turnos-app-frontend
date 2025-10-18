/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from "react";

const SoundContext = createContext();

export const SoundProvider = ({ children }) => {
  const [muted, setMuted] = useState(() => {
    const saved = localStorage.getItem("muted");
    return saved === "true";
  });

  const toggleMute = () => setMuted((prev) => !prev);

  // Guarda la preferencia de sonido en localStorage
  useEffect(() => {
    localStorage.setItem("muted", muted ? "true" : "false");
  }, [muted]);

  return (
    <SoundContext.Provider value={{ muted, toggleMute }}>
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = () => useContext(SoundContext);
