import Image from "next/image";
import {
  collegeAddress,
  copyrightLine,
  giveLink,
  legalLinks,
  socialLinks,
  universityLinks,
} from "@/lib/liveContent";
import { contactLink, navGroups, utilityLinks } from "@/lib/nav";
import { type NavLink } from "@/lib/nav";
import { Container } from "./Container";
import { SiteLink, OutboundLink } from "@/components/ui/SiteLink";
import { Button } from "@/components/ui/Button";

/**
 * Footer, in four tiers, from the college out to the university.
 *
 * Tier 1 the college: the official logo on a white plate (the mark carries
 * near-black letterforms, so it never sits directly on Catholic Blue), the
 * mailing address the current site prints, and the give link.
 * Tier 2 navigation, derived from the same nav data the header uses, so the
 * two can never drift apart.
 * Tier 3 university links every CUA site is expected to carry.
 * Tier 4 legal, language, and accessibility links, plus the copyright line.
 *
 * Every link text and href is recorded in docs/design-notes/
 * 2026-11-23-homepage-content.md. Text sits on Catholic Blue: white is
 * 13.12:1 and Light Blue 5.38:1, so both pass AA at any size.
 */

const UNIVERSITY_HOME = "https://www.catholic.edu";

/** Footer columns come from nav data so the header and footer cannot drift. */
const columns = navGroups.map((group) => {
  const seen = new Set<string>();
  const links: NavLink[] = [];
  for (const column of group.columns) {
    for (const link of column.links) {
      if (seen.has(link.href)) continue;
      // One department out of six reads as a mistake. The directory above it
      // is the honest way out until every department page is rebuilt.
      if (link.href.startsWith("/explore-our-college/departments/")) continue;
      seen.add(link.href);
      links.push(link);
    }
  }
  return { ...group, links: links.slice(0, 7) };
});

const connectColumn: NavLink[] = [
  contactLink,
  ...utilityLinks.filter((l) => l.label !== "Visit"),
  { label: "News & Events", href: "/connect-contact/news-events" },
];

const linkListClass = "mt-4 space-y-2.5";
const linkClass = "text-sm text-white hover:text-white hover:underline hover:decoration-2";
const quietLinkClass =
  "text-xs text-[var(--light-blue)] underline-offset-4 hover:text-white hover:underline";

export function SiteFooter() {
  return (
    <footer className="bg-catholic-blue text-white">
      <Container className="py-12 md:py-16">
        {/* Tier 1: the college. */}
        <div className="flex flex-col gap-8 border-b border-white/25 pb-10 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-sm">
            <div className="inline-flex rounded-lg bg-white px-5 py-4">
              <Image
                src="/brand/cua-logo-horizontal.svg"
                alt="The Catholic University of America logo"
                width={297}
                height={34}
                unoptimized
                className="h-8 w-auto"
              />
            </div>
            <p className="font-headline mt-5 text-lg font-bold leading-snug">
              {collegeAddress.department}
            </p>
            <address className="mt-3 text-sm not-italic leading-relaxed text-[var(--light-blue)]">
              <span className="block">{collegeAddress.building}</span>
              <span className="block">{collegeAddress.institution}</span>
              <span className="block">
                {collegeAddress.street}, {collegeAddress.cityStateZip}
              </span>
              <OutboundLink
                href={collegeAddress.mapHref}
                onDark
                className="mt-2 inline-block text-sm text-white underline decoration-[var(--light-blue)] underline-offset-4 hover:decoration-white"
              >
                Facilities and locations
              </OutboundLink>
            </address>
          </div>

          <div className="lg:max-w-sm">
            <p className="eyebrow text-[var(--light-blue)]">{giveLink.label}</p>
            <p className="mt-3 text-sm leading-relaxed">{giveLink.line}</p>
            <div className="mt-4">
              <Button href={giveLink.href} onDark>
                Make a gift
              </Button>
            </div>
            <nav aria-label="Social media" className="mt-8">
              <h2 className="eyebrow text-[var(--light-blue)]">Follow the university</h2>
              <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
                {socialLinks.map((s) => (
                  <li key={s.href}>
                    <OutboundLink
                      href={s.href}
                      hint={`Opens ${s.label} in a new tab`}
                      onDark
                      className="text-sm text-white underline decoration-[var(--light-blue)] underline-offset-4 hover:decoration-white"
                    >
                      {s.label}
                    </OutboundLink>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        {/* Tier 2: navigation, from the same data as the header. */}
        <nav aria-label="Site" className="grid grid-cols-2 gap-x-8 gap-y-10 py-10 lg:grid-cols-4">
          {columns.map((group) => (
            <div key={group.id}>
              <h2 className="eyebrow text-[var(--light-blue)]">
                <OutboundLink
                  href={group.href}
                  onDark
                  className="font-headline text-white hover:underline hover:decoration-2"
                >
                  {group.label}
                </OutboundLink>
              </h2>
              <ul className={linkListClass}>
                {group.links.map((link) => (
                  <li key={link.href}>
                    <SiteLink link={link} className={linkClass}>
                      {link.label}
                    </SiteLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <h2 className="eyebrow text-[var(--light-blue)]">Connect</h2>
            <ul className={linkListClass}>
              {connectColumn.map((link) => (
                <li key={link.href}>
                  <SiteLink link={link} className={linkClass} />
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Tier 3: the university. */}
        <nav
          aria-label="Catholic University of America"
          className="flex flex-wrap gap-x-6 gap-y-2 border-t border-white/25 py-8"
        >
          <a href={UNIVERSITY_HOME} className={`${linkClass} font-medium`} target="_blank" rel="noopener noreferrer">
            catholic.edu
          </a>
          {universityLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              title="Opens the university site in a new tab"
              className={quietLinkClass}
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* Tier 4: required links and copyright. */}
        <div className="flex flex-col gap-6 border-t border-white/25 pt-8 md:flex-row md:items-start md:justify-between">
          <nav aria-label="Legal and policies" className="flex flex-wrap gap-x-5 gap-y-2">
            {legalLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                title="Opens the university site in a new tab"
                className={quietLinkClass}
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="md:text-right">
            <p className="text-xs text-[var(--light-blue)]">{copyrightLine}</p>
            <a
              href="#main-content"
              className="focus-ring-dark mt-2 inline-block text-xs text-white underline decoration-[var(--light-blue)] underline-offset-4 hover:decoration-white"
            >
              Back to top
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
