import clsx from "clsx";

export const Skeleton = ({ width = "100%", height = "1rem", rounded = "md" }) => {
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
        }
      )}
      style={{ width, height }}
      aria-hidden="true"
    ></div>
  );
};

