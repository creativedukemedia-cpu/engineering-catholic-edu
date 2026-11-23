import Image from "next/image";
import { collegeAddress } from "@/lib/liveContent";
import { OutboundLink } from "@/components/ui/SiteLink";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";

/**
 * The close. One real photograph from the facilities pages, the mailing
 * address the current site prints, and the three actions that matter.
 */
export function VisitBand() {
  return (
    <Section tone="plain" id="visit">
      <Image
        src="/media/facilities-capitol-model.jpg"
        alt="3D printed version of the U.S. Capitol building."
        width={1600}
        height={434}
        priority={false}
        sizes="100vw"
        className="aspect-[21/9] w-full rounded-lg object-cover md:aspect-[7/2]"
      />

      <div className="mt-8 grid grid-cols-1 gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
        <div>
          <p className="eyebrow text-catholic-red">Visit</p>
          <h2 className="font-headline mt-2 text-2xl font-bold leading-tight text-catholic-blue md:text-3xl">
            Engineering and physics, in Washington
          </h2>
          <address className="mt-4 text-sm not-italic leading-relaxed">
            <span className="block font-semibold text-catholic-blue">
              {collegeAddress.department}
            </span>
            <span className="block">{collegeAddress.building}</span>
            <span className="block">{collegeAddress.institution}</span>
            <span className="block">{collegeAddress.street}</span>
            <span className="block">{collegeAddress.cityStateZip}</span>
            <OutboundLink
              href={collegeAddress.mapHref}
              className="mt-3 inline-block text-sm font-medium text-catholic-blue underline decoration-catholic-red decoration-1 underline-offset-4 hover:text-catholic-red hover:decoration-2"
            >
              Facilities and locations
            </OutboundLink>
          </address>
        </div>

        <div className="flex flex-col items-start gap-3 md:items-end">
          <Button href="/programs-admission/visit" size="lg">
            Plan a visit
          </Button>
          <Button href="/programs-admission/request-information" variant="secondary">
            Request information
          </Button>
          <Button href="/programs-admission/how-apply-transfers" variant="quiet">
            How to apply
          </Button>
        </div>
      </div>
    </Section>
  );
}
