import type { Metadata } from "next";
import { ProgramDegreeTemplate } from "@/components/templates/ProgramDegreeTemplate";
import { civilBce } from "@/content/civil-bce";

export const metadata: Metadata = {
  title: "Civil Engineering (BCE) | College of Engineering, Physics, and Computing",
  description: civilBce.overview,
};

export default function CivilBcePage() {
  return <ProgramDegreeTemplate content={civilBce} />;
}