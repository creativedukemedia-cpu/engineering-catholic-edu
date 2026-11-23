# engineering.catholic.edu redesign

Next.js implementation of the redesigned site for the College of Engineering,
Physics, and Computing at The Catholic University of America. Brand rules live in
`.cursor/rules/master-context.mdc` and are summarized in
[docs/handoff/design-system.md](docs/handoff/design-system.md).

Status: a container build of this repository is published as a permanent staging
mirror with its own URL. It is not `engineering.catholic.edu`, and it refuses
search engines until it is ready to replace the live site.

## Layout

- `web/src/app/`: App Router pages, under the live URL slugs
- `web/src/components/home/`: the homepage bands
- `web/src/components/layout/`: header, footer, `Section`, `Container`
- `web/src/components/templates/`: degree page template, simple content page
- `web/src/components/ui/`: `Button`, `SiteLink`, `OutboundLink`
- `web/src/lib/liveContent.ts`: homepage content mined from the live site, with
  provenance comments and the retrieval date
- `web/src/lib/programs.ts`: program finder data with live hrefs
- `web/src/content/`: typed page copy samples
- `web/public/media/`: college photography and trimmed employer wordmarks
- `docs/`: audit notes, design notes, previews, the redirect map, handoff

## URL policy

Do not rename production paths. Edit in place under the same slugs
(`/programs-admission/`, `/explore-our-college/`, and so on). Every path in the
live sitemap is accounted for in [docs/redirects/redirect-map.csv](docs/redirects/redirect-map.csv).

Regenerate the map after adding or removing pages:

```bash
cd web && python3 scripts/build-redirect-map.py
```

The script refuses to emit a self-redirect or a rule that targets a page this
build does not serve. That is not decoration: an earlier version produced `/` to
`/` and the homepage looped.

## Run it

```bash
cd web
npm ci
npm run redirects   # regenerate the 301/308 map
npm run dev         # http://localhost:3000
```

Checks, in the order that catches problems cheapest:

```bash
cd web
npx eslint src
npx tsc --noEmit
npm run build
python3 scripts/contrast-check.py <render.png> 1440 1000
python3 scripts/contrast-check.py <render.png> 390 844
```

The contrast script measures declared foreground and background pairs against a
real render, including translucent fills over dark bands. It is the gate for the
WCAG 2.2 AA rule in the project instructions. All 75 regions must pass.

## Container

```bash
docker build -t cua-coe-web .
docker run -p 3000:3000 --rm cua-coe-web
curl -i localhost:3000/api/health
```

Two build arguments matter. `NEXT_PUBLIC_SITE_URL` sets the canonical origin for
metadata, Open Graph, JSON-LD, the sitemap and robots. `NOINDEX` defaults to
`true`, so an image built without arguments behaves as a mirror. A production
deploy states otherwise on purpose:

```bash
docker build --build-arg NOINDEX=false \
  --build-arg NEXT_PUBLIC_SITE_URL=https://engineering.catholic.edu .
```

Full hosting notes: [docs/handoff/permanent-hosting.md](docs/handoff/permanent-hosting.md).

## Handoff documents

| Document | For |
| --- | --- |
| [design-system.md](docs/handoff/design-system.md) | Tokens, measured contrast pairs, parts, rules that outlive the framework |
| [cms-content-model.md](docs/handoff/cms-content-model.md) | Content types and fields for a Drupal build |
| [permanent-hosting.md](docs/handoff/permanent-hosting.md) | Build, run, deploy, and moving off Manus hosting |
| [launch-checklist.md](docs/handoff/launch-checklist.md) | What must close before a launch date is announced |
| [blog-plan.md](docs/handoff/blog-plan.md) | News and blog channel, cadence, editorial rules, measures |
| [docs/redirects/live-url-inventory.md](docs/redirects/live-url-inventory.md) | All 477 live paths and what they prove |
| [docs/design-notes/](docs/design-notes/) | Per-pass design decisions and the verbatim content bank |

## Still to wire

1. Request Info leads: the page exists and links to the university's intake, but
   no CRM backend receives a submission.
2. Hero background video: `Hero` accepts `videoSrc`, and the live mp4 sits
   behind a Cloudflare challenge, so the photo is the default.
3. The 427 legacy paths that fall back to a section page until their rebuilt
   page lands.

## Things this repository does not decide

Accreditation wording, program counts, rankings, deadlines, partner claims and
faculty names are marked `[VERIFY]` and stay out of published copy until the
registrar, the provost's office, or the research office confirms them. The
production domain belongs to the university, so a launch requires a request to
University Communications and Web Services.
