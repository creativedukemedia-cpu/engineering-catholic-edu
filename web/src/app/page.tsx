import Link from "next/link";
import { ProgramFinder } from "@/components/home/ProgramFinder";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";

const paths = [
  {
    title: "Undergraduate",
    line: "Bachelor's degrees and a dual degree.",
    href: "/programs-admission/undergraduate-programs",
  },
  {
    title: "Graduate",
    line: "Master's and doctoral degrees.",
    href: "/programs-admission/graduate-programs",
  },
  {
    title: "Certificates",
    line: "Shorter programs for working engineers.",
    href: "/programs-admission/certificate-programs",
  },
  {
    title: "Research",
    line: "Centers, labs, and faculty.",
    href: "/explore-our-college/centers-institutes-research",
  },
];

const proof = [
  {
    label: "ABET-accredited programs",
    note: "[VERIFY program list on /about/accreditation]",
    href: "/about/accreditation",
  },
  {
    label: "Grand Challenges Scholars",
    note: "[VERIFY since 2016]",
  },
  {
    label: "Partners in Washington",
    note: "[VERIFY NASA, NIH, NIST, NRL, US Navy before naming]",
  },
  {
    label: "Pangborn Hall, Washington, D.C.",
    note: "[VERIFY public address]",
  },
];

const centers = [
  {
    name: "CABRR",
    line: "Applied biomechanics and rehabilitation research with clinical partners.",
    href: "/explore-our-college/centers-institutes-research/center-applied-biomechanics-and-rehabilitation-research-cabrr",
  },
  {
    name: "IACS",
    line: "Astrophysics and computational sciences.",
    href: "/explore-our-college/centers-institutes-research/institute-astrophysics-and-computational-sciences-iacs",
  },
  {
    name: "PHaSER",
    line: "Research center supporting space and computing work.",
    href: "/explore-our-college/centers-institutes-research/phaser",
  },
];

const stories = [
  {
    title: "Maria Erquiaga",
    line: "A double major, and a path toward medicine.",
    video: "https://www.youtube.com/watch?v=O5Yy2gm83QY",
  },
  {
    title: "Bella Reyes",
    line: "The major, the team, and the people around her.",
    video: "https://www.youtube.com/watch?v=HSaOvRlYBNo",
  },
  {
    title: "Elijah Feret",
    line: "Research, and time with faculty.",
    video: "https://www.youtube.com/watch?v=NF017fMKvrE",
  },
];

export default function HomePage() {
  return (
    <>
      <div className="bg-catholic-blue text-white">
        <div
          className="relative aspect-video w-full max-h-[220px] bg-catholic-blue md:max-h-[280px]"
          aria-label="Place a Pangborn or college lab photo here. No text on the image."
        >
          <div className="absolute inset-0 bg-catholic-blue/80" />
        </div>
        <Container className="pb-12 pt-8">
          <h1 className="max-w-xl font-[family-name:var(--font-headline)] text-3xl font-bold leading-tight md:text-5xl">
            Hard problems, taken up in service
          </h1>
          <p className="mt-4 max-w-lg text-lg text-[var(--light-blue)]">
            Engineering, physics, and computing at The Catholic University of America.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button href="/programs-admission/request-information" onDark>
              Request Info
            </Button>
            <Button href="/programs-admission" variant="secondary" onDark>
              Explore Programs
            </Button>
          </div>
        </Container>
      </div>

      <Section id="paths">
        <h2 className="sr-only">Quick paths</h2>
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {paths.map((p) => (
            <li key={p.href}>
              <Link
                href={p.href}
                className="focus-ring block h-full rounded-lg border border-catholic-blue/15 bg-limestone p-4 hover:border-catholic-blue"
              >
                <h3 className="font-[family-name:var(--font-headline)] text-lg font-bold text-catholic-blue">
                  {p.title}
                </h3>
                <p className="mt-2 text-sm">{p.line}</p>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="card">
        <ProgramFinder />
      </Section>

      <Section>
        <h2 className="sr-only">Proof</h2>
        <ul className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory">
          {proof.map((p) => (
            <li
              key={p.label}
              className="min-w-[200px] flex-1 snap-start rounded-lg border border-catholic-blue/10 bg-white p-4"
            >
              {p.href ? (
                <Link href={p.href} className="focus-ring font-semibold text-catholic-blue">
                  {p.label}
                </Link>
              ) : (
                <span className="font-semibold text-catholic-blue">{p.label}</span>
              )}
              <p className="mt-2 text-xs text-catholic-blue/80">{p.note}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="card">
        <h2 className="font-[family-name:var(--font-headline)] text-2xl font-bold text-catholic-blue">
          Research already underway
        </h2>
        <p className="mt-2 text-sm">Read the centers in their own words.</p>
        <ul className="mt-6 flex gap-4 overflow-x-auto snap-x">
          {centers.map((c) => (
            <li key={c.href} className="min-w-[260px] snap-start rounded-lg border border-catholic-blue/15 bg-sandstone p-4">
              <h3 className="font-bold text-catholic-blue">{c.name}</h3>
              <p className="mt-2 text-sm">{c.line}</p>
              <Link href={c.href} className="focus-ring mt-3 inline-block text-sm font-medium text-catholic-red">
                Center page
              </Link>
            </li>
          ))}
        </ul>
        <Link href="/explore-our-college/centers-institutes-research" className="focus-ring mt-4 inline-block text-catholic-blue underline">
          All centers
        </Link>
      </Section>

      <Section>
        <h2 className="font-[family-name:var(--font-headline)] text-2xl font-bold text-catholic-blue">
          Hear from students
        </h2>
        <p className="mt-2 text-sm">Three short films already on this site. No autoplay.</p>
        <ul className="mt-6 space-y-4">
          {stories.map((s) => (
            <li key={s.video} className="rounded-lg border border-catholic-blue/10 bg-limestone p-4">
              <h3 className="font-semibold text-catholic-blue">{s.title}</h3>
              <p className="mt-1 text-sm">{s.line}</p>
              <a
                href={s.video}
                className="focus-ring mt-3 inline-block text-sm font-medium text-catholic-red"
                target="_blank"
                rel="noopener noreferrer"
              >
                Play video
              </a>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="card">
        <h2 className="font-[family-name:var(--font-headline)] text-2xl font-bold text-catholic-blue">
          Artificial intelligence, taught with ethics
        </h2>
        <p className="mt-4 max-w-prose">
          The bachelor's in AI and the master's in AI sit inside a Catholic university. Technical work sits next to the question of how it should be used.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:gap-6">
          <Link
            href="/programs-admission/undergraduate-programs/artificial-intelligence-bs"
            className="focus-ring font-medium text-catholic-red"
          >
            Artificial Intelligence (BS)
          </Link>
          <Link
            href="/programs-admission/graduate-programs/artificial-intelligence-ms"
            className="focus-ring font-medium text-catholic-red"
          >
            Artificial Intelligence (MS)
          </Link>
        </div>
      </Section>

      <Section>
        <h2 className="font-[family-name:var(--font-headline)] text-2xl font-bold text-catholic-blue">
          News and events
        </h2>
        <p className="mt-2 text-sm">
          Stories load from the CMS on the live site. This build links to the index.
        </p>
        <Link href="/connect-contact/news-events" className="focus-ring mt-4 inline-block font-medium text-catholic-red">
          All news
        </Link>
      </Section>

      <Section tone="dark">
        <h2 className="font-[family-name:var(--font-headline)] text-2xl font-bold">
          See the college for yourself
        </h2>
        <p className="mt-2 max-w-prose text-[var(--light-blue)]">
          Visit the labs, or start an application.
        </p>
        <div className="mt-6 flex flex-wrap gap-4">
          <Button href="/programs-admission/visit" onDark>
            Plan a visit
          </Button>
          <Button href="/programs-admission/how-apply-transfers" variant="secondary" onDark>
            Apply
          </Button>
        </div>
      </Section>
    </>
  );
}