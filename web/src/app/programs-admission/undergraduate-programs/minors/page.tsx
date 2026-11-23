import {

  ProgramIndexView,
  programIndexMetadata,
} from "@/components/templates/ProgramIndex";

// The page is chosen from the URL and every listing is filtered from data
// already in the repo, so this route blocks instead of streaming a shell.
// With cacheComponents, URL data read outside <Suspense> must say so.
export const instant = false;

export const metadata = programIndexMetadata("minor");

/**
 * Program index for minor offerings, generated from the college's own listing
 * copy. The search box filters the list on the server so each result view is
 * a real URL a prospective student can share.
 */
export default async function MinorIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  return <ProgramIndexView level="minor" query={sp.q ?? ""} />;
}
