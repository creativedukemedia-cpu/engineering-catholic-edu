import type { MetadataRoute } from "next";

/**
 * robots.txt for the redesigned site.
 *
 * Nothing is disallowed on purpose: a college site has no crawl-waste problem
 * worth blocking, and the admission pages are the ones that must be indexed.
 * Search and AI answer crawlers are named so that a later policy change is a
 * deliberate edit rather than an accident.
 *
 * A NOINDEX build (any staging mirror) disallows everything instead, so a
 * preview host cannot be crawled into a duplicate of the production site.
*/
export default function robots(): MetadataRoute.Robots {
  return {
    rules: NOINDEX
      ? [{ userAgent: "*", disallow: "/" }]
      : [{ userAgent: "*", allow: "/" }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
import { NOINDEX, SITE_URL } from "@/lib/site";
