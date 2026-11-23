#!/usr/bin/env python3
"""Map an old engineering.catholic.edu URL onto the page this build serves.

The old site grew four URL generations: /academics/..., /about-us/...,
/research-and-faculty/..., /news-and-events/YYYY/MM/slug.html, plus Drupal
aliases that were never removed when pages moved. Copy in the harvested pages
links to all of them, and the redirect map has to understand them too.

Rules, in order, and nothing else:
  1. structure   the five shapes that every duplicate is found by (index.html,
                 /homepage, a School of Engineering segment, a program copied
                 under a department, an /academics/ segment)
  2. prefix      a section renamed wholesale (about-us to connect-contact,
                 news-and-events to the story listing, and so on)
  3. token       the last path segment, normalised, matches one served page's
                 last segment well enough to be the same page, and nothing else
                 matches as well

A candidate is only returned if it is actually served. Anything else is
reported as unresolved so the caller can decide. Nothing is ever guessed at.

Usage: python3 scripts/urlmap.py --test <path> [<path> ...]
"""
from __future__ import annotations

import re
import sys

# Segments that carry no meaning when comparing two URLs.
STOP = {
    "index", "html", "htm", "page", "the", "a", "an", "and", "or", "of", "for",
    "to", "in", "on", "with", "new", "our", "us", "cua", "edu",
}

# Word pairs that name the same thing in an old URL and a new one. These are
# section names in the catalogue, not content.
SYNONYM = {
    "masters": "ms",
    "master": "ms",
    "doctoral": "phd",
    "bachelor": "bs",
    "certificates": "certificate",
    "minors": "minor",
}

STRUCTURE = [
    (re.compile(r"^/homepage$"), "/"),
    (re.compile(r"^(?P<base>.+)/index\.html$"), "\\g<base>/"),
    (re.compile(r"^(?P<base>.+?)[-/]school-of-engineering[-/](?P<rest>.*)$"),
     "\\g<base>/\\g<rest>"),
    (re.compile(r"^/explore-our-college/departments/[^/]+/academics-programs/"
                r"(?P<rest>.+)$"), "/programs-admission/\\g<rest>"),
    (re.compile(r"^(?P<base>.+?)/academics/(?P<rest>.+)$"), "/\\g<rest>"),
]

PREFIX = [
    (re.compile(r"^/about-us/?$"), "/connect-contact/"),
    (re.compile(r"^/about-us/"), "/connect-contact/"),
    (re.compile(r"^/news-and-events/\d{4}/\d{2}/"), "/connect-contact/news-events/all-stories/"),
    (re.compile(r"^/news-and-events/"), "/connect-contact/news-events/"),
    (re.compile(r"^/research-and-faculty/faculty-profiles/[^/]+/"),
     "/connect-contact/faculty-directory/"),
    (re.compile(r"^/research-and-faculty/research-institutes-and-centers/"),
     "/explore-our-college/centers-institutes-research/"),
    (re.compile(r"^/research-and-faculty/"), "/explore-our-college/"),
    (re.compile(r"^/academics/graduate-programs/"), "/programs-admission/graduate-programs/"),
    (re.compile(r"^/academics/undergraduate-programs/"), "/programs-admission/undergraduate-programs/"),
    (re.compile(r"^/academics/graduate/"), "/programs-admission/graduate-programs/"),
    (re.compile(r"^/academics/undergraduate/"), "/programs-admission/undergraduate-programs/"),
    (re.compile(r"^/academics/minors/"), "/programs-admission/undergraduate-programs/minors/"),
    (re.compile(r"^/academics/certificate"), "/programs-admission/certificate-programs/"),
    (re.compile(r"^/academics/"), "/programs-admission/"),
    (re.compile(r"^/student-life/"), "/current-students/"),
    (re.compile(r"^/future-students/"), "/programs-admission/"),
]


def tidy(path: str) -> str:
    p = (path or "/").split("#")[0].split("?")[0]
    p = re.sub(r"/{2,}", "/", p)
    return p.rstrip("/") or "/"


def tokens(segment: str) -> set[str]:
    out = set()
    for raw in re.split(r"[^a-z0-9]+", segment.lower()):
        if not raw or raw in STOP or len(raw) < 2:
            continue
        out.add(SYNONYM.get(raw, raw))
    return out


def structural(path: str) -> str | None:
    """One pass of the five shape rules; None when the path is not a legacy shape."""
    p = tidy(path)
    for pat, tpl in STRUCTURE:
        if pat.search(p):
            out = pat.sub(tpl, p)
            out = re.sub(r"/{2,}", "/", out).rstrip("/") or "/"
            if out != p:
                return out
    return None


def prefixed(path: str) -> str | None:
    p = tidy(path)
    for pat, repl in PREFIX:
        m = pat.search(p)
        if m:
            out = repl + p[m.end():]
            out = re.sub(r"/{2,}", "/", out).rstrip("/") or "/"
            if out != p:
                return out
    return None


def tail_match(path: str, served) -> tuple[str | None, str]:
    """Match the end of an old URL against the end of a served page.

    Old program and story URLs put the identifying words across two segments
    (data-analytics/masters) while the new alias keeps them in one
    (data-analytics-ms). A candidate wins when every word in its own last
    segment appears in the tail of the old URL, so the new page says nothing
    the old link did not. Two candidates at the same score is a tie, and a tie
    is left unresolved rather than guessed.
    """
    p = tidy(path)
    segs = [s for s in p.strip("/").split("/") if s]
    q = set()
    for s in segs[-2:]:
        q |= tokens(s)
    parents = {t for s in segs[:-2] for t in tokens(s)}
    if len(q) < 2:
        return None, "tail is too generic to match safely"
    scored: list[tuple[float, int, str]] = []
    for cand in served:
        cseg = [s for s in cand.strip("/").split("/") if s]
        if not cseg:
            continue
        c = tokens(cseg[-1])
        if len(c) < 2 or not c <= q:
            continue
        score = len(c) / len(q)
        if score < 0.5:
            continue
        affinity = len(parents & {t for s in cseg[:-1] for t in tokens(s)})
        scored.append((round(score, 6) + affinity * 0.01, -len(cseg), cand))
    if not scored:
        return None, "no served page is named by the tail"
    scored.sort(reverse=True)
    if len(scored) > 1 and abs(scored[1][0] - scored[0][0]) < 1e-9:
        return None, (f"{len(scored)} pages match equally: "
                      + ", ".join(s[2] for s in scored[:4]))
    return scored[0][2], "tail"


def rewrites(path: str) -> list[tuple[str, str]]:
    """Every shape this URL could be, in the order the rules say to try them."""
    p = tidy(path)
    out: list[tuple[str, str]] = [(p, "as written")]
    s = structural(p)
    if s:
        out.append((s, "structure"))
        after = prefixed(s)
        if after:
            out.append((after, "structure+prefix"))
    pp = prefixed(p)
    if pp:
        out.append((pp, "prefix"))
    seen: set[str] = set()
    uniq = []
    for cand, how in out:
        if cand not in seen:
            seen.add(cand)
            uniq.append((cand, how))
    return uniq


def resolve(path: str, served) -> tuple[str | None, str]:
    """Return (served target, how it was decided) or (None, why it failed)."""
    shapes = rewrites(path)
    for cand, how in shapes:
        if cand in served:
            return cand, how
    why = "tail is too generic to match safely"
    for cand, how in shapes:
        t, reason = tail_match(cand, served)
        if t:
            return t, f"{how}+tail"
        why = reason
    return None, why


if __name__ == "__main__":
    import json

    args = sys.argv[1:]
    data = json.load(open("/home/ubuntu/cuacoe/web/src/content/site-content.json"))
    served = set(data["pages"])
    if not args or args[0] != "--test":
        print(__doc__)
        sys.exit(0)
    for legacy in args[1:]:
        target, how = resolve(legacy, served)
        print(f"{legacy}\n    -> {target} [{how}]")
