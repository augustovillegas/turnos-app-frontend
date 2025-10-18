import clsx from "clsx";

export const Skeleton = ({ width = "100%", height = "1rem", rounded = "md" }) => {
  return (
    <div
      className={clsx(
        "bg-[#D3D3D3] dark:bg-[#2A2A2A] border-2 border-t-white border-l-white border-b-[#808080] border-r-[#808080] dark:border-t-[#555] dark:border-l-[#555] dark:border-b-[#222] dark:border-r-[#222] animate-pulse",
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
