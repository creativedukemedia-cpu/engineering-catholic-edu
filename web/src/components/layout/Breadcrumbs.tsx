import Link from "next/link";
import { Container } from "./Container";
import type { Crumb } from "@/lib/content";

/**
 * Breadcrumb trail with the matching BreadcrumbList markup, so the trail a
 * screen reader announces is the trail a search engine sees.
 */
export function Breadcrumbs({
  trail,
  onDark = false,
}: {
  trail: Crumb[];
  onDark?: boolean;
}) {
  if (trail.length <= 1) return null;
  const items = trail.map((c) => ({
    "@type": "ListItem",
    position: trail.indexOf(c) + 1,
    name: c.title,
    item: c.href,
  }));
  return (
    <nav aria-label="Breadcrumb" className="border-b border-black/10 bg-white">
      <Container>
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 py-3 text-sm">
          {trail.map((c, i) => {
            const last = i === trail.length - 1;
            return (
              <li key={`${c.href}-${i}`} className="flex items-center gap-2">
                {i > 0 ? (
                  <span aria-hidden="true" className="text-black/40">
                    /
                  </span>
                ) : null}
                {last ? (
                  <span aria-current="page" className="text-black/70">
                    {c.title}
                  </span>
                ) : (
                  <Link
                    href={c.href}
                    className="text-catholic-blue underline decoration-catholic-red decoration-1 underline-offset-2 hover:text-catholic-red focus-ring"
                  >
                    {c.title}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
        {onDark ? null : (
          <script
            type="application/ld+json"
            suppressHydrationWarning
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                itemListElement: items,
              }),
            }}
          />
        )}
      </Container>
    </nav>
  );
}
