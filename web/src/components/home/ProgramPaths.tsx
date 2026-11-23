import Image from "next/image";
import Link from "next/link";
import { programPaths } from "@/lib/liveContent";
import { BandHeading } from "./Band";

/**
 * The four ways into the college, first on the page after the hero because
 * prospective students and parents are the largest audience. Each card carries
 * its own real photograph from the current site.
 */
export function ProgramPaths() {
  return (
    <div>
      <BandHeading
        eyebrow="Programs & admission"
        title="Start where you are"
        lead="Four routes into engineering, physics, and computing at Catholic University."
        link={{ label: "All programs", href: "/programs-admission" }}
      />
      <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* No entrance animation here. This band sits below the fold, so a
            load-time fade only risks content that paints after the scroll. */}
        {programPaths.map((p) => (
          <li key={p.href}>
            <Link
              href={p.href}
              className="focus-ring group block h-full overflow-hidden rounded-lg border border-catholic-blue/15 bg-limestone hover:border-catholic-blue"
            >
              <span className="block overflow-hidden">
                <Image
                  src={p.image}
                  alt=""
                  width={1200}
                  height={801}
                  sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 308px"
                  className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </span>
              <span className="sr-only">{p.alt}</span>
              <span className="block p-4">
                <span className="font-headline block text-xl font-bold text-catholic-blue group-hover:text-catholic-red">
                  {p.title}
                </span>
                <span className="mt-2 block text-sm leading-relaxed">{p.line}</span>
                <span className="eyebrow mt-4 block text-catholic-red">
                  {p.cta} <span aria-hidden="true">&rarr;</span>
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
