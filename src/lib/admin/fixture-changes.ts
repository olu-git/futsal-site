export type ChangeOperation = "update" | "create" | "cancel";
export type ChangeSetStatus = "draft" | "pending_review" | "published" | "cancelled";
export type ChangeSetSource = "manual" | "json_upload" | "system_import";
export type ValidationSeverity = "blocking" | "warning" | "info";
export type Night = "monday" | "wednesday";

export interface FixtureProposal {
  roundNumber: number;
  date: string;
  kickoffTime: string;
  court: number;
  homeTeamId: string;
  awayTeamId: string;
  publicationState: "published";
}

export interface FixtureChange {
  operation: ChangeOperation;
  fixtureId?: string;
  expectedFixtureVersion?: number;
  reason: string;
  proposed?: FixtureProposal;
  homeTeamName?: string;
  awayTeamName?: string;
}

export interface FixtureChangeUpload {
  schemaVersion: 1;
  competition: { night: Night; season: string; competitionSeasonId: string };
  title: string;
  overallNote?: string;
  changes: FixtureChange[];
}

export interface ScheduleFixture {
  id: string;
  competitionSeasonId: string;
  stage: "regular_season" | "knockout" | "grading";
  publicationState: "draft" | "published";
  scheduleStatus: "scheduled" | "cancelled";
  scheduleVersion: number;
  hasPublishedResult: boolean;
  roundNumber: number;
  date: string;
  kickoffTime: string;
  court: number;
  homeTeamId: string;
  awayTeamId: string;
}

export interface ScheduleTeam {
  id: string;
  name: string;
  competitionSeasonId: string;
  status: "active" | "inactive" | "withdrawn" | "replaced";
}

export interface KickoffPreference { teamId: string; kickoffTime: string; classification: "required" | "preferred" | "avoid" }
export interface FixtureNote { teamId: string; notes: string }
export interface ScheduleCompetition { id: string; locationId: string }
export interface ScheduleCompetitionSeason {
  id: string;
  competitionId: string;
  lifecycle: "planned" | "active" | "archived";
  publicationState: "draft" | "published";
}
export interface ValidationMessage {
  severity: ValidationSeverity;
  code: string;
  itemIndex: number | null;
  fixtureId?: string;
  teamId?: string;
  message: string;
}

export interface FixtureChangeContext {
  competitionSeasonId: string;
  night: Night;
  season: string;
  lifecycle: "planned" | "active" | "archived";
  competitions: ScheduleCompetition[];
  competitionSeasons: ScheduleCompetitionSeason[];
  // Includes published fixtures from every relevant competition at the location.
  fixtures: ScheduleFixture[];
  teams: ScheduleTeam[];
  preferences: KickoffPreference[];
  notes: FixtureNote[];
  today?: string;
}

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const time = /^([01]\d|2[0-3]):[0-5]\d$/;
const object = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === "object" && !Array.isArray(value);
const nonempty = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0;
const positive = (value: unknown): value is number => Number.isInteger(value) && Number(value) > 0;
const validDate = (value: unknown): value is string => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  !Number.isNaN(Date.parse(`${value}T00:00:00Z`)) && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;

function keys(value: Record<string, unknown>, allowed: string[], path: string) {
  const unknown = Object.keys(value).find((key) => !allowed.includes(key));
  if (unknown) throw new Error(`${path}: unknown field ${unknown}.`);
}

export function parseFixtureChangeUpload(input: string | unknown): FixtureChangeUpload {
  let value: unknown;
  try { value = typeof input === "string" ? JSON.parse(input) : input; }
  catch { throw new Error("Malformed fixture change JSON."); }
  if (!object(value)) throw new Error("Fixture change upload must be an object.");
  keys(value, ["schemaVersion", "competition", "title", "overallNote", "changes"], "upload");
  if (value.schemaVersion !== 1) throw new Error("Unsupported fixture change schema version.");
  if (!object(value.competition)) throw new Error("Competition identity is required.");
  keys(value.competition, ["night", "season", "competitionSeasonId"], "competition");
  if (!["monday", "wednesday"].includes(String(value.competition.night)) || !nonempty(value.competition.season) ||
      typeof value.competition.competitionSeasonId !== "string" || !uuid.test(value.competition.competitionSeasonId)) throw new Error("Invalid competition identity.");
  if (!nonempty(value.title) || (value.overallNote !== undefined && typeof value.overallNote !== "string")) throw new Error("A title and valid overall note are required.");
  if (!Array.isArray(value.changes) || !value.changes.length) throw new Error("At least one change is required.");
  for (const [index, change] of value.changes.entries()) {
    if (!object(change)) throw new Error(`Change ${index + 1} must be an object.`);
    keys(change, ["operation", "fixtureId", "expectedFixtureVersion", "reason", "proposed", "homeTeamName", "awayTeamName"], `change ${index + 1}`);
    if (!["update", "create", "cancel"].includes(String(change.operation)) || !nonempty(change.reason)) throw new Error(`Change ${index + 1} needs an operation and reason.`);
    if (["update", "cancel"].includes(String(change.operation))) {
      if (typeof change.fixtureId !== "string" || !uuid.test(change.fixtureId) || !positive(change.expectedFixtureVersion)) throw new Error(`Change ${index + 1} needs a fixture ID and expected version.`);
    } else if (change.fixtureId !== undefined || change.expectedFixtureVersion !== undefined) throw new Error(`New fixture ${index + 1} cannot reference an existing fixture.`);
    if (change.operation === "cancel") {
      if (change.proposed !== undefined) throw new Error(`Cancellation ${index + 1} cannot propose a replacement schedule.`);
    } else {
      if (!object(change.proposed)) throw new Error(`Change ${index + 1} needs a proposed fixture.`);
      keys(change.proposed, ["roundNumber", "date", "kickoffTime", "court", "homeTeamId", "awayTeamId", "publicationState"], `change ${index + 1} proposal`);
      const p = change.proposed;
      if (!positive(p.roundNumber) || !validDate(p.date) || typeof p.kickoffTime !== "string" || !time.test(p.kickoffTime) ||
        !positive(p.court) || typeof p.homeTeamId !== "string" || !uuid.test(p.homeTeamId) ||
        typeof p.awayTeamId !== "string" || !uuid.test(p.awayTeamId) || p.publicationState !== "published") throw new Error(`Change ${index + 1} has an invalid proposal.`);
    }
    if ((change.homeTeamName !== undefined && typeof change.homeTeamName !== "string") ||
        (change.awayTeamName !== undefined && typeof change.awayTeamName !== "string")) throw new Error(`Change ${index + 1} has an invalid display name.`);
  }
  return value as unknown as FixtureChangeUpload;
}

const ordering = { blocking: 0, warning: 1, info: 2 };

export function validateFixtureChanges(upload: FixtureChangeUpload, context: FixtureChangeContext): ValidationMessage[] {
  const messages: ValidationMessage[] = [];
  const add = (severity: ValidationSeverity, code: string, itemIndex: number | null, message: string, fixtureId?: string, teamId?: string) => {
    messages.push({ severity, code, itemIndex, ...(fixtureId ? { fixtureId } : {}), ...(teamId ? { teamId } : {}), message });
  };
  if (upload.competition.competitionSeasonId !== context.competitionSeasonId || upload.competition.night !== context.night || upload.competition.season !== context.season)
    add("blocking", "competition_mismatch", null, "The upload targets a different competition season or night.");
  if (context.lifecycle === "archived") add("blocking", "archived_season", null, "Archived competition seasons cannot be changed.");
  const competitions = new Map(context.competitions.map((competition) => [competition.id, competition]));
  const editions = new Map(context.competitionSeasons.map((edition) => [edition.id, edition]));
  const locationId = competitions.get(editions.get(context.competitionSeasonId)?.competitionId ?? "")?.locationId;
  if (!locationId) add("blocking", "unknown_location", null, "The competition's physical location could not be resolved.");
  if (context.fixtures.some((fixture) => !competitions.get(editions.get(fixture.competitionSeasonId)?.competitionId ?? "")?.locationId))
    add("blocking", "incomplete_occupancy_context", null, "Fixture location relationships are incomplete; venue occupancy cannot be verified.");
  const fixtures = new Map(context.fixtures.map((fixture) => [fixture.id, fixture]));
  const teams = new Map(context.teams.map((team) => [team.id, team]));
  const targeted = new Set<string>();
  const projected: Array<ScheduleFixture & { itemIndex: number | null }> = context.fixtures
    .filter((fixture) => {
      const edition = editions.get(fixture.competitionSeasonId);
      return Boolean(locationId && edition && edition.lifecycle !== "archived" &&
        (edition.lifecycle === "active" || edition.publicationState === "published") &&
        competitions.get(edition.competitionId)?.locationId === locationId &&
        fixture.publicationState === "published" && fixture.scheduleStatus === "scheduled");
    })
    .map((fixture) => ({ ...fixture, itemIndex: null }));
  const cancelledRounds = new Set<number>();
  upload.changes.forEach((change, index) => {
    const original = change.fixtureId ? fixtures.get(change.fixtureId) : undefined;
    if (change.fixtureId) {
      if (targeted.has(change.fixtureId)) add("blocking", "duplicate_target", index, "Another item already changes this fixture.", change.fixtureId);
      targeted.add(change.fixtureId);
      if (!original) add("blocking", "unknown_fixture", index, "Fixture ID was not found.", change.fixtureId);
      else {
        if (original.competitionSeasonId !== context.competitionSeasonId) add("blocking", "cross_competition_fixture", index, "Fixture belongs to a different competition season.", original.id);
        if (original.stage !== "regular_season") add("blocking", "non_regular_fixture", index, "Finals and grading fixtures are not managed here.", original.id);
        if (original.publicationState !== "published" || original.scheduleStatus !== "scheduled") add("blocking", "fixture_not_current", index, "The referenced fixture is not currently published.", original.id);
        if (original.scheduleVersion !== change.expectedFixtureVersion) add("blocking", "stale_fixture", index, "Fixture has changed since this plan was prepared.", original.id);
        if (original.hasPublishedResult) add("blocking", "completed_fixture", index, "A fixture with a published result cannot be rescheduled or cancelled.", original.id);
        if (context.today && original.date < context.today) add("blocking", "past_fixture", index, "A past fixture cannot be rescheduled or cancelled.", original.id);
        const position = projected.findIndex((fixture) => fixture.id === original.id &&
          original.competitionSeasonId === context.competitionSeasonId && original.stage === "regular_season");
        if (position >= 0) projected.splice(position, 1);
        if (change.operation === "cancel") cancelledRounds.add(original.roundNumber);
      }
    }
    if (change.operation === "cancel") return;
    const p = change.proposed;
    if (!p || !positive(p.roundNumber) || !validDate(p.date) || !time.test(p.kickoffTime) || !positive(p.court)) {
      add("blocking", "invalid_schedule", index, "Proposal has an invalid round, date, time or court.", change.fixtureId);
      return;
    }
    if (context.today && p.date < context.today) add("blocking", "past_schedule", index, "New schedules must be in the future.", change.fixtureId);
    if (p.homeTeamId === p.awayTeamId) add("blocking", "same_team", index, "A team cannot play itself.", change.fixtureId, p.homeTeamId);
    for (const [side, teamId, displayName] of [["home", p.homeTeamId, change.homeTeamName], ["away", p.awayTeamId, change.awayTeamName]] as const) {
      const team = teams.get(teamId);
      if (!team) add("blocking", "unknown_team", index, `${side} team ID was not found.`, change.fixtureId, teamId);
      else if (team.competitionSeasonId !== context.competitionSeasonId) add("blocking", "cross_competition_team", index, `${side} team belongs to another competition season.`, change.fixtureId, teamId);
      else {
        if (displayName && displayName.trim().toLowerCase() !== team.name.trim().toLowerCase()) add("warning", "name_id_mismatch", index, `${side} display name does not match the team ID; the ID will be used.`, change.fixtureId, teamId);
        if (team.status !== "active") add("warning", "inactive_team", index, `${team.name} is ${team.status}.`, change.fixtureId, teamId);
        if (context.notes.some((note) => note.teamId === teamId)) add("warning", "team_note", index, `${team.name} has an admin fixture note to review.`, change.fixtureId, teamId);
        const prefs = context.preferences.filter((pref) => pref.teamId === teamId);
        if (prefs.some((pref) => pref.classification === "required") && !prefs.some((pref) => pref.classification === "required" && pref.kickoffTime === p.kickoffTime))
          add("warning", "required_time", index, `${team.name}'s required kick-off time is not met.`, change.fixtureId, teamId);
        if (prefs.some((pref) => pref.classification === "avoid" && pref.kickoffTime === p.kickoffTime))
          add("warning", "avoid_time", index, `${team.name} prefers to avoid this kick-off time.`, change.fixtureId, teamId);
        if (prefs.some((pref) => pref.classification === "preferred") && !prefs.some((pref) => pref.classification === "preferred" && pref.kickoffTime === p.kickoffTime))
          add("warning", "preferred_time", index, `${team.name}'s preferred kick-off time is not met.`, change.fixtureId, teamId);
      }
    }
    if (change.operation === "create") add("warning", "new_slot", index, "This fixture adds a new schedule slot rather than replacing an existing one.");
    projected.push({ ...(original ?? { id: `new:${index}`, competitionSeasonId: context.competitionSeasonId, stage: "regular_season", publicationState: "published", scheduleStatus: "scheduled", scheduleVersion: 1, hasPublishedResult: false }),
      ...p, itemIndex: index });
  });
  for (const [index, fixture] of projected.entries()) {
    const collision = projected.find((other, otherIndex) => otherIndex !== index && other.date === fixture.date && other.kickoffTime === fixture.kickoffTime && other.court === fixture.court);
    if (collision && fixture.itemIndex !== null) add("blocking", "court_collision", fixture.itemIndex, "Another fixture already occupies this court, date and time.", fixture.id);
    const teamCollision = projected.find((other, otherIndex) => otherIndex !== index && other.date === fixture.date && other.kickoffTime === fixture.kickoffTime &&
      [fixture.homeTeamId, fixture.awayTeamId].some((id) => id === other.homeTeamId || id === other.awayTeamId));
    if (teamCollision && fixture.itemIndex !== null) add("blocking", "team_time_collision", fixture.itemIndex, "A team is scheduled in two matches at the same time.", fixture.id);
    if (fixture.itemIndex !== null) {
      for (const teamId of [fixture.homeTeamId, fixture.awayTeamId]) {
        const near = projected.find((other, otherIndex) => otherIndex !== index && (other.homeTeamId === teamId || other.awayTeamId === teamId) &&
          Math.abs(Date.parse(`${fixture.date}T00:00:00Z`) - Date.parse(`${other.date}T00:00:00Z`)) < 7 * 86_400_000 && fixture.date !== other.date);
        if (near) add("warning", "short_turnaround", fixture.itemIndex, "This team has another match within seven days.", fixture.id, teamId);
      }
    }
  }
  for (const round of cancelledRounds) {
    if (projected.filter((fixture) => fixture.competitionSeasonId === context.competitionSeasonId &&
      fixture.stage === "regular_season" && fixture.roundNumber === round).length % 2 === 1)
      add("warning", "uneven_round", null, `Round ${round} has an odd number of fixtures after cancellation.`);
  }
  return messages.sort((a, b) => (a.itemIndex ?? -1) - (b.itemIndex ?? -1) || ordering[a.severity] - ordering[b.severity] || a.code.localeCompare(b.code) ||
    (a.fixtureId ?? "").localeCompare(b.fixtureId ?? "") || (a.teamId ?? "").localeCompare(b.teamId ?? ""));
}

export function compareFixtureChange(original: ScheduleFixture | null, change: FixtureChange) {
  return { original, proposed: change.operation === "cancel" ? null : change.proposed ?? null, operation: change.operation, reason: change.reason };
}

export function nextChangeSetStatus(current: ChangeSetStatus, action: "submit" | "return" | "publish" | "cancel", hasBlockingErrors = false): ChangeSetStatus {
  if (action === "publish" && hasBlockingErrors) throw new Error("Blocking validation errors prevent publication.");
  const transitions: Record<ChangeSetStatus, Partial<Record<typeof action, ChangeSetStatus>>> = {
    draft: { submit: "pending_review", cancel: "cancelled" },
    pending_review: { return: "draft", publish: "published", cancel: "cancelled" },
    published: {}, cancelled: {},
  };
  const next = transitions[current][action];
  if (!next) throw new Error(`Cannot ${action} a ${current} fixture change set.`);
  return next;
}
