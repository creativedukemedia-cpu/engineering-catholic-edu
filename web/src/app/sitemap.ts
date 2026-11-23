import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getContentPage, servedPaths } from "@/lib/content";

/**
 * Every path this build serves, in the old site's own URL shape.
 *
 * Priority follows how much of a decision a page carries: the homepage and the
 * program indexes first, program and center pages next, then the people and the
 * archive. The only exclusion is /search, which has no results page to land on.
 * A story's lastModified is the date the college published it.
 */

const SKIP = new Set(["/search"]);

function priorityFor(path: string): number {
  if (path === "/") return 1;
  const page = getContentPage(path);
  const type = page?.type ?? "hand";
  const depth = path.split("/").filter(Boolean).length;
  if (type === "hand") {
    if (path === "/programs-admission") return 0.9;
    if (path.endsWith("-programs") || path.endsWith("/minors")) return 0.9;
    if (path === "/connect-contact/news-events") return 0.8;
    return 0.7;
  }
  if (type.startsWith("program-") || type === "minor") return 0.8;
  if (type === "story") return 0.6;
  if (type === "faculty") return 0.4;
  if (type === "center" || type === "department") return depth <= 3 ? 0.7 : 0.5;
  return depth <= 2 ? 0.6 : 0.5;
}

function changeFrequencyFor(path: string): MetadataRoute.Sitemap[number]["changeFrequency"] {
  const type = getContentPage(path)?.type;
  if (path === "/connect-contact/news-events") return "daily";
  if (type === "story") return "monthly";
  if (type === "faculty") return "yearly";
  return "monthly";
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return servedPaths()
    .filter((p) => !SKIP.has(p))
    .map((path) => {
      const published = getContentPage(path)?.published;
      return {
        url: `${SITE_URL}${path}`,
        lastModified: published ? new Date(published) : now,
        changeFrequency: changeFrequencyFor(path),
        priority: priorityFor(path),
      };
    });
}
