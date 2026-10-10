import snapshotData from "@/data/public-competition-snapshot.json";
import finalsData from "@/data/season-2026-s1.json";
import type { Team, Fixture, StandingAdjustment } from "./types";
import type { FinalsSeasonData } from "./finals";
import { teamDisplayName } from "./team-display-name";

export interface CompetitionDataset {
  teams: Team[];
  fixtures: Fixture[];
  standingsAdjustments: StandingAdjustment[];
  seasonNames?: Partial<Record<"monday" | "wednesday", string>>;
  archives?: Array<{ id: string; name: string; data: CompetitionDataset }>;
}

export interface CompetitionRepository {
  readCompetition(): Promise<CompetitionDataset>;
  readFinals(): Promise<FinalsSeasonData>;
}

// Legacy calculation scripts share this snapshot with the async public service.
export const jsonCompetitionData: CompetitionDataset = {
  ...snapshotData.data as CompetitionDataset,
  teams: (snapshotData.data.teams as Team[]).map((team) => ({
    ...team, name: teamDisplayName(team.id, team.name),
  })),
  fixtures: snapshotData.data.fixtures as Fixture[],
  standingsAdjustments: snapshotData.data.standingsAdjustments as StandingAdjustment[],
};

export const competitionRepository: CompetitionRepository = {
  async readCompetition() { return jsonCompetitionData; },
  async readFinals() { return finalsData as FinalsSeasonData; },
};
