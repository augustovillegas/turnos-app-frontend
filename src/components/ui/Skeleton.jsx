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

  return (
    <div className={clsx("flex flex-col gap-3", className)} role="status" aria-live="polite">
      {showMessage && (
        <p className="text-xs font-semibold text-[#0F3D3F] dark:text-[#93C5FD]">
          Cargando datos, espere por favor
        </p>
      )}
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

