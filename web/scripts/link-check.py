#!/usr/bin/env python3
"""Walk the built site and prove there are no broken internal links.

Every path the site claims to serve is requested from a running server. The
returned HTML is read for hrefs and img srcs, and each one is checked:

  internal page   must be in the served set (after the same normalising the
                  content build uses: no index.html, no trailing slash,
                  legacy shapes folded to the canonical URL)
  local asset     must exist under web/public, or be an image style derivative
                  that fetch-assets.py recorded
  redirect rule   a legacy URL must answer 301/308 and name its canonical URL
  external        reported, not failed, unless --external is given (HEAD only)

Usage: python3 scripts/link-check.py [--base http://127.0.0.1:3000]
                                     [--external] [--workers 8] [--sample N]
"""
from __future__ import annotations

import concurrent.futures as cf
import json
import os
import re
import sys
import urllib.parse
import subprocess

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # web/
REPO = os.path.dirname(BASE_DIR)
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import urlmap  # noqa: E402

CONTENT = os.path.join(BASE_DIR, "src/content/site-content.json")
SERVED_CACHE = os.path.join(BASE_DIR, "src/content/served-paths.json")
PUBLIC = os.path.join(BASE_DIR, "public")
ASSET_STATUS = os.path.join(BASE_DIR, "src/content/asset-status.json")

HREF_RE = re.compile('(?:href|src)="([^"]+)"', re.I)


def arg(name: str, default: str) -> str:
    if name in sys.argv:
        return sys.argv[sys.argv.index(name) + 1]
    return default


def served_paths() -> set[str]:
    pages = json.load(open(CONTENT))["pages"]
    paths = set(pages)
    if os.path.exists(SERVED_CACHE):
        paths |= set(json.load(open(SERVED_CACHE)))
    app = os.path.join(BASE_DIR, "src/app")
    for root, dirs, files in os.walk(app):
        if "page.tsx" in files:
            rel = os.path.relpath(root, app).replace(os.sep, "/")
            if "[" in rel:
                # the catch-all contributes the content paths, listed above
                continue
            paths.add("/" + ("" if rel == "." else rel))
    return {urlmap.tidy(p) for p in paths}


def fetch(base: str, path: str, follow: bool = True) -> tuple[int, str, str]:
    url = base + urllib.parse.quote(path)
    cmd = ["curl", "-s", "-o", "-", "-w", "\n%{http_code} %{redirect_url}",
           "--max-time", "60"]
    if follow:
        cmd.append("-L")
    r = subprocess.run(cmd + [url], capture_output=True, text=True)
    body, _, tail = (r.stdout or "").rpartition("\n")
    parts = tail.split()
    code = int(parts[0]) if parts else 0
    loc = parts[1] if len(parts) > 1 else ""
    return code, loc, body


def main() -> None:
    base = arg("--base", "http://127.0.0.1:3000")
    workers = int(arg("--workers", "8"))
    sample = arg("--sample", "0")
    served = served_paths()
    assets = set()
    if os.path.exists(ASSET_STATUS):
        assets = {k for k, v in json.load(open(ASSET_STATUS)).items()
                  if k != "_documents" and v.get("status") in ("ok", "svg")}
    # svg files land under a different name than the .webp default
    for root, _dirs, files in os.walk(os.path.join(PUBLIC, "media")):
        for f in files:
            rel = os.path.relpath(os.path.join(root, f), PUBLIC)
            assets.add("/" + urllib.parse.unquote(rel.replace(os.sep, "/")))
    for root, _dirs, files in os.walk(os.path.join(PUBLIC, "docs")):
        for f in files:
            rel = os.path.relpath(os.path.join(root, f), PUBLIC)
            assets.add("/" + urllib.parse.unquote(rel.replace(os.sep, "/")))

    targets = sorted(served)
    if sample.isdigit() and int(sample) > 0:
        step = max(1, len(targets) // int(sample))
        targets = targets[::step][: int(sample)]
    print(f"checking {len(targets)} paths at {base}")

    found: dict[str, set[str]] = {}
    status: dict[str, int] = {}

    def work(path):
        code, loc, body = fetch(base, path, follow=False)
        hrefs = set()
        if code == 200:
            for m in HREF_RE.finditer(body):
                hrefs.add(urllib.parse.unquote(m.group(1)))
        return path, code, loc, hrefs

    with cf.ThreadPoolExecutor(max_workers=workers) as ex:
        for path, code, loc, hrefs in ex.map(work, targets):
            status[path] = code
            found[path] = hrefs

    bad_status = {p: c for p, c in status.items() if c != 200}
    broken: list[tuple[str, str, str]] = []
    external: set[str] = set()
    mails: set[str] = set()
    checked_assets: set[str] = set()

    for path, hrefs in found.items():
        for raw in hrefs:
            href = raw.replace("&amp;", "&")
            if href.startswith(("mailto:", "tel:", "javascript:", "data:")):
                mails.add(href)
                continue
            if href.startswith("#"):
                continue
            u = urllib.parse.urlparse(href)
            if u.scheme in ("http", "https"):
                if u.netloc.endswith(("manus.space", "manus.computer", "127.0.0.1", "localhost")) or (
                    u.netloc in ("", base.split("//", 1)[-1])
                ):
                    broken.append((path, href, "absolute URL to this site"))
                else:
                    external.add(href)
                continue
            p = u.path
            if not p:
                continue
            if p.startswith("/_next/image"):
                q = urllib.parse.parse_qs(u.query)
                p = urllib.parse.unquote((q.get("url") or [""])[0])
            if p.startswith("/favicon.ico"):
                continue  # generated by the framework from src/app/favicon.ico
            if p.startswith(("/media/", "/docs/", "/images/", "/brand/", "/fonts/")) or (
                p.startswith("/_next/")
            ):
                if p.startswith("/_next/") and not p.startswith("/_next/image"):
                    continue  # compiled chunk, not a repo file
                clean = urlmap.tidy(p) if p.startswith(("/media/", "/docs/")) else p
                checked_assets.add(clean)
                if clean not in assets and not os.path.exists(os.path.join(PUBLIC, clean.lstrip("/"))):
                    broken.append((path, raw, "asset not in public/"))
                continue
            norm = urlmap.tidy(p)
            target, _how = urlmap.resolve(norm, served)
            if target is None:
                broken.append((path, href, "no page at this URL"))
            elif target != norm:
                broken.append((path, href, f"should link to the canonical {target}"))

    # redirect rules must actually fire
    rules = json.load(open(os.path.join(BASE_DIR, "redirects.json")))
    redirect_fail = []
    for rule in rules:
        code, loc = fetch(base, rule["source"], follow=False)[:2]
        want = urlmap.tidy(rule["destination"])
        got = urlmap.tidy(urllib.parse.urlparse(loc).path) if loc else None
        if code != 301 or got != want:
            redirect_fail.append((rule["source"], code, loc or "-", want))

    print(f"paths checked {len(targets)}, pages rendering 200: "
          f"{len(targets) - len(bad_status)}")
    if bad_status:
        print(f"\nnon-200 responses ({len(bad_status)}):")
        for p, c in sorted(bad_status.items())[:25]:
            print(f"   {c} {p}")
    print(f"\ninternal links checked: "
          f"{sum(len(v) for v in found.values())}, distinct asset refs: "
          f"{len(checked_assets)}, external links: {len(external)}, mailto/tel: {len(mails)}")
    if broken:
        print(f"\nbroken references ({len(broken)}):")
        seen = set()
        for path, href, why in broken:
            key = (href, why)
            if key in seen:
                continue
            seen.add(key)
            print(f"   {path}\n      {href}\n      {why}")
    if redirect_fail:
        print(f"\nredirect rules that did not fire ({len(redirect_fail)}):")
        for row in redirect_fail[:20]:
            print("   ", row)
    ok = not bad_status and not broken and not redirect_fail
    print("\nRESULT:", "PASS" if ok else "FAIL")
    with open(os.path.join(REPO, "docs/audit/link-check.json"), "w") as fh:
        json.dump({
            "base": base,
            "paths": len(targets),
            "non_200": bad_status,
            "broken": [[p, h, w] for p, h, w in broken],
            "redirect_fail": redirect_fail,
            "external": sorted(external),
        }, fh, indent=1)
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
