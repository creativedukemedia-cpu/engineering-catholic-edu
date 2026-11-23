import Link from "next/link";
import { SimpleContentPage } from "@/components/templates/SimpleContentPage";

export default function CivilDeptPage() {
  return (
    <SimpleContentPage
      title="Department of Civil and Environmental Engineering"
      lead="We prepare you for work in industry, government, business, and academia."
      cta={{ label: "View undergraduate programs", href: "/programs-admission/undergraduate-programs" }}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/programs-admission/undergraduate-programs/civil-engineering-bce" className="focus-ring text-catholic-red font-medium">
          Civil Engineering (BCE)
        </Link>
        <Link href="/programs-admission/graduate-programs/civil-engineering-ms" className="focus-ring text-catholic-red font-medium">
          Civil Engineering (MS)
        </Link>
      </div>
    </SimpleContentPage>
  );
}