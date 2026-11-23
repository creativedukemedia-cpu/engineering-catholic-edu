import Link from "next/link";
import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ContentImage } from "@/components/content/Blocks";
import { allStories, newsCategories, storyYears, type Story } from "@/lib/content";

// The page is chosen from the URL and every listing is filtered from data
// already in the repo, so this route blocks instead of streaming a shell.
// With cacheComponents, URL data read outside <Suspense> must say so.
export const instant = false;

export const metadata: Metadata = {
  title: "News and events",
  description:
    "Research, awards, student work and college announcements from the College of Engineering, Physics, and Computing.",
  alternates: { canonical: "/connect-contact/news-events" },
};

const PER_PAGE = 10;

function qs({
  q,
  category,
  year,
  page,
}: {
  q?: string;
  category?: string;
  year?: string;
  page?: number;
}) {
  const p = new URLSearchParams();
  if (q) p.set("q", q);
  if (category) p.set("category", category);
  if (year) p.set("year", year);
  if (page && page > 1) p.set("page", String(page));
  const s = p.toString();
  return s ? `?${s}` : "";
}

function StoryCard({ story }: { story: Story }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-sm border border-black/10 bg-white">
      {story.image ? (
        <div className="aspect-[4/3] overflow-hidden bg-catholic-blue">
          <ContentImage
            src={story.image.src}
            alt={story.image.alt || story.title}
            sizes="(min-width: 1120px) 33vw, (min-width: 768px) 50vw, 100vw"
          />
        </div>
      ) : (
        /* The source published no teaser for this story, so the card is type only. */
        <div className="flex aspect-[4/3] items-end bg-catholic-blue p-5">
          <span className="font-[family-name:var(--font-headline)] text-4xl font-bold leading-none text-bright-red">
            CEPC
          </span>
        </div>
      )}
      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold uppercase tracking-[0.08em]">
          {story.dateLabel ? (
            <time dateTime={story.date?.toISOString()} className="text-catholic-red">
              {story.dateLabel}
            </time>
          ) : null}
          {story.categories.map((c) => (
            <span key={c} className="text-catholic-blue">
              {c}
            </span>
          ))}
        </div>
        <h2 className="font-[family-name:var(--font-headline)] text-lg font-bold leading-snug">
          <Link
            href={story.path}
            className="text-catholic-blue underline decoration-catholic-red decoration-1 underline-offset-4 hover:text-catholic-red hover:decoration-2 focus-ring"
          >
            {story.title}
          </Link>
        </h2>
        {story.excerpt ? (
          <p className="text-sm leading-relaxed text-black/75">{story.excerpt.slice(0, 180)}</p>
        ) : null}
      </div>
    </article>
  );
}

export default async function NewsEventsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; year?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const category = (sp.category ?? "").trim();
  const year = (sp.year ?? "").trim();
  const page = Math.max(1, Number(sp.page ?? "1") || 1);

  const all = allStories();
  const years = storyYears(all);
  const needle = q.toLowerCase();
  const filtered = all.filter((s) => {
    if (category && !s.categories.includes(category)) return false;
    if (year && (!s.date || String(s.date.getUTCFullYear()) !== year)) return false;
    if (needle) {
      const hay = `${s.title} ${s.excerpt} ${s.categories.join(" ")}`.toLowerCase();
      if (!hay.includes(needle)) return false;
    }
    return true;
  });

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const current = Math.min(page, pages);
  const slice = filtered.slice((current - 1) * PER_PAGE, current * PER_PAGE);
  const active = Boolean(q || category || year);
  const base = "/connect-contact/news-events";

  return (
    <>
      <Breadcrumbs
        trail={[
          { title: "Home", href: "/" },
          { title: "Connect & Contact", href: "/connect-contact" },
          { title: "News & Events", href: base },
        ]}
      />
      <section className="bg-catholic-blue text-white">
        <Container className="py-10 md:py-14">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-light-blue">
            Connect & Contact
          </p>
          <h1 className="font-[family-name:var(--font-headline)] text-3xl font-bold leading-[1.08] md:text-5xl">
            News and events
          </h1>
          <p className="mt-5 max-w-[70ch] text-base leading-relaxed text-white/90 md:text-lg">
            {all.length} stories from the college, in the order the old site published
            them, each at its original web address.
          </p>
        </Container>
      </section>

      <Container className="py-10 md:py-14">
        <form method="get" action={base} className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto_auto_auto] md:items-end">
          <div>
            <label htmlFor="q" className="mb-1 block text-sm font-semibold text-catholic-blue">
              Search stories
            </label>
            <input
              id="q"
              name="q"
              type="search"
              defaultValue={q}
              placeholder="Keyword, name or topic"
              className="h-11 w-full rounded-sm border border-black/30 px-3 text-base focus-ring"
            />
          </div>
          <div>
            <label htmlFor="category" className="mb-1 block text-sm font-semibold text-catholic-blue">
              Category
            </label>
            <select
              id="category"
              name="category"
              defaultValue={category}
              className="h-11 w-full rounded-sm border border-black/30 bg-white px-3 text-base focus-ring md:w-auto"
            >
              <option value="">All categories</option>
              {newsCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="year" className="mb-1 block text-sm font-semibold text-catholic-blue">
              Year
            </label>
            <select
              id="year"
              name="year"
              defaultValue={year}
              className="h-11 w-full rounded-sm border border-black/30 bg-white px-3 text-base focus-ring md:w-auto"
            >
              <option value="">All years</option>
              {years.map((y) => (
                <option key={y} value={String(y)}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              className="inline-flex min-h-11 items-center rounded-full bg-catholic-red px-6 text-sm font-medium text-white transition-colors hover:bg-white hover:text-catholic-red focus-ring"
            >
              Apply
            </button>
            {active ? (
              <Link
                href={base}
                className="inline-flex min-h-11 items-center rounded-full border-2 border-catholic-blue px-5 text-sm text-catholic-blue hover:bg-catholic-blue hover:text-white focus-ring"
              >
                Clear
              </Link>
            ) : null}
          </div>
        </form>

        <p className="mt-6 text-sm text-black/70" aria-live="polite">
          Showing {slice.length === 0 ? 0 : (current - 1) * PER_PAGE + 1} to{" "}
          {Math.min(current * PER_PAGE, filtered.length)} of {filtered.length} stories
          {active ? " that match your filters" : ""}.
        </p>

        {slice.length ? (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {slice.map((s) => (
              <StoryCard key={s.slug} story={s} />
            ))}
          </div>
        ) : (
          <p className="mt-6 rounded-sm border border-black/10 bg-limestone p-6 text-sm">
            No story matches that search. Try a shorter phrase, or{" "}
            <Link
              href={base}
              className="text-catholic-blue underline decoration-catholic-red underline-offset-2 focus-ring"
            >
              see every story
            </Link>
            .
          </p>
        )}

        {pages > 1 ? (
          <nav aria-label="Story pages" className="mt-10 flex flex-wrap items-center gap-2">
            {current > 1 ? (
              <Link
                href={`${base}${qs({ q, category, year, page: current - 1 })}`}
                className="inline-flex min-h-11 items-center rounded-full border-2 border-catholic-blue px-4 text-sm text-catholic-blue hover:bg-catholic-blue hover:text-white focus-ring"
              >
                Previous
              </Link>
            ) : null}
            {Array.from({ length: pages }, (_, i) => i + 1).map((n) =>
              n === current ? (
                <span
                  key={n}
                  aria-current="page"
                  className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full bg-catholic-blue px-4 text-sm font-semibold text-white"
                >
                  {n}
                </span>
              ) : (
                <Link
                  key={n}
                  href={`${base}${qs({ q, category, year, page: n })}`}
                  className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-black/25 px-4 text-sm text-catholic-blue hover:border-catholic-red focus-ring"
                >
                  {n}
                </Link>
              ),
            )}
            {current < pages ? (
              <Link
                href={`${base}${qs({ q, category, year, page: current + 1 })}`}
                className="inline-flex min-h-11 items-center rounded-full border-2 border-catholic-blue px-4 text-sm text-catholic-blue hover:bg-catholic-blue hover:text-white focus-ring"
              >
                Next
              </Link>
            ) : null}
          </nav>
        ) : null}
      </Container>
    </>
  );
}
