/**
 * Unauthenticated readiness probe for the container platform.
 *
 * The publish pipeline polls this path until it returns 2xx, so it must stay
 * dependency-free: no database, no outbound calls, no cookies, nothing that can
 * fail for a reason unrelated to the process being up. If the site ever gains
 * a database, keep this endpoint liveness-only and put readiness elsewhere.
 *
 * No route segment config here: `dynamic` is rejected under cacheComponents,
 * and a static response is fine for a probe that never changes.
*/
export function GET() {
  return Response.json({ status: "ok" }, { headers: { "Cache-Control": "no-store" } });
}
