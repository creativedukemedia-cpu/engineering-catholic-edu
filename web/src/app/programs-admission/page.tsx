import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { BlockList, ContentImage, EntryGrid } from "@/components/content/Blocks";
import { Button } from "@/components/ui/Button";
import { ProgramFinder } from "@/components/home/ProgramFinder";
import { breadcrumbsFor, entryCards, getContentPage, heroImage } from "@/lib/content";

export const metadata: Metadata = {
  title: "Programs and admission",
  description:
    "Undergraduate, graduate, certificate and pre-college programs at the College of Engineering, Physics, and Computing, and how to apply.",
  alternates: { canonical: "/programs-admission" },
};

/**
 * The admission hub. Every sentence and picture is the college's own: this
 * renders the harvested copy of /programs-admission, keeps its section links,
 * and adds the program finder already used on the homepage.
 */
const source = getContentPage("/programs-admission");

export default function ProgramsAdmissionHub() {
  if (!source) {
    return (
      <Container className="py-16">
        <h1 className="font-[family-name:var(--font-headline)] text-3xl font-bold text-catholic-blue">
          Programs &amp; Admission
        </h1>
        <p className="mt-4 max-w-[70ch] text-sm">
          Program listings are unavailable right now. Call the college office on
          202-319-5160 and the staff will help you find the right program.
        </p>
      </Container>
    );
  }
  const { cards, rest } = entryCards(source);
  const img = heroImage(source);
  const navList = rest.find((b) => b.t === "ul" || b.t === "ol");
  const prose = rest.filter((b) => b !== navList);

  return (
    <>
      <Breadcrumbs trail={breadcrumbsFor(source)} />
      <section className="bg-catholic-blue text-white">
        <Container className="py-10 md:py-14">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-light-blue">
            Programs & Admission
          </p>
          <h1 className="font-[family-name:var(--font-headline)] text-3xl font-bold leading-[1.08] md:text-5xl">
            {source.title}
          </h1>
          {source.lead ? (
            <p className="mt-5 max-w-[70ch] text-base leading-relaxed text-white/90 md:text-lg">
              {source.lead}
            </p>
          ) : null}
          <div className="mt-6 flex flex-wrap gap-3">
            <Button href="/programs-admission/request-information">Request information</Button>
            <Button href="/programs-admission/how-apply-transfers" variant="secondary" onDark>
              How to apply
            </Button>
          </div>
        </Container>
        {img?.alt ? (
          <Container className="pb-10 md:pb-14">
            <div className="overflow-hidden rounded-sm border border-white/15">
              <ContentImage
                src={img.src}
                alt={img.alt}
                priority
                sizes="(min-width:1120px) 1040px, 100vw"
              />
            </div>
          </Container>
        ) : null}
      </section>

      {navList && (navList.t === "ul" || navList.t === "ol") ? (
        <div className="border-b border-black/10 bg-white">
          <Container className="py-5">
            <nav aria-label="In this section">
              <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                {navList.items.map((item, i) => (
                  <li key={i}>
                    <BlockList
                      blocks={[{ t: "p", runs: item }]}
                      className="[&_p]:my-0 [&_p]:max-w-none [&_p]:font-semibold"
                    />
                  </li>
                ))}
              </ul>
            </nav>
          </Container>
        </div>
      ) : null}

      <Container className="py-12 md:py-16">
        <BlockList blocks={prose.filter((b) => b.t !== "h2")} />
        {cards.length >= 2 ? (
          <EntryGrid entries={cards} caption="Sections of Programs and admission" />
        ) : null}
      </Container>

      <section className="bg-sandstone py-12 md:py-16">
        <Container>
          <h2 className="font-[family-name:var(--font-headline)] text-2xl font-bold text-catholic-blue md:text-3xl">
            Find your program
          </h2>
          <p className="mt-2 max-w-[70ch] text-sm leading-relaxed text-black/75">
            Filter what the college offers by level. Each result opens that
            program&rsquo;s own page.
          </p>
          <div className="mt-6">
            <ProgramFinder />
          </div>
          <p className="mt-8">
            <Link
              href="/programs-admission/undergraduate-programs/minors"
              className="text-catholic-blue underline decoration-catholic-red decoration-1 underline-offset-4 hover:text-catholic-red focus-ring"
            >
              Browse the minors
            </Link>
          </p>
        </Container>
      </section>
    </>
  );
}
