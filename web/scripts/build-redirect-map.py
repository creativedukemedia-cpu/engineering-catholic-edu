#!/usr/bin/env python3
"""Generate the 301 redirect map from the live URL inventory.

Input
  ../docs/redirects/live-urls.txt   every path in engineering.catholic.edu/sitemap.xml
  src/app/sitemap.ts                the routes this build actually serves

Output
  src/lib/redirects.ts              read by next.config.ts, so the 301s ship in the app
  ../docs/redirects/redirect-map.csv the auditable table for the client

Rules, in order. Every decision is recorded in the CSV with its reason, and
nothing is guessed: a path that cannot be classified is reported for a human.

  1. A path this build serves is identity. No rule, status "served".
  2. A duplicated legacy structure (department-prefixed programs, an
     /academics/ segment, an index.html suffix, /homepage, or old
     school-of-engineering naming) is rewritten to the canonical new path.
  3. A path this build does not serve yet falls back to the nearest served
     ancestor, so nothing in the old sitemap 404s during migration. These are
     status "fallback" and are the rebuild queue.
  4. A path with nothing to fall back to is status "pending" and must be
     decided by a human before launch.
"""

from __future__ import annotations

import csv
import json
import re
from pathlib import Path

WEB = Path(__file__).resolve().parent.parent
ROOT = WEB.parent
LIVE = ROOT / "docs" / "redirects" / "live-urls.txt"
OUT_TS = WEB / "src" / "lib" / "redirects.ts"
OUT_CSV = ROOT / "docs" / "redirects" / "redirect-map.csv"
# Machine-readable copy for next.config.ts, which reads the map with fs rather
# than importing app source, so the config loader never has to resolve "@/".
OUT_JSON = WEB / "redirects.json"

# Program families that moved under /programs-admission/.
PROGRAM_GROUPS = (
    "undergraduate-programs",
    "graduate-programs",
    "certificate-programs",
)


def served_routes() -> set[str]:
    """Page routes this build owns, from the app router tree."""
    routes = set()
    for page in (WEB / "src" / "app").rglob("page.tsx"):
        rel = page.parent.relative_to(WEB / "src" / "app")
        routes.add("/" + (str(rel) if str(rel) != "." else "") if str(rel) != "." else "/")
    hand = {r.replace("\\", "/") for r in routes if "[" not in r}
    # The content route owns every harvested production path, so those pages
    # count as served too.
    content = (WEB / "src" / "content" / "site-content.json")
    if content.exists():
        pages = json.loads(content.read_text())["pages"]
        reserved = hand & set(pages)
        hand |= {p for p in pages if p not in reserved}
    return hand


def live_paths() -> list[str]:
    text = LIVE.read_text()
    return [
        line.strip()
        for line in text.splitlines()
        if line.strip().startswith("/") or line.strip() == "/"
    ]


SERVED_CACHE: set[str] = set()


def is_index(path: str) -> bool:
    """True when this exact path is a page in this build."""
    if path in SERVED_CACHE:
        return True
    return (WEB / "src" / "app" / path.strip("/") / "page.tsx").exists() or path == "/"


def canonicalize(path: str) -> tuple[str | None, str]:
    """Rewrite a legacy shape to its canonical successor. (target, reason)."""
    if path == "/homepage":
        return "/", "duplicate of the homepage in the old sitemap"

    if path.endswith("/index.html"):
        base = path[: -len("index.html")]
        return base or "/", "static index.html suffix removed"

    if "school-of-engineering" in path:
        fixed = re.sub(r"[-/]?school-of-engineering[-/]?", "/", path)
        fixed = "/" + "/".join(part for part in fixed.split("/") if part)
        return fixed, "renamed from School of Engineering to the College"

    # Department-prefixed duplicates: /explore-our-college/departments/<dept>/
    # academics-programs/<group>/<slug> -> /programs-admission/<group>/<slug>
    m = re.match(
        r"^/explore-our-college/departments/[^/]+/academics-programs/(?P<rest>.+)$", path
    )
    if m:
        return "/programs-admission/" + m.group("rest"), (
            "program path duplicated under a department"
        )

    m = re.match(r"^(?P<prefix>.+)/academics/(?P<rest>.+)$", path)
    if m and "/academics/" in path:
        rest = m.group("rest")
        return "/" + rest, "legacy /academics/ segment dropped"

    return None, ""


def nearest_ancestor(path: str) -> str | None:
    parts = [p for p in path.split("/") if p]
    while parts:
        parts.pop()
        candidate = "/" + "/".join(parts)
        if is_index(candidate):
            return candidate
        if candidate in ("/", ""):
            return "/" if is_index("/") else None
    return None


def target_for(path: str, served: set[str]) -> tuple[str, str, str]:
    """(target, status, reason) for one live path."""
    if path in served:
        return path, "served", "this build serves the same path"

    canonical, reason = canonicalize(path)
    if canonical:
        if canonical in served:
            return canonical, "rewrite", reason
        fallback = nearest_ancestor(canonical) or nearest_ancestor(path)
        if fallback:
            return (
                fallback,
                "fallback",
                f"{reason}; target {canonical} not built yet, sending to {fallback}",
            )
        return None, "pending", f"{reason}; no canonical target exists yet"

    fallback = nearest_ancestor(path)
    if fallback:
        return (
            fallback,
            "fallback",
            "page not rebuilt yet, sending to the nearest served section",
        )
    return None, "pending", "no rebuilt page and no served ancestor"


def main() -> None:
    served = served_routes()
    globals()["SERVED_CACHE"] = served
    paths = live_paths()
    rows = []
    for p in paths:
        target, status, reason = target_for(p, served)
        rows.append(
            {
                "live_path": p,
                "action": "identity" if status == "served" else "301",
                "target": "" if status == "served" else (target or ""),
                "status": status,
                "reason": reason,
            }
        )

    rules = []
    for r in rows:
        if r["action"] != "301" or not r["target"]:
            continue
        rules.append({"source": r["live_path"], "destination": r["target"]})

    # No trailing-slash rules are generated: with trailingSlash unset, Next
    # already issues the canonical non-slash redirect itself, and duplicating it
    # here only created rules that looked like self-redirects.

    # Invariants. A redirect that points at itself loops forever, and a redirect
    # whose target is not a page in this build becomes a chain into a 404. Both
    # are build failures, not warnings, because they ship silently otherwise.
    bad_self = [r for r in rules if r["source"] == r["destination"]]
    if bad_self:
        raise SystemExit("self-redirect rules: %s" % bad_self[:5])
    dangling = [r for r in rules if r["destination"] not in served]
    if dangling:
        raise SystemExit("rules targeting an unserved path: %s" % dangling[:5])

    OUT_CSV.parent.mkdir(parents=True, exist_ok=True)
    with OUT_CSV.open("w", newline="") as fh:
        writer = csv.DictWriter(fh, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)

    counts = {}
    for r in rows:
        counts[r["status"]] = counts.get(r["status"], 0) + 1

    body = "\n".join(
        '  { source: "%s", destination: "%s" },' % (r["source"], r["destination"])
        for r in rules
    )
    OUT_JSON.write_text(json.dumps(rules, indent=2) + "\n")

    OUT_TS.write_text(
        """/**
 * Generated by scripts/build-redirect-map.py. Do not edit by hand.
 *
 * Every path in the live engineering.catholic.edu sitemap, mapped to its
 * successor in this build. Source: docs/redirects/live-urls.txt
 * (retrieved 2026-11-23), audited in docs/redirects/redirect-map.csv.
 *
 * Counts: %(served)d served by this build, %(rewrite)d canonical rewrites,
 * %(fallback)d temporary section fallbacks for pages not rebuilt yet,
 * %(pending)d unresolved. Applied as permanent 301s in next.config.ts.
 */

export type RedirectRule = {
  source: string;
  destination: string;
};

export const redirectRules: RedirectRule[] = [
%(body)s
];
"""
        % {"body": body, **{k: counts.get(k, 0) for k in ("served", "rewrite", "fallback", "pending")}}
    )

    print("redirects.json:", len(rules), "rules")
    print("live paths: %d | served: %d | 301 rules: %d" % (len(paths), counts.get("served", 0), len(rules)))
    print("statuses:", counts)
    pending = [r for r in rows if r["status"] == "pending"]
    for r in pending[:20]:
        print("PENDING", r["live_path"], "-", r["reason"])
    if len(pending) > 20:
        print("... %d more pending" % (len(pending) - 20))


if __name__ == "__main__":
    main()
