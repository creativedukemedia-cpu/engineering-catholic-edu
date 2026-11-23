import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {

  contentPaths,
  getContentPage,
  heroImage,
  storyMeta,
  allStories,
  personBySlug,
  type Page,
} from "@/lib/content";
import { SITE_URL } from "@/lib/site";
import {
  ContentPage,
  PersonPage,
  ProgramPage,
  StoryPage,
} from "@/components/templates/ContentTemplates";

// The page is chosen from the URL and every listing is filtered from data
// already in the repo, so this route blocks instead of streaming a shell.
// With cacheComponents, URL data read outside <Suspense> must say so.
export const instant = false;

/**
 * Serves every harvested page under its original production path.
 *
 * The old site's URL structure is kept on purpose: a link published in a
 * brochure, a search index or an alumni email still resolves. Hand-authored
 * routes are static segments, so they take precedence over this catch-all and
 * the homepage, program indexes, blog index and directory are untouched.
 *
 * A path outside the harvested set is a 404: generateMetadata and the page
 * both call notFound(), which is what the link checker asserts. The route
 * segment config `dynamicParams` is not available with cacheComponents, so
 * the check lives in the code rather than in a flag.
 */

const LEVEL_LABEL: Record<string, string> = {
  "program-undergraduate": "Undergraduate program",
  "program-graduate": "Graduate program",
  "program-certificate": "Certificate program",
  minor: "Minor",
  admission: "Programs & Admission",
  department: "Department",
  center: "Centers, institutes and research",
  mission: "Mission and vision",
  explore: "Explore the college",
  connect: "Connect & Contact",
  about: "About the college",
  news: "News & Events",
  faculty: "Faculty & Staff",
  student: "Student resources",
  page: "",
  search: "",
};

export function generateStaticParams() {
  return contentPaths().map((p) => ({ path: p.split("/").filter(Boolean) }));
}

function pathOf(segments?: string[]) {
  const clean = (segments ?? []).map((s) => decodeURIComponent(s)).filter(Boolean);
  return clean.length ? `/${clean.join("/")}` : "/";
}

function pageTypeLabel(page: Page) {
  return LEVEL_LABEL[page.type] ?? "";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ path?: string[] }>;
}): Promise<Metadata> {
  const { path } = await params;
  const page = getContentPage(pathOf(path));
  if (!page) return {};
  const img = heroImage(page);
  const label = pageTypeLabel(page);
  const title = `${page.title}${label ? ` | ${label}` : ""}`;
  const description =
    page.description || page.lead || `${page.title} at the Catholic University of America.`;
  return {
    title,
    description,
    alternates: { canonical: page.path },
    openGraph: {
      type: page.type === "story" ? "article" : "website",
      url: `${SITE_URL}${page.path}`,
      title: page.title,
      description,
      ...(page.published ? { publishedTime: page.published } : null),
      ...(img ? { images: [{ url: img.src, alt: img.alt || page.title }] } : null),
    },
    twitter: {
      card: img ? "summary_large_image" : "summary",
      title: page.title,
      description,
      ...(img ? { images: [img.src] } : null),
    },
  };
}

function ArticleJsonLd({ page }: { page: Page }) {
  if (page.type !== "story") return null;
  const meta = storyMeta(page.path);
  const img = heroImage(page);
  const story = allStories().find((s) => s.path === page.path);
  const data = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: page.title,
    url: `${SITE_URL}${page.path}`,
    datePublished: meta?.date ?? page.published ?? undefined,
    description: page.description ?? page.lead ?? undefined,
    publisher: {
      "@type": "CollegeOrUniversity",
      name: "The Catholic University of America",
    },
    ...(img ? { image: [`${SITE_URL}${img.src}`] } : null),
    ...(story?.dateLabel ? { dateModified: story.date?.toISOString() } : null),
  };
  return (
    <script
      type="application/ld+json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default async function ContentRoute({
  params,
}: {
  params: Promise<{ path?: string[] }>;
}) {
  const { path } = await params;
  const page = getContentPage(pathOf(path));
  if (!page) notFound();

  if (page.type === "story") {
    const story = allStories().find((s) => s.path === page.path);
    if (story) {
      return (
        <>
          <ArticleJsonLd page={page} />
          <StoryPage page={page} story={story} url={`${SITE_URL}${page.path}`} />
        </>
      );
    }
  }

  if (page.type === "faculty") {
    const slug = page.path.split("/").filter(Boolean).pop() ?? "";
    const person = personBySlug(slug);
    return (
      <>
        <PersonPage page={page} person={person ?? { name: page.title }} />
      </>
    );
  }

  if (page.type.startsWith("program") || page.type === "minor") {
    return <ProgramPage page={page} level={pageTypeLabel(page)} />;
  }

  return <ContentPage page={page} kicker={pageTypeLabel(page) || null} />;
}
