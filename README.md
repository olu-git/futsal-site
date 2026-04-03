# Futsal League

A polished, modern futsal competition website with league tables, fixtures, results, and automatic standings calculation.

## Tech Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Framer Motion** (subtle animations)
- **Lucide React** (icons)
- Local data files (no external database)

## Getting Started

### Prerequisites

- Node.js 20+ (Node 24 recommended)

### Install

```bash
cd futsal-league
npm install
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
src/
  app/
    page.tsx              # Home page
    layout.tsx            # Root layout (nav + footer)
    globals.css           # Global styles & Tailwind theme
    monday-night/
      page.tsx            # Monday Night page
    wednesday-night/
      page.tsx            # Wednesday Night page
  components/
    Navbar.tsx            # Sticky navigation
    Footer.tsx            # Footer
    LeagueTable.tsx       # League standings table
    MatchCard.tsx         # Match result/fixture card
    NightCard.tsx         # Competition night link card
    SectionHeading.tsx    # Reusable section header
  lib/
    data.ts              # All teams, fixtures, and helper functions
    standings.ts         # Standings calculation from results
    types.ts             # TypeScript types
    utils.ts             # Formatting utilities
```

## How to Edit Data

All data lives in **`src/lib/data.ts`**.

### Edit Teams

Find the `teams` array at the top. Each team has:

```ts
{ id: "mon-afg", name: "AFG", night: "monday", division: "A" }
```

- `id` must be unique and match fixture references
- `name` is the display name
- `night` is `"monday"` or `"wednesday"`
- `division` is `"A"` or `"B"`

### Edit Fixtures & Results

Find the `fixtures` array. Each fixture looks like:

```ts
{
  id: "mon-r1-1",
  night: "monday",
  division: "A",
  round: 1,
  date: "2026-03-23",
  time: "19:00",
  court: 1,
  homeTeam: "mon-wildcats",
  awayTeam: "mon-afg",
  homeScore: 9,        // Add when complete
  awayScore: 7,        // Add when complete
  status: "completed"  // Change from "scheduled"
}
```

**To enter a result:**

1. Find the fixture
2. Add `homeScore` and `awayScore`
3. Change `status` from `"scheduled"` to `"completed"`
4. The standings table will update automatically

**To add a new fixture:**

Add a new entry to the `fixtures` array with status `"scheduled"`.

### Fixture Schedule

- **Monday:** Court 1 (7pm, 7:40pm, 8:20pm) + Court 2 (7:40pm) = 4 games/night
- **Wednesday:** Court 1 (7pm, 7:40pm, 8:20pm) + Court 2 (7:40pm, 8:20pm) = 5 games/night
- **Constraint:** Goldlink Up is scheduled at 7pm or 8:20pm on Monday (never at 7:40pm when 2 games overlap)

## How Standings Work

Standings are calculated automatically in `src/lib/standings.ts` from completed fixtures:

- **Win** = 3 points
- **Draw** = 1 point
- **Loss** = 0 points

**Sorting order:**

1. Points (descending)
2. Goal difference (descending)
3. Goals for (descending)
4. Team name (alphabetical)

Change a result in `data.ts` and the table updates on next page load.

## Pages

| Page | URL | Description |
|------|-----|-------------|
| Home | `/` | Hero, night links, standings preview, results, fixtures, about |
| Monday Night | `/monday-night` | Full table, teams, results, fixtures, Div B coming soon |
| Wednesday Night | `/wednesday-night` | Full table, teams, results, fixtures, Div B coming soon |

## Competition Details

- **Monday Night:** 8 teams, Division A, 14-round season
- **Wednesday Night:** 10 teams, Division A, 18-round season
- **Division B:** Coming soon for both nights

## Design

- Dark theme: black background with red (#DC2626) and white accents
- Mobile responsive
- Subtle animations via Framer Motion
- Premium sports aesthetic
