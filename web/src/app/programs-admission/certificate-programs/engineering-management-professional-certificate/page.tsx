import { SimpleContentPage } from "@/components/templates/SimpleContentPage";
import Link from "next/link";

export default function EngMgmtCertPage() {
  return (
    <SimpleContentPage
      title="Engineering Management Professional Certificate"
      lead="Five graduate CMGT courses for technical leaders moving into administration."
      cta={{ label: "Request Info", href: "/programs-admission/request-information" }}
    >
      <p className="max-w-prose">
        Courses may count toward the Engineering Management MS. [VERIFY] course list and transfer rules.
      </p>
      <Link
        href="/programs-admission/graduate-programs/engineering-management-ms"
        className="focus-ring mt-4 inline-block text-catholic-red font-medium"
      >
        Engineering Management (MS)
      </Link>
    </SimpleContentPage>
  );
}