import teamsData from "@/data/teams.json";
import mondayData from "@/data/monday-fixtures.json";
import wednesdayData from "@/data/wednesday-fixtures.json";
import adjustmentsData from "@/data/standings-adjustments.json";
import finalsData from "@/data/season-2026-s1.json";
import type { Team, Fixture, StandingAdjustment } from "./types";
import type { FinalsSeasonData } from "./finals";

export interface CompetitionDataset {
  teams: Team[];
  fixtures: Fixture[];
  standingsAdjustments: StandingAdjustment[];
}

export interface CompetitionRepository {
  readCompetition(): Promise<CompetitionDataset>;
  readFinals(): Promise<FinalsSeasonData>;
}

// Legacy calculation scripts share this snapshot with the async public service.
export const jsonCompetitionData: CompetitionDataset = {
  teams: teamsData as Team[],
  fixtures: [...mondayData, ...wednesdayData] as Fixture[],
  standingsAdjustments: adjustmentsData as StandingAdjustment[],
};

export const competitionRepository: CompetitionRepository = {
  async readCompetition() { return jsonCompetitionData; },
  async readFinals() { return finalsData as FinalsSeasonData; },
};
