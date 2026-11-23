# Live URL inventory, engineering.catholic.edu

Retrieved 2026-11-23 from https://engineering.catholic.edu/sitemap.xml
(cached in the sandbox at `/home/ubuntu/_scrape/live-sitemap.xml`, also
`live-site-map.html` for the site-map page). Full path list: `live-urls.txt`.

**477 distinct paths.** This is the ceiling for the redirect map. Nothing here is
allowed to 404 after launch, which is why the map is generated from this file
rather than written by hand.

## Sections

| section | paths |
| --- | --- |
| `connect-contact/news-events` | 112 |
| `explore-our-college/departments` | 107 |
| `connect-contact/faculty-directory` | 68 |
| `explore-our-college/centers-institutes-research` | 29 |
| `explore-our-college/student-success` | 22 |
| `programs-admission/graduate-programs` | 21 |
| `programs-admission/undergraduate-programs` | 20 |
| `explore-our-college/student-experience-special-programs` | 9 |
| `programs-admission/certificate-programs` | 8 |
| `current-students/guidelines-phd-studies` | 7 |
| `explore-our-college/facilities-locations` | 7 |
| `current-students/policies-all-students` | 6 |
| `current-students/policies-undergraduate-students` | 6 |
| `programs-admission/how-apply-transfers` | 6 |
| `current-students/policies-graduate-students` | 5 |
| `connect-contact/alumni-giving` | 4 |
| `programs-admission/scholarships-aid` | 4 |
| `explore-our-college/mission-vision` | 3 |
| `about/stats-history` | 2 |
| `current-students/career-resources` | 2 |
| `(root)` | 1 |
| `about` | 1 |
| `about/accreditation` | 1 |
| `about/board-visitors` | 1 |
| `about/employment` | 1 |
| `about/ethics-integrity` | 1 |
| `connect-contact` | 1 |
| `connect-contact/contact-us` | 1 |
| `connect-contact/leadership-staff` | 1 |
| `current-students` | 1 |
| `current-students/course-descriptions` | 1 |
| `current-students/course-schedules` | 1 |
| `current-students/fabrication-services-request-students` | 1 |
| `current-students/graduate-teaching-and-research-assistantships` | 1 |
| `current-students/grand-challenges-scholars-program-details-apply` | 1 |
| `current-students/incoming-students` | 1 |
| `current-students/info-new-undergraduates` | 1 |
| `current-students/information-masters-students` | 1 |
| `explore-our-college` | 1 |
| `explore-our-college/academic-resources-special-programs` | 1 |
| `explore-our-college/career-development` | 1 |
| `faculty-staff` | 1 |
| `faculty-staff/fabrication-services-request-faculty-staff` | 1 |
| `homepage` | 1 |
| `programs-admission` | 1 |
| `programs-admission/engineering-new-frontiers-institute` | 1 |
| `programs-admission/request-information` | 1 |
| `programs-admission/visit` | 1 |
| `search` | 1 |

## What the list proves about the known issues

1. `/homepage` exists next to `/`. Two URLs, one page. The redirect map must
   send `/homepage` to `/`.
2. 63 paths carry a duplicated program structure, for example:
   * `/homepage`
   * `/programs-admission/certificate-programs`
   * `/programs-admission/certificate-programs/acoustics-certificate`
   * `/programs-admission/certificate-programs/additive-manufacturing-professional-certificate`
   * `/programs-admission/certificate-programs/data-analytics-professional-certificate`
   * `/programs-admission/certificate-programs/engineering-management-professional-certificate`
   These are the legacy `/academics/...` style URLs surfacing under a
   department. They must 301 to the canonical program page.
3. 27 paths sit six or more segments deep, mostly
   `department-*/academics-programs/graduate-programs/...`. Same problem: the
   department template re-emits college-level paths.
4. The sitemap contains **no** `index.html` suffixes and **no**
   `school-of-engineering` strings, so the old naming in the project brief lives
   in page bodies and menus, not in the URL list. Verify with a content sweep,
   not a redirect rule.
5. Faculty pages dominate the list: 67 under
   `/connect-contact/faculty-directory/`. Each one is an SEO asset, and each
   needs a rebuilt page or a 301. Do not consolidate them away.

## Consequence for the build

`web/scripts/build-redirect-map.py` reads `live-urls.txt`, compares it with the
routes this app actually serves, and emits `redirects.json`: identity for paths
this build owns, and an explicit target for every legacy variant. Anything it
cannot classify is reported for a human decision instead of being guessed.
