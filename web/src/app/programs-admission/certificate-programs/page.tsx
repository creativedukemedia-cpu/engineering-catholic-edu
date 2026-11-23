import { SimpleContentPage } from "@/components/templates/SimpleContentPage";
import Link from "next/link";

export default function CertIndex() {
  return (
    <SimpleContentPage title="Certificate programs">
      <ul className="space-y-2">
        <li>
          <Link
            href="/programs-admission/certificate-programs/engineering-management-professional-certificate"
            className="focus-ring text-catholic-red font-medium"
          >
            Engineering Management Professional Certificate
          </Link>
        </li>
        <li className="text-sm text-catholic-blue">
          Add remaining certificates as sections or pages when content is ready. Cyber security,
          power electronics, and signal processing need confirmation before publish.
        </li>
      </ul>
    </SimpleContentPage>
  );
}