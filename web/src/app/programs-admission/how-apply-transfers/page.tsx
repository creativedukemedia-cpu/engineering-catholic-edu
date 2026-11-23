import { SimpleContentPage } from "@/components/templates/SimpleContentPage";

export default function ApplyPage() {
  return (
    <SimpleContentPage
      title="How to apply and transfers"
      lead="Apply through Catholic University. This page should link to the live application, not stop at instructions only."
      cta={{ label: "Apply", href: "https://www.catholic.edu" }}
    />
  );
}