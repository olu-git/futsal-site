import { createClient } from "./supabase/browser";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { CompetitionDataset } from "./competition-repository";
import type { CompetitionNight, Division, Fixture, StandingAdjustment, Team } from "./types";

type Relation<T> = T | T[];
const one = <T,>(value: Relation<T>): T => Array.isArray(value) ? value[0] : value;

export interface PublicEditionRow {
  id: string;
  publication_state: string;
  lifecycle: string;
  competitions: Relation<{ weekday: number; division: string }>;
  seasons: Relation<{ ends_on: string }>;
}
export interface PublicTeamRow {
  id: string;
  competition_season_id: string;
  legacy_id: string | null;
  name: string;
  status: string;
  standings_eligible: boolean;
  kit_colour: string | null;
}
export interface PublicFixtureRow {
  id: string;
  competition_season_id: string;
  legacy_id: string | null;
  round_number: number;
  match_date: string;
  kickoff_time: string;
  court: number;
  home_team_id: string;
  away_team_id: string;
  stage: string;
  publication_state: string;
  public_note: string | null;
}
export interface PublicResultRow {
  fixture_id: string;
  status: string;
  home_score: number | null;
  away_score: number | null;
  forfeit_side: string | null;
}
export interface PublicAdjustmentRow {
  id: string;
  competition_season_id: string;
  team_id: string;
  legacy_id: string | null;
  played_delta: number;
  wins_delta: number;
  draws_delta: number;
  losses_delta: number;
  goals_for_delta: number;
  goals_against_delta: number;
  points_delta: number;
  reason: string;
  publication_state: string;
}

export interface PublishedCompetitionRows {
  editions: PublicEditionRow[];
  teams: PublicTeamRow[];
  fixtures: PublicFixtureRow[];
  results: PublicResultRow[];
  adjustments: PublicAdjustmentRow[];
}

export async function preferPublished<T>(load: () => Promise<T>, snapshot: T, timeoutMs = 8000): Promise<{ value: T; source: "supabase" | "snapshot" }> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const value = await Promise.race([load(), new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error("Public competition request timed out.")), timeoutMs);
    })]);
    return { value, source: "supabase" };
  }
  catch { return { value: snapshot, source: "snapshot" }; }
  finally { if (timer) clearTimeout(timer); }
}

export function selectPublicEditions(editions: PublicEditionRow[]): PublicEditionRow[] {
  const published = editions.filter((row) => row.publication_state === "published")
    .filter((row) => [1, 3].includes(Number(one(row.competitions).weekday)))
    .sort((a, b) => Number(b.lifecycle === "active") - Number(a.lifecycle === "active") ||
      one(b.seasons).ends_on.localeCompare(one(a.seasons).ends_on));
  const byNightAndDivision = new Map<string, PublicEditionRow>();
  for (const edition of published) {
    const { weekday, division } = one(edition.competitions);
    const key = `${weekday}:${division}`;
    if (!byNightAndDivision.has(key)) byNightAndDivision.set(key, edition);
  }
  if (!published.some((row) => Number(one(row.competitions).weekday) === 1) ||
      !published.some((row) => Number(one(row.competitions).weekday) === 3)) {
    throw new Error("A published Monday or Wednesday competition season is missing.");
  }
  return [...byNightAndDivision.values()];
}

export function mapPublishedCompetition(
  editions: PublicEditionRow[], teams: PublicTeamRow[], fixtures: PublicFixtureRow[],
  results: PublicResultRow[], adjustments: PublicAdjustmentRow[],
): CompetitionDataset {
  const editionMap = new Map(editions.map((edition) => {
    const competition = one(edition.competitions);
    const night: CompetitionNight = competition.weekday === 1 ? "monday" : "wednesday";
    if (competition.division !== "A" && competition.division !== "B") throw new Error(`Unsupported division ${competition.division}.`);
    return [edition.id, { night, division: competition.division as Division }] as const;
  }));
  const mappedTeams: Team[] = teams.filter((row) => editionMap.has(row.competition_season_id)).map((row) => {
    const edition = editionMap.get(row.competition_season_id)!;
    return { id: row.id, name: row.name, night: edition.night, division: edition.division,
      active: row.status === "active", standingsEligible: row.standings_eligible,
      kitColour: row.kit_colour ?? undefined };
  });
  const teamMap = new Map(teams.map((row) => [row.id, row]));
  const publishedResults = new Map<string, PublicResultRow>();
  for (const result of results.filter((row) => row.status === "published")) {
    if (publishedResults.has(result.fixture_id)) throw new Error(`Multiple published results for fixture ${result.fixture_id}.`);
    if (!Number.isInteger(result.home_score) || !Number.isInteger(result.away_score) || result.home_score! < 0 || result.away_score! < 0) {
      throw new Error(`Invalid published score for fixture ${result.fixture_id}.`);
    }
    publishedResults.set(result.fixture_id, result);
  }
  const mappedFixtures: Fixture[] = fixtures.filter((row) => editionMap.has(row.competition_season_id))
    .filter((row) => row.stage === "regular_season" && row.publication_state === "published")
    .map((row) => {
      const edition = editionMap.get(row.competition_season_id)!;
      const home = teamMap.get(row.home_team_id);
      const away = teamMap.get(row.away_team_id);
      if (!home || home.competition_season_id !== row.competition_season_id) throw new Error(`Fixture ${row.id} has an unresolved home team.`);
      if (!away || away.competition_season_id !== row.competition_season_id) throw new Error(`Fixture ${row.id} has an unresolved away team.`);
      const result = publishedResults.get(row.id);
      return { id: row.legacy_id ?? row.id, night: edition.night, division: edition.division,
        round: row.round_number, date: row.match_date, time: row.kickoff_time.slice(0, 5), court: row.court,
        homeTeam: home.id, awayTeam: away.id, status: result ? "completed" : "scheduled",
        homeScore: result?.home_score ?? undefined, awayScore: result?.away_score ?? undefined,
        note: [row.public_note, result?.forfeit_side ? `Forfeit: ${result.forfeit_side} team.` : null].filter(Boolean).join(" ") || undefined };
    });
  const mappedAdjustments: StandingAdjustment[] = adjustments.filter((row) => editionMap.has(row.competition_season_id) && row.publication_state === "published")
    .map((row) => {
      const edition = editionMap.get(row.competition_season_id)!;
      const team = teamMap.get(row.team_id);
      if (!team || team.competition_season_id !== row.competition_season_id) throw new Error(`Adjustment ${row.id} has an unresolved team.`);
      return { id: row.legacy_id ?? row.id, night: edition.night, division: edition.division,
        teamId: row.team_id, played: row.played_delta, won: row.wins_delta, drawn: row.draws_delta,
        lost: row.losses_delta, goalsFor: row.goals_for_delta, goalsAgainst: row.goals_against_delta,
        points: row.points_delta, note: row.reason };
    });
  return { teams: mappedTeams, fixtures: mappedFixtures, standingsAdjustments: mappedAdjustments };
}

export async function loadPublishedCompetitionRows(supabase: SupabaseClient): Promise<PublishedCompetitionRows> {
  const { data: editionRows, error: editionError } = await supabase.from("competition_seasons")
    .select("id, lifecycle, publication_state, competitions(weekday, division), seasons(ends_on)")
    .eq("publication_state", "published");
  if (editionError) throw new Error(`Unable to load public competitions: ${editionError.message}`);
  const editions = selectPublicEditions((editionRows ?? []) as PublicEditionRow[]);
  const ids = editions.map((edition) => edition.id);
  const [teamResponse, fixtureResponse, adjustmentResponse] = await Promise.all([
    supabase.from("teams").select("id, competition_season_id, legacy_id, name, status, standings_eligible, kit_colour", { count: "exact" }).in("competition_season_id", ids),
    supabase.from("fixtures").select("id, competition_season_id, legacy_id, round_number, match_date, kickoff_time, court, home_team_id, away_team_id, stage, publication_state, public_note", { count: "exact" })
      .in("competition_season_id", ids).eq("stage", "regular_season").eq("publication_state", "published"),
    supabase.from("standing_adjustments").select("id, competition_season_id, team_id, legacy_id, played_delta, wins_delta, draws_delta, losses_delta, goals_for_delta, goals_against_delta, points_delta, reason, publication_state", { count: "exact" })
      .in("competition_season_id", ids).eq("publication_state", "published"),
  ]);
  if (teamResponse.error) throw new Error(`Unable to load public teams: ${teamResponse.error.message}`);
  if (fixtureResponse.error) throw new Error(`Unable to load public fixtures: ${fixtureResponse.error.message}`);
  if (adjustmentResponse.error) throw new Error(`Unable to load public standings adjustments: ${adjustmentResponse.error.message}`);
  if (teamResponse.count !== (teamResponse.data ?? []).length || fixtureResponse.count !== (fixtureResponse.data ?? []).length ||
      adjustmentResponse.count !== (adjustmentResponse.data ?? []).length) {
    throw new Error("Public competition data was truncated by the database row limit.");
  }
  const fixtureRows = (fixtureResponse.data ?? []) as PublicFixtureRow[];
  const resultRows: PublicResultRow[] = [];
  for (let offset = 0; offset < fixtureRows.length; offset += 100) {
    const batch = fixtureRows.slice(offset, offset + 100);
    const { data, error, count } = await supabase.from("result_versions")
      .select("fixture_id, status, home_score, away_score, forfeit_side", { count: "exact" }).eq("status", "published")
      .in("fixture_id", batch.map((row) => row.id));
    if (error) throw new Error(`Unable to load public results: ${error.message}`);
    if (count !== (data ?? []).length) throw new Error("Public results were truncated by the database row limit.");
    resultRows.push(...(data ?? []) as PublicResultRow[]);
  }
  return { editions, teams: (teamResponse.data ?? []) as PublicTeamRow[], fixtures: fixtureRows,
    results: resultRows, adjustments: (adjustmentResponse.data ?? []) as PublicAdjustmentRow[] };
}

export async function loadPublishedCompetition(): Promise<CompetitionDataset> {
  const rows = await loadPublishedCompetitionRows(createClient());
  return mapPublishedCompetition(rows.editions, rows.teams, rows.fixtures, rows.results, rows.adjustments);
}
