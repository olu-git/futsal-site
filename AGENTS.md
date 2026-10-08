<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes - APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Futsal Indoor Soccer

## Brand and interface

- Reuse the square-edged FIS blue/red/cream system in `src/app/globals.css`. Preserve the approved logos, brand-pack assets and font files; do not redraw or distort them without approval.
- Use `Press Start 2P` for major section headings (for example FIS TV, KNOCKOUT STAGES, THE REPLAY and THE GALLERY) and compact retro labels. Use `Unbounded` for supporting headings (such as WATCH THE FINAL), body text and longer copy. Choose brand blue or accessible brand red for headings by section context; use cream/white on blue backgrounds. Keep contrast, focus states, tables and phone layouts readable.

## Architecture and source of truth

- Next.js 16 exports `out/` via `next.config.ts`; `.github/workflows/deploy.yml` deploys `master` to GitHub Pages. No production Node server is required.
- Supabase is authoritative for published regular-season teams, fixtures, results and adjustments, plus authenticated admin workflows. Browser access uses a publishable key, grants and RLS; mutations use existing admin checks and reviewed RPCs. Never use a secret/service-role key in the site.
- Public regular-season pages read Supabase after hydration and fall back to generated `src/data/public-competition-snapshot.json`. Older team/fixture/adjustment JSON remains for reconciliation, not live regular-season reads. Standings derive from published results and adjustments; never hand-code them.
- `src/data/season-2026-s1.json` and `src/lib/finals.ts` own current finals and grading history. Show only knockout rounds publicly. Keep Monday and Wednesday separate; preserve stable team/match IDs, completed results and feeder relationships. Do not import finals or grading into Supabase.

## Checks and operations

- Inspect the current branch, worktree and implementation before editing; preserve unrelated work. Use admin Results, Fixtures, Teams, Standing Adjustments and Seasons for regular-season changes. Do not invent competition records or rerun an installed migration or the completed import for a routine edit.
- For code/UI changes run `npm test`, `npm run lint`, `npx tsc --noEmit --incremental false`, `npm run build` and `git diff --check`. Run `npm run finals:check` for finals or bracket changes; `npm run snapshot:validate` and `npm run snapshot:check` for fallback changes; `npm run season:import:validate` and `npm run season:import:check` for legacy source/import-artifact changes. Snapshot check reads published Supabase data; import checks do not execute SQL. On PowerShell use `npm.cmd` if `npm.ps1` is blocked.
- Start with [README.md](README.md) and [docs/PROJECT-HANDOFF.md](docs/PROJECT-HANDOFF.md). Use [supabase/README.md](supabase/README.md) and [docs/PUBLIC-COMPETITION-DATA.md](docs/PUBLIC-COMPETITION-DATA.md) for data operations, [docs/PUBLIC-SNAPSHOT-AUTOMATION.md](docs/PUBLIC-SNAPSHOT-AUTOMATION.md) for refresh activation, and [docs/NEW-WEBSITE-ROLLBACK.md](docs/NEW-WEBSITE-ROLLBACK.md) for deployment recovery. Consult a migration runbook only for its operation.
- Do not commit credentials, local environment files or build output. Do not change Supabase, hosting, DNS or the permanent rollback tag without an explicit request.
