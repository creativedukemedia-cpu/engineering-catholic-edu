# Homepage content mined from the live site, 2026-11-23

Everything below was read off engineering.catholic.edu on 2026-11-23. Markup
came from `https://r.jina.ai/<url>` with `x-return-format: html`, cached under
`/home/ubuntu/_scrape/` (raw.html = homepage, news.html, events.html,
pages_*.html = subpages). Assets download with a browser User-Agent. Re-run
`python3 web/scripts/fetch-live-assets.py --all` to refresh.

## News feed, from /connect-contact/news-events

Card markup is `<img src=... alt=...>` then `<h3 class="news-feed__card-title">`
then `<time datetime>`. Titles verbatim.

1. 2026-11-10 Dr. Charles Nguyen Brings AI Expertise to International
   Conference in Taiwan
   /connect-contact/news-events/all-stories/dr-charles-nguyen-brings-ai-expertise-international-conference-taiwan
   img group-photo.jpg.webp, alt "Group of conference attendees."
2. 2026-11-06 Physics Doctoral Student Receives American Ceramic Society Award
   for Materials Science Research
   /connect-contact/news-events/all-stories/physics-doctoral-student-receives-american-ceramic-society-award-materials-science-research
   img "Screenshot (119).png.webp", alt "Faculty and student pose in front or
   research presentation." (typo in the source alt)
3. 2026-11-05 CEPC Students Tour Northrop Grumman's BWI Campus (no image,
   placeholder tile)
   /connect-contact/news-events/all-stories/cepc-students-tour-northrop-grummans-bwi-campus
4. 2026-11-04 CEPC Alumni: Connecting, Inspiring, and Making an Impact (no image)
   /connect-contact/news-events/all-stories/cepc-alumni-connecting-inspiring-and-making-impact
5. 2026-11-03 CEPC Faculty Secure Over $4.8 Million in New Research Funding
   img "CEPC Research Funding Graphic (1).png.webp"
   /connect-contact/news-events/all-stories/cepc-faculty-secure-over-48-million-new-research-funding
6. 2026-10-30 Vice Admiral Mel Williams Leadership Award Presented to
   Outstanding Graduate Students
   img "DSC_6666 - Copy.JPG.webp"
   /connect-contact/news-events/all-stories/vice-admiral-mel-williams-leadership-award-presented-outstanding-graduate-students

Page lead-in, verbatim: "Learn about the latest news and events happening in
the College of Engineering, Physics, and Computing."

## Events, from /connect-contact/news-events/all-events

"Showing 1 - 1 of 1 events": Meister Fellowship Seminar 2026 - Dr. Ian L. Pegg.
Plus a "View Past Events" link (/connect-contact/news-events/all-events/past-events).
Too thin and too perishable to hard-code dates. Link to the index instead.

## Career placement block, from the homepage

Heading verbatim: "Career Placement for Our College Graduates".
Body verbatim: "90% of graduates report full-time employment or graduate
school, a combination of both, or military service. Companies & institutions
include:" then a swiper logo gallery (styles/ks_logo_gallery, 500x279 JPGs):
NASA, General Motors, IBM, US Navy, Texas A&M, Merck, AECOM, Newport News,
Lockheed Martin, Balfour Beatty. Vendored as web/public/media/partner-*.jpg.
So the logos are graduate destinations, not research partners. Do not present
them as research partners. NIH and NIST do not appear; the project brief lists
NASA, NIH, NIST, NRL, US Navy as partners to verify, and only NASA and US Navy
are evidenced here.

## Student films, from the homepage

Section heading verbatim: "Hear from Our Students: STEM, Community, & The
Right Combo". Three tiles, each title then name then YouTube id. Order in the
markup is authoritative:

1. "STEM Career Ambitions as a Double Major", Maria Erquiaga, O5Yy2gm83QY.
   Blurb verbatim: "Maria Erquiaga had the flexibility at Catholic University
   to explore all of her interests, including a double major in Engineering and
   Biology, to pursue her career ambitions."
2. "Community Inside and Outside the Classroom", Bella Reyes, HSaOvRlYBNo.
   Blurb verbatim: "As a Mechanical Engineering major and field hockey athlete,
   Bella Reyes gained community support from faculty, coaches, and peers to
   find balance and insights along her path."
3. "The Right Combo for Lifechanging Results", Elijah Feret, NF017fMKvrE.
   Blurb verbatim: "Elijah Feret wanted a Biomedical Engineering program at the
   cutting edge of research, but also one-on-one attention from professors. At
   Catholic University, he found both."

Thumbnails vendored as web/public/media/film-<id>.jpg (1280x720).

## Centers and institutes, from /explore-our-college/centers-institutes-research

Section "Centers & Institutes", tiles in markup order, each image immediately
before its heading:

- Center for Applied Biomechanics and Rehabilitation Research (CABRR)
  /explore-our-college/centers-institutes-research/center-applied-biomechanics-and-rehabilitation-research-cabrr
  tile G-CABRR-Hero.jpg, alt "Illustration of human body mechanics with
  analysis of muscular skeletal systems."
- Institute for Astrophysics and Computational Sciences (IACS)
  /explore-our-college/centers-institutes-research/institute-astrophysics-and-computational-sciences-iacs
  tile G-IACS-Hero.jpg, alt "Mathematical polygons of space and astrophysics
  interplay."
- Center for Artificial Intelligence Research (CAIR)
  links OUT to https://sites.google.com/cua.edu/cair/about
  tile G-CAIR-Hero.jpg, alt "AI information network stretching across societal
  landscape."
- PHaSER /explore-our-college/centers-institutes-research/phaser
  tile not identifiable by filename (G-Sun-and-Solar-Flares.jpg is the only one
  left in that range). Do not caption a tile after an unverified pairing.
- Space Weather Center
  /explore-our-college/centers-institutes-research/space-weather-center
  tile G-Space-Weather-2.jpg.

Section "Areas of Research", six department tiles, image before heading, and
these filenames name their own department so the pairing is certain:

- Research in Biomedical Engineering G-Biomedical-Engineering-Hero.jpg
  alt "Ambient background with DNA and computer analysis of genetics and biology."
  /explore-our-college/departments/department-biomedical-engineering/faculty-research/areas-research
- Research in Civil and Environmental Engineering G-Civil-Environmental-Hero.jpg
  alt "City landscape connected with the earth and environment."
  /explore-our-college/departments/department-civil-and-environmental-engineering/faculty-research/areas-research
- Research in Computer Science G-Computer-Science-Hero.jpg
  alt "Computer code and light representing a network data stream."
  /explore-our-college/departments/department-computer-science/faculty-research/areas-research
- Research in Electrical and Computer Engineering G-Electrical-Computer-Hero.jpg
  alt "Cityscape with electrical and computer elements highlighted to
  demonstrate how technology..." (source alt truncated)
  /explore-our-college/departments/department-electrical-and-computer-engineering/faculty-research/areas-research
- Research in Mechanical Engineering G-Mechanical-Engineering-Hero.jpg
  alt "Gears, components, and equations that are part of mechanical systems
  functionality."
  /explore-our-college/departments/department-mechanical-engineering/faculty-research/areas-research
- Research in Physics G-Physics-Hero.jpg
  alt "Physics equations and mathematical curves overlayed on space."
  /explore-our-college/departments/department-physics/faculty-research/areas-research
- Also listed: "Interdisciplinary Research" linking to
  /connect-contact/faculty-directory/christopher-raub

## Other photography mined

- /explore-our-college/student-experience-special-programs
  hero Undergrad-Student-Getting-Inspired-Hero.jpg alt "Undergraduate female
  student getting inspired." Feature Professor-Teaching-One-on-One.jpg alt
  "Professor teaching a student with one-on-one learning." Feature
  gcsp-logo.jpeg alt "Grand Challenges Scholars Program logo" (the GCS Program
  is on the site; "since 2016" still unverified). Feature
  G-Senior-Capstone-Hero.jpg, research-day-promo.jpg.
- /explore-our-college/facilities-locations
  hero Facilities-Locations-Hero2.jpg alt "3D printed version of the U.S.
  Capitol building."
- /explore-our-college/career-development
  hero G-Tech-Engineering-Physics-Opportunities-Hero.jpg; feature
  Students-Studying-Aeronautics.jpg alt "Two students working on an airplane
  model to study aeronautics."
- /explore-our-college/centers-institutes-research hero
  G-Technical-Innovation-Network.jpg alt "Abstract image of a technical
  innovation network..."

## Live footer, verbatim link set

College block: "College of Engineering, Physics, and Computing", "Pangborn
Hall 334", "The Catholic University of America", "620 Michigan Ave., NE",
"Washington, DC 20064", then "Support the College" / "Make a gift to Catholic
University". College nav includes Departments, Leadership & Staff, Alumni &
Giving (/connect-contact/alumni-giving), Contact Us.

University links, with the hrefs the live site uses:
- Athletics https://catholicathletics.com/
- Cardinal Shop https://www.catholic.edu/student-experience/cardinal-shop-and-bookstore
- Libraries https://libraries.catholic.edu/
- Directory https://www.catholic.edu/about/departments-offices-services
- Careers https://www.catholic.edu/careers
- For Media https://www.catholic.edu/information-media
- Copyright & Trademark https://www.catholic.edu/copyright-trademark
- Privacy https://www.catholic.edu/privacy
- Consumer Information https://www.catholic.edu/about/consumer-information
- En Espanol https://www.catholic.edu/en-espanol
- Disability Support https://www.catholic.edu/disability-support
- Report Misconduct https://www.catholic.edu/about/report-misconduct
- Compliance https://www.catholic.edu/compliance

Social:
- Facebook https://www.facebook.com/CatholicUniversity
- Instagram https://www.instagram.com/catholicuniversity
- YouTube https://www.youtube.com/user/CatholicUniversity
- LinkedIn https://www.linkedin.com/school/the-catholic-university-of-america/

Copyright line on the live site reads "(c) 1887-2026", which is the only
founding-year evidence collected. Do not turn it into a claim without checking.

## Path inventory

`/home/ubuntu/_scrape/live-site-map.html` and `live-sitemap.xml` hold the live
URL list. Confirmed live paths include /explore-our-college/{career-development,
centers-institutes-research, departments, facilities-locations, mission-vision,
student-experience-special-programs, student-success} and
/programs-admission/{undergraduate-programs, graduate-programs,
certificate-programs, how-apply-transfers, request-information,
scholarships-aid, engineering-new-frontiers-institute}.

## Still unverified, keep [VERIFY] until the catalog or registrar confirms

ABET per-program coverage, Grand Challenges Scholars "since 2016", the "30
programs" count, NIH/NIST/NRL partnerships, any deadline or ranking.
