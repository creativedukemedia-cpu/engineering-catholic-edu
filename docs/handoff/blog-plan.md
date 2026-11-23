# News and blog channel plan

College of Engineering, Physics, and Computing, The Catholic University of America.
Channel home: https://engineering.catholic.edu/connect-contact/news-events
Stories publish under `/connect-contact/news-events/all-stories/<slug>`, events under
`/connect-contact/news-events/all-events/<slug>`. Those prefixes are live and must not change.

## 1. Why a channel

The redesign has three goals: more qualified applications and Request Info leads, stronger research
visibility, and better organic and AI search presence. A running channel is the only content type that
serves all three at once. Admissions pages persuade a visitor who has already arrived; a story about a
student's research is the reason they arrive.

The college has material. The live archive holds 107 story paths, one event page and a past-events
list, and the six most recent, 2026-10-30 to 2026-11-10, cover a faculty conference appearance, a
doctoral student's society award, a corporate campus tour, an alumni gathering, $4.8 million in new
research funding, and a leadership award for graduate students. Five centers, six departmental research
areas, three student films and an evening and online graduate population sit behind that. The problem
is rhythm, not supply: publication is irregular, so neither a prospective student nor a crawler treats
the index as current.

No traffic figure is quoted here, and none is invented. Until GA4 and Search Console carry a recorded
baseline, this plan states cadence and measures, not projected lift. What a channel does, when the
rules in section 6 are followed, is give every department, center and program page fresh internal
links, dated pages that answer real questions, and a set of entities (people, labs, awards, sponsors)
that search engines and AI answer engines can attribute to the college.

## 2. Audiences and intent

| Audience | What they are deciding | What content answers it | Link to |
| --- | --- | --- | --- |
| Prospective undergraduates | Whether they will be known and busy here | Student voice posts, first-year design, capstone, films | `/programs-admission/undergraduate-programs`, `/explore-our-college/student-experience-special-programs` |
| Parents and guardians | Cost, safety, outcomes | Outcome explainers with the qualifier kept intact, scholarship news | `/programs-admission/scholarships-aid`, `/explore-our-college/career-development` |
| Graduate and international applicants | Format, evening and online options, research fit | Faculty research summaries, program spotlights, event recaps | `/programs-admission/graduate-programs`, `/programs-admission/how-apply-transfers` |
| Working professionals | Whether a certificate or MS fits a schedule and a career step | Alumni profiles, cohort news, certificate explainers | `/programs-admission/certificate-programs`, `/programs-admission/graduate-programs/engineering-management-ms` |
| Research partners and faculty recruits | What the college works on, and with whom | Center and lab features, funding news, hire announcements | `/explore-our-college/centers-institutes-research`, `/connect-contact/faculty-directory` |
| Alumni and donors | Whether their giving is visible | Impact stories, awards, giving news | `/connect-contact/alumni-giving` |
| Pre-college families | Whether a summer program suits a high-school student | Engineering New Frontiers Institute recaps | `/programs-admission/engineering-new-frontiers-institute` |

Every post carries one link into an admissions page. Request Info, at
`/programs-admission/request-information`, is the channel's primary conversion.

## 3. Content pillars

| Pillar | Definition | Grounded angles | Cadence |
| --- | --- | --- | --- |
| Research in the departments | Work in progress, told by the people doing it | The $4.8M funding story; the American Ceramic Society award to a physics doctoral student; one tile from each of the six department areas pages | 1 per month |
| Centers and institutes | Where the facilities and the groups live | CABRR rehabilitation work, IACS and the Space Weather Center, PHaSER, CAIR and AI ethics | 1 per quarter, rotating all five |
| Student voice | Students describing the college in their own words | Maria Erquiaga's double major, Bella Reyes balancing mechanical engineering and field hockey, Elijah Feret's reasons for Biomedical Engineering | 1 to 2 per term |
| Outcomes and careers | Where graduates go, with the claim kept whole | The Northrop Grumman BWI tour; the Vice Admiral Mel Williams award; employer destinations confirmed by career services | 1 per term |
| Mission, ethics and service | Catholic identity, stated plainly and once | AI degrees taught alongside the question of use; Grand Challenges Scholars Program; service in the city | 2 per year |
| Community and giving | People who came back | The alumni reconnecting story; the Meister Fellowship Seminar with Dr. Ian L. Pegg; donor-funded awards | 1 per quarter |

## 4. Editorial formats

| Format | Length | Who writes | Who approves | Indexable |
| --- | --- | --- | --- | --- |
| Evergreen explainer | 700 to 1,000 words | Writer from a subject interview | Department chair, then communications | Yes |
| News brief | 200 to 400 words | Communications from a release or notification | Communications | Yes |
| Faculty research summary | 500 to 800 words | Faculty draft, edited by the writer | Faculty member, then the research office for sponsor and funding wording | Yes |
| Student voice | 300 to 600 words | Writer interviews the student | Student with consent, then communications | Yes |
| Alumni profile | 600 to 900 words | Writer from an interview or alumni notes | Alumni and the alumni office | Yes |
| Event recap | 250 to 400 words | Writer or the organizer | Communications | Yes, with no future dates in the body |

An event page stays live after its date passes, because it records something true, and links to the
past-events index.

## 5. Production workflow

Roles: a part-time writer (production owner), a communications manager (editor), a department or center
contact (source and fact checker), the web team (publishing, schema, redirects).

1. Intake. Anyone may propose a story through one form or inbox. The writer logs a pillar, a subject
   owner and a target month.
2. Fit check. Confirm the story serves an audience in section 2 and name the page it links to. If
   neither is true, it goes back.
3. Draft and evidence. Interview, then write. Every statistic, proper name, funding figure, deadline,
   accreditation or ranking statement is checked against the university catalog or the primary office
   before the draft leaves this step. Anything unconfirmed stays in the draft carrying a literal
   [VERIFY] tag naming who can settle it, and the piece does not advance.
4. Review. The subject owner checks facts and names; communications checks tone, alt text and links; a
   student or alumni subject signs off on quotation and photo consent.
5. Publish and follow up. The web team publishes with correct dates and structured data and adds the
   internal links. The writer books a six-month review to update any dated claim.

## 6. SEO and AI answer engine rules

- One H1 per page, the headline itself, and one descriptive browser title carrying the distinguishing
  words, not just the college name.
- A plain summary paragraph near the top: who, what, and why it matters, in three sentences that stand
  alone, because answer engines quote the first block.
- Real dates, displayed and identical in `datePublished` and `dateModified`. Never backdate, never
  forward-date, never let a build stamp become the publication date.
- A named author byline where a person wrote it, the office where it is institutional.
- FAQ blocks only where a real question exists in the source material, one question and one answer.
  Do not manufacture questions to win rich results.
- Structured data: `NewsArticle` on every story, with `image` matching the displayed image and its alt
  text; `Event` with `startDate`, `endDate` and `location`; `Organization` sitewide, carrying Pangborn
  Hall 334, 620 Michigan Ave., NE, Washington, DC 20064, and the four official social profiles.
- Keep `/llms.txt` current. It states that every claim matches a page on this site and ends with a
  "Last reviewed" date. When a program, center or outcome claim changes, update that file in the same
  edit and refresh the date. A story contradicting llms.txt is a defect.
- Never fabricate a date or a statistic. Never call content evergreen when it carries a dated claim, an
  enrollment number or a funding total; those go on the review calendar.
- No new URL patterns and no silent changes. If a story path must move, the web team adds the 301 first.

## 7. Cadence and calendar

Assumes one part-time writer at six to eight hours a week, review time counted. This is achievable, not
aspirational: 24 to 26 pieces a year, about two a month in term and one in the slower summer months.

| Month | Focus | Output | Effort (writer hours) |
| --- | --- | --- | --- |
| September | Term start, student voice, first research feature | 3 | 14 |
| October | Research, Senior Design Day or homecoming alumni piece | 2 | 12 |
| November | Graduate and evening programs, one center feature | 3 | 15 |
| December | Year in review, quiet production | 1 | 6 |
| January | Application season, evergreen explainers on outcomes and applying | 3 | 14 |
| February | Research, faculty profiles ahead of viewbooks | 2 | 12 |
| March | Mission and service pillar, spring events | 2 | 12 |
| April | Accepted students, student voice, scholarships | 3 | 14 |
| May | Capstone, graduation, center features | 2 | 12 |
| June | Pre-college and Engineering New Frontiers Institute | 1 | 6 |
| July | Summer research, light | 1 | 6 |
| August | Fall preview, evergreen refresh, redirects check | 2 | 10 |
| Total | | 25 | 123 |

Two slots a year stay open for breaking news, an award or a funding announcement; let a scheduled piece
slip rather than adding hours.

## 8. Measures

Review monthly against the previous three months. No baseline exists yet, so recording one is task one.

| Measure | Where the number comes from | Goal it serves |
| --- | --- | --- |
| Request Info submissions, and sessions that read a story before submitting | CRM, with GA4 as a cross-check | Applications and leads |
| Engaged sessions on `/connect-contact/news-events` and on story pages | GA4 | Applications and leads |
| Clicks, impressions, queries, pages indexed for story paths | Search Console | Organic and AI search presence |
| Share of new stories appearing in an AI answer engine response | Manual quarterly spot check, logged in a sheet | AI search presence |
| Referrals and mentions on the four official accounts | Platform analytics | Research visibility |
| Faculty and center sessions from an internal link added in a story | GA4 path exploration | Research visibility |
| On-time publication, and drafts held at step 3 for a missing check | The intake log | All three goals |

## 9. What not to do

- Do not chase trend topics the college cannot speak to from real work.
- Do not publish rankings, accreditation, partnership or enrollment claims that step 3 has not cleared.
- Do not use stock photography or generated people and present them as CUA students or campus.
- Do not publish an image without alt text, or alt text that claims more than the frame shows.
- Do not change a live URL quietly, and do not let a renamed path 404.
- Do not republish a press release with no student, faculty or outcome angle.
- Do not let the channel go quiet for a term, then post five stories in a week.
