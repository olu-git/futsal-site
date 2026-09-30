import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { compareFixtureChange, nextChangeSetStatus, parseFixtureChangeUpload, validateFixtureChanges,
  type FixtureChangeContext, type FixtureChangeUpload } from "../src/lib/admin/fixture-changes";
import { prepareFixtureChangeUpload } from "../src/lib/admin/fixture-change-service";

const monday = "11111111-1111-4111-8111-111111111111";
const wednesday = "99999999-9999-4999-8999-999999999999";
const divisionB = "77777777-7777-4777-8777-777777777777";
const otherVenue = "88888888-8888-4888-8888-888888888888";
const mondayCompetition = "00000000-0000-4000-8000-000000000011";
const wednesdayCompetition = "00000000-0000-4000-8000-000000000012";
const divisionBCompetition = "00000000-0000-4000-8000-000000000013";
const otherVenueCompetition = "00000000-0000-4000-8000-000000000014";
const venue = "00000000-0000-4000-8000-000000000021";
const secondVenue = "00000000-0000-4000-8000-000000000022";
const a = "22222222-2222-4222-8222-222222222222";
const b = "33333333-3333-4333-8333-333333333333";
const c = "44444444-4444-4444-8444-444444444444";
const d = "55555555-5555-4555-8555-555555555555";
const wa = "66666666-6666-4666-8666-666666666666";
const fixtureA = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const fixtureB = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";

function context(): FixtureChangeContext {
  return {
    competitionSeasonId: monday, night: "monday", season: "2026 Season 1", lifecycle: "active", today: "2026-10-01",
    competitions: [
      { id: mondayCompetition, locationId: venue }, { id: wednesdayCompetition, locationId: venue },
      { id: divisionBCompetition, locationId: venue }, { id: otherVenueCompetition, locationId: secondVenue },
    ],
    competitionSeasons: [
      { id: monday, competitionId: mondayCompetition, lifecycle: "active", publicationState: "published" },
      { id: wednesday, competitionId: wednesdayCompetition, lifecycle: "active", publicationState: "published" },
      { id: divisionB, competitionId: divisionBCompetition, lifecycle: "active", publicationState: "published" },
      { id: otherVenue, competitionId: otherVenueCompetition, lifecycle: "active", publicationState: "published" },
    ],
    teams: [
      { id: a, name: "Home team", competitionSeasonId: monday, status: "active" },
      { id: b, name: "Away team", competitionSeasonId: monday, status: "active" },
      { id: c, name: "Third team", competitionSeasonId: monday, status: "active" },
      { id: d, name: "Fourth team", competitionSeasonId: monday, status: "active" },
      { id: wa, name: "Wednesday team", competitionSeasonId: wednesday, status: "active" },
    ],
    fixtures: [
      { id: fixtureA, competitionSeasonId: monday, stage: "regular_season", publicationState: "published", scheduleStatus: "scheduled", scheduleVersion: 1,
        hasPublishedResult: false, roundNumber: 12, date: "2026-10-12", kickoffTime: "19:00", court: 1, homeTeamId: a, awayTeamId: b },
      { id: fixtureB, competitionSeasonId: monday, stage: "regular_season", publicationState: "published", scheduleStatus: "scheduled", scheduleVersion: 1,
        hasPublishedResult: false, roundNumber: 12, date: "2026-10-12", kickoffTime: "19:00", court: 2, homeTeamId: c, awayTeamId: d },
    ],
    preferences: [], notes: [],
  };
}
const proposal = (homeTeamId = a, awayTeamId = b, kickoffTime = "20:20", court = 1, date = "2026-10-12") =>
  ({ roundNumber: 12, date, kickoffTime, court, homeTeamId, awayTeamId, publicationState: "published" as const });
function upload(changes: FixtureChangeUpload["changes"]): FixtureChangeUpload {
  return { schemaVersion: 1, competition: { night: "monday", season: "2026 Season 1", competitionSeasonId: monday }, title: "Schedule changes", changes };
}
const update = (proposed = proposal()) => ({ operation: "update" as const, fixtureId: fixtureA, expectedFixtureVersion: 1, reason: "Team request", proposed });
const codes = (changes: FixtureChangeUpload["changes"], ctx = context()) => validateFixtureChanges(upload(changes), ctx).map((message) => message.code);

test("strict versioned JSON accepts a multi-round plan and rejects malformed input", () => {
  assert.equal(parseFixtureChangeUpload(readFileSync("docs/examples/fixture-changes-valid.json", "utf8")).changes.length, 2);
  assert.throws(() => parseFixtureChangeUpload(readFileSync("docs/examples/fixture-changes-invalid.json", "utf8")), /Unsupported/);
  assert.throws(() => parseFixtureChangeUpload("{"), /Malformed/);
  assert.throws(() => parseFixtureChangeUpload({ ...upload([update()]), extra: true }), /unknown field/);
  assert.throws(() => parseFixtureChangeUpload(upload([{ ...update(), proposed: { ...proposal(), kickoffTime: "7pm" } }])), /invalid proposal/);
});

test("single edit, multiple reasons in one round, and changes across rounds retain before/after", () => {
  const changes = [update(), { operation: "update" as const, fixtureId: fixtureB, expectedFixtureVersion: 1,
    reason: "Venue correction", proposed: proposal(c, d, "20:20", 2) }];
  const result = prepareFixtureChangeUpload(upload(changes), context());
  assert.equal(result.publishable, true);
  assert.deepEqual(result.comparisons.map((row) => row.reason), ["Team request", "Venue correction"]);
  assert.equal(result.comparisons[0].original?.kickoffTime, "19:00");
  assert.equal(result.comparisons[0].proposed?.kickoffTime, "20:20");
  changes[1].proposed = { ...changes[1].proposed, roundNumber: 13, date: "2026-10-19" };
  assert.equal(prepareFixtureChangeUpload(upload(changes), context()).publishable, true);
});

test("court and team-time conflicts block publication in deterministic order", () => {
  assert.deepEqual(codes([update(proposal(a, b, "19:00", 2))]), ["court_collision"]);
  const ctx = context();
  ctx.fixtures[1].homeTeamId = a;
  assert.deepEqual(codes([update(proposal(a, b, "19:00", 1))], ctx), ["team_time_collision"]);
  assert.deepEqual(codes([update(proposal(a, b, "19:00", 1))], ctx), ["team_time_collision"]);
});

test("team preferences, notes, status, display mismatch and short turnaround warn", () => {
  const ctx = context();
  ctx.preferences = [
    { teamId: a, kickoffTime: "19:00", classification: "required" },
    { teamId: b, kickoffTime: "20:20", classification: "avoid" },
    { teamId: b, kickoffTime: "19:00", classification: "preferred" },
  ];
  ctx.notes = [{ teamId: a, notes: "Court restriction" }];
  ctx.teams[0].status = "inactive";
  const warnings = codes([{ ...update(), homeTeamName: "Wrong name" }], ctx);
  for (const expected of ["required_time", "preferred_time", "avoid_time", "team_note", "inactive_team", "name_id_mismatch"]) assert.ok(warnings.includes(expected));
  ctx.fixtures.push({ ...ctx.fixtures[1], id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc", homeTeamId: a, date: "2026-10-16" });
  assert.ok(codes([update()], ctx).includes("short_turnaround"));
});

test("wrong competition, finals, completed and stale fixtures are blocked", () => {
  assert.ok(codes([update(proposal(wa, b))]).includes("cross_competition_team"));
  const ctx = context();
  ctx.fixtures[0].competitionSeasonId = wednesday;
  assert.ok(codes([update()], ctx).includes("cross_competition_fixture"));
  ctx.fixtures[0].competitionSeasonId = monday;
  ctx.fixtures[0].stage = "knockout";
  assert.ok(codes([update()], ctx).includes("non_regular_fixture"));
  ctx.fixtures[0].stage = "regular_season";
  ctx.fixtures[0].hasPublishedResult = true;
  assert.ok(codes([update()], ctx).includes("completed_fixture"));
  ctx.fixtures[0].hasPublishedResult = false;
  ctx.fixtures[0].scheduleVersion = 2;
  assert.ok(codes([update()], ctx).includes("stale_fixture"));
  ctx.lifecycle = "archived";
  assert.ok(codes([update()], ctx).includes("archived_season"));
});

test("Monday and Wednesday fixtures on different dates do not collide", () => {
  const ctx = context();
  ctx.fixtures.push({ ...ctx.fixtures[0], id: "dddddddd-dddd-4ddd-8ddd-dddddddddddd", competitionSeasonId: wednesday,
    homeTeamId: wa, awayTeamId: wa, date: "2026-10-14", kickoffTime: "20:20" });
  assert.equal(prepareFixtureChangeUpload(upload([update()]), ctx).publishable, true);
});

test("an incomplete venue context cannot be treated as a clear schedule", () => {
  const ctx = context();
  ctx.competitionSeasons = [];
  assert.ok(codes([update()], ctx).includes("unknown_location"));
  assert.ok(codes([update()], ctx).includes("incomplete_occupancy_context"));
});

test("another division or competition at the same venue blocks the occupied court", () => {
  const ctx = context();
  ctx.fixtures.push({ ...ctx.fixtures[0], id: "dddddddd-dddd-4ddd-8ddd-dddddddddddd", competitionSeasonId: divisionB,
    homeTeamId: wa, awayTeamId: wa, kickoffTime: "20:20" });
  assert.ok(codes([update()], ctx).includes("court_collision"));
  ctx.fixtures[2].competitionSeasonId = wednesday;
  assert.ok(codes([update()], ctx).includes("court_collision"));
});

test("same slot at another location, another date, or another court remains available", () => {
  const ctx = context();
  ctx.fixtures.push({ ...ctx.fixtures[0], id: "dddddddd-dddd-4ddd-8ddd-dddddddddddd", competitionSeasonId: otherVenue,
    homeTeamId: wa, awayTeamId: wa, kickoffTime: "20:20" });
  assert.equal(prepareFixtureChangeUpload(upload([update()]), ctx).publishable, true);
  ctx.fixtures[2].competitionSeasonId = divisionB;
  ctx.fixtures[2].court = 2;
  assert.equal(prepareFixtureChangeUpload(upload([update()]), ctx).publishable, true);
  ctx.fixtures[2].court = 1;
  ctx.fixtures[2].date = "2026-10-19";
  assert.equal(prepareFixtureChangeUpload(upload([update()]), ctx).publishable, true);
});

test("two proposed items collide, but cancelling or moving an original releases its slot", () => {
  const ctx = context();
  assert.ok(codes([update(proposal(a, b, "20:20", 1)),
    { operation: "update", fixtureId: fixtureB, expectedFixtureVersion: 1, reason: "Venue request", proposed: proposal(c, d, "20:20", 1) }], ctx)
    .includes("court_collision"));
  assert.equal(prepareFixtureChangeUpload(upload([
    { operation: "cancel", fixtureId: fixtureA, expectedFixtureVersion: 1, reason: "Team departed" },
    { operation: "create", reason: "Replacement team", proposed: proposal(a, b, "19:00", 1) },
  ]), ctx).publishable, true);
  assert.equal(prepareFixtureChangeUpload(upload([
    update(proposal(a, b, "19:00", 2)),
    { operation: "update", fixtureId: fixtureB, expectedFixtureVersion: 1, reason: "Court swap", proposed: proposal(c, d, "19:00", 1) },
  ]), ctx).publishable, true);
});

test("duplicate target, cancellation, new slot and same-team proposal are classified", () => {
  const ctx = context();
  assert.ok(codes([update(), update()], ctx).includes("duplicate_target"));
  assert.ok(codes([{ operation: "cancel", fixtureId: fixtureA, expectedFixtureVersion: 1, reason: "Venue closure" }], ctx).includes("uneven_round"));
  assert.ok(codes([{ operation: "create", reason: "Team joined", proposed: proposal(c, d, "21:00", 1) }], ctx).includes("new_slot"));
  assert.ok(codes([update(proposal(a, a))], ctx).includes("same_team"));
  assert.equal(compareFixtureChange(ctx.fixtures[0], { operation: "cancel", fixtureId: fixtureA, expectedFixtureVersion: 1, reason: "Cancelled" }).proposed, null);
});

test("only reviewed, valid change sets can publish", () => {
  assert.equal(nextChangeSetStatus("draft", "submit"), "pending_review");
  assert.equal(nextChangeSetStatus("pending_review", "return"), "draft");
  assert.equal(nextChangeSetStatus("pending_review", "publish"), "published");
  assert.equal(nextChangeSetStatus("draft", "cancel"), "cancelled");
  assert.throws(() => nextChangeSetStatus("draft", "publish"), /Cannot/);
  assert.throws(() => nextChangeSetStatus("pending_review", "publish", true), /Blocking/);
  assert.throws(() => nextChangeSetStatus("published", "return"), /Cannot/);
});
