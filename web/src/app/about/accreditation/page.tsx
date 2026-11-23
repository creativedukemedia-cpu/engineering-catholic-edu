import { SimpleContentPage } from "@/components/templates/SimpleContentPage";

export default function AccreditationPage() {
  return (
    <SimpleContentPage title="Accreditation" lead="ABET status for undergraduate programs.">
      <p className="max-w-prose text-sm">
        Align degree names with current program pages. The live page still lists Bachelor of
        Electrical Engineering while the program URL is Electrical and Computer Engineering (BECE).
        [VERIFY]
      </p>
    </SimpleContentPage>
  );
}