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

## Pending production action

The browser access host is unavailable. No postponement has been applied to
production. The postponement preview was tested locally; the released fallback remains aligned with the currently published production schedule until approval and application.

Explicit approval was requested for this guarded fallback, in order:

1. `drafts/venue-closure-fixture-dates-2026-11.sql`: exact baseline digest guard,
   locks, rejection of published results, latest-date-first updates to avoid slot
   collisions, post-update digest, unchanged result-record check, safe repeat.
   Existing fixture version and audit triggers stay enabled.
2. `drafts/venue-closure-season-end-2026-11.sql`: update only the shared season end
   from 31 May to 7 June after checking both final fixture dates. The active-season
   editor has no end-date action. Safe repeat supported.

After approval/application, anonymously regenerate and check the snapshot; inspect
the diff; commit only this release; push and verify Pages and the deployed notices.

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
