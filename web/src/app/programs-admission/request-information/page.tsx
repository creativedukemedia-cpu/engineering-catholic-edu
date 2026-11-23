import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { LeadForm, type LeadField } from "@/components/forms/LeadForm";
import {
  breadcrumbsFor,
  getContentPage,
  programPages,
  type Run,
} from "@/lib/content";

export const metadata: Metadata = {
  title: "Request information",
  description:
    "Ask the College of Engineering, Physics, and Computing for information about undergraduate, graduate and certificate programs.",
  alternates: { canonical: "/programs-admission/request-information" },
};

const source = getContentPage("/programs-admission/request-information");

/** Pull the university's own request forms straight out of the harvested copy. */
function universityForms(): { label: string; href: string; blurb?: string }[] {
  if (!source) return [];
  const out: { label: string; href: string; blurb?: string }[] = [];
  let heading = "";
  for (const b of source.blocks) {
    if (b.t === "h2" || b.t === "h3") heading = b.x;
    const runs: Run[][] =
      b.t === "ul" || b.t === "ol"
        ? b.items
        : b.t === "p"
          ? [b.runs]
          : [];
    for (const item of runs) {
      for (const r of item) {
        if (r.t === "a" && /catholic\.edu/.test(r.href) && /request/i.test(r.href)) {
          out.push({ label: heading || r.x || "Request form", href: r.href });
        }
      }
    }
  }
  const seen = new Set<string>();
  return out.filter((f) => (seen.has(f.href) ? false : (seen.add(f.href), true)));
}

const PROGRAM_OPTIONS = [
  ...new Set(
    [
      ...programPages("undergraduate"),
      ...programPages("graduate"),
      ...programPages("certificate"),
      ...programPages("minor"),
    ]
      .filter((p) => p.path.split("/").filter(Boolean).length === 3)
      .map((p) => p.title),
  ),
].sort((a, b) => a.localeCompare(b));

const FIELDS: LeadField[] = [
  { name: "firstName", label: "First name", type: "text", required: true, autoComplete: "given-name" },
  { name: "lastName", label: "Last name", type: "text", required: true, autoComplete: "family-name" },
  { name: "email", label: "Email", type: "email", required: true, autoComplete: "email" },
  { name: "phone", label: "Phone", type: "tel", autoComplete: "tel" },
  {
    name: "level",
    label: "Level of study",
    type: "select",
    options: [
      "Undergraduate, first year",
      "Undergraduate transfer",
      "Graduate, master's",
      "Graduate, doctoral",
      "Certificate",
      "Minor",
      "Pre-college",
      "Parent or counselor",
    ],
  },
  {
    name: "program",
    label: "Program of interest",
    type: "select",
    options: PROGRAM_OPTIONS,
    help: "The list is drawn from the programs this college publishes.",
  },
  {
    name: "message",
    label: "What would you like to know?",
    type: "textarea",
    wide: true,
    help: "Coursework, transfer credit, funding, research opportunities, visiting campus.",
  },
];

export default function RequestInformationPage() {
  const forms = universityForms();
  return (
    <>
      <Breadcrumbs
        trail={
          source?.breadcrumb?.length
            ? breadcrumbsFor(source)
            : [
                { title: "Home", href: "/" },
                { title: "Programs & Admission", href: "/programs-admission" },
                { title: "Request Information", href: "/programs-admission/request-information" },
              ]
        }
      />
      <section className="bg-catholic-blue text-white">
        <Container className="py-10 md:py-14">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-light-blue">
            Programs & Admission
          </p>
          <h1 className="font-[family-name:var(--font-headline)] text-3xl font-bold leading-[1.08] md:text-5xl">
            Request information
          </h1>
          <p className="mt-5 max-w-[70ch] text-base leading-relaxed text-white/90 md:text-lg">
            {source?.lead ??
              "Interested in learning more about the College and our academic programs? Reach out and let us hear from you."}
          </p>
        </Container>
      </section>

      <Container className="py-12 md:py-16">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div>
            <h2 className="font-[family-name:var(--font-headline)] text-2xl font-bold text-catholic-blue">
              Ask the college
            </h2>
            <p className="mt-2 max-w-[70ch] text-sm leading-relaxed text-black/75">
              Tell the college what you are interested in. Fields marked with an asterisk
              are required.
            </p>
            <div className="mt-6 max-w-[720px]">
              <LeadForm
                fields={FIELDS}
                intent="request-information"
                successTitle="Thank you for your interest"
                submitLabel="Send request"
              />
            </div>
          </div>

          <aside className="space-y-8">
            {forms.length ? (
              <div className="rounded-sm bg-limestone p-6">
                <h2 className="font-[family-name:var(--font-headline)] text-lg font-bold text-catholic-blue">
                  The university&rsquo;s forms
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-black/75">
                  Catholic University also runs its own request-information forms for
                  undergraduate and graduate admission.
                </p>
                <ul className="mt-3 space-y-3 text-sm">
                  {forms.map((f) => (
                    <li key={f.href}>
                      <a
                        href={f.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-catholic-blue underline decoration-catholic-red decoration-1 underline-offset-2 hover:text-catholic-red focus-ring"
                      >
                        {f.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="rounded-sm border border-black/10 p-6">
              <h2 className="font-[family-name:var(--font-headline)] text-lg font-bold text-catholic-blue">
                Browse first
              </h2>
              <ul className="mt-3 space-y-2 text-sm">
                {[
                  ["/programs-admission/undergraduate-programs", "Undergraduate programs"],
                  ["/programs-admission/graduate-programs", "Graduate programs"],
                  ["/programs-admission/certificate-programs", "Certificate programs"],
                  ["/programs-admission/undergraduate-programs/minors", "Minors"],
                  ["/programs-admission/scholarships-aid", "Scholarships and aid"],
                  ["/programs-admission/how-apply-transfers", "How to apply and transfers"],
                  ["/programs-admission/visit", "Visit"],
                ].map(([href, label]) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-catholic-blue underline decoration-catholic-red decoration-1 underline-offset-2 hover:text-catholic-red focus-ring"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </Container>
    </>
  );
}
