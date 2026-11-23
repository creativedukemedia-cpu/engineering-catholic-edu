import Image from "next/image";
import { contentRetrieved, newsLeadIn, newsLinks, stories } from "@/lib/liveContent";
import { OutboundLink } from "@/components/ui/SiteLink";
import { Section } from "@/components/layout/Section";
import { BandHeading } from "./Band";

const linkClass =
  "text-sm font-medium text-catholic-blue underline decoration-catholic-red decoration-1 underline-offset-4 hover:text-catholic-red hover:decoration-2";

/**
 * News, with the dates the current site gives. No event is given a date here:
 * the live events index listed one item when this was mined, so the band links
 * to it instead of freezing a placeholder on the homepage.
 */
export function NewsBand() {
  // Newest first. The live index mixes in a featured item, so the dates here
  // are ordered rather than copied, which is the one thing a reader checks.
  const byNewest = [...stories].sort((a, b) => b.iso.localeCompare(a.iso));
  const [lead, ...rest] = byNewest;

  return (
    <Section tone="plain" id="news">
      <BandHeading
        eyebrow="News & events"
        title="Latest from the college"
        lead={newsLeadIn}
        link={{ label: "All stories", href: newsLinks[0].href }}
      />

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
        <OutboundLink
          href={lead.href}
          className="group block overflow-hidden rounded-lg border border-catholic-blue/15 bg-limestone hover:border-catholic-blue"
        >
          {lead.image ? (
            <Image
              src={lead.image}
              alt={lead.imageAlt ?? ""}
              width={lead.width ?? 800}
              height={lead.height ?? 600}
              sizes="(max-width: 1023px) 100vw, 416px"
              className="aspect-[4/3] w-full object-cover"
            />
          ) : null}
          <span className="block p-5">
            <time className="eyebrow block text-catholic-red" dateTime={lead.iso}>
              {lead.date}
            </time>
            <span className="font-headline mt-2 block text-xl font-bold leading-snug text-catholic-blue group-hover:text-catholic-red">
              {lead.title}
            </span>
            <span className="eyebrow mt-4 block text-catholic-red">
              Read the story <span aria-hidden="true">&rarr;</span>
            </span>
          </span>
        </OutboundLink>

        <div>
          <ul className="divide-y divide-catholic-blue/10">
            {rest.map((s) => (
              <li key={s.href} className="py-3 first:pt-0">
                <OutboundLink href={s.href} className={`group flex gap-4 ${linkClass}`}>
                  <time
                    dateTime={s.iso}
                    className="font-headline mt-0.5 w-14 shrink-0 text-catholic-red"
                  >
                    <span className="block text-sm font-bold leading-none">
                      {s.month} {s.day}
                    </span>
                  </time>
                  <span className="text-[15px] leading-snug text-catholic-blue group-hover:text-catholic-red">
                    {s.title}
                  </span>
                </OutboundLink>
              </li>
            ))}
          </ul>

          <div className="mt-6 rounded-lg bg-catholic-blue p-5 text-white">
            <h3 className="font-headline text-lg font-bold">Events</h3>
            <p className="mt-2 text-sm text-[var(--light-blue)]">
              Seminars, colloquia, and info sessions are listed on the events
              index.
            </p>
            <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
              {newsLinks.slice(1).map((l) => (
                <li key={l.href}>
                  <OutboundLink
                    href={l.href}
                    onDark
                    className="text-sm font-medium text-white underline decoration-[var(--light-blue)] underline-offset-4 hover:decoration-white"
                  >
                    {l.label}
                  </OutboundLink>
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-4 text-xs text-catholic-blue">
            Stories, dates, and links from the current site, retrieved{" "}
            {contentRetrieved}.
          </p>
        </div>
      </div>
    </Section>
  );
}
