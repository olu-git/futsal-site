# November venue closure

Organiser instruction, 31 October 2026: no FIS games on Monday 2 or Wednesday
4 November. The leisure centre cancelled bookings after flooring was damaged
during its basketball-ring upgrade. The supplied email's Wednesday date is
mistyped; 4 November is Wednesday. Do not publish the private email screenshot.

The shared red notice runs from 31 October through 8 November, Melbourne time.
Home shows one centred notice and links to both schedules, without upcoming games.
Current competition pages show the notice above future fixtures. At Monday
9 November midnight, all three pages automatically return to normal, including
open tabs. Return nights are 9 and 11 November.

## Date-only schedule revision

- Monday: 216 unplayed fixtures move one playing week; final date 7 June 2027.
- Wednesday: 224 unplayed fixtures move one playing week; final date 2 June 2027.
- Preserve Christmas, Labour Day and Easter Monday exclusions. Do not add finals.
- Preserve all 480 fixture IDs, opponents, rounds, kickoff times, courts and results.
- Both nights retain 16 teams, 240 matches, 30 matches per team and two meetings
  per pair. Team availability and Goldlink/Buckle separation remain unchanged.

The two `*-venue-closure-2026-11-changes.json` files are normal admin imports.
Use those through Fixtures when available. Do not also apply the SQL fallback.

## Production application - 31 October 2026

The organiser explicitly approved the guarded SQL fallback because the browser
access host was unavailable. Applied individually, in order:

1. `drafts/venue-closure-fixture-dates-2026-11.sql`: 440 date-only postponements.
   Baseline digest matched; final digest and unchanged result-record check passed.
   Existing audit logging recorded 440 fixture updates in transaction 1722.
2. `drafts/venue-closure-season-end-2026-11.sql`: shared season end extended to
   7 June 2027 after checking Monday 7 June and Wednesday 2 June as final dates.
   Existing audit logging recorded one season update in transaction 1723.

Do not import the alternative JSON change sets now: the SQL fallback already
applied their date changes. They remain as review evidence, not pending work.
No migrations or permissions changed.

Production readback confirmed 240 fixtures per night, no games on 2/4 November,
and next nights 9/11 November. Full-record checksums matched before/after for
result versions, past fixtures, teams and standings adjustments. The anonymous
snapshot matches production and its diff contains exactly the 440 approved date
changes; all opponents, rounds, kickoff times, courts, scores and archives match.
Both nights retain 16 teams playing once each night, 30 games each, and exactly
two meetings per pair, with no slot collisions or calendar-exclusion violations.

The fallback refresh is released through the normal commit/push/Pages workflow.

## Local verification

187 tests, lint, TypeScript and static build passed. Responsive browser checks:
27 page/date/width combinations at 320, 768 and 1440 pixels, with API reads blocked
to force the fallback; no overflow or page errors. Verified one notice on Home,
future games below each competition notice, correct return dates and automatic
midnight expiry on all three pages.

Both SQL proposals passed a new disposable PostgreSQL rehearsal using all 480
fixture rows, the existing version trigger, simulated audit logging and unique
court slots. Verified 440 date-only updates, full rollback after an injected
failure, unchanged result records, correct audit count and safe repeat execution.
This is local verification, not a hosted production execution or full schema test.
