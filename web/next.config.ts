import type { NextConfig } from "next";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * The live site's URL inventory, mapped by scripts/build-redirect-map.py.
 * Read as JSON rather than imported, so this config never depends on the app's
 * "@/" alias or on TypeScript being compiled before Next loads it.
 */
function redirectRules(): { source: string; destination: string }[] {
  try {
    const raw = readFileSync(join(process.cwd(), "redirects.json"), "utf8");
    return JSON.parse(raw);
  } catch {
    // A fresh checkout without the generated map must still build. Regenerate
    // with `python3 scripts/build-redirect-map.py`; a missing file means the
    // 301s are absent, which is a launch blocker, not a silent default.
    console.warn("[next.config] redirects.json missing, shipping without 301 rules");
    return [];
  }
}

/**
 * Mirrors the same rule in src/lib/site.ts. Duplicated on purpose:
 * next.config.ts is loaded before the app's TypeScript and its "@/" alias, and
 * a config that imports application source is a known way to break a build.
 * Explicit NOINDEX wins; otherwise any origin that is not the production
 * domain is treated as a mirror and refused by crawlers.
 */
function isNoindexBuild(): boolean {
  const flag = process.env.NOINDEX;
  if (flag === "true") return true;
  if (flag === "false") return false;
  const origin = (
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://engineering.catholic.edu"
  ).replace(/\/$/, "");
  return origin !== "https://engineering.catholic.edu";
}

const nextConfig: NextConfig = {
  /* config options here */
  // The sandbox forwards the preview from this host. Without it, dev assets
  // such as the live-reload endpoint are blocked as cross-origin. The
  // wildcards cover the Manus preview and published hosts, whose names are not
  // known until the project exists.
  allowedDevOrigins: [
    "3000-ivkh1nq9lgeadtgk1k2zh-d0158350.us5.manus.computer",
    "*.manus.computer",
    "*.manus.space",
  ],
  images: {
    qualities: [75, 80],
  },
  cacheComponents: true,
  partialPrefetching: true,
  // The container runs the traced server from .next/standalone. The Dockerfile
  // copies public/ and .next/static beside it.
  output: "standalone",
  async redirects() {
    return redirectRules().map((rule) => ({ ...rule, permanent: true }));
  },
  async headers() {
    if (!isNoindexBuild()) return [];
    // Staging mirrors: belt and braces beside the meta robots tag and the
    // disallow-everything robots.txt, so a preview URL cannot be indexed as a
    // duplicate of engineering.catholic.edu.
    return [
      {
        source: "/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
