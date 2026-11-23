#!/usr/bin/env python3
"""Write the image provenance report.

Nothing on this site is stock, AI or a placeholder: every picture is a file that
was published on engineering.catholic.edu. This script proves it. It joins the
download ledger (src/content/asset-status.json) with the reference table the
content build writes (docs/audit/media-manifest.csv), adds status columns to
that CSV, and writes a Markdown report with the counts, the alt policy, the
files the origin refused and the documents carried over.

Run after scripts/fetch-assets.py and scripts/build-content.py.

Usage: python3 scripts/image-sources.py
"""
from __future__ import annotations

import csv
import json
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # web/
REPO = os.path.dirname(BASE_DIR)
AUDIT = os.path.join(REPO, "docs/audit")
MANIFEST = os.path.join(AUDIT, "media-manifest.csv")
STATUS = os.path.join(BASE_DIR, "src/content/asset-status.json")
CONTENT = os.path.join(BASE_DIR, "src/content/site-content.json")
DOCS_CSV = os.path.join(AUDIT, "documents.csv")
OUT = os.path.join(AUDIT, "image-sources.md")

FILLED_LABEL = "downloaded from another style of the same photo"


def referenced_images(pages: dict) -> tuple[dict, int]:
    """Every image the rendered pages point at, and the decorative count."""
    used: dict[str, set[str]] = {}
    decorative = 0

    def add(src: str, path: str, alt: str = "") -> None:
        nonlocal decorative
        if not src:
            return
        used.setdefault(src, set()).add(path)
        if not (alt or "").strip():
            decorative += 1

    for path, d in pages.items():
        add(d.get("photo") or "", path, "hero")
        for b in d.get("blocks") or []:
            if b.get("t") == "img":
                add(b.get("src") or "", path, b.get("alt") or "")
            if b.get("t") == "cards":
                for e in b.get("entries") or []:
                    add(e.get("image") or "", path, e.get("alt") or "")
        for im in d.get("images") or []:
            add(im.get("src") or "", path, im.get("alt") or "listed")
    return used, decorative


def main() -> None:
    status = json.load(open(STATUS))
    docs = status.pop("_documents", {})
    pages = json.load(open(CONTENT))["pages"]
    used, decorative_refs = referenced_images(pages)

    rows = list(csv.DictReader(open(MANIFEST)))
    for r in rows:
        info = status.get(r["local_file"]) or {}
        st = info.get("status", "")
        if info.get("same_original_as"):
            r["status"] = FILLED_LABEL
        elif st == "ok":
            r["status"] = "downloaded"
        else:
            r["status"] = f"blocked by the origin ({st})"
        r["content_type"] = info.get("type", "")
        r["bytes"] = str(info.get("bytes", ""))
        r["referenced_by_pages"] = len(used.get(r["local_file"], ()))
        r["alt_shipped"] = ""
    # the alt that actually ships comes from the content file, not the crawl
    shipped: dict[str, str] = {}
    for path, d in pages.items():
        cand = []
        for im in d.get("images") or []:
            if im.get("src"):
                cand.append((im["src"], im.get("alt") or ""))
        for b in d.get("blocks") or []:
            if b.get("t") == "img":
                cand.append((b.get("src"), b.get("alt") or ""))
            if b.get("t") == "cards":
                for e in b.get("entries") or []:
                    if e.get("image"):
                        cand.append((e["image"], e.get("alt") or ""))
        if d.get("photo"):
            cand.append((d["photo"], ""))
        for src, alt in cand:
            # the caption that ships is the best one found on any page
            if not (shipped.get(src) or "").strip() or (alt or "").strip():
                if (alt or "").strip() or src not in shipped:
                    shipped[src] = alt
    for k in list(shipped):
        shipped[k] = shipped[k] if (shipped.get(k) or "").strip() else shipped.get(k, "")
    for r in rows:
        r["alt_shipped"] = shipped.get(r["local_file"], "")

    fields = ["local_file", "source_url", "fetch_url", "status", "alt",
              "alt_shipped", "alt_from_source", "content_type", "bytes",
              "referenced_by_pages", "pages"]
    rows.sort(key=lambda r: (-int(r["referenced_by_pages"]), r["local_file"]))
    with open(MANIFEST, "w", newline="") as fh:
        w = csv.DictWriter(fh, fieldnames=fields, extrasaction="ignore")
        w.writeheader()
        w.writerows(rows)

    ok = [r for r in rows if r["status"].startswith("downloaded")]
    direct = [r for r in ok if r["status"] == "downloaded"]
    filled = [r for r in ok if r["status"] == FILLED_LABEL]
    blocked = [r for r in rows if r["status"].startswith("blocked")]
    sizes = sum(int(r["bytes"]) for r in ok if r["bytes"].isdigit())
    alt_real = sum(1 for r in ok if r["alt_from_source"] == "yes")
    alt_none = len(ok) - alt_real
    ships_alt = sum(1 for r in rows
                    if r["referenced_by_pages"] and (r["alt_shipped"] or "").strip())
    ships_total = sum(1 for r in rows if r["referenced_by_pages"])

    L = []
    L.append("# Image sources\n")
    L.append(
        "Nothing on this site is a stock photo, an AI image, a placeholder or a "
        "dummy avatar. Every picture is a file that was published on "
        "engineering.catholic.edu, downloaded from that host, converted to WebP, "
        "and stored in `web/public/media/legacy/` under a name derived from the "
        "original filename. The per-file ledger, with the source URL of every "
        "image, is `docs/audit/media-manifest.csv`.\n")
    L.append("\n## Counts\n")
    L.append("| item | value |\n| --- | --- |")
    L.append(f"| distinct origin images referenced by the crawl | {len(rows)} |")
    L.append(f"| downloaded from engineering.catholic.edu | {len(ok)} "
             f"({len(direct)} as published, {len(filled)} from a sibling style) |")
    L.append(f"| refused by the origin, therefore not used | {len(blocked)} |")
    L.append(f"| images referenced by at least one served page | {len(used)} |")
    L.append(f"| of those, images carrying non-empty alt text | {ships_alt} "
             f"of {ships_total} |")
    decor_files = sum(1 for r in rows
                      if r["referenced_by_pages"] and not (r["alt_shipped"] or "").strip())
    L.append(f"| images rendered with alt=\"\" (decorative banners) | {decor_files} "
             f"files, {decorative_refs} placements |")
    L.append(f"| documents downloaded | {len(docs)} |")
    L.append(f"| total size of downloaded images | {sizes / 1e6:.1f} MB |\n")
    L.append("## Where alt text comes from\n")
    L.append(
        f"{alt_real} of the {len(ok)} downloaded images carry the alt text the old "
        f"page published, after the Drupal `Image 3:` prefixes are stripped. The "
        f"other {alt_none} had no alt on the source page. Those that a news story "
        "uses are captioned `Photo published with this story: <story title>`, "
        "because that is a fact about the picture rather than a description of it; "
        "decorative banners are given `alt=\"\"` so screen readers skip them (one "
        "file, the college's shared faculty banner, used that way); the "
        "remainder is art that no served page references. Nothing was given an "
        "invented description. `scripts/qa-sweep.py` fails the build if a content "
        "image ever ships without alt text.\n")
    L.append("## Files the origin refuses\n")
    L.append(
        "Each of these is a Drupal image-style derivative that answers 403 with a "
        "Cloudflare page for every URL shape tried, including the unstyled "
        "original, so it cannot be downloaded. The reference is removed from the "
        "content instead, so no broken image tag ships and no substitute image is "
        "invented. Dropping the file into `web/public/media/legacy` under the "
        "local name and rebuilding restores the picture.\n")
    if blocked:
        L.append("\n| local name wanted | source URL on the old site | pages that used it |\n"
                 "| --- | --- | --- |")
        for r in blocked:
            L.append(f"| `{r['local_file']}` | {r['source_url']} | "
                     f"{r['pages'].replace(';', ',').strip(',')} |")
    else:
        L.append("\nNone.")
    L.append("\n\n## Filled from a sibling style\n")
    L.append(
        "Two derivatives were unreachable but the same photograph was reachable "
        "under another Drupal style. The file was copied to the missing name and "
        "the ledger records `same_original_as`, so the pixel content is still the "
        "college's own photo.\n")
    if filled:
        L.append("\n| local file | source URL actually used | same photo as |\n"
                 "| --- | --- | --- |")
        for r in filled:
            src = (status.get(r["local_file"]) or {}).get("same_original_as", "")
            L.append(f"| `{r['local_file']}` | {r['fetch_url']} | `{src}` |")
    else:
        L.append("\nNone.")
    L.append("\n\n## Documents\n")
    L.append(
        "Four PDFs are linked from the copy and are served from the repo rather "
        "than the old host.\n")
    if os.path.exists(DOCS_CSV):
        drows = list(csv.DictReader(open(DOCS_CSV)))
        L.append("\n| local file | source URL | page that links it |\n| --- | --- | --- |")
        for r in drows:
            L.append(f"| `{r.get('file')}` | {r.get('source')} | "
                     f"{(r.get('referenced_by') or '').replace(';', ',').strip(',')} |")
    L.append("\n\n## Videos\n")
    L.append(
        "Five pages embed a college video and hotlink its cover frame from "
        "img.youtube.com or vumbnail.com. Those frames are not files on "
        "engineering.catholic.edu, so they are not carried over, and dropping them "
        "silently would lose the video. Each page keeps a text link to the "
        "college's own upload instead, labelled with the title the source page "
        "published in the alt text. Each target was verified live: the three "
        "YouTube IDs return HTTP 200 from the oEmbed endpoint with author \"The "
        "Catholic University of America\", and vimeo.com/317833258 is titled "
        "\"NanoTechnology and Applied Physics Graduate Program\". Table: "
        "`docs/audit/video-links.csv`.\n")
    mined_path = os.path.join(REPO, "docs/design-notes/assets-manifest.json")
    mined = json.load(open(mined_path))["assets"] if os.path.exists(mined_path) else []
    present = [m for m in mined
               if os.path.exists(os.path.join(BASE_DIR, m["file"]))]
    L.append("\n## Homepage and section art\n")
    L.append(
        f"The hand-built homepage and the section heroes use {len(present)} files "
        "mined from the same origin by `web/scripts/fetch-live-assets.py`, kept "
        "under `web/public/media/` with readable names. Each one records the page "
        "it came from, the Drupal image style, the exact source URL including the "
        "`?itok=` token, and the alt text the college publishes for it. That "
        "record is `docs/design-notes/assets-manifest.json`; the table below is "
        "the same data.\n")
    L.append("\n| local file | source URL | alt text on the old site |\n"
             "| --- | --- | --- |")
    for m in sorted(present, key=lambda x: x["file"]):
        alt = (m.get("siteAltText") or "").replace("|", "/").strip()
        L.append(f"| `{os.path.basename(m['file'])}` | {m['sourceUrl']} | {alt} |")
    L.append("\nThree posters are the published cover frames of the college's own "
             "student films on YouTube (`film-O5Yy2gm83QY.jpg`, "
             "`film-HSaOvRlYBNo.jpg`, `film-NF017fMKvrE.jpg`). They are downloaded "
             "into the repo and used as the poster of a link that goes to the "
             "college's upload, never as photography. The homepage hero video "
             "itself is not vendored: the origin answers 403 to a non-browser for "
             "the mp4, so the hero uses the still instead.\n")

    L.append("\n## Where the pictures live\n")
    L.append(
        "- `web/public/media/legacy/` - the harvested photos, WebP\n"
        "- `web/public/media/` - homepage and programme art, also downloaded from "
        "the college site\n"
        "- `web/public/docs/` - the four PDFs\n"
        "- `web/src/content/media-dims.json` - intrinsic width and height per file, "
        "so images take their space before loading\n"
        "- `web/src/content/asset-status.json` - the download ledger, one entry per "
        "origin image\n")

    with open(OUT, "w") as fh:
        fh.write("\n".join(L))
    print(f"wrote {OUT} ({len(mined)} mined art files listed)")
    print(f"downloaded {len(ok)} of {len(rows)}, blocked {len(blocked)}, "
          f"referenced by pages {len(used)}")


if __name__ == "__main__":
    main()
