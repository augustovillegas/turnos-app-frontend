import { useEffect, useRef, useState } from "react";
import dialupSound from "/sounds/dialup-sound.mp3";

export const DialUpModal = ({ show, message }) => {
  const [muted, setMuted] = useState(false);
  const audioRef = useRef(null);

  // 🎵 Lógica original del sonido
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

  return (
    <div className="fixed inset-0 bg-black/70 flex flex-col items-center justify-center z-50 transition-colors duration-300">
      <div
        className="
          relative
          bg-[#E5E5E5] dark:bg-[#1E1E1E]
          border-2 border-[#111827] dark:border-[#333]
          rounded-xl shadow-2xl px-8 py-6
          flex flex-col items-center space-y-5
          transition-all duration-300
        "
      >
        {/* 🔹 Ícono principal */}
        <img
          src="/icons/network_internet.png"
          alt="Conectando con el servidor"
          className="w-20 h-20 drop-shadow-md animate-pulse"
        />

        {/* 🔹 Texto con efecto parpadeante */}
        <p className="text-base font-semibold text-[#111827] dark:text-gray-200 text-center leading-relaxed animate-pulse">
          {message}
        </p>

        {/* 🔹 Botón de sonido */}
        <button
          type="button"
          onClick={() => setMuted((v) => !v)}
          className="bg-white/45 dark:bg-white/35 hover:brightness-110 rounded-full p-3 transition shadow-md"
          aria-label={muted ? "Activar sonido" : "Silenciar sonido"}
        >
          <img
            src={muted ? "/icons/speakerOff.png" : "/icons/speakerOn.png"}
            alt={muted ? "Sonido desactivado" : "Sonido activado"}
            className="w-6 h-6 filter brightness-110"
          />
        </button>

        {/* 🔹 Botón sutil de cancelar conexión */}
        <button
          type="button"
          onClick={() => {
            const audio = audioRef.current;
            if (audio) {
              audio.pause();
              audio.currentTime = 0;
            }
            window.location.href = "/";
          }}
          className="
            absolute bottom-3 right-5
            text-xs text-gray-500 dark:text-gray-400
            hover:text-gray-700 dark:hover:text-gray-200
            transition-colors duration-200
          "
        >
          Cancelar conexión
        </button>
      </div>
    </div>
  );
};
