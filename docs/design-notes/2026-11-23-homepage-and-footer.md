# Homepage and footer redesign, 2026-11-23

Second design pass on the homepage. The first pass built the header and hero.
This pass replaced every placeholder band with content mined from the live
site, rebuilt the footer, and then made the whole thing deployable.

Source of truth for the words: `docs/design-notes/2026-11-23-homepage-content.md`
and `web/src/lib/liveContent.ts`. Nothing in a band was written from
imagination. Anything that could not be verified stayed out.

## Band order and why

1. Hero (unchanged from pass one).
2. `ProgramPaths`, four cards. Undergraduate, graduate, working professionals,
   pre-college. This answers the first question a visitor has: which of these
   is me. The order puts the largest audience first.
3. `ProgramFinder`, a white card on Limestone. Card tone here works as a tool,
   not a section. Default state shows no results list, because a truncated
   fake list read like a broken widget.
4. `ResearchBand`, deep Catholic Blue, six department areas of research.
5. `CentersBand`, white cards on Limestone plus one blue "browse all" card.
6. `CareerBand`, the 90 percent figure with its published qualifier, then the
   employer wordmark row.
7. `StudentVoices`, three student films then "Beyond the classroom" life tiles.
8. `NewsBand`, one featured story plus a list, sorted newest first by ISO date.
9. `EthicsBand`, editorial Crimson serif, the mission argument, AI, and CAIR.
10. `VisitBand`, the Capitol model banner, the address, and the two calls.

Background rhythm alternates: Sandstone, Sandstone, Limestone, Blue, Limestone,
Sandstone, Sandstone, White, Blue, Limestone. `Section` gained the `plain`
(white) tone for this. No two adjacent bands share a background.

## What was cut

- The "Proof" band. It contained a fabricated metric and a stub note. Removed
  rather than rewritten: a homepage for a real college does not need a fake
  proof band when the real proof, the 90 percent continuation figure with its
  qualifier, is on the live site.
- A frozen single event in `NewsBand`. Dates go stale and a stale date on an
  admissions page reads as an abandoned site. The band now links the live
  all-stories, all-events and past-events pages.
- PHaSER's photograph. The live site gives that center no image. Rather than
  substitute a generic lab photo, the card is typographic. Say so if asked:
  inventing a photo for a specific place is the kind of error that ends trust.
- Hand-named duplicate photos and four webp copies. `scripts/fetch-live-assets.py`
  now owns filenames through an ALIAS map, so a re-run keeps readable names.

## Decisions worth keeping visible

- Footer columns are derived from `navGroups` in `web/src/lib/nav.ts`. The
  header and footer cannot drift apart, which is how the old site ended up with
  two navigations that disagreed.
- The official logo sits on a white plate. The SVG contains a near-black
  `#1a1818` fill that disappears on Catholic Blue, and brand rules forbid
  recoloring it. A plate is the only honest fix.
- Social links are text, not icons. No icon set was licensed and drawing
  approximations of company marks is not our call.
- Employer wordmarks are height-locked (`h-9 md:h-10 w-auto max-w-full`) inside
  `h-20` cells so marks of very different widths sit on one baseline. They were
  re-trimmed from the 500x279 gallery files with this rule: a row where more
  than half the width is dark is the gallery's full-width rule, not part of the
  mark, so it is cut. NASA had one at y=163.
- `liveContent.ts` records `contentRetrieved` and a provenance comment per
  block. If a number changes on the live site, the file says where it came from.

## Verification

- `scripts/contrast-check.py` with 75 declared regions in
  `contrast-regions.json`. Passes at 1440 and at 390. Translucent fills are
  supported through `background_alpha` and `background_over`, which is how
  `bg-white/5` over Catholic Blue gets measured instead of assumed.
- `npx eslint src`, `npx tsc --noEmit`, `npm run build`: all clean.
- Console: clean on load and during menu interaction, checked with
  `--enable-logging=stderr` and with `scripts/cdp-shot.mjs`.
- Republished site re-checked: 75 regions pass at both widths against the
  published URL, not just against the sandbox build.

## Left as [VERIFY], deliberately absent from the page

ABET status per program, the NAE Grand Challenges Scholars claim, the partner
list as a claim rather than a link row, "nearly 100 years", the 2025 rename
wording, and the "30 programs" count. None of these appear as assertions in the
homepage bands. `web/public/llms.txt` carries only figures that cite a page.
