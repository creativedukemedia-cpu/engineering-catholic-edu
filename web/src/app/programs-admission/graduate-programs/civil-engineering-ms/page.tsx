import { SimpleContentPage } from "@/components/templates/SimpleContentPage";

export default function CivilMsPage() {
  return (
    <SimpleContentPage
      title="Civil Engineering (MS)"
      lead="Thesis and non-thesis paths. Day and evening sections on campus in Washington, D.C. Full template sections from prompt 5 apply here; content matches the live page."
      cta={{ label: "Request Info", href: "/programs-admission/request-information" }}
    >
      <ul className="list-disc space-y-2 pl-5">
        <li>Specializations: construction, transportation, structural, environmental, civil informatics.</li>
        <li>Accelerated option for undergraduates with 3.2 GPA. [VERIFY]</li>
        <li>Assistantships: see /current-students/graduate-teaching-and-research-assistantships. [VERIFY]</li>
      </ul>
    </SimpleContentPage>
  );
}