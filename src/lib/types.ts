export type CompetitionNight = "monday" | "wednesday";

export type Division = "A" | "B";

export interface Team {
  id: string;
  name: string;
  night: CompetitionNight;
  division: Division;
}

export type FixtureStatus = "scheduled" | "completed";

export interface Fixture {
  id: string;
  night: CompetitionNight;
  division: Division;
  round: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  court: number;
  homeTeam: string; // team id
  awayTeam: string; // team id
  homeScore?: number;
  awayScore?: number;
  status: FixtureStatus;
}

export interface Standing {
  teamId: string;
  teamName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  position: number;
}
