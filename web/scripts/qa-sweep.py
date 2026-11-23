#!/usr/bin/env python3
"""Check the harvested content before it ships.

Reads web/src/content/site-content.json with the real block schema and reports
every copy or structure problem that must not appear on the new site. Exits 1
unless the only findings are listed in ACCEPTED, so an accepted exception still
has to be a deliberate, written decision.

Usage: python3 scripts/qa-sweep.py [--verbose]
"""
from __future__ import annotations

import collections
import json
import re
import sys
import urllib.parse

WEB = "/home/ubuntu/cuacoe/web"
DATA = json.load(open(f"{WEB}/src/content/site-content.json"))
PAGES = DATA["pages"]

# Accepted findings, with the reason they are allowed to stay.
ACCEPTED = {
    "em dash": (0, ""),
    "self link": (
        11,
        "the story listing links to its own unfiltered view; those are the "
        "category and year links on /connect-contact/news-events/all-stories",
    ),
    "developer marker": (
        2,
        "source copy on /current-students/incoming-students says the submission "
        "process is not published yet; it is information, not a stub, so it "
        "stays and is flagged in open-questions",
    ),
    "staging host": (0, "documents are re-pointed at the production host"),
    "placeholder asset": (0, "no stock or dummy image may be referenced"),
    "en dash": (0, ""),
    "double space": (0, ""),
    "empty href": (0, ""),
    "content image with no alt": (
        0,
        "a real photograph a reader cannot see the point of must be described",
    ),
}

# Decorative site furniture the old theme puts on pages: an empty alt is right.
BANNER = re.compile(r"hero|banner|placeholder|default|G-Eng-Phys-Comp", re.I)

PATTERNS = {
    "em dash": "\u2014",
    "en dash": "\u2013",
    "developer marker": r"\[VERIFY\]|\[TODO\]|coming soon|Lorem ipsum|placeholder text|FIXME",
    "staging host": r"engineering-stg|staging\.catholic",
    "placeholder asset": r"news-placeholder|placeholder\.png|noimage|default-avatar|grey box",
    "double space": r"[A-Za-z,.] {2,}[A-Za-z(]",
    "empty href": r"\]\(\)",
}

ASSET_EXT = (".pdf", ".docx", ".xlsx", ".pptx", ".doc", ".xls", ".csv", ".zip",
             ".ppt", ".webp", ".jpg", ".jpeg", ".png", ".gif", ".svg")


def texts(page: dict):
    """Yield (where, string) for every piece of copy on a page."""
    for key in ("title", "lead", "description", "role", "department", "person_name"):
        v = page.get(key)
        if isinstance(v, str):
            yield key, v
    for crumb in page.get("breadcrumb") or []:
        yield "breadcrumb", crumb.get("title", "")

    def runs(label, rs):
        for r in rs or []:
            if r.get("x"):
                yield label, r["x"]
            if r.get("alt"):
                yield f"{label}.alt", r["alt"]

    for i, b in enumerate(page.get("blocks") or []):
        label = f"block[{i}]:{b.get('t')}"
        if b.get("x"):
            yield label, b["x"]
        if b.get("alt") is not None:
            yield f"{label}.alt", b["alt"]
        if b.get("caption"):
            yield f"{label}.caption", b["caption"]
        yield from runs(label, b.get("runs"))
        for it in b.get("items") or []:
            yield from runs(label, it if isinstance(it, list) else None)
        for row in b.get("rows") or []:
            for cell in row:
                if isinstance(cell, str):
                    yield label, cell
                elif isinstance(cell, dict):
                    yield from runs(label, cell.get("runs"))


def hrefs(page: dict):
    for b in page.get("blocks") or []:
        stack = [b]
        while stack:
            node = stack.pop()
            if isinstance(node, dict):
                if node.get("t") == "a":
                    yield node.get("href") or ""
                stack.extend(v for v in node.values() if isinstance(v, (dict, list)))
            elif isinstance(node, list):
                stack.extend(node)


hits: dict[str, list[str]] = collections.defaultdict(list)
served = set(PAGES)
internal_bad: list[str] = []
external = collections.Counter()
image_refs: collections.Counter = collections.Counter()
alt_state: collections.Counter = collections.Counter()

for path, page in PAGES.items():
    for where, s in texts(page):
        if not s:
            continue
        for name, pat in PATTERNS.items():
            if re.search(pat, s):
                snippet = re.sub(r"\s+", " ", s)[:120]
                hits[name].append(f"{path} {where}: {snippet}")
    for href in hrefs(page):
        if not href or href.startswith(("mailto:", "tel:", "#", "javascript:")):
            continue
        u = urllib.parse.urlparse(href)
        if u.scheme in ("http", "https"):
            external[u.netloc] += 1
            if u.netloc.endswith("catholic.edu") and "engineering.catholic.edu" not in u.netloc:
                external["(university other section)"] += 1
            continue
        p = u.path.rstrip("/") or "/"
        if p.endswith(ASSET_EXT) or p.startswith(("/docs/", "/media/")):
            continue
        if p not in served:
            internal_bad.append(f"{path} -> {p}")
        elif p == path:
            hits["self link"].append(f"{path} links to itself")
    for b in page.get("blocks") or []:
        if b.get("t") == "img":
            src = b.get("src") or ""
            image_refs[src] += 1
            alt = (b.get("alt") or "").strip()
            if alt:
                alt_state["alt"] += 1
            elif BANNER.search(src.rsplit("/", 1)[-1]):
                alt_state["decorative banner, empty alt"] += 1
            else:
                alt_state["no alt"] += 1
                hits["content image with no alt"].append(f"{path}: {src}")

report = {
    "pages": len(PAGES),
    "served_paths": len(served),
    "image_refs": len(image_refs),
    "images_with_alt": alt_state["alt"],
    "images_decorative_no_alt": alt_state["decorative banner, empty alt"],
    "content_images_without_alt": alt_state["no alt"],
    "internal_links_to_unserved": len(internal_bad),
    "top_external_hosts": external.most_common(8),
    "findings": {k: len(v) for k, v in hits.items()},
}
print(json.dumps(report, indent=2))
if "--verbose" in sys.argv:
    for name, items in hits.items():
        if items:
            print(f"\n--- {name} ({len(items)})")
            for line in dict.fromkeys(items):
                print("   ", line)
    if internal_bad:
        print(f"\n--- internal links to unserved paths ({len(internal_bad)})")
        for line in list(dict.fromkeys(internal_bad))[:25]:
            print("   ", line)

fails = []
for name, (allowed, _why) in ACCEPTED.items():
    n = report["findings"].get(name, 0)
    if n > allowed:
        fails.append(f"{name}: {n} findings, {allowed} allowed")
if report["internal_links_to_unserved"]:
    fails.append(f"{report['internal_links_to_unserved']} internal links to unserved paths")
for name in report["findings"]:
    if name not in ACCEPTED and report["findings"][name]:
        fails.append(f"{name}: {report['findings'][name]} (no accepted exception)")
print("\nRESULT:", ("FAIL\n  " + "\n  ".join(fails)) if fails else "PASS")
sys.exit(1 if fails else 0)
