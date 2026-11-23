import Image from "next/image";
import Link from "next/link";
import { centers } from "@/lib/liveContent";
import { OutboundLink } from "@/components/ui/SiteLink";
import { Section } from "@/components/layout/Section";
import { BandHeading } from "./Band";

/**
 * Centers and institutes. Four tiles use the photograph the live site pairs
 * with that center. PHaSER has no verifiable tile, so it shows without a
 * picture rather than with a guess.
 */
export function CentersBand() {
  const tiles = centers.map((c) => ({
    ...c,
    // The live pages title themselves "Full Name (ACRONYM)". Show the acronym
    // only where the site uses one, so Space Weather Center does not repeat.
    acronym: c.short !== c.name && !c.short.includes(" ") ? c.short : null,
  }));

  return (
    <Section tone="card" id="centers">
      <BandHeading
        eyebrow="Centers & institutes"
        title="Where the work happens"
        lead="Research in the college runs through its centers and institutes, from biomechanics to space weather."
        link={{ label: "All centers and institutes", href: "/explore-our-college/centers-institutes-research" }}
      />
      <ul className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tiles.map((c) => {
          const external = c.href.startsWith("http");
          const inner = (
            <>
              {c.image ? (
                <>
                  <Image
                    src={c.image}
                    alt={c.alt ?? ""}
                    width={1200}
                    height={801}
                    sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 404px"
                    className="aspect-[16/9] w-full object-cover"
                  />
                </>
              ) : (
                <span className="flex aspect-[16/9] w-full items-center justify-center bg-catholic-blue p-6">
                  <span className="font-headline text-center text-lg font-bold text-white">
                    {c.name}
                  </span>
                </span>
              )}
              <span className="block p-4">
                {c.acronym ? (
                  <span className="eyebrow block text-catholic-red">{c.acronym}</span>
                ) : null}
                {c.image ? (
                  <span
                    className={`font-headline block text-lg font-bold leading-snug text-catholic-blue group-hover:text-catholic-red ${
                      c.acronym ? "mt-1.5" : ""
                    }`}
                  >
                    {c.name}
                  </span>
                ) : null}
                <span className="mt-2 block text-sm leading-relaxed">{c.line}</span>
                <span className="eyebrow mt-4 block text-catholic-red">
                  Learn more <span aria-hidden="true">&rarr;</span>
                </span>
              </span>
            </>
          );
          const cls =
            "focus-ring group block h-full overflow-hidden rounded-lg border border-catholic-blue/15 bg-white hover:border-catholic-blue";
          return (
            <li key={c.href}>
              {external ? (
                <OutboundLink
                  href={c.href}
                  hint="Opens the center's own site on a Catholic University domain"
                  className={cls}
                >
                  {inner}
                </OutboundLink>
              ) : (
                <Link href={c.href} className={cls}>
                  {inner}
                </Link>
              )}
            </li>
          );
        })}
        <li>
          <Link
            href="/explore-our-college/centers-institutes-research"
            className="focus-ring group flex h-full min-h-[16rem] flex-col justify-between rounded-lg bg-catholic-blue p-5 text-white"
          >
            <span>
              <span className="eyebrow block text-[var(--light-blue)]">Start here</span>
              <span className="font-headline mt-3 block text-xl font-bold leading-snug">
                Browse every center, institute, and lab
              </span>
            </span>
            <span className="eyebrow mt-6 block">
              Open the directory <span aria-hidden="true">&rarr;</span>
            </span>
          </Link>
        </li>
      </ul>
    </Section>
  );
}
