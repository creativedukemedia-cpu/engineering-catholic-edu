# Engineering.catholic.edu redesign

Next.js site for the College of Engineering, Physics, and Computing (CUA). Brand rules live in `.cursor/rules/master-context.mdc`.

## URL policy

**Do not rename production paths.** Edit in place under the same slugs (`/programs-admission/`, `/explore-our-college/`, etc.).

## Run locally

```bash
cd web
npm install
npm run dev
```

## Structure

- `web/src/app/` — App Router pages mirroring live URLs
- `web/src/components/templates/` — Program degree template, simple content template
- `web/src/content/` — Typed page copy (Civil BCE sample)
- `web/src/lib/programs.ts` — Finder data with live hrefs

## Manus / deploy

Wire forms to the university CRM, replace placeholder hero imagery, and connect news to the CMS. Mark unconfirmed facts as `[VERIFY]` until stakeholders sign off.