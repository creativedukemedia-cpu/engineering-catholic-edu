# Launch checklist

Working order for taking the redesigned site live at engineering.catholic.edu.
Items marked BLOCKING must be closed before a launch date is announced. Items
marked [VERIFY] need an answer from the college, not from this repo.

## 0. Decisions only the college can make

1. BLOCKING. Hosting target. Manus hosting is running now as a staging mirror.
   Production should sit on university infrastructure: either a container the
   college runs, or the design rebuilt as a Drupal theme from
   `docs/handoff/design-system.md` and `docs/handoff/cms-content-model.md`.
2. BLOCKING. Who owns DNS, TLS and the origin swap. University Communications
   and Web Services own engineering.catholic.edu. This repo cannot serve that
   domain until they say so.
3. BLOCKING. Editorial owner for the 427 pages that are not rebuilt yet. The
   redirect map sends them to the nearest section, which is a holding pattern,
   not a plan.
4. The 2025 rename wording, exactly as the provost's office approved it.
5. Which analytics implementation and which consent banner apply. A university
   site is not free to add a tracker by itself.

## 1. Facts to verify before any page asserts them

Each of these is currently absent from the site on purpose. Do not add one
until it has a dated source.

- [VERIFY] ABET accreditation, program by program, with the effective date.
  Accreditation claims are the highest-risk sentence on an engineering site.
- [VERIFY] The "30 programs" count, reconciled against the current catalog.
  The project notes already flag this claim as inconsistent.
- [VERIFY] NAE Grand Challenges Scholars participation "since 2016".
- [VERIFY] The partner list as a claim: NASA, NIH, NIST, NRL, US Navy. Which
  are research agreements, which are student placements, which are one grant.
- [VERIFY] "Nearly 100 years" for which unit. The university is older than the
  school, and the school is older than the college's current name.
- [VERIFY] The 90 percent employed-or-continuing figure. It is used with the
  live site's exact qualifier and nothing stronger. Confirm the year and the
  denominator before the sentence appears on a new page.
- [VERIFY] Deadlines, tuition, and application steps anywhere they appear.
- [VERIFY] Faculty names, titles and photos for the 67 faculty paths.

## 2. URLs and redirects

1. BLOCKING. Confirm every one of the 477 live paths resolves to something
   non-404 in the launch build. Run:
   `python3 web/scripts/build-redirect-map.py` after adding pages, then the
   crawler below.
2. Rebuild the map as pages land. A page that exists must be identity, not a
   fallback. The CSV in `docs/redirects/redirect-map.csv` is the audit trail.
3. Check the 15 canonical rewrites by hand: the department-prefixed program
   paths and `/homepage`. Confirm the target is the page the applicant wants.
4. Decide the `/homepage` question. It should 301 to `/`. It is in the live
   sitemap today, which means something links to it.
5. Crawl the old site for URLs the sitemap never listed. The live XML sitemap
   contains no `index.html` and no `/academics/` strings, but the project notes
   say those structures exist in the wild. A crawl plus the Wayback CDX
   index will find them. Do this once; it is not a code problem.
6. Preserve query strings used by marketing and admission email links.
   `?utm_` links into old paths must survive the 301.
7. Note for the platform team: Next.js answers `permanent: true` with HTTP 308,
   not 301. 308 is the method-preserving permanent equivalent and search
   engines consolidate on it. If the university requires literal 301s, they
   belong at the edge (Cloudflare or nginx), not in the app.

## 3. Content and accessibility

1. ALT text present and specific on every image. The manifest carries the live
   site's alt text where it existed.
2. No stock photography of real people, no invented student quotes, no
   fabricated testimonial.
3. Keyboard path through the header, the finder, the drawer and every band.
4. Run `python3 web/scripts/contrast-check.py <render> 1440 1000` and the same
   at `390 844` on the launch build. BLOCKING: all 75 regions pass.
5. Reduced motion: verify hero, panel and photo animations collapse.
6. Focus visible on light and dark fills.
7. WCAG 2.2 AA target, not 2.1. The accessibility skill in this workspace was
   patched to 2.2; an upstream revert would silently weaken this gate.

## 4. SEO and AI answer engines

1. Set `NEXT_PUBLIC_SITE_URL=https://engineering.catholic.edu` and
   `NOINDEX=false` in the production build. BLOCKING. A noindex mirror that
   becomes the live site is invisible to everyone.
2. Submit the new sitemap in Search Console after the swap, keep the old
   property, and watch the coverage report for 404 spikes for 30 days.
3. robots.txt must allow everything at launch. It currently disallows all
   crawlers because this build is a mirror.
4. JSON-LD organization graph: check `foundingDate` and the address against
   the registrar's record before launch. The comment in `layout.tsx` says where
   1887 came from.
5. Keep `llms.txt` current with only claims that cite a real page.
6. Re-check canonicals on every rebuilt page: `alternates.canonical: "./"`
   resolves per route, which is correct, but a template that forgets it
   duplicates the homepage canonical.

## 5. Operations

1. Health endpoint `/api/health` wired to the platform's readiness check.
2. Error monitoring: at minimum, know when a page starts returning 500. Today
   there is none. Decide whether the college wants Sentry, Better Stack, or the
   university's existing tool.
3. Backups: the repo is the source of truth. Media lives in
   `web/public/media` (5 MB), so a Git backup covers it. If media moves to
   object storage, that changes the backup plan.
4. Dependency policy: `npm audit` on a schedule, Next.js minor upgrades behind
   a feature branch. BLOCKING before launch: pin what the image installs.
5. A named human who can redeploy in under an hour.

## 6. Handoff items that cannot be finished here

1. Hero background video. The live mp4 sits behind a Cloudflare challenge, so
   the `Hero` component accepts `videoSrc` and nothing passes it. Ask the
   college for the file.
2. 427 legacy pages that need rebuilt equivalents. The redirect map names them.
3. Request Info form: the page exists and links to the university's intake, but
   no lead-capture backend is wired. Decide CRM destination.
4. Job advertisements and student handbooks are PDFs on the old site. Decide
   whether they stay PDFs or become pages.
