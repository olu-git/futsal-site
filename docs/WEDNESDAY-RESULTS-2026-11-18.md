# Wednesday 18 November 2026 results

Published with explicit approval of the guarded SQL exception because the admin browser host was unavailable. Transaction: **1817**. The SQL file is an applied receipt, not a migration; do not rerun it.

| Time | Court | Home | Score | Away |
|---|---|---|---|---|
| 19:00 | 1 | Dream Team | 4-6 | Kawsar FC |
| 19:00 | 2 | Pops | 9-2 | Buckle City |
| 19:40 | 1 | Ibiza | 11-2 | MTS FC |
| 19:40 | 2 | AFG | 0-5 | Xaywan |
| 20:20 | 1 | Rinnai | 2-10 | Ghazni United |
| 20:20 | 2 | Kuq E Zi | 6-7 | Goldlink Up |
| 21:00 | 1 | King ADL | 0-5 | Umoja Stars |
| 21:00 | 2 | Misfits | 7-11 | Wildcats |

Only AFG forfeited (home forfeit). King ADL's 0-5 is an ordinary result. All eight pairings already matched the published schedule, so no fixture changes were required. The previously protected 18 November assignments remain unchanged.

## Verification

- Fresh disposable PostgreSQL rehearsal using repository migrations: eight exact published results, AFG forfeit, existing data preservation, forced rollback and repeat-execution rejection passed.
- Anonymous production readback: all eight results match; all 427 published fixtures, team profiles and 64 prior published results remain unchanged. Transaction guards also preserved all pre-existing result and audit rows, including historical records outside this season.
- Actual application standings match the pre-publication preview: all 16 Wednesday teams have four played, with exact points and goals increments. Next Wednesday round is 25 November.
- Generated local fallback matches published Supabase data; snapshot validation/check, production build and whitespace checks passed. No application or permissions changes.

The organiser authorised commit and push of this receipt and the refreshed fallback. Live Supabase reads contain the new results; deployment of the refreshed fallback is handled separately by the Pages workflow triggered by the push.
