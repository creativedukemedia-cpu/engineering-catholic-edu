# Preview states, captured 2026-11-23

Rendered from the production build with `node web/scripts/cdp-shot.mjs`.

Home views are plain screenshots. Menu and drawer views were reached by real
hover, click and key events, so they show interaction states rather than
mock-ups.

| File | What it shows |
|---|---|
| home-1440.png | Desktop fold: two header tiers, hero photo, scrims, path cards |
| home-390.png | Phone fold: condensed tiers, MENU button, hero with the phone scrim |
| menu-hover-programs-1440.png | Programs panel opened by hover alone, no click |
| menu-click-programs-1440.png | Programs panel opened by click, feature card in the fourth column |
| menu-research-1024.png | Research panel at the breakpoint where mega panels first appear |
| drawer-programs-390.png | Phone drawer open, Programs accordion expanded |
| drawer-escape-390.png | Same drawer after Escape, with focus back on the MENU button |

## Captured on the published host, 2026-11-23

Same states, taken from the permanent staging URL rather than the sandbox, to
prove the container build behaves like the local build. The published contrast
gate ran against these renders: 75 regions, all pass, at 1440 and at 390.

| File | What it shows |
|---|---|
| published-1440.png | Desktop fold on the published container |
| published-390.png | Phone fold on the published container |
| published-mobile-hero.png | Phone hero with the mobile scrims |
| published-research-centers-1440.png | Centers grid, including the typographic PHaSER card |
| published-news-visit-1440.png | News and visit bands |
| published-footer-1440.png | Four-tier footer, logo plate, derived columns |
| published-mega-hover-1440.png | Programs panel opened by hover, on the live host |
| published-mega-click-1440.png | Programs panel pinned by click, on the live host |
| published-panel-escape-1440.png | Panel after Escape |
| published-drawer-390.png | Phone drawer open on the live host |
