import { SimpleContentPage } from "@/components/templates/SimpleContentPage";

export default function VisitPage() {
  return (
    <SimpleContentPage
      title="Visit"
      lead="Plan a campus or college visit. Pangborn Hall and engineering labs when scheduling allows."
      cta={{ label: "Plan a visit", href: "/programs-admission/request-information" }}
    />
  );
}