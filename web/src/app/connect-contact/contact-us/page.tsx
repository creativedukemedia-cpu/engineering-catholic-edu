import { SimpleContentPage } from "@/components/templates/SimpleContentPage";

export default function ContactPage() {
  return (
    <SimpleContentPage
      title="Contact us"
      lead="Pangborn Hall 334, 620 Michigan Ave., NE, Washington, DC 20064"
      cta={{ label: "Send a message", href: "/programs-admission/request-information" }}
    />
  );
}