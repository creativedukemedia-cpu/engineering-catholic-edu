import { SimpleContentPage } from "@/components/templates/SimpleContentPage";

export function ProgramStub({ title, levelLabel }: { title: string; levelLabel: string }) {
  return (
    <SimpleContentPage
      title={title}
      lead={`${levelLabel} program. Full sections from the core template roll out here next; copy must match the live page.`}
      cta={{ label: "Request Info", href: "/programs-admission/request-information" }}
    />
  );
}