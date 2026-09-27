# Public Competition Data

The static export includes the last published regular-season JSON snapshot. After hydration, Home, Monday Night, and Wednesday Night request the latest published regular-season data from Supabase using the public publishable key and existing RLS. The page uses the snapshot if the request fails or takes longer than eight seconds. A small notice appears only in that fallback state.

The loader selects the latest published competition season for each night and division, reads teams, regular-season fixtures, published result versions, and published standing adjustments, then maps them into the existing competition service and standings calculation. Draft fixtures, draft results, and pending-review results are explicitly excluded even when an administrator is signed in. The team status controls the active hero count; `standings_eligible` controls ladder inclusion, so inactive Dwell FC remains in Wednesday history and the ladder.

Grading and knockout content still comes exclusively from `src/data/season-2026-s1.json`. This layer does not read or write finals in Supabase. It does not perform any database mutation.

The JSON snapshot is static at build time. After this public data layer is reviewed, the next backend task is to generate and verify a fresh published JSON snapshot from Supabase before each release. That job should preserve the same Monday/Wednesday separation and exclude drafts and finals. Snapshot regeneration is not implemented here.
