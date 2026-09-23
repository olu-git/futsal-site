import { competitionRepository, type CompetitionRepository, type CompetitionDataset } from "./competition-repository";
import { calculateStandings } from "./standings";
import type { CompetitionNight, Division, Fixture, Team } from "./types";

export interface DisplayFixture extends Fixture { home: Team; away: Team; }
export interface DisplayRound { night: CompetitionNight; round: number; date: string; fixtures: DisplayFixture[]; }

export function groupRounds(fixtures: DisplayFixture[]): DisplayRound[] {
  const groups = new Map<string, DisplayRound>();
  for (const fixture of fixtures) {
    const key = `${fixture.night}:${fixture.round}:${fixture.date}`;
    const group = groups.get(key) ?? { night: fixture.night, round: fixture.round, date: fixture.date, fixtures: [] };
    group.fixtures.push(fixture);
    groups.set(key, group);
  }
  return [...groups.values()].sort((a, b) => a.date.localeCompare(b.date) || a.round - b.round)
    .map((group) => ({ ...group, fixtures: group.fixtures.sort((a, b) => a.time.localeCompare(b.time) || a.court - b.court) }));
}

function displayFixtures(data: CompetitionDataset): DisplayFixture[] {
  const teams = new Map(data.teams.map((team) => [team.id, team]));
  return data.fixtures.flatMap((fixture) => {
    const home = teams.get(fixture.homeTeam);
    const away = teams.get(fixture.awayTeam);
    if (!home || !away) throw new Error(`Unknown team in fixture ${fixture.id}`);
    if (fixture.status === "scheduled" && (home.active === false || away.active === false)) return [];
    return [{ ...fixture, home, away }];
  });
}

export function createCompetitionService(repository: CompetitionRepository) {
  return {
    async getNight(night: CompetitionNight) {
      const data = await repository.readCompetition();
      const teams = data.teams.filter((team) => team.night === night && team.active !== false);
      const divisions = [...new Set(teams.map((team) => team.division))].sort() as Division[];
      const fixtures = displayFixtures(data).filter((fixture) => fixture.night === night);
      return {
        night, teams,
        divisions: divisions.map((division) => ({ division, standings: calculateStandings(night, division, data), teams: teams.filter((team) => team.division === division) })),
        results: groupRounds(fixtures.filter((fixture) => fixture.status === "completed")).reverse(),
        upcoming: groupRounds(fixtures.filter((fixture) => fixture.status === "scheduled")),
      };
    },
    async getNextRound() {
      const data = await repository.readCompetition();
      return groupRounds(displayFixtures(data).filter((fixture) => fixture.status === "scheduled"))[0] ?? null;
    },
    getFinals: () => repository.readFinals(),
  };
}

export const competitionService = createCompetitionService(competitionRepository);
