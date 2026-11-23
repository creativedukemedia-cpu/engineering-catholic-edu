import { type ReactNode } from "react";
import { Container } from "./Container";

export function Section({
  children,
  tone = "light",
  className = "",
  id,
}: {
  children: ReactNode;
  tone?: "light" | "dark" | "card";
  className?: string;
  id?: string;
}) {
  const bg =
    tone === "dark"
      ? "bg-catholic-blue text-white"
      : tone === "card"
        ? "bg-limestone"
        : "bg-sandstone";
  return (
    <section id={id} className={`${bg} py-12 md:py-16 ${className}`}>
      <Container>{children}</Container>
    </section>
  );
}