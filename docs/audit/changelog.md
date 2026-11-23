# Changelog: inner pages, program pages, news and directory

Project: engineering.catholic.edu redesign and consolidation.
College of Engineering, Physics, and Computing, The Catholic University of America.
Lead: Jordan. This log covers the build of every page except the homepage.
All numbers below are measured by the scripts named with them, not estimated.

## Batch 1: crawl and inventory

- Audited all 477 production sitemap paths through the reader proxy
  (`web/scripts/` + `/home/ubuntu/_scrape/crawl.py`), because the origin answers
  a Cloudflare managed challenge to direct requests. The 477 paths comprise
  462 canonical content pages and 15 legacy aliases that fold to their canonical
  targets; the aliases are recorded in the redirect map.
- Wrote `docs/audit/page-inventory.csv` (old URL, title, type, words, images,
  documents, status, notes) and `docs/audit/inventory.md`.
- 462 pages carry copy. After exact duplicate-lead removal and source-table
  reconstruction, the final build contains 231,783 words. Fifteen old URL aliases
  fold into the canonical set, leaving 462 served pages and 15 HTTP 301 rules.
  Fifteen pages have under 40 words, mostly short profiles or source pages that
  are thin on the old site too.
- Registered 694 origin images and 4 documents.

## Batch 2: URL consolidation and routing

- `web/scripts/urlmap.py` is the single resolver for the two URL shapes the old
  site runs (`/academics/...index.html` legacy and `/programs-admission/...`
  newer) plus department-copied paths. It folds structure, applies prefix rules,
  and matches a tail against the served set. All 477 live paths resolve; 462 as
  written, 15 by structure.
- `docs/redirects/redirect-map.csv` and `web/redirects.json`: 477 live paths,
  462 served, 15 permanent redirects. They now return literal HTTP 301 responses
  using Next's explicit `statusCode: 301` option. The link checker verifies code
  and destination for every rule.
- Routing: 11 hand-written routes (homepage, programs hub, four program
  indexes, request information, news and events, faculty directory, contact) and
  one catch-all that serves the 462 harvested pages from
  `web/src/content/site-content.json`. Static segments win over the catch-all, so
  a harvested page never shadows a designed one.

## Batch 3: content build

- `web/scripts/build-content.py` turns the crawled markdown into typed blocks
  (heading, paragraph, list, image, table, card grid) with links resolved
 through `urlmap`, so no internal link points at a URL the site does not serve.
- Emphasis, apostrophes and quotes are typographic. `**` markers left in the
  source inside headings and link labels are removed, the words kept.
- Dead links are pruned to plain text and recorded: 116 anchors that go nowhere
  on the old site, plus 5 links to pages that do not exist. A further 95 dead
  anchors disappeared with the Drupal breadcrumb sentence below. Nothing is
  silently deleted; every finding is a row in `docs/audit/content-faults.csv`
  (227 rows in the current build).
- Drupal chrome is dropped from the copy: the "The Current Page is ..."
  breadcrumb sentence that 97 pages carried (which also removed 95 dead
  anchors), `Image 3:` alt prefixes, divider
  svgs, and the in-page "Program Content" jump list.
- Program pages render sections only where the source has them. A source page
  that opens with a long paragraph under a heading renders that text as a lead,
  not as a section title (`ProgramPage` in
  `web/src/components/templates/ContentTemplates.tsx`).

## Batch 4: assets

- `web/scripts/fetch-assets.py` downloaded 690 of 694 origin images into
  `web/public/media/legacy/` as WebP with their original filenames, plus 4 PDFs
  into `web/public/docs/`. Two files were filled from a working image style of
  the identical photograph; the ledger records that as `same_original_as`.
- Four derivatives are refused by the origin (403 Cloudflare on every URL shape,
  including the unstyled original). Their references are removed rather than
  faked, so no broken image tag ships: see `docs/audit/image-sources.md` and
  `open-questions.md` item 11.
- `web/scripts/image-sources.py` writes `docs/audit/image-sources.md` and adds
  the status column to `docs/audit/media-manifest.csv`, which lists every image
  with its source URL, the alt text, and the pages that use it.
- No stock, AI, placeholder or dummy imagery anywhere, in the content layer or
  in the hand-built homepage and templates. The 41 mined homepage and section
  files are listed with their source URLs in `image-sources.md`.
- Five pages hotlinked a video cover from YouTube or vumbnail.com. Those frames
  are not college files, so they were dropped, and the video is kept as a link to
  the college's own upload (`docs/audit/video-links.csv`, item 12).

## Batch 5: templates

- `ContentPage`: heading band, breadcrumbs, body, contact rail, section rail.
- `ProgramPage`: level kicker, hero, on-page section navigation built from the
  source headings, standing next-steps and contact rail.
- `StoryPage`: date, title, lead, body, share links, previous and next, related
  stories. `news-meta.json` holds the publish dates and categories taken from
  the listing; dates are the source's own.
- `PersonPage`: rank, department, contact details, publications and expertise as
  the source lists them. 60 of 67 profiles have a real headshot from the old
  site; the other 7 render with no image, not with a stand-in.
- News index: category filter, year filter, search, pagination, teaser cards
  with the source's own dates. Faculty directory: department filter, search,
  initial jump. Contact: accessible form with client and server validation,
  errors announced to assistive technology, stored to `web/data/leads.jsonl`
  until an endpoint is decided (item 1).
- Every page has a unique title, meta description, canonical URL and Open Graph
  pair; `sitemap.xml`, `robots.txt` and `llms.txt` are generated from the served
  set. The staging mirror is noindexed and its canonicals point at
  engineering.catholic.edu.

## Batch 6: verification

- `web/scripts/qa-sweep.py` over the generated content: 462 pages, no staging
  host in any URL, no em or en dashes, no double spaces, no shipped content image
  without alt text, no link to a page the site does not serve.
  Result: PASS, with only the accepted findings listed in the script.
- `web/scripts/link-check.py` requests every served path from a running server
  and checks every href and src it returns, plus all 15 redirect rules.
  Result on the initial pass: 462 paths, all HTTP 200, 37,033 internal link occurrences, 0 broken,
  0 redirect rules failing. Written to `docs/audit/link-check.json`.
- `web/scripts/shot-templates.sh` captures one page per template at 1280 and 360
  into `docs/previews/` (32 image captures on the first pass). Final pass adds
  768px, for 48 full-page image captures. No page errors or failed requests.
- `npx tsc --noEmit` and `npx eslint src`: clean.
- `web/scripts/contrast-check.py` on the homepage hero and footer at 1440 and
  390: all regions pass. Inner-page text sits on flat brand fills, whose ratios
  are computed in `/home/ubuntu/cua-brand-contrast-matrix.md`.

## What changed after the first review pass

1. Program pages rendered their body twice. `ProgramPage` filtered every
   non-heading block into an "intro" list and then rendered the sections again.
   It now renders blocks before the first heading once, and the sections once.
2. Any paragraph containing a dead link repeated itself. The dead-link branch in
   `inline_runs` did not advance the parse position, so the rest of the line was
   emitted again from the old offset, with the markdown link syntax showing
   through. Fixed; the 116 pruned anchors now render once.
3. Thousands separators were broken: `$44,000` shipped as `$44, 000`, because the
   punctuation rule added a space after any comma followed by a digit. It now
   leaves a comma between digits alone.
4. Breadcrumbs could link at URLs that no longer exist. `breadcrumbsFor` built a
   trail from raw path segments. Every crumb is now resolved through `urlmap` at
   build time and only kept when it lands on a served page; all 462 pages have a
   trail, and each crumb is canonical.
5. Two blocked photos were recovered from a sibling image style of the same
   file, and four unreachable ones are now removed instead of rendered broken.
6. Empty-label icon links (`[](https://…)`), which shipped as literal markdown,
   now render their address as the label.
7. `docs/audit/open-questions.md` grew from 11 to 13 items, with counts and file
   paths corrected against the current build.


## Batch 7: visual and production review fixes

- Rebuilt four undergraduate curriculum data sections as semantic HTML tables. The crawl reader had flattened row cells; the new table parser uses only the source column headings and existing cell values. Seven canonical pages now contain structured table blocks (62 total).
- Removed exact repeated sentences where the same full lead appeared in the body, without dropping section-only copy. Result: 462 canonical pages and 231,783 words.
- Corrected glued amounts and labels (`secured $44,000`, `Curriculum: The…`). Numeric comma formatting remains intact.
- Raised dark-background eyebrow/category text to the Light Blue brand token. Lighthouse finds 100 accessibility for every representative template.
- Fixed program-index heading order, removed the repeated program hero photograph, and improved image fetch priority. Converted the inactive homepage hero-video control to a server-rendered photograph using the existing verified source image.
- Changed redirects from Next's `permanent: true` (HTTP 308) to explicit `statusCode: 301`. All 15 rules verified as exact 301s and correct destinations.
- Production build completed successfully. `tsc` and ESLint are clean. Link check: 462/462 pages HTTP 200, 33,337 internal href/src references, 625 distinct local asset refs, no broken links or assets, 15/15 redirects correct.
- Latest 48 Lighthouse measurements cover eight representative templates at mobile and desktop. 100 accessibility, best-practices and SEO across the set; desktop performance 98–100. Mobile scores vary: 85–100; home, content-page and profile templates remain below the requested 90 performance floor. See `docs/audit/lighthouse/README.md` and `scores.csv`.
- Screenshots: all 16 templates at 360/768/1280 (48 total), plus focused homepage 1440/390 views. No visible placeholder/dummy imagery; only origin images are referenced.

- The raw Lighthouse JSON files stay in the sandbox under `docs/audit/lighthouse/`; only `README.md` and `scores.csv` are versioned to keep the checkpoint lean.
