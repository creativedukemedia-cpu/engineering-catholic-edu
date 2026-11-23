import Link from "next/link";
import { type ReactNode } from "react";

type Variant = "primary" | "secondary" | "quiet";
type Size = "md" | "lg";

/**
 * Every state keeps WCAG 2.2 AA body-text contrast. That rules out Bright Red
 * as a hover fill behind white label text (4.30:1), so a hover inverts to a
 * white fill instead of darkening or lightening the hue.
 */
const base =
  "focus-ring inline-flex min-h-11 items-center justify-center rounded-full font-medium transition-colors duration-150";

const sizes: Record<Size, string> = {
  md: "px-6 text-sm",
  lg: "px-7 text-[15px] min-h-12",
};

const variants: Record<Variant, string> = {
  primary:
    "bg-catholic-red text-white hover:bg-white hover:text-catholic-red",
  secondary:
    "border-2 border-catholic-blue text-catholic-blue hover:bg-catholic-blue hover:text-white",
  quiet:
    "px-1 text-catholic-blue underline decoration-catholic-red decoration-1 underline-offset-4 hover:text-catholic-red hover:decoration-2",
};

export function Button({
  href,
  variant = "primary",
  size = "md",
  children,
  onDark,
}: {
  href: string;
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  onDark?: boolean;
}) {
  let tone = `${base} ${sizes[size]} ${variants[variant]}`;

  if (onDark && variant === "secondary") {
    tone = `${base} ${sizes[size]} border-2 border-white text-white hover:bg-white hover:text-catholic-blue`;
  }
  if (onDark && variant === "quiet") {
    tone = `${base} ${sizes[size]} text-white underline decoration-bright-red decoration-2 underline-offset-4 hover:decoration-white focus-ring-dark`;
  }

  const external = href.startsWith("http");
  const className = `${tone} ${onDark ? "on-dark" : ""}`;

  return external ? (
    <a
      href={href}
      className={className}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ) : (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
