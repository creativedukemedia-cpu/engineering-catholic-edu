import Link from "next/link";
import { Container } from "./Container";

const links = [
  { label: "About", href: "/about" },
  { label: "Departments", href: "/explore-our-college/departments" },
  { label: "How to Apply", href: "/programs-admission/how-apply-transfers" },
  { label: "Accreditation", href: "/about/accreditation" },
  { label: "Contact", href: "/connect-contact/contact-us" },
];

const legal = [
  { label: "Copyright", href: "https://www.catholic.edu/copyright-trademark" },
  { label: "Privacy", href: "https://www.catholic.edu/privacy" },
  { label: "Consumer Information", href: "https://www.catholic.edu/about/consumer-information" },
  { label: "Disability Support", href: "https://www.catholic.edu/disability-support" },
];

export function SiteFooter() {
  return (
    <footer className="bg-catholic-blue text-white">
      <Container className="py-12">
        <p className="font-[family-name:var(--font-headline)] text-xl font-bold">
          College of Engineering, Physics, and Computing
        </p>
        <p className="mt-2 max-w-prose text-sm text-[var(--light-blue)]">
          Pangborn Hall 334, 620 Michigan Ave., NE, Washington, DC 20064
        </p>
        <nav aria-label="Footer" className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {links.map((item) => (
            <Link key={item.href} href={item.href} className="focus-ring hover:underline">
              {item.label}
            </Link>
          ))}
        </nav>
        <nav aria-label="Legal" className="mt-6 flex flex-wrap gap-x-4 gap-y-2 border-t border-white/20 pt-6 text-xs text-[var(--light-blue)]">
          {legal.map((item) => (
            <a key={item.href} href={item.href} className="focus-ring hover:underline">
              {item.label}
            </a>
          ))}
        </nav>
      </Container>
    </footer>
  );
}