import { useEffect, useRef, useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import dialupSound from "/sounds/dialup-sound.mp3";

export const DialUpModal = ({ show, message }) => {
  const { theme } = useTheme();
  const [muted, setMuted] = useState(false);
  const audioRef = useRef(null);

  if (typeof Audio !== "undefined" && !audioRef.current) {
    const audio = new Audio(dialupSound);
    audio.loop = true;
    audioRef.current = audio;
  }

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!show) {
      audio.pause();
      audio.currentTime = 0;
      return;
    }

    if (muted) {
      audio.pause();
      return;
    }

    audio.play().catch(() => {});
  }, [show, muted]);

  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, []);

  if (!show) return null;
 
  const isDark = theme === "dark";
  const overlayBg = isDark ? "bg-black/80" : "bg-black/50";
  const modalBg = isDark ? "bg-[#1E1E1E]" : "bg-[#E5E5E5]";
  const borderColor = isDark ? "border-[#333]" : "border-[#111827]";
  const textColor = isDark ? "text-gray-200" : "text-[#111827]";
  const accentColor = isDark ? "bg-[#017F82]" : "bg-[#1E3A8A]";

  return (
    <div
      className={`fixed inset-0 ${overlayBg} flex flex-col items-center justify-center z-50 transition-colors duration-300`}
    >
      <div
        className={`${modalBg} border-2 ${borderColor} ${textColor} rounded-xl shadow-2xl px-8 py-6 flex flex-col items-center space-y-5 animate-pulse max-w-sm mx-4 transition-all duration-300`}
      >
        {/* 🔹 Ícono principal */}
        <img
          src={"src/icons/network_internet.png"}
          alt="Conectando con el servidor"
          onError={(e) => (e.target.style.display = "none")}
          className="w-20 h-20 drop-shadow-lg"
        />

        {/* 🔹 Texto */}
        <p className="text-base text-center font-semibold leading-relaxed">
          {message}
        </p>

        {/* 🔹 Botón de sonido */}
        <button
          type="button"
          onClick={() => setMuted((v) => !v)}
          className={`${accentColor} hover:brightness-110 rounded-full p-3 transition shadow-md`}
          aria-label={muted ? "Activar sonido" : "Silenciar sonido"}
        >
          <img
            src={
              muted
                ? "src/icons/speakerOff.png"
                : "src/icons/speakerOn.png"
            }
            alt={muted ? "Sonido desactivado" : "Sonido activado"}
            onError={(e) => (e.target.style.display = "none")}
            className="w-6 h-6 filter brightness-110"
          />
        </button>
      </div>
    </div>
  );
};
