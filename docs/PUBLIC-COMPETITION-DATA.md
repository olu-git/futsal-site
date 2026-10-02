# Public Competition Data

The static export includes the generated `src/data/public-competition-snapshot.json` regular-season snapshot. After hydration, Home, Monday Night, and Wednesday Night request the latest published regular-season data from Supabase using the public publishable key and existing RLS. The page uses the snapshot if the request fails or takes longer than eight seconds. A small notice appears only in that fallback state.

The loader selects the latest published competition season for each night and division, reads teams, regular-season fixtures, published result versions, and published standing adjustments, then maps them into the existing competition service and standings calculation. Draft fixtures, draft results, and pending-review results are explicitly excluded even when an administrator is signed in. The team status controls the active hero count; `standings_eligible` controls ladder inclusion, so inactive Dwell FC remains in Wednesday history and the ladder.

Grading and knockout history still comes exclusively from `src/data/season-2026-s1.json`. Home, Monday, and Wednesday publicly render only the knockout bracket; grading results remain recorded in JSON. This layer does not read or write finals in Supabase. It does not perform any database mutation.

The generated JSON snapshot is static at build time. The snapshot refresh automation is implemented but must be reviewed and configured before activation; see `docs/PUBLIC-SNAPSHOT-AUTOMATION.md`. New-season teams, fixtures and adjustments may use their stable Supabase UUIDs when no legacy ID exists. A new season may have scheduled fixtures but no results yet. The historical source JSON remains unchanged for import reconciliation and finals validation.
