# Header and hero, first pass

Date: 2026-11-23. Files: `src/components/layout/SiteHeader.tsx`, `src/components/home/Hero.tsx`, `src/lib/nav.ts`, `src/app/globals.css`, `src/app/page.tsx`.

## What was wrong

**Menu.** The header sat inside `Container`, so both tiers were inset by white gutters and the Catholic Blue bar clipped the last nav item ("Contact…"). Four flat links could not carry a three-section information architecture. Below `md` the navigation was not rendered at all, so a phone had no way to move around the site. No university logo, no search, no sticky behaviour, no keyboard handling.

**Hero.** The image slot was an empty Catholic Blue div with a placeholder `aria-label`. A `aspect-video max-h-[220px]` letterbox sat above the headline, and the copy had no contrast question to answer because there was no photograph.

## Decisions

**Menu, full bleed.** Two tiers, each edge to edge: a white university tier with the official horizontal lockup (`public/brand/cua-logo-horizontal.svg`, never recoloured, `alt=""` because the link is named) and the utility row Request Info / Apply / Visit / Give in Catholic Red on white (6.72:1). Below it a Catholic Blue tier carries the college wordmark and the primary nav in white (13.12:1). The blue bar is no longer inside the reading column, so nothing crops.

**Three disclosure groups, not four flat links.** `navGroups` in `src/lib/nav.ts` follows the live IA: Programs & Admission, Explore the College, Research & Faculty, plus a plain Contact link. Each opens a white mega panel of three columns and one featured card. Only one panel is open at a time; hovering the bar or the panel keeps it open, Escape closes it and returns focus to its trigger, a click outside closes it, and a route change closes it.

`currentSite: true` marks a link whose redesigned page is not built yet. Those go to the existing production URL and open in a new tab with a `title` that says so. Nothing invented, no production path renamed.

**Phone navigation exists now.** A MENU button opens the same three sections as native `details` disclosures, with the utility row underneath. The hamburger animates to a close icon. This is the single biggest accessibility fix in the change: previously the nav simply did not exist under 768px.

**Contrast and focus.** Focus rings are Bright Blue on light surfaces and white with a dark halo on the blue bar, so a focused control is visible on every background it appears on. Hover on the primary button inverts to white with Catholic Red type rather than shifting to Bright Red, because white on Bright Red is 4.30:1 and the label is body size.

**Hero, real place.** The background is the college's own aerial (`public/media/hero-campus-aerial.jpg`, 2100×1181, downloaded from the live homepage on 2026-11-23), full bleed, capped at 780px so the first fold still shows the top of the quick paths. Type sits bottom-left, which is where the frame is darkest.

Three scrims, all Catholic Blue, no new hues: a vertical gradient that holds the bottom of the frame, a shallow horizontal gradient to protect the left column, and one warm radial spill at the top right for "Lead with Light". Yellow is used only as that spill and as the eyebrow, on dark, never on a light neutral. The headline is Oswald, the subhead is Crimson Text, and a red horizon rule closes the section and hands the page to the paths below.

Under 768px the copy covers most of the plate and the top of the frame is bright sky, so the vertical scrim keeps more ink higher up. That variant is declared in `globals.css` and mirrored in the gate script.

**Video.** The live hero runs `engineering-homepage-video.mp4` over the same still. Cloudflare answers non-browser requests for that file with a 403, so it is not vendored here. `Hero` already accepts `videoSrc`; save the file as `public/media/hero-campus-aerial.mp4` and pass it, and the photo becomes the poster. The still is composed from the same shot, so measured contrast does not change.

## Evidence

`scripts/contrast-check.py` does not sample the screenshot naively: white glyph pixels and their antialiased edges dominate a text block, so a pixel scan measures the letters instead of the plate. The script reconstructs the plate (object-fit crop back onto the source photo, then the three scrims in DOM order), takes the worst case inside each declared text box, and calibrates itself against a text-free strip of the real render. If the model drifts from the browser it fails.

Measured on the production build, 2026-11-23, model within about 1 value per channel of the render:

| Region | 1440 | 390 | Need |
|---|---|---|---|
| hero eyebrow (yellow) | 6.92:1 | 6.94:1 | 4.5 |
| hero H1, worst line | 9.83:1 | 7.30:1 | 3.0 |
| hero subhead | 11.30:1 | 10.97:1 | 4.5 |
| hero quiet link | 12.43:1 | 12.80:1 | 4.5 |
| utility on white | 6.72:1 | not shown | 4.5 |
| nav on Catholic Blue | 13.12:1 | 13.12:1 | 4.5 |

Run: `python3 scripts/contrast-check.py shot.png 1440 1000`. Boxes live in `scripts/contrast-regions.json` and must be re-measured after a layout change.

## Open

- Desktop search is not built; the live site has it. The bar has room for one control.
- The wordmark wraps to two lines between roughly 1024 and 1200px. Legible, but a one-line treatment would be tidier.
- Featured cards in the panels reuse hero photography. Real section imagery belongs there.
- `public/brand/cua-logo-stacked.svg` is vendored but unused; use it in the footer or delete it.

## Second pass, same day: the menu was not opening

Found by interaction testing, then reproduced by hand. Three defects, all mine.

1. Hover opened the panel, then the click that landed on the same button read
   "already open" and closed it again. Every mouse path through the menu was a
   no-op, and a touch tap opened a panel the following pointerleave then shut.
   Fixed with a hover-open, click-pin model: the pin belongs to the trigger
   that was clicked (`pinnedId`), so a click after a hover pins instead of
   closing, a second click on that same trigger closes, and hovering a
   neighbour swaps panels. Leaving the header region always closes, pinned
   included, so an open menu cannot sit over the page once the pointer has
   moved on. A 160ms grace covers the gap between the bar and the panel.
2. Escape only closed mega panels, not the mobile drawer. Escape now closes
   whichever is open and returns focus to the control that opened it; a
   pointerdown outside closes both.
3. `react-hooks/refs` rejected ref writes in the render-time route reset, which
   is correct, so the pin and the pending close are released in an effect
   keyed on `openId`.

Verified against the production build in Chromium over the DevTools protocol
with `web/scripts/cdp-shot.mjs`, new in this pass, because
`chromium --screenshot` cannot click. `--move` opens by hover alone; `--click`
exercises the hover then click path a real mouse takes. Console clean in all
four states. State machine read from the DOM after each step: hover opens,
click after hover keeps it open, click on a neighbour switches, second click
on the pinned trigger closes, Escape closes and refocuses, leaving the region
closes.

### Panel layout

The featured card used to sit under the three link columns, which left a dead
white band whenever a column list was short. It is now a fourth grid column
(`grid-cols-[repeat(3,minmax(0,1fr))_19rem]`): photo, title, line, LEARN MORE.
Each panel was opened by click at 1440, 1280 and 1024. No clipping at the
width where the mega menu first appears; nav labels wrap to two lines at
exactly 1024, which is acceptable.

### Contrast, hover states included

Auditing every accent text state found four failures. Bright Red behind
body-size text is 4.30:1 on White and worse on the warm neutrals, so it does
not qualify outside the "large text on White" allowance. Changed: utility links
keep Catholic Red and gain an underline on hover, mega links hover to Catholic
Red (6.72:1) with a light underline, path card titles hover to Catholic Red on
Limestone (5.67:1), and the quiet Button variant uses Catholic Red text with a
Catholic Red rule.

The gate covers 22 regions now, including hovers, the Sandstone feature card,
the drawer, and the reversed dark section. All pass: feature card title
11.87:1, card label 6.08:1, panel heading 7.12:1, panel note 10.37:1, dark
section body (Light Blue on Catholic Blue) 5.38:1, drawer link 21.00:1, mobile
pill 6.72:1. Hero regions unchanged, and calibration is still about 0.9 per
channel against the render.

`scripts/brand-matrix.py` generates the full palette table the project
instructions point at: `/home/ubuntu/cua-brand-contrast-matrix.md`, copy at
`docs/brand-contrast-matrix.md`. That file did not exist in this sandbox, so it
is computed from the hexes rather than retyped. It confirms Yellow 1.40:1 on
White and Bright Blue 6.83:1, and adds one rule not in the summary: Bright Blue
falls to 2.90:1 on Grey, so focus rings do not belong on Grey fills.

### Open, still

- Desktop search.
- Featured panel imagery.
- `public/media/hero-campus-aerial.mp4`, the video handoff above.
