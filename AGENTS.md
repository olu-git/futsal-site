<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes - APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Futsal Indoor Soccer Project Context

## Product and audience

- This is the public website for Futsal Indoor Soccer (FIS), an adult social and competitive futsal league at Endeavour Hills Leisure Centre in Melbourne. Players must be at least 16 years old.
- Monday Night and Wednesday Night are separate competitions. Keep their teams, fixtures, results, standings, adjustments, and finals data separate.
- The product should feel inclusive, organised, credible, and easy to scan for players checking schedules or results on a phone.
- Core public areas are Home, Monday Night, Wednesday Night, Rules, Contact, About Us, Privacy, and Terms. Registration currently starts in `RegisterMenu` and continues as an enquiry on `/contact`; there is no standalone registration route.

## Brand and interface

- The visual direction draws on 1990s football culture, especially FIFA 98, Championship Manager, and France 98, while remaining a clear modern sports interface.
- Treat `src/app/globals.css` as the source of truth for visual tokens. The established palette is FIS blue (`--fis-blue`), red (`--fis-red`), cream (`--fis-cream`), and their existing supporting tokens.
- `Unbounded` is the primary display/body family. Use `Press Start 2P` only for small retro accents, labels, or metadata where it remains readable.
- Reuse the approved logo in `public/logos/FIS-01-Primary-Black.svg`; do not redraw, distort, recolour, or alter its proportions without explicit approval.
- Preserve strong contrast, visible focus states, responsive layouts, and readable tables. Match existing square-edged sports UI patterns and reuse components before adding new visual treatments.

## Architecture and source of truth

- The app uses Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, Framer Motion, and Lucide. It is statically exported by `next.config.ts` and deployed to GitHub Pages from `master` via `.github/workflows/deploy.yml`.
- Keep the current static, low-cost architecture unless the user explicitly approves an infrastructure change. Do not add a database, paid service, backend, or dependency merely for convenience.
- Competition data lives in `src/data/`: `teams.json`, the Monday and Wednesday fixture files, `standings-adjustments.json`, and `season-2026-s1.json` for finals. `src/lib/data.ts`, `standings.ts`, and `finals.ts` are the shared access and calculation layers.
- Standings are derived from completed fixtures plus explicit administrative adjustments. Never hand-code a displayed ladder, fabricate results, or duplicate competition data inside a page component.
- Preserve stable team IDs, completed fixtures, scores, and historical records. A future fixture involving an inactive team is hidden, while completed history remains visible.
- Knockout matches are separate from regular-season fixtures and standings. Use `npm run finals:check` after finals edits and `npm run finals:freeze -- monday|wednesday|all` only when final seeds are ready to be recalculated.
- Current season data has 16 active teams on each night, with regular-season data through Monday round 24 and Wednesday round 26. Verify the JSON rather than assuming this snapshot remains current.

## Fixtures, results, and registration

- Update match data through the relevant fixture JSON: use the existing team IDs, set scores, and set `status` to `completed`. Preserve the published date, time, court, opponent, and history unless the user explicitly changes them.
- Apply fixture constraints from `src/lib/validate.ts` and the current competition instructions. Do not invent a score, opponent, time preference, eligibility rule, or standings adjustment.
- Monday and Wednesday pages must continue to provide fixtures, results, standings, and finals information with consistent components and formatting.
- Registration is an enquiry, not a payment or confirmed place. Preserve two primary pathways: team registration and individual player registration. The existing future-competition enquiry may remain as a secondary pathway.
- If the registration experience is expanded, use an unselected pathway control and reveal only relevant fields. Capture common contact/competition details, team-specific or individual-specific details, fill-in interest, and an explicit 16+ acknowledgement. Keep the primary action labelled `SUBMIT` and explain that FIS will follow up.
- Never expose secrets or private administration data in client code, fixtures, logs, or documentation. Treat public form integration identifiers according to the provider's documented security model.

## Working approach

- Inspect the current implementation before editing. Reuse existing components, tokens, types, and data helpers; keep changes targeted and preserve unrelated behaviour and content.
- Do not alter deployment, hosting, domains, analytics, form providers, or infrastructure unless explicitly requested.
- The long-term direction is admin-managed results with review and publish controls so routine updates do not require source commits. This is not implemented yet; do not claim otherwise or introduce paid infrastructure without approval.
- For ordinary code changes, run `npm run lint` and `npm run build`. Run `npm run finals:check` when finals data or bracket logic changes. Resolve failures caused by the change before handing off.
- Never commit generated build output, credentials, or local environment files.

## Decision hierarchy

1. The user's current explicit instruction.
2. The current implementation and live data.
3. This `AGENTS.md` guidance.
4. Older README text, comments, screenshots, or stale planning documents.

If a material conflict remains after checking the current code and data, flag it and ask before changing user-facing behaviour or competition records.
