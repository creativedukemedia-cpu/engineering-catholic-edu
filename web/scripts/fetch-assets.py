#!/usr/bin/env python3
"""Download the assets that the harvested copy references.

Only files that exist on engineering.catholic.edu are fetched. No stock, no
generated, no placeholder imagery: if a page has no real image it gets none.

Images keep the original filename from the URL path, are resized to at most
1600 px on the long edge and written as WebP. Documents (pdf, docx, xlsx) are
copied through so the new site does not depend on the old host for its own
paperwork. Three details learned the hard way:

* A Drupal image-style URL only serves without a redirect when the `?itok=`
  token is present, so the fetch URL keeps the query string.
* The site caches those style derivatives on disk under the original filename,
  which is why some of them are JPEG bytes even though the URL ends in .webp.
  The file is decoded and re-encoded, so the extension always matches the bytes.
* The origin sometimes serves a truncated JPEG and sometimes an HTML error page
  under an image URL. Truncated files are decoded with what they have; HTML is
  rejected and the next URL shape is tried, down to the original upload behind
  the image style, which needs no token.

State lives in web/src/content/asset-status.json, so a rerun only touches what
is still failing.

Usage:
  python3 scripts/fetch-assets.py              # everything missing or failed
  python3 scripts/fetch-assets.py --retry-bad  # force a refetch of failures
  python3 scripts/fetch-assets.py --all        # ignore the cache completely
"""
from __future__ import annotations

import concurrent.futures as cf
import csv
import json
import os
import re
import sys
import hashlib
import urllib.parse
import subprocess

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # web/
REPO = os.path.dirname(BASE)
AUDIT = os.path.join(REPO, "docs/audit")
IMG_DIR = os.path.join(BASE, "public/media/legacy")
DOC_DIR = os.path.join(BASE, "public/docs")
RAW_DIR = "/home/ubuntu/_scrape/img"
STATUS = os.path.join(BASE, "src/content/asset-status.json")
INDEX = os.path.join(BASE, "src/content/asset-index.json")
MANIFEST = os.path.join(AUDIT, "media-manifest.csv")
UA = "curl/8.5.0"
MAX_EDGE = 1600
MAX_DOC_BYTES = 12 * 1024 * 1024

GOOD = ("ok", "svg")


def encode(url: str) -> str:
    """Percent-encode what a URL cannot carry literally.

    The reader proxy hands back decoded URLs, so a file published as
    "DSC 6208.JPG" arrives here with a space, and curl sends that as a broken
    request: the origin answers 403 with an HTML body. Sub-delimiters such as
    parentheses and commas are legal and stay.
    """
    p = urllib.parse.urlsplit(url)
    path = urllib.parse.quote(p.path, safe="/%~!$&'()*+,;=:@-._")
    query = urllib.parse.quote(p.query, safe="=&%;:+$,/?~!$'()*-._@")
    return urllib.parse.urlunsplit((p.scheme, p.netloc, path, query, p.fragment))


def get(url: str, dest: str, force: bool = False) -> tuple[int, int, str]:
    url = encode(url)
    if os.path.exists(dest) and os.path.getsize(dest) > 1000 and not force:
        return (200, os.path.getsize(dest), "cached")
    r = subprocess.run(
        ["curl", "-sL", "-m", "120", "-A", UA, "-o", dest,
         "-w", "%{http_code} %{size_download} %{content_type}", url],
        capture_output=True, text=True,
    )
    parts = (r.stdout or "0 0 ").split()
    try:
        return (int(parts[0]), int(float(parts[1])), parts[2] if len(parts) > 2 else "")
    except Exception:
        return (0, 0, str(r.stderr)[:80])


def is_html(path: str) -> bool:
    """True when the body is a page rather than a picture."""
    try:
        head = open(path, "rb").read(512)
    except OSError:
        return True
    if not head:
        return True
    stripped = head.lstrip()
    return stripped[:1] == b"<" or b"<!doctype" in head.lower() or b"<html" in head.lower()


def variants(*urls: str) -> list[str]:
    """Every URL that could deliver this file, best first.

    The style derivative with its token, the published source URL, and the
    original upload behind the style (which Drupal serves without a token).
    """
    out: list[str] = []
    for u in urls:
        if not u:
            continue
        out.append(u)
        m = re.match(
            r"^(?P<base>https://[^/]+/sites/[^/]+/files)/styles/[^/]+/(?P<rest>[^?]+)", u
        )
        if m:
            out.append(f"{m.group('base')}/{m.group('rest')}")
        plain = u.split("?")[0]
        if plain != u:
            out.append(plain)
    seen: set[str] = set()
    return [v for v in out if not (v in seen or seen.add(v))]


def to_webp(src: str, dst: str) -> tuple[bool, str, tuple[int, int]]:
    try:
        from PIL import Image, ImageFile
    except ImportError:
        return (False, "no Pillow", (0, 0))
    ImageFile.LOAD_TRUNCATED_IMAGES = True
    try:
        im = Image.open(src)
        im.load()
        size_claim = im.size
    except Exception as e:
        return (False, f"decode: {str(e)[:60]}", (0, 0))
    if max(im.size) > MAX_EDGE:
        scale = MAX_EDGE / max(im.size)
        im = im.resize(
            (max(1, round(im.width * scale)), max(1, round(im.height * scale))),
            Image.LANCZOS,
        )
    if im.mode == "CMYK":
        im = im.convert("RGB")
    size = im.size or size_claim
    try:
        im.save(dst, "WEBP", quality=82, method=4)
    except Exception as e:
        return (False, f"save: {str(e)[:60]}", size)
    return (True, f"{size[0]}x{size[1]}", size)


def raw_name(url: str) -> str:
    """A cache filename that keeps the original tail and cannot collide."""
    path = urllib.parse.unquote(urllib.parse.urlparse(url).path)
    tail = re.sub(r"[^A-Za-z0-9._-]", "-", os.path.basename(path))[:80] or "file"
    stem, ext = os.path.splitext(tail)
    tag = hashlib.sha1(path.encode()).hexdigest()[:8]
    return f"{stem}-{tag}{ext}"


def original_of(local: str) -> str:
    """The photograph a local file is a derivative of, as far as the name says.

    The old site hands the same picture to different pages in different Drupal
    image styles, and some of those styles are not published: they answer 403
    with a Cloudflare page, while a sibling style of the very same upload
    works. Matching on the original filename is what lets a failure fall back
    to the sibling that did come through. Same photograph, different size.
    """
    name = local.rsplit("/", 1)[-1]
    stem = os.path.splitext(name)[0]
    stem = re.sub(r"-[0-9a-f]{8}$", "", stem)          # the raw_name hash
    # A style derivative is published as "Photo.JPG.webp" by one style and as
    # "Photo.JPG?itok=" or "Photo?itok=" by another, so every image extension
    # in the middle or at the end has to go before the two can be compared.
    stem = re.sub(r"(\.(webp|jpe?g|png|gif|tif?f|svg))+$", "", stem, flags=re.I)
    stem = re.sub(r"\.(webp|jpe?g|png|gif|tif?f|svg)$", "", stem, flags=re.I)
    stem = re.sub(r"-\d+$", "", stem)                  # Drupal duplicate marker
    return stem.lower().replace("_", "").replace("-", "").replace(".", "")


def reuse_siblings() -> int:
    """Give a blocked style derivative the bytes of a working style of the same photo."""
    by_original: dict[str, list[str]] = {}
    for local, info in status.items():
        if local == "_documents" or info.get("status") not in GOOD:
            continue
        by_original.setdefault(original_of(local), []).append(local)
    reused = 0
    for local, info in list(status.items()):
        if local == "_documents" or info.get("status") in GOOD:
            continue
        candidates = [x for x in by_original.get(original_of(local), []) if x != local]
        candidates.sort(key=lambda x: -(status[x].get("bytes") or 0))
        if not candidates:
            continue
        donor = candidates[0]
        src = os.path.join(BASE, "public", donor.lstrip("/"))
        dst = os.path.join(BASE, "public", local.lstrip("/"))
        if not os.path.exists(src):
            continue
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        subprocess.run(["cp", src, dst], check=False)
        info["status"] = "ok"
        info["bytes"] = os.path.getsize(dst)
        info["source"] = status[donor].get("source", info.get("source", ""))
        info["same_original_as"] = donor
        if status[donor].get("dims"):
            info["dims"] = status[donor]["dims"]
        reused += 1
    return reused


def load_index() -> tuple[list[dict], list[dict]]:
    if os.path.exists(INDEX):
        data = json.load(open(INDEX))
        return data.get("images", []), data.get("documents", [])
    # Fall back to the table the previous run wrote.
    rows = []
    if os.path.exists(MANIFEST):
        for r in csv.DictReader(open(MANIFEST)):
            rows.append(
                {
                    "local": r["local_file"],
                    "source_url": r["source_url"],
                    "fetch_url": r.get("fetch_url") or r["source_url"],
                    "pages": (r.get("pages") or "").split(";"),
                    "alt": r.get("alt", ""),
                    "alt_from_source": r.get("alt_from_source", ""),
                }
            )
    return rows, []


def main() -> None:
    force_bad = "--retry-bad" in sys.argv
    redo_all = "--all" in sys.argv
    os.makedirs(IMG_DIR, exist_ok=True)
    os.makedirs(DOC_DIR, exist_ok=True)
    os.makedirs(RAW_DIR, exist_ok=True)

    images, documents = load_index()
    status: dict[str, dict] = {}
    if os.path.exists(STATUS):
        status = json.load(open(STATUS))
    if redo_all:
        status = {}
    globals()["status"] = status

    if "--seed" in sys.argv:
        # Adopt files that are already in public/ so a rerun does not
        # re-download a whole media library that has not changed.
        known = {}
        dims_path = os.path.join(BASE, "src/content/media-dims.json")
        if os.path.exists(dims_path):
            for k, v in json.load(open(dims_path)).items():
                known[k] = [v.get("w"), v.get("h")]
        for row in images:
            local = row["local"]
            path = os.path.join(BASE, "public", local.lstrip("/"))
            if not os.path.exists(path) or os.path.getsize(path) < 200:
                continue
            status[local] = {
                "source": row["source_url"],
                "status": "svg" if local.endswith(".svg") else "ok",
                "bytes": os.path.getsize(path),
                "dims": known.get(local) or ([0, 0] if local.endswith(".svg") else None),
            }
            if status[local]["dims"] is None:
                del status[local]["dims"]
        with open(STATUS, "w") as fh:
            json.dump(status, fh, indent=1, separators=(",", ":"))
        print(f"seeded {len(status)} of {len(images)} images from public/")
        sys.exit(0)

    todo = []
    for row in images:
        prev = status.get(row["local"])
        if prev and prev.get("status") in GOOD and not force_bad:
            # Trust the recorded result only while the file is still there.
            if os.path.exists(os.path.join(BASE, "public", row["local"].lstrip("/"))):
                continue
        todo.append(row)
    print(f"images: {len(images)} referenced, {len(todo)} to fetch")

    dims = {k: v["dims"] for k, v in status.items() if v.get("dims")}

    def work(row):
        local = row["local"]
        dst = os.path.join(BASE, "public", local.lstrip("/"))
        ext = os.path.splitext(urllib.parse.urlparse(row["source_url"]).path)[1].lower()
        tried = []
        for url in variants(row.get("fetch_url", ""), row["source_url"]):
            raw = os.path.join(RAW_DIR, raw_name(url))
            code, size, ctype = get(url, raw, force=True)
            if code != 200 or size < 200 or is_html(raw):
                tried.append(f"{code}/{size}")
                continue
            if ext == ".svg" or ctype.startswith("image/svg"):
                svg = dst[: -len(".webp")] + ".svg" if dst.endswith(".webp") else dst
                subprocess.run(["cp", raw, svg], check=False)
                status[local] = {"source": url, "status": "svg", "bytes": size}
                return local
            ok, note, wh = to_webp(raw, dst)
            if not ok:
                tried.append(note)
                continue
            status[local] = {
                "source": url,
                "status": "ok",
                "bytes": os.path.getsize(dst),
                "dims": [wh[0], wh[1]],
            }
            return local
        status[local] = {"source": row["source_url"], "status": f"fail {','.join(tried)}"}
        return local

    with cf.ThreadPoolExecutor(max_workers=6) as ex:
        for _ in ex.map(work, todo):
            pass

    reused = reuse_siblings()
    if reused:
        print(f"blocked image styles filled from a working style of the same photo: {reused}")
    for local, info in status.items():
        if info.get("dims"):
            dims[local] = info["dims"]
    with open(os.path.join(BASE, "src/content/media-dims.json"), "w") as fh:
        json.dump({k: {"w": v[0], "h": v[1]} for k, v in dims.items()}, fh,
                  separators=(",", ":"))
    print(f"media-dims.json written for {len(dims)} images")

    # documents referenced by the harvested copy
    doc_status = status.setdefault("_documents", {})
    for row in documents:
        local = row["local"]
        prev = doc_status.get(local)
        if prev and prev.get("status", "").startswith("ok") and os.path.exists(
            os.path.join(BASE, "public", local.lstrip("/"))
        ):
            continue
        final = os.path.join(BASE, "public", local.lstrip("/"))
        picked = None
        for url in variants(row["source_url"]):
            raw = os.path.join(DOC_DIR, raw_name(url))
            code, size, ctype = get(url, raw, force=True)
            if code == 200 and size > 100 and not is_html(raw):
                picked = (url, raw, size)
                break
            doc_status[local] = {"source": url, "status": f"fail {code}/{size}"}
        if not picked:
            continue
        url, raw, size = picked
        if size > MAX_DOC_BYTES:
            doc_status[local] = {"source": url, "status": f"too large {size}"}
            continue
        os.makedirs(os.path.dirname(final), exist_ok=True)
        subprocess.run(["cp", raw, final], check=False)
        doc_status[local] = {"source": url, "status": f"ok {size}"}

    alt_by_local = {r["local"]: (r.get("alt", ""), r.get("alt_from_source", ""))
                    for r in images}
    with open(MANIFEST, "w", newline="") as fh:
        w = csv.writer(fh)
        w.writerow(["source_url", "fetch_url", "local_file", "alt", "alt_from_source",
                    "status", "bytes", "dimensions", "pages"])
        for row in images:
            info = status.get(row["local"], {"status": "not attempted"})
            alt, alt_from = alt_by_local.get(row["local"], ("", ""))
            d = info.get("dims")
            w.writerow([
                row["source_url"], row.get("fetch_url", ""), row["local"], alt, alt_from,
                info.get("status"), info.get("bytes", 0),
                f"{d[0]}x{d[1]}" if d else "", ";".join(row.get("pages") or []),
            ])
    with open(os.path.join(AUDIT, "documents.csv"), "w", newline="") as fh:
        w = csv.writer(fh)
        w.writerow(["file", "source", "status", "referenced_by"])
        for row in documents:
            info = doc_status.get(row["local"], {"status": "not attempted"})
            w.writerow([row["local"], info.get("source", row["source_url"]),
                        info.get("status"), ";".join(row.get("pages") or [])])

    with open(STATUS, "w") as fh:
        json.dump(status, fh, indent=1, separators=(",", ":"))

    good = sum(1 for r in images if status.get(r["local"], {}).get("status") in GOOD)
    print(f"images ok {good}/{len(images)}")
    dgood = sum(1 for r in documents if doc_status.get(r["local"], {}).get("status", "").startswith("ok"))
    print(f"documents ok {dgood}/{len(documents)}")
    bad = [(r["local"], status.get(r["local"], {})) for r in images
           if status.get(r["local"], {}).get("status") not in GOOD]
    for k, v in bad[:25]:
        print("  BAD", k, v)


if __name__ == "__main__":
    main()
