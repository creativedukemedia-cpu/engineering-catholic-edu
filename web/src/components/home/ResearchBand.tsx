import Image from "next/image";
import { researchAreas } from "@/lib/liveContent";
import { OutboundLink } from "@/components/ui/SiteLink";
import { Section } from "@/components/layout/Section";
import { BandHeading } from "./Band";

const LIVE = "https://engineering.catholic.edu";

/**
 * Research, in the departments' own words and their own tiles. Deep blue,
 * because this is the band that has to land with partners and faculty hires.
 * Counts are left out; the six tiles say it themselves.
 */
export function ResearchBand() {
  return (
    <Section tone="dark" id="research" className="on-dark">
      <BandHeading
        onDark
        eyebrow="Research & faculty"
        title="Research already underway"
        lead="Faculty work runs from rehabilitation biomechanics to space weather, in departments across the college."
        link={{
          label: "Interdisciplinary research",
          href: `${LIVE}/connect-contact/faculty-directory/christopher-raub`,
        }}
      />
      <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {researchAreas.map((a) => (
          <li key={a.href}>
            <OutboundLink
              href={a.href}
              onDark
              className="group block h-full overflow-hidden rounded-lg border border-white/25 bg-white/5 hover:border-white"
            >
              <Image
                src={a.image}
                alt={a.alt}
                width={1200}
                height={801}
                sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 404px"
                className="aspect-[16/9] w-full object-cover"
              />
              <span className="block p-4">
                <span className="eyebrow block text-[var(--light-blue)]">
                  Areas of research
                </span>
                <span className="font-headline mt-2 block text-lg font-bold leading-snug">
                  Research in {a.label}
                </span>
                <span className="eyebrow mt-3 block text-white">
                  Read more <span aria-hidden="true">&rarr;</span>
                </span>
              </span>
            </OutboundLink>
          </li>
        ))}
      </ul>
    </Section>
  );
}
