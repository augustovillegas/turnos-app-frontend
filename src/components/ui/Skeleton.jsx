export const Skeleton = ({ width = "100%", height = "1rem", rounded = "md" }) => {
  return (
    <div
      className={`
        bg-[#D3D3D3] dark:bg-[#2A2A2A]
        border-2 border-t-white border-l-white 
        border-b-[#808080] border-r-[#808080]
        dark:border-t-[#555] dark:border-l-[#555]
        dark:border-b-[#222] dark:border-r-[#222]
        animate-pulse
        rounded-${rounded}
      `}
      style={{ width, height }}
      aria-hidden="true"
    ></div>
  );
};
