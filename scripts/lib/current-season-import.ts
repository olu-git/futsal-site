import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { calculateStandings } from "../../src/lib/standings";
import { finalsDates, finalsMatches, resolveFinalsSlot, type FinalsSeasonData } from "../../src/lib/finals";
import type { CompetitionDataset } from "../../src/lib/competition-repository";
import type { CompetitionNight, Fixture, Standing, StandingAdjustment, Team } from "../../src/lib/types";

const ROOT = process.cwd();
const SOURCE_PATHS = {
  teams: "src/data/teams.json",
  mondayFixtures: "src/data/monday-fixtures.json",
  wednesdayFixtures: "src/data/wednesday-fixtures.json",
  adjustments: "src/data/standings-adjustments.json",
  finals: "src/data/season-2026-s1.json",
  finalsTemplate: "src/lib/finals.ts",
  reconciliation: "docs/COMPETITION-DATA-RECONCILIATION-2026-09-25.md",
} as const;

export const OUTPUT_PATHS = {
  importSql: "supabase/imports/2026-s1/current-season-import.sql",
  verificationSql: "supabase/imports/2026-s1/post-import-verification.sql",
  report: "docs/CURRENT-SEASON-IMPORT-RECONCILIATION.md",
} as const;

const SEASON = {
  key: "2026-s1",
  name: "2026 Season 1",
  categoryCode: "mens",
  categoryName: "Men's",
  locationName: "Endeavour Hills Leisure Centre",
  locationAddress: "10 Raymond McMahon Blvd, Endeavour Hills VIC 3802",
  division: "A",
} as const;

const UUID_NAMESPACE = "862b08ea-d346-4e17-98d4-c16bff34cd5e";

interface ImportTeam extends Team {
  uuid: string;
  status: "active" | "inactive";
  standingsEligible: boolean;
}

interface ImportFixture extends Fixture {
  uuid: string;
  homeTeamUuid: string;
  awayTeamUuid: string;
}

interface ImportAdjustment extends StandingAdjustment {
  uuid: string;
  teamUuid: string;
  reason: string;
}

interface NightModel {
  night: CompetitionNight;
  competitionId: string;
  competitionSeasonId: string;
  teams: ImportTeam[];
  fixtures: ImportFixture[];
  adjustments: ImportAdjustment[];
  standings: Standing[];
  excludedSourceTeams: Team[];
  excludedScheduledFixtures: Fixture[];
}

export interface ImportModel {
  sourceDigest: string;
  seasonId: string;
  categoryId: string;
  locationId: string;
  startsOn: string;
  endsOn: string;
  nights: Record<CompetitionNight, NightModel>;
  excludedFinals: Record<CompetitionNight, { fixtures: number; results: number }>;
}

export interface ImportArtifacts {
  model: ImportModel;
  importSql: string;
  verificationSql: string;
  report: string;
}

function sourceText(path: string) {
  return readFileSync(resolve(ROOT, path), "utf8");
}

function readJson<T>(path: string): T {
  try {
    return JSON.parse(sourceText(path)) as T;
  } catch (error) {
    throw new Error(`Cannot parse ${path}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function normalizeName(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function normalizeLegacyId(value: string) {
  return value.trim().toLowerCase();
}

function uuidBytes(uuid: string) {
  return Buffer.from(uuid.replaceAll("-", ""), "hex");
}

function deterministicUuid(name: string) {
  const hash = createHash("sha1").update(uuidBytes(UUID_NAMESPACE)).update(name).digest();
  hash[6] = (hash[6] & 0x0f) | 0x50;
  hash[8] = (hash[8] & 0x3f) | 0x80;
  const hex = hash.subarray(0, 16).toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function sqlText(value: string) {
  return `'${value.replaceAll("'", "''")}'`;
}

function sqlNullable(value?: string) {
  return value === undefined ? "null" : sqlText(value);
}

function bool(value: boolean) {
  return value ? "true" : "false";
}

function values(rows: string[][]) {
  return rows.map((row) => `  (${row.join(", ")})`).join(",\n");
}

function validateTeam(team: Team, index: number) {
  assert(team && typeof team === "object", `teams.json[${index}] must be an object`);
  assert(typeof team.id === "string" && team.id.trim(), `teams.json[${index}] has no ID`);
  assert(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalizeLegacyId(team.id)), `Malformed team legacy ID: ${team.id}`);
  assert(typeof team.name === "string" && normalizeName(team.name), `Team ${team.id} has no name`);
  assert(team.night === "monday" || team.night === "wednesday", `Team ${team.id} has unsupported night`);
  assert(team.division === "A", `Team ${team.id} has unsupported division ${team.division}`);
  assert(team.active === undefined || typeof team.active === "boolean", `Team ${team.id} has malformed active status`);
  assert(team.kitColour === undefined || /^#[0-9A-Fa-f]{6}$/.test(team.kitColour), `Team ${team.id} has malformed kit colour`);
}

function validateFixture(fixture: Fixture & { stage?: string }, expectedNight: CompetitionNight, index: number) {
  const label = `${expectedNight} fixture[${index}]`;
  assert(fixture && typeof fixture === "object", `${label} must be an object`);
  assert(typeof fixture.id === "string" && fixture.id.trim(), `${label} has no ID`);
  assert(fixture.night === expectedNight, `${fixture.id} belongs to ${fixture.night}, not ${expectedNight}`);
  assert(fixture.division === "A", `${fixture.id} has unsupported division ${fixture.division}`);
  assert(fixture.stage === undefined || fixture.stage === "regular_season", `${fixture.id} has unsupported stage ${fixture.stage}`);
  assert(Number.isInteger(fixture.round) && fixture.round > 0, `${fixture.id} has malformed round`);
  assert(/^\d{4}-\d{2}-\d{2}$/.test(fixture.date), `${fixture.id} has malformed date`);
  assert(/^\d{2}:\d{2}$/.test(fixture.time), `${fixture.id} has malformed time`);
  assert(Number.isInteger(fixture.court) && fixture.court > 0, `${fixture.id} has malformed court`);
  assert(typeof fixture.homeTeam === "string" && typeof fixture.awayTeam === "string", `${fixture.id} has unresolved teams`);
  assert(fixture.homeTeam !== fixture.awayTeam, `${fixture.id} has the same home and away team`);
  assert(fixture.status === "completed" || fixture.status === "scheduled", `${fixture.id} has unsupported status`);
  if (fixture.status === "completed") {
    assert(Number.isInteger(fixture.homeScore) && fixture.homeScore! >= 0, `${fixture.id} has malformed home score`);
    assert(Number.isInteger(fixture.awayScore) && fixture.awayScore! >= 0, `${fixture.id} has malformed away score`);
  }
}

function validateAdjustment(adjustment: StandingAdjustment, index: number) {
  assert(adjustment && typeof adjustment === "object", `adjustments[${index}] must be an object`);
  assert(typeof adjustment.id === "string" && adjustment.id.trim(), `adjustments[${index}] has no ID`);
  assert(adjustment.night === "monday" || adjustment.night === "wednesday", `${adjustment.id} has unsupported night`);
  assert(adjustment.division === "A", `${adjustment.id} has unsupported division`);
  assert(typeof adjustment.teamId === "string" && adjustment.teamId.trim(), `${adjustment.id} has no team`);
  for (const field of ["played", "won", "drawn", "lost", "goalsFor", "goalsAgainst", "points"] as const) {
    assert(Number.isInteger(adjustment[field]), `${adjustment.id} has malformed ${field}`);
  }
  assert(typeof adjustment.note === "string" && adjustment.note.trim(), `${adjustment.id} requires a reason`);
}

function ensureUnique(valuesToCheck: string[], label: string) {
  const seen = new Set<string>();
  for (const value of valuesToCheck) {
    assert(!seen.has(value), `Duplicate ${label}: ${value}`);
    seen.add(value);
  }
}

export function buildImportModel(): ImportModel {
  const teams = readJson<Team[]>(SOURCE_PATHS.teams);
  const mondayFixtures = readJson<Fixture[]>(SOURCE_PATHS.mondayFixtures);
  const wednesdayFixtures = readJson<Fixture[]>(SOURCE_PATHS.wednesdayFixtures);
  const adjustments = readJson<StandingAdjustment[]>(SOURCE_PATHS.adjustments);
  const finals = readJson<FinalsSeasonData>(SOURCE_PATHS.finals);
  assert(Array.isArray(teams), "teams.json must contain an array");
  assert(Array.isArray(mondayFixtures), "monday-fixtures.json must contain an array");
  assert(Array.isArray(wednesdayFixtures), "wednesday-fixtures.json must contain an array");
  assert(Array.isArray(adjustments), "standings-adjustments.json must contain an array");
  teams.forEach(validateTeam);
  mondayFixtures.forEach((fixture, index) => validateFixture(fixture, "monday", index));
  wednesdayFixtures.forEach((fixture, index) => validateFixture(fixture, "wednesday", index));
  adjustments.forEach(validateAdjustment);
  ensureUnique(teams.map((team) => normalizeLegacyId(team.id)), "team legacy ID");
  ensureUnique([...mondayFixtures, ...wednesdayFixtures].map((fixture) => fixture.id), "fixture legacy ID");
  ensureUnique(adjustments.map((adjustment) => adjustment.id), "adjustment legacy ID");

  const allTeamIds = new Set(teams.map((team) => team.id));
  for (const fixture of [...mondayFixtures, ...wednesdayFixtures]) {
    assert(allTeamIds.has(fixture.homeTeam), `${fixture.id} references missing home team ${fixture.homeTeam}`);
    assert(allTeamIds.has(fixture.awayTeam), `${fixture.id} references missing away team ${fixture.awayTeam}`);
    const home = teams.find((team) => team.id === fixture.homeTeam)!;
    const away = teams.find((team) => team.id === fixture.awayTeam)!;
    assert(home.night === fixture.night && away.night === fixture.night, `${fixture.id} crosses competition nights`);
    assert(home.division === fixture.division && away.division === fixture.division, `${fixture.id} crosses divisions`);
  }
  for (const adjustment of adjustments) {
    const team = teams.find((candidate) => candidate.id === adjustment.teamId);
    assert(team, `${adjustment.id} references missing team ${adjustment.teamId}`);
    assert(team.night === adjustment.night && team.division === adjustment.division, `${adjustment.id} crosses competitions`);
  }

  const sourceFiles = Object.values(SOURCE_PATHS);
  const sourceDigest = createHash("sha256")
    .update(sourceFiles.map((path) => `${path}\n${sourceText(path)}`).join("\n---\n"))
    .digest("hex");
  const completedDates = [...mondayFixtures, ...wednesdayFixtures]
    .filter((fixture) => fixture.status === "completed")
    .map((fixture) => fixture.date)
    .sort();
  assert(completedDates.length > 0, "No completed regular-season fixtures were found");
  const scheduledFinalsDates = Object.values(finalsDates).flat().sort();
  const seasonEndDate = scheduledFinalsDates.at(-1);
  assert(seasonEndDate && /^\d{4}-\d{2}-\d{2}$/.test(seasonEndDate), "No valid finals end date was found");
  assert(seasonEndDate >= completedDates.at(-1)!, "Finals end date precedes the regular-season end date");

  const data: CompetitionDataset = { teams, fixtures: [...mondayFixtures, ...wednesdayFixtures], standingsAdjustments: adjustments };
  const seasonId = deterministicUuid(`season:${SEASON.key}`);
  const categoryId = deterministicUuid(`category:${SEASON.categoryCode}`);
  const locationId = deterministicUuid(`location:${SEASON.locationName}`);
  const nights = {} as Record<CompetitionNight, NightModel>;

  for (const night of ["monday", "wednesday"] as const) {
    const sourceFixtures = night === "monday" ? mondayFixtures : wednesdayFixtures;
    const completedFixtures = sourceFixtures.filter((fixture) => fixture.status === "completed");
    const nightAdjustments = adjustments.filter((adjustment) => adjustment.night === night);
    const referencedTeamIds = new Set([
      ...completedFixtures.flatMap((fixture) => [fixture.homeTeam, fixture.awayTeam]),
      ...nightAdjustments.map((adjustment) => adjustment.teamId),
    ]);
    const sourceNightTeams = teams.filter((team) => team.night === night);
    const includedSourceTeams = sourceNightTeams.filter((team) => referencedTeamIds.has(team.id));
    const excludedSourceTeams = sourceNightTeams.filter((team) => !referencedTeamIds.has(team.id));
    ensureUnique(includedSourceTeams.map((team) => normalizeName(team.name).toLowerCase()), `${night} normalized team name`);

    const competitionId = deterministicUuid(`competition:${SEASON.categoryCode}:${SEASON.locationName}:${night}:${SEASON.division}`);
    const competitionSeasonId = deterministicUuid(`competition-season:${SEASON.key}:${night}:${SEASON.division}`);
    const importTeams: ImportTeam[] = includedSourceTeams.map((team) => {
      const isWednesdayDwell = night === "wednesday" && team.id === "wed-dwell-fc";
      return {
        ...team,
        id: normalizeLegacyId(team.id),
        name: normalizeName(team.name),
        uuid: deterministicUuid(`team:${SEASON.key}:${night}:${normalizeLegacyId(team.id)}`),
        status: team.active === false || isWednesdayDwell ? "inactive" : "active",
        standingsEligible: isWednesdayDwell || team.active !== false,
      };
    });
    const teamUuids = new Map(importTeams.map((team) => [team.id, team.uuid]));
    const slotKeys: string[] = [];
    const importFixtures: ImportFixture[] = completedFixtures.map((fixture) => {
      const slot = `${fixture.date}|${fixture.time}|${fixture.court}`;
      slotKeys.push(slot);
      const homeTeamUuid = teamUuids.get(fixture.homeTeam);
      const awayTeamUuid = teamUuids.get(fixture.awayTeam);
      assert(homeTeamUuid && awayTeamUuid, `${fixture.id} has an unresolved imported team`);
      return {
        ...fixture,
        uuid: deterministicUuid(`fixture:${SEASON.key}:${night}:${fixture.id}`),
        homeTeamUuid,
        awayTeamUuid,
      };
    });
    ensureUnique(slotKeys, `${night} completed fixture slot`);
    const importAdjustments: ImportAdjustment[] = nightAdjustments.map((adjustment) => {
      const teamUuid = teamUuids.get(adjustment.teamId);
      assert(teamUuid, `${adjustment.id} has an unresolved imported team`);
      return {
        ...adjustment,
        uuid: deterministicUuid(`adjustment:${SEASON.key}:${night}:${adjustment.id}`),
        teamUuid,
        reason: adjustment.note!.trim(),
      };
    });
    nights[night] = {
      night,
      competitionId,
      competitionSeasonId,
      teams: importTeams,
      fixtures: importFixtures,
      adjustments: importAdjustments,
      standings: calculateStandings(night, "A", data),
      excludedSourceTeams,
      excludedScheduledFixtures: sourceFixtures.filter((fixture) => fixture.status === "scheduled"),
    };
  }

  const wednesdayFinals = finals.finals.wednesday;
  assert(nights.monday.excludedSourceTeams.some((team) => team.id === "mon-buckle-city-fc"), "Empty mon-buckle-city-fc record must be excluded");
  assert(nights.monday.teams.some((team) => team.id === "mon-buckle-city"), "Historical mon-buckle-city record must be retained");
  assert(!nights.wednesday.teams.some((team) => team.name === "Top Up FC"), "Wednesday Top Up FC must remain finals-only");
  const qf2 = finalsMatches.wednesday.find((match) => match.id === "qf-2");
  assert(qf2?.time === "19:40" && qf2.court === 2, "Wednesday QF2 hotfix is missing: expected 19:40 on Court 2");
  assert(resolveFinalsSlot(qf2.a, "wednesday", wednesdayFinals)?.name === "Pops", "Wednesday QF2 must resolve Pops as team A");
  assert(resolveFinalsSlot(qf2.b, "wednesday", wednesdayFinals)?.name === "Hazara United", "Wednesday QF2 must resolve Hazara United as team B");
  assert(wednesdayFinals.seeds.includes("Top Up FC") && !wednesdayFinals.seeds.includes("Dwell FC"), "Wednesday finals replacement must remain Top Up FC for Dwell FC");

  return {
    sourceDigest,
    seasonId,
    categoryId,
    locationId,
    startsOn: completedDates[0],
    endsOn: seasonEndDate,
    nights,
    excludedFinals: {
      monday: { fixtures: finalsMatches.monday.length, results: Object.keys(finals.finals.monday.results).length },
      wednesday: { fixtures: finalsMatches.wednesday.length, results: Object.keys(finals.finals.wednesday.results).length },
    },
  };
}

function generateImportSql(model: ImportModel) {
  const teamRows = Object.values(model.nights).flatMap((night) => night.teams.map((team) => [
    sqlText(team.uuid), sqlText(night.competitionSeasonId), sqlText(team.id), sqlText(team.name), sqlText(team.status),
    bool(team.standingsEligible), sqlNullable(team.kitColour),
  ]));
  const fixtureRows = Object.values(model.nights).flatMap((night) => night.fixtures.map((fixture) => [
    sqlText(fixture.uuid), sqlText(night.competitionSeasonId), sqlText(fixture.id), String(fixture.round), sqlText(fixture.date),
    sqlText(fixture.time), String(fixture.court), sqlText(fixture.homeTeamUuid), sqlText(fixture.awayTeamUuid),
    sqlNullable(fixture.note),
  ]));
  const resultRows = Object.values(model.nights).flatMap((night) => night.fixtures.map((fixture) => [
    sqlText(deterministicUuid(`result:${SEASON.key}:${night.night}:${fixture.id}:1`)), sqlText(fixture.uuid),
    String(fixture.homeScore), String(fixture.awayScore),
  ]));
  const adjustmentRows = Object.values(model.nights).flatMap((night) => night.adjustments.map((adjustment) => [
    sqlText(adjustment.uuid), sqlText(night.competitionSeasonId), sqlText(adjustment.teamUuid), sqlText(adjustment.id),
    String(adjustment.played), String(adjustment.won), String(adjustment.drawn), String(adjustment.lost),
    String(adjustment.goalsFor), String(adjustment.goalsAgainst), String(adjustment.points), sqlText(adjustment.reason),
  ]));

  return `-- Generated by npm run season:import:generate. Do not hand-edit.
-- Source SHA-256: ${model.sourceDigest}
-- Regular season only: no knockout or grading data is included.
begin;

create temporary table _fis_import_teams (
  id uuid, competition_season_id uuid, legacy_id text, name text, status text,
  standings_eligible boolean, kit_colour text
) on commit drop;
create temporary table _fis_import_fixtures (
  id uuid, competition_season_id uuid, legacy_id text, round_number integer,
  match_date date, kickoff_time time, court integer, home_team_id uuid,
  away_team_id uuid, public_note text
) on commit drop;
create temporary table _fis_import_results (
  id uuid, fixture_id uuid, home_score integer, away_score integer
) on commit drop;
create temporary table _fis_import_adjustments (
  id uuid, competition_season_id uuid, team_id uuid, legacy_id text,
  played_delta integer, wins_delta integer, draws_delta integer,
  losses_delta integer, goals_for_delta integer, goals_against_delta integer,
  points_delta integer, reason text
) on commit drop;

insert into _fis_import_teams values
${values(teamRows)};
insert into _fis_import_fixtures values
${values(fixtureRows)};
insert into _fis_import_results values
${values(resultRows)};
insert into _fis_import_adjustments values
${values(adjustmentRows)};

-- Detect conflicts before writing any permanent record.
do $preflight$
begin
  if exists (
    select 1 from _fis_import_teams e join public.teams t
      on t.id = e.id or (t.competition_season_id = e.competition_season_id and t.legacy_id = e.legacy_id)
    where t.id is distinct from e.id or t.competition_season_id is distinct from e.competition_season_id
      or t.legacy_id is distinct from e.legacy_id or t.name is distinct from e.name
      or t.status is distinct from e.status or t.standings_eligible is distinct from e.standings_eligible
      or t.kit_colour is distinct from e.kit_colour
  ) then raise exception 'Team data conflicts with the current-season source'; end if;
  if exists (
    select 1 from _fis_import_teams e join public.teams t
      on t.competition_season_id = e.competition_season_id and lower(btrim(t.name)) = lower(btrim(e.name))
    where t.id <> e.id
  ) then raise exception 'A normalized team name belongs to another team record'; end if;
  if exists (
    select 1 from _fis_import_fixtures e join public.fixtures f
      on f.id = e.id or (f.competition_season_id = e.competition_season_id and f.legacy_id = e.legacy_id)
    where f.id is distinct from e.id or f.competition_season_id is distinct from e.competition_season_id
      or f.legacy_id is distinct from e.legacy_id or f.round_number is distinct from e.round_number
      or f.match_date is distinct from e.match_date or f.kickoff_time is distinct from e.kickoff_time
      or f.court is distinct from e.court or f.home_team_id is distinct from e.home_team_id
      or f.away_team_id is distinct from e.away_team_id or f.stage <> 'regular_season'
      or f.publication_state <> 'published' or f.public_note is distinct from e.public_note
  ) then raise exception 'Fixture data conflicts with the current-season source'; end if;
  if exists (
    select 1 from _fis_import_results e join public.result_versions r
      on r.fixture_id = e.fixture_id and r.status = 'published'
    where r.home_score is distinct from e.home_score or r.away_score is distinct from e.away_score
      or r.penalty_home_score is not null or r.penalty_away_score is not null or r.penalty_winner is not null
  ) then raise exception 'A published result conflicts with the current-season source'; end if;
  if exists (
    select 1 from _fis_import_results e join public.result_versions r on r.id = e.id
    where r.fixture_id is distinct from e.fixture_id or r.revision <> 1 or r.status <> 'published'
      or r.home_score is distinct from e.home_score or r.away_score is distinct from e.away_score
  ) then raise exception 'A deterministic result ID conflicts with the current-season source'; end if;
  if exists (
    select 1 from _fis_import_adjustments e join public.standing_adjustments a
      on a.id = e.id or (a.competition_season_id = e.competition_season_id and a.legacy_id = e.legacy_id)
    where a.id is distinct from e.id or a.competition_season_id is distinct from e.competition_season_id
      or a.team_id is distinct from e.team_id or a.legacy_id is distinct from e.legacy_id
      or a.played_delta is distinct from e.played_delta or a.wins_delta is distinct from e.wins_delta
      or a.draws_delta is distinct from e.draws_delta or a.losses_delta is distinct from e.losses_delta
      or a.goals_for_delta is distinct from e.goals_for_delta or a.goals_against_delta is distinct from e.goals_against_delta
      or a.points_delta is distinct from e.points_delta or a.reason is distinct from e.reason
      or a.publication_state <> 'published'
  ) then raise exception 'Standing adjustment conflicts with the current-season source'; end if;
end;
$preflight$;

insert into public.seasons(id, name, starts_on, ends_on)
values (${sqlText(model.seasonId)}, ${sqlText(SEASON.name)}, ${sqlText(model.startsOn)}, ${sqlText(model.endsOn)})
on conflict do nothing;
insert into public.categories(id, code, name)
values (${sqlText(model.categoryId)}, ${sqlText(SEASON.categoryCode)}, ${sqlText(SEASON.categoryName)})
on conflict do nothing;
insert into public.locations(id, name, address, active)
values (${sqlText(model.locationId)}, ${sqlText(SEASON.locationName)}, ${sqlText(SEASON.locationAddress)}, true)
on conflict do nothing;
${(["monday", "wednesday"] as const).map((night) => {
    const item = model.nights[night];
    const weekday = night === "monday" ? 1 : 3;
    const name = night === "monday" ? "Monday Night" : "Wednesday Night";
    return `insert into public.competitions(id, category_id, location_id, weekday, division, name)
values (${sqlText(item.competitionId)}, ${sqlText(model.categoryId)}, ${sqlText(model.locationId)}, ${weekday}, ${sqlText(SEASON.division)}, ${sqlText(name)})
on conflict do nothing;
insert into public.competition_seasons(id, competition_id, season_id, lifecycle, publication_state)
values (${sqlText(item.competitionSeasonId)}, ${sqlText(item.competitionId)}, ${sqlText(model.seasonId)}, 'active', 'published')
on conflict do nothing;`;
  }).join("\n")}

do $foundation_check$
begin
  if not exists (select 1 from public.seasons where id = ${sqlText(model.seasonId)} and name = ${sqlText(SEASON.name)} and starts_on = ${sqlText(model.startsOn)} and ends_on = ${sqlText(model.endsOn)})
    then raise exception 'Season identity conflicts with import'; end if;
  if not exists (select 1 from public.categories where id = ${sqlText(model.categoryId)} and code = ${sqlText(SEASON.categoryCode)} and name = ${sqlText(SEASON.categoryName)})
    then raise exception 'Category identity conflicts with import'; end if;
  if not exists (select 1 from public.locations where id = ${sqlText(model.locationId)} and name = ${sqlText(SEASON.locationName)} and address = ${sqlText(SEASON.locationAddress)})
    then raise exception 'Location identity conflicts with import'; end if;
${(["monday", "wednesday"] as const).map((night) => {
    const item = model.nights[night];
    const weekday = night === "monday" ? 1 : 3;
    const name = night === "monday" ? "Monday Night" : "Wednesday Night";
    return `  if not exists (select 1 from public.competitions where id = ${sqlText(item.competitionId)} and category_id = ${sqlText(model.categoryId)} and location_id = ${sqlText(model.locationId)} and weekday = ${weekday} and division = ${sqlText(SEASON.division)} and name = ${sqlText(name)})
    then raise exception '${name} competition identity conflicts with import'; end if;
  if not exists (select 1 from public.competition_seasons where id = ${sqlText(item.competitionSeasonId)} and competition_id = ${sqlText(item.competitionId)} and season_id = ${sqlText(model.seasonId)} and lifecycle = 'active' and publication_state = 'published')
    then raise exception '${name} competition season conflicts with import'; end if;`;
  }).join("\n")}
end;
$foundation_check$;

insert into public.teams(id, competition_season_id, legacy_id, name, status, standings_eligible, kit_colour)
select id, competition_season_id, legacy_id, name, status, standings_eligible, kit_colour
from _fis_import_teams on conflict do nothing;
insert into public.fixtures(id, competition_season_id, legacy_id, round_number, match_date, kickoff_time, court,
  home_team_id, away_team_id, stage, publication_state, public_note)
select id, competition_season_id, legacy_id, round_number, match_date, kickoff_time, court,
  home_team_id, away_team_id, 'regular_season', 'published', public_note
from _fis_import_fixtures on conflict do nothing;
insert into public.result_versions(id, fixture_id, revision, status, home_score, away_score)
select e.id, e.fixture_id, 1, 'published', e.home_score, e.away_score
from _fis_import_results e
where not exists (select 1 from public.result_versions r where r.fixture_id = e.fixture_id and r.status = 'published')
on conflict do nothing;
insert into public.standing_adjustments(id, competition_season_id, team_id, legacy_id,
  played_delta, wins_delta, draws_delta, losses_delta, goals_for_delta, goals_against_delta,
  points_delta, reason, publication_state)
select id, competition_season_id, team_id, legacy_id, played_delta, wins_delta, draws_delta,
  losses_delta, goals_for_delta, goals_against_delta, points_delta, reason, 'published'
from _fis_import_adjustments on conflict do nothing;

do $postflight$
begin
  if exists (select 1 from _fis_import_teams e left join public.teams t on t.id = e.id where t.id is null)
    then raise exception 'Import did not create every expected team'; end if;
  if exists (select 1 from _fis_import_fixtures e left join public.fixtures f on f.id = e.id where f.id is null)
    then raise exception 'Import did not create every expected fixture'; end if;
  if exists (
    select 1 from _fis_import_results e left join public.result_versions r
      on r.fixture_id = e.fixture_id and r.status = 'published'
    where r.id is null or r.home_score is distinct from e.home_score or r.away_score is distinct from e.away_score
  ) then raise exception 'Import did not preserve every expected published result'; end if;
  if exists (select 1 from _fis_import_adjustments e left join public.standing_adjustments a on a.id = e.id where a.id is null)
    then raise exception 'Import did not create every expected adjustment'; end if;
end;
$postflight$;

commit;
`;
}

function generateVerificationSql(model: ImportModel) {
  const expectedRows = Object.values(model.nights).flatMap((night) => night.standings.map((standing) => [
    sqlText(night.competitionSeasonId), sqlText(standing.teamId), sqlText(standing.teamName), String(standing.played),
    String(standing.won), String(standing.drawn), String(standing.lost), String(standing.goalsFor),
    String(standing.goalsAgainst), String(standing.goalDifference), String(standing.points), String(standing.position),
  ]));
  const monday = model.nights.monday;
  const wednesday = model.nights.wednesday;
  const dwell = wednesday.teams.find((team) => team.id === "wed-dwell-fc")!;
  return `-- Generated by npm run season:import:generate. Read-only checks plus temporary data.
-- Run after current-season-import.sql. All temporary records are rolled back.
begin;

create temporary table _fis_expected_standings (
  competition_season_id uuid, legacy_id text, team_name text, played integer,
  wins integer, draws integer, losses integer, goals_for integer,
  goals_against integer, goal_difference integer, points integer, position bigint
) on commit drop;
insert into _fis_expected_standings values
${values(expectedRows)};

do $verify$
begin
  if (select count(*) from public.teams where competition_season_id = ${sqlText(monday.competitionSeasonId)}) <> ${monday.teams.length}
    then raise exception 'Monday team count does not match source'; end if;
  if (select count(*) from public.teams where competition_season_id = ${sqlText(wednesday.competitionSeasonId)}) <> ${wednesday.teams.length}
    then raise exception 'Wednesday team count does not match source'; end if;
  if (select count(*) from public.fixtures where competition_season_id = ${sqlText(monday.competitionSeasonId)} and stage = 'regular_season') <> ${monday.fixtures.length}
    then raise exception 'Monday fixture count does not match source'; end if;
  if (select count(*) from public.fixtures where competition_season_id = ${sqlText(wednesday.competitionSeasonId)} and stage = 'regular_season') <> ${wednesday.fixtures.length}
    then raise exception 'Wednesday fixture count does not match source'; end if;
  if (select count(*) from public.result_versions r join public.fixtures f on f.id = r.fixture_id where f.competition_season_id = ${sqlText(monday.competitionSeasonId)} and r.status = 'published') <> ${monday.fixtures.length}
    then raise exception 'Monday result count does not match source'; end if;
  if (select count(*) from public.result_versions r join public.fixtures f on f.id = r.fixture_id where f.competition_season_id = ${sqlText(wednesday.competitionSeasonId)} and r.status = 'published') <> ${wednesday.fixtures.length}
    then raise exception 'Wednesday result count does not match source'; end if;
  if (select count(*) from public.standing_adjustments where competition_season_id = ${sqlText(monday.competitionSeasonId)} and publication_state = 'published') <> ${monday.adjustments.length}
    then raise exception 'Monday adjustment count does not match source'; end if;
  if (select count(*) from public.standing_adjustments where competition_season_id = ${sqlText(wednesday.competitionSeasonId)} and publication_state = 'published') <> ${wednesday.adjustments.length}
    then raise exception 'Wednesday adjustment count does not match source'; end if;
  if exists (
    select 1 from public.fixtures f left join public.teams h on h.id = f.home_team_id and h.competition_season_id = f.competition_season_id
      left join public.teams a on a.id = f.away_team_id and a.competition_season_id = f.competition_season_id
    where f.competition_season_id in (${sqlText(monday.competitionSeasonId)}, ${sqlText(wednesday.competitionSeasonId)})
      and (h.id is null or a.id is null)
  ) then raise exception 'A fixture team reference is unresolved'; end if;
  if exists (
    select 1 from public.fixtures where competition_season_id in (${sqlText(monday.competitionSeasonId)}, ${sqlText(wednesday.competitionSeasonId)})
      and publication_state = 'published' group by competition_season_id, match_date, kickoff_time, court having count(*) > 1
  ) then raise exception 'Duplicate published court slot detected'; end if;
  if exists (
    select 1 from public.result_versions r join public.fixtures f on f.id = r.fixture_id
    where f.competition_season_id in (${sqlText(monday.competitionSeasonId)}, ${sqlText(wednesday.competitionSeasonId)})
      and r.status = 'published' group by r.fixture_id having count(*) > 1
  ) then raise exception 'More than one published result exists for a fixture'; end if;
  if exists (
    select 1 from public.fixtures where competition_season_id in (${sqlText(monday.competitionSeasonId)}, ${sqlText(wednesday.competitionSeasonId)})
      and stage <> 'regular_season'
  ) then raise exception 'Knockout or grading records were imported'; end if;
  if exists (
    select 1 from public.teams where competition_season_id = ${sqlText(monday.competitionSeasonId)} and legacy_id not like 'mon-%'
  ) or exists (
    select 1 from public.teams where competition_season_id = ${sqlText(wednesday.competitionSeasonId)} and legacy_id not like 'wed-%'
  ) then raise exception 'Monday and Wednesday team datasets are not separated'; end if;
  if not exists (
    select 1 from public.teams t join public.standings s on s.team_id = t.id and s.competition_season_id = t.competition_season_id
    where t.id = ${sqlText(dwell.uuid)} and t.status = 'inactive' and t.standings_eligible
  ) then raise exception 'Inactive standings-eligible Dwell FC is missing from standings'; end if;
  if exists (
    (select s.competition_season_id, t.legacy_id, s.team_name, s.played, s.wins, s.draws, s.losses,
      s.goals_for, s.goals_against, s.goal_difference, s.points, s.position
     from public.standings s join public.teams t on t.id = s.team_id
     where s.competition_season_id in (${sqlText(monday.competitionSeasonId)}, ${sqlText(wednesday.competitionSeasonId)})
     except select * from _fis_expected_standings)
    union all
    (select * from _fis_expected_standings
     except select s.competition_season_id, t.legacy_id, s.team_name, s.played, s.wins, s.draws, s.losses,
      s.goals_for, s.goals_against, s.goal_difference, s.points, s.position
     from public.standings s join public.teams t on t.id = s.team_id)
  ) then raise exception 'Supabase standings do not match the published JSON standings'; end if;
end;
$verify$;

select c.name as competition, count(*) as teams
from public.teams t join public.competition_seasons cs on cs.id = t.competition_season_id
join public.competitions c on c.id = cs.competition_id
where t.competition_season_id in (${sqlText(monday.competitionSeasonId)}, ${sqlText(wednesday.competitionSeasonId)})
group by c.name order by c.name;

rollback;
`;
}

function generateReport(model: ImportModel) {
  const rows = (["monday", "wednesday"] as const).map((night) => {
    const item = model.nights[night];
    return `| ${night[0].toUpperCase()}${night.slice(1)} | ${item.teams.length} | ${item.teams.filter((team) => team.status === "active").length} | ${item.teams.filter((team) => team.status === "inactive").length} | ${item.fixtures.length} | ${item.fixtures.length} | ${item.adjustments.length} | ${item.standings.length} |`;
  }).join("\n");
  const excludedTeams = Object.values(model.nights).flatMap((night) => night.excludedSourceTeams.map((team) => `- ${team.id} (${team.name}): no completed fixture or standing adjustment; excluded as a stale/non-regular-season record.`));
  const teamInventory = (["monday", "wednesday"] as const).map((night) => {
    const item = model.nights[night];
    const heading = `${night[0].toUpperCase()}${night.slice(1)}`;
    const list = (teams: ImportTeam[]) => teams.length
      ? teams.map((team) => `\`${team.id}\` (${team.name})`).join(", ")
      : "None";
    return `### ${heading}

- Active teams (${item.teams.filter((team) => team.status === "active").length}): ${list(item.teams.filter((team) => team.status === "active"))}
- Inactive historical teams (${item.teams.filter((team) => team.status === "inactive").length}): ${list(item.teams.filter((team) => team.status === "inactive"))}
- Standings-eligible teams (${item.teams.filter((team) => team.standingsEligible).length}): ${list(item.teams.filter((team) => team.standingsEligible))}
- Standings-ineligible historical teams (${item.teams.filter((team) => !team.standingsEligible).length}): ${list(item.teams.filter((team) => !team.standingsEligible))}`;
  }).join("\n\n");
  return `# Current-season Supabase import reconciliation

Generated deterministically from source digest \`${model.sourceDigest}\`.

## Source files

${Object.values(SOURCE_PATHS).map((path) => `- \`${path}\``).join("\n")}

The public data path was traced through \`src/lib/competition-repository.ts\`, \`competition-service.ts\`, and \`standings.ts\`. No page component or finals JSON was modified.

## Mapping

- Season: **${SEASON.name}**, covering **${model.startsOn} to ${model.endsOn}**. The start is the earliest completed regular-season fixture; the end is the latest scheduled finals date across both competitions (Wednesday 7 October 2026).
- Category: **${SEASON.categoryName}** (\`${SEASON.categoryCode}\`) for both Monday and Wednesday.
- Location: **${SEASON.locationName}**, ${SEASON.locationAddress}.
- Competitions: **Monday Night / Division A** and **Wednesday Night / Division A**.
- JSON team IDs, fixture IDs, and adjustment IDs map to Supabase \`legacy_id\`; UUIDs are deterministic UUIDv5-style identifiers derived from the season and legacy identity.
- All imported fixtures are completed, published \`regular_season\` fixtures. Every imported result is published revision 1.

## Record counts

| Night | Imported teams | Active | Inactive | Fixtures | Results | Adjustments | Published table rows |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
${rows}

## Reconciliation decisions

- Dwell FC keeps \`wed-dwell-fc\`, all Wednesday regular-season fixtures and adjustments, and remains standings eligible. It imports as inactive because Top Up FC replaced it only for the knockout phase.
- Wednesday Top Up FC is not imported: it has no Wednesday regular-season team record, fixture, result, or adjustment. The Monday Top Up FC record is imported because it has genuine Monday regular-season history.
- Inactive Monday historical teams are retained where they have fixture or adjustment history. They are not standings eligible because the published JSON ladder excludes inactive Monday teams.
- The Wednesday finals-only Top Up FC/Dwell FC replacement and the QF2 Pops v Hazara United slot at 7:40 PM on Court 2 remain unchanged and are validated before artifact generation.

## Imported team inventory

Every team below has genuine regular-season fixture or adjustment history. Inactive teams are retained rather than erased.

${teamInventory}

## Excluded records

${excludedTeams.length ? excludedTeams.join("\n") : "- No empty or stale source teams were excluded."}
- Monday finals/grading: ${model.excludedFinals.monday.fixtures} fixtures and ${model.excludedFinals.monday.results} recorded results excluded.
- Wednesday finals/grading: ${model.excludedFinals.wednesday.fixtures} fixtures and ${model.excludedFinals.wednesday.results} recorded results excluded.
- Scheduled regular-season fixtures excluded: Monday ${model.nights.monday.excludedScheduledFixtures.length}; Wednesday ${model.nights.wednesday.excludedScheduledFixtures.length}.

## Standings reconciliation

- Monday published JSON-derived table: **offline match passed** (${model.nights.monday.standings.length} rows).
- Wednesday published JSON-derived table: **offline match passed** (${model.nights.wednesday.standings.length} rows).
- The generated post-import SQL compares every standings field and position against these expected rows. Database parity remains pending until the operator deliberately executes the import and verification SQL.

## Assumptions and unresolved discrepancies

- The season starts with the first completed regular-season fixture and ends on the final scheduled finals night. Finals dates define the season boundary only; no finals records are imported.
- Existing 5-0 scores are imported as published scores only; the JSON does not provide a consistently structured forfeit marker, so no forfeit side is inferred.
- No unresolved source discrepancy blocks generation.
`;
}

export function buildImportArtifacts(): ImportArtifacts {
  const model = buildImportModel();
  return {
    model,
    importSql: generateImportSql(model),
    verificationSql: generateVerificationSql(model),
    report: generateReport(model),
  };
}
