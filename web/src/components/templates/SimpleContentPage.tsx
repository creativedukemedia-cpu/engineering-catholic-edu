import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";
import type { ReactNode } from "react";

export function SimpleContentPage({
  title,
  lead,
  children,
  cta,
}: {
  title: string;
  lead?: string;
  children?: ReactNode;
  cta?: { label: string; href: string };
}) {
  return (
    <>
      <Section tone="dark">
        <h1 className="font-[family-name:var(--font-headline)] text-3xl font-bold">{title}</h1>
        {lead && <p className="mt-4 max-w-prose text-[var(--light-blue)]">{lead}</p>}
        {cta && (
          <div className="mt-6">
            <Button href={cta.href} onDark>
              {cta.label}
            </Button>
          </div>
        )}
      </Section>
      {children && <Section>{children}</Section>}
    </>
  );
}