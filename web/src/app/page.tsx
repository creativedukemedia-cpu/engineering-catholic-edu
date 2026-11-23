import { Hero } from "@/components/home/Hero";
import { ProgramFinder } from "@/components/home/ProgramFinder";
import { ProgramPaths } from "@/components/home/ProgramPaths";
import { ResearchBand } from "@/components/home/ResearchBand";
import { CentersBand } from "@/components/home/CentersBand";
import { CareerBand } from "@/components/home/CareerBand";
import { StudentVoices } from "@/components/home/StudentVoices";
import { NewsBand } from "@/components/home/NewsBand";
import { EthicsBand } from "@/components/home/EthicsBand";
import { VisitBand } from "@/components/home/VisitBand";
import { Section } from "@/components/layout/Section";

/**
 * Homepage order follows the audience order the project brief sets:
 * prospective students and parents first, then graduate and working
 * professionals, then research partners and faculty, then alumni and donors.
 *
 * Background rhythm alternates so no two bands read as one wall: sandstone,
 * limestone, deep blue, limestone, white, sandstone, white, limestone, white.
 * Every band is made of content mined from the current site; see
 * src/lib/liveContent.ts for the provenance of each string and image.
 */
export default function HomePage() {
  return (
    <>
      <Hero />

      <Section id="paths">
        <ProgramPaths />
      </Section>

      <Section tone="card">
        <ProgramFinder />
      </Section>

      <ResearchBand />

      <CentersBand />

      <CareerBand />

      <StudentVoices />

      <NewsBand />

      <EthicsBand />

      <VisitBand />
    </>
  );
}
