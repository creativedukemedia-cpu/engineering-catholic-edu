import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { BlockList, ContentImage, SectionNav, slugId } from "@/components/content/Blocks";
import { EntryGrid } from "@/components/content/Blocks";
import { entryCards } from "@/lib/content";
import { Button } from "@/components/ui/Button";
import {
  breadcrumbsFor,
  heroImage,
  relatedStories,
  storyMeta,
  storyNeighbours,
  sectionsOf,
  type Page,
  type Story,
} from "@/lib/content";

/**
 * Page templates for harvested content. Each one takes the source page and
 * nothing else: no section is rendered unless the source filled it in.
 */

function PageHero({
  page,
  kicker,
  hideImage = false,
}: {
  page: Page;
  kicker?: string | null;
  hideImage?: boolean;
}) {
  const img = heroImage(page);
  return (
    <section className="bg-catholic-blue text-white">
      <Container className="py-10 md:py-14">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-light-blue">
          {kicker ?? "The Catholic University of America"}
        </p>
        <h1 className="max-w-[22ch] font-[family-name:var(--font-headline)] text-3xl font-bold leading-[1.08] md:text-5xl">
          {page.title}
        </h1>
        {page.lead ? (
          <p className="mt-5 max-w-[68ch] text-base leading-relaxed text-white/90 md:text-lg">
            {page.lead}
          </p>
        ) : null}
      </Container>
      {img && img.alt && !hideImage ? (
        <Container className="pb-10 md:pb-14">
          <div className="overflow-hidden rounded-sm border border-white/15">
            <ContentImage
              src={img.src}
              alt={img.alt}
              priority
              sizes="(min-width: 1120px) 1040px, 100vw"
            />
          </div>
        </Container>
      ) : null}
    </section>
  );
}

function ContactAside({ page }: { page: Page }) {
  if (page.emails.length === 0 && page.phones.length === 0) return null;
  return (
    <aside className="rounded-sm border border-black/10 bg-limestone p-6">
      <h2 className="font-[family-name:var(--font-headline)] text-lg font-bold text-catholic-blue">
        Contact
      </h2>
      <ul className="mt-3 space-y-2 text-sm">
        {page.emails.map((e) => (
          <li key={e}>
            <a
              href={`mailto:${e}`}
              className="text-catholic-blue underline decoration-catholic-red decoration-1 underline-offset-2 hover:text-catholic-red focus-ring"
            >
              {e}
            </a>
          </li>
        ))}
        {page.phones.map((p) => (
          <li key={p}>
            <a
              href={`tel:${p.replace(/[^\d+]/g, "")}`}
              className="text-catholic-blue underline decoration-catholic-red decoration-1 underline-offset-2 hover:text-catholic-red focus-ring"
            >
              {p}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}

/** Standard inner page: heading band, then the source copy in one column. */
export function ContentPage({ page, kicker }: { page: Page; kicker?: string | null }) {
  const trail = breadcrumbsFor(page);
  const { cards, rest } = entryCards(page);
  const hero = heroImage(page);
  // A listing page reads as picture, title, summary, repeated. It is shown as a
  // grid of links, which is what it is, and the band keeps no picture so the
  // first card image is not repeated as a header.
  const asGrid = cards.length >= 3;
  const body = asGrid
    ? rest
    : page.blocks.filter((b) => !(b.t === "img" && b.src === hero?.src));
  return (
    <>
      <Breadcrumbs trail={trail} />
      <PageHero page={page} kicker={kicker} hideImage={asGrid} />
      <Container className="py-12 md:py-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
          <article className="min-w-0">
            <BlockList blocks={body} />
            {asGrid ? (
              <EntryGrid entries={cards} caption={`${page.title} listing`} />
            ) : null}
          </article>
          <div className="space-y-8">
            <ContactAside page={page} />
            <div className="rounded-sm border border-black/10 p-6">
              <h2 className="font-[family-name:var(--font-headline)] text-lg font-bold text-catholic-blue">
                Explore the college
              </h2>
              <ul className="mt-3 space-y-2 text-sm">
                {[
                  ["/programs-admission", "Programs & Admission"],
                  ["/explore-our-college/centers-institutes-research", "Centers & Institutes"],
                  ["/connect-contact/faculty-directory", "Faculty Directory"],
                  ["/connect-contact/news-events", "News & Events"],
                  ["/connect-contact/contact-us", "Contact Us"],
                ].map(([href, label]) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-catholic-blue underline decoration-catholic-red decoration-1 underline-offset-2 hover:text-catholic-red focus-ring"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Container>
    </>
  );
}

/**
 * Program detail page. The source headings decide the sections. The only added
 * element is the on-page navigation and the standing calls to action, which
 * point at pages that exist.
 */
export function ProgramPage({ page, level }: { page: Page; level: string }) {
  const trail = breadcrumbsFor(page);
  const img = heroImage(page);
  // The picture shown in the page header is not repeated inside the body.
  const blocks = page.blocks.filter(
    (b) => !(b.t === "img" && b.src === img?.src && !!img?.alt),
  );
  const groups = sectionsOf({ ...page, blocks });
  // Some source pages put copy above the first heading. It has no section to
  // belong to, so it renders before them.
  const preGroup = groups.length && !groups[0].heading ? groups[0].blocks : [];
  const rest = groups.length && !groups[0].heading ? groups.slice(1) : groups;
  // Several of them use an h2 for the opening paragraph. A paragraph is not a
  // section title: it becomes the lead, and the real sections start after it.
  const leadGroup = rest.length && rest[0].heading.length > 120 ? rest[0] : null;
  const sections = leadGroup ? rest.slice(1) : rest;
  const headings = sections.map((s) => s.heading).filter(Boolean);
  return (
    <>
      <Breadcrumbs trail={trail} />
      <PageHero page={page} kicker={level} />
      <Container className="py-12 md:py-16">
        <SectionNav sections={headings} />
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
          <article className="min-w-0">
            {preGroup.length ? <BlockList blocks={preGroup} /> : null}
            {leadGroup ? (
              <div className="border-l-4 border-catholic-red pl-4">
                <p className="text-base leading-relaxed text-black/80 md:text-lg">
                  {leadGroup.heading}
                </p>
                {leadGroup.blocks.length ? (
                  <div className="mt-4">
                    <BlockList blocks={leadGroup.blocks} headingId={false} />
                  </div>
                ) : null}
              </div>
            ) : null}
            {sections
              .map((s, i) => (
                <section key={s.heading} id={slugId(s.heading, i)} className="scroll-mt-28">
                  <h2 className="mt-12 mb-4 border-l-4 border-catholic-red pl-4 font-[family-name:var(--font-headline)] text-2xl font-bold text-catholic-blue md:text-3xl">
                    {s.heading}
                  </h2>
                  <BlockList blocks={s.blocks} headingId={false} />
                </section>
              ))}
          </article>
          <div className="space-y-8">
            <div className="rounded-sm bg-catholic-blue p-6 text-white">
              <h2 className="font-[family-name:var(--font-headline)] text-lg font-bold">
                Next steps
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-white/90">
                Talk to the college about this program, or start an application
                through the university.
              </p>
              <div className="mt-4 flex flex-col gap-3">
                <Button href="/programs-admission/request-information" variant="primary" onDark>
                  Request information
                </Button>
                <Button href="/connect-contact/contact-us" variant="secondary" onDark>
                  Contact us
                </Button>
              </div>
            </div>
            <ContactAside page={page} />
          </div>
        </div>
      </Container>
    </>
  );
}

const SHARE_LABELS: Record<string, string> = {
  x: "Share on X",
  linkedin: "Share on LinkedIn",
  facebook: "Share on Facebook",
  email: "Share by email",
};

function shareLinks(story: Story, url: string) {
  const text = encodeURIComponent(story.title);
  const link = encodeURIComponent(url);
  return [
    ["x", `https://twitter.com/intent/tweet?text=${text}&url=${link}`],
    ["linkedin", `https://www.linkedin.com/sharing/share-offsite/?url=${link}`],
    ["facebook", `https://www.facebook.com/sharer/sharer.php?u=${link}`],
    ["email", `mailto:?subject=${text}&body=${link}`],
  ] as [string, string][];
}

/** Blog detail page: date, categories, body, share, related, previous and next. */
export function StoryPage({
  page,
  story,
  url,
}: {
  page: Page;
  story: Story;
  url: string;
}) {
  const trail = breadcrumbsFor(page);
  const body = page.blocks.filter(
    (b) => !(b.t === "img" && b.src === heroImage(page)?.src),
  );
  const meta = storyMeta(page.path);
  const cats = story.categories.length ? story.categories : meta?.categories ?? [];
  const related = relatedStories(story);
  const { prev, next } = storyNeighbours(story);
  const img = heroImage(page);
  return (
    <>
      <Breadcrumbs trail={trail} />
      <article>
        <header className="bg-catholic-blue text-white">
          <Container className="py-10 md:py-14">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-semibold uppercase tracking-[0.14em]">
              {story.dateLabel ? (
                <time dateTime={story.date?.toISOString()}>
                  {story.dateLabel}
                </time>
              ) : null}
              {cats.length ? <span aria-hidden="true" className="text-white/50">·</span> : null}
              {cats.map((c) => (
                <Link
                  key={c}
                  href={`/connect-contact/news-events?category=${encodeURIComponent(c)}`}
                  className="text-light-blue underline-offset-4 hover:underline focus-ring-dark"
                >
                  {c}
                </Link>
              ))}
            </div>
            <h1 className="mt-4 max-w-[26ch] font-[family-name:var(--font-headline)] text-3xl font-bold leading-[1.08] md:text-[44px]">
              {story.title}
            </h1>
            {page.lead ? (
              <p className="mt-5 max-w-[68ch] text-base leading-relaxed text-white/90 md:text-lg">
                {page.lead}
              </p>
            ) : null}
          </Container>
          {img?.alt ? (
            <Container className="pb-10 md:pb-14">
              <div className="overflow-hidden rounded-sm border border-white/15">
                <ContentImage src={img.src} alt={img.alt} priority sizes="(min-width:1120px) 1040px, 100vw" />
              </div>
            </Container>
          ) : null}
        </header>

        <Container className="py-12 md:py-16">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div className="min-w-0">
              <BlockList blocks={body} />
              <div className="mt-10 border-t border-black/10 pt-6">
                <h2 className="text-sm font-semibold uppercase tracking-[0.1em] text-catholic-blue">
                  Share
                </h2>
                <ul className="mt-3 flex flex-wrap gap-3">
                  {shareLinks(story, url).map(([key, href]) => (
                    <li key={key}>
                      <a
                        href={href}
                        {...(key === "email" ? null : { target: "_blank", rel: "noopener noreferrer" })}
                        className="inline-flex min-h-11 items-center rounded-full border-2 border-catholic-blue px-4 text-sm text-catholic-blue hover:bg-catholic-blue hover:text-white focus-ring"
                      >
                        {SHARE_LABELS[key]}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <nav aria-label="More from the college" className="mt-10 grid gap-4 sm:grid-cols-2">
                {prev ? (
                  <Link
                    href={prev.path}
                    className="rounded-sm border border-black/10 p-5 hover:border-catholic-red focus-ring"
                  >
                    <span className="text-xs font-semibold uppercase tracking-[0.1em] text-catholic-red">
                      Newer
                    </span>
                    <span className="mt-1 block font-[family-name:var(--font-headline)] text-base font-bold text-catholic-blue">
                      {prev.title}
                    </span>
                  </Link>
                ) : null}
                {next ? (
                  <Link
                    href={next.path}
                    className="rounded-sm border border-black/10 p-5 hover:border-catholic-red focus-ring"
                  >
                    <span className="text-xs font-semibold uppercase tracking-[0.1em] text-catholic-red">
                      Older
                    </span>
                    <span className="mt-1 block font-[family-name:var(--font-headline)] text-base font-bold text-catholic-blue">
                      {next.title}
                    </span>
                  </Link>
                ) : null}
              </nav>
            </div>

            <div className="space-y-8">
              {related.length ? (
                <aside className="rounded-sm border border-black/10 bg-limestone p-6">
                  <h2 className="font-[family-name:var(--font-headline)] text-lg font-bold text-catholic-blue">
                    Related stories
                  </h2>
                  <ul className="mt-3 space-y-4">
                    {related.map((r) => (
                      <li key={r.slug}>
                        <Link
                          href={r.path}
                          className="text-sm font-semibold text-catholic-blue underline decoration-catholic-red decoration-1 underline-offset-4 hover:text-catholic-red focus-ring"
                        >
                          {r.title}
                        </Link>
                        {r.dateLabel ? (
                          <p className="mt-1 text-xs text-black/60">{r.dateLabel}</p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </aside>
              ) : null}
              <ContactAside page={page} />
            </div>
          </div>
        </Container>
      </article>
    </>
  );
}

/**
 * Faculty and staff profile. The headshot comes from the directory card, which
 * is the only place the old site publishes one. When a person has no photo the
 * layout simply omits it, it never shows a stand-in.
 */
export function PersonPage({
  page,
  person,
}: {
  page: Page;
  person: { name: string; role?: string | null; department?: string | null; image?: string | null };
}) {
  const trail = breadcrumbsFor(page);
  const img = heroImage(page);
  const photo = img ?? (person.image ? { src: person.image, alt: page.title, source: "" } : undefined);
  const body = page.blocks.filter(
    (b) => !(b.t === "img" && img && b.src === img.src),
  );
  return (
    <>
      <Breadcrumbs trail={trail} />
      <Container className="py-10 md:py-14">
        <div className="grid gap-10 lg:grid-cols-[280px_minmax(0,1fr)]">
          <div>
            {photo?.src ? (
              <div className="overflow-hidden rounded-sm border border-black/10">
                <ContentImage src={photo.src} alt={photo.alt || page.title} priority sizes="280px" />
              </div>
            ) : (
              /* Named slot, not a grey box. See docs/audit/open-questions.md. */
              <div className="text-sm text-black/70">
                No photograph is published for this profile.
              </div>
            )}
            {person.role || page.title ? (
              <p className="mt-4 text-sm font-semibold text-catholic-red">
                {person.role ?? page.title}
              </p>
            ) : null}
            {person.department ? (
              <p className="mt-1 text-sm text-black/70">{person.department}</p>
            ) : null}
            <ContactAside page={page} />
          </div>
          <article className="min-w-0">
            <h1 className="font-[family-name:var(--font-headline)] text-3xl font-bold text-catholic-blue md:text-4xl">
              {page.title}
            </h1>
            {page.lead ? (
              <p className="mt-4 max-w-[68ch] text-lg leading-relaxed text-black/80">
                {page.lead}
              </p>
            ) : null}
            <div className="mt-6">
              <BlockList blocks={body} />
            </div>
            <p className="mt-10 text-sm">
              <Link
                href="/connect-contact/faculty-directory"
                className="text-catholic-blue underline decoration-catholic-red decoration-1 underline-offset-2 hover:text-catholic-red focus-ring"
              >
                Back to the faculty directory
              </Link>
            </p>
          </article>
        </div>
      </Container>
    </>
  );
}
