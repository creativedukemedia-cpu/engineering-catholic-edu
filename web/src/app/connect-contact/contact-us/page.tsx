import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { LeadForm, type LeadField } from "@/components/forms/LeadForm";
import { getContentPage, isServed } from "@/lib/content";
import { collegeAddress } from "@/lib/liveContent";

export const metadata: Metadata = {
  title: "Contact us",
  description:
    "Contact the College of Engineering, Physics, and Computing: the college office, department phones and an enquiry form.",
  alternates: { canonical: "/connect-contact/contact-us" },
};

/**
 * The college office details below are read from the harvested copy of this
 * same page on the old site, so an email address or a phone number that
 * changes there changes here on the next content build. Nothing is typed in by
 * hand.
 */
const source = getContentPage("/connect-contact/contact-us");

const DEPARTMENTS: [string, string][] = [
  ["Department of Biomedical Engineering", "/explore-our-college/departments/department-biomedical-engineering"],
  [
    "Department of Civil and Environmental Engineering",
    "/explore-our-college/departments/department-civil-and-environmental-engineering",
  ],
  ["Department of Computer Science", "/explore-our-college/departments/department-computer-science"],
  [
    "Department of Electrical and Computer Engineering",
    "/explore-our-college/departments/department-electrical-and-computer-engineering",
  ],
  [
    "Department of Mechanical Engineering",
    "/explore-our-college/departments/department-mechanical-engineering",
  ],
  ["Department of Physics", "/explore-our-college/departments/department-physics"],
];

const FIELDS: LeadField[] = [
  { name: "firstName", label: "First name", type: "text", required: true, autoComplete: "given-name" },
  { name: "lastName", label: "Last name", type: "text", required: true, autoComplete: "family-name" },
  { name: "email", label: "Email", type: "email", required: true, autoComplete: "email" },
  { name: "phone", label: "Phone", type: "tel", autoComplete: "tel" },
  {
    name: "department",
    label: "Who are you writing to?",
    type: "select",
    options: [
      "College office",
      ...DEPARTMENTS.map(([name]) => name),
      "A center or institute",
      "Admissions",
    ],
  },
  {
    name: "message",
    label: "Message",
    type: "textarea",
    required: true,
    wide: true,
    help: "Tell us what you need. Questions about applications, research, visiting or giving are all welcome.",
  },
];

export default function ContactUsPage() {
  const trail = source?.breadcrumb?.length
    ? source.breadcrumb
    : [
        { title: "Home", href: "/" },
        { title: "Connect & Contact", href: "/connect-contact" },
        { title: "Contact Us", href: "/connect-contact/contact-us" },
      ];

  return (
    <>
      <Breadcrumbs trail={trail} />
      <section className="bg-catholic-blue text-white">
        <Container className="py-10 md:py-14">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-light-blue">
            Connect & Contact
          </p>
          <h1 className="font-[family-name:var(--font-headline)] text-3xl font-bold leading-[1.08] md:text-5xl">
            Contact us
          </h1>
          <p className="mt-5 max-w-[70ch] text-base leading-relaxed text-white/90 md:text-lg">
            {source?.lead ??
              "Get in touch with the College of Engineering, Physics, and Computing."}
          </p>
        </Container>
      </section>

      <Container className="py-12 md:py-16">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div>
            <h2 className="font-[family-name:var(--font-headline)] text-2xl font-bold text-catholic-blue">
              Send a message
            </h2>
            <p className="mt-2 max-w-[70ch] text-sm leading-relaxed text-black/75">
              Fields marked with an asterisk are required. The form reaches the college
              office. If you need an answer quickly, call.
            </p>
            <div className="mt-6 max-w-[720px]">
              <LeadForm fields={FIELDS} intent="contact" submitLabel="Send message" />
            </div>

            <h2 className="mt-14 font-[family-name:var(--font-headline)] text-2xl font-bold text-catholic-blue">
              Call a department
            </h2>
            <p className="mt-2 max-w-[70ch] text-sm leading-relaxed text-black/75">
              Connect with our departments to learn more about their programs and academic
              offerings.
            </p>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2">
              {DEPARTMENTS.map(([name, base]) => {
                const page = getContentPage(`${base}/about-us/contact-us`);
                const phone = page?.phones?.[0];
                const email = page?.emails?.[0];
                const href = isServed(`${base}/about-us/contact-us`)
                  ? `${base}/about-us/contact-us`
                  : base;
                return (
                  <li
                    key={name}
                    className="rounded-sm border border-black/10 bg-white p-5"
                  >
                    <h3 className="font-[family-name:var(--font-headline)] text-base font-bold leading-snug text-catholic-blue">
                      <Link
                        href={href}
                        className="underline decoration-catholic-red decoration-1 underline-offset-4 hover:text-catholic-red focus-ring"
                      >
                        {name}
                      </Link>
                    </h3>
                    <div className="mt-2 space-y-1 text-sm">
                      {phone ? (
                        <p>
                          <a
                            href={`tel:${phone.replace(/[^\d+]/g, "")}`}
                            className="text-catholic-blue underline decoration-catholic-red decoration-1 underline-offset-2 hover:text-catholic-red focus-ring"
                          >
                            {phone}
                          </a>
                        </p>
                      ) : null}
                      {email ? (
                        <p>
                          <a
                            href={`mailto:${email}`}
                            className="text-catholic-blue underline decoration-catholic-red decoration-1 underline-offset-2 hover:text-catholic-red focus-ring"
                          >
                            {email}
                          </a>
                        </p>
                      ) : null}
                      {!phone && !email ? (
                        <p className="text-black/60">See the department page for contacts.</p>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <aside className="space-y-8">
            <div className="rounded-sm bg-limestone p-6">
              <h2 className="font-[family-name:var(--font-headline)] text-lg font-bold text-catholic-blue">
                College office
              </h2>
              <address className="mt-3 space-y-1 text-sm not-italic leading-relaxed">
                <p className="font-semibold text-catholic-blue">
                  {collegeAddress.department}
                </p>
                <p>{collegeAddress.building}</p>
                <p>{collegeAddress.institution}</p>
                <p>{collegeAddress.street}</p>
                <p>{collegeAddress.cityStateZip}</p>
              </address>
              {source?.phones?.length ? (
                <p className="mt-3 text-sm">
                  <span className="font-semibold text-catholic-blue">Phone: </span>
                  <a
                    href={`tel:${source.phones[0].replace(/[^\d+]/g, "")}`}
                    className="text-catholic-blue underline decoration-catholic-red decoration-1 underline-offset-2 hover:text-catholic-red focus-ring"
                  >
                    {source.phones[0]}
                  </a>
                </p>
              ) : null}
              {source?.emails?.length ? (
                <p className="mt-1 text-sm">
                  <span className="font-semibold text-catholic-blue">Email: </span>
                  <a
                    href={`mailto:${source.emails[0]}`}
                    className="text-catholic-blue underline decoration-catholic-red decoration-1 underline-offset-2 hover:text-catholic-red focus-ring"
                  >
                    {source.emails[0]}
                  </a>
                </p>
              ) : null}
              <p className="mt-4 text-sm">
                <Link
                  href="/programs-admission/visit"
                  className="text-catholic-blue underline decoration-catholic-red decoration-1 underline-offset-4 hover:text-catholic-red focus-ring"
                >
                  Plan a visit to campus
                </Link>
              </p>
            </div>

            <div className="rounded-sm border border-black/10 p-6">
              <h2 className="font-[family-name:var(--font-headline)] text-lg font-bold text-catholic-blue">
                Other ways in
              </h2>
              <ul className="mt-3 space-y-2 text-sm">
                {[
                  ["/connect-contact/leadership-staff", "Leadership and staff"],
                  ["/connect-contact/faculty-directory", "Faculty directory"],
                  ["/programs-admission/request-information", "Request information"],
                  ["/connect-contact/alumni-giving", "Alumni and giving"],
                ].map(([href, label]) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-catholic-blue underline decoration-catholic-red decoration-1 underline-offset-2 hover:text-catholic-red focus-ring"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

          </aside>
        </div>
      </Container>
    </>
  );
}
