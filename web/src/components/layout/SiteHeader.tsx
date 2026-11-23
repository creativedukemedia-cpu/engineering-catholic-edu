import Link from "next/link";
import { Container } from "./Container";

const utility = [
  { label: "Request Info", href: "/programs-admission/request-information" },
  { label: "Apply", href: "/programs-admission/how-apply-transfers" },
  { label: "Visit", href: "/programs-admission/visit" },
];

const mainNav = [
  { label: "Programs & Admission", href: "/programs-admission" },
  { label: "About", href: "/explore-our-college/mission-vision/deans-welcome" },
  { label: "Research & Faculty", href: "/explore-our-college/centers-institutes-research" },
  { label: "Contact", href: "/connect-contact/contact-us" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-[var(--grey)]/40 bg-white">
      <Container>
        <div className="hidden items-center justify-end gap-6 py-2 text-xs font-medium uppercase tracking-wide text-catholic-red md:flex">
          {utility.map((item) => (
            <Link key={item.href} href={item.href} className="focus-ring">
              {item.label}
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 bg-catholic-blue py-4 text-white">
          <Link
            href="/"
            className="focus-ring max-w-md font-[family-name:var(--font-headline)] text-lg font-bold leading-tight md:text-xl"
          >
            College of Engineering, Physics, and Computing
          </Link>
          <nav aria-label="Main" className="hidden gap-6 text-sm md:flex">
            {mainNav.map((item) => (
              <Link key={item.href} href={item.href} className="focus-ring hover:underline">
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex gap-3 md:hidden">
            {utility.slice(0, 2).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="focus-ring rounded-full bg-catholic-red px-3 py-2 text-xs font-semibold text-white"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </header>
  );
}