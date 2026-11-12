# Wednesday 18 November fixture update

Applied on 13 November 2026 in production transaction `1779`. The organiser explicitly authorised the two requested games, necessary repairs to preserve two meetings per pair, commit and push. The admin browser connection was unavailable, so the exact guarded fallback was rehearsed on disposable PostgreSQL before use.

| Time | Court | Home | Away |
|---|---|---|---|
| 19:00 | 1 | Dream Team | Kawsar FC |
| 19:00 | 2 | Pops | Buckle City |
| 19:40 | 1 | Ibiza | MTS FC |
| 19:40 | 2 | AFG | Xaywan |
| 20:20 | 1 | Rinnai | Ghazni United |
| 20:20 | 2 | Kuq E Zi | Goldlink Up |
| 21:00 | 1 | King ADL | Umoja Stars |
| 21:00 | 2 | Misfits | Wildcats |

The repair changes nine pairings, including the two requested games, plus two home/away-only orientations: 11 fixture rows across rounds 4, 9, 10, 11, 21 and 22. All details are in `docs/drafts/wednesday-fixtures-2026-11-18-review.json`. The pairing solver found an optimal nine-pairing repair under the enforced availability, fixed round-4 slots and rematch-spacing constraints; orientation balancing then preserves one home meeting against each opponent. This does not claim a global minimum under different constraints.

## Preserved constraints and verification

- Wednesday retains 16 teams, 240 games and 30 games per team. Every one of the 120 pairs meets exactly twice, once at home each. Every team plays once per round, with no slot collisions.
- All 24 played Wednesday results, all 32 Monday results, every existing fixture ID/date/kickoff/court, all team profiles, and existing audit history are preserved. Exactly the 11 reviewed future fixtures receive one schedule-version increment each. Monday is unchanged.
- Umoja stays at 21:00; AFG and Kuq avoid 21:00 except against Umoja; Rinnai avoids 19:00; Dream Team stays on Court 1 and at 19:00/19:40 except against Umoja. Goldlink/Buckle separation is preserved. No new soft kickoff-preference exceptions are introduced.
- Home/away remains 15 each, maximum streak four. No pair's rematch gap drops below its previous gap capped at four rounds. Calendar and final regular-season date (2 June 2027) remain unchanged.
- The exact guarded transaction passed fresh disposable PostgreSQL with all migrations and real foreign-key, version and audit triggers. Forced post-write failure fully rolled back; repeat execution safely rejected without writes.
- Anonymous readback verified every one of the 480 current fixtures and all 56 existing results against the reviewed baseline and plan. Snapshot validation/freshness, production build and diff checks passed. Temporary scripts, solver files, local exports, logs and disposable databases remain outside Git.

The SQL is an **applied receipt**, not a migration or another import step. Do not rerun it. Supabase publication, the matching fallback commit and Pages deployment are separate release stages.
