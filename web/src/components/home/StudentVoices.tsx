import Image from "next/image";
import { films, studentLife, studentLifeHref } from "@/lib/liveContent";
import { OutboundLink } from "@/components/ui/SiteLink";
import { Section } from "@/components/layout/Section";
import { BandHeading } from "./Band";

/**
 * Students in their own words, then the campus photographs that back it up.
 * The films are links to the same three videos already on the current site.
 * Nothing autoplays, and the thumbnails are those videos' own frames, so the
 * card is honest about what clicking does.
 */
export function StudentVoices() {
  return (
    <Section id="students">
      <BandHeading
        eyebrow="Student experience"
        title="Hear from our students"
        lead="Three short films from students in the college, hosted on the university's YouTube channel."
        link={{ label: "Student experience", href: studentLifeHref }}
      />

      <ul className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        {films.map((f) => (
          <li key={f.videoId}>
            <OutboundLink
              href={`https://www.youtube.com/watch?v=${f.videoId}`}
              hint="Plays the film on YouTube in a new tab"
              className="group block h-full overflow-hidden rounded-lg border border-catholic-blue/15 bg-limestone hover:border-catholic-blue"
            >
              <span className="relative block">
                <Image
                  src={f.thumb}
                  alt=""
                  width={1280}
                  height={720}
                  sizes="(max-width: 767px) 100vw, 404px"
                  className="aspect-video w-full object-cover"
                />
                <span
                  aria-hidden="true"
                  className="absolute inset-0 flex items-end justify-end p-3"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-catholic-red ring-2 ring-white">
                    <svg viewBox="0 0 12 14" className="ml-0.5 h-3.5 w-3.5 fill-white">
                      <path d="M0 0l12 7-12 7z" />
                    </svg>
                  </span>
                </span>
              </span>
              <span className="sr-only">{`Film by ${f.person}: ${f.title}`}</span>
              <span className="block p-4">
                <span className="eyebrow block text-catholic-red">{f.person}</span>
                <span className="font-headline mt-2 block text-lg font-bold leading-snug text-catholic-blue group-hover:text-catholic-red">
                  {f.title}
                </span>
                <span className="mt-2 block text-sm leading-relaxed">{f.blurb}</span>
              </span>
            </OutboundLink>
          </li>
        ))}
      </ul>

      <h3 className="font-headline mt-12 text-xl font-bold text-catholic-blue">
        Beyond the classroom
      </h3>
      <p className="mt-2 text-sm">
        Photographs from the college&rsquo;s own student experience pages.
      </p>
      <ul className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {studentLife.map((s) => (
          <li key={s.image} className="overflow-hidden rounded-lg border border-catholic-blue/15 bg-white">
            <Image
              src={s.image}
              alt={s.alt}
              width={1200}
              height={801}
              sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 404px"
              className="aspect-[16/9] w-full object-cover"
            />
            <span className="block p-4">
              <span className="font-headline block text-base font-bold text-catholic-blue">
                {s.label}
              </span>
              <span className="mt-1.5 block text-sm">{s.line}</span>
            </span>
          </li>
        ))}
      </ul>
    </Section>
  );
}
