#!/usr/bin/env bash
# Capture one page per template at 1280 and 360 for the design review.
#   scripts/shot-templates.sh [base] [outdir]
set -u
BASE="${1:-http://127.0.0.1:3000}"
OUT="${2:-../docs/previews}"
mkdir -p "$OUT"

# name:url pairs, one per template the build actually ships
declare -a PAGES=(
  "home:/"
  "content-page:/explore-our-college/mission-vision"
  "department:/explore-our-college/departments/department-mechanical-engineering"
  "center:/explore-our-college/centers-institutes-research/center-applied-biomechanics-and-rehabilitation-research-cabrr"
  "program:/programs-admission/graduate-programs/computer-science-ms"
  "program-undergrad:/programs-admission/undergraduate-programs/artificial-intelligence-bs"
  "program-index:/programs-admission/undergraduate-programs"
  "certificate-index:/programs-admission/certificate-programs"
  "admission-hub:/programs-admission"
  "request-info:/programs-admission/request-information"
  "story:/connect-contact/news-events/all-stories/cepc-faculty-secure-over-48-million-new-research-funding"
  "news-index:/connect-contact/news-events"
  "profile:/connect-contact/faculty-directory/arash-massoudieh"
  "directory:/connect-contact/faculty-directory"
  "contact:/connect-contact/contact-us"
  "student:/current-students/incoming-students"
)

fail=0
for entry in "${PAGES[@]}"; do
  name="${entry%%:*}"
  path="${entry#*:}"
  for w in 1280 768 360; do
    h=$(( w == 1280 ? 900 : w == 768 ? 900 : 740 ))
    out="$OUT/${name}-${w}.png"
    if node scripts/cdp-shot.mjs --url "${BASE}${path}" --out "$out" \
        --width "$w" --height "$h" --wait 2200 --full 1 >"$OUT/${name}-${w}.log" 2>&1; then
      size=$(stat -c %s "$out")
      echo "ok   ${name}-${w}.png ${size}"
    else
      echo "FAIL ${name}-${w}"; tail -3 "$OUT/${name}-${w}.log"; fail=$((fail+1))
    fi
  done
done
echo "screenshots done, failures: ${fail}"
exit $fail
