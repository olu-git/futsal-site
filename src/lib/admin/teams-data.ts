import { createClient } from "@/lib/supabase/browser";
import { selectAdminEditions } from "./competition-editions";
import type { AdminTeam, TeamEdition, TeamPreference } from "./teams";

export interface TeamsWorkspace { editions: TeamEdition[]; teams: AdminTeam[] }
type Row = Record<string, unknown>;
const one = <T,>(value: T | T[]) => Array.isArray(value) ? value[0] : value;
const schemaMissing = (message: string) => /team_fixture_notes|team_kickoff_preferences|standings_eligible|profile_version|schema cache|does not exist/i.test(message);
export class TeamsSetupUnavailableError extends Error { constructor() { super("Team management tables are not available."); } }

export async function loadTeamsWorkspace(): Promise<TeamsWorkspace> {
  const supabase = createClient();
  const { data: editionData, error: editionError } = await supabase.from("competition_seasons")
    .select("id,lifecycle,publication_state,seasons(name,ends_on),competitions(weekday,division,name)")
    .eq("publication_state", "published");
  if (editionError) throw new Error(`Unable to load competition seasons: ${editionError.message}`);
  const rows = (editionData ?? []) as Row[];
  const editions: TeamEdition[] = selectAdminEditions(rows).map((row) => { const competition = one(row.competitions as { weekday: number; division: string; name: string } | { weekday: number; division: string; name: string }[]); return {
    id: String(row.id), night: (competition.weekday === 1 ? "monday" : "wednesday") as TeamEdition["night"], division: competition.division,
    label: competition.name, season: String(one(row.seasons as { name: string } | { name: string }[]).name), lifecycle: row.lifecycle as TeamEdition["lifecycle"],
  }; }).sort((a, b) => a.night.localeCompare(b.night) || a.division.localeCompare(b.division));
  const ids = editions.map((edition) => edition.id);
  if (!ids.length) return { editions, teams: [] };
  const [teamResponse, preferenceResponse, noteResponse, fixtureResponse, adjustmentResponse] = await Promise.all([
    supabase.from("teams").select("id,competition_season_id,name,status,standings_eligible,kit_colour,profile_version").in("competition_season_id", ids),
    supabase.from("team_kickoff_preferences").select("id,team_id,kickoff_time,classification"),
    supabase.from("team_fixture_notes").select("team_id,notes"),
    supabase.from("fixtures").select("home_team_id,away_team_id").in("competition_season_id", ids),
    supabase.from("standing_adjustments").select("team_id").in("competition_season_id", ids),
  ]);
  for (const response of [teamResponse, preferenceResponse, noteResponse, fixtureResponse, adjustmentResponse]) {
    if (response.error) { if (schemaMissing(response.error.message)) throw new TeamsSetupUnavailableError(); throw new Error(`Unable to load team management: ${response.error.message}`); }
  }
  const history = new Set<string>();
  (fixtureResponse.data ?? []).forEach((row: Row) => { if (row.home_team_id) history.add(String(row.home_team_id)); if (row.away_team_id) history.add(String(row.away_team_id)); });
  (adjustmentResponse.data ?? []).forEach((row: Row) => history.add(String(row.team_id)));
  const preferences = new Map<string, TeamPreference[]>();
  (preferenceResponse.data ?? []).forEach((row: Row) => { const teamId=String(row.team_id), list=preferences.get(teamId)??[]; list.push({ id:String(row.id), kickoffTime:String(row.kickoff_time).slice(0,5), classification:row.classification as TeamPreference["classification"] }); preferences.set(teamId,list); });
  const notes = new Map((noteResponse.data ?? []).map((row: Row) => [String(row.team_id), String(row.notes)]));
  const teams: AdminTeam[] = (teamResponse.data ?? []).map((row: Row) => ({ id:String(row.id), competitionSeasonId:String(row.competition_season_id), name:String(row.name), status:row.status as AdminTeam["status"], standingsEligible:Boolean(row.standings_eligible), kitColour:row.kit_colour as string|null, note:notes.get(String(row.id))??"", preferences:(preferences.get(String(row.id))??[]).sort((a,b)=>a.kickoffTime.localeCompare(b.kickoffTime)), hasHistory:history.has(String(row.id)), profileVersion:Number(row.profile_version) }));
  return { editions, teams };
}
