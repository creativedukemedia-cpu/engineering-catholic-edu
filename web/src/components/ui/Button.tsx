import Link from "next/link";
import { type ReactNode } from "react";

type Variant = "primary" | "secondary" | "quiet";

const base =
  "focus-ring inline-flex min-h-11 items-center justify-center rounded-full px-6 text-sm font-medium transition-colors";

const variants: Record<Variant, string> = {
  primary: "bg-catholic-red text-white hover:bg-catholic-blue",
  secondary:
    "border border-catholic-blue text-catholic-blue bg-transparent hover:bg-catholic-blue hover:text-white",
  quiet: "text-catholic-blue underline-offset-4 hover:underline px-2",
};

export function Button({
  href,
  variant = "primary",
  children,
  onDark,
}: {
  href: string;
  variant?: Variant;
  children: ReactNode;
  onDark?: boolean;
}) {
  const darkSecondary =
    onDark && variant === "secondary"
      ? "border-white text-white hover:bg-white hover:text-catholic-blue"
      : "";
  return (
    <Link href={href} className={`${base} ${variants[variant]} ${darkSecondary}`}>
      {children}
    </Link>
  );
}