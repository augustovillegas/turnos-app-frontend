export const LayoutWrapper = ({
  children,
  className = "",
  as: Tag = "div",
  maxWidthClass = "max-w-6xl",
  paddingClass = "p-4 sm:p-6",
}) => {
  return (
    <Tag
      className={`mx-auto w-full ${maxWidthClass} ${paddingClass} flex flex-col gap-6 ${className}`}
    >
      {children}
    </Tag>
  );
};
