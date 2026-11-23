import Image from "next/image";
import { career, employers } from "@/lib/liveContent";
import { OutboundLink } from "@/components/ui/SiteLink";
import { Section } from "@/components/layout/Section";
import { BandHeading } from "./Band";

const LIVE = "https://engineering.catholic.edu";

/**
 * Outcomes. The percentage keeps the site's own wording, because the qualifier
 * ("or graduate school, a combination of both, or military service") is what
 * makes the figure true. Logos appear in their original colors: they are third
 * party marks, and the brand rules on recoloring apply to the university logo.
 */
export function CareerBand() {
  return (
    <Section tone="plain" id="outcomes">
      <BandHeading
        eyebrow="Career development"
        title="Where graduates go"
        link={{
          label: "Career development",
          href: `${LIVE}/explore-our-college/career-development`,
        }}
      />
      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <div>
          <p className="font-headline text-6xl font-bold leading-none text-catholic-red">
            {career.figure}
          </p>
          <p className="mt-4 text-[15px] leading-relaxed">{career.claim}</p>
        </div>
        <div>
          <p className="eyebrow text-catholic-blue">{career.qualifier}</p>
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {employers.map((e) => (
              <li
                key={e.name}
                className="flex h-20 items-center justify-center rounded-lg border border-catholic-blue/10 bg-white px-3"
              >
                <Image
                  src={e.image}
                  alt={`${e.name} logo`}
                  width={e.width}
                  height={e.height}
                  sizes="(max-width: 639px) 40vw, (max-width: 1023px) 26vw, 180px"
                  className="h-9 w-auto max-w-full object-contain md:h-10"
                />
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-catholic-blue">{career.note}</p>
        </div>
      </div>
      <div className="mt-8">
        <OutboundLink
          href={`${LIVE}/explore-our-college/student-success`}
          className="text-sm font-medium text-catholic-blue underline decoration-catholic-red decoration-1 underline-offset-4 hover:text-catholic-red hover:decoration-2"
        >
          How the college supports students along the way
        </OutboundLink>
      </div>
    </Section>
  );
}
