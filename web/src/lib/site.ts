/**
 * The origin this site considers canonical, and whether it may be indexed.
 *
 * The production default is the university's domain, because that is where
 * these URLs belong once the redesign launches: canonical links, Open Graph,
 * JSON-LD and the sitemap all resolve there.
 *
 * Indexing is safe-by-default rather than index-by-default. A container built
 * without thinking is a mirror of a live university site, and a mirror that
 * search engines index competes with the original. So an image sets NOINDEX
 * unless a production build deliberately passes NOINDEX=false (see Dockerfile),
 * and a plain local dev server falls back to the origin test below.
 */
export const PRODUCTION_URL = "https://engineering.catholic.edu";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? PRODUCTION_URL
).replace(/\/$/, "");

/** True only when this build claims the real domain. */
export const IS_PRODUCTION = SITE_URL === PRODUCTION_URL;

/** Explicit NOINDEX wins; otherwise a non-production origin is never indexed. */
export const NOINDEX =
  process.env.NOINDEX === "true"
    ? true
    : process.env.NOINDEX === "false"
      ? false
      : !IS_PRODUCTION;
