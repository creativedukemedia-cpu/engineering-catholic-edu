# Open questions and decisions that need Jordan

Built from the 477-path crawl of engineering.catholic.edu on 2026-11-23. Nothing
here is fixed in the code; each item is either a choice for you or a defect in
the source content that the new site reports rather than hides.

## 1. Where leads go

The contact form and the Request Information form validate in the browser,
re-validate on the server, and write to `web/data/leads.jsonl` through
`/api/lead`. No third party receives anything.

Needed from you: the CRM or marketing endpoint (and whether the university's
existing request-info form should simply be linked instead of rebuilt).
Until then, every lead is stored on the server, and if the store cannot be
written the form says so rather than claiming success.

## 2. Seven faculty profiles have no photograph

60 of 67 profiles in the directory have a real headshot from the old site.
Seven do not: the old page shows the college's shared faculty banner instead.
Those profiles now render with no image, which is the honest option under the
no-placeholder rule.

Ask: request the missing headshots from the department administrators, or
accept the text-only profile layout for those seven.

## 3. Eleven directory entries have no department

The directory listing gives a department for 56 of 67 people. The remaining 11
have no department on either the listing or the profile, so the department
filter cannot show them. They stay in the "All" view. Either the source data
needs completing in Drupal, or the filter needs an explicit "Not listed" group.

## 4. One document is still linked from the staging host

`https://engineering-stg.catholic.edu/sites/engineering.catholic.edu/files/...`
appears in the copy of a faculty profile. The build re-points it at the
production host so the download works, but the underlying link in the CMS is
still wrong and should be corrected there.

## 5. "30 academic programs" against the catalogue

The homepage lead says the college offers 30 academic programs. The catalogue
as harvested gives 13 undergraduate majors, 20 graduate programs, 7
certificates and 6 minors, which does not add to 30 under any grouping I can
defend. The claim stays as published and is flagged; you need a number that
matches the catalogue before launch.

## 6. "School of Engineering" leftovers

The college was renamed in 2025 to the College of Engineering, Physics, and
Computing. Old naming still appears in harvested copy, in some document titles,
and inside URLs such as `/about/news/school-engineering-organizes-first-pi-day-run`.
Pages affected are listed in `content-faults.csv` under "old naming". The new
site does not rewrite the words inside a published story, but page titles and
navigation use the current name.

## 7. News category counts differ between the two views

The story listing publishes these counts: Mechanical Engineering 21, Civil and
Environmental Engineering 19, Biomedical Engineering 17, Computer Science 15,
Electrical and Computer Engineering 14, Physics 12. Sum 98, against 107 stories
crawled, because some stories carry more than one category and some carry none.
The site now shows the counts it can prove from the listings it fetched. If you
want exact counts per term, they should come from the CMS, not from a crawl.

## 8. Dead links inside the old copy

116 links in the harvested copy point at places that no longer resolve: removed
Drupal aliases, per-department copies folded onto one URL, other stories that
were never published, and anchors inside a page that the page itself never
defines. A further 5 point at a page that does not exist at all. Rendering them
as links would ship broken clicks, so the words stay and the link is dropped.
95 more dead anchors went away with the breadcrumb sentence described in item 13.
Full list: `docs/audit/content-faults.csv`, kinds "dead anchor on the source
page" and "link to a page that does not exist".

## 9. 301 or 308

The Next.js map now returns a literal HTTP 301 using its explicit `statusCode`
setting. This was checked with `scripts/link-check.py` after the production
build. When the new CMS takes over, copy the same source and destination pairs
from `docs/redirects/redirect-map.csv` into its redirect rules.

## 10. Events

The old site has one events listing (`/connect-contact/news-events/all-events`),
one live event page (the 2026 Meister Fellowship seminar, registering through
`advance.catholic.edu`), a past-events page, and six department news-events
pages including the physics colloquia. All of it is migrated as published.
There is no event feed behind it, so the upcoming list goes stale the moment
that seminar passes. Either an iCal or CMS feed from the university gets wired
in, or the events listing should be folded into the story listing at launch.

## 11. Four photographs the origin refuses

Four photos are referenced by published pages but every URL shape for them
answers 403 with a Cloudflare page, including the unstyled original, so they
cannot be downloaded. They are not referenced on the new site at all: the image
block is removed and the fault is recorded, so nothing ships as a broken tag.
Drop the files into `web/public/media/legacy` with these exact names and rebuild
to bring them back.

| local name wanted | source URL on the old site | page |
| --- | --- | --- |
| `032024-Eng-Senior-Design-Project-041.webp` | `https://engineering.catholic.edu/sites/engineering.catholic.edu/files/styles/cta_bold/public/2026-09/032024 Eng Senior Design Project-041.JPG` | /connect-contact/alumni-giving |
| `102126-Hard-Hat-Ceremony-011.webp` | `https://engineering.catholic.edu/sites/engineering.catholic.edu/files/styles/optimized_original_size/public/2026-11/102126 Hard Hat Ceremony-011.JPG` | story "CEPC Alumni: Connecting, Inspiring and Making an Impact" (also uses `DSC_6208`) |
| `DSC_6208.webp` | `https://engineering.catholic.edu/sites/engineering.catholic.edu/files/styles/optimized_original_size/public/2026-11/DSC_6208.JPG` | story "CEPC Alumni: Connecting, Inspiring and Making an Impact" |
| `DSC_6709---Copy.webp` | `https://engineering.catholic.edu/sites/engineering.catholic.edu/files/styles/optimized_original_size/public/2026-10/DSC_6709 - Copy.JPG` | story "CEO Wells Bullard Connects Engineering Leadership and Service for the Common Good" |

The same photo did work for two other files, so the block is per derivative, not
per photo: `102126-Hard-Hat-Ceremony-004---Copy_0` and `DSC_6666---Copy` were
filled from a different image style of the identical original
(`same_original_as` in `web/src/content/asset-status.json`).

## 12. Five videos keep a link, not a frame

Five pages embed a college video and show its cover art hotlinked from
`img.youtube.com` or `vumbnail.com`. The no-outside-images rule means those
frames are not carried over, and dropping them silently would lose the video.
Each page now renders a text link to the college's own upload instead, with the
title taken from the alt text the source published. Verified live: the three
YouTube IDs return 200 from the oEmbed endpoint with author "The Catholic
University of America", and `vimeo.com/317833258` is titled "NanoTechnology and
Applied Physics Graduate Program". Table: `docs/audit/video-links.csv`. If you
want a playable embed, that is a component decision (privacy mode, consent,
lighthouse cost) rather than a content one.

## 13. Drupal wrote its breadcrumb into the page copy

97 pages begin with a sentence of the form "The Current Page is Centers,
Institutes, & Research" plus a link to the page itself. That is assistive
technology text the old template rendered into the content region, not copy
anyone reads on purpose, so the build drops the line. If you would rather keep
it, it is one filter in `web/scripts/build-content.py`.

## 14. Search

`/search` is served, and it explains that the college's pages are found through
the university search. A site-scoped search of our own is not built; it needs a
decision between the university search, a CMS search API, or an index built
from this repo.
