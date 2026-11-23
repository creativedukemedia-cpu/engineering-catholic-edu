#!/usr/bin/env python3
"""Turn the crawled markdown of engineering.catholic.edu into page data.

Input  : /home/ubuntu/_scrape/pages/*.md   (main-content markdown, reader proxy)
Output : web/src/content/site-content.json  every page as typed blocks
         web/public/media/legacy/*          downloaded images, WebP
         web/public/docs/*                  downloaded documents
         docs/audit/page-inventory.csv      old URL, title, type, words, images, status
         docs/audit/documents.csv           every linked document with its source page
         docs/audit/media-manifest.csv      image source URL, local file, alt, pages

Nothing here invents content. Blocks are what the live page says, in the order
it says it. The only editorial changes are mechanical and auditable:
  - em dashes become commas (project rule: no em dashes in copy)
  - a missing space before a link or parenthesis is inserted
  - straight apostrophes between letters become typographic ones
  - theme decoration (divider-line.svg, icon glyphs) is dropped
  - the CMS request-info form field dump is dropped; this build renders its own form

Usage: python3 scripts/build-content.py [--limit N]
"""
from __future__ import annotations

import concurrent.futures as cf
import csv
import hashlib
import html
import io
import json
import os
import re
import sys
import urllib.parse
import urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import urlmap  # noqa: E402  shared legacy URL resolver, scripts/urlmap.py

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # web/
REPO = os.path.dirname(BASE)
SRC_DIR = "/home/ubuntu/_scrape/pages"
LIVE_URLS = os.path.join(REPO, "docs/redirects/live-urls.txt")
OUT_JSON = os.path.join(BASE, "src/content/site-content.json")
NEWS_JSON = os.path.join(BASE, "src/content/news-meta.json")
IMG_DIR = os.path.join(BASE, "public/media/legacy")
DOC_DIR = os.path.join(BASE, "public/docs")
AUDIT_DIR = os.path.join(REPO, "docs/audit")
ORIGIN = "https://engineering.catholic.edu"

# Paths this build already serves as hand-authored pages (they win over content).
BUILT_ROUTES = set()


# Whether the file an image block points at actually exists in public/.
# scripts/fetch-assets.py records what it could and could not bring off the old
# site; a style derivative that the origin refuses must not become a broken
# image tag, so the reference is dropped from the copy and reported.
ASSET_STATUS_PATH = os.path.join(BASE, "src/content/asset-status.json")
ASSETS: dict[str, dict] = {}


def load_asset_status() -> dict:
    if not os.path.exists(ASSET_STATUS_PATH):
        return {}
    data = json.load(open(ASSET_STATUS_PATH))
    data.pop("_documents", None)
    return {k: v for k, v in data.items()}


def asset_ok(local: str) -> bool:
    """True when nothing has been checked yet, or when the file is there."""
    if not ASSETS:
        return True
    info = ASSETS.get(local)
    if info is None:
        return os.path.exists(os.path.join(BASE, "public", local.lstrip("/")))
    return info.get("status") in ("ok", "svg")


def apply_asset_gate(pages: dict) -> int:
    """Remove references to images that could not be brought over."""
    dropped = 0
    for path, d in pages.items():
        gone: list[str] = []
        kept = []
        for b in d.get("blocks") or []:
            if b.get("t") == "img" and not asset_ok(b.get("src") or ""):
                gone.append(b.get("src") or "")
                continue
            kept.append(b)
        if gone:
            d["blocks"] = kept
            d["images"] = [im for im in d.get("images") or []
                           if asset_ok(im.get("src") or "")]
            if d.get("photo") and not asset_ok(d["photo"]):
                d["photo"] = None
            d["dropped_images"] = gone
            dropped += len(gone)
        for card in d.get("blocks") or []:
            if card.get("t") == "cards":
                card["entries"] = [
                    e for e in card.get("entries") or []
                    if not e.get("image") or asset_ok(e["image"])
                ]
    return dropped


def slug(path: str) -> str:
    return (path.strip("/").replace("/", "__") or "home")


# ---------------------------------------------------------------- classification

def classify(path: str) -> str:
    p = path.rstrip("/") or "/"
    if re.match(r"^/programs-admission/undergraduate-programs/minors/", p):
        return "minor"
    if p.startswith("/programs-admission/undergraduate-programs/"):
        return "program-undergraduate"
    if p.startswith("/programs-admission/graduate-programs/"):
        return "program-graduate"
    if p.startswith("/programs-admission/certificate-programs/"):
        return "program-certificate"
    if p.startswith("/programs-admission/"):
        return "admission"
    if p.startswith("/explore-our-college/departments/"):
        return "department"
    if p.startswith("/explore-our-college/centers-institutes-research/"):
        return "center"
    if p.startswith("/explore-our-college/mission-vision/"):
        return "mission"
    if p.startswith("/explore-our-college/"):
        return "explore"
    if p.startswith("/connect-contact/faculty-directory/"):
        return "faculty"
    if p.startswith("/connect-contact/news-events/all-stories/"):
        return "story"
    if p.startswith("/connect-contact/news-events/"):
        return "news"
    if p.startswith("/connect-contact/"):
        return "connect"
    if p.startswith("/current-students/"):
        return "student"
    if p.startswith("/faculty-staff/"):
        return "student"
    if p == "/about" or p.startswith("/about/"):
        return "about"
    if p == "/search":
        return "search"
    return "page"


# ---------------------------------------------------------------- inline runs

LINK_RE = re.compile(r"\[!?\[?([^\]]*)\]\(([^)]+)\)\]|\[([^\]]+)\]\(([^)]+)\)")
FOOTNOTE_RE = re.compile(r"\[\[([^\]]+)\]\]\(([^)]+)\)")
IMG_RE = re.compile(r"!\[([^\]]*)\]\(([^)\s]+)(?:\s+\"[^\"]*\")?\)")
BOLD_RE = re.compile(r"\*\*([^*]+)\*\*")
ITAL_RE = re.compile(r"(?<!\*)\*([^*\n]+)\*(?!\*)|(?<!\w)_([^_\n]+)_(?!\w)")


ICON_GLYPH = re.compile(r"^_([a-z][a-z _-]{2,24})_$")



MARKER_RE = re.compile(r"\*\*([^*]+)\*\*|\*([^*\n]+)\*|__([^_]+)__")


def strip_markers(s: str) -> str:
    """Drop markdown emphasis marks, keeping the words.

    A heading is already bold and a link label is already a link, so the marks
    are noise there. Inside a paragraph the splitter turns them into real
    emphasis; this is for the places that keep plain text.
    """
    prev = None
    while prev != s:
        prev = s
        s = MARKER_RE.sub(lambda m: next(g for g in m.groups() if g), s)
    return s


def clean_text(s: str) -> str:
    """Mechanical copy normalisation. Never changes words.

    Runs only on text that has already had links and images tokenised out,
    so bracket syntax is never in scope here.
    """
    s = html.unescape(s)
    s = s.replace("\u00a0", " ")
    # Emphasis markers are consumed by the inline splitter. Anything still
    # doubled here is markup the source page left behind, not copy.
    s = re.sub(r"\*{2,}", "", s)
    # Em dashes are banned in this copy set. A dash that closes a sentence or a
    # dateline becomes a full stop; a dash inside a sentence becomes a comma.
    s = re.sub(r"([.!?])\s*\u2014\s*", r"\1 ", s)
    s = re.sub(r"\s*\u2014\s*", ", ", s)
    s = s.replace("\u2014", ", ")
    # En dashes mark compounds and ranges, not clauses: plain hyphen keeps the sense
    s = re.sub(r"\s*\u2013\s*", "-", s).replace("\u2013", "-")
    s = s.replace(",,", ",")
    s = re.sub(r"\s+([,;.!?])", r"\1", s)
    # A comma between digits is a thousands separator, not a missing space.
    s = re.sub(r"(?<![\d$])([,;])(?=[0-9A-Za-z])", r"\1 ", s)
    s = re.sub(r"([,;])(?=[A-Za-z])", r"\1 ", s)
    s = re.sub(r"([,;])\s+([,;])", r"\1", s)
    # a parenthetical needs a space in front of it when it starts a word
    s = re.sub(r"([A-Za-z0-9\)\.!?])\((?=[A-Za-z])", r"\1 (", s)
    s = re.sub(r"(?<=[A-Za-z])'(?=[A-Za-z])", "\u2019", s)
    s = re.sub(r"\s{2,}", " ", s)
    s = re.sub(r"\s+$", "", s)
    return s.strip()


def spacefix(runs: list[dict]) -> list[dict]:
    """The live markdown sometimes glues a word to a link, e.g. are[ABET](...).

    Insert the space the rendered page shows, without touching any word.
    """
    out: list[dict] = []
    for r in runs:
        prev = out[-1] if out else None
        if prev is not None and r.get("x") and prev.get("x"):
            a = prev["x"][-1]
            b = r["x"][0]
            # The source markdown glues a word to emphasis or a link whenever it
            # loses the space: secured**$44,000**, Curriculum:**The program. The
            # live page shows that space, so the data keeps it. A closing
            # bracket or a quote is not the start of a word and stays glued.
            if (a.isalnum() or a in ":)") and (b.isalnum() or b == "$"):
                prev["x"] += " "
        out.append(r)
    # A run that is nothing but a divider is the markdown trace of a row of
    # buttons. The rendered page shows space around it, so the data keeps it.
    for r in out:
        if (r.get("x") or "").strip() in {"|", "\u2022", "\u00b7"}:
            r["x"] = f" {(r['x'] or '').strip()} "
    return out


def inline_runs(text: str) -> list[dict]:
    """Split a line into runs of text, links and emphasis. Order preserved."""
    runs: list[dict] = []

    def emit_str(s: str, bold=False, ital=False):
        s = clean_text(s)
        # The reader also loses the space inside one run: a label that ends in a
        # colon against the next word, and an amount against the word before it.
        # Only a capital after the colon and a lowercase letter before the sign
        # count, so "US$44" and a ratio like 3:1 are left alone.
        s = re.sub(r"(?<=[a-z0-9)]):(?=[A-Z][a-z])", ": ", s)
        s = re.sub(r"(?<=[a-z])[$](?=[0-9.])", " $", s)
        s = re.sub(r"\s+", " ", s)
        if not s.strip():
            return
        if bold or ital:
            runs.append({"t": "s", "x": s.strip(), "b": bold or None, "i": ital or None})
        else:
            runs.append({"t": "x", "x": s.strip()})

    def strip_emph(s: str) -> None:
        # one level of bold, then italics; nested emphasis does not occur here
        pos = 0
        for m in BOLD_RE.finditer(s):
            if m.start() > pos:
                strip_ital(s[pos : m.start()])
            emit_str(m.group(1), bold=True)
            pos = m.end()
        if pos < len(s):
            strip_ital(s[pos:])

    def strip_ital(s: str) -> None:
        pos = 0
        for m in ITAL_RE.finditer(s):
            frag = next(g for g in m.groups() if g)
            if m.start() > pos:
                emit_str(s[pos : m.start()])
            emit_str(frag, ital=True)
            pos = m.end()
        if pos < len(s):
            emit_str(s[pos:])

    pos = 0
    # footnote markers write as [[i]](url); keep the visible brackets but make
    # the label safe for the link regex, then restore them on the label
    text = FOOTNOTE_RE.sub(
        lambda m: f"[\u27e6{m.group(1)}\u27e7]({m.group(2)})", text
    )
    # An icon link has no words at all: [](https://…). Give it the address as
    # its label, which is what the reader can see and click.
    text = re.sub(r"\[\]\(([^)\s]+)\)", r"[\1](\1)", text)
    pos = 0
    for m in LINK_RE.finditer(text):
        label, href = m.group(3), m.group(4)
        if label is None:
            label, href = m.group(1), m.group(2)
        # markdown link titles, [text](url "Title"), are metadata not copy
        href = href.strip()
        if " " in href:
            href = href.split(" ")[0]
        if m.start() > pos:
            strip_emph(text[pos : m.start()])
        label = re.sub(
            r"^Image \d+:\s*", "", clean_text(strip_markers(label))
        ).replace("\u27e6", "[").replace("\u27e7", "]")
        hp = urllib.parse.urlparse(href.strip().strip("<>").strip())
        external = bool(hp.netloc) and "engineering.catholic.edu" not in hp.netloc
        target = rewrite_href(href)
        if target is None:
            # a dead link on the source site: keep the words, drop the anchor.
            # The match still has to be consumed, or the text after it is
            # emitted a second time from the old position.
            emit_label = label or ""
            if emit_label:
                runs.append({"t": "x", "x": emit_label})
            pos = m.end()
            continue
        runs.append(
            {
                "t": "a",
                "x": label or None,
                "href": target,
                "ext": external,
            }
        )
        pos = m.end()
    if pos < len(text):
        strip_emph(text[pos:])
    return spacefix(runs)



# ---------------------------------------------------------------- href rewriting

IMG_CACHE: dict[str, str] = {}
IMG_LOCK = {}
DOCS: dict[str, dict] = {}
IMG_USES: dict[str, set] = {}
IMG_FETCH: dict[str, str] = {}
CURRENT_PAGE: dict[str, "str | None"] = {"v": None}
FLAGGED: dict[str, set] = {}
DUPLICATE_MAP: dict[str, str] = {}


def local_asset(url: str, kind: str, page: str, label: str = "") -> str | None:
    """Map an origin asset URL to a local path, registering the download."""
    parsed = urllib.parse.urlparse(url)
    if parsed.netloc and parsed.netloc.replace("www.", "") not in (
        "engineering.catholic.edu",
    ):
        return None
    path = urllib.parse.unquote(parsed.path)
    if "/themes/" in path:  # theme decoration: dividers, icons, logo svgs
        return None
    tail = os.path.basename(path)
    style = re.search(r"/files/styles/([^/]+)/", path)
    date = re.search(r"/public/(\d{4}-\d{2})/", path)
    stem, ext = os.path.splitext(tail)
    ext = ext.lower()
    key = path
    if kind == "img":
        if key in IMG_CACHE:
            local = IMG_CACHE[key]
        else:
            base = re.sub(r"[^A-Za-z0-9._-]", "-", stem)[:60] or "image"
            # raster images are converted to WebP by scripts/fetch-assets.py
            suffix = ext if ext in (".svg", ".gif") else ".webp"
            cand = f"{base}{suffix}"
            n = 1
            while cand in IMG_LOCK.values():
                cand = f"{base}-{n}{suffix}"
                n += 1
            local = f"/media/legacy/{cand}"
            IMG_CACHE[key] = local
            IMG_LOCK[key] = cand
        IMG_USES.setdefault(key, set()).add(page)
        # Fetch exactly what the page publishes: the image style needs its
        # ?itok= token, and a filename with spaces only resolves when the
        # spaces stay percent-encoded.
        IMG_FETCH[key] = url if url.startswith("http") else ORIGIN + url
        return local
    # documents
    doc_key = path
    if doc_key in DOCS:
        cand = DOCS[doc_key]["file"]
    else:
        # A truncated name that loses .pdf is a file the browser cannot open,
        # so the extension is kept whole and the stem is what gets shortened.
        d_stem, d_ext = os.path.splitext(tail)
        d_stem = re.sub(r"[^A-Za-z0-9_-]", "-", d_stem)[:72].strip("-") or "document"
        d_ext = d_ext.lower()[:6]
        base = f"{d_stem}{d_ext}"
        n = 1
        cand = base
        taken = {d["file"] for d in DOCS.values()}
        while cand in taken:
            stem2, ext2 = os.path.splitext(base)
            cand = f"{stem2}-{n}{ext2}"
            n += 1
        DOCS[doc_key] = {
            "source": url if url.startswith("http") else ORIGIN + parsed.path,
            "file": cand,
            "label": label or os.path.basename(path),
            "pages": set(),
            "style": style.group(1) if style else "",
            "date": date.group(1) if date else "",
        }
    DOCS[doc_key]["pages"].add(page)
    return "/docs/" + cand


def rewrite_href(href: str, page: str | None = None) -> str:
    h = href.strip().strip("<>").strip()
    if not h or h.startswith("mailto:") or h.startswith("tel:"):
        return h
    if h.startswith("#"):
        return h
    parsed = urllib.parse.urlparse(h)
    if parsed.scheme and parsed.netloc and "engineering.catholic.edu" not in parsed.netloc:
        return h  # genuine external link (catholic.edu, abet.org, nasa.gov ...)
    if page is None:
        page = CURRENT_PAGE["v"]
    path = parsed.path or "/"
    path = re.sub(r"/$", "" if path != "/" else "", path) or "/"
    if path == "/homepage":
        path = "/"
    frag = f"#{parsed.fragment}" if parsed.fragment else ""
    if parsed.netloc == "engineering-stg.catholic.edu":
        # a real production defect: some documents are still linked from the
        # staging host. Keep the file, take it from where it can be fetched,
        # and record it in the report instead of silently dropping the link.
        FLAGGED.setdefault("staging_host_links", set()).add(h)
        h = h.replace("engineering-stg.catholic.edu", "engineering.catholic.edu")
        parsed = urllib.parse.urlparse(h)
        path = parsed.path
    if parsed.netloc and page is not None and (
        path.endswith((".pdf", ".docx", ".xlsx", ".pptx", ".doc", ".xls", ".csv", ".zip"))
    ):
        loc = local_asset(h, "doc", page, label="")
        if loc:
            return loc
    if page is not None and path.startswith("/sites/"):
        loc = local_asset(ORIGIN + path, "img", page)
        if loc:
            return loc
    DOC_EXT = (".pdf", ".docx", ".xlsx", ".pptx", ".doc", ".xls", ".csv", ".zip", ".ppt")
    if page is not None and path.endswith(DOC_EXT):
        # a relative document link with no host still points at the old site
        loc = local_asset(ORIGIN + path, "doc", page, label="")
        if loc:
            return loc
    if page is not None:
        served = globals().get("SERVED_PAGES") or set()
        target, how = urlmap.resolve(path, served) if served else (path, "as written")
        if target:
            query = f"?{parsed.query}" if parsed.query else ""
            return target + query + frag
        if frag:
            # an anchor on a page that is not in this build: keep the address
            # of the page it came from rather than a link that goes nowhere
            FLAGGED.setdefault("links_not_in_build", set()).add(path + frag)
            return ORIGIN + path + frag
        # Nothing in this build is that page. The old site itself returns 404
        # for it, so the words stay and the link goes; see the report.
        FLAGGED.setdefault("dead_source_links", set()).add(path)
        return None
    return path


def canonical_path(path: str) -> str:
    """Duplicate production paths point at the one canonical page."""
    p = path.rstrip("/") or "/"
    if p.endswith("/index.html"):
        p = p[: -len("/index.html")] or "/"
    return DUPLICATE_MAP.get(p, p)


def rewrite_href_str(href: str, page: str | None = None) -> str:
    """rewrite_href, but never empty.

    Breadcrumbs, cards and section nav cannot render a missing link, so an
    unresolvable target there keeps its production address and is flagged,
    while prose links become plain text.
    """
    out = rewrite_href(href, page)
    if out is not None:
        return out
    parsed = urllib.parse.urlparse(href.strip().strip("<>").strip())
    FLAGGED.setdefault("links_not_in_build", set()).add(parsed.path)
    return ORIGIN + parsed.path


def heading_id(text: str, index: int) -> str:
    """Mirror slugId() in src/components/content/Blocks.tsx.

    The renderer gives every h2 that same id, so this is the only set of
    in-page anchors the new site can actually land on.
    """
    base = re.sub(r"[^a-z0-9]+", "-", re.sub(r"&", "and", (text or "").lower()))
    base = base.strip("-")[:48]
    return base or f"section-{index}"


def prune_dead_anchors(blocks: list[dict], page_path: str) -> list[str]:
    """Turn links that point at nothing into the plain words they already show.

    The old pages carry footnote references and section links to anchors the
    old template gave ids we cannot reproduce, and to the page itself. Those
    clicks do nothing on the new site, so the words stay and the link goes.
    Nothing else in the copy is touched, and every pruned address is reported.
    """
    ids = {
        heading_id(b["x"], i)
        for i, b in enumerate(blocks)
        if b["t"] == "h2" and b.get("x")
    }
    here = page_path.rstrip("/") or "/"
    dead: list[str] = []

    def fix(runs: list[dict]) -> list[dict]:
        out: list[dict] = []
        for r in runs:
            if r.get("t") != "a":
                out.append(r)
                continue
            href = r.get("href") or ""
            target, _, frag = href.partition("#")
            target = target.rstrip("/") or "/"
            if target != here and target != ORIGIN + here:
                out.append(r)
                continue
            if frag and f"#{frag}" in {f"#{x}" for x in ids}:
                out.append(r)
                continue
            dead.append(href)
            label = r.get("x")
            if label:
                out.append({"t": "x", "x": label})
        return out

    for b in blocks:
        if b.get("runs"):
            b["runs"] = fix(b["runs"])
        for it in b.get("items") or []:
            if isinstance(it, list):
                it[:] = fix(it)
    return dead



CARD_LINE = re.compile(r"^[*+-]\s+(?:\[!\[|!\[)")


def collapse_card_groups(text: str) -> str:
    """Re-join card grids that the exporter separated with blank lines.

    The faculty directory and the news listings put every field on its own line
    with a blank line between them, which markdown reads as 67 one-item lists.
    Swallowing those blanks inside a card group puts each person or story back
    into one item, so it can be recognised as a card and then filtered, sorted
    and paginated by the redesign. Only the first eight lines after a card line
    are pulled in, so ordinary prose after a bullet stays prose.
    """
    out: list[str] = []
    open_group = False
    pulled = 0
    for raw in text.split("\n"):
        s = raw.strip()
        if CARD_LINE.match(s):
            if open_group:
                out.append("")
            open_group = True
            pulled = 0
            out.append(raw)
            continue
        if open_group:
            if not s:
                continue
            if pulled >= 8:
                open_group = False
                out.append("")
                out.append(raw)
                continue
            out.append(raw)
            pulled += 1
            continue
        out.append(raw)
    return "\n".join(out)


# ---------------------------------------------------------------- block parsing

DIVIDER = re.compile(r"!\[[^\]]*\]\([^)]*(?:divider-line|/themes/)[^)]*\)")
FORM_CUT = re.compile(r"^\*Required for submission|^\s*Loading\.\.\.", re.I)
GUID = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$")
FOOTER_START = re.compile(r"^\[College of Engineering, Physics, and Computing\]\(.*\)\s*Pangborn Hall")

IMG_MD = re.compile(r"!\[[^\]]*\]\((https?://[^)\s]+)(?:\s+\"[^\"]*\")?\)")
HEAD3_MD = re.compile(r"###\s*\[([^\]]+)\]\((https?://[^)\s]+)(?:\s+\"[^\"]*\")?\)")
IMGLINK_MD = re.compile(
    r"\[!\[[^\]]*\]\((https?://[^)\s]+)(?:\s+\"[^\"]*\")?\)\]\((https?://[^)\s]+)(?:\s+\"[^\"]*\")?\)"
)
DATE_MD = re.compile(r"(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},\s+\d{4}")

# The CMS exported a few images with no real description at all.
GENERIC_ALT = re.compile(
    r"^(image( ?\d+)?:?|photo|picture|graphic|img ?\d*|headshot|alt|unnamed|\d+|)$", re.I
)

# Site-wide decoration the theme drops onto pages, never a picture of the
# subject: college heroes, section banners, default faculty backdrops.
BANNER = re.compile(r"hero|banner|placeholder|default|G-Eng-Phys-Comp", re.I)


def is_generic_alt(alt: str) -> bool:
    return bool(GENERIC_ALT.match((alt or "").strip()))


def card_from_item(raw: str) -> dict | None:
    """Recognise the two card grids the live site uses.

    News listings render as image + h3 title link + date. Faculty directories
    render as a headshot linked to the profile, followed by the name, the rank
    and the department. Both are structured data, not prose, so they become
    card blocks that the redesign can filter and paginate.
    """
    text = raw.strip()
    img = IMG_MD.search(text)
    head = HEAD3_MD.search(text)
    if img and head:
        rest = text[head.end():].strip()
        date = DATE_MD.search(rest)
        return {
            "kind": "story",
            "image": local_asset(img.group(1), "img", CURRENT_PAGE["v"] or ""),
            "image_source": img.group(1),
            "title": clean_text(head.group(1)),
            "href": rewrite_href_str(head.group(2)),
            "date": clean_text(date.group(0)) if date else None,
        }
    link = IMGLINK_MD.search(text)
    if link:
        rest = text[link.end():].strip()
        name = re.search(r"##\s+(.+)", rest)
        lines = [clean_text(x) for x in rest.split("\n") if x.strip()]
        dept = None
        if "Department" in lines:
            dept = lines[lines.index("Department") + 1] if len(lines) > lines.index("Department") + 1 else None
        return {
            "kind": "person",
            "image": local_asset(link.group(1), "img", CURRENT_PAGE["v"] or ""),
            "image_source": link.group(1),
            "href": rewrite_href_str(link.group(2)),
            "title": clean_text(name.group(1)) if name else None,
            "role": lines[1] if name and len(lines) > 1 else (lines[0] if lines else None),
            "department": dept,
        }
    return None


def parse_md(raw: str, page_path: str) -> dict:
    global DUPLICATE_MAP
    CURRENT_PAGE["v"] = page_path
    lines = raw.split("\n")
    meta = {"title": None, "url": None, "published": None}
    iso_published = None
    body_start = 0
    for i, ln in enumerate(lines[:12]):
        if ln.startswith("Title:"):
            meta["title"] = ln[6:].strip()
        elif ln.startswith("URL Source:"):
            meta["url"] = ln[11:].strip()
        elif ln.startswith("Published Time:"):
            val = ln[15:].strip()
            # News nodes expose a real ISO publish date. Other pages expose the
            # moment the crawler asked, which is not content, so it is dropped.
            if re.match(r"^\d{4}-\d{2}-\d{2}T", val):
                meta["published"] = val
        elif ln.strip() == "Markdown Content:":
            body_start = i + 1
            break
    body = lines[body_start:]

    # strip footer chrome if the whole-page variant was used
    for i, ln in enumerate(body):
        if FOOTER_START.match(ln.strip()):
            body = body[:i]
            break
    body_text = "\n".join(body)
    body_text = DIVIDER.sub("", body_text)

    # strip in-page section nav ("Program Content" + its anchor line)
    body_text = re.sub(
        r"^Program Content\s*\n+\[[^\]]+\]\([^)]*#program[^\n]*\n", "", body_text, flags=re.M
    )

    out_lines: list[str] = []
    for ln in body_text.split("\n"):
        s = ln.strip()
        if GUID.match(s) or FORM_CUT.match(s):
            continue
        if re.match(r"^(Anticipated|Primary Citizenship|Academic Level|Lead Source|First Source|Interaction)", s):
            continue
        # Drupal writes the current page into the breadcrumb as a sentence.
        if "The Current Page is" in s:
            continue
        out_lines.append(ln)
    body_text = "\n".join(out_lines)
    # cut a trailing request-information form section
    m = re.search(r"^#{1,3}\s*(Request Information|Request Info)\s*$", body_text, flags=re.M)
    if m:
        body_text = body_text[: m.start()]

    breadcrumb: list[dict] = []
    # Drupal breadcrumb renders as an ordered list starting with Home
    bc_re = re.compile(r"^1\.\s+\[[^\]]*\]\([^)]*\)((?:\n\s*\d+\.\s+.*)*)", re.M)
    bm = bc_re.search(body_text)
    if bm and "[Home]" in bm.group(0):
        for part in re.findall(r"\[([^\]]+)\]\(([^)]+)\)", bm.group(0)):
            breadcrumb.append({"title": clean_text(part[0]),
                               "href": rewrite_href_str(part[1], page_path)})
        body_text = (body_text[: bm.start()] + body_text[bm.end():]).lstrip("\n")

    title = clean_text(meta["title"]) if meta["title"] else None
    h1 = re.search(r"^#\s+(.+)$", body_text, flags=re.M)
    if h1:
        title = clean_text(h1.group(1))
        body_text = (body_text[: h1.start()] + body_text[h1.end():]).lstrip("\n")
    if title:
        title = re.sub(r"\s*\|\s*College of Engineering.*$", "", title).strip()

    blocks, images, words = parse_blocks(body_text, page_path)
    ptype = classify(page_path)
    alt_issues: list[str] = []
    role = None
    department = None
    photo = None

    # A profile page starts with a one-item list pointing back at the directory
    # it came from. That is a breadcrumb, not content.
    if not breadcrumb and ptype in ("faculty", "student"):
        m2 = re.match(r"^1\.\s+\[([^\]]+)\]\(([^)]+)\)[ \t]*\n?", body_text)
        if m2:
            href = rewrite_href_str(m2.group(2), page_path).split("#")[0]
            parent = page_path.rsplit("/", 1)[0].rstrip("/")
            if href.rstrip("/") == parent:
                breadcrumb = [
                    {"title": "Home", "href": "/"},
                    {"title": clean_text(m2.group(1)), "href": href},
                ]
                body_text = body_text[m2.end():].lstrip("\n")
                blocks, images, words = parse_blocks(body_text, page_path)

    if ptype in ("faculty", "student"):
        # These pages put the rank in the first h2 and the unit under a
        # "Department" subheading. Lifting them is mechanical: the profile
        # template and the directory filter need them as fields.
        for b in blocks:
            if b["t"] == "h2":
                role = b["x"]
                break
        for i, b in enumerate(blocks):
            if b["t"] == "h3" and b["x"].strip().rstrip(":").lower() == "department":
                for c in blocks[i + 1 : i + 4]:
                    if c["t"] == "p":
                        department = "".join(
                            r.get("x", "") for r in c["runs"] if r["t"] in ("x", "s")
                        ).strip()
                        break
                break

    for im in images:
        if is_generic_alt(im.get("alt", "")):
            alt_issues.append(im["source"])
            named = (
                title
                if ptype in ("faculty", "student")
                and title
                and not BANNER.search(im["src"])
                else ""
            )
            im["alt"] = named
    alt_by_src = {im["src"]: im.get("alt", "") for im in images}
    for b in blocks:
        if b["t"] == "img" and b["src"] in alt_by_src:
            b["alt"] = alt_by_src[b["src"]]
    # A photograph that carries no description at the source still has to say
    # something to a screen reader. What it objectively is: the picture that was
    # published with this page. Site banners are decoration and stay empty.
    if ptype in ("story", "news") and title:
        for b in blocks:
            if b["t"] == "img" and not (b.get("alt") or "").strip():
                if not BANNER.search(b["src"].rsplit("/", 1)[-1]):
                    b["alt"] = f"Photo published with this story: {title}"
                    for im in images:
                        if im["src"] == b["src"]:
                            im["alt"] = b["alt"]
    dead_links = prune_dead_anchors(blocks, page_path)
    if images:
        tokens = [t for t in re.findall(r"[a-z]+", (title or "").lower()) if len(t) > 3]
        profile = ptype in ("faculty", "student")
        picks = images
        if profile:
            # A profile photo must be a picture of the person. The college hangs
            # a shared faculty banner on profiles with no headshot, and a banner
            # is not a portrait, so those profiles end up with no photo.
            picks = [
                im
                for im in images
                if not BANNER.search(im["src"].rsplit("/", 1)[-1])
                or any(t in im["src"].rsplit("/", 1)[-1].lower() for t in tokens)
            ]

        def score(im: dict) -> int:
            stem = im["src"].rsplit("/", 1)[-1].lower()
            alt = (im.get("alt") or "").lower()
            s = 0
            if "headshot" in alt or "portrait" in alt:
                s += 3
            if any(t in stem for t in tokens):
                s += 2
            if BANNER.search(stem):
                s -= 4
            if is_generic_alt(alt):
                s -= 2
            return s

        if picks:
            photo = max(picks, key=score)["src"]

    # contact details found in copy
    text_all = " ".join(
        r.get("x", "") for b in blocks if b["t"] == "p" for r in b.get("runs", [])
    )
    emails = sorted(set(re.findall(r"[\w.+-]+@[\w-]+\.[\w.-]+", text_all)))
    phones = sorted(set(re.findall(r"(?<!\d)202[-. ]\d{3}[-. ]\d{4}(?!\d)", text_all)))

    lead = None
    # drop a paragraph that only echoes the heading it follows, then pick the lead
    cleaned: list[dict] = []
    for b in blocks:
        if b["t"] == "p" and cleaned and cleaned[-1]["t"] in ("h2", "h3", "h4"):
            plain = "".join(r.get("x", "") for r in b["runs"]).strip()
            if plain.lower() == cleaned[-1]["x"].strip().lower():
                continue
        if b["t"] in ("ul", "ol") and not b["items"]:
            continue
        cleaned.append(b)
    blocks = cleaned
    lead = None
    for b in blocks:
        if b["t"] == "p":
            text = "".join(r.get("x", "") for r in b["runs"] if r["t"] in ("x", "s"))
            if lead is None or len(text) > len(lead):
                lead = text
            if len(text) > 80:
                break
    if lead and len(lead) < 40:
        lead = None
    # Some pages state the same sentence twice: once as the summary the header
    # shows, once again in the body. That summary is also the listing excerpt
    # and the meta description, so it stays and the repeat inside the body goes.
    # Only an exact match counts, so no section ever loses its own copy.
    if lead:
        key = re.sub(r"[^a-z0-9]+", "", lead.lower())
        for k, b in enumerate(blocks):
            if b["t"] != "p" or len(blocks) < 3:
                continue
            plain = "".join(r.get("x", "") for r in b["runs"])
            if len(plain) <= 80 or re.sub(r"[^a-z0-9]+", "", plain.lower()) != key:
                continue
            # Only copy that shares its section with something else can go. If
            # this paragraph is all the section holds, the summary stays out of
            # the header instead of the body losing its only text.
            prev_head = k > 0 and blocks[k - 1]["t"] in ("h2", "h3", "h4")
            nxt = blocks[k + 1] if k + 1 < len(blocks) else None
            nxt_head = nxt is not None and nxt["t"] in ("h2", "h3", "h4")
            if prev_head and (nxt is None or nxt_head):
                lead = None
            else:
                words -= len(re.findall(r"[A-Za-z0-9][\w./-]*", plain))
                blocks = blocks[:k] + blocks[k + 1 :]
            break

    return {
        "path": page_path,
        "title": title or (page_path.strip("/").replace("-", " ").title() or "Home"),
        "lead": lead,
        "dead_links": dead_links,
        "type": ptype,
        "breadcrumb": breadcrumb,
        "blocks": blocks,
        "images": images,
        "words": words,
        "emails": emails,
        "phones": phones,
        "source": meta["url"] or (ORIGIN + page_path),
        "published": meta["published"],
        "role": role,
        "department": department,
        "photo": photo,
        "alt_issues": alt_issues,
    }



# ---------------------------------------------------- flattened table rebuild
# The markdown reader drops the <table> markup on the curriculum pages: one bold
# header row, then one plain row per course. That shape is rebuilt into a real
# table here, because a paragraph of course codes is unreadable. Nothing is
# invented: the cells are the words already on the page, split only at the code,
# the credit number or the course number that the header asks for.
TBL_HDR = re.compile(r"^(\*\*[^*\n]{2,24}\*\*){2,}[ \t]*$")
TBL_CREDITS = re.compile(r"\s*(\d{1,2})\s*$")
TBL_CODE = re.compile(
    r"^([A-Z][A-Za-z]*(?:/[A-Za-z0-9]+)*"
    r"(?:\s+(?:#\d+|\d{2,3}[A-Z]?(?:/[A-Z])?))?"
    r"(?:\s+(?:Art|Sci|I|II|III))?)\s+(.+)$",
    re.S,
)


def table_cells(line: str, headers: list[str]) -> list[str]:
    """Split one flattened table row into cells that match the header."""
    line = line.strip()
    if TBL_HDR.match(line):  # a bold-only row, e.g. Total Credits
        found = re.findall(r"\*\*([^*]+)\*\*", line)
        return found + [""] * (len(headers) - len(found))
    low = [h.lower() for h in headers]
    credits = None
    m = TBL_CREDITS.search(line)
    if m and low[-1].startswith(("credit", "total", "hours")):
        credits = m.group(1)
        line = line[: m.start()].rstrip()
    if low[0] == "code":
        cm = TBL_CODE.match(line)
        if cm:
            return [cm.group(1).strip(), cm.group(2).strip(), credits or ""]
        return ["", line, credits or ""]
    if low[-1] == "course #":
        hm = re.search(r"\s(\d{1,2})\s+([A-Z]{2,4}\s?\d{3}(?:/\d{3})?)\s*$", line)
        if hm:
            return [line[: hm.start()].strip(), hm.group(1), hm.group(2)]
        return [line, credits or "", ""]
    return [line] + [""] * (len(headers) - 1)


def read_flat_table(lines: list[str], i: int, n: int):
    """Return (rows, next_index) when a bold header row starts a flat table."""
    headers = re.findall(r"\*\*([^*]+)\*\*", lines[i].strip())
    rows = [headers]
    j = i + 1
    while j < n:
        cell = lines[j].strip()
        if not cell:
            break
        if TBL_HDR.match(cell) and not cell.lower().startswith("**total"):
            break  # a new header row means a new table
        if cell.startswith(("#", "![", "|")):
            break
        if re.match(r"^[*+-]\s", cell) or re.match(r"^\d+\.\s", cell):
            break
        rows.append(table_cells(cell, headers))
        j += 1
    if len(rows) < 3 or any(len(r) != len(headers) for r in rows):
        return None, i
    return rows, j


# ---------------------------------------------------------------- block parsing


def parse_blocks(text: str, page_path: str):
    """Turn main-content markdown into typed blocks, in document order.

    Block types: h2 h3 h4, p, ul, ol, img, table, cards. Nothing is invented
    and nothing is reordered. Card grids (news teasers, faculty headshots) are
    recognised as structured data because the redesign filters and paginates
    them, which prose blocks cannot do.
    """
    text = collapse_card_groups(text)
    blocks: list[dict] = []
    images: list[dict] = []
    words = 0

    def add_image(alt: str, src_url: str) -> None:
        nonlocal words
        loc = local_asset(src_url, "img", page_path)
        alt2 = re.sub(r"^Image \d+:\s*", "", clean_text(alt))
        if loc:
            images.append({"src": loc, "alt": alt2, "source": src_url})
            blocks.append({"t": "img", "src": loc, "alt": alt2})
        elif src_url.startswith("http") and "/themes/" not in src_url:
            # The old pages hotlink the YouTube cover art of their own videos.
            # Those frames were downloaded earlier for the homepage, so point at
            # the local copy instead of the third-party host. Anything else that
            # lives off engineering.catholic.edu is not carried over: the brief
            # says images come from the college site, nowhere else.
            vid = re.search(r"youtu(?:be)\.com/v[pi]/([A-Za-z0-9_-]{6,})", src_url) or \
                re.search(r"img\.youtube\.com/v/([A-Za-z0-9_-]{6,})", src_url)
            if vid:
                local = f"/media/film-{vid.group(1)}.jpg"
                if os.path.exists(os.path.join(BASE, "public", local.lstrip("/"))):
                    images.append({"src": local, "alt": alt2, "source": src_url})
                    blocks.append({"t": "img", "src": local, "alt": alt2})
                    return
            # The video itself belongs to the college. Where the frame cannot be
            # carried, the page keeps a link to the college's own video instead,
            # using the identifier already published in the thumbnail URL.
            video = None
            vimeo = re.search(r"vumbnail\.com/(\d+)", src_url)
            if vid:
                video = f"https://www.youtube.com/watch?v={vid.group(1)}"
            elif vimeo:
                video = f"https://vimeo.com/{vimeo.group(1)}"
            if video:
                title = re.sub(r"^Thumbnail for video\s*", "", alt2).strip(" .")
                title = re.sub(r"\s*\|\s*(The )?Catholic University( of America)?\s*$", "", title)
                label = f"Watch the video: {title}" if title else "Watch the video"
                blocks.append({"t": "p", "runs": [
                    {"t": "a", "x": label, "href": video, "ext": 1}]})
                words += len(label.split())
                globals().setdefault("VIDEOS", {}).setdefault(page_path, []).append(
                    {"title": title, "url": video, "thumb": src_url})
                return
            globals().setdefault("OFFSITE", {}).setdefault(page_path, []).append(src_url)

    def flush_para(buf: list[str]) -> None:
        nonlocal words
        joined = " ".join(x.strip() for x in buf if x.strip()).strip()
        buf.clear()
        if not joined:
            return
        lead = re.match(r"^!\[([^\]]*)\]\(([^)\s]+)(?:\s+\"[^\"]*\")?\)\s*", joined)
        if lead:
            add_image(lead.group(1), lead.group(2))
            joined = joined[lead.end() :].strip()
        if not joined:
            return
        runs = inline_runs(joined)
        if not runs:
            return
        words += len(re.findall(r"[A-Za-z0-9][\w'\u2019./-]*", clean_text(joined)))
        blocks.append({"t": "p", "runs": runs})

    para: list[str] = []
    lines = text.split("\n")
    i = 0
    n = len(lines)
    while i < n:
        line = lines[i].strip()
        if not line:
            flush_para(para)
            i += 1
            continue

        if re.match(r"^#\s", line):  # an h1 already lifted into the page title
            flush_para(para)
            i += 1
            continue

        hm = re.match(r"^(#{2,4})\s+(.+)$", line)
        if hm:
            flush_para(para)
            raw_txt = hm.group(2)
            runs = inline_runs(raw_txt)
            txt = clean_text(strip_markers(
                re.sub(r"\[([^\]]*)\]\(([^)]*)\)", r"\1", raw_txt)))
            if not txt:
                txt = clean_text(strip_markers(re.sub(r"<[^>]+>", "", raw_txt)))
            words += len(re.findall(r"[A-Za-z0-9][\w'\u2019./-]*", txt))
            block = {"t": f"h{len(hm.group(1))}", "x": txt}
            # An index page titles each entry with a link. Keeping the target
            # turns a heading plus its picture plus its summary into a card.
            links = [r for r in runs if r.get("t") == "a"]
            if len(links) == 1 and (links[0].get("x") or "").strip().lower() == txt.lower():
                href = links[0].get("href") or ""
                if href.startswith("/"):
                    block["href"] = href
            blocks.append(block)
            i += 1
            continue

        im = re.fullmatch(r"!\[([^\]]*)\]\(([^)\s]+)(?:\s+\"[^\"]*\")?\)", line)
        if im:
            flush_para(para)
            add_image(im.group(1), im.group(2))
            i += 1
            continue

        if TBL_HDR.match(line):
            flush_para(para)
            flat_rows, nxt = read_flat_table(lines, i, n)
            if flat_rows is not None:
                blocks.append({"t": "table", "rows": flat_rows})
                words += sum(len(re.findall(r"\w+", " ".join(r))) for r in flat_rows)
                i = nxt
                continue

        if line.startswith("|") and line.count("|") >= 2:
            flush_para(para)
            rows = []
            while i < n and lines[i].strip().startswith("|"):
                rows.append(lines[i].strip())
                i += 1
            cells = [[clean_text(x) for x in r.strip("|").split("|")] for r in rows]
            if len(cells) >= 2 and all(set(x) <= set("-: ") for x in cells[1]):
                cells = [cells[0]] + cells[2:]
            blocks.append({"t": "table", "rows": cells})
            words += sum(len(re.findall(r"\w+", " ".join(r))) for r in cells)
            continue

        if re.match(r"^[*+-]\s+", line) or re.match(r"^\d+\.\s+", line):
            flush_para(para)
            ordered = bool(re.match(r"^\d+\.\s+", line))
            items: list[str] = []
            cur = None
            while i < n:
                ln = lines[i]
                lm = re.match(r"^\s*(?:[*+-]|\d+\.)\s+(.*)$", ln)
                if lm:
                    if cur is not None:
                        items.append(cur)
                    cur = lm.group(1)
                    i += 1
                    continue
                if cur is not None:
                    if ln.strip():
                        cur += "\n" + ln.strip()
                        i += 1
                        continue
                    # a blank line ends the list only if the next line is prose
                    nxt = ""
                    j = i + 1
                    while j < n and not lines[j].strip():
                        j += 1
                    if j < n and re.match(r"^\s*(?:[*+-]|\d+\.)\s+", lines[j]):
                        i = j
                        continue
                    break
                break
            if cur is not None:
                items.append(cur)

            kept = [it for it in items if not ICON_GLYPH.match(it.strip())]
            cards = [card_from_item(it) for it in kept]
            hits = sum(1 for c in cards if c)
            if hits >= max(2, (len(cards) + 1) // 2):
                out = [c for c in cards if c]
                kinds = {c["kind"] for c in out}
                blocks.append(
                    {"t": "cards", "kind": out[0]["kind"], "cards": out}
                    if len(kinds) == 1
                    else {"t": "cards", "kind": "mixed", "cards": out}
                )
                words += sum(len(re.findall(r"\w+", str(c.get("title") or ""))) for c in out)
                for c in out:
                    if c.get("image"):
                        images.append(
                            {
                                "src": c["image"],
                                "alt": c.get("title") or "",
                                "source": c["image_source"],
                            }
                        )
                continue

            runs_items = []
            for it in kept:
                flat = " ".join(x.strip() for x in it.split("\n") if x.strip())
                runs_items.append(inline_runs(flat))
                words += len(re.findall(r"[A-Za-z0-9][\w'\u2019./-]*", clean_text(flat)))
            if runs_items:
                blocks.append({"t": "ol" if ordered else "ul", "items": runs_items})
            continue

        para.append(line)
        i += 1

    flush_para(para)

    # a paragraph that only echoes the heading before it is a template artefact
    cleaned: list[dict] = []
    for b in blocks:
        if b["t"] == "p" and cleaned and cleaned[-1]["t"] in ("h2", "h3", "h4"):
            plain = "".join(r.get("x", "") for r in b["runs"]).strip()
            if plain.lower() == cleaned[-1]["x"].strip().lower():
                continue
        if b["t"] in ("ul", "ol") and not b["items"]:
            continue
        cleaned.append(b)
    return cleaned, images, words


# ---------------------------------------------------------------- main

def load_live_paths() -> list[str]:
    out = []
    for line in open(LIVE_URLS, encoding="utf-8"):
        line = line.strip()
        if line.startswith("/") and " " not in line:
            out.append(line)
    return out


# ---------------------------------------------------------------- news listings

LISTING_DIR = "/home/ubuntu/_scrape/listings/html"
LISTING_CATEGORIES = {
    "7": "Biomedical Engineering",
    "8": "Civil and Environmental Engineering",
    "11": "Computer Science",
    "66": "Electrical and Computer Engineering",
    "71": "Mechanical Engineering",
    "76": "Physics",
}
CARD_LINK = re.compile(
    r'<a class="news-feed__card-link" href="([^"]+)"\s*>(.*?)</a>', re.S
)
CARD_IMG = re.compile(
    r'<img[^>]*src="([^"]+)"[^>]*?alt="([^"]*)"', re.S
)
CARD_TIME = re.compile(r'<time datetime="([^"]+)">(.*?)</time>', re.S)
PLACEHOLDER = re.compile(r"placeholders/[A-Za-z0-9._-]+")


def listing_files() -> list[str]:
    """Listing pages in page order, so the newest story really is first."""

    def key(name: str):
        m = re.match(r"(all|cat\d+|dir)-(\d+)\.html", name)
        return (m.group(1) if m else name, int(m.group(2)) if m else 0)

    return sorted(
        [
            n
            for n in os.listdir(LISTING_DIR)
            if re.match(r"(all|cat\d+|dir)-\d+\.html$", n)
        ],
        key=key,
    )


def parse_listings() -> dict:
    """Read the paginated story listings.

    The listing card is the only place the old site shows a story's teaser
    image, its displayed date and its taxonomy term, so the blog index is
    built from here rather than guessed from article bodies. Cards whose media
    is a theme placeholder file are recorded without an image: a placeholder is
    exactly the kind of dummy asset this build must not ship.
    """
    if not os.path.isdir(LISTING_DIR):
        print("no listing html, skipping news meta")
        return {}
    stories: dict[str, dict] = {}
    order: list[str] = []
    for name in listing_files():
        if not name.startswith(("all-", "cat")):
            continue
        is_all = name.startswith("all-")
        cat = None
        m = re.match(r"cat(\d+)-", name)
        if m:
            cat = LISTING_CATEGORIES.get(m.group(1))
        html_text = open(os.path.join(LISTING_DIR, name), encoding="utf-8", errors="replace").read()
        for link in CARD_LINK.finditer(html_text):
            start = link.start()
            # The teaser image sits just above the title, the date just below.
            back = html_text[max(0, start - 900) : start]
            fwd = html_text[link.end() : link.end() + 400]
            tim = CARD_TIME.search(fwd)
            media_matches = list(CARD_IMG.finditer(back))
            img = media_matches[-1] if media_matches else None
            href = link.group(1).split("?")[0].rstrip("/") or "/"
            node = re.sub(r"/sites/default/files/styles/[^/]+/", "/sites/default/files/", href)
            if node != href:
                href = node
            slug_name = href.split("/")[-1]
            title = clean_text(re.sub(r"<[^>]+>", "", link.group(2)))
            title = html.unescape(title)
            if not slug_name or not title:
                continue
            entry = stories.setdefault(
                slug_name,
                {
                    "slug": slug_name,
                    "title": title,
                    "href": href,
                    "date": None,
                    "displayDate": None,
                    "thumbnail": None,
                    "thumbnailAlt": None,
                    "thumbnailSource": None,
                    "categories": [],
                },
            )
            if not entry["title"] and title:
                entry["title"] = title
            if tim and not entry["date"]:
                entry["date"] = tim.group(1)
                entry["displayDate"] = clean_text(tim.group(2))
            if img and not PLACEHOLDER.search(img.group(1)) and not entry["thumbnail"]:
                src = img.group(1)
                if not src.startswith("http"):
                    src = ORIGIN + src
                if "engineering.catholic.edu" in src:
                    local = local_asset(src, "img", "/connect-contact/news-events")
                    if local and asset_ok(local):
                        entry["thumbnail"] = local
                        entry["thumbnailSource"] = src
                        alt = clean_text(re.sub(r"^Image \d+:\s*", "", img.group(2)))
                        entry["thumbnailAlt"] = "" if is_generic_alt(alt) else alt
            if cat and cat not in entry["categories"]:
                entry["categories"].append(cat)
            if is_all and slug_name not in order:
                order.append(slug_name)
    for s in sorted(stories.values(), key=lambda x: x["date"] or "", reverse=True):
        if s["slug"] not in order:
            order.append(s["slug"])
    cats: dict[str, int] = {}
    for s in stories.values():
        for c in s["categories"]:
            cats[c] = cats.get(c, 0) + 1
    payload = {
        "generated": "2026-11-23",
        "origin": ORIGIN,
        "categories": [c for c, _ in sorted(cats.items(), key=lambda x: (-x[1], x[0]))],
        "categoryCounts": cats,
        "withImage": sum(1 for s in stories.values() if s["thumbnail"]),
        "stories": [stories[k] for k in order if k in stories],
    }
    os.makedirs(os.path.dirname(NEWS_JSON), exist_ok=True)
    with open(NEWS_JSON, "w", encoding="utf-8") as fh:
        json.dump(payload, fh, ensure_ascii=False, separators=(",", ":"))
    print(
        f"news meta: {len(order)} stories, {payload['withImage']} with a real teaser, "
        f"categories {json.dumps(cats)}"
    )
    return payload


PERSON_SPLIT = re.compile(r'class="person-list-item[" ]')
PERSON_MEDIA = re.compile(
    r'<a class="person-list-item__media-link" href="([^"]+)"\s*>\s*<img[^>]*src="([^"]+)"[^>]*?alt="([^"]*)"',
    re.S,
)
PERSON_LINK = re.compile(r'<a class="person-list-item__media-link" href="([^"]+)"', re.S)
PERSON_NAME = re.compile(r'<h2 class="person-list-item__name">(.*?)</h2>', re.S)
PERSON_TITLE = re.compile(r'<p class="person-list-item__title">(.*?)</p>', re.S)
PERSON_DEPT = re.compile(
    r'<p class="person-list-item__department-label">[^<]*</p>\s*<span>(.*?)</span>', re.S
)


def parse_directory() -> list[dict]:
    """Read the paginated faculty directory.

    The directory is the only place the old site publishes a rank, a department
    and a headshot for every person. The profile pages carry some of those and
    not others, so the listing is merged into the profile records here. Nothing
    is invented: an empty field stays empty and the template omits it.
    """
    people: list[dict] = []
    if not os.path.isdir(LISTING_DIR):
        return people
    for name in listing_files():
        if not name.startswith("dir-"):
            continue
        text = open(os.path.join(LISTING_DIR, name), encoding="utf-8", errors="replace").read()
        heads = [x.start() for x in PERSON_SPLIT.finditer(text)]
        for idx, start in enumerate(heads):
            chunk = text[start : heads[idx + 1] if idx + 1 < len(heads) else len(text)]
            link = PERSON_LINK.search(chunk)
            if not link:
                continue
            href = link.group(1).split("?")[0].rstrip("/")
            slug_name = href.split("/")[-1]
            if not slug_name:
                continue
            nm = PERSON_NAME.search(chunk)
            ttl = PERSON_TITLE.search(chunk)
            dep = PERSON_DEPT.search(chunk)
            media = PERSON_MEDIA.search(chunk)
            image = None
            alt = None
            source = None
            if media:
                src = media.group(2)
                if not src.startswith("http"):
                    src = ORIGIN + src
                raw_alt = media.group(3)
                alt = clean_text(re.sub(r"^Image \d+:\s*", "", raw_alt))
                if "engineering.catholic.edu" in src:
                    local = local_asset(src, "img", href)
                    image = local
                    source = src
                    nm_txt = clean_text(re.sub(r"<[^>]+>", "", nm.group(1))) if nm else ""
                    # The card is labelled with this person's name, so a missing
                    # description becomes the name rather than a guess.
                    if is_generic_alt(alt) and nm_txt:
                        alt = nm_txt
            entry = {
                "href": href,
                "slug": slug_name,
                "name": clean_text(re.sub(r"<[^>]+>", "", nm.group(1))) if nm else None,
                "role": clean_text(re.sub(r"<[^>]+>", "", ttl.group(1))) if ttl else None,
                "department": clean_text(re.sub(r"<[^>]+>", "", dep.group(1))) if dep else None,
                "image": image,
                "imageSource": source,
                "alt": alt if not is_generic_alt(alt or "") else None,
            }
            people.append(entry)
    print(
        f"directory cards parsed: {len(people)}, "
        f"{sum(1 for p in people if p['image'])} with a headshot, "
        f"{sum(1 for p in people if p['department'])} with a department"
    )
    return people


def block_text(b: dict) -> str:
    if b["t"] == "p":
        return "".join(r.get("x", "") for r in b["runs"])
    if b["t"] in ("h2", "h3", "h4"):
        return b["x"]
    if b["t"] in ("ul", "ol"):
        return " ".join("".join(r.get("x", "") for r in it) for it in b["items"])
    if b["t"] == "table":
        return " ".join(" ".join(row) for row in b["rows"])
    return ""



SECTION_TITLES = {
    "explore-our-college": "Explore Our College",
    "programs-admission": "Programs & Admission",
    "connect-contact": "Connect & Contact",
    "current-students": "Current Students",
    "faculty-staff": "Faculty & Staff",
    "about": "About",
}


def finalize_breadcrumbs(pages: dict, served: set) -> int:
    """Give every page a breadcrumb whose links all land on a real page.

    Two sources are combined. The breadcrumb harvested from Drupal gives the
    label wording the college uses, and the URL chain gives the order. A crumb
    is kept only when it resolves to a page this build actually serves, so a
    legacy path that became a redirect never appears as a link.
    """
    changed = 0
    for path, d in pages.items():
        labels = {}
        for crumb in d.get("breadcrumb") or []:
            title = (crumb.get("title") or "").strip()
            href = crumb.get("href") or ""
            if not title or title.lower() == "home" or href == path:
                continue
            target, _how = urlmap.resolve(urlmap.tidy(href), served)
            if target and target != path:
                labels.setdefault(target, title)
        trail = [{"title": "Home", "href": "/"}]
        parts = [p for p in path.split("/") if p]
        used = set()
        for depth in range(1, len(parts)):
            acc = "/" + "/".join(parts[:depth])
            target, _how = urlmap.resolve(urlmap.tidy(acc), served)
            if not target or target == path or target in used:
                continue
            used.add(target)
            if depth == 1:
                title = SECTION_TITLES.get(parts[0]) or labels.get(target) \
                    or pages[target]["title"]
            else:
                title = labels.get(target) or pages[target]["title"]
            trail.append({"title": title, "href": target})
        trail.append({"title": d["title"], "href": path})
        if trail != d.get("breadcrumb"):
            changed += 1
        d["breadcrumb"] = trail
    return changed

def find_faults(pages: dict, served: set) -> list[dict]:
    """Content that is outdated, contradictory or broken on the source site.

    Reported, never silently repaired.
    """
    faults: list[dict] = []
    for path, d in pages.items():
        text = " ".join(block_text(b) for b in d["blocks"])
        if re.search(r"School of Engineering", text):
            faults.append({"path": path, "kind": "old naming",
                           "detail": "still says School of Engineering after the 2025 rename"})
        if re.search(r"coming soon|Under Construction|placeholder", text, re.I):
            faults.append({"path": path, "kind": "unfinished",
                           "detail": "source page contains unfinished copy"})
        if re.search(r"\bcampusmaster\b|\btest\b@\bexample", text, re.I):
            faults.append({"path": path, "kind": "sample data",
                           "detail": "source page looks like template or sample content"})
        for src in d.get("alt_issues") or []:
            faults.append({"path": path, "kind": "missing alt text",
                           "detail": f"image has no description on the source page: {src}"})
        for src_offsite in d.get("offsite_images") or []:
            faults.append({"path": path, "kind": "image hosted off the college site",
                           "detail": f"{src_offsite} is used by the old page but is not "
                                     "an engineering.catholic.edu asset; not carried over"})
        for src_missing in d.get("dropped_images") or []:
            faults.append({"path": path, "kind": "image not retrievable from the source",
                           "detail": f"{src_missing} is referenced by the old page but "
                                     "the origin refuses the download; the reference is "
                                     "dropped so the new site shows no broken image"})
        for href in d.get("dead_links") or []:
            faults.append({"path": path, "kind": "dead anchor on the source page",
                           "detail": f"link to {href} became plain text"})
        # Link integrity is not checked here any more: every internal href has
        # already been folded onto a canonical served page by urlmap.resolve in
        # rewrite_href, and scripts/link-check.py proves it against the running
        # server, which is the only place asset paths and hand routes agree.
    for u in sorted(FLAGGED.get("staging_host_links", [])):
        faults.append({"path": "(assets)", "kind": "staging host asset",
                       "detail": f"document is served from the staging host: {u}"})
    for u in sorted(FLAGGED.get("links_not_in_build", [])):
        faults.append({"path": "(links)", "kind": "link to a page not in this build",
                       "detail": f"kept pointing at production: {ORIGIN}{u}"})
    for u in sorted(FLAGGED.get("dead_source_links", [])):
        faults.append({"path": "(links)", "kind": "link to a page that does not exist",
                       "detail": f"{ORIGIN}{u} returns 404 on the old site; "
                                 "the words are kept, the link is removed"})
    return faults


def main() -> None:
    paths = load_live_paths()
    pages = {}
    os.makedirs(AUDIT_DIR, exist_ok=True)
    files = sorted(os.listdir(SRC_DIR))
    by_slug = {os.path.splitext(f)[0]: f for f in files if f.endswith(".md")}
    missing = [p for p in paths if slug(p) not in by_slug]
    print(f"live paths {len(paths)}, crawled {len(by_slug)}, missing {len(missing)}")

    # Which paths already have a hand-authored page in this repo?
    hand: set[str] = set()
    app = os.path.join(BASE, "src/app")
    for root, dirs, fs in os.walk(app):
        if "page.tsx" in fs:
            rel = os.path.relpath(root, app).replace(os.sep, "/")
            hand.add("/" + ("" if rel == "." else rel))
    globals()["BUILT_ROUTES"] = hand

    # The duplicate map is derived from the crawl on every run, never read from
    # the redirect CSV, so a stale map cannot send a link somewhere it should not.
    dup_map: dict[str, str] = {}

    # The old site published some pages twice: an index.html twin, an
    # /academics/ segment, a copy under a department, a /homepage alias, and
    # paths still named for the School of Engineering. One URL is canonical and
    # the others become 301s, which is the consolidation this redesign is for.
    crawled = {p for p in paths if slug(p) in by_slug}

    computed = {}
    for p in crawled:
        target = urlmap.structural(p)
        if target != p and target in crawled:
            computed[p] = target
    dup_map.update(computed)
    globals()["DUPLICATE_MAP"] = dup_map
    globals()["CRAWLED"] = crawled
    print(f"legacy duplicates folded into one URL: {len(computed)}")

    # Links are only internal if the target is actually going to be served.
    served_pages = {p for p in crawled if p not in dup_map}
    globals()["SERVED_PAGES"] = served_pages

    globals()["ASSETS"] = load_asset_status()
    print(f"asset status: {len(ASSETS)} images recorded")
    for p in paths:
        f = by_slug.get(slug(p))
        if not f:
            continue
        raw = open(os.path.join(SRC_DIR, f), encoding="utf-8").read()
        pages[p] = parse_md(raw, p)

    # Drop the duplicates from the served set so the 301 in the redirect map is
    # the only way to reach them, and keep a table of what moved.
    dropped = []
    for p in sorted(dup_map):
        target = dup_map[p]
        if p in pages and target in pages and p != target:
            dropped.append((p, target, pages[p]["title"]))
            del pages[p]
    with open(os.path.join(AUDIT_DIR, "duplicate-urls.csv"), "w", newline="") as fh:
        w = csv.writer(fh)
        w.writerow(["old_url", "canonical_url", "title", "action"])
        for p, t, title in dropped:
            w.writerow([ORIGIN + p, ORIGIN + t, title, "301"])
    print(f"duplicate pages removed from the build: {len(dropped)}")

    people = parse_directory()
    listed = 0
    for person in people:
        page = pages.get(person["href"])
        if not page:
            continue
        listed += 1
        if person["role"] and not page.get("role"):
            page["role"] = person["role"]
        if person["department"] and not page.get("department"):
            page["department"] = person["department"]
        if person["image"] and not page.get("photo"):
            page["photo"] = person["image"]
            if not any(im["src"] == person["image"] for im in page["images"]):
                page["images"].append(
                    {
                        "src": person["image"],
                        "alt": person["alt"] or page["title"],
                        "source": person["imageSource"] or "",
                    }
                )
        if person["name"] and page["type"] == "faculty":
            page["person_name"] = person["name"]
    profiles = [d for d in pages.values() if d["type"] == "faculty"]
    print(
        f"directory merge: {listed} of {len(people)} cards matched a profile;"
        f" profiles with a photo now {sum(1 for d in profiles if d.get('photo'))},"
        f" with a rank {sum(1 for d in profiles if d.get('role'))},"
        f" with a department {sum(1 for d in profiles if d.get('department'))}"
    )
    with open(os.path.join(AUDIT_DIR, "directory.csv"), "w", newline="") as fh:
        w = csv.writer(fh)
        w.writerow(["profile_url", "name", "rank", "department", "headshot_source_url",
                    "alt", "profile_crawled"])
        for person in people:
            w.writerow([
                ORIGIN + person["href"],
                person["name"] or "",
                person["role"] or "",
                person["department"] or "",
                person["imageSource"] or "",
                person["alt"] or "",
                "yes" if person["href"] in pages else "no",
            ])

    # meta descriptions: use the first 160 characters of the lead, faithfully
    for p, d in pages.items():
        lead = d.get("lead") or ""
        d["description"] = (lead[:157] + "...") if len(lead) > 160 else lead

    crumbs = finalize_breadcrumbs(pages, set(pages) | BUILT_ROUTES)
    print(f"breadcrumbs rewritten to land on served pages: {crumbs}")

    for path, vids in globals().get("VIDEOS", {}).items():
        if path in pages:
            pages[path]["videos"] = vids

    for path, urls in globals().get("OFFSITE", {}).items():
        if path in pages:
            pages[path]["offsite_images"] = urls
            pages[path]["images"] = [
                im for im in pages[path].get("images") or []
                if not str(im.get("src", "")).startswith("http")
            ]

    dropped_assets = apply_asset_gate(pages)
    if dropped_assets:
        print(f"image references dropped because the file is not in public/: {dropped_assets}")

    faults = find_faults(pages, set(pages) | BUILT_ROUTES)
    for person in people:
        if person["href"] not in pages:
            faults.append({
                "path": person["href"], "kind": "directory entry with no profile",
                "detail": "the directory lists this person but no profile page exists in the sitemap",
            })
    with open(os.path.join(AUDIT_DIR, "video-links.csv"), "w", newline="") as fh:
        w = csv.writer(fh)
        w.writerow(["page_url", "video_url", "video_title", "thumbnail_on_old_page"])
        for path, vids in sorted(globals().get("VIDEOS", {}).items()):
            for v in vids:
                w.writerow([ORIGIN + path, v["url"], v["title"], v["thumb"]])

    with open(os.path.join(AUDIT_DIR, "content-faults.csv"), "w", newline="") as fh:
        w = csv.writer(fh)
        w.writerow(["path", "kind", "detail"])
        for f in faults:
            w.writerow([f["path"], f["kind"], f["detail"]])
    print(f"content faults flagged: {len(faults)}")

    os.makedirs(os.path.dirname(OUT_JSON), exist_ok=True)
    payload = {
        "generated": "2026-11-23",
        "origin": ORIGIN,
        "pages": pages,
    }
    with open(OUT_JSON, "w", encoding="utf-8") as fh:
        json.dump(payload, fh, ensure_ascii=False, separators=(",", ":"))
    print(f"wrote {OUT_JSON}  ({os.path.getsize(OUT_JSON)/1e6:.1f} MB, {len(pages)} pages)")

    # A compact list the navigation can consult without loading the copy, so a
    # client component never has to parse the whole content file.
    with open(os.path.join(os.path.dirname(OUT_JSON), "served-paths.json"), "w") as fh:
        json.dump(sorted(pages), fh, separators=(",", ":"))

    parse_listings()

    # audit tables
    os.makedirs(AUDIT_DIR, exist_ok=True)
    for d in (IMG_DIR, DOC_DIR):
        os.makedirs(d, exist_ok=True)
    with open(os.path.join(AUDIT_DIR, "page-inventory.csv"), "w", newline="") as fh:
        w = csv.writer(fh)
        w.writerow(["old_url", "title", "page_type", "words", "images", "documents",
                    "status", "notes"])
        thin, novideo = [], []
        for p in paths:
            d = pages.get(p)
            if not d:
                w.writerow([ORIGIN + p, "", "", "", "", "", "not crawled",
                            "crawler has no file yet"])
                continue
            ndocs = sum(1 for b in d["blocks"] if b["t"] == "p" for r in b["runs"]
                         if r["t"] == "a" and str(r.get("href", "")).startswith("/docs/"))
            ndocs += sum(1 for b in d["blocks"] if b["t"] == "ul"
                         for it in b["items"] for r in it
                         if r["t"] == "a" and str(r.get("href", "")).startswith("/docs/"))
            status = "built" if p in BUILT_ROUTES else "rebuilt this pass"
            note = ""
            if d["words"] < 40:
                note = "thin source page"
                thin.append((p, d["title"], d["words"]))
            elif not d["images"]:
                note = "no image on the source page"
            w.writerow([ORIGIN + p, d["title"], d["type"], d["words"], len(d["images"]),
                        ndocs, status, note])

        # summary
        kinds: dict[str, int] = {}
        for d in pages.values():
            kinds[d["type"]] = kinds.get(d["type"], 0) + 1
        built = sum(1 for p in pages if p in BUILT_ROUTES)
        total_words = sum(d["words"] for d in pages.values())
        lines = [
            "# Page inventory",
            "",
            "Source: the 477 paths of the production sitemap of engineering.catholic.edu, "
            "crawled 2026-11-23 through the reader proxy, because the origin sits behind a "
            "Cloudflare managed challenge.",
            "",
            f"- Paths in the production sitemap: {len(paths)}",
            f"- Paths the crawler returned: {len(pages)}",
            f"- Paths not crawled yet: {len(missing)}",
            f"- Paths with a hand-authored page in this repo: {built}",
            f"- Words of real copy harvested: {total_words:,}",
            f"- Unique images: {len(IMG_CACHE)}   Unique documents: {len(DOCS)}",
            "",
            "## By page type",
            "",
            "| Type | Pages |",
            "| --- | --- |",
        ]
        for k, v in sorted(kinds.items(), key=lambda x: -x[1]):
            lines.append(f"| {k} | {v} |")
        lines += [
            "",
            "## Thin pages under 40 words",
            "",
        ]
        for p, t, w_ in thin[:40]:
            lines.append(f"- `{p}` {t}: {w_} words")
        if not thin:
            lines.append("- none")
        lines += [
            "",
            "Full table: `page-inventory.csv`. Every row keeps the production URL, so nothing "
            "on the old site 404s after launch.",
            "",
        ]
        open(os.path.join(AUDIT_DIR, "inventory.md"), "w").write("\n".join(lines))
    with open(os.path.join(AUDIT_DIR, "media-manifest.csv"), "w", newline="") as fh:
        w = csv.writer(fh)
        w.writerow(["source_url", "fetch_url", "local_file", "alt", "alt_from_source", "pages"])
        alt_by_path: dict[str, str] = {}
        for d in pages.values():
            for im in d["images"]:
                key = urllib.parse.urlparse(im.get("source") or im["src"]).path
                if not alt_by_path.get(key) and im.get("alt"):
                    alt_by_path[key] = im["alt"]
        for src_url, local in IMG_CACHE.items():
            alt = alt_by_path.get(src_url, "")
            w.writerow([
                ORIGIN + src_url,
                IMG_FETCH.get(src_url, ORIGIN + src_url),
                local,
                alt,
                "yes" if alt else "none on source",
                ";".join(sorted(IMG_USES.get(src_url, []))),
            ])
        n_alt = sum(1 for r in IMG_CACHE if alt_by_path.get(r))
        print(f"manifest: {len(IMG_CACHE)} images, {n_alt} with alt text from the source")
    globals()["IMG_MAP"] = IMG_CACHE
    globals()["DOC_TABLE"] = DOCS

    # scripts/fetch-assets.py reads this rather than the CSV, so a change to a
    # local filename cannot make the downloader look for an old name.
    with open(os.path.join(BASE, "src/content/asset-index.json"), "w") as fh:
        json.dump(
            {
                "images": [
                    {
                        "local": local,
                        "source_url": ORIGIN + src_url,
                        "fetch_url": IMG_FETCH.get(src_url, ORIGIN + src_url),
                        "pages": sorted(IMG_USES.get(src_url, [])),
                    }
                    for src_url, local in sorted(IMG_CACHE.items(), key=lambda x: x[1])
                ],
                "documents": [
                    {
                        "local": "/docs/" + d["file"],
                        "source_url": d["source"],
                        "label": d["label"],
                        "pages": sorted(d["pages"]),
                    }
                    for d in sorted(DOCS.values(), key=lambda x: x["file"])
                ],
            },
            fh,
            indent=1,
        )

    kinds = {}
    for d in pages.values():
        kinds[d["type"]] = kinds.get(d["type"], 0) + 1
    print("types:", json.dumps(kinds, indent=0).replace("\n", " "))
    print(f"images registered {len(IMG_CACHE)}, documents {len(DOCS)}")


if __name__ == "__main__":
    main()
