import type { MetadataRoute } from "next";

/**
 * Sitemap for the redesigned site.
 *
 * It lists the routes this build actually serves. The current site's remaining
 * URLs are deliberately absent: they belong to the redirect map
 * (docs/redirects/, launch checklist), and a sitemap that promises pages the
 * build does not have is worse than a short one. Pages still on the old site
 * keep their existing URLs and their own entries until they are rebuilt.
 *
 * Add a route here the day its page.tsx lands.
 */
type Entry = { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] };

const entries: Entry[] = [
  { path: "/", priority: 1.0, changeFrequency: "weekly" },

  // Programs and admission, the lead-generation pages.
  { path: "/programs-admission", priority: 0.9, changeFrequency: "weekly" },
  { path: "/programs-admission/undergraduate-programs", priority: 0.9, changeFrequency: "monthly" },
  { path: "/programs-admission/graduate-programs", priority: 0.9, changeFrequency: "monthly" },
  { path: "/programs-admission/certificate-programs", priority: 0.8, changeFrequency: "monthly" },
  { path: "/programs-admission/request-information", priority: 0.8, changeFrequency: "yearly" },
  { path: "/programs-admission/how-apply-transfers", priority: 0.8, changeFrequency: "monthly" },
  { path: "/programs-admission/visit", priority: 0.8, changeFrequency: "monthly" },

  // Undergraduate degree pages.
  ...[
    "artificial-intelligence-bs",
    "biomedical-engineering-bbe",
    "chemical-physics-bs",
    "civil-engineering-bce",
    "computer-science-bs",
    "electrical-and-computer-engineering-bece",
    "environmental-engineering-bs",
    "mechanical-engineering-bme",
    "physics-bs",
  ].map((slug) => ({
    path: `/programs-admission/undergraduate-programs/${slug}`,
    priority: 0.7,
    changeFrequency: "monthly" as const,
  })),
  {
    path: "/programs-admission/undergraduate-programs/minors",
    priority: 0.6,
    changeFrequency: "monthly" as const,
  },

  // Graduate degree pages.
  ...[
    "artificial-intelligence-ms",
    "civil-engineering-ms",
    "data-analytics-ms",
    "engineering-management-ms",
  ].map((slug) => ({
    path: `/programs-admission/graduate-programs/${slug}`,
    priority: 0.7,
    changeFrequency: "monthly" as const,
  })),
  {
    path: "/programs-admission/certificate-programs/engineering-management-professional-certificate",
    priority: 0.6,
    changeFrequency: "monthly" as const,
  },

  // The college, research, and people.
  { path: "/explore-our-college/mission-vision/deans-welcome", priority: 0.6, changeFrequency: "yearly" },
  { path: "/explore-our-college/centers-institutes-research", priority: 0.8, changeFrequency: "weekly" },
  { path: "/explore-our-college/centers-institutes-research/center-applied-biomechanics-and-rehabilitation-research-cabrr", priority: 0.6, changeFrequency: "monthly" },
  { path: "/explore-our-college/centers-institutes-research/institute-astrophysics-and-computational-sciences-iacs", priority: 0.6, changeFrequency: "monthly" },
  { path: "/explore-our-college/centers-institutes-research/phaser", priority: 0.6, changeFrequency: "monthly" },
  { path: "/explore-our-college/centers-institutes-research/space-weather-center", priority: 0.6, changeFrequency: "monthly" },
  { path: "/explore-our-college/departments/department-civil-and-environmental-engineering", priority: 0.6, changeFrequency: "monthly" },
  { path: "/connect-contact/news-events", priority: 0.7, changeFrequency: "daily" },
  { path: "/connect-contact/contact-us", priority: 0.5, changeFrequency: "yearly" },
  { path: "/connect-contact/faculty-directory/chuan-fu-lin", priority: 0.4, changeFrequency: "yearly" },
  { path: "/about", priority: 0.5, changeFrequency: "yearly" },
  { path: "/about/accreditation", priority: 0.5, changeFrequency: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return entries.map((e) => ({
    url: `${SITE_URL}${e.path === "/" ? "/" : e.path}`,
    // Evaluated when the route is generated, so the stamp is the build date.
    lastModified: new Date(),
    changeFrequency: e.changeFrequency,
    priority: e.priority,
  }));
}
import { SITE_URL } from "@/lib/site";
