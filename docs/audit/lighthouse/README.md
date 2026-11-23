# Lighthouse results

Measured against the rebuilt production Next.js standalone build on local Chromium, Lighthouse 13.6.0. One representative route per template was tested at mobile and desktop form factors. Results are environment-dependent snapshots, not a guarantee on a university production host. The required 90+ performance target is not met by all mobile samples.

| Template | Mobile P/A/BP/SEO | Desktop P/A/BP/SEO | Mobile LCP |
| --- | ---: | ---: | ---: |
| certificate | 97 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 0.89 s |
| content | 86 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 3.79 s |
| directory | 98 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 0.90 s |
| home | 85 / 100 / 100 / 100 | 98 / 100 / 100 / 100 | 3.99 s |
| listing | 99 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 0.91 s |
| profile | 89 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 3.27 s |
| program | 99 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 1.00 s |
| story | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 0.91 s |

Legend: P = performance, A = accessibility, BP = best practices, SEO = search. Full JSON audit files are retained beside this table. Mobile performance below 90: home, content page, and profile page. Accessibility, best practices, and SEO each scored 100 across all eight tested templates on both form factors.
