#!/usr/bin/env python3
"""
Contrast gate for text that sits on the hero plate.

Why not just sample the screenshot: the glyphs themselves are white, and
antialiased edges fill a text block with near-white pixels, so a pixel scan
measures the letters rather than the background behind them. This script
reconstructs the plate instead.

  1. Map a screen point through the CSS `object-fit: cover` crop back onto the
     source photo.
  2. Apply the three scrim layers in DOM order, using the same stops declared
     in src/app/globals.css (`--scrim-vertical`, `--scrim-horizontal`,
     `--scrim-light`).
  3. Composite over the photo to get the plate, then take the worst-case
     WCAG ratio for the declared text colour across the region.

Step 4 is the honesty check: the model is compared with pixels from a
text-free strip of the real screenshot. If the model drifts from what the
browser painted, the gate is worthless, so it fails loudly.

    python3 scripts/contrast-check.py shot-desktop.png 1440 1000

Thresholds: 4.5:1 body text, 3:1 large text (24px regular or 18.66px bold).
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

from PIL import Image

HERE = Path(__file__).resolve().parent
REGIONS = HERE / "contrast-regions.json"
PHOTO = HERE.parent / "public" / "media" / "hero-campus-aerial.jpg"

BRAND = {
    "white": (255, 255, 255),
    "black": (0, 0, 0),
    "catholic-blue": (10, 50, 85),
    "catholic-red": (178, 31, 44),
    "bright-red": (232, 47, 53),
    "light-blue": (109, 172, 222),
    "yellow": (255, 214, 92),
    "sandstone": (247, 243, 237),
    "limestone": (239, 235, 233),
    "grey": (167, 169, 172),
    "bright-blue": (36, 89, 169),
    "lux": (177, 143, 80),
    "light-red": (233, 105, 85),
}
INK = (10, 50, 85)  # Catholic Blue

# Stop lists copied from globals.css: (position from the start of the axis, alpha)
VERTICAL = [(0.0, 0.97), (0.16, 0.94), (0.32, 0.86), (0.46, 0.66),
            (0.62, 0.32), (0.78, 0.10), (0.92, 0.0)]
HORIZONTAL = [(0.0, 0.62), (0.22, 0.44), (0.46, 0.16), (0.64, 0.0)]
LIGHT = [(0.0, 0.26), (0.42, 0.07), (0.68, 0.0)]

# globals.css replaces the first two under `max-width: 767px`. Keep in step.
VERTICAL_SM = [(0.0, 0.98), (0.26, 0.96), (0.46, 0.93), (0.64, 0.86),
               (0.82, 0.72), (1.0, 0.58)]
HORIZONTAL_SM = [(0.0, 0.74), (0.30, 0.60), (0.58, 0.32), (0.84, 0.10)]


def interp(stops, t: float) -> float:
    if t <= stops[0][0]:
        return stops[0][1]
    if t >= stops[-1][0]:
        return stops[-1][1]
    for (a, va), (b, vb) in zip(stops, stops[1:]):
        if a <= t <= b:
            f = 0 if b == a else (t - a) / (b - a)
            return va + (vb - va) * f
    return stops[-1][1]


def rel_lum(rgb) -> float:
    def c(v: float) -> float:
        v /= 255
        return v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4

    r, g, b = (c(v) for v in rgb[:3])
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def ratio(fg, bg) -> float:
    a, b = rel_lum(fg), rel_lum(bg)
    hi, lo = max(a, b), min(a, b)
    return (hi + 0.05) / (lo + 0.05)


def over(fg, alpha, bg) -> tuple:
    return tuple(round(fg[i] * alpha + bg[i] * (1 - alpha)) for i in range(3))


class Plate:
    """Screen point -> composited colour, for one viewport size."""

    def __init__(self, width: int, height: int, header: int, photo_path=PHOTO):
        # The hero does not always run to the bottom of the viewport: on a
        # phone it is a fixed minimum height, so the plate box comes from the
        # spec. `height` is only the fallback.
        top, bottom = header, height
        self.w, self.h, self.top = width, bottom - top, top
        small = width < 768
        self.vertical = VERTICAL_SM if small else VERTICAL
        self.horizontal = HORIZONTAL_SM if small else HORIZONTAL
        self.img = Image.open(photo_path).convert("RGB")
        pw, ph = self.img.size
        self.scale = max(self.w / pw, self.h / ph)
        rw, rh = pw * self.scale, ph * self.scale
        # Desktop uses object-position 50% 42%; mobile 38% 46%.
        px_pos = 0.5 if width >= 768 else 0.38
        py_pos = 0.42 if width >= 768 else 0.46
        self.ox = (rw - self.w) * px_pos
        self.oy = (rh - self.h) * py_pos
        self.px = self.img.load()
        self.psize = (pw, ph)

    def photo_at(self, sx: float, sy: float):
        u = int((sx + self.ox) / self.scale)
        v = int((sy - self.top + self.oy) / self.scale)
        u = min(max(u, 0), self.psize[0] - 1)
        v = min(max(v, 0), self.psize[1] - 1)
        return self.px[u, v]

    def color_at(self, sx: float, sy: float):
        col = self.photo_at(sx, sy)
        t_down = (sy - self.top) / self.h          # 0 at top, 1 at bottom
        alpha = interp(self.vertical, 1.0 - t_down)  # gradient runs upward
        col = over(INK, alpha, col)
        alpha = interp(self.horizontal, sx / self.w)
        col = over(INK, alpha, col)
        # radial-gradient(78% 62% at 86% 2%)
        dx = (sx / self.w - 0.86) / 0.78
        dy = (t_down - 0.02) / 0.62
        d = (dx * dx + dy * dy) ** 0.5
        alpha = interp(LIGHT, d)
        col = over(BRAND["yellow"], alpha, col)
        return col

    def worst(self, box, fg):
        x0, y0, x1, y1 = box
        worst_ratio, worst_colour = 99.0, None
        step = 2
        for sy in range(y0, y1, step):
            for sx in range(x0, x1, step):
                col = self.color_at(sx, sy)
                r = ratio(fg, col)
                if r < worst_ratio:
                    worst_ratio, worst_colour = r, col
        return worst_ratio, worst_colour


def calibrate(plate: Plate, im: Image.Image, strip) -> tuple[float, float]:
    """Compare model with a text-free strip of the render."""
    px = im.convert("RGB").load()
    x0, y0, x1, y1 = strip
    errs = []
    for sy in range(y0, y1, 7):
        for sx in range(x0, x1, 7):
            model = plate.color_at(sx, sy)
            real = px[sx, sy]
            errs.append(sum(abs(model[i] - real[i]) for i in range(3)) / 3)
    return max(errs), sum(errs) / len(errs)


def main() -> int:
    if len(sys.argv) != 4:
        print(__doc__)
        return 2
    shot = sys.argv[1]
    width, height = int(sys.argv[2]), int(sys.argv[3])
    spec = json.loads(REGIONS.read_text())
    im = Image.open(shot)
    if im.size != (width, height):
        print(f"note: screenshot is {im.size}, config assumed {(width, height)}")

    top, bottom = spec["hero"][str(width)]
    plate = Plate(width, bottom, top)

    band = spec["calibration"][str(width)]
    worst_err, mean_err = calibrate(plate, im, band)
    print(f"{Path(shot).name} @ {width}x{height}")
    print(f"model vs render on a text-free strip: mean {mean_err:.1f}, max "
          f"{worst_err:.1f} per channel (tolerance 12)")
    if mean_err > 12:
        print("FAIL  scrim model does not match the render; fix the model or the boxes")
        return 1

    print("-" * 76)
    failures = 0
    for region in spec["regions"]:
        if str(region.get("viewport")) != str(width):
            continue
        fg = BRAND[region["foreground"]]
        need = 3.0 if region.get("size") == "large" else 4.5
        if region.get("type") == "flat":
            # Solid brand fill: read it straight from the palette table.
            col = BRAND[region["background"]]
            # Tailwind opacity modifiers, e.g. text-black/75, composite the
            # ink with the fill before it reaches the eye.
            alpha = region.get("foreground_alpha")
            if alpha is not None:
                fg = over(fg, alpha, col)
            r = ratio(fg, col)
        else:
            r, col = plate.worst(tuple(region["box"]), fg)
        ok = r >= need
        failures += 0 if ok else 1
        print(f"{'PASS' if ok else 'FAIL'}  {region['name']:<26} {r:6.2f}:1 "
              f"(need {need})  worst plate rgb{col}")
    print("-" * 76)
    print("all regions pass" if not failures else f"{failures} region(s) below AA")
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
