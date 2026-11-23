# Design system: CUA Engineering, Physics, and Computing

Portable specification for the redesigned site. Source of truth for the brand
is brand.catholic.edu ("Lead with Light"). This file exists so the same system
can be rebuilt in the university CMS, in a Drupal theme, or in any other
renderer without reading React.

Everything below is implemented in `web/src/app/globals.css` (tokens),
`web/src/components/` (parts) and `web/scripts/contrast-regions.json` (the
measured contrast pairs).

## 1. Color

Three tiers, and the tiers are not equal in weight. That is the brand rule:
primaries dominate, secondaries support, tertiary accents are capped at 5 to 10
percent of a layout.

### Primary, dominates

| Token | Hex | Use |
| --- | --- | --- |
| `--catholic-red` | `#b21f2c` | Rules, primary buttons, eyebrows on light, accent bars |
| `--catholic-blue` | `#0a3255` | Dark bands, footer, hero scrim, headings on light |

### Secondary, support

| Token | Hex | Use |
| --- | --- | --- |
| `--bright-red` | `#e82f35` | Horizon rule gradient, hover decoration only |
| `--bright-blue` | `#2459a9` | Focus ring (all light backgrounds) |
| `--light-red` | `#e96955` | Large type on white only |
| `--light-blue` | `#6dacde` | Eyebrow and small labels on dark fills |

### Tertiary, 5 to 10 percent, accents only

| Token | Hex | Use |
| --- | --- | --- |
| `--yellow` | `#ffd65c` | The warm "Lead with Light" spill in the hero scrim |
| `--blue-green` | `#b5e1e1` | Rare, decorative |

### Neutrals

| Token | Hex | Use |
| --- | --- | --- |
| `--black` | `#000000` | Body text on light |
| `--white` | `#ffffff` | Text on dark, card fills, logo plate |
| `--grey` | `#a7a9ac` | Rules and dividers, never text |
| `--lux` | `#b18f50` | Occasional editorial accent, large type on white only |
| `--limestone` | `#efebe9` | `card` band background |
| `--sandstone` | `#f7f3ed` | Page background |

## 2. Contrast, measured, not assumed

Computed sRGB ratios. Full table: `docs/brand-contrast-matrix.md`. The gate is
`web/scripts/contrast-check.py` over 75 declared pairs, run against a render at
1440 and at 390.

- Body text on any light neutral: Black, Catholic Blue, Bright Blue,
  Catholic Red.
- Large text (24px and up, or 19px bold) on **white only**: Bright Red 4.30:1,
  Light Red 3.17:1, Lux 3.04:1.
- Never text on any light neutral: Yellow 1.40:1, Light Blue-Green 1.42:1,
  Light Blue 2.44:1, Grey 2.36:1.
- Light Red and Lux also fail on Limestone (2.68:1) and Sandstone (2.56:1), so
  the no-text rule extends to the warm neutrals. The brand page states the
  restriction for white only. That is too narrow, and this system follows the
  measured version.
- Inverted fills: White on Catholic Blue 13.12:1, White on Catholic Red 6.72:1.
- Focus indicator: 3px `--bright-blue`, offset 2px, 6.83:1 against white, which
  clears SC 2.4.13. On dark fills the ring becomes white with a Catholic Blue
  halo (`.focus-ring-dark`), for SC 2.4.11.

Do not "improve" a color by nudging it. Every pair above was computed against
the brand hex. If a design needs a shade the palette does not have, change the
layout, not the palette.

## 3. Type

| Role | Brand font | Web fallback (implemented) | CSS variable |
| --- | --- | --- | --- |
| Headlines | Acumin Pro Condensed / Extra Condensed Black | Oswald 500 and 700 | `--font-headline` |
| Body | Acumin Pro | Roboto 400, 500, 700 | `--font-body` |
| Editorial | Warnock Pro | Crimson Text 400, 600, italic | `--font-editorial` |

Scale in use: eyebrow 11px/0.16em uppercase Oswald 500; band title
`text-2xl md:text-3xl` headline bold; lead `text-[15px]` to `text-lg` body;
hero headline `text-4xl md:text-6xl`. Editorial serif is reserved for quoted
or argumentative passages (the ethics band) and never used for navigation,
buttons, or data.

`.eyebrow` carries the tracking so a small caps label stays legible. Do not set
headlines in Crimson and do not set body copy in Oswald.

## 4. Space

| Token / value | Use |
| --- | --- |
| `--shell-max: 1280px` | Full-bleed bands: header, mega panels, hero |
| `1120px` | Reading column inside `Section` |
| `px-4 md:px-8 lg:px-10` | Gutter |
| `py-12 md:py-16` | Band padding |
| `--header-height: 121px` | Measured sticky header: 48px white tier plus 73px blue tier |
| `--header-height-sm: 104px` | Compact breakpoint |

`:target` gets `scroll-margin-top: calc(var(--header-height) + 16px)` so anchor
links land below the sticky header. Any CMS port must reproduce that, or in-page
navigation looks broken on the phone.

## 5. Hero treatment

The hero is a real campus photograph with three scrims, all in Catholic Blue
plus one warm spill. No invented hues, no violet gradients.

```
--scrim-ink: 10 50 85;              /* Catholic Blue as channels */
--scrim-vertical   /* the main device: holds the bottom third for the headline */
--scrim-horizontal /* edge falloff toward the copy column */
--scrim-light      /* one radial yellow spill, top right, under 10 percent */
```

The mobile versions of both scrims are stronger and start higher, because on a
phone the copy covers most of the plate and the top of the frame is bright sky.
`scripts/contrast-check.py` mirrors those gradients so the measurement is of
what renders, not of what was intended.

`.horizon-rule` is a 3px Catholic Red to Bright Red to transparent gradient that
closes the hero and hands the page to the bands below.

## 6. Motion

Entrance and response only. Nothing loops, nothing parallaxes.

| Class | Motion | Duration |
| --- | --- | --- |
| `.animate-rise` | opacity 0 to 1, 18px up | 520ms `cubic-bezier(0.22, 0.61, 0.36, 1)` |
| `.animate-panel` | opacity 0 to 1, 8px down | 140ms ease-out |
| `.animate-photo` | scale 1.06 to 1 | 900ms same curve |
| `.delay-1/2/3` | 90 / 170 / 250ms | stagger |

`prefers-reduced-motion` disables all three and collapses every transition to
0.01ms. That block is not optional.

## 7. Parts inventory

| Part | File | Contract |
| --- | --- | --- |
| `Section` | `layout/Section.tsx` | `tone`: `light` (Sandstone), `dark` (Catholic Blue, white text), `card` (Limestone), `plain` (White). Owns band padding and the container. |
| `Container` | `layout/Container.tsx` | `wide` for full-bleed bands, default reading column. |
| `BandHeading` | `home/Band.tsx` | eyebrow, title, optional lead, optional escape link, `onDark`. Every homepage band uses it so the page reads as one argument. |
| `Button` | `ui/Button.tsx` | `primary`, `secondary`, `quiet`; `md`, `lg`; `onDark`. Minimum 44px target. Hover inverts instead of darkening, because Bright Red behind white label text is 4.30:1 and fails for body size. |
| `SiteLink`, `OutboundLink` | `ui/SiteLink.tsx` | One internal/external decision in one place, used by header and footer. `OutboundLink` marks third-party destinations. |
| `Hero` | `home/Hero.tsx` | `videoSrc` optional. Wired for the campus film; the live mp4 sits behind a Cloudflare challenge, so a photo is the default and the video is a handoff item. |
| `ProgramPaths` | `home/ProgramPaths.tsx` | Four pathway cards. |
| `ProgramFinder` | `home/ProgramFinder.tsx` | Filters the verified program list, up to 8 results in two columns, no fake default list. |
| `ResearchBand`, `CentersBand`, `CareerBand`, `StudentVoices`, `NewsBand`, `EthicsBand`, `VisitBand` | `home/*` | Homepage bands. Each reads only from `lib/liveContent.ts`. |
| `SiteHeader` | `layout/SiteHeader.tsx` | Two sticky tiers, three disclosure groups, hover opens, click pins, Escape closes and returns focus, one panel at a time, drawer below 1024px using native `details`. |
| `SiteFooter` | `layout/SiteFooter.tsx` | Four tiers, columns derived from `navGroups` so header and footer cannot drift. Official logo on a white plate because the SVG contains a near-black fill. |
| `ProgramDegreeTemplate` | `templates/ProgramDegreeTemplate.tsx` | The degree page shape. Fields are in `DegreeProgramContent`. |

## 8. Rules that outlive the framework

1. Official university logo only, never recolored, never rebuilt as type.
2. Every photograph of a real person comes from the college. No stock people.
3. Never state a statistic, ranking, deadline, accreditation claim or name that
   is not in a verified source. Mark unverified copy `[VERIFY]`.
4. Old URLs are never renamed. Every production path keeps its slug and gets a
   301 (or 308) to its successor.
5. Alt text describes what is in the frame and what it means here. Decorative
   layers get empty alt.
6. Catholic identity is expressed with restraint. Warm, confident,
   mission-driven. Ethics and service, not slogans.
7. If a color pair is not in the contrast table, it is not allowed.
