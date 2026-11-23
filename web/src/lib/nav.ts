/**
 * Primary navigation for the College of Engineering, Physics, and Computing.
 *
 * The information architecture mirrors the live site's three top-level
 * sections (Explore Our College, Programs & Admission, Connect & Contact),
 * verified against engineering.catholic.edu on 2026-11-23.
 *
 * `currentSite: true` means the redesigned page has not been built in this
 * repo yet, so the link goes to the existing production URL. No path is
 * invented and no production path is renamed.
 */

export type NavLink = {
  label: string;
  href: string;
  note?: string;
  currentSite?: boolean;
};

export type NavColumn = {
  heading: string;
  links: NavLink[];
};

export type NavGroup = {
  id: string;
  label: string;
  /** Where the top-level item itself points. */
  href: string;
  /** Path prefixes that mark this group as the current section. */
  match: string[];
  columns: NavColumn[];
  feature: {
    title: string;
    line: string;
    href: string;
    image: string;
    alt: string;
  };
};

const LIVE = "https://engineering.catholic.edu";

export const utilityLinks: NavLink[] = [
  {
    label: "Request Info",
    href: "/programs-admission/request-information",
  },
  { label: "Apply", href: "/programs-admission/how-apply-transfers" },
  { label: "Visit", href: "/programs-admission/visit" },
  { label: "Give", href: `${LIVE}/connect-contact/alumni-giving`, currentSite: true },
];

export const navGroups: NavGroup[] = [
  {
    id: "programs",
    label: "Programs & Admission",
    href: "/programs-admission",
    match: ["/programs-admission"],
    columns: [
      {
        heading: "Degrees",
        links: [
          {
            label: "Undergraduate Programs",
            href: "/programs-admission/undergraduate-programs",
            note: "Bachelor's degrees, minors, and a dual degree",
          },
          {
            label: "Graduate Programs",
            href: "/programs-admission/graduate-programs",
            note: "Master's and doctoral degrees",
          },
          {
            label: "Certificate Programs",
            href: "/programs-admission/certificate-programs",
            note: "Shorter programs for working engineers",
          },
          { label: "Minors", href: "/programs-admission/undergraduate-programs/minors" },
        ],
      },
      {
        heading: "Apply and pay",
        links: [
          { label: "How to Apply & Transfers", href: "/programs-admission/how-apply-transfers" },
          {
            label: "Scholarships & Aid",
            href: `${LIVE}/programs-admission/scholarships-aid`,
            currentSite: true,
          },
          { label: "Visit", href: "/programs-admission/visit" },
          { label: "Request Information", href: "/programs-admission/request-information" },
        ],
      },
      {
        heading: "Evening, online, and pre-college",
        links: [
          { label: "Data Analytics (MS)", href: "/programs-admission/graduate-programs/data-analytics-ms" },
          {
            label: "Engineering Management (MS)",
            href: "/programs-admission/graduate-programs/engineering-management-ms",
          },
          {
            label: "Engineering Management Certificate",
            href: "/programs-admission/certificate-programs/engineering-management-professional-certificate",
          },
          {
            label: "Engineering New Frontiers Institute",
            href: `${LIVE}/programs-admission/engineering-new-frontiers-institute`,
            note: "Pre-college summer program",
            currentSite: true,
          },
        ],
      },
    ],
    feature: {
      title: "Find your program",
      line: "Bachelor's, master's, and doctoral degrees in engineering, physics, and computing.",
      href: "/programs-admission",
      image: "/media/cpec-undergrad-programs-feature.jpg",
      alt: "Undergraduate engineering students in a classroom.",
    },
  },
  {
    id: "college",
    label: "Explore the College",
    href: `${LIVE}/explore-our-college`,
    match: ["/explore-our-college", "/about"],
    columns: [
      {
        heading: "The college",
        links: [
          {
            label: "Mission & Vision",
            href: `${LIVE}/explore-our-college/mission-vision`,
            currentSite: true,
          },
          { label: "Dean's Welcome", href: "/explore-our-college/mission-vision/deans-welcome" },
          { label: "About", href: "/about" },
          { label: "Accreditation", href: "/about/accreditation" },
        ],
      },
      {
        heading: "Departments",
        links: [
          {
            label: "All departments",
            href: `${LIVE}/explore-our-college/departments`,
            currentSite: true,
          },
          {
            label: "Civil and Environmental Engineering",
            href: "/explore-our-college/departments/department-civil-and-environmental-engineering",
          },
        ],
      },
      {
        heading: "Student life",
        links: [
          {
            label: "Student Success",
            href: `${LIVE}/explore-our-college/student-success`,
            currentSite: true,
          },
          {
            label: "Career Development",
            href: `${LIVE}/explore-our-college/career-development`,
            currentSite: true,
          },
          {
            label: "Student Experience & Special Programs",
            href: `${LIVE}/explore-our-college/student-experience-special-programs`,
            currentSite: true,
          },
          {
            label: "Facilities & Locations",
            href: `${LIVE}/explore-our-college/facilities-locations`,
            currentSite: true,
          },
        ],
      },
    ],
    feature: {
      title: "In Washington, D.C.",
      line: "Pangborn Hall, 620 Michigan Ave., NE.",
      href: "/programs-admission/visit",
      image: "/media/hero-campus-aerial.jpg",
      alt: "An aerial view of the Catholic University campus.",
    },
  },
  {
    id: "research",
    label: "Research & Faculty",
    href: "/explore-our-college/centers-institutes-research",
    match: ["/connect-contact/faculty-directory"],
    columns: [
      {
        heading: "Centers and institutes",
        links: [
          { label: "All centers and institutes", href: "/explore-our-college/centers-institutes-research" },
          {
            label: "CABRR",
            href: "/explore-our-college/centers-institutes-research/center-applied-biomechanics-and-rehabilitation-research-cabrr",
            note: "Applied biomechanics and rehabilitation",
          },
          {
            label: "IACS",
            href: "/explore-our-college/centers-institutes-research/institute-astrophysics-and-computational-sciences-iacs",
            note: "Astrophysics and computational sciences",
          },
        ],
      },
      {
        heading: "Space and physics",
        links: [
          { label: "PHaSER", href: "/explore-our-college/centers-institutes-research/phaser" },
          { label: "Space Weather Center", href: "/explore-our-college/centers-institutes-research/space-weather-center" },
        ],
      },
      {
        heading: "People",
        links: [
          {
            label: "Faculty Directory",
            href: `${LIVE}/connect-contact/faculty-directory`,
            currentSite: true,
          },
          {
            label: "Leadership & Staff",
            href: `${LIVE}/connect-contact/leadership-staff`,
            currentSite: true,
          },
          { label: "News & Events", href: "/connect-contact/news-events" },
        ],
      },
    ],
    feature: {
      title: "Research with consequence",
      line: "Student projects in the labs, from rehabilitation to space weather.",
      href: "/explore-our-college/centers-institutes-research",
      image: "/media/g-article-default-hero.jpg",
      alt: "Close up of gears, prototypes, device mechanics, and other science & technology inner workings.",
    },
  },
];

export const contactLink: NavLink = {
  label: "Contact",
  href: "/connect-contact/contact-us",
};

/**
 * Pages that are not in the primary navigation but are reachable from it.
 * Used for the mobile drawer footer and the sitemap work.
 */
export const footerLinks: NavLink[] = [
  { label: "About", href: "/about" },
  { label: "Departments", href: `${LIVE}/explore-our-college/departments`, currentSite: true },
  { label: "How to Apply", href: "/programs-admission/how-apply-transfers" },
  { label: "Accreditation", href: "/about/accreditation" },
  { label: "Contact", href: "/connect-contact/contact-us" },
];
