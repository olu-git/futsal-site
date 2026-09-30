import { mapPublishedCompetition, selectPublicEditions, type PublishedCompetitionRows } from "./public-competition";
import type { CompetitionDataset } from "./competition-repository";
import type { CompetitionNight, Fixture, StandingAdjustment, Team } from "./types";

export interface PublicSnapshot {
  format: "fis-public-competition-v1";
  notice: "Generated from published regular-season Supabase data. Do not edit manually.";
  data: CompetitionDataset;
}

const nights: CompetitionNight[] = ["monday", "wednesday"];
const byText = (a: string, b: string) => a.localeCompare(b, "en");

export function buildPublicSnapshot(rows: PublishedCompetitionRows): PublicSnapshot {
  const editions = selectPublicEditions(rows.editions);
  const editionIds = new Set(editions.map((row) => row.id));
  const sourceTeams = rows.teams.filter((row) => editionIds.has(row.competition_season_id));
  const idMap = new Map<string, string>();
  for (const team of sourceTeams) {
    if (!team.legacy_id) throw new Error(`Team ${team.name} has no public legacy ID.`);
    if (idMap.has(team.id)) throw new Error("Duplicate source team ID.");
    idMap.set(team.id, team.legacy_id);
  }
  for (const fixture of rows.fixtures.filter((row) => editionIds.has(row.competition_season_id) && row.stage === "regular_season" && row.publication_state === "published")) {
    if (!fixture.legacy_id) throw new Error("A published fixture has no public legacy ID.");
  }
  for (const adjustment of rows.adjustments.filter((row) => editionIds.has(row.competition_season_id) && row.publication_state === "published")) {
    if (!adjustment.legacy_id) throw new Error("A published adjustment has no public legacy ID.");
  }

  const mapped = mapPublishedCompetition(editions, sourceTeams, rows.fixtures, rows.results, rows.adjustments);
  const teams: Team[] = mapped.teams.map((team) => ({
    id: idMap.get(team.id)!, name: team.name, night: team.night, division: team.division,
    active: team.active === true, standingsEligible: team.standingsEligible === true,
    ...(team.kitColour ? { kitColour: team.kitColour } : {}),
  })).sort((a, b) => byText(a.night, b.night) || byText(a.division, b.division) || byText(a.name, b.name) || byText(a.id, b.id));
  const fixtures: Fixture[] = mapped.fixtures.map((fixture) => ({
    id: fixture.id, night: fixture.night, division: fixture.division, round: fixture.round,
    date: fixture.date, time: fixture.time, court: fixture.court,
    homeTeam: idMap.get(fixture.homeTeam)!, awayTeam: idMap.get(fixture.awayTeam)!,
    ...(fixture.status === "completed" ? { homeScore: fixture.homeScore, awayScore: fixture.awayScore } : {}),
    ...(fixture.note ? { note: fixture.note } : {}), status: fixture.status,
  })).sort((a, b) => byText(a.night, b.night) || byText(a.date, b.date) || byText(a.time, b.time) || a.court - b.court || byText(a.id, b.id));
  const standingsAdjustments: StandingAdjustment[] = mapped.standingsAdjustments.map((adjustment) => ({
    id: adjustment.id, night: adjustment.night, division: adjustment.division,
    teamId: idMap.get(adjustment.teamId)!, played: adjustment.played, won: adjustment.won,
    drawn: adjustment.drawn, lost: adjustment.lost, goalsFor: adjustment.goalsFor,
    goalsAgainst: adjustment.goalsAgainst, points: adjustment.points,
    ...(adjustment.note ? { note: adjustment.note } : {}),
  })).sort((a, b) => byText(a.night, b.night) || byText(a.division, b.division) || byText(a.teamId, b.teamId) || byText(a.id, b.id));
  const snapshot: PublicSnapshot = {
    format: "fis-public-competition-v1",
    notice: "Generated from published regular-season Supabase data. Do not edit manually.",
    data: { teams, fixtures, standingsAdjustments },
  };
  validatePublicSnapshot(snapshot);
  return snapshot;
}

export function serializePublicSnapshot(snapshot: PublicSnapshot): string {
  validatePublicSnapshot(snapshot);
  return `${JSON.stringify(snapshot, null, 2)}\n`;
}

export function validatePublicSnapshot(value: unknown): asserts value is PublicSnapshot {
  if (!value || typeof value !== "object") throw new Error("Snapshot must be an object.");
  const snapshot = value as Partial<PublicSnapshot>;
  if (snapshot.format !== "fis-public-competition-v1" || !snapshot.data) throw new Error("Unsupported public snapshot format.");
  const { teams, fixtures, standingsAdjustments } = snapshot.data;
  if (!Array.isArray(teams) || !Array.isArray(fixtures) || !Array.isArray(standingsAdjustments)) throw new Error("Snapshot arrays are missing.");
  const teamIds = new Map<string, Team>();
  const fixtureIds = new Set<string>();
  const slots = new Set<string>();
  const adjustmentIds = new Set<string>();
  const validNight = (night: string) => nights.includes(night as CompetitionNight);
  const validDate = (date: string) => /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(Date.parse(`${date}T00:00:00Z`)) && new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) === date;
  const validTime = (time: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(time);
  const integer = (n: unknown) => Number.isInteger(n);
  for (const team of teams) {
    if (!team || typeof team.id !== "string" || !team.id || teamIds.has(team.id) || typeof team.name !== "string" || !team.name.trim() ||
      !validNight(team.night) || !["A", "B"].includes(team.division) || typeof team.active !== "boolean" || typeof team.standingsEligible !== "boolean" ||
      (team.kitColour !== undefined && !/^#[0-9a-fA-F]{6}$/.test(team.kitColour))) throw new Error("Invalid or duplicate snapshot team.");
    teamIds.set(team.id, team);
  }
  for (const fixture of fixtures) {
    const home = teamIds.get(fixture?.homeTeam);
    const away = teamIds.get(fixture?.awayTeam);
    const slot = `${fixture?.night}:${fixture?.date}:${fixture?.time}:${fixture?.court}`;
    if (!fixture || typeof fixture.id !== "string" || !fixture.id || fixtureIds.has(fixture.id) || !validNight(fixture.night) ||
      !["A", "B"].includes(fixture.division) || !integer(fixture.round) || fixture.round < 1 || !validDate(fixture.date) ||
      !validTime(fixture.time) || !integer(fixture.court) || fixture.court < 1 || slots.has(slot) || !home || !away || home.id === away.id ||
      home.night !== fixture.night || away.night !== fixture.night || home.division !== fixture.division || away.division !== fixture.division ||
      !["scheduled", "completed"].includes(fixture.status) ||
      (fixture.status === "completed" && (!integer(fixture.homeScore) || !integer(fixture.awayScore) || fixture.homeScore! < 0 || fixture.awayScore! < 0)) ||
      (fixture.status === "scheduled" && (fixture.homeScore !== undefined || fixture.awayScore !== undefined))) throw new Error("Invalid, unresolved, or duplicate snapshot fixture.");
    fixtureIds.add(fixture.id); slots.add(slot);
  }
  for (const adjustment of standingsAdjustments) {
    const team = teamIds.get(adjustment?.teamId);
    if (!adjustment || typeof adjustment.id !== "string" || !adjustment.id || adjustmentIds.has(adjustment.id) || !team ||
      team.night !== adjustment.night || team.division !== adjustment.division ||
      ![adjustment.played, adjustment.won, adjustment.drawn, adjustment.lost, adjustment.goalsFor, adjustment.goalsAgainst, adjustment.points].every(integer))
      throw new Error("Invalid or duplicate snapshot standing adjustment.");
    adjustmentIds.add(adjustment.id);
  }
  for (const night of nights) {
    if (!teams.some((team) => team.night === night) || !fixtures.some((fixture) => fixture.night === night && fixture.status === "completed"))
      throw new Error(`Published ${night} history is missing from the snapshot.`);
  }
}
