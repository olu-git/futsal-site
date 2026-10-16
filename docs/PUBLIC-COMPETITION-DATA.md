# Public Competition Data

The static export includes the generated `src/data/public-competition-snapshot.json` regular-season snapshot. After hydration, Home, Monday Night, and Wednesday Night request the latest published regular-season data from Supabase using the public publishable key and existing RLS. The page uses the snapshot if the request fails or takes longer than eight seconds. A small notice appears only in that fallback state.

The loader selects the latest published competition season for each night and division, reads teams, regular-season fixtures, published result versions, and published standing adjustments, then maps them into the existing competition service and standings calculation. Draft fixtures, draft results, and pending-review results are explicitly excluded even when an administrator is signed in. The team status controls the active hero count; `standings_eligible` controls ladder inclusion, so inactive Dwell FC remains in Wednesday history and the ladder.

Grading and knockout history still comes exclusively from `src/data/season-2026-s1.json`. Home, Monday, and Wednesday publicly render only the knockout bracket; grading results remain recorded in JSON. This layer does not read or write finals in Supabase. It does not perform any database mutation.

Upcoming regular-season fixtures derive each team's last five W/D/L outcomes in the shared competition service, from completed published scores, including official published forfeit scores. No form is stored in Supabase or the snapshot. Both the live loader and snapshot builder select one edition per night/division; teams use edition-scoped IDs (snapshot IDs are remapped consistently), never name-based history joins. Thus a new edition starts without previous-season form. Draft/review/superseded results, withdrawn cancelled fixtures, unscored/abandoned games, byes, grading and knockout games do not contribute. Badge order is oldest to newest, with missing-history question marks first. Results, standings and brackets do not render badges.

The generated JSON snapshot is static at build time. The snapshot refresh automation is implemented but must be reviewed and configured before activation; see `docs/PUBLIC-SNAPSHOT-AUTOMATION.md`. New-season teams, fixtures and adjustments may use their stable Supabase UUIDs when no legacy ID exists. A new season may have scheduled fixtures but no results yet. The historical source JSON remains unchanged for import reconciliation and finals validation.

## Team replacement and inheritance

Organiser policy, 16 October 2026: when one team replaces another in a league, propose that the incoming team inherits the outgoing team's record and place in that competition. **Always obtain explicit organiser confirmation for each replacement before applying any replacement writes.** This is an operating rule, not an automatic database or application action. Read-only inspection and a local proposal may proceed while confirmation is pending; silence and approval of a different replacement do not authorize a transfer.

The confirmation must identify the outgoing and incoming teams, night, division and season, and state which record and fixtures will transfer. For example: "Should [incoming team] replace [outgoing team] in [night/division/season], inheriting its existing results, wins/draws/losses, goals, points and applicable standing adjustments, form history, and remaining fixtures?" Present any exceptions or unresolved adjustments before asking. If inheritance is declined or limited, record that decision and implement only the approved scope.

After confirmation:

- Preserve the existing fixture/result IDs, scores, dates and audit history. Attribute the approved record to the incoming team through reviewed, guarded operations; do not create duplicate results, fabricate matches or apply the same points twice.
- Preserve distinct team identities. Create a fresh UUID/readable ID for a genuinely new team when requested; do not rename or recycle an unrelated team's identity. Keep the outgoing identity and its audit history.
- Include relevant published standing adjustments in the confirmed scope and use their supported correction mechanism. Do not silently discard deductions or bonuses, or duplicate an adjustment to force a position.
- Derive played, wins, draws, losses, goals for/against, goal difference, points and recent form from the inherited data. Table position follows the normal ranking rules; it is not a separately stored or hardcoded value. Normal changes in results and tie-breaks can change position.
- Transfer the agreed future fixture place without unnecessary rescheduling. Do not automatically copy kits, availability restrictions or private profile details: confirm those separately where not already instructed.
- Keep other nights, divisions, seasons and archived knockout records unchanged unless explicitly included in the organiser's confirmation. A replacement in one competition is not a global identity/history merge.
- Verify standings, form, fixture totals, unchanged other teams/results and live/fallback consistency. Record the confirmation and applied evidence in the handoff; follow the normal release process for the generated fallback.

Imole United's inheritance of Monday Buckle City's Round 1 0-5 loss was explicitly confirmed by the organiser. That decision does not authorize inheritance for a future replacement. See `docs/OCTOBER-16-IMOLE-REPLACEMENT.md` for its applied receipt.
