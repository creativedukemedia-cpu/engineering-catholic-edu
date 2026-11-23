#!/usr/bin/env python3
"""Mine photography from the current engineering.catholic.edu site.

The site is Drupal behind a Cloudflare managed challenge. Two routes work from
this sandbox:

  * rendered markup: https://r.jina.ai/<url> with the header
    `x-return-format: html`
  * the asset files themselves: a direct GET with a browser User-Agent

This script does both, then writes resized copies into public/media plus a
manifest recording where every image came from and the alt text the site uses
for it. The manifest is the provenance record for the client, so nobody has to
guess whether a photo was invented, and the alt text is the starting point for
accessible captions.

  python3 scripts/fetch-live-assets.py --all
  python3 scripts/fetch-live-assets.py --pages /connect-contact/news-events
  python3 scripts/fetch-live-assets.py --all --dry-run

Markup dumps are cached in CUA_CACHE_DIR (default /home/ubuntu/_scrape, else
public/media/.page-cache) so repeat runs work offline.
"""

import argparse
import html
import io
import json
import os
import re
import subprocess
import sys
import urllib.parse
from pathlib import Path

LIVE = "https://engineering.catholic.edu"
UA = ("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36")
ROOT = Path(__file__).resolve().parent.parent
MEDIA = ROOT / "public" / "media"
MANIFEST = ROOT.parent / "docs" / "design-notes" / "assets-manifest.json"

WORKING_SET = [
    "/",
    "/connect-contact/news-events",
    "/explore-our-college/centers-institutes-research",
    "/explore-our-college/student-experience-special-programs",
    "/explore-our-college/facilities-locations",
    "/explore-our-college/career-development",
]

# Styles that carry photography. Logos, icons and dividers are skipped.
KEEP_STYLES = {
    "hero_bp_desktop", "hero_hp_desktop", "cta_large", "cta_eop",
    "ks_feature", "large", "medium",
}
SKIP_RE = re.compile(r"(logo|icon|divider|placeholder|banner-ad|\.svg)", re.I)


def get(url: str, timeout: int = 90) -> bytes:
    """Fetch through curl. urllib cannot resolve r.jina.ai in this sandbox."""
    res = subprocess.run(
        ["curl", "-sS", "-L", "-m", str(timeout), "-A", UA, url],
        capture_output=True, check=False,
    )
    if res.returncode != 0 or not res.stdout:
        raise RuntimeError(res.stderr.decode("utf-8", "ignore").strip() or "empty response")
    return res.stdout


def dump_path(path: str) -> Path:
    cache = Path(os.environ.get("CUA_CACHE_DIR", "/home/ubuntu/_scrape"))
    if not cache.is_dir():
        cache = MEDIA / ".page-cache"
    if path == "/":
        return cache / "raw.html"
    if path == "/connect-contact/news-events":
        return cache / "news.html"
    return cache / ("pages" + path.replace("/", "_") + ".html")


def rendered(path: str) -> str:
    cand = dump_path(path)
    if cand.exists():
        return cand.read_text(encoding="utf-8", errors="ignore")
    markup = get("https://r.jina.ai" + LIVE + path).decode("utf-8", "ignore")
    cand.parent.mkdir(parents=True, exist_ok=True)
    cand.write_text(markup)
    return markup


def mine(markup: str, page: str):
    out = []
    for m in re.finditer(r'<img[^>]+src="(/sites/[^"]+)"[^>]*>', markup):
        tag = m.group(0)
        src = html.unescape(m.group(1))
        style = re.search(r"/styles/([^/]+)/", src)
        style = style.group(1) if style else "original"
        if style not in KEEP_STYLES:
            continue
        alt = re.search(r'alt="([^"]*)"', tag)
        alt = html.unescape(alt.group(1)).strip() if alt else ""
        name = urllib.parse.unquote(Path(src.split("?")[0]).name)
        if SKIP_RE.search(name):
            continue
        out.append({"page": page, "style": style, "src": src, "alt": alt, "name": name})
    return out


def slug(name: str) -> str:
    """G-Article-Default-Hero-2.jpg -> g-article-default."""
    stem = Path(name).stem.lower()
    stem = re.sub(r"[^a-z0-9]+", "-", stem).strip("-")
    stem = re.sub(r"-(hero|copy|final|\d+)$", "", stem)
    return ALIAS.get(stem + ".jpg", stem + ".jpg")


# Names the generic rules render badly (a screenshot, a " - Copy" scan). Keyed
# on the slug, so a re-run writes the file the manifest and components use.
ALIAS = {
    "screenshot-119-png.jpg": "news-acs-award.jpg",
    "dsc-6666-jpg.jpg": "news-williams-award.jpg",
    "dsc-6666-copy-jpg.jpg": "news-williams-award.jpg",
    "group-photo-jpg.jpg": "news-nguyen-taiwan.jpg",
    "cepc-research-funding-graphic-1-png.jpg": "news-research-funding.jpg",
    "facilities-locations-hero2.jpg": "facilities-capitol-model.jpg",
}


def save(item: dict, max_w: int):
    from PIL import Image

    data = get(LIVE + item["src"])
    img = Image.open(io.BytesIO(data))
    img.load()
    if img.mode != "RGB":
        base = Image.new("RGB", img.size, (255, 255, 255))
        base.paste(img.convert("RGBA"), mask=img.convert("RGBA").split()[-1])
        img = base
    w, h = img.size
    if w > max_w:
        img = img.resize((max_w, round(h * max_w / w)), Image.LANCZOS)
        w, h = img.size
    out = MEDIA / slug(item["name"])
    img.save(out, "JPEG", quality=82, optimize=True, progressive=True)
    return {
        "file": f"public/media/{out.name}",
        "width": w,
        "height": h,
        "bytes": out.stat().st_size,
        "sourcePage": item["page"],
        "sourceStyle": item["style"],
        "sourceUrl": LIVE + item["src"],
        "siteAltText": item["alt"] or None,
    }


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--pages", action="append", default=[])
    ap.add_argument("--all", action="store_true")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--max-width", type=int, default=1600)
    args = ap.parse_args()

    pages = WORKING_SET if args.all or not args.pages else args.pages
    MEDIA.mkdir(parents=True, exist_ok=True)

    existing = {}
    if MANIFEST.exists():
        existing = {r["sourceUrl"]: r for r in json.loads(MANIFEST.read_text())["assets"]}

    records = list(existing.values())
    seen = set()
    for page in pages:
        try:
            markup = rendered(page)
        except Exception as err:
            print(f"  mine FAILED {page}: {err}", file=sys.stderr)
            continue
        items = mine(markup, page)
        print(f"{page}: {len(items)} photograph(s)")
        for item in items:
            full = LIVE + item["src"]
            if full in seen:
                continue
            seen.add(full)
            if full in existing:
                continue
            if args.dry_run:
                print(f"   would fetch  {item['style']:17s} {slug(item['name']):32s} "
                      f"{item['alt'][:56]}")
                continue
            try:
                rec = save(item, args.max_width)
            except Exception as err:
                print(f"   fetch FAILED {item['name']}: {err}", file=sys.stderr)
                continue
            records.append(rec)
            print(f"   saved {rec['file']} {rec['width']}x{rec['height']} "
                  f"{rec['bytes'] // 1024}KB  alt={rec['siteAltText']!r}")

    unique = {r["sourceUrl"]: r for r in records if r.get("sourceUrl")}
    MANIFEST.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST.write_text(json.dumps({
        "generatedBy": "web/scripts/fetch-live-assets.py",
        "site": LIVE,
        "retrieved": "2026-11-23",
        "note": ("Photography and alt text from the current site, university "
                 "owned, for this redesign. Confirm rights before publishing. "
                 "Five slugs are renamed through ALIAS for readability."),
        "assets": sorted(unique.values(), key=lambda r: r["file"]),
    }, indent=2) + "\n")
    print(f"manifest {MANIFEST} ({len(unique)} asset(s))")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
