import { type ReactNode } from "react";

/**
 * The page shell. `wide` is used by the header, the mega panels, and the hero
 * so those full-bleed bands line up with one another instead of the narrower
 * reading column.
 */
export function Container({
  children,
  className = "",
  wide = false,
}: {
  children: ReactNode;
  className?: string;
  wide?: boolean;
}) {
  return (
    <div
      className={`${
        wide
          ? "mx-auto w-full max-w-[var(--shell-max)]"
          : "mx-auto w-full max-w-[1120px]"
      } px-4 md:px-8 lg:px-10 ${className}`}
    >
      {children}
    </div>
  );
}
