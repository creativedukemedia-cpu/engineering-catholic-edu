import Link from "next/link";
import { Section } from "@/components/layout/Section";
import { ProgramFinder } from "@/components/home/ProgramFinder";

export default function ProgramsAdmissionHub() {
  return (
    <>
      <Section tone="dark">
        <h1 className="font-[family-name:var(--font-headline)] text-3xl font-bold">
          Programs &amp; Admission
        </h1>
        <p className="mt-4 max-w-prose text-[var(--light-blue)]">
          Degrees, certificates, and how to apply. URLs match the current site.
        </p>
      </Section>
      <Section>
        <ProgramFinder />
        <ul className="mt-8 grid gap-3 text-catholic-blue md:grid-cols-2">
          {[
            ["/programs-admission/undergraduate-programs", "Undergraduate programs"],
            ["/programs-admission/graduate-programs", "Graduate programs"],
            ["/programs-admission/certificate-programs", "Certificate programs"],
            ["/programs-admission/request-information", "Request information"],
          ].map(([href, label]) => (
            <li key={href}>
              <Link href={href} className="focus-ring font-medium text-catholic-red hover:underline">
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}