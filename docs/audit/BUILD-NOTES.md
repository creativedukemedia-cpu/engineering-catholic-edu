# Build notes: inner pages, program pages, blog (2026-11-23)

Brief from Jordan: build all remaining pages (inner, program detail, blog index,
blog detail), keep the old URL structure, no stock or dummy images, crawl the old
site first and post an inventory before building.

## Access to the old site

- Direct curl to `https://engineering.catholic.edu` returns a Cloudflare managed
  challenge ("Just a moment..."). The cloud browser is challenged too.
- The reader proxy works: `https://r.jina.ai/<url>`.
  - Rate limit seen in headers: `x-ratelimit-limit: 20, 20;w=60`.
  - A browser User-Agent gets 403 from the proxy. `curl/8.5.0` works.
  - `-H 'x-target-selector: main'` returns only the article body as markdown,
    with absolute image URLs. That is what the crawler uses.
- Static assets under `/sites/engineering.catholic.edu/files/...` download fine
  with plain curl and no challenge.

## Pipeline (all in `web/scripts/`)

1. `/home/ubuntu/_scrape/crawl.py` → `/home/ubuntu/_scrape/pages/<slug>.md`
   for all 477 sitemap paths. Paced at 3.6s, resumable, manifest in
   `crawl-manifest.jsonl`. Status at the time of writing: ~282 of 477 done, 0 failures.
2. `/home/ubuntu/_scrape/crawl_news.py` → `listings/html/*.html`, the paginated
   story listings (`all-stories?page=0..10`) plus each category
   (`all-stories?category=<tid>&page=N`). Cards carry `<time datetime>`, the
   teaser image with alt, the title link. Real categories from the select:
   tid 7 Biomedical Engineering, 8 Civil and Environmental Engineering,
   11 Computer Science, 66 Electrical and Computer Engineering,
   71 Mechanical Engineering, 76 Physics. 107 stories total.
3. `web/scripts/build-content.py` → `web/src/content/site-content.json`
   plus `docs/audit/page-inventory.csv`, `inventory.md`, `media-manifest.csv`,
   `documents.csv`, `content-faults.csv`.
   - Blocks: h2 h3 h4, p, ul, ol, img, table, cards.
   - Runs: `x` plain, `s` emphasis, `a` link.
   - Links to production paths become internal paths; university-wide
     catholic.edu links stay external; `/sites/...` documents become `/docs/...`.
   - Story publish dates come from the `Published Time:` ISO header on each story
     page (verified: 107 of 107 have it). Non-story pages expose crawl time,
     which is discarded.
   - Mechanical copy normalisation only: em dash to comma or full stop, en dash
     to hyphen, typographic apostrophes, a space restored where the exporter
     glued a word to a link, theme dividers and icon glyphs dropped, the CMS
     request-info field dump dropped, footer chrome dropped.
4. `web/scripts/build-news.py` → `web/src/content/news-meta.json`
   (slug, title, href, date, displayDate, thumbnail, thumbnailAlt, categories).
5. `web/scripts/fetch-assets.py` → downloads images to
   `web/public/media/legacy/*.webp` (original filename, max 1600px, WebP q82),
   documents to `web/public/docs/`, and writes `web/src/content/media-dims.json`.

## Routing decision

One content route serves every harvested path:
`web/src/app/[...path]/page.tsx` with `generateStaticParams` from
`contentPaths()`, `notFound()` for anything unknown, and
`generateMetadata` per page. Static hand-authored segments win over the
catch-all in Next, so the designed pages are untouched.

`RESERVED` in `src/lib/content.ts` lists the paths that keep a hand-authored
page: the homepage, the four program index pages and the Programs & Admission
hub, request-information, news-events (blog index), faculty-directory
(directory), contact-us (form). Everything else is served from content.

Stub `page.tsx` files that only rendered `ProgramStub` or the stub lead are
deleted so the content route can serve real copy: 11 program details,
civil-engineering-ms, engineering-management certificate, civil-engineering-bce,
chuan-fu-lin, department-civil..., deans-welcome, cabrr, phaser, iacs,
space-weather, about, about/accreditation, visit, how-apply-transfers,
centers index, departments index.

## Still to do

- `src/components/content/Blocks.tsx`, `Breadcrumbs.tsx`
- Templates: ContentPage, ProgramPage, StoryPage, PersonPage, NewsIndex, Directory
- Contact form: client-side validation, own `/api/contact` route, no third party
  until Jordan confirms the endpoint. Real addresses/emails/phones only.
- `nav.ts`: flip `currentSite` links to internal where content now exists.
- Regenerate the redirect map: duplicates 301 to canonical, everything else identity.
- `sitemap.ts`, `manus-routes.json`, robots, llms.txt for the new route set.
- Quality: typecheck, lint, build, contrast gate at 360/768/1280, link checker,
  screenshots per template, Lighthouse if runnable.
- Docs: inventory.md, changelog, image source list, open questions.
- Commit, push canonical (checkpoint), mirror to GitHub, publish.

## Known source defects to report, not repair

- `hieu-bui` CV is linked from `engineering-stg.catholic.edu`, a staging host.
- `/about/stats-history/our-history` still says "School of Engineering" after the
  2025 rename.
- Homepage copy claims "30 academic programs"; the catalog count differs.
  Retain the claim as published, flag it.
- Faculty publication lists link through `google.com/url?q=` redirects.

## Status snapshot (later the same day)

- Crawl complete: 477 of 477 paths, 0 failures, 0 empty.
- Listings complete: `all-stories?page=0..10` (107 stories) and each Drupal
  category page. Real category totals from the listings: Mechanical Engineering
  21, Civil and Environmental Engineering 19, Biomedical Engineering 17,
  Computer Science 15, Electrical and Computer Engineering 14, Physics 12.
  The numbers that appeared next to the select options in a previous pass
  (66 and 71 for ECE and ME) were wrong readings of the markup.
- Faculty directory paginates 10 per page for 67 people, and its cards publish
  rank, department term and headshot, which many profile pages omit. Those
  listings are crawled as HTML into `listings/html/dir-N.html` and merged onto
  the profile pages: 67 of 67 matched, 60 headshots, 67 ranks, 56 departments.
- Story teasers: 93 of 107 have a real teaser image. The other 14 use the theme
  file `placeholders/news-placeholder.png`, which is a dummy asset and is
  skipped, so those cards render as type only.
- Assets: 694 images and 4 documents registered; 490 images carry alt text from
  the source. Fetching runs through `scripts/fetch-assets.py` into
  `web/public/media/legacy` and `web/public/docs`, and writes
  `src/content/media-dims.json`.
- Route model: `src/app/[...path]/page.tsx` serves 462 harvested pages;
  10 hand-authored routes stay (home, admission hub, 4 program indexes,
  request-information, news index, directory, contact) plus /api/lead, /api/health.
- Legacy duplicates: 23 paths are legacy shapes. 15 have a canonical twin and are
  removed from the build so the 301 map handles them. 8 are per-department course
  lists with no twin, so they keep their own URL. Recorded in
  `docs/audit/duplicate-urls.csv`.
- Contact and request-information forms post to `/api/lead`, which validates,
  rejects the honeypot and appends to `web/data/leads.jsonl`. Nothing goes to a
  third party until Jordan confirms the CRM endpoint.

## Origin asset behavior (measured 2026-11-23, same day)

* 688 of 694 referenced images are in `web/public/media/legacy` as WebP.
* Drupal image styles are the failure point, not the filenames. A style whose
  derivative exists on disk serves fine with its `?itok=` token; a style the
  origin has not published answers 403 with a 5.7 to 6.0 KB Cloudflare HTML
  page for every URL shape tried, including the unstyled original at
  `/sites/engineering.catholic.edu/files/public/<date>/<file>` and the
  percent-encoded and plus-encoded variants.
* Two blocked derivatives were filled from a working style of the very same
  photograph (`102126 Hard Hat Ceremony-004 - Copy_0` and
  `DSC_6666 - Copy`), which is the `reuse_siblings()` path in
  `scripts/fetch-assets.py`, recorded as `same_original_as` in
  `src/content/asset-status.json`.
* Four photographs remain unreachable and are therefore not referenced at all:
  `/media/legacy/032024-Eng-Senior-Design-Project-041.webp`
  (cta_bold style, story "Engineering students at Senior Design Project"),
  `/media/legacy/102126-Hard-Hat-Ceremony-011.webp`,
  `/media/legacy/DSC_6208.webp`, `/media/legacy/DSC_6709---Copy.webp`.
  `build-content.py` drops the image blocks and records each as the fault kind
  "image not retrievable from the source", so no broken image tag ships.
  They can be added by hand from the CMS media library into
  `web/public/media/legacy` under those exact names.
* Documents: 4 of 4 downloaded, filenames now keep their extension
  (`.../docs/sswrf-schedule.pdf`), because a truncated name that loses `.pdf`
  is a file no browser will open.
* Absolute same-site links in copy are gone: `scripts/urlmap.py` folds them
  onto the served page (`/about-us/contact-us` to `/connect-contact/contact-us`,
  `/news-and-events/2026/07/<slug>.html` to the story URL,
  `/academics/graduate/data-analytics/masters` to
  `/programs-admission/graduate-programs/data-analytics-ms`), and a link whose
  target exists nowhere becomes plain text with a fault row, never a 404.

## Earlier verification snapshot (superseded)

The notes below were the first review pass. See “Final post-review measurements” at the end for corrected totals.

## Intermediate measured state (superseded by final post-review measurements)

* Build commands, in order: `python3 scripts/fetch-assets.py` →
  `python3 scripts/build-content.py` → `python3 scripts/build-redirect-map.py`
  → `python3 scripts/image-sources.py` → `python3 scripts/qa-sweep.py`.
* After the content build: 462 pages / 231,783 words / 3.2 MB site-content.json.
  Faults 227 = 116 dead anchor + 69 old naming + 32 missing alt on source +
  5 link to nonexistent page + 4 blocked image + 1 unfinished.
  Breadcrumbs: 462/462 pages have a trail, 0 non-canonical crumbs.
  Literal markdown markers in shipped text: 0. Spaced thousands ($44, 000): 0.
  Off-site image references: 0 (5 video covers became links to the college's own
  YouTube/Vimeo uploads; 3 of them reuse posters already downloaded locally).
* `scripts/link-check.py` RESULT: PASS. 462 paths all HTTP 200, 33,337 internal
  link occurrences, 625 distinct local assets, 1452 external links, 356
  mailto/tel, 0 broken, 0 of the 15 redirect rules failing.
* `scripts/qa-sweep.py` RESULT: PASS (accepted: 11 self-links on the story
  listing, 2 "coming soon" sentences that are the source's own copy).
* `npx tsc --noEmit` clean, `npx eslint src` clean.
* 48 full-page template screenshots in `docs/previews/` at 1280, 768 and 360, 0 failures.
* Hero/footer contrast gate passes at 1440 and 390.
* Renderer fix worth remembering: `ProgramPage` used to render every
  non-heading block as an intro AND the section blocks again, so program pages
  duplicated their body. `inline_runs` had the same class of bug on dead links
  (position not advanced). Both fixed and measured.
* open-questions.md is now 14 items: 1 leads endpoint, 2 seven profiles without
  a headshot, 3 eleven directory entries without a department, 4 one document
  still on the staging host, 5 the "30 programs" claim, 6 "School of Engineering"
  leftovers, 7 news category counts, 8 dead links, 9 301 redirects, 10 events,
  11 four refused photographs, 12 five videos, 13 Drupal breadcrumb sentence,
  14 search.


## Final post-review measurements (2026-11-23)

* 462 canonical pages, 231,783 words after lead de-duplication. 107 story pages and 67 faculty profiles. 15 exact HTTP 301 redirect rules.
* Fault table is 227 rows: 116 dead anchors, 69 old naming references, 32 source pages missing alt text, 5 links to missing pages, 4 origin-rejected images, 1 unfinished source page.
* Production `npm run build`: pass, 470 static-generation units including app templates and route params. `npx tsc --noEmit` and `npx eslint src`: pass.
* Link check on production server: 462/462 paths HTTP 200; 33,337 internal links; 625 distinct local assets; 0 broken; 15/15 redirects returned 301 to their mapped target.
* QA sweep: pass. Homepage hero/footer contrast gate: pass at its available test widths.
* Screenshots: 16 template families at 360, 768 and 1280 (48 images); homepage focus captures at 1440 and 390.
* Lighthouse 13.6.0, eight page types, desktop and mobile. All Accessibility/Best Practices/SEO scores are 100. Desktop Performance scores 98–100. Mobile Performance range 85–100; three templates score below 90 (home 85, content page 86, profile 89). Do not describe the mobile performance threshold as fully met.
* No imagery is from a stock/AI/placeholder source. Four origin photos were blocked and are omitted. Contact/request-info leads remain stored locally in JSONL pending Jordan's endpoint decision.
