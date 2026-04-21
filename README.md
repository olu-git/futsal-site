# Futsal League

Modern league site for Monday and Wednesday futsal competitions, with fixtures, results, standings, and rule pages.

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- Lucide React
- Local JSON data files (no database)

## Getting Started

### Prerequisites

- Node.js 20+ (Node 24 recommended)

### Install

```bash
cd futsal_site
npm install
```

### Run Locally

```bash
npm run dev
```

Open `http://localhost:3000`.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
src/
  app/
    page.tsx
    monday-night/page.tsx
    wednesday-night/page.tsx
    rules/page.tsx
  components/
    LeagueTable.tsx
    MatchCard.tsx
    RoundAccordion.tsx
  data/
    teams.json
    monday-fixtures.json
    wednesday-fixtures.json
    standings-adjustments.json
  lib/
    data.ts
    standings.ts
    validate.ts
    types.ts
```

## Data Model

League data is maintained in `src/data/*.json` and imported via `src/lib/data.ts`.

- `teams.json`: team master list
- `monday-fixtures.json`: Monday schedule/results
- `wednesday-fixtures.json`: Wednesday schedule/results
- `standings-adjustments.json`: admin-only standings adjustments (no opponent-side fixture stats)

## Editing Teams, Fixtures, Results

### Teams

Edit `src/data/teams.json`.

Each team includes:

```json
{ "id": "wed-afg", "name": "AFG", "night": "wednesday", "division": "A" }
```

### Fixtures

Edit `src/data/monday-fixtures.json` or `src/data/wednesday-fixtures.json`.

Fixture shape:

```json
{
  "id": "wed-r10-1",
  "night": "wednesday",
  "division": "A",
  "round": 10,
  "date": "2026-05-27",
  "time": "19:00",
  "court": 1,
  "homeTeam": "wed-afg",
  "awayTeam": "wed-pops",
  "status": "scheduled"
}
```

To record a completed game, add `homeScore`, `awayScore`, and set `status` to `"completed"`.

### Standings Adjustments

Edit `src/data/standings-adjustments.json` for administrative outcomes (for example, entry-round adjustments).  
These affect standings directly in `src/lib/standings.ts` and do not create synthetic opponent fixture records.

## Schedule Rules and Validation

Validation lives in `src/lib/validate.ts`.

Hard constraints currently include:

- `wed-rinnai` never at `19:00`
- `mon-blue-dragons` never at `19:00`
- No games on configured public holidays
- Night/day consistency (Monday on Monday, Wednesday on Wednesday)
- No court collision per time slot
- No team double-booked in the same slot
- `buckle-city` and `goldlink-up` not simultaneous unless head-to-head
- Wednesday expansion checks (round 4 onward):
- 6 fixtures per round
- all Wednesday teams represented each round
- exactly 2 fixtures at each slot (`19:00`, `19:40`, `20:20`)
- Monday expansion checks (round 4 onward):
- 5 fixtures per round
- all Monday teams represented each round
- Wednesday pair-frequency checks:
- pairs above 3 meetings are hard-fail
- one 3-meeting pair is tolerated as a soft exception
- multiple 3-meeting pairs are soft-flagged with feasibility guidance
- Monday pair-frequency and split checks:
- pairs above 3 meetings are hard-fail
- 3-meeting Monday pairs are soft-flagged as constrained exceptions
- second-half split and once-only pairings are soft-flagged for review

Soft warning:

- `Samen` at `19:00` (allowed but flagged as avoidable)

## Standings Logic

Standings are calculated from:

1. Completed fixtures
2. Admin adjustments

Points:

- Win = 3
- Draw = 1
- Loss = 0

Sort order:

1. Points desc
2. Goal difference desc
3. Goals for desc
4. Team name asc

## Competition Snapshot

- Monday Night: 10 teams, Division A, 18 rounds
- Wednesday Night: 12 teams, Division A, 22 rounds
- Division B: placeholder only

## Finalized Exception Notes (Current Season)

- Monday is finalized at 18 rounds with no extra matchdays and no same-night double headers.
- Monday late-entry handling is applied for `mon-buckle-city` and `mon-tolaka-group` via `standings-adjustments.json` plus the completed head-to-head fixture.
- Wednesday late-entry handling is applied for `wed-moza-mama` and `wed-hazara-united` via `standings-adjustments.json`.
- Because completed fixtures are locked, some pair-frequency exceptions remain and are intentionally surfaced by validator soft warnings.
