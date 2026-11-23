import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { BlockList, EntryGrid, type Entry } from "@/components/content/Blocks";
import { Button } from "@/components/ui/Button";
import {
  breadcrumbsFor,
  entryCards,
  getContentPage,
  hasContent,
  programPages,
  type Page,
} from "@/lib/content";

/**
 * One template for the four program indexes.
 *
 * The lead copy, the per-program summaries and the photography all come from
 * the harvested index page itself, so the redesign says exactly what the
 * college already published. Where the source page has no listing copy, the
 * grid falls back to the program pages that exist, in alphabetical order.
 */

export type ProgramCard = Entry & { level: string };

const LEVELS = {
  undergraduate: {
    path: "/programs-admission/undergraduate-programs",
    title: "Undergraduate programs",
    crumb: { title: "Undergraduate Programs", href: "/programs-admission/undergraduate-programs" },
    level: "Undergraduate",
    blurb:
      "Bachelor's degrees in engineering, computing, physics and the fields between them, taught in Washington, D.C.",
  },
  graduate: {
    path: "/programs-admission/graduate-programs",
    title: "Graduate programs",
    crumb: { title: "Graduate Programs", href: "/programs-admission/graduate-programs" },
    level: "Graduate",
    blurb:
      "Master's and doctoral degrees, on campus and online, with research in the college's laboratories and centers.",
  },
  certificate: {
    path: "/programs-admission/certificate-programs",
    title: "Certificate programs",
    crumb: { title: "Certificate Programs", href: "/programs-admission/certificate-programs" },
    level: "Certificate",
    blurb:
      "Graduate certificates for working professionals, built from graduate coursework that can count toward a master's degree.",
  },
  minor: {
    path: "/programs-admission/undergraduate-programs/minors",
    title: "Minors",
    crumb: {
      title: "Minors",
      href: "/programs-admission/undergraduate-programs/minors",
    },
    level: "Minor",
    blurb:
      "Minors for Catholic University undergraduates in any major, from artificial intelligence to applied space weather research.",
  },
} as const;

export type ProgramLevel = keyof typeof LEVELS;

function fallbackCards(level: ProgramLevel): ProgramCard[] {
  const kind =
    level === "undergraduate"
      ? "program-undergraduate"
      : level === "graduate"
        ? "program-graduate"
        : level === "certificate"
          ? "program-certificate"
          : "minor";
  return programPages(
    level === "undergraduate"
      ? "undergraduate"
      : level === "graduate"
        ? "graduate"
        : level === "certificate"
          ? "certificate"
          : "minor",
  )
    // A program sits directly under its level. Anything deeper, such as an
    // enrollment data page, belongs to a program rather than being one.
    .filter((p) => p.type === kind && p.path.split("/").filter(Boolean).length === 3)
    .map((p) => ({
      title: p.title,
      href: p.path,
      excerpt: p.lead ?? undefined,
      image: p.photo ?? undefined,
      alt: p.photo ? p.title : undefined,
      level,
    }));
}

export function programCards(level: ProgramLevel): {
  page: Page | undefined;
  cards: ProgramCard[];
  rest: ProgramCard[];
} {
  const source = getContentPage(LEVELS[level].path);
  const harvested: ProgramCard[] = source
    ? entryCards(source).cards.map((c) => ({ ...c, level }))
    : [];
  const seen = new Set(harvested.map((c) => c.href));
  const extra = fallbackCards(level).filter((c) => !seen.has(c.href) && hasContent(c.href));
  return { page: source, cards: harvested, rest: extra };
}

export function programIndexMetadata(level: ProgramLevel): Metadata {
  const meta = LEVELS[level];
  const source = getContentPage(meta.path);
  const description =
    source?.description || `${meta.title} at the College of Engineering, Physics, and Computing.`;
  return {
    title: meta.title,
    description,
    alternates: { canonical: meta.path },
    openGraph: {
      type: "website",
      url: `https://engineering.catholic.edu${meta.path}`,
      title: meta.title,
      description,
    },
  };
}

export function ProgramIndexView({
  level,
  query = "",
}: {
  level: ProgramLevel;
  query?: string;
}) {
  const meta = LEVELS[level];
  const { page, cards, rest } = programCards(level);
  const all = [...cards, ...rest];
  const needle = query.trim().toLowerCase();
  const shown = needle
    ? all.filter((c) =>
        `${c.title} ${c.excerpt ?? ""}`.toLowerCase().includes(needle),
      )
    : all;
  const trail = page ? breadcrumbsFor(page) : [{ title: "Home", href: "/" }, { title: meta.title, href: meta.path }];
  const leadParagraphs = page
    ? entryCards(page).rest.filter((b) => b.t !== "cards")
    : [];

  return (
    <>
      <Breadcrumbs trail={trail} />
      <section className="bg-catholic-blue text-white">
        <Container className="py-10 md:py-14">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-light-blue">
            Programs & Admission
          </p>
          <h1 className="font-[family-name:var(--font-headline)] text-3xl font-bold leading-[1.08] md:text-5xl">
            {meta.title}
          </h1>
          <p className="mt-5 max-w-[70ch] text-base leading-relaxed text-white/90 md:text-lg">
            {page?.lead ?? meta.blurb}
          </p>
          <p className="mt-4 text-sm text-white/75">
            {all.length} {all.length === 1 ? "program" : "programs"} listed, each linking to
            its own page.
          </p>
        </Container>
      </section>

      <Container className="py-10 md:py-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <form method="get" action={meta.path} className="flex w-full max-w-md gap-2">
            <label htmlFor="q" className="sr-only">
              Search {meta.title.toLowerCase()}
            </label>
            <input
              id="q"
              name="q"
              type="search"
              defaultValue={query}
              placeholder="Search programs"
              className="h-11 w-full rounded-sm border border-black/30 px-3 text-base focus-ring"
            />
            <button
              type="submit"
              className="inline-flex min-h-11 shrink-0 items-center rounded-full bg-catholic-red px-5 text-sm font-medium text-white hover:bg-white hover:text-catholic-red focus-ring"
            >
              Search
            </button>
          </form>
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {(Object.keys(LEVELS) as ProgramLevel[])
              .filter((k) => k !== level)
              .map((k) => (
                <li key={k}>
                  <Link
                    href={LEVELS[k].path}
                    className="text-catholic-blue underline decoration-catholic-red decoration-1 underline-offset-4 hover:text-catholic-red focus-ring"
                  >
                    {LEVELS[k].title}
                  </Link>
                </li>
              ))}
          </ul>
        </div>

        {shown.length ? (
          <EntryGrid entries={shown} caption={meta.title} headingLevel={2} />
        ) : (
          <p className="mt-6 rounded-sm border border-black/10 bg-limestone p-6 text-sm">
            No program matches “{query}”.{" "}
            <Link
              href={meta.path}
              className="text-catholic-blue underline decoration-catholic-red underline-offset-2 focus-ring"
            >
              Show all {meta.title.toLowerCase()}
            </Link>
            .
          </p>
        )}

        {leadParagraphs.length ? (
          <div className="mt-14 border-t border-black/10 pt-2">
            <BlockList blocks={leadParagraphs} />
          </div>
        ) : null}

        <div className="mt-14 rounded-sm bg-limestone p-8">
          <h2 className="font-[family-name:var(--font-headline)] text-xl font-bold text-catholic-blue">
            Questions about {meta.title.toLowerCase()}?
          </h2>
          <p className="mt-2 max-w-[70ch] text-sm leading-relaxed text-black/80">
            The college answers questions about coursework, transfer credit, funding and
            start dates.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button href="/programs-admission/request-information">Request information</Button>
            <Button href="/connect-contact/contact-us" variant="secondary">
              Contact us
            </Button>
          </div>
        </div>
      </Container>
    </>
  );
}
