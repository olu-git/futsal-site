import { createClient } from "@/lib/supabase/browser";

export const CURRENT_SEASON_SELECT = "id, lifecycle, created_at, seasons(name, starts_on, ends_on), competitions(name, weekday)";
export const FIXTURE_RESULTS_SELECT = `id, competition_season_id, home_team_id, away_team_id, round_number, match_date, kickoff_time, court, stage,
  result_versions(id, revision, status, home_score, away_score, forfeit_side, forfeit_exception_reason,
    penalty_home_score, penalty_away_score, penalty_winner, supersedes_result_id, correction_reason, created_at, published_at)`;
export const ADMIN_TEAMS_SELECT = "id, competition_season_id, name, kit_colour";

export type AdminResultVersion = {
  id: string;
  revision: number;
  status: "draft" | "pending_review" | "published" | "superseded";
  homeScore: number | null;
  awayScore: number | null;
  forfeitSide: "home" | "away" | null;
  forfeitExceptionReason: string | null;
  penaltyHomeScore: number | null;
  penaltyAwayScore: number | null;
  penaltyWinner: "home" | "away" | null;
  supersedesResultId: string | null;
  correctionReason: string | null;
  createdAt: string;
  publishedAt: string | null;
};

export type AdminFixture = {
  id: string;
  competitionSeasonId: string;
  night: "monday" | "wednesday";
  seasonName: string;
  round: number;
  date: string;
  time: string;
  court: number;
  stage: "regular_season" | "knockout" | "grading";
  home: { id: string; name: string; kitColour: string | null };
  away: { id: string; name: string; kitColour: string | null };
  results: AdminResultVersion[];
};

type Relation<T> = T | T[];
const one = <T,>(value: Relation<T>): T => Array.isArray(value) ? value[0] : value;

export type AdminEditionRow = Record<string, unknown>;
export type AdminFixtureRow = Record<string, unknown>;
export type AdminTeamRow = { id: string; competition_season_id: string; name: string; kit_colour: string | null };

export function compareAdminFixtures(a: Pick<AdminFixture, "round" | "time" | "court">, b: Pick<AdminFixture, "round" | "time" | "court">) {
  return b.round - a.round || a.time.localeCompare(b.time) || a.court - b.court;
}

export async function getAdminRegularSeasonFixtures(): Promise<AdminFixture[]> {
  const supabase = createClient();
  const { data: editions, error: editionsError } = await supabase
    .from("competition_seasons")
    .select(CURRENT_SEASON_SELECT)
    .eq("publication_state", "published");
  if (editionsError) throw new Error(`Unable to load competition seasons: ${editionsError.message}`);

  const selected = ([...(editions ?? [])] as Array<Record<string, unknown>>)
    .filter((row) => [1, 3].includes(Number(one(row.competitions as Relation<{ weekday: number }>).weekday)))
    .sort((a, b) => String(one(b.seasons as Relation<{ ends_on: string }>).ends_on).localeCompare(String(one(a.seasons as Relation<{ ends_on: string }>).ends_on)));
  const byNight = new Map<number, Record<string, unknown>>();
  selected.forEach((row) => {
    const weekday = Number(one(row.competitions as Relation<{ weekday: number }>).weekday);
    if (!byNight.has(weekday)) byNight.set(weekday, row);
  });
  const ids = [...byNight.values()].map((row) => String(row.id));
  if (!ids.length) return [];

  const { data: fixtureRows, error } = await supabase
    .from("fixtures")
    .select(FIXTURE_RESULTS_SELECT)
    .in("competition_season_id", ids)
    .eq("stage", "regular_season")
    .order("round_number", { ascending: false })
    .order("kickoff_time", { ascending: true })
    .order("court", { ascending: true });
  if (error) throw new Error(`Unable to load results: ${error.message}`);

  const { data: teamRows, error: teamsError } = await supabase
    .from("teams")
    .select(ADMIN_TEAMS_SELECT)
    .in("competition_season_id", ids);
  if (teamsError) throw new Error(`Unable to load fixture teams: ${teamsError.message}`);

  return mapAdminFixtures(
    (fixtureRows ?? []) as AdminFixtureRow[],
    (teamRows ?? []) as AdminTeamRow[],
    [...byNight.values()],
  );
}

export function mapAdminFixtures(rows: AdminFixtureRow[], teams: AdminTeamRow[], editions: AdminEditionRow[]): AdminFixture[] {
  const editionMap = new Map(editions.map((row) => [String(row.id), row]));
  const teamMap = new Map(teams.map((team) => [`${team.competition_season_id}:${team.id}`, team]));
  return rows.map((row): AdminFixture => {
    const competitionSeasonId = String(row.competition_season_id);
    const edition = editionMap.get(competitionSeasonId);
    if (!edition) throw new Error(`Fixture ${String(row.id)} refers to an unknown competition season ${competitionSeasonId}.`);
    const competition = one(edition.competitions as Relation<{ weekday: number }>);
    const season = one(edition.seasons as Relation<{ name: string }>);
    const homeTeamId = String(row.home_team_id ?? "");
    const awayTeamId = String(row.away_team_id ?? "");
    const home = teamMap.get(`${competitionSeasonId}:${homeTeamId}`);
    const away = teamMap.get(`${competitionSeasonId}:${awayTeamId}`);
    if (!home) throw new Error(`Fixture ${String(row.id)} has missing home team ${homeTeamId || "(empty)"}.`);
    if (!away) throw new Error(`Fixture ${String(row.id)} has missing away team ${awayTeamId || "(empty)"}.`);
    const results = (row.result_versions ?? []) as Array<Record<string, unknown>>;
    return {
      id: String(row.id), competitionSeasonId,
      night: competition.weekday === 1 ? "monday" : "wednesday", seasonName: season.name,
      round: Number(row.round_number), date: String(row.match_date), time: String(row.kickoff_time),
      court: Number(row.court), stage: row.stage as AdminFixture["stage"],
      home: { id: home.id, name: home.name, kitColour: home.kit_colour },
      away: { id: away.id, name: away.name, kitColour: away.kit_colour },
      results: results.map((result) => ({
        id: String(result.id), revision: Number(result.revision), status: result.status as AdminResultVersion["status"],
        homeScore: result.home_score as number | null, awayScore: result.away_score as number | null,
        forfeitSide: result.forfeit_side as AdminResultVersion["forfeitSide"],
        forfeitExceptionReason: result.forfeit_exception_reason as string | null,
        penaltyHomeScore: result.penalty_home_score as number | null, penaltyAwayScore: result.penalty_away_score as number | null,
        penaltyWinner: result.penalty_winner as AdminResultVersion["penaltyWinner"],
        supersedesResultId: result.supersedes_result_id as string | null, correctionReason: result.correction_reason as string | null,
        createdAt: String(result.created_at), publishedAt: result.published_at as string | null,
      })).sort((a, b) => b.revision - a.revision),
    };
  }).sort(compareAdminFixtures);
}
