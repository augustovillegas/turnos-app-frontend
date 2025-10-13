import { useEffect, useRef, useState } from "react";
import dialupSound from "/sounds/dialup-sound.mp3";

export const DialUpModal = ({ show, message }) => {
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

  return (
    <div className="fixed inset-0 bg-black/70 flex flex-col items-center justify-center z-50">
      <div className="bg-gray-900 text-white p-6 rounded-2xl shadow-xl flex flex-col items-center space-y-4 animate-pulse">
        {/* 🔹 Icono de computadora retro */}
        <img
          src={"src/icons/retroPC.svg"}
          alt="Icono de computadora retro"
          onError={(e) => (e.target.style.display = "none")}
          className="w-20 h-20"
        />

        <p className="text-lg text-center">{message}</p>

        {/* 🔹 Botón de parlante */}
        <button
          type="button"
          onClick={() => setMuted((value) => !value)}
          className="bg-gray-700 hover:bg-gray-600 rounded-full p-3 transition"
          aria-label={muted ? "Activar sonido" : "Silenciar sonido"}
        >
          <img
            src={muted ? "src/icons/speakerOff.svg" : "src/icons/speakerOn.svg"}
            alt={muted ? "Sonido desactivado" : "Sonido activado"}
            onError={(e) => (e.target.style.display = "none")}
            className="w-6 h-6"
          />
        </button>
      </div>
    </div>
  );
};
