#!/bin/bash
# Run Lighthouse against the production standalone server, one page per template.
cd /home/ubuntu/cuacoe
mkdir -p docs/audit/lighthouse
BASE=http://127.0.0.1:3100
run() {
  local key="$1" path="$2" mode="$3"
  local out="docs/audit/lighthouse/${key}-${mode}.json"
  local device=--preset=desktop
  if [ "$mode" = mobile ]; then device=--preset=perf; fi
  # Use mobile preset settings for mobile, desktop preset for desktop. Manual
  # width flags conflict with Lighthouse's settingEmulation during collection.
  if [ "$mode" = mobile ]; then device=--form-factor=mobile; fi
  npx --yes lighthouse "${BASE}${path}" \
    --only-categories=performance,accessibility,best-practices,seo \
    --output=json --output-path="$out" $device \
    --chrome-flags="--headless=new --no-sandbox --disable-dev-shm-usage --disable-gpu" \
    --quiet --max-wait-for-load=45000 > "/tmp/lh-${key}-${mode}.log" 2>&1
  if [ ! -s "$out" ]; then
    echo "FAILED $key $mode"; tail -5 "/tmp/lh-${key}-${mode}.log"; return
  fi
  node -e '
    const fs=require("fs");
    const j=JSON.parse(fs.readFileSync(process.argv[1],"utf8"));
    const c=j.categories, a=j.audits;
    console.log("%s  perf %s  a11y %s  bp %s  seo %s  | FCP %.1fs LCP %.1fs CLS %.3f TBT %.0fms",
      process.argv[2], Math.round(c.performance.score*100),
      Math.round(c.accessibility.score*100), Math.round(c["best-practices"].score*100),
      Math.round(c.seo.score*100), a["first-contentful-paint"].numericValue/1000,
      a["largest-contentful-paint"].numericValue/1000,
      a["cumulative-layout-shift"].numericValue,
      a["total-blocking-time"].numericValue);
  ' "$out" "$key-$mode"
}
for mode in mobile desktop; do
  run home              /                                                          "$mode"
  run program           /programs-admission/undergraduate-programs/mechanical-engineering-bme "$mode"
  run content           /explore-our-college/mission-vision                       "$mode"
  run story             /connect-contact/news-events/all-stories/cepc-faculty-secure-over-48-million-new-research-funding "$mode"
  run profile           /connect-contact/faculty-directory/arash-massoudieh       "$mode"
  run listing           /connect-contact/news-events                              "$mode"
  run directory         /connect-contact/faculty-directory                         "$mode"
  run certificate       /programs-admission/certificate-programs                   "$mode"
done
