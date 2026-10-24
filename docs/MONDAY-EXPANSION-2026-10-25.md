# Monday expansion — 25 October 2026

Status: prepared and independently reviewed locally; **not applied or published**. The organiser authorised committing and pushing the reviewed preparation on 25 October; this does not authorise the separate pending production SQL/publication. Wednesday remains unchanged.

## Confirmed organiser decisions

Monday Division A, `2026 - Season 2`, edition `62ce7ec9-459e-4acf-bec5-c6734a3199ef` expands from 14 to 16 teams. Every team finishes with 30 games; every pair meets twice. This supersedes the previous Monday one/three-meeting exceptions and 26-game target.

| Incoming team | Identity | Confirmed inherited record |
| --- | --- | --- |
| Jaghori FC, green `#1F9D55` | New UUID `0ad2ddbd-80e1-40f5-bb80-2e756a3d9419`, readable ID `mon-jaghori-fc` | Declan's Delinquents: 6–1 over Bunyip and 7–9 against Wildcats; P2/W1/L1, GF13/GA10, 3 points, form W–L |
| Buckle City, retained black kit | Existing Monday UUID `997291fd-33ff-40cc-9fd8-be732f6e07ca`, `mon-buckle-city` | Gay Guys: 7–7 against Salvos and 4–12 against Nasaji; P2/D1/L1, GF11/GA19, 1 point, form D–L |

Each inheritance was explicitly confirmed for these teams/night/season. Keep Declan and Gay Guys withdrawn/ineligible with their identities and audit history retained. Only four existing fixture team references transfer: result UUIDs, revisions, scores, dates, courts and times remain unchanged. No standings adjustments or invented results are needed. Imole retains its already-inherited 0–5 loss to Blue Dragons and its separate 3–11 result against Ghazni.

No additional Jaghori availability restriction has been supplied; the organiser specifically requested the 21:00 match below. Record any subsequent availability change through Teams. Buckle retains its existing profile and Goldlink Up/Buckle City must not kick off simultaneously unless playing each other.

## Next Monday — 26 October 2026

| Time | Court | Home | Away |
| --- | --- | --- | --- |
| 19:00 | 1 | Wildcats | Kroos Kontrol |
| 19:00 | 2 | Black Magic | Salvos |
| 19:40 | 1 | King ADL | AFG |
| 19:40 | 2 | Goldlink Up | Bunyip |
| 20:20 | 1 | Nasaji FC | Ghazni United |
| 20:20 | 2 | Misfits | Xaywan |
| 21:00 | 1 | Imole United | Blue Dragons |
| **21:00** | **2** | **Jaghori FC** | **Buckle City** |

The first seven assignments are exact production-baseline matches, not newly rearranged games.

## Reviewed schedule

- 240 active fixtures: 16 preserved played games, with the four approved identity references transferred, and 224 future games.
- 30 rounds, one game per team each round, 30 games/team, 15 home/15 away, maximum home/away streak three.
- All 120 opponent pairs meet exactly twice with opposite home allocation. All future court/time slots are unique.
- Bunyip: 19:00/19:40 only. Blue Dragons: no 19:00. Goldlink/Buckle separation passes. Fresh production scheduling preferences were read and compared; all current soft preferences are also met, with zero future soft-time exceptions.
- Existing close rematches are retained to preserve Round 3: AFG–King ADL in R2/R3 and Blue Dragons–Imole in R1/R3. All other meetings involving future fixtures have at least four rounds between them. Once-per-half separation is a goal, not a guarantee after retaining actual results and Round 3.
- Final regular-season night: **31 May 2027**. Christmas break, Labour Day and Easter Monday exclusions remain. **2 November 2026 remains provisional**; cancellation would require an explicit later calendar revision. No finals dates added.

The reviewed admin import performs **50 updates and 56 creates**, with **118 future fixtures untouched**. Previously cancelled fixtures remain cancelled historical records. IDs assigned to cancelled source slots in the planning schedule are placeholders for comparison only; `operation: create` omits those IDs and normal publication generates fresh UUIDs. Compare published assignments by round/date/time/court/home/away rather than asserting those planning IDs became live fixture IDs.

## Files and execution order

1. After explicit approval of the alternate production operation, apply `docs/drafts/monday-jaghori-buckle-roster-2026-10-25.sql` once. The existing active-season admin editor cannot create Jaghori or restore Buckle's standings eligibility. This narrowly guarded proposal adds no permissions or schema. It rejects changed team/fixture/result baselines, duplicate identities, pending Monday change sets or unexpected standings adjustments; verifies derived standings; preserves unrelated rows and existing audit records. A successful repeat is deliberately rejected, not reapplied.
2. In the existing admin Fixtures workflow, select Monday/current edition and import `docs/drafts/monday-expansion-import-2026-10-25.json`. Save, validate, review warnings and submit for review. Check the exact 106 operations against `monday-expansion-schedule-2026-10-25.json` and the current fixture versions before publication. Obtain/retain explicit approval for publication; do not bypass the normal fixture RPC with direct fixture SQL.
3. Publish that reviewed change set once. Verify the resulting 240 assignments, 16 active/eligible teams, all team/pair totals and availability, the eight Round 3 matches, both inherited records and unchanged Imole/Wednesday/archive results. Never reimport a published receipt. If baseline guards fail, inspect current changes and re-review rather than weakening them.
4. Regenerate and validate the public fallback from authoritative Supabase after the approved production changes. Commit/push or dispatch a refresh only when authorised; a manual refresh can itself commit/push and deploy. Verify both hydrated live data and the raw deployed fallback after Pages succeeds.

`monday-expansion-2026-10-25.json` records identities/approved transfers and operation totals. `monday-expansion-schedule-2026-10-25.json` is the complete public scheduling review artifact; it contains no private profile export. Temporary tools, raw read-only baselines and disposable verification output remain ignored under `node_modules/.cache/fis-oct25/`.

## Validation evidence and limits

- GPT-6.1 Sol/medium reviewer independently checked the SQL scope, guards, complete schedule and exact import projection; no required corrections found.
- GPT-6.1 Sol/medium tester independently compared all 224 future assignments and expected update versions against a fresh production read-only baseline. Six regression tests cover identity transfers, Imole preservation, Round 3, hard constraints, pair caps and exact import reconstruction.
- Disposable PGlite with all repository migrations and fresh Monday data: guarded SQL commit and exact rollback pass; stale-score and committed-repeat rejection pass. Existing fixture RPC create/import/submit/review/atomic publish and rollback pass. Actual local published assignments exactly match all 240 planned assignments. All result rows, played fixture details, unrelated fixtures and prior audit records remain intact; audit appends remain enabled.
- The local rehearsal used the existing archived/other-night baseline as preservation sentinels, not a claim of a fresh full production clone. The production SQL itself hashes current protected tables inside its transaction. Hosted execution and post-publication readback are still outstanding.
- Full application suite: **229/229 tests pass**; lint, nonincremental TypeScript, production static build and whitespace checks pass. No public UI code changes or production browser verification are claimed for this preparation.
- Production data, fallback, Git history and hosting remain unchanged. No new permanent permission fix is included for the separately documented Results publication issue.
