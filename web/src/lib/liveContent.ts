/**
 * Homepage content mined from the live site.
 *
 * Every string, href, image and date in this file was read off
 * engineering.catholic.edu on 2026-11-23. Nothing here is invented. Provenance
 * for each entry is recorded in docs/design-notes/2026-11-23-homepage-content.md
 * and docs/design-notes/assets-manifest.json.
 *
 * Rules this file follows:
 *   - Unbuilt pages point at the live site (`currentSite` style) instead of
 *     inventing a path. No production path is renamed.
 *   - Images and alt text come from the site's own markup, so a caption never
 *     claims more than the photograph shows.
 *   - Anything not evidenced on the site stays out. See the [VERIFY] list in
 *     docs/design-notes/2026-11-23-homepage-content.md.
 */

const LIVE = "https://engineering.catholic.edu";

export const contentRetrieved = "2026-11-23";

/** Story from the news index. `href` is the live article, not built here yet. */
export type Story = {
  date: string;
  iso: string;
  month: string;
  day: string;
  title: string;
  href: string;
  image?: string;
  imageAlt?: string;
  width?: number;
  height?: number;
};

const storyHref = (slug: string) =>
  `${LIVE}/connect-contact/news-events/all-stories/${slug}`;

/** Newest first, exactly as the live index lists them. */
export const stories: Story[] = [
  {
    date: "November 10, 2026",
    iso: "2026-11-10",
    month: "Nov",
    day: "10",
    title: "Dr. Charles Nguyen Brings AI Expertise to International Conference in Taiwan",
    href: storyHref(
      "dr-charles-nguyen-brings-ai-expertise-international-conference-taiwan",
    ),
    image: "/media/news-nguyen-taiwan.jpg",
    imageAlt: "Group of conference attendees.",
    width: 800,
    height: 603,
  },
  {
    date: "November 6, 2026",
    iso: "2026-11-06",
    month: "Nov",
    day: "06",
    title:
      "Physics Doctoral Student Receives American Ceramic Society Award for Materials Science Research",
    href: storyHref(
      "physics-doctoral-student-receives-american-ceramic-society-award-materials-science-research",
    ),
    image: "/media/news-acs-award.jpg",
    imageAlt: "Faculty and student pose in front or research presentation.",
    width: 800,
    height: 599,
  },
  {
    date: "November 3, 2026",
    iso: "2026-11-03",
    month: "Nov",
    day: "03",
    title: "CEPC Faculty Secure Over $4.8 Million in New Research Funding",
    href: storyHref("cepc-faculty-secure-over-48-million-new-research-funding"),
    image: "/media/news-research-funding.jpg",
    imageAlt: "$4.8 Million in New Research Funding",
    width: 800,
    height: 450,
  },
  {
    date: "November 5, 2026",
    iso: "2026-11-05",
    month: "Nov",
    day: "05",
    title: "CEPC Students Tour Northrop Grumman's BWI Campus",
    href: storyHref("cepc-students-tour-northrop-grummans-bwi-campus"),
  },
  {
    date: "November 4, 2026",
    iso: "2026-11-04",
    month: "Nov",
    day: "04",
    title: "CEPC Alumni: Connecting, Inspiring, and Making an Impact",
    href: storyHref("cepc-alumni-connecting-inspiring-and-making-impact"),
  },
  {
    date: "October 30, 2026",
    iso: "2026-10-30",
    month: "Oct",
    day: "30",
    title: "Vice Admiral Mel Williams Leadership Award Presented to Outstanding Graduate Students",
    href: storyHref(
      "vice-admiral-mel-williams-leadership-award-presented-outstanding-graduate-students",
    ),
    image: "/media/news-williams-award.jpg",
    imageAlt: "Vice Admiral Mel Williams poses with students.",
    width: 800,
    height: 380,
  },
];

export const newsLeadIn =
  "Learn about the latest news and events happening in the College of Engineering, Physics, and Computing.";

/** Where the news and events indexes live until those pages are rebuilt. */
export const newsLinks = [
  { label: "All stories", href: `${LIVE}/connect-contact/news-events/all-stories` },
  { label: "All events", href: `${LIVE}/connect-contact/news-events/all-events` },
  { label: "Past events", href: `${LIVE}/connect-contact/news-events/all-events/past-events` },
];

/**
 * The six department research pages. Image filenames on the live site name
 * their own department, so each pairing is certain.
 */
export type ResearchArea = {
  label: string;
  href: string;
  image: string;
  alt: string;
};

const deptHref = (slug: string) =>
  `${LIVE}/explore-our-college/departments/${slug}/faculty-research/areas-research`;

export const researchAreas: ResearchArea[] = [
  {
    label: "Biomedical Engineering",
    href: deptHref("department-biomedical-engineering"),
    image: "/media/g-biomedical-engineering.jpg",
    alt: "Ambient background with DNA and computer analysis of genetics and biology.",
  },
  {
    label: "Civil and Environmental Engineering",
    href: deptHref("department-civil-and-environmental-engineering"),
    image: "/media/g-civil-environmental.jpg",
    alt: "City landscape connected with the earth and environment.",
  },
  {
    label: "Computer Science",
    href: deptHref("department-computer-science"),
    image: "/media/g-computer-science.jpg",
    alt: "Computer code and light representing a network data stream.",
  },
  {
    label: "Electrical and Computer Engineering",
    href: deptHref("department-electrical-and-computer-engineering"),
    image: "/media/g-electrical-computer.jpg",
    alt: "Cityscape with electrical and computer elements highlighted to demonstrate how they all connect.",
  },
  {
    label: "Mechanical Engineering",
    href: deptHref("department-mechanical-engineering"),
    image: "/media/g-mechanical-engineering.jpg",
    alt: "Gears, components, and equations that are part of mechanical systems functionality.",
  },
  {
    label: "Physics",
    href: deptHref("department-physics"),
    image: "/media/g-physics.jpg",
    alt: "Physics equations and mathematical curves overlayed on space.",
  },
];

/**
 * Centers and institutes, with the names the live pages use.
 *
 * Two rules in this list. One: the `line` restates the name rather than
 * asserting partners, funding, or activity that the site does not state. Two:
 * four tiles carry the photograph whose live filename names the center
 * itself. PHaSER's tile could not be identified that way, so it is listed
 * without a picture rather than with a guess.
 */
export type Center = {
  name: string;
  short: string;
  line: string;
  href: string;
  image?: string;
  alt?: string;
};

const centerHref = (slug: string) =>
  `/explore-our-college/centers-institutes-research/${slug}`;

export const centers: Center[] = [
  {
    name: "Center for Applied Biomechanics and Rehabilitation Research",
    short: "CABRR",
    line: "Biomechanics and rehabilitation research.",
    href: centerHref(
      "center-applied-biomechanics-and-rehabilitation-research-cabrr",
    ),
    image: "/media/g-cabrr.jpg",
    alt: "Illustration of human body mechanics with analysis of muscular skeletal systems.",
  },
  {
    name: "Institute for Astrophysics and Computational Sciences",
    short: "IACS",
    line: "Astrophysics and computational science.",
    href: centerHref("institute-astrophysics-and-computational-sciences-iacs"),
    image: "/media/g-iacs.jpg",
    alt: "Mathematical polygons of space and astrophysics interplay.",
  },
  {
    name: "Center for Artificial Intelligence Research",
    short: "CAIR",
    line: "A university center for artificial intelligence research.",
    href: "https://sites.google.com/cua.edu/cair/about",
    image: "/media/g-cair.jpg",
    alt: "AI information network stretching across societal landscape.",
  },
  {
    name: "Space Weather Center",
    short: "Space Weather",
    line: "Solar and space weather research.",
    href: centerHref("space-weather-center"),
    image: "/media/g-space-weather.jpg",
    alt: "Sun with solar flares affecting space.",
  },
  {
    name: "PHaSER",
    short: "PHaSER",
    line: "A research center in the college.",
    href: centerHref("phaser"),
  },
];

/**
 * Career placement. The figure and its qualifier are quoted from the live
 * homepage, so the claim keeps the wording that makes it accurate.
 */
export const career = {
  heading: "Where our graduates go",
  figure: "90%",
  claim:
    "90% of graduates report full-time employment or graduate school, a combination of both, or military service.",
  qualifier: "Companies & institutions include:",
  note: "Figure and employer list quoted from the current site, 2026-11-23.",
};

/** Employer wordmarks from the live site's logo gallery, 500x279 crops
 * trimmed to the mark itself (the source files carry wide white margins).
 */
export const employers = [
  { name: "NASA", image: "/media/partner-NASA-Name.jpg", width: 117, height: 61 },
  { name: "General Motors", image: "/media/partner-General-Motors-Name.jpg", width: 322, height: 62 },
  { name: "IBM", image: "/media/partner-IBM-Name.jpg", width: 86, height: 59 },
  { name: "US Navy", image: "/media/partner-US-Navy-Name.jpg", width: 197, height: 71 },
  { name: "Texas A&M", image: "/media/partner-Texas-AM-Name.jpg", width: 451, height: 73 },
  { name: "Merck", image: "/media/partner-Merck-Name.jpg", width: 140, height: 61 },
  { name: "AECOM", image: "/media/partner-AECOM-Name.jpg", width: 148, height: 61 },
  { name: "Newport News", image: "/media/partner-Newport-News-Name.jpg", width: 307, height: 130 },
  { name: "Lockheed Martin", image: "/media/partner-Lockheed-Martin-Name.jpg", width: 352, height: 61 },
  { name: "Balfour Beatty", image: "/media/partner-Balfour-Beatty-Name.jpg", width: 362, height: 73 },
];

/**
 * The three student films on the live homepage. Titles, names and blurbs are
 * verbatim; thumbnails are the YouTube frames for those exact video ids.
 */
export type Film = {
  title: string;
  person: string;
  blurb: string;
  videoId: string;
  thumb: string;
};

export const films: Film[] = [
  {
    title: "STEM Career Ambitions as a Double Major",
    person: "Maria Erquiaga",
    blurb:
      "Maria Erquiaga had the flexibility at Catholic University to explore all of her interests, including a double major in Engineering and Biology, to pursue her career ambitions.",
    videoId: "O5Yy2gm83QY",
    thumb: "/media/film-O5Yy2gm83QY.jpg",
  },
  {
    title: "Community Inside and Outside the Classroom",
    person: "Bella Reyes",
    blurb:
      "As a Mechanical Engineering major and field hockey athlete, Bella Reyes gained community support from faculty, coaches, and peers to find balance and insights along her path.",
    videoId: "HSaOvRlYBNo",
    thumb: "/media/film-HSaOvRlYBNo.jpg",
  },
  {
    title: "The Right Combo for Lifechanging Results",
    person: "Elijah Feret",
    blurb:
      "Elijah Feret wanted a Biomedical Engineering program at the cutting edge of research, but also one-on-one attention from professors. At Catholic University, he found both.",
    videoId: "NF017fMKvrE",
    thumb: "/media/film-NF017fMKvrE.jpg",
  },
];

export const filmsHeading = "Hear from Our Students: STEM, Community, & The Right Combo";

/**
 * Student-life photographs from the live Student Experience & Special Programs
 * page. Each label stays inside what the site's own alt text says.
 */
export const studentLife = [
  {
    label: "University Honors Program",
    line: "Honors students on campus, a few steps from the Basilica.",
    image: "/media/honors-students-at-the-basilica.jpg",
    alt: "Students from the University Honors Program.",
  },
  {
    label: "Prototype work in McCarthy",
    line: "Design and build time in the McCarthy building workspaces.",
    image: "/media/students-in-mccarthy-facility.jpg",
    alt: "Students designing prototypes in the workspaces in McCarthy building.",
  },
  {
    label: "Study abroad",
    line: "Programs that take the classroom to another country.",
    image: "/media/g-study-abroad-oxford-england.jpg",
    alt: "Skyline of Oxford, England with many historic buildings and open sky.",
  },
];

export const studentLifeHref = `${LIVE}/explore-our-college/student-experience-special-programs`;

/** Four quick paths, each with its own photograph and the site's own alt text. */
export const programPaths = [
  {
    title: "Undergraduate",
    line: "Bachelor's degrees, minors, and a dual degree in architecture and engineering.",
    href: "/programs-admission/undergraduate-programs",
    cta: "See undergraduate programs",
    image: "/media/cpec-undergrad-programs-feature.jpg",
    alt: "Undergraduate CPEC students in a classroom.",
  },
  {
    title: "Graduate",
    line: "Master's and doctoral degrees, on campus, in the evening, and online.",
    href: "/programs-admission/graduate-programs",
    cta: "See graduate programs",
    image: "/media/cpec-grad-programs-feature.jpg",
    alt: "Professor teaching CPEC graduate students.",
  },
  {
    title: "Certificates",
    line: "Shorter programs for working engineers and professionals.",
    href: "/programs-admission/certificate-programs",
    cta: "See certificates",
    image: "/media/g-academic-career-success-graphical.jpg",
    alt: "Stylized illustrated graphic of academic and career success.",
  },
  {
    title: "Research",
    line: "Centers, institutes, labs, and faculty across six departments.",
    href: "/explore-our-college/centers-institutes-research",
    cta: "See research",
    image: "/media/cepc-school-collage.jpg",
    alt: "Collage of conceptual images and scenes from the College of Engineering, Physics, and Computing.",
  },
];

/** Address block, verbatim from the live footer. */
export const collegeAddress = {
  department: "College of Engineering, Physics, and Computing",
  building: "Pangborn Hall 334",
  institution: "The Catholic University of America",
  street: "620 Michigan Ave., NE",
  cityStateZip: "Washington, DC 20064",
  mapHref: `${LIVE}/explore-our-college/facilities-locations`,
};

/** University links carried in the footer, with the hrefs the live site uses. */
export const universityLinks = [
  { label: "Athletics", href: "https://catholicathletics.com/" },
  {
    label: "Cardinal Shop",
    href: "https://www.catholic.edu/student-experience/cardinal-shop-and-bookstore",
  },
  { label: "Libraries", href: "https://libraries.catholic.edu/" },
  {
    label: "Directory",
    href: "https://www.catholic.edu/about/departments-offices-services",
  },
  { label: "Careers", href: "https://www.catholic.edu/careers" },
  { label: "For Media", href: "https://www.catholic.edu/information-media" },
];

export const legalLinks = [
  { label: "Copyright & Trademark", href: "https://www.catholic.edu/copyright-trademark" },
  { label: "Privacy", href: "https://www.catholic.edu/privacy" },
  {
    label: "Consumer Information",
    href: "https://www.catholic.edu/about/consumer-information",
  },
  { label: "En Español", href: "https://www.catholic.edu/en-espanol" },
  { label: "Disability Support", href: "https://www.catholic.edu/disability-support" },
  { label: "Report Misconduct", href: "https://www.catholic.edu/about/report-misconduct" },
  { label: "Compliance", href: "https://www.catholic.edu/compliance" },
];

export const socialLinks = [
  { label: "Facebook", href: "https://www.facebook.com/CatholicUniversity" },
  { label: "Instagram", href: "https://www.instagram.com/catholicuniversity" },
  { label: "YouTube", href: "https://www.youtube.com/user/CatholicUniversity" },
  { label: "LinkedIn", href: "https://www.linkedin.com/school/the-catholic-university-of-america/" },
];

export const giveLink = {
  label: "Support the College",
  line: "Make a gift to Catholic University.",
  href: `${LIVE}/connect-contact/alumni-giving`,
};

export const copyrightLine = "\u00A9 1887-2026 The Catholic University of America";
