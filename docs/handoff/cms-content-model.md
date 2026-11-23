# Content model for the engineering.catholic.edu redesign

College of Engineering, Physics, and Computing, The Catholic University of America.
Production origin: https://engineering.catholic.edu. Build from this without reading React.

## 1. What this is

The redesign exists today as a Next.js build. Treat it as the design system of record: it fixes the
information architecture, the templates, the fields each template consumes, and copy already checked
against the live site. It is not the intended hosting platform. The college may build the same design
in Drupal, and the pages should read the same either way.

Below are the content types, their fields, allowed values, and where each field appears. Machine names
are suggestions; map them onto university Drupal standards. Every value was read from
`liveContent.ts`, `nav.ts`, `programs.ts` or a page under `web/src/app/`, mined from production on
2026-11-23. Anything the repo cannot evidence is [VERIFY].

## 2. Content types

### 2.1 Program

One node per degree, certificate or minor. Level and field area are closed lists: the homepage program
finder filters on them, so an unlisted value never shows.

| Field | Machine name | Type | Req | Card | Notes / allowed values | Source |
| --- | --- | --- | --- | --- | --- | --- |
| Title | `title` | Text | Y | 1 | Catalog name, credential in parentheses | `programs.ts` |
| URL alias | `path` | Pathalias | Y | 1 | `/programs-admission/<index>/<slug>`, never renamed | `programs.ts` |
| Level | `field_program_level` | List text | Y | 1 | `undergraduate`, `graduate`, `certificate`, `minor` | `programs.ts` |
| Field area | `field_field_area` | List text | Y | 1 | `Any`, `Artificial intelligence`, `Biomedical`, `Chemical physics`, `Civil`, `Computer science`, `Electrical and computer`, `Environmental`, `Mechanical`, `Physics`, `Data`, `Management` | `programs.ts` |
| Department | `field_department` | Ref: Department | N | 1 | Drives the Research and faculty link | template |
| Degree content | Section 3 | Fields or shared block | Y | 1 each | Filled for one program today | template |

The complete list, exactly as the finder holds it:

| Program | Level | Alias |
| --- | --- | --- |
| Artificial Intelligence (BS) | undergraduate | `/programs-admission/undergraduate-programs/artificial-intelligence-bs` |
| Biomedical Engineering (BBE) | undergraduate | `/programs-admission/undergraduate-programs/biomedical-engineering-bbe` |
| Chemical Physics (BS) | undergraduate | `/programs-admission/undergraduate-programs/chemical-physics-bs` |
| Civil Engineering (BCE) | undergraduate | `/programs-admission/undergraduate-programs/civil-engineering-bce` |
| Computer Science (BS) | undergraduate | `/programs-admission/undergraduate-programs/computer-science-bs` |
| Electrical and Computer Engineering (BECE) | undergraduate | `/programs-admission/undergraduate-programs/electrical-and-computer-engineering-bece` |
| Environmental Engineering (BS) | undergraduate | `/programs-admission/undergraduate-programs/environmental-engineering-bs` |
| Mechanical Engineering (BME) | undergraduate | `/programs-admission/undergraduate-programs/mechanical-engineering-bme` |
| Physics (BS) | undergraduate | `/programs-admission/undergraduate-programs/physics-bs` |
| Civil Engineering (MS) | graduate | `/programs-admission/graduate-programs/civil-engineering-ms` |
| Data Analytics (MS) | graduate | `/programs-admission/graduate-programs/data-analytics-ms` |
| Artificial Intelligence (MS) | graduate | `/programs-admission/graduate-programs/artificial-intelligence-ms` |
| Engineering Management Certificate | certificate | `/programs-admission/certificate-programs/engineering-management-professional-certificate` |
| Minors | minor | `/programs-admission/undergraduate-programs/minors` |

Engineering Management (MS) has a page, a menu entry and an llms.txt line but is not in the finder.
[VERIFY] with Jordan, who owns the finder data, whether that is deliberate. The wider catalog list
(dual degree in architecture and engineering, doctoral programs, ten certificates) is not in the
finder either. [VERIFY] against the registrar catalog before adding any of it.

### 2.2 Department

| Field | Machine name | Type | Req | Card | Notes | Source |
| --- | --- | --- | --- | --- | --- | --- |
| Title | `title` | Text | Y | 1 | "Department of Civil and Environmental Engineering" | dept page |
| Lead | `field_lead` | Text long | Y | 1 | One sentence | `SimpleContentPage` |
| URL alias | `path` | Pathalias | Y | 1 | `/explore-our-college/departments/department-<slug>` | `nav.ts` |
| Programs | `field_programs` | Ref: Program | N | Many | Links under the lead | dept page |
| Research areas | `field_research_areas` | Ref: tile | N | Many | One tile each | `liveContent.ts` |

Six departments are evidenced by the research tiles: Biomedical Engineering, Civil and Environmental
Engineering, Computer Science, Electrical and Computer Engineering, Mechanical Engineering, Physics.
Only one page is built. [VERIFY] names and any seventh unit with the college office.

### 2.3 Research Area tile

| Field | Machine name | Type | Req | Card | Notes | Source |
| --- | --- | --- | --- | --- | --- | --- |
| Label | `title` | Text | Y | 1 | Band prefixes "Research in" | `researchAreas` |
| Target | `field_link` | Link | Y | 1 | `.../faculty-research/areas-research` under the department | `researchAreas` |
| Image | `field_image` | Media image | Y | 1 | 16:9 | `researchAreas` |
| Alt text | `field_image_alt` | Text | Y | 1 | Copy from the manifest | `researchAreas` |

### 2.4 Center or Institute

| Field | Machine name | Type | Req | Card | Notes | Source |
| --- | --- | --- | --- | --- | --- | --- |
| Name | `title` | Text | Y | 1 | Live pages title as "Full Name (ACRONYM)" | `centers` |
| Short name | `field_short` | Text | N | 1 | Eyebrow only where the acronym has no space | `centers` |
| One line | `field_line` | Text | Y | 1 | Restate the name; assert no partners, funding, activity | `centers` |
| Target | `field_link` | Link | Y | 1 | Internal alias, or external for CAIR | `centers` |
| Image, alt | `field_image` | Media image | N | 1 | Leave empty when no verifiable tile exists, as PHaSER does | `centers` |

Five: CABRR, IACS, CAIR, Space Weather Center, PHaSER.

### 2.5 News Story

| Field | Machine name | Type | Req | Card | Notes | Source |
| --- | --- | --- | --- | --- | --- | --- |
| Title | `title` | Text | Y | 1 | Verbatim headline | `stories` |
| Published | `field_published` | Date | Y | 1 | Long form display, ISO `datetime` | `stories` |
| URL alias | `path` | Pathalias | Y | 1 | `/connect-contact/news-events/all-stories/<slug>` | `stories` |
| Image, alt | `field_image` | Media image | N | 1 | Two live stories have none and the card handles it | `stories` |
| Intrinsic size | `field_image_width` | Integer | N | 1 each | Prevents layout shift | `stories` |
| Body | `field_body` | Text formatted | Y | 1 | Not rendered by the redesign yet | news stub |

### 2.6 Event

No event fields render today; the band links to the live index, which held one item when mined.
Proposed from path structure only.

| Field | Machine name | Type | Req | Card | Notes | Source |
| --- | --- | --- | --- | --- | --- | --- |
| Title | `title` | Text | Y | 1 | "Meister Fellowship Seminar 2026 - Dr. Ian L. Pegg" | `live-urls.txt` |
| URL alias | `path` | Pathalias | Y | 1 | `/connect-contact/news-events/all-events/<slug>` | `live-urls.txt` |
| Start, end, location, registration | `field_event_*` | Date, text, link | [VERIFY] | 1 each | No page consumes them, so the real field set has no evidence | [VERIFY] events owner, likely the campus calendar |

Past events is a view of the same type at `.../all-events/past-events`, not a second type.

### 2.7 Faculty Profile

| Field | Machine name | Type | Req | Card | Notes | Source |
| --- | --- | --- | --- | --- | --- | --- |
| Name | `title` | Text | Y | 1 | Slug is the lowercase hyphenated name | `live-urls.txt` |
| Position | `field_position` | Text | Y | 1 | "Associate Professor, Mechanical Engineering" | faculty page |
| URL alias | `path` | Pathalias | Y | 1 | `/connect-contact/faculty-directory/<slug>` | `live-urls.txt` |
| Bio | `field_bio` | Text formatted | N | 1 | Start date, research areas, lab names | faculty page |
| Email | `field_email` | Email | [VERIFY] | 1 | Repo holds none | [VERIFY] per person with HR or the department |
| Location | `field_location` | Text | N | 1 | e.g. "306 Pangborn Hall" | faculty page |

67 profile paths exist. Each is an SEO asset: rebuild it or 301 it, never consolidate it away.

### 2.8 Student Story or Film

| Field | Machine name | Type | Req | Card | Notes | Source |
| --- | --- | --- | --- | --- | --- | --- |
| Title | `title` | Text | Y | 1 | "STEM Career Ambitions as a Double Major" | `films` |
| Student | `field_person` | Text | Y | 1 | Maria Erquiaga, Bella Reyes, Elijah Feret | `films` |
| Blurb | `field_blurb` | Text | Y | 1 | Verbatim from the site | `films` |
| Video ID | `field_video_id` | Text | Y | 1 | Links to `youtube.com/watch?v=<id>` | `films` |
| Thumbnail | `field_thumb` | Media image | Y | 1 | The video's own frame, 1280x720 | `films` |

The thumbnail is decorative; the screen-reader string is "Film by <person>: <title>".

### 2.9 Career Outcome stat

One shared editable block, not a per-program field.

| Field | Machine name | Type | Req | Card | Notes | Source |
| --- | --- | --- | --- | --- | --- | --- |
| Heading | `field_heading` | Text | Y | 1 | Live: "Career Placement for Our College Graduates" | `career` |
| Figure | `field_figure` | Text | Y | 1 | "90%", displayed large | `career` |
| Claim | `field_claim` | Text long | Y | 1 | Publish whole: "90% of graduates report full-time employment or graduate school, a combination of both, or military service." | `career` |
| Qualifier | `field_qualifier` | Text | Y | 1 | "Companies & institutions include:" | `career` |
| Provenance | `field_note` | Text | Y | 1 | Source and retrieval date, shown small | `career` |

### 2.10 Employer wordmark

| Field | Machine name | Type | Req | Card | Notes | Source |
| --- | --- | --- | --- | --- | --- | --- |
| Name | `title` | Text | Y | 1 | NASA, General Motors, IBM, US Navy, Texas A&M, Merck, AECOM, Newport News, Lockheed Martin, Balfour Beatty | `employers` |
| Mark | `field_mark` | Media image | Y | 1 | Keep intrinsic width and height | `employers` |
| Alt | `field_alt` | Text | Y | 1 | "<Name> logo" | `CareerBand.tsx` |

These are graduate destinations, not research partners. Never label them partners.

### 2.11 Navigation group / menu

Three groups carry the primary menu: Programs & Admission, Explore the College, Research & Faculty.

| Field | Machine name | Type | Req | Card | Notes | Source |
| --- | --- | --- | --- | --- | --- | --- |
| Group label | `title` | Text | Y | 1 | Top-level item | `navGroups` |
| Section root | `field_link` | Link | Y | 1 | Where the label points | `navGroups` |
| Match prefixes | `field_match` | Text list | Y | Many | Marks the group current; Explore also matches `/about` | `navGroups` |
| Column heading | `field_columns` | Paragraph | Y | 3 | The panel is three columns | `NavColumn` |
| Column link | `field_links` | Link, note, flag | Y | Many | Note is the small line under a label | `NavLink` |
| Feature card | `field_feature` | Text, text, link, image, alt | Y | 1 | Fourth column of the panel | `navGroups` |
| Contact link | `field_contact` | Link | Y | 1 | Plain link outside the groups, `/connect-contact/contact-us` | `contactLink` |

In the build a `currentSite` flag means "redesigned page not built, point at production". Drupal needs
no such flag: the menu points at the real node. Footer columns come from this same source, capped at
seven links, so header and footer cannot drift. Use one menu source.

### 2.12 Utility link

| Field | Machine name | Type | Req | Card | Notes | Source |
| --- | --- | --- | --- | --- | --- | --- |
| Label | `title` | Text | Y | 1 | Request Info, Apply, Visit, Give, in that order | `utilityLinks` |
| Target | `field_link` | Link | Y | 1 | Give points at `/connect-contact/alumni-giving` | `utilityLinks` |

The footer reuses this minus Visit and adds Contact and News & Events.

### 2.13 Site-wide address and social block

| Field | Machine name | Type | Req | Card | Notes | Source |
| --- | --- | --- | --- | --- | --- | --- |
| College | `field_department` | Text | Y | 1 | "College of Engineering, Physics, and Computing" | `collegeAddress` |
| Building | `field_building` | Text | Y | 1 | "Pangborn Hall 334" | `collegeAddress` |
| Institution | `field_institution` | Text | Y | 1 | "The Catholic University of America" | `collegeAddress` |
| Street | `field_street` | Text | Y | 1 | "620 Michigan Ave., NE" | `collegeAddress` |
| City, state, ZIP | `field_city_state_zip` | Text | Y | 1 | "Washington, DC 20064" | `collegeAddress` |
| Map link | `field_map_link` | Link | Y | 1 | `/explore-our-college/facilities-locations` | `collegeAddress` |
| Give | `field_give_*` | Text, text, link | Y | 1 | "Support the College"; "Make a gift to Catholic University." | `giveLink` |
| Social | `field_social` | Link list | Y | 4 | Facebook, Instagram, YouTube, LinkedIn, university accounts | `socialLinks` |

Store once, reuse in footer and visit band, and mirror into `Organization` JSON-LD and `/llms.txt`.

### 2.14 Legal and copyright block

| Field | Machine name | Type | Req | Card | Notes | Source |
| --- | --- | --- | --- | --- | --- | --- |
| University links | `field_university_links` | Link list | Y | 6 | Athletics, Cardinal Shop, Libraries, Directory, Careers, For Media | `universityLinks` |
| Policy links | `field_legal_links` | Link list | Y | 7 | Copyright & Trademark, Privacy, Consumer Information, En Español, Disability Support, Report Misconduct, Compliance | `legalLinks` |
| Copyright line | `field_copyright` | Text | Y | 1 | "© 1887-2026 The Catholic University of America" | `copyrightLine` |
| Back to top | none | Anchor | Y | 1 | `#main-content`, no field | `SiteFooter.tsx` |

1887 appears only inside that string. [VERIFY] with university communications before it becomes a
claim such as "nearly 100 years".

### 2.15 Page (generic landing or article)

| Field | Machine name | Type | Req | Card | Notes | Source |
| --- | --- | --- | --- | --- | --- | --- |
| Title | `title` | Text | Y | 1 | The single H1 | `SimpleContentPage` |
| Lead | `field_lead` | Text long | N | 1 | One or two sentences under the H1 | `SimpleContentPage` |
| CTA | `field_cta` | Text, link | N | 1 | One button in the dark header | `SimpleContentPage` |
| Body | `field_body` | Text formatted | Y | 1 | Sections alternate plain, card, dark | various pages |

### 2.16 Homepage band

The homepage is an ordered set of bands: a paragraph or block type per band, assembled on one node.

| Field | Machine name | Type | Req | Card | Notes | Source |
| --- | --- | --- | --- | --- | --- | --- |
| Eyebrow | `field_eyebrow` | Text | Y | 1 | Small caps label, e.g. "Research & faculty" | `BandHeading` |
| Title | `field_title` | Text | Y | 1 | The band H2 | `BandHeading` |
| Lead | `field_lead` | Text long | N | 1 | One plain sentence | `BandHeading` |
| Band link | `field_link` | Text, link | N | 1 | The way out of the band | `BandHeading` |
| Tone | `field_tone` | List text | Y | 1 | `plain`, `card`, `dark`; no two adjacent bands share one | `Section` |
| Content | `field_band_items` | Entity refs | Y | Many | Programs, tiles, stories, films or the stat block | `components/home/` |

Current order: Hero, Program Paths, Program Finder, Research, Centers, Career, Student Voices, News,
Ethics and mission, Visit.

## 3. Fields shared by every program page

The degree template consumes one typed object. Names are exactly as the component uses them, in render
order, with the heading each produces.

| Component field | Type | Section heading | Notes |
| --- | --- | --- | --- |
| `title` | text | H1 in the dark header | Program name with credential |
| `credential` | text | none | Declared, not rendered; keep for schema |
| `overview` | text long | under H1 | Lead paragraph |
| `atAGlance` | string list | At a glance | Bullets |
| `outcomes` | string list | Outcomes | Bullets |
| `curriculum` | text long | Curriculum and credits | Paragraph |
| `tracks` | list of `name`, `detail` | Tracks and concentrations | Optional, hides when empty |
| `sampleCourses` | string list | Sample courses | Bullets |
| `careers` | text long | Careers | Paragraph |
| `research` | text long | Research and faculty | Paragraph plus department link |
| `accreditation` | text long | Accreditation | Paragraph plus link to `/about/accreditation` |
| `enrollmentNote` | text long | Enrollment and graduation | Paragraph |
| `faq` | list of `q`, `a` | FAQ | Definition list |

The header adds the breadcrumb "Programs & Admission" and buttons Request Info, Apply, Visit; the
closing band repeats Request Info and Apply. Only Civil Engineering (BCE) is filled, in
`web/src/content/civil-bce.ts`, and it carries [VERIFY] in `atAGlance`, `tracks`, `careers`,
`accreditation` and `faq`. The other thirteen are stubs.

## 4. Editorial rules

Claims that need a named source before publication, and stay [VERIFY] until then.

| Claim | What is missing | Who can confirm |
| --- | --- | --- |
| ABET per program | Program-level status and commission name; the accreditation page and the BECE name disagree | Registrar, department chairs |
| Grand Challenges Scholars "since 2016" | The program is on the site, the start year is not | Dean's office, provost |
| Partners NASA, NIH, NIST, NRL, US Navy | Only NASA and US Navy appear, and only as employer destinations | Research office, PI agreements |
| Nearly 100 years | Rests on an 1887 copyright string alone | University communications |
| The 2025 rename from School of Engineering | Assumed, never dated here; no URL carries the old name, so it lives in bodies and menus | Communications, provost |
| "30 academic programs" | Matches no list in the repo | Registrar catalog |
| Any deadline, ranking, statistic, quote, name | No primary source collected | Admissions, communications |

Images: alt text comes from the manifest or describes only what is visible; no stock photography or
generated people presented as CUA students, faculty or campus; employer marks keep original colors;
the official university logo is never recolored and sits on a white plate because its letterforms are
near-black.

[VERIFY] policy: an unconfirmed statement stays in the draft with the literal tag plus a one-line note
naming who can settle it. Nothing carrying the tag publishes. Sign-off order: content owner, college
communications, then the web team for template and alt-text checks.

Tone: warm, confident, mission-driven, ethics and service, Catholic identity stated once with
restraint. Short sentences, no filler, no em dashes, American spelling.

## 5. Media and images

Files sit in `web/public/media/` as lowercase hyphenated jpgs (45), with two SVG lockups in
`web/public/brand/`. `docs/design-notes/assets-manifest.json` records per asset: `file`, `width`,
`height`, `bytes`, `sourcePage`, `sourceStyle` (the Drupal image style that made the crop, such as
`ks_feature`), `sourceUrl`, `siteAltText`, and sometimes `originalSlug` and `provenanceNote`. Five
files were renamed for readability and keep the old name in `originalSlug`.

Import each file into CMS media under the same filename, upload the original rather than the resized
crop, and rebuild the crop with the matching image style. Same filenames keep the manifest valid, save
retyping alt text, and let refreshes be diffed. Confirm rights first: the manifest calls the
photography university owned but still flags a rights check.

Employer wordmarks have one special rule. Source files are 500x279 gallery crops; any row more than
half dark across the full width is the gallery's rule line, not part of the mark, so trim it. Pad 8px
after trimming. Display is height-locked on a single baseline, about 36 to 40px, with the mark sizing
by aspect ratio inside a fixed tile. Colors and letterforms are otherwise untouched.

The hero uses the still `hero-campus-aerial.jpg`. The live site plays a muted looping aerial clip over
the same frame; that mp4 refused non-browser requests. [VERIFY] with the web team to pull it from
Drupal and decide whether the redesign keeps it.

## 6. Forms and leads

The built Request Information page shows three fields and nothing else.

| Field | Control today | Production need |
| --- | --- | --- |
| Name | text input | Required, with autocomplete |
| Email | email input | Required, validated |
| Program interest | free text | A select over the Program list; free text cannot be routed |

The form does not submit. The "Submit request" button targets `#`, the form has no action, the only API
route in the build is a health probe, and nothing is stored. This page is a layout, not a lead
pipeline, and its own small print says so.

In production each submission writes a lead to the university CRM with source page, program interest,
values and a timestamp. [VERIFY] with admissions which CRM is in place and what its lead record needs;
the repo names no system. [VERIFY] with the office that owns follow-up, since the page promises a
counselor will respond.

## 7. Migration notes

`docs/redirects/live-url-inventory.md` and `live-urls.txt` hold all 477 live paths from the production
sitemap, and `redirect-map.csv` classifies each: 35 identity rows, 15 canonical rewrites, 427 section
fallbacks, 0 unresolved. Nothing on that list may 404. Type ownership by prefix:

| Prefix | Paths | Owning type |
| --- | --- | --- |
| `/programs-admission/...` | 63 | Program, plus Page for apply, visit, scholarships, ENFI |
| `/explore-our-college/departments/...` | 107 | Department, Research Area tile |
| `/explore-our-college/centers-institutes-research/...` | 29 | Center or Institute |
| Other `/explore-our-college/...` | 44 | Page |
| `/connect-contact/news-events/...` | 112 | News Story (107 pages), Event (1 page), four indexes |
| `/connect-contact/faculty-directory/...` | 68 | Faculty Profile (67 people plus the index) |
| Other `/connect-contact/...` | 7 | Page, address and give blocks |
| `/current-students/...` | 35 | Page. No type exists in the redesign yet |
| `/about/...` | 7 | Page, legal block |
| `/`, `/homepage`, `/search`, `/faculty-staff/...` | 5 | Page; `/homepage` must 301 to `/` |
| Total | 477 | Every live path is accounted for |

Two faults belong to the types, not to redirects: 63 paths duplicate program URLs under departments,
and 27 sit six or more segments deep for the same reason. One Program node with one alias plus a
department reference ends that class of bug. The site-map page and any `school-of-engineering` wording
need a content sweep, since neither appears in the URL list.

## 8. Open questions for the client

1. Which CRM receives Request Info leads, what fields does its lead record require, and what response
   time is promised?
2. Is Engineering Management (MS) deliberately absent from the finder, and which catalog programs
   belong in it at launch?
3. Do all 67 faculty profiles become nodes in phase one, or stay on the current template?
4. Does CAIR remain an external Google Sites destination, or move into a Center node?
5. Are events a Drupal type, a calendar feed, or both? The index held one item.
6. Who holds publishing rights for the news channel, and can the 107 story paths import with dates
   intact?
7. Which department pages beyond Civil and Environmental are ready now?
8. Can PHaSER supply its expanded name and a verifiable tile?
9. Who re-approves the "90%" figure each year, and which study is its source?
10. Are `/about/ethics-integrity` and the mission pages in scope, given that the redesign states
    Catholic identity once, in the homepage mission band?
