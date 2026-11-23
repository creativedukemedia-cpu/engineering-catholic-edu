import Image from "next/image";
import Link from "next/link";
import type { Block, Card, Run } from "@/lib/content";
import { imageDims } from "@/lib/content";
import { Container } from "@/components/layout/Container";

/**
 * Renders harvested copy with the design system's own type scale.
 *
 * The prose rules are deliberately boring: body text in Roboto at 17px,
 * headings in the condensed headline face, links underlined in Catholic Red.
 * Nothing here reorders or reinterprets the source.
 */

function Runs({ runs }: { runs: Run[] }) {
  return (
    <>
      {runs.map((r, i) => {
        if (r.t === "x") return <span key={i}>{r.x}</span>;
        if (r.t === "s") {
          const cls = `${r.b ? "font-semibold" : ""} ${r.i ? "italic" : ""}`.trim();
          return cls ? <span key={i} className={cls}>{r.x}</span> : <span key={i}>{r.x}</span>;
        }
        const href = r.href;
        const external = href.startsWith("http");
        const mailto = href.startsWith("mailto:") || href.startsWith("tel:");
        const inner = r.x || href;
        const cls =
          "text-catholic-blue underline decoration-catholic-red decoration-1 underline-offset-2 hover:text-catholic-red hover:decoration-2 focus-ring";
        if (external || mailto) {
          return (
            <a
              key={i}
              href={href}
              className={cls}
              {...(external ? { target: "_blank", rel: "noopener noreferrer" } : null)}
            >
              {inner}
            </a>
          );
        }
        return (
          <Link key={i} href={href} className={cls}>
            {inner}
          </Link>
        );
      })}
    </>
  );
}

/**
 * A real image from the old site, or nothing. There is no fallback fill: if a
 * page had no picture the redesign gives it none.
 */
export function ContentImage({
  src,
  alt,
  className = "",
  priority = false,
  sizes = "(min-width: 1120px) 1040px, (min-width: 768px) 90vw, 100vw",
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  const d = imageDims(src);
  const external = src.startsWith("http");
  if (external) {
    // Only used when the origin asset could not be mirrored; alt text is kept.
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={`h-auto w-full rounded-sm ${className}`}
      />
    );
  }
  if (!d) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className={`h-auto w-full rounded-sm ${className}`}
      />
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      width={d.w}
      height={d.h}
      sizes={sizes}
      priority={priority}
      fetchPriority={priority ? "high" : "auto"}
      className={`h-auto w-full rounded-sm ${className}`}
    />
  );
}

function StoryCards({ cards, tone = "light" }: { cards: Card[]; tone?: string }) {
  return (
    <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((c, i) => (
        <li
          key={`${c.href}-${i}`}
          className={
            tone === "dark"
              ? "flex flex-col rounded-sm border border-white/20 bg-catholic-blue"
              : "flex flex-col rounded-sm border border-black/10 bg-white"
          }
        >
          {c.image ? (
            <div className="aspect-[4/3] overflow-hidden rounded-t-sm">
              <ContentImage src={c.image} alt="" sizes="(min-width:1120px) 33vw, 90vw" />
            </div>
          ) : null}
          <div className="flex flex-1 flex-col gap-2 p-5">
            {c.date ? (
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-catholic-red">
                {c.date}
              </p>
            ) : null}
            {c.role ? (
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-catholic-blue">
                {c.role}
              </p>
            ) : null}
            <h3 className="font-[family-name:var(--font-headline)] text-lg font-bold leading-snug">
              {c.href ? (
                <Link
                  href={c.href}
                  className={
                    tone === "dark"
                      ? "text-white underline decoration-bright-red decoration-1 underline-offset-4 hover:decoration-2 focus-ring-dark"
                      : "text-catholic-blue underline decoration-catholic-red decoration-1 underline-offset-4 hover:text-catholic-red hover:decoration-2 focus-ring"
                  }
                >
                  {c.title}
                </Link>
              ) : (
                c.title
              )}
            </h3>
            {c.department ? (
              <p className="text-sm text-black/70">{c.department}</p>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}

export function BlockList({
  blocks,
  className = "",
  headingId = true,
}: {
  blocks: Block[];
  className?: string;
  headingId?: boolean;
}) {
  return (
    <div className={className}>
      {blocks.map((b, i) => {
        if (b.t === "h2") {
          const id = headingId ? slugId(b.x, i) : undefined;
          return (
            <h2
              key={i}
              id={id}
              className="mt-12 mb-4 font-[family-name:var(--font-headline)] text-2xl font-bold text-catholic-blue md:text-3xl"
            >
              {b.x}
            </h2>
          );
        }
        if (b.t === "h3") {
          if (b.href) {
            return (
              <h3 key={i} className="mt-8 mb-3 font-[family-name:var(--font-headline)] text-xl font-bold">
                <Link
                  href={b.href}
                  className="text-catholic-blue underline decoration-catholic-red decoration-1 underline-offset-4 hover:text-catholic-red hover:decoration-2 focus-ring"
                >
                  {b.x}
                </Link>
              </h3>
            );
          }
          return (
            <h3
              key={i}
              className="mt-8 mb-3 font-[family-name:var(--font-headline)] text-xl font-bold text-catholic-blue"
            >
              {b.x}
            </h3>
          );
        }
        if (b.t === "h4") {
          return (
            <h4 key={i} className="mt-6 mb-2 text-base font-bold text-catholic-blue">
              {b.x}
            </h4>
          );
        }
        if (b.t === "p") {
          return (
            <p key={i} className="my-4 max-w-prose leading-relaxed">
              <Runs runs={b.runs} />
            </p>
          );
        }
        if (b.t === "ul" || b.t === "ol") {
          const List = b.t === "ol" ? "ol" : "ul";
          return (
            <List
              key={i}
              className={`my-4 max-w-prose space-y-2 pl-5 leading-relaxed ${
                b.t === "ol" ? "list-decimal" : "list-disc"
              }`}
            >
              {b.items.map((it, j) => (
                <li key={j} className="marker:text-catholic-red">
                  <Runs runs={it} />
                </li>
              ))}
            </List>
          );
        }
        if (b.t === "img") {
          return (
            <figure key={i} className="my-6">
              <ContentImage src={b.src} alt={b.alt} />
              {b.alt ? (
                <figcaption className="mt-2 text-sm text-black/60">{b.alt}</figcaption>
              ) : null}
            </figure>
          );
        }
        if (b.t === "table") {
          const [head, ...rows] = b.rows;
          return (
            <div key={i} className="my-6 overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-left text-sm">
                <thead>
                  <tr>
                    {head?.map((cell, j) => (
                      <th
                        key={j}
                        scope="col"
                        className="border-b-2 border-catholic-red px-3 py-2 font-[family-name:var(--font-headline)] text-base font-bold text-catholic-blue"
                      >
                        {cell}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, j) => (
                    <tr key={j} className="border-b border-black/10">
                      {row.map((cell, k) => (
                        <td key={k} className="px-3 py-2 align-top">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        if (b.t === "cards") {
          return <StoryCards key={i} cards={b.cards} />;
        }
        return null;
      })}
    </div>
  );
}

export function slugId(text: string, index: number) {
  const base = text
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  return base || `section-${index}`;
}

/** In-page section navigation, used by program pages that carry one. */
export function SectionNav({ sections, dark = false }: { sections: string[]; dark?: boolean }) {
  if (sections.length < 2) return null;
  return (
    <nav
      aria-label="On this page"
      className={`mb-8 flex flex-wrap gap-x-5 gap-y-2 border-t pt-4 text-sm ${
        dark ? "border-white/25" : "border-black/10"
      }`}
    >
      {sections.map((s, i) => (
        <a
          key={s}
          href={`#${slugId(s, i)}`}
          className={`underline underline-offset-4 focus-ring ${
            dark
              ? "text-white decoration-bright-red hover:decoration-white focus-ring-dark"
              : "text-catholic-blue decoration-catholic-red hover:text-catholic-red"
          }`}
        >
          {s}
        </a>
      ))}
    </nav>
  );
}

export function ReadingColumn({ children }: { children: React.ReactNode }) {
  return <Container className="max-w-[1120px]">{children}</Container>;
}

export type Entry = {
  title: string;
  href: string;
  image?: string;
  alt?: string;
  excerpt?: string;
};

/**
 * Index-page cards. Every field comes from the old site's own listing copy:
 * the picture it published, the words it used, the page it linked to. A card
 * with no picture gets a colour rule instead of a stand-in image.
 */
export function EntryGrid({
  entries,
  columns = 3,
  caption,
  headingLevel = 3,
}: {
  entries: Entry[];
  columns?: 2 | 3;
  caption?: string;
  headingLevel?: 2 | 3;
}) {
  // A grid that sits directly under the page title must not skip a level.
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <section aria-label={caption} className="mt-6">
      <ul
        className={`grid gap-6 sm:grid-cols-2 ${columns === 3 ? "lg:grid-cols-3" : "lg:grid-cols-2"}`}
      >
        {entries.map((e) => (
          <li
            key={e.href}
            className="flex flex-col overflow-hidden rounded-sm border border-black/10 bg-white"
          >
            {e.image ? (
              <div className="aspect-[16/10] overflow-hidden bg-catholic-blue">
                <ContentImage
                  src={e.image}
                  alt={e.alt || e.title}
                  sizes="(min-width: 1120px) 33vw, (min-width: 768px) 50vw, 100vw"
                />
              </div>
            ) : (
              <div aria-hidden="true" className="h-1.5 w-full bg-catholic-red" />
            )}
            <div className="flex flex-1 flex-col gap-2 p-5">
              <Heading className="font-[family-name:var(--font-headline)] text-lg font-bold leading-snug">
                <Link
                  href={e.href}
                  className="text-catholic-blue underline decoration-catholic-red decoration-1 underline-offset-4 hover:text-catholic-red hover:decoration-2 focus-ring"
                >
                  {e.title}
                </Link>
              </Heading>
              {e.excerpt ? (
                <p className="text-sm leading-relaxed text-black/75">
                  {e.excerpt.length > 230 ? `${e.excerpt.slice(0, 227)}...` : e.excerpt}
                </p>
              ) : null}
              <span
                aria-hidden="true"
                className="mt-auto pt-3 text-sm font-semibold text-catholic-red"
              >
                Learn more
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
