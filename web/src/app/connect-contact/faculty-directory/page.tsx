import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ContentImage } from "@/components/content/Blocks";
import { departmentsFromDirectory, directoryPeople, type Person } from "@/lib/content";

// The page is chosen from the URL and every listing is filtered from data
// already in the repo, so this route blocks instead of streaming a shell.
// With cacheComponents, URL data read outside <Suspense> must say so.
export const instant = false;

export const metadata: Metadata = {
  title: "Faculty and staff directory",
  description:
    "Faculty and staff of the College of Engineering, Physics, and Computing, listed by name, rank and department.",
  alternates: { canonical: "/connect-contact/faculty-directory" },
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter((p) => /^[A-Za-z]/.test(p))
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");
}

function PersonCard({ person }: { person: Person }) {
  return (
    <article className="flex h-full flex-col gap-4 rounded-sm border border-black/10 bg-white p-5">
      {person.image ? (
        <div className="h-44 w-full overflow-hidden rounded-sm bg-limestone">
          <ContentImage
            src={person.image}
            alt={`${person.name}`}
            sizes="(min-width: 1120px) 25vw, (min-width: 768px) 50vw, 100vw"
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        /* No headshot on the source page. A monogram is a design element, not a
           stand-in photograph, so it is labelled hidden from assistive tech. */
        <div
          aria-hidden="true"
          className="flex h-44 w-full items-center justify-center rounded-sm bg-catholic-blue font-[family-name:var(--font-headline)] text-4xl font-bold text-white"
        >
          {initials(person.name)}
        </div>
      )}
      <div className="flex flex-1 flex-col gap-1">
        <h2 className="font-[family-name:var(--font-headline)] text-lg font-bold leading-snug">
          <Link
            href={person.href}
            className="text-catholic-blue underline decoration-catholic-red decoration-1 underline-offset-4 hover:text-catholic-red hover:decoration-2 focus-ring"
          >
            {person.name}
          </Link>
        </h2>
        {person.role ? (
          <p className="text-sm text-black/75">{person.role}</p>
        ) : null}
        {person.department ? (
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.08em] text-catholic-blue">
            {person.department}
          </p>
        ) : null}
      </div>
    </article>
  );
}

export default async function FacultyDirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ department?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const department = (sp.department ?? "").trim();
  const q = (sp.q ?? "").trim();
  const people = directoryPeople();
  const departments = departmentsFromDirectory();
  const needle = q.toLowerCase();
  const filtered = people.filter((p) => {
    if (department && p.department !== department) return false;
    if (needle) {
      const hay = `${p.name} ${p.role ?? ""} ${p.department ?? ""}`.toLowerCase();
      if (!hay.includes(needle)) return false;
    }
    return true;
  });
  const base = "/connect-contact/faculty-directory";
  const link = (dept: string) => {
    const p = new URLSearchParams();
    if (dept) p.set("department", dept);
    if (q) p.set("q", q);
    const s = p.toString();
    return `${base}${s ? `?${s}` : ""}`;
  };

  return (
    <>
      <Breadcrumbs
        trail={[
          { title: "Home", href: "/" },
          { title: "Connect & Contact", href: "/connect-contact" },
          { title: "Faculty Directory", href: base },
        ]}
      />
      <section className="bg-catholic-blue text-white">
        <Container className="py-10 md:py-14">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-light-blue">
            Connect & Contact
          </p>
          <h1 className="font-[family-name:var(--font-headline)] text-3xl font-bold leading-[1.08] md:text-5xl">
            Faculty and staff directory
          </h1>
          <p className="mt-5 max-w-[70ch] text-base leading-relaxed text-white/90 md:text-lg">
            {people.length} profiles across the college&rsquo;s departments and centers.
            Each profile keeps the biography, research interests and contact details the
            college publishes.
          </p>
        </Container>
      </section>

      <Container className="py-10 md:py-14">
        <div className="grid gap-10 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside>
            <form method="get" action={base}>
              <label htmlFor="q" className="mb-1 block text-sm font-semibold text-catholic-blue">
                Find a person
              </label>
              <div className="flex gap-2">
                <input
                  id="q"
                  name="q"
                  type="search"
                  defaultValue={q}
                  placeholder="Name or rank"
                  className="h-11 w-full rounded-sm border border-black/30 px-3 text-base focus-ring"
                />
                <button
                  type="submit"
                  className="inline-flex min-h-11 shrink-0 items-center rounded-full bg-catholic-red px-4 text-sm font-medium text-white hover:bg-white hover:text-catholic-red focus-ring"
                >
                  Search
                </button>
              </div>
              {department ? (
                <input type="hidden" name="department" value={department} />
              ) : null}
            </form>

            <nav aria-label="Departments" className="mt-8">
              <h2 className="font-[family-name:var(--font-headline)] text-base font-bold text-catholic-blue">
                Departments
              </h2>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link
                    href={link("")}
                    className={
                      department
                        ? "text-catholic-blue underline decoration-catholic-red underline-offset-2 focus-ring"
                        : "font-semibold text-catholic-red"
                    }
                  >
                    All departments
                  </Link>
                </li>
                {departments.map((d) => (
                  <li key={d}>
                    <Link
                      href={link(d)}
                      className={
                        department === d
                          ? "font-semibold text-catholic-red"
                          : "text-catholic-blue underline decoration-catholic-red decoration-1 underline-offset-2 hover:text-catholic-red focus-ring"
                      }
                    >
                      {d}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          <div>
            <p className="text-sm text-black/70" aria-live="polite">
              Showing {filtered.length} of {people.length} profiles.
            </p>
            {filtered.length ? (
              <ul className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((p) => (
                  <li key={p.href}>
                    <PersonCard person={p} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-6 rounded-sm border border-black/10 bg-limestone p-6 text-sm">
                No profile matches that search.{" "}
                <Link href={base} className="text-catholic-blue underline decoration-catholic-red underline-offset-2 focus-ring">
                  Show the full directory
                </Link>
                .
              </p>
            )}
          </div>
        </div>
      </Container>
    </>
  );
}
