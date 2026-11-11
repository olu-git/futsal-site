# Dream Team availability, kit and courts; Kabul Commandos rename

Applied on 11 November 2026, production transaction `1770`, following the organiser's explicit approval of the guarded SQL exception to the admin workflow.

- Dream Team retains UUID `bf6a7c6e-83e0-4d6d-8354-9a89ab679eb3` and readable ID `wed-dream-team`. Kit is green (`#00A651`). All 28 unplayed games use Court 1, including tonight's Buckle City–Dream Team game at 19:00. Fifteen same-time court swaps changed 30 fixture rows; opponents, dates, kickoff times, home/away and played assignments remain unchanged.
- Existing 19:00/19:40 availability against other opponents is retained. The only 21:00 games are against Umoja Stars (2 December 2026 and 21 April 2027). Current court and kickoff instructions are recorded in the private team note. The existing profile schema has no structured court-availability field, so future schedule edits must preserve the recorded Court 1 rule explicitly.
- Kabul Commandos is the official name of the former temporary Hakim's Team, preserving UUID `f0402dd7-5aa2-4a6b-98ee-6d8663c6a76c`, readable ID `mon-hakims-team`, white kit, availability, results and standings. There is no new identity, inheritance or record swap with Buckle City. Public fixtures, results, standings and admin screens use the stored official name. Historical SQL receipts, audit records and stable internal identifiers retain historical wording rather than being rewritten.
- Both team profiles advanced from version 1 to 2. All other teams and all existing kickoff-preference rows remain unchanged. Existing notes/history remain preserved, with the current Dream instructions added and Kabul's current private note renamed.

## Verification

The exact transaction passed on fresh disposable PostgreSQL with all repository migrations, 480 fixtures, 48 results and real foreign keys, uniqueness, version and audit triggers. Forced post-write failure rolled back completely; repeat execution rejected safely against the changed baseline. Existing fixtures, results and audit rows are protected by transaction assertions.

Anonymous production readback verified every fixture and team profile: exactly 30 court-only changes, two intended profile changes, all 48 results unchanged, and all 28 unplayed Dream games on Court 1 at their permitted kickoff times. The public fallback was generated from production and passed snapshot validation and freshness checks. Local build and release status are reported separately; Supabase data is already updated.

`docs/drafts/dream-kabul-2026-11-11.sql` is an applied receipt, not a migration. Do not rerun it. Temporary scripts, baseline exports, logs and disposable databases are outside Git.
