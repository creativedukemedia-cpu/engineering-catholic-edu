# Image sources

Nothing on this site is a stock photo, an AI image, a placeholder or a dummy avatar. Every picture is a file that was published on engineering.catholic.edu, downloaded from that host, converted to WebP, and stored in `web/public/media/legacy/` under a name derived from the original filename. The per-file ledger, with the source URL of every image, is `docs/audit/media-manifest.csv`.


## Counts

| item | value |
| --- | --- |
| distinct origin images referenced by the crawl | 694 |
| downloaded from engineering.catholic.edu | 690 (688 as published, 2 from a sibling style) |
| refused by the origin, therefore not used | 4 |
| images referenced by at least one served page | 582 |
| of those, images carrying non-empty alt text | 578 of 579 |
| images rendered with alt="" (decorative banners) | 1 files, 29 placements |
| documents downloaded | 4 |
| total size of downloaded images | 53.3 MB |

## Where alt text comes from

492 of the 690 downloaded images carry the alt text the old page published, after the Drupal `Image 3:` prefixes are stripped. The other 198 had no alt on the source page. Those that a news story uses are captioned `Photo published with this story: <story title>`, because that is a fact about the picture rather than a description of it; decorative banners are given `alt=""` so screen readers skip them (one file, the college's shared faculty banner, used that way); the remainder is art that no served page references. Nothing was given an invented description. `scripts/qa-sweep.py` fails the build if a content image ever ships without alt text.

## Files the origin refuses

Each of these is a Drupal image-style derivative that answers 403 with a Cloudflare page for every URL shape tried, including the unstyled original, so it cannot be downloaded. The reference is removed from the content instead, so no broken image tag ships and no substitute image is invented. Dropping the file into `web/public/media/legacy` under the local name and rebuilding restores the picture.


| local name wanted | source URL on the old site | pages that used it |
| --- | --- | --- |
| `/media/legacy/032024-Eng-Senior-Design-Project-041.webp` | https://engineering.catholic.edu/sites/engineering.catholic.edu/files/styles/cta_bold/public/2026-09/032024 Eng Senior Design Project-041.JPG | /connect-contact/alumni-giving |
| `/media/legacy/102126-Hard-Hat-Ceremony-011.webp` | https://engineering.catholic.edu/sites/engineering.catholic.edu/files/styles/optimized_original_size/public/2026-11/102126 Hard Hat Ceremony-011.JPG | /connect-contact/news-events/all-stories/cepc-alumni-connecting-inspiring-and-making-impact |
| `/media/legacy/DSC_6208.webp` | https://engineering.catholic.edu/sites/engineering.catholic.edu/files/styles/optimized_original_size/public/2026-11/DSC_6208.JPG | /connect-contact/news-events/all-stories/cepc-alumni-connecting-inspiring-and-making-impact |
| `/media/legacy/DSC_6709---Copy.webp` | https://engineering.catholic.edu/sites/engineering.catholic.edu/files/styles/optimized_original_size/public/2026-10/DSC_6709 - Copy.JPG | /connect-contact/news-events/all-stories/ceo-wells-bullard-connects-engineering-leadership-and-service-common-good |


## Filled from a sibling style

Two derivatives were unreachable but the same photograph was reachable under another Drupal style. The file was copied to the missing name and the ledger records `same_original_as`, so the pixel content is still the college's own photo.


| local file | source URL actually used | same photo as |
| --- | --- | --- |
| `/media/legacy/102126-Hard-Hat-Ceremony-004---Copy_0.webp` | https://engineering.catholic.edu/sites/engineering.catholic.edu/files/styles/optimized_original_size/public/2026-10/102126%20Hard%20Hat%20Ceremony-004%20-%20Copy_0.JPG?itok=tWkL6Ffs | `/media/legacy/102126-Hard-Hat-Ceremony-004---Copy_0.JPG.webp` |
| `/media/legacy/DSC_6666---Copy.webp` | https://engineering.catholic.edu/sites/engineering.catholic.edu/files/styles/optimized_original_size/public/2026-10/DSC_6666%20-%20Copy.JPG?itok=Fop8ebZG | `/media/legacy/DSC_6666---Copy.JPG.webp` |


## Documents

Four PDFs are linked from the copy and are served from the repo rather than the old host.


| local file | source URL | page that links it |
| --- | --- | --- |
| `/docs/GCSP-Application-Spring-2019.pdf` | https://engineering.catholic.edu/sites/engineering.catholic.edu/files/2026-09/GCSP%20Application%20Spring%202019.pdf | /current-students/grand-challenges-scholars-program-details-apply |
| `/docs/important-information-about-mathematics-for-cua-engineering-students-upd.pdf` | https://engineering.catholic.edu/sites/engineering.catholic.edu/files/2026-10/important-information-about-mathematics-for-cua-engineering-students-updated-june-20253.pdf | /current-students/incoming-students,/current-students/info-new-undergraduates |
| `/docs/sswrf-schedule.pdf` | https://engineering.catholic.edu/sites/engineering.catholic.edu/files/2026-09/sswrf-schedule.pdf | /explore-our-college/centers-institutes-research/space-weather-center/our-work/past-events/first-international-workshop-small-satellites-space-weather-research-forecasting |
| `/docs/sw-economics-links.pdf` | https://engineering.catholic.edu/sites/engineering.catholic.edu/files/2026-09/sw-economics-links.pdf | /explore-our-college/centers-institutes-research/space-weather-center/our-work/space-weather-and-society |


## Videos

Five pages embed a college video and hotlink its cover frame from img.youtube.com or vumbnail.com. Those frames are not files on engineering.catholic.edu, so they are not carried over, and dropping them silently would lose the video. Each page keeps a text link to the college's own upload instead, labelled with the title the source page published in the alt text. Each target was verified live: the three YouTube IDs return HTTP 200 from the oEmbed endpoint with author "The Catholic University of America", and vimeo.com/317833258 is titled "NanoTechnology and Applied Physics Graduate Program". Table: `docs/audit/video-links.csv`.


## Homepage and section art

The hand-built homepage and the section heroes use 41 files mined from the same origin by `web/scripts/fetch-live-assets.py`, kept under `web/public/media/` with readable names. Each one records the page it came from, the Drupal image style, the exact source URL including the `?itok=` token, and the alt text the college publishes for it. That record is `docs/design-notes/assets-manifest.json`; the table below is the same data.


| local file | source URL | alt text on the old site |
| --- | --- | --- |
| `cepc-school-collage.jpg` | https://engineering.catholic.edu/sites/engineering.catholic.edu/files/styles/cta_large/public/2026-09/CEPC-School-Collage.jpg?h=3f69c139&itok=tM0EM8ki | Collage of conceptual images and scenes from the College of Engineering, Physics, and Computing. |
| `cpec-grad-programs-feature.jpg` | https://engineering.catholic.edu/sites/engineering.catholic.edu/files/styles/ks_feature/public/2026-09/CPEC-Grad-Programs-Feature.jpg?h=7eabb7da&itok=BS4sEy15 | Professor teaching CPEC graduate students. |
| `cpec-undergrad-programs-feature.jpg` | https://engineering.catholic.edu/sites/engineering.catholic.edu/files/styles/ks_feature/public/2026-09/CPEC-Undergrad-Programs-Feature.jpg?h=b9af0d62&itok=LkLfrqD2 | Undergraduate CPEC students in a classroom. |
| `facilities-capitol-model.jpg` | https://engineering.catholic.edu/sites/engineering.catholic.edu/files/styles/hero_bp_desktop/public/2026-09/Facilities-Locations-Hero2.jpg?h=c8ca06b4&itok=G0PML8ni | 3D printed version of the U.S. Capitol building. |
| `g-academic-career-success-graphical.jpg` | https://engineering.catholic.edu/sites/engineering.catholic.edu/files/styles/ks_feature/public/2026-09/G-Academic-Career-Success-Graphical.jpg?h=8b7966f8&itok=n18Tz4UR | Stylized illustrated graphic of academic and career success. |
| `g-article-default-hero.jpg` | https://engineering.catholic.edu/sites/engineering.catholic.edu/files/styles/hero_bp_desktop/public/2026-09/G-Article-Default-Hero-2.jpg?h=c8ca06b4&itok=9Doan9il | Close up of gears, prototypes, device mechanics, and other science & technology inner workings. |
| `g-biomedical-engineering.jpg` | https://engineering.catholic.edu/sites/engineering.catholic.edu/files/styles/ks_feature/public/2026-09/G-Biomedical-Engineering-Hero.jpg?h=7b99080c&itok=6Ycyg69K | Ambient background with DNA and computer analysis of genetics and biology. |
| `g-cabrr.jpg` | https://engineering.catholic.edu/sites/engineering.catholic.edu/files/styles/ks_feature/public/2026-09/G-CABRR-Hero.jpg?h=c8ca06b4&itok=0OIwRux8 | Illustration of human body mechanics with analysis of muscular skeletal systems. |
| `g-cair.jpg` | https://engineering.catholic.edu/sites/engineering.catholic.edu/files/styles/ks_feature/public/2026-09/G-CAIR-Hero.jpg?h=8b7966f8&itok=5HvAoKYJ | AI information network stretching across societal landscape. |
| `g-civil-environmental.jpg` | https://engineering.catholic.edu/sites/engineering.catholic.edu/files/styles/ks_feature/public/2026-09/G-Civil-Environmental-Hero.jpg?h=975df665&itok=2sBTREqb | City landscape connected with the earth and environment. |
| `g-computer-science.jpg` | https://engineering.catholic.edu/sites/engineering.catholic.edu/files/styles/ks_feature/public/2026-09/G-Computer-Science-Hero.jpg?h=ed27e282&itok=C55fNJuU | Computer code and light representing a network data stream. |
| `g-electrical-computer.jpg` | https://engineering.catholic.edu/sites/engineering.catholic.edu/files/styles/ks_feature/public/2026-09/G-Electrical-Computer-Hero.jpg?h=c8ca06b4&itok=cRRmrGPc | Cityscape with electrical and computer elements highlighted to demonstrate how they all connect. |
| `g-iacs.jpg` | https://engineering.catholic.edu/sites/engineering.catholic.edu/files/styles/ks_feature/public/2026-09/G-IACS-Hero.jpg?h=fad30928&itok=SaJKYDPp | Mathematical polygons of space and astrophysics interplay. |
| `g-mechanical-engineering.jpg` | https://engineering.catholic.edu/sites/engineering.catholic.edu/files/styles/ks_feature/public/2026-09/G-Mechanical-Engineering-Hero.jpg?h=c8ca06b4&itok=hzbIoYJu | Gears, components, and equations that are part of mechanical systems functionality.. |
| `g-national-international-visual.jpg` | https://engineering.catholic.edu/sites/engineering.catholic.edu/files/styles/ks_feature/public/2026-09/G-National-International-Visual_0.jpg?h=197483aa&itok=k1c0CO-O | U.S. map in digital form with crest of the globe showing international expanse. |
| `g-physics.jpg` | https://engineering.catholic.edu/sites/engineering.catholic.edu/files/styles/ks_feature/public/2026-09/G-Physics-Hero.jpg?h=c8ca06b4&itok=XqhU6bfZ | Physics equations and mathematical curves overlayed on space. |
| `g-space-weather.jpg` | https://engineering.catholic.edu/sites/engineering.catholic.edu/files/styles/ks_feature/public/2026-09/G-Space-Weather-2.jpg?h=f229d2e1&itok=cMpJdkGa | Sun with solar flares affecting space. |
| `g-study-abroad-oxford-england.jpg` | https://engineering.catholic.edu/sites/engineering.catholic.edu/files/styles/ks_feature/public/2026-09/G-Study-Abroad-Oxford-England.jpg?h=8b7966f8&itok=UCzznhKN | Skyline of Oxford, England with many historic buildings and open sky. |
| `g-sun-and-solar-flares.jpg` | https://engineering.catholic.edu/sites/engineering.catholic.edu/files/styles/ks_feature/public/2026-09/G-Sun-and-Solar-Flares.jpg?h=c8ca06b4&itok=K5HfJZDx | Close image of the sun and solar flares. |
| `g-tech-engineering-physics-opportunities.jpg` | https://engineering.catholic.edu/sites/engineering.catholic.edu/files/styles/hero_bp_desktop/public/2026-09/G-Tech-Engineering-Physics-Opportunities-Hero.jpg?h=c8ca06b4&itok=HTeNDxVy | Abstract graphic representing opportunities in technology, engineering, and physics. |
| `g-technical-innovation-network.jpg` | https://engineering.catholic.edu/sites/engineering.catholic.edu/files/styles/hero_bp_desktop/public/2026-09/G-Technical-Innovation-Network.jpg?h=ed27e282&itok=0NelOQNl | Abstract image of a technical innovation network that combines knowledge. |
| `honors-students-at-the-basilica.jpg` | https://engineering.catholic.edu/sites/engineering.catholic.edu/files/styles/ks_feature/public/2026-09/honors-students-at-the-basilica.jpg?h=3a690676&itok=yjFhuudW | Students from the University Honors Program. |
| `news-acs-award.jpg` | https://engineering.catholic.edu/sites/engineering.catholic.edu/files/styles/large/public/2026-11/Screenshot%20%28119%29.png.webp?itok=s7SqWQgz | Faculty and student pose in front or research presentation. |
| `news-nguyen-taiwan.jpg` | https://engineering.catholic.edu/sites/engineering.catholic.edu/files/styles/large/public/2026-11/group-photo.jpg.webp?itok=AHZ9lsAm | Group of conference attendees. |
| `news-research-funding.jpg` | https://engineering.catholic.edu/sites/engineering.catholic.edu/files/styles/large/public/2026-11/CEPC%20Research%20Funding%20Graphic%20%281%29.png.webp?itok=sWsWZTR_ | $4.8 Million in New Research Funding |
| `news-williams-award.jpg` | https://engineering.catholic.edu/sites/engineering.catholic.edu/files/styles/large/public/2026-10/DSC_6666%20-%20Copy.JPG.webp?itok=X5VusBWm | Vice Admiral Mel Williams poses with students. |
| `partner-AECOM-Name.jpg` | None | AECOM (employer wordmark) |
| `partner-Balfour-Beatty-Name.jpg` | None | Balfour Beatty (employer wordmark) |
| `partner-General-Motors-Name.jpg` | None | General Motors (employer wordmark) |
| `partner-IBM-Name.jpg` | None | IBM (employer wordmark) |
| `partner-Lockheed-Martin-Name.jpg` | None | Lockheed Martin (employer wordmark) |
| `partner-Merck-Name.jpg` | None | Merck (employer wordmark) |
| `partner-NASA-Name.jpg` | None | NASA (employer wordmark) |
| `partner-Newport-News-Name.jpg` | None | Newport News (employer wordmark) |
| `partner-Texas-AM-Name.jpg` | None | Texas A&M (employer wordmark) |
| `partner-US-Navy-Name.jpg` | None | US Navy (employer wordmark) |
| `research-day-promo.jpg` | https://engineering.catholic.edu/sites/engineering.catholic.edu/files/styles/ks_feature/public/2026-09/research-day-promo.jpg?h=70f7ec35&itok=lEIMVfvT | Tiles of science, technology, and other research-related graphics connected and shining. |
| `student-orgs-promo.jpg` | https://engineering.catholic.edu/sites/engineering.catholic.edu/files/styles/ks_feature/public/2026-09/Student-Orgs-Promo.jpg?h=2272e937&itok=TI-IGIEg | University students walking and enjoying campus greenspace area on way to activities.. |
| `students-in-mccarthy-facility.jpg` | https://engineering.catholic.edu/sites/engineering.catholic.edu/files/styles/ks_feature/public/2026-09/Students-in-McCarthy-Facility.jpg?h=15c677f6&itok=Ma-DiMoW | Students designing prototypes in the workspaces in McCarthy building. |
| `students-studying-aeronautics.jpg` | https://engineering.catholic.edu/sites/engineering.catholic.edu/files/styles/ks_feature/public/2026-09/Students-Studying-Aeronautics.jpg?h=b9af0d62&itok=aew1pa9p | Two students working on an airplane model to study aeronautics. |
| `undergrad-student-getting-inspired.jpg` | https://engineering.catholic.edu/sites/engineering.catholic.edu/files/styles/hero_bp_desktop/public/2026-09/Undergrad-Student-Getting-Inspired-Hero.jpg?h=e0ffa489&itok=h_rkVKjg | Undergraduate female student getting inspired. |

Three posters are the published cover frames of the college's own student films on YouTube (`film-O5Yy2gm83QY.jpg`, `film-HSaOvRlYBNo.jpg`, `film-NF017fMKvrE.jpg`). They are downloaded into the repo and used as the poster of a link that goes to the college's upload, never as photography. The homepage hero video itself is not vendored: the origin answers 403 to a non-browser for the mp4, so the hero uses the still instead.


## Where the pictures live

- `web/public/media/legacy/` - the harvested photos, WebP
- `web/public/media/` - homepage and programme art, also downloaded from the college site
- `web/public/docs/` - the four PDFs
- `web/src/content/media-dims.json` - intrinsic width and height per file, so images take their space before loading
- `web/src/content/asset-status.json` - the download ledger, one entry per origin image
