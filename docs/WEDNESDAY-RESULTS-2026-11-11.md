# Wednesday 11 November results

Published on 12 November 2026 in production transaction `1773`, following explicit organiser approval of the tested results-only SQL exception because the admin browser connection was unavailable.

| Time | Court | Home | Score | Away |
|---|---|---|---|---|
| 19:00 | 1 | Buckle City | 7–5 | Dream Team |
| 19:00 | 2 | MTS FC | 5–7 | Wildcats |
| 19:40 | 1 | King ADL | 4–3 | AFG |
| 19:40 | 2 | Rinnai | 5–8 | Ibiza |
| 20:20 | 1 | Ghazni United | 7–1 | Xaywan |
| 20:20 | 2 | Pops | 6–7 | Kuq E Zi |
| 21:00 | 1 | Goldlink Up | 7–7 | Misfits |
| 21:00 | 2 | Umoja Stars | 3–8 | Kawsar FC |

Eight revision-1 published results were added. No fixture, team profile, preference, permission or existing-result records changed. Previously approved Dream Team kit/court rules and Kabul Commandos name remain intact.

The exact SQL passed fresh disposable PostgreSQL testing using all repository migrations, real result-validation/audit triggers, 480 fixtures and 48 previous results. Forced post-write failure rolled back fully; safe repeat execution rejected without writes.

Anonymous production readback verified all eight scores, every fixture and team profile, and all prior results. The refreshed application standings match the pre-publication preview exactly: all 16 active Wednesday teams have three games played, with correct points and goals. Upcoming Wednesday fixtures advance to 18 November. Snapshot validation/freshness checks, production build and diff checks passed.

`docs/drafts/wednesday-results-2026-11-11.sql` is an applied receipt, not a migration; do not rerun it. The generated fallback is ready locally; Git commit/push and Pages deployment are separate release steps. Temporary scripts, local exports, logs and disposable databases are outside Git.
