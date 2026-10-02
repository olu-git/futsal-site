import { Team, Fixture, CompetitionNight, StandingAdjustment } from "./types";
import teamsData from "@/data/teams.json";
import mondayFixturesData from "@/data/monday-fixtures.json";
import wednesdayFixturesData from "@/data/wednesday-fixtures.json";
import standingsAdjustmentsData from "@/data/standings-adjustments.json";

// Historical regular-season source data retained for import reconciliation.
// Current published league data comes from Supabase with a generated JSON fallback.
// Finals and grading remain in the separate knockout JSON workflow.

export const teams: Team[] = teamsData as Team[];

export const fixtures: Fixture[] = [
  ...(mondayFixturesData as unknown as Fixture[]),
  ...(wednesdayFixturesData as unknown as Fixture[]),
];

export const standingsAdjustments: StandingAdjustment[] =
  standingsAdjustmentsData as StandingAdjustment[];

// ============================================================
// Helper functions
// ============================================================

export function isTeamActive(teamId: string): boolean {
  return teams.find((team) => team.id === teamId)?.active !== false;
}

function isVisibleFixture(fixture: Fixture): boolean {
  return (
    fixture.status === "completed" ||
    (isTeamActive(fixture.homeTeam) && isTeamActive(fixture.awayTeam))
  );
}

export function getTeamsByNight(night: CompetitionNight): Team[] {
  return teams.filter((t) => t.night === night && t.active !== false);
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
    .sort((a, b) => b.date.localeCompare(a.date) || a.time.localeCompare(b.time) || a.court - b.court);
}

export function getUpcomingFixtures(night: CompetitionNight): Fixture[] {
  return fixtures
    .filter(
      (f) =>
        f.night === night &&
        f.status === "scheduled" &&
        isTeamActive(f.homeTeam) &&
        isTeamActive(f.awayTeam)
    )
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time) || a.court - b.court);
}

export function getFixturesByRound(night: CompetitionNight, round: number): Fixture[] {
  return fixtures
    .filter((f) => f.night === night && f.round === round && isVisibleFixture(f))
    .sort(
      (a, b) =>
        a.date.localeCompare(b.date) ||
        a.time.localeCompare(b.time) ||
        a.court - b.court
    );
}

export function getAllRounds(night: CompetitionNight): number[] {
  const rounds = new Set(
    fixtures
      .filter((f) => f.night === night && isVisibleFixture(f))
      .map((f) => f.round)
  );
  return Array.from(rounds).sort((a, b) => a - b);
}
