import { useEffect } from "react";
import clsx from "clsx";

export const Skeleton = ({
  variant = "bars",
  lines = 3,
  width = "100%",
  height = "1rem",
  rounded = "md",
  showMessage = true,
  className = "",
}) => {
  const isOverlay = variant === "modal" || variant === "spinner";
  const loadingMessage = "Cargando datos, espere por favor...";

  // Bloquea el scroll del body mientras el modal de espera esta activo.
  useEffect(() => {
    if (!isOverlay || typeof document === "undefined") return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOverlay]);

  if (variant === "block") {
    return (
      <div
        className={clsx(
          "animate-pulse bg-gray-300 dark:bg-[#2A2A2A] transition-colors duration-300",
          "border border-[#111827]/20 dark:border-[#333]/40",
          "shadow-sm",
          {
            "rounded-sm": rounded === "sm",
            "rounded-md": rounded === "md",
            "rounded-lg": rounded === "lg",
            "rounded-xl": rounded === "xl",
            "rounded-full": rounded === "full",
          },
          className
        )}
        style={{ width, height }}
        aria-hidden="true"
      ></div>
    );
  }

  const safeLines = Number.isFinite(lines) && lines > 0 ? Math.min(Math.floor(lines), 6) : 3;
  const bars = Array.from({ length: safeLines });

  const renderInlineMessage = showMessage ? <span className="sr-only">{loadingMessage}</span> : null;

  const renderModalBars = () => (
    <div className="flex items-end justify-center gap-2 sm:gap-3" aria-hidden="true">
      {bars.map((_, idx) => (
        <span
          key={idx}
          className="w-2 sm:w-2.5 rounded-full bg-[#1E3A8A] dark:bg-[#FFD700] animate-pulse"
          style={{
            height: `${32 + idx * 6}px`,
            animationDelay: `${idx * 0.12}s`,
            animationDuration: "1s",
          }}
        ></span>
      ))}
    </div>
  );

  const renderSpinner = () => (
    <div
      className="h-12 w-12 sm:h-14 sm:w-14 rounded-full border-4 border-[#E5E5E5] border-t-[#1E3A8A] dark:border-[#2A2A2A] dark:border-t-[#FFD700] animate-spin"
      aria-hidden="true"
    ></div>
  );

  if (isOverlay) {
    const isSpinner = variant === "spinner";
    const titleId = "skeleton-loading-title";
    const descId = "skeleton-loading-desc";
    return (
      <>
        <style>
          {`
            @keyframes skeletonModalFade {
              from { opacity: 0; transform: translateY(8px) scale(0.98); }
              to { opacity: 1; transform: translateY(0) scale(1); }
            }
          `}
        </style>
        <div
          className={clsx(
            "fixed inset-0 z-40 flex items-center justify-center px-4",
            "backdrop-blur-sm",
            className
          )}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descId}
        >
          <div
            className="absolute inset-0 bg-[#111827]/60 dark:bg-black/70 transition-opacity duration-200"
            aria-hidden="true"
          ></div>
          <div
            className="relative w-full max-w-sm rounded-xl border-2 border-[#111827] dark:border-[#444] bg-white dark:bg-[#0F172A] shadow-2xl p-6 sm:p-7 flex flex-col items-center gap-4 sm:gap-5"
            style={{ animation: "skeletonModalFade 200ms ease-out" }}
          >
            <span id={descId} className="sr-only">
              Loading
            </span>
            {isSpinner ? renderSpinner() : renderModalBars()}
            {showMessage ? (
              <p
                id={titleId}
                className="text-center text-base sm:text-lg font-semibold text-[#1E3A8A] dark:text-[#FFD700]"
              >
                {loadingMessage}
              </p>
            ) : (
              <span id={titleId} className="sr-only">
                {loadingMessage}
              </span>
            )}
          </div>
        </div>
      </>
    );
  }

  return (
    <div className={clsx("flex flex-col gap-3", className)} role="status" aria-live="polite">
      {renderInlineMessage}
      <div className="space-y-2">
        {bars.map((_, idx) => (
          <div
            key={idx}
            className="h-3 w-full rounded-full bg-[#1E3A8A]/25 dark:bg-[#93C5FD]/25 animate-pulse"
            style={{ animationDelay: `${idx * 0.12}s`, animationDuration: "1.1s" }}
            aria-hidden="true"
          ></div>
        ))}
      </div>
    </div>
  );
};


