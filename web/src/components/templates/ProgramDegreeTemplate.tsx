import Link from "next/link";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";

export type DegreeProgramContent = {
  title: string;
  credential: string;
  overview: string;
  atAGlance: string[];
  outcomes: string[];
  curriculum: string;
  tracks?: { name: string; detail: string }[];
  sampleCourses: string[];
  careers: string;
  research: string;
  accreditation: string;
  enrollmentNote: string;
  faq: { q: string; a: string }[];
};

export function ProgramDegreeTemplate({ content }: { content: DegreeProgramContent }) {
  return (
  <>
    <Section tone="dark">
      <p className="text-sm text-[var(--light-blue)]">Programs &amp; Admission</p>
      <h1 className="mt-2 font-[family-name:var(--font-headline)] text-3xl font-bold md:text-4xl">
        {content.title}
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-white/95">{content.overview}</p>
      <div className="mt-8 flex flex-wrap gap-4">
        <Button href="/programs-admission/request-information" onDark>
          Request Info
        </Button>
        <Button href="/programs-admission/how-apply-transfers" variant="secondary" onDark>
          Apply
        </Button>
        <Button href="/programs-admission/visit" variant="quiet" onDark>
          Visit
        </Button>
      </div>
    </Section>

    <Section>
      <h2 className="font-[family-name:var(--font-headline)] text-2xl font-bold text-catholic-blue">
        At a glance
      </h2>
      <ul className="mt-4 list-disc space-y-2 pl-5">
        {content.atAGlance.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </Section>

    <Section tone="card">
      <h2 className="font-[family-name:var(--font-headline)] text-2xl font-bold text-catholic-blue">
        Outcomes
      </h2>
      <ul className="mt-4 list-disc space-y-2 pl-5">
        {content.outcomes.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </Section>

    <Section>
      <h2 className="font-[family-name:var(--font-headline)] text-2xl font-bold text-catholic-blue">
        Curriculum and credits
      </h2>
      <p className="mt-4 max-w-prose">{content.curriculum}</p>
    </Section>

    {content.tracks && content.tracks.length > 0 && (
      <Section tone="card">
        <h2 className="font-[family-name:var(--font-headline)] text-2xl font-bold text-catholic-blue">
          Tracks and concentrations
        </h2>
        <ul className="mt-4 space-y-4">
          {content.tracks.map((t) => (
            <li key={t.name}>
              <h3 className="font-semibold text-catholic-blue">{t.name}</h3>
              <p className="mt-1 max-w-prose text-sm">{t.detail}</p>
            </li>
          ))}
        </ul>
      </Section>
    )}

    <Section>
      <h2 className="font-[family-name:var(--font-headline)] text-2xl font-bold text-catholic-blue">
        Sample courses
      </h2>
      <ul className="mt-4 list-disc space-y-1 pl-5">
        {content.sampleCourses.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>
    </Section>

    <Section tone="card">
      <h2 className="font-[family-name:var(--font-headline)] text-2xl font-bold text-catholic-blue">
        Careers
      </h2>
      <p className="mt-4 max-w-prose">{content.careers}</p>
    </Section>

    <Section>
      <h2 className="font-[family-name:var(--font-headline)] text-2xl font-bold text-catholic-blue">
        Research and faculty
      </h2>
      <p className="mt-4 max-w-prose">{content.research}</p>
      <Link href="/explore-our-college/departments/department-civil-and-environmental-engineering" className="focus-ring mt-4 inline-block text-catholic-red font-medium">
        Department of Civil and Environmental Engineering
      </Link>
    </Section>

    <Section tone="card">
      <h2 className="font-[family-name:var(--font-headline)] text-2xl font-bold text-catholic-blue">
        Accreditation
      </h2>
      <p className="mt-4 max-w-prose">{content.accreditation}</p>
      <Link href="/about/accreditation" className="focus-ring mt-2 inline-block text-sm text-catholic-blue underline">
        Full accreditation list
      </Link>
    </Section>

    <Section>
      <h2 className="font-[family-name:var(--font-headline)] text-2xl font-bold text-catholic-blue">
        Enrollment and graduation
      </h2>
      <p className="mt-4 max-w-prose text-sm">{content.enrollmentNote}</p>
    </Section>

    <Section tone="card">
      <h2 className="font-[family-name:var(--font-headline)] text-2xl font-bold text-catholic-blue">
        FAQ
      </h2>
      <dl className="mt-4 space-y-4">
        {content.faq.map((item) => (
          <div key={item.q}>
            <dt className="font-semibold text-catholic-blue">{item.q}</dt>
            <dd className="mt-1 max-w-prose text-sm">{item.a}</dd>
          </div>
        ))}
      </dl>
    </Section>

    <Section tone="dark">
      <h2 className="font-[family-name:var(--font-headline)] text-2xl font-bold">Admissions</h2>
      <p className="mt-2 max-w-prose text-[var(--light-blue)]">
        Ready to start? Request materials or begin your application.
      </p>
      <div className="mt-6 flex flex-wrap gap-4">
        <Button href="/programs-admission/request-information" onDark>
          Request Info
        </Button>
        <Button href="/programs-admission/how-apply-transfers" variant="secondary" onDark>
          Apply
        </Button>
      </div>
    </Section>
  </>
  );
}