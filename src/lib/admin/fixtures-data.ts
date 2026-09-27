import { createClient } from "@/lib/supabase/browser";
import type { ChangeSetStatus, FixtureChange, FixtureChangeContext, KickoffPreference, Night,
  ScheduleCompetition, ScheduleCompetitionSeason, ScheduleFixture, ScheduleTeam, ValidationMessage } from "./fixture-changes";

export interface AdminFixtureData extends ScheduleFixture {
  homeName: string; awayName: string; homeKit: string | null; awayKit: string | null;
}
export interface AdminCompetitionEdition {
  id: string; night: Night; season: string; lifecycle: "planned" | "active" | "archived"; locationId: string;
}
export interface AdminChangeSet {
  id: string; competitionSeasonId: string; title: string; overallNote: string | null; source: string;
  status: ChangeSetStatus; version: number; validationMessages: ValidationMessage[];
  warningsAcknowledgedAt: string | null; createdAt: string; reviewedAt: string | null; publishedAt: string | null;
  items: Array<{ id: string; ordinal: number; change: FixtureChange; original: ScheduleFixture | null }>;
}
export interface FixturesWorkspace {
  editions: AdminCompetitionEdition[]; fixtures: AdminFixtureData[]; teams: Array<ScheduleTeam & { kitColour: string | null }>;
  contexts: Record<string, FixtureChangeContext>; changeSets: AdminChangeSet[];
}

type Row = Record<string, unknown>;
const one = <T,>(value: T | T[]): T => Array.isArray(value) ? value[0] : value;
const missingSchema = (message: string) => /schedule_status|schedule_version|fixture_change_|schema cache|does not exist/i.test(message);
export class FixturesSetupInactiveError extends Error { constructor() { super("Fixtures setup is not active yet."); } }

export async function loadFixturesWorkspace(): Promise<FixturesWorkspace> {
  const supabase = createClient();
  const { data: editionRows, error: editionError } = await supabase.from("competition_seasons")
    .select("id,lifecycle,publication_state,seasons(name,ends_on),competitions(id,weekday,location_id)")
    .eq("publication_state", "published");
  if (editionError) throw new Error(`Unable to load competition seasons: ${editionError.message}`);
  const sorted = ([...(editionRows ?? [])] as Row[]).filter((row) => [1, 3].includes(Number(one(row.competitions as { weekday: number } | { weekday: number }[]).weekday)))
    .sort((a, b) => String(one(b.seasons as { ends_on: string } | { ends_on: string }[]).ends_on).localeCompare(String(one(a.seasons as { ends_on: string } | { ends_on: string }[]).ends_on)));
  const chosen = new Map<number, Row>();
  sorted.forEach((row) => { const day = Number(one(row.competitions as { weekday: number } | { weekday: number }[]).weekday); if (!chosen.has(day)) chosen.set(day, row); });
  const editions: AdminCompetitionEdition[] = [...chosen.entries()].map(([day, row]) => ({ id: String(row.id), night: day === 1 ? "monday" : "wednesday",
    season: String(one(row.seasons as { name: string } | { name: string }[]).name), lifecycle: row.lifecycle as AdminCompetitionEdition["lifecycle"],
    locationId: String(one(row.competitions as { location_id: string } | { location_id: string }[]).location_id) }));
  const ids = editions.map((edition) => edition.id);
  if (!ids.length) return { editions, fixtures: [], teams: [], contexts: {}, changeSets: [] };

  const [fixtureResponse, teamResponse, preferenceResponse, noteResponse, setResponse, competitionResponse, allEditionResponse] = await Promise.all([
    supabase.from("fixtures").select("id,competition_season_id,round_number,match_date,kickoff_time,court,home_team_id,away_team_id,stage,publication_state,schedule_status,schedule_version,result_versions(status)")
      .in("competition_season_id", ids).eq("stage", "regular_season"),
    supabase.from("teams").select("id,competition_season_id,name,status,kit_colour").in("competition_season_id", ids),
    supabase.from("team_kickoff_preferences").select("team_id,kickoff_time,classification"),
    supabase.from("team_fixture_notes").select("team_id,notes"),
    supabase.from("fixture_change_sets").select("id,competition_season_id,title,overall_note,source,status,version,validation_report,warnings_acknowledged_at,created_at,reviewed_at,published_at,fixture_change_items(id,ordinal,operation,fixture_id,expected_schedule_version,original_fixture,reason,proposed_round_number,proposed_match_date,proposed_kickoff_time,proposed_court,proposed_home_team_id,proposed_away_team_id,proposed_publication_state,display_home_name,display_away_name)").in("competition_season_id", ids),
    supabase.from("competitions").select("id,location_id"),
    supabase.from("competition_seasons").select("id,competition_id,lifecycle,publication_state"),
  ]);
  for (const response of [fixtureResponse, setResponse]) if (response.error && missingSchema(response.error.message)) throw new FixturesSetupInactiveError();
  for (const response of [fixtureResponse, teamResponse, preferenceResponse, noteResponse, setResponse, competitionResponse, allEditionResponse])
    if (response.error) throw new Error(`Unable to load fixture management: ${response.error.message}`);

  const teams = (teamResponse.data ?? []).map((row: Row) => ({ id: String(row.id), competitionSeasonId: String(row.competition_season_id), name: String(row.name),
    status: row.status as ScheduleTeam["status"], kitColour: row.kit_colour as string | null }));
  const teamMap = new Map(teams.map((team) => [team.id, team]));
  const fixtures: AdminFixtureData[] = (fixtureResponse.data ?? []).map((row: Row) => {
    const home = teamMap.get(String(row.home_team_id)); const away = teamMap.get(String(row.away_team_id));
    if (!home || !away) throw new Error(`Fixture ${String(row.id)} has an unresolved team reference.`);
    return { id: String(row.id), competitionSeasonId: String(row.competition_season_id), roundNumber: Number(row.round_number), date: String(row.match_date),
      kickoffTime: String(row.kickoff_time).slice(0,5), court: Number(row.court), homeTeamId: home.id, awayTeamId: away.id,
      stage: row.stage as ScheduleFixture["stage"], publicationState: row.publication_state as ScheduleFixture["publicationState"],
      scheduleStatus: row.schedule_status as ScheduleFixture["scheduleStatus"], scheduleVersion: Number(row.schedule_version),
      hasPublishedResult: ((row.result_versions ?? []) as Row[]).some((result) => result.status === "published"),
      homeName: home.name, awayName: away.name, homeKit: home.kitColour, awayKit: away.kitColour };
  });
  const competitions = (competitionResponse.data ?? []).map((row: Row): ScheduleCompetition => ({ id: String(row.id), locationId: String(row.location_id) }));
  const competitionSeasons = (allEditionResponse.data ?? []).map((row: Row): ScheduleCompetitionSeason => ({ id: String(row.id), competitionId: String(row.competition_id),
    lifecycle: row.lifecycle as ScheduleCompetitionSeason["lifecycle"], publicationState: row.publication_state as ScheduleCompetitionSeason["publicationState"] }));
  const selectedLocations = new Set(editions.map((edition) => edition.locationId));
  const locationCompetitionIds = new Set(competitions.filter((competition) => selectedLocations.has(competition.locationId)).map((competition) => competition.id));
  const locationEditionIds = competitionSeasons.filter((candidate) => locationCompetitionIds.has(candidate.competitionId) &&
    candidate.lifecycle !== "archived" && (candidate.lifecycle === "active" || candidate.publicationState === "published")).map((candidate) => candidate.id);
  const { data: occupancyRows, error: occupancyError } = await supabase.from("fixtures")
    .select("id,competition_season_id,round_number,match_date,kickoff_time,court,home_team_id,away_team_id,stage,publication_state,schedule_status,schedule_version,result_versions(status)")
    .in("competition_season_id", locationEditionIds).eq("stage", "regular_season");
  if (occupancyError) {
    if (missingSchema(occupancyError.message)) throw new FixturesSetupInactiveError();
    throw new Error(`Unable to load venue occupancy: ${occupancyError.message}`);
  }
  const occupancyFixtures: ScheduleFixture[] = (occupancyRows ?? []).map((row: Row) => ({
    id: String(row.id), competitionSeasonId: String(row.competition_season_id), roundNumber: Number(row.round_number), date: String(row.match_date),
    kickoffTime: String(row.kickoff_time).slice(0,5), court: Number(row.court), homeTeamId: String(row.home_team_id), awayTeamId: String(row.away_team_id),
    stage: row.stage as ScheduleFixture["stage"], publicationState: row.publication_state as ScheduleFixture["publicationState"],
    scheduleStatus: row.schedule_status as ScheduleFixture["scheduleStatus"], scheduleVersion: Number(row.schedule_version),
    hasPublishedResult: ((row.result_versions ?? []) as Row[]).some((result) => result.status === "published"),
  }));
  const preferences = (preferenceResponse.data ?? []).map((row: Row): KickoffPreference => ({ teamId: String(row.team_id), kickoffTime: String(row.kickoff_time).slice(0,5), classification: row.classification as KickoffPreference["classification"] }));
  const notes = (noteResponse.data ?? []).map((row: Row) => ({ teamId: String(row.team_id), notes: String(row.notes) }));
  const contexts: Record<string, FixtureChangeContext> = {};
  editions.forEach((edition) => { contexts[edition.id] = { competitionSeasonId: edition.id, night: edition.night, season: edition.season, lifecycle: edition.lifecycle,
    competitions, competitionSeasons, fixtures: occupancyFixtures, teams, preferences, notes, today: new Date().toISOString().slice(0,10) }; });
  const changeSets: AdminChangeSet[] = (setResponse.data ?? []).map((row: Row) => ({ id: String(row.id), competitionSeasonId: String(row.competition_season_id),
    title: String(row.title), overallNote: row.overall_note as string | null, source: String(row.source), status: row.status as ChangeSetStatus, version: Number(row.version),
    validationMessages: (((row.validation_report as Row)?.messages ?? []) as ValidationMessage[]), warningsAcknowledgedAt: row.warnings_acknowledged_at as string | null,
    createdAt: String(row.created_at), reviewedAt: row.reviewed_at as string | null, publishedAt: row.published_at as string | null,
    items: ((row.fixture_change_items ?? []) as Row[]).map((item) => ({ id: String(item.id), ordinal: Number(item.ordinal), original: item.original_fixture as ScheduleFixture | null,
      change: { operation: item.operation as FixtureChange["operation"], ...(item.fixture_id ? { fixtureId: String(item.fixture_id), expectedFixtureVersion: Number(item.expected_schedule_version) } : {}),
        reason: String(item.reason), ...(item.operation !== "cancel" ? { proposed: { roundNumber: Number(item.proposed_round_number), date: String(item.proposed_match_date), kickoffTime: String(item.proposed_kickoff_time).slice(0,5),
          court: Number(item.proposed_court), homeTeamId: String(item.proposed_home_team_id), awayTeamId: String(item.proposed_away_team_id), publicationState: "published" as const } } : {}),
        ...(item.display_home_name ? { homeTeamName: String(item.display_home_name) } : {}), ...(item.display_away_name ? { awayTeamName: String(item.display_away_name) } : {}) } })).sort((a,b) => a.ordinal-b.ordinal) }));
  return { editions, fixtures: fixtures.sort((a,b) => b.roundNumber-a.roundNumber || a.kickoffTime.localeCompare(b.kickoffTime) || a.court-b.court), teams, contexts, changeSets };
}
