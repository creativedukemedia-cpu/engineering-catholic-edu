import { OutboundLink } from "@/components/ui/SiteLink";

/**
 * One heading pattern for every homepage band, so the page reads as a single
 * argument: a small caps eyebrow, a condensed headline, one plain sentence,
 * and an optional way out of the band.
 */
export function BandHeading({
  eyebrow,
  title,
  lead,
  link,
  onDark = false,
  className = "",
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  link?: { label: string; href: string };
  onDark?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap items-end justify-between gap-x-8 gap-y-3 ${className}`}>
      <div className="max-w-3xl">
        <p
          className={`eyebrow ${
            onDark ? "text-[var(--light-blue)]" : "text-catholic-red"
          }`}
        >
          {eyebrow}
        </p>
        <h2
          className={`font-headline mt-2 text-2xl font-bold leading-tight md:text-3xl ${
            onDark ? "text-white" : "text-catholic-blue"
          }`}
        >
          {title}
        </h2>
        {lead ? (
          <p className={`mt-3 max-w-prose text-[15px] ${onDark ? "text-white" : ""}`}>
            {lead}
          </p>
        ) : null}
      </div>
      {link ? (
        <OutboundLink
          href={link.href}
          onDark={onDark}
          className={`text-sm font-medium whitespace-nowrap ${
            onDark
              ? "text-white underline decoration-[var(--light-blue)] underline-offset-4 hover:decoration-white"
              : "text-catholic-blue underline decoration-catholic-red decoration-1 underline-offset-4 hover:decoration-2 hover:text-catholic-red"
          }`}
        >
          {link.label}
        </OutboundLink>
      ) : null}
    </div>
  );
}
