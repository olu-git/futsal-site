import { Team, Fixture, CompetitionNight } from "./types";
import teamsData from "@/data/teams.json";
import mondayFixturesData from "@/data/monday-fixtures.json";
import wednesdayFixturesData from "@/data/wednesday-fixtures.json";

// ============================================================
// Core data — edit the JSON files in src/data/ directly:
//   teams.json              → team names and IDs
//   monday-fixtures.json    → Monday night schedule + scores
//   wednesday-fixtures.json → Wednesday night schedule + scores
//
// To enter results after a game night:
//   1. Open the relevant JSON file
//   2. Find the fixture by ID (e.g. "mon-r3-1")
//   3. Add homeScore, awayScore and change status to "completed"
//
// Run validateFixtures() from src/lib/validate.ts in the browser
// console or a script to check constraint violations.
// ============================================================

export const teams: Team[] = teamsData as Team[];

export const fixtures: Fixture[] = [
  ...(mondayFixturesData as unknown as Fixture[]),
  ...(wednesdayFixturesData as unknown as Fixture[]),
];

// ============================================================
// Helper functions
// ============================================================

export function getTeamsByNight(night: CompetitionNight): Team[] {
  return teams.filter((t) => t.night === night);
}

export function getFixturesByNight(night: CompetitionNight): Fixture[] {
  return fixtures.filter((f) => f.night === night);
}

export function getTeamName(teamId: string): string {
  return teams.find((t) => t.id === teamId)?.name ?? teamId;
}

export function getCompletedFixtures(night: CompetitionNight): Fixture[] {
  return fixtures
    .filter((f) => f.night === night && f.status === "completed")
    .sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time));
}

export function getUpcomingFixtures(night: CompetitionNight): Fixture[] {
  return fixtures
    .filter((f) => f.night === night && f.status === "scheduled")
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
}

export function getFixturesByRound(night: CompetitionNight, round: number): Fixture[] {
  return fixtures.filter((f) => f.night === night && f.round === round);
}

export function getAllRounds(night: CompetitionNight): number[] {
  const rounds = new Set(fixtures.filter((f) => f.night === night).map((f) => f.round));
  return Array.from(rounds).sort((a, b) => a - b);
}
