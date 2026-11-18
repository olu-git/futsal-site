# Misfits availability from 19 November 2026

Applied in production transaction `1813` on 18 November 2026. The organiser instructed that every 18 November fixture stay unchanged while future fixtures could change. The exact future-only guarded fallback was rehearsed locally before publication because admin browser access was unavailable.

Misfits cannot play at 21:00 on either night from 19 November onward. General allowed kickoff times are 19:00, 19:40 and 20:20. Wednesday matches against Umoja Stars must remain at 21:00; the future 3 March 2027 meeting is unchanged. Completed games and all eight 18 November fixtures are unchanged, including Misfits–Wildcats at 21:00 Court 2 and Ibiza–MTS FC at 19:40 Court 1.

Both Misfits profiles advanced from version 2 to 3. Three required allowed-time rows per night and explicit dated/Umoja-exception notes record the current rule; earlier any-time notes are retained as superseded historical context. Team UUIDs/readable IDs, kits and all other profiles/preferences remain unchanged. The existing generic required-time validator can warn on the intentional Umoja exception; it is recorded in the private note and independently checked in scheduling. No new schema or permanent special-case code was added.

## Published future slot swaps

Each other listed game takes the former Misfits slot. Opponents, dates, rounds and home/away never change.

| Date | Night | Misfits game | New slot | Other game moving to 21:00 |
|---|---|---|---|---|
| 13 January 2027 | Wednesday | Ibiza–Misfits | 20:20, Court 2 | Xaywan–King ADL, Court 2 |
| 1 March 2027 | Monday | Misfits–Nasaji FC | 19:40, Court 2 | Wildcats–King ADL, Court 2 |
| 19 April 2027 | Monday | Misfits–Jaghori FC | 19:40, Court 1 | Nasaji FC–Blue Dragons, Court 1 |
| 10 May 2027 | Monday | Wildcats–Misfits | 19:40, Court 1 | Blue Dragons–Xaywan, Court 2 |
| 19 May 2027 | Wednesday | Misfits–Rinnai | 19:40, Court 2 | Ibiza–Goldlink Up, Court 1 |

All existing hard kickoff/court rules and Wednesday Goldlink/Buckle separation remain satisfied, with no newly introduced avoid-time conflicts. Pair counts, home/away distribution, calendars and standings are unchanged.

## Verification and release state

The exact narrowed transaction passed fresh disposable PostgreSQL with all repository migrations, 427 published fixtures and 64 results, real foreign-key/version/audit triggers, preserved earlier notes, full post-write rollback and safe repeat rejection. Anonymous readback verified all 427 fixtures, all 64 results, all other profiles and the exact ten slot changes; all eight 18 November fixtures are byte-for-byte unchanged in the read model. Private-profile readback confirmed the effective date, protected night and six required-time rows. Actual application standings/results remain identical on both nights. Snapshot validation/freshness, production build and diff checks passed.

The SQL file is an **applied receipt; do not rerun it**. Live Supabase data is updated and the matching fallback is prepared locally. Commit/push and Pages deployment are separate release steps. Temporary scripts, exports, logs and disposable databases remain outside Git.

