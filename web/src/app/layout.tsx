import type { Metadata } from "next";
import { Crimson_Text, Oswald, Roboto } from "next/font/google";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { collegeAddress, socialLinks } from "@/lib/liveContent";
import { NOINDEX, SITE_URL } from "@/lib/site";
import "./globals.css";

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["500", "700"],
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const crimson = Crimson_Text({
  variable: "--font-crimson",
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
});

/**
 * Metadata.
 *
 * This build is meant to replace engineering.catholic.edu at the same host, so
 * metadataBase is that domain and every relative URL below resolves to a real
 * production path. `canonical: "./"` resolves per route, so each page points at
 * itself rather than at the homepage.
 *
 * The defaults here are homepage copy. Each page should set its own title and
 * description as it is rebuilt.
 *
 * SITE_URL comes from src/lib/site.ts. A staging build sets NEXT_PUBLIC_SITE_URL
 * to its own host and NOINDEX=true, which flips the robots directive below so a
 * mirror of the live site is never indexed beside the original.
*/
const SITE_NAME =
  "College of Engineering, Physics, and Computing | The Catholic University of America";
const SITE_DESCRIPTION =
  "Engineering, physics, and computing degrees at a Catholic university in Washington, D.C. Undergraduate, graduate, and certificate programs, and research across the college's departments and centers.";
const SITE_IMAGE = `${SITE_URL}/media/hero-campus-aerial.jpg`;
const SITE_IMAGE_ALT =
  "An aerial view of the Catholic University campus in Washington, D.C.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: "%s | CUA Engineering, Physics, and Computing",
  },
  description: SITE_DESCRIPTION,
  applicationName: "CUA Engineering, Physics, and Computing",
  alternates: { canonical: "./" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    url: `${SITE_URL}/`,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    locale: "en_US",
    images: [{ url: SITE_IMAGE, alt: SITE_IMAGE_ALT }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [SITE_IMAGE],
  },
  robots: NOINDEX
    ? { index: false, follow: true }
    : {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true, "max-image-preview": "large" },
      },
};

/**
 * Structured data for search engines and AI answer engines: who the college is,
 * where it is, and which accounts are officially it.
 *
 * Provenance, because nothing in here is invented: the address is the one the
 * current site prints in its footer (Pangborn Hall 334, 620 Michigan Ave., NE),
 * foundingDate "1887" comes from that footer's copyright line, "1887-2026", the
 * department names are the ones the current research pages use, and sameAs is
 * the four university accounts the current site links to.
 */
function OrgJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "EducationalOrganization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: `${SITE_URL}/`,
        logo: `${SITE_URL}/brand/cua-logo-horizontal.svg`,
        image: SITE_IMAGE,
        description: SITE_DESCRIPTION,
        foundingDate: "1887",
        address: {
          "@type": "PostalAddress",
          streetAddress: `${collegeAddress.building}, ${collegeAddress.street}`,
          addressLocality: "Washington",
          addressRegion: "DC",
          postalCode: "20064",
          addressCountry: "US",
        },
        department: [
          { "@type": "Organization", name: "Department of Biomedical Engineering" },
          { "@type": "Organization", name: "Department of Civil and Environmental Engineering" },
          { "@type": "Organization", name: "Department of Computer Science" },
          { "@type": "Organization", name: "Department of Electrical and Computer Engineering" },
          { "@type": "Organization", name: "Department of Mechanical Engineering" },
          { "@type": "Organization", name: "Department of Physics" },
        ],
        sameAs: socialLinks.map((s) => s.href),
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: `${SITE_URL}/`,
        name: SITE_NAME,
        publisher: { "@id": `${SITE_URL}/#organization` },
        inLanguage: "en-US",
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${oswald.variable} ${roboto.variable} ${crimson.variable} h-full`}>
      <head>
        <OrgJsonLd />
      </head>
      <body className="min-h-full flex flex-col antialiased">
        <a
          href="#main-content"
          className="focus-ring sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:text-catholic-blue"
        >
          Skip to main content
        </a>
        <SiteHeader />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
