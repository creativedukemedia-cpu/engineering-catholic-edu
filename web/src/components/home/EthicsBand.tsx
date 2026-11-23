import { centers, type Center } from "@/lib/liveContent";
import { OutboundLink } from "@/components/ui/SiteLink";
import { Section } from "@/components/layout/Section";

const cair: Center | undefined = centers.find((c) => c.short === "CAIR");

const degreeLinks = [
  {
    label: "Artificial Intelligence (BS)",
    href: "/programs-admission/undergraduate-programs/artificial-intelligence-bs",
    note: "A bachelor's degree in the college's own departments.",
  },
  {
    label: "Artificial Intelligence (MS)",
    href: "/programs-admission/graduate-programs/artificial-intelligence-ms",
    note: "A master's degree for engineers and professionals.",
  },
];

/**
 * The mission band, and the one place the page uses the editorial serif at
 * length. Catholic identity is stated once, plainly, with restraint.
 */
export function EthicsBand() {
  return (
    <Section tone="card" id="mission">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="max-w-prose">
          <p className="eyebrow text-catholic-red">Mission</p>
          <h2 className="font-headline mt-2 text-2xl font-bold leading-tight text-catholic-blue md:text-3xl">
            Artificial intelligence, taught with ethics
          </h2>
          <p className="font-editorial mt-5 text-lg leading-8">
            The bachelor&rsquo;s degree in AI and the master&rsquo;s in AI sit inside a
            Catholic university. Technical work sits next to the question of how
            it should be used.
          </p>
          <p className="font-editorial mt-4 text-lg leading-8">
            The same question runs through the rest of the college: research
            ethics in the labs, service in the community, and the common good in
            the city outside Pangborn Hall.
          </p>
        </div>

        <aside className="rounded-lg border border-catholic-blue/15 bg-white p-5">
          <h3 className="eyebrow text-catholic-blue">Study and research</h3>
          <ul className="mt-4 space-y-4">
            {degreeLinks.map((d) => (
              <li key={d.href} className="border-b border-catholic-blue/10 pb-4 last:border-0 last:pb-0">
                <OutboundLink
                  href={d.href}
                  className="font-headline block text-base font-bold text-catholic-blue hover:text-catholic-red"
                >
                  {d.label}
                </OutboundLink>
                <span className="mt-1 block text-sm">{d.note}</span>
              </li>
            ))}
            {cair ? (
              <li>
                <OutboundLink
                  href={cair.href}
                  hint="Opens the center's own site on a Catholic University domain"
                  className="font-headline block text-base font-bold text-catholic-blue hover:text-catholic-red"
                >
                  {cair.name}
                </OutboundLink>
                <span className="mt-1 block text-sm">{cair.line}</span>
              </li>
            ) : null}
          </ul>
        </aside>
      </div>
    </Section>
  );
}
