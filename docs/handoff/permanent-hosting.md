# Permanent hosting and how to reproduce it

Written 2026-11-23, after the first container publication.

## What is running

A Next.js 16.4.6 App Router build, served by the traced standalone Node server
in a two-stage Docker image, published as a Manus webdev project
("CUA Engineering, Physics and Computing", `wdp_3d4fcfd7f0d355193040198f`).

A version of this site is recorded by a Git commit on the canonical `main`, and
that commit is what the platform builds. Sandbox files are not inputs. The
deployed artifact is reproducible from the repository alone.

Endpoint of the current published version is in the project's Publish panel.
Two things about that address: it is a Manus host, not `engineering.catholic.edu`,
and it is currently configured to refuse search engines. It is a staging mirror.

## Build and run locally

```bash
cd web
npm ci
npm run build           # emits .next/standalone
node .next/standalone/server.js   # needs public/ and .next/static beside it
```

Or the whole image, from the repository root:

```bash
docker build -t cua-coe-web .
docker run -p 3000:3000 --rm cua-coe-web
curl -i localhost:3000/api/health
```

Production image, with indexing switched on deliberately:

```bash
docker build --build-arg NOINDEX=false \
  --build-arg NEXT_PUBLIC_SITE_URL=https://engineering.catholic.edu \
  -t cua-coe-web .
```

## The two build arguments

| Name | Default in Dockerfile | What it controls |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `https://engineering.catholic.edu` | Canonical origin in metadata, Open Graph, JSON-LD, sitemap and robots. |
| `NOINDEX` | `true` | Whether crawlers may index this build. |

The defaults are asymmetric on purpose. An image built without arguments is a
mirror, so it refuses crawlers. A production deploy has to say so out loud.
`web/src/lib/site.ts` also treats any origin that is not the production domain
as a mirror when `NOINDEX` is unset, so a staging host cannot be indexed by
forgetting a flag.

Setting `NOINDEX=true` produces three signals, not one: a `noindex, follow`
meta tag, a `robots.txt` that disallows everything, and an `X-Robots-Tag`
header on every path. Any of the three can be missed by a crawler that
respects the others.

## Health and readiness

`GET /api/health` returns `{"status":"ok"}` with a 200, no authentication, no
cookies, no database, no outbound call. That is the endpoint the publish
pipeline polls, so it must stay dependency-free. `Cache-Control: no-store`.

If a readiness probe ever needs to prove the database is reachable, add a
second endpoint. Do not make liveness depend on a dependency.

## Ports and process

`EXPOSE 3000` matches the app, and the container honors `PORT`. The published
listener is configured by the platform, not by a port declaration in the repo.

`output: "standalone"` means the image ships the traced server plus
`public/` and `.next/static`. Anything that must exist at runtime has to be
copied in the Dockerfile; a file that only exists in the sandbox does not ship.

## Images at runtime

`/_next/image` is live in production mode, so the container needs the image
pipeline. `sharp` is not declared in `package.json`: it arrives through the
lockfile as Next's own optional dependency (0.35.5), and `npm ci` installs the
matching linux binary during the image build. Declaring it separately risks a
lockfile mismatch. If `/_next/image` starts returning 500s in a container,
check `sharp` first.

## What a staging host must never do

1. Never become the indexed copy of a live site. This build refuses crawlers.
2. Never be the source of truth for facts. Copy in
   `web/src/lib/liveContent.ts` carries provenance comments and a retrieval
   date; when a figure changes on the real site, that file is stale and says so.
3. Never be sent to a client as a launch URL. It is a review environment.

## Known staging nuance: link previews

`og:image` resolves against the canonical origin, so on the staging host a link
preview asks `engineering.catholic.edu` for `/media/hero-campus-aerial.jpg`, a
file that only exists in this build. The preview thumbnail will be missing until
launch. To make previews correct on a mirror, build it with its own origin:

```bash
docker build --build-arg NEXT_PUBLIC_SITE_URL=https://<mirror-host> .
```

Do not ship that image to production, and do not let it become the canonical.

## Migration away from Manus hosting

Nothing in this build depends on the platform. To move the site:

1. Point a container host at the image, or hand `docs/handoff/design-system.md`
   and `docs/handoff/cms-content-model.md` to the theme team.
2. Copy `docs/redirects/redirect-map.csv` rules into the edge layer
   (Cloudflare rule set or nginx `location` blocks) if permanent redirects
   should live outside the app. Next.js answers them with 308; an edge rule can
   issue literal 301s if the university requires that.
3. Keep `/api/health`, `/sitemap.xml`, `/robots.txt` and `/llms.txt` reachable
   at the same paths. Some hosts claim reserved paths like `/sitemap.xml` for
   themselves; check whose copy a crawler actually receives.
4. Set the two build arguments for the real origin and verify the three
   indexing signals are gone before announcing the launch.
5. Re-run the contrast gate against the rendered host, not the sandbox.
