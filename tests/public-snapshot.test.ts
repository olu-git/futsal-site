import assert from "node:assert/strict";
import test from "node:test";
import snapshotFile from "../src/data/public-competition-snapshot.json";
import finalsFile from "../src/data/season-2026-s1.json";
import { competitionRepository } from "../src/lib/competition-repository";
import { buildPublicSnapshot, serializePublicSnapshot, validatePublicSnapshot } from "../src/lib/public-snapshot";
import type { PublishedCompetitionRows } from "../src/lib/public-competition";
import { teamDisplayName } from "../src/lib/team-display-name";

const rows: PublishedCompetitionRows = {
  editions: [
    { id: "m", lifecycle: "active", publication_state: "published", competitions: { weekday: 1, division: "A" }, seasons: { ends_on: "2026-10-05" } },
    { id: "w", lifecycle: "active", publication_state: "published", competitions: { weekday: 3, division: "A" }, seasons: { ends_on: "2026-10-07" } },
  ],
  teams: [
    { id: "m1", competition_season_id: "m", legacy_id: "mon-a", name: "Monday A", status: "active", standings_eligible: true, kit_colour: "#ffffff" },
    { id: "m2", competition_season_id: "m", legacy_id: "mon-b", name: "Monday B", status: "active", standings_eligible: true, kit_colour: "#000000" },
    { id: "w1", competition_season_id: "w", legacy_id: "wed-dwell", name: "Dwell FC", status: "inactive", standings_eligible: true, kit_colour: "#cc0000" },
    { id: "w2", competition_season_id: "w", legacy_id: "wed-b", name: "Wednesday B", status: "active", standings_eligible: true, kit_colour: null },
  ],
  fixtures: [
    { id: "mf", competition_season_id: "m", legacy_id: "mon-r1-1", round_number: 1, match_date: "2026-03-23", kickoff_time: "19:00:00", court: 1, home_team_id: "m1", away_team_id: "m2", stage: "regular_season", publication_state: "published", public_note: null },
    { id: "wf", competition_season_id: "w", legacy_id: "wed-r1-1", round_number: 1, match_date: "2026-03-25", kickoff_time: "19:00:00", court: 1, home_team_id: "w1", away_team_id: "w2", stage: "regular_season", publication_state: "published", public_note: null },
    { id: "draft", competition_season_id: "m", legacy_id: "draft", round_number: 2, match_date: "2026-03-30", kickoff_time: "19:00:00", court: 1, home_team_id: "m1", away_team_id: "m2", stage: "regular_season", publication_state: "draft", public_note: null },
    { id: "final", competition_season_id: "w", legacy_id: "final", round_number: 2, match_date: "2026-09-30", kickoff_time: "19:40:00", court: 1, home_team_id: "w1", away_team_id: "w2", stage: "knockout", publication_state: "published", public_note: null },
  ],
  results: [
    { fixture_id: "mf", status: "published", home_score: 5, away_score: 0, forfeit_side: "away" },
    { fixture_id: "wf", status: "published", home_score: 2, away_score: 2, forfeit_side: null },
    { fixture_id: "draft", status: "draft", home_score: 9, away_score: 0, forfeit_side: null },
  ],
  adjustments: [
    { id: "a1", competition_season_id: "w", team_id: "w1", legacy_id: "wed-adjustment", played_delta: 1, wins_delta: 0, draws_delta: 1, losses_delta: 0, goals_for_delta: 2, goals_against_delta: 2, points_delta: 1, reason: "Verified adjustment", publication_state: "published" },
    { id: "a2", competition_season_id: "m", team_id: "m1", legacy_id: "unpublished", played_delta: 0, wins_delta: 0, draws_delta: 0, losses_delta: 0, goals_for_delta: 0, goals_against_delta: 0, points_delta: 10, reason: "Draft", publication_state: "draft" },
  ],
};

test("snapshot is deterministic, segregated, and published-only", () => {
  const first = buildPublicSnapshot(rows);
  const reversed = Object.fromEntries(Object.entries(rows).map(([key, value]) => [key, [...value].reverse()])) as unknown as PublishedCompetitionRows;
  assert.equal(serializePublicSnapshot(first), serializePublicSnapshot(buildPublicSnapshot(reversed)));
  assert.equal(first.data.fixtures.length, 2);
  assert.equal(first.data.fixtures[0].homeTeam, "mon-a");
  assert.equal(first.data.fixtures[1].homeTeam, "wed-dwell");
  assert.equal(first.data.fixtures[0].note, "Forfeit: away team.");
  assert.equal(first.data.teams.find((team) => team.id === "mon-a")?.kitColour, "#ffffff");
  assert.equal(first.data.teams.find((team) => team.id === "wed-dwell")?.standingsEligible, true);
  assert.equal(first.data.teams.find((team) => team.id === "wed-dwell")?.active, false);
  assert.deepEqual(first.data.standingsAdjustments.map((adjustment) => adjustment.id), ["wed-adjustment"]);
  assert.ok(!serializePublicSnapshot(first).includes("final"));
  assert.ok(!serializePublicSnapshot(first).includes("draft"));
  assert.ok(!serializePublicSnapshot(first).includes("m1"));
});

test("snapshot validation rejects incomplete or invalid public data", () => {
  assert.throws(() => buildPublicSnapshot({ ...rows, teams: rows.teams.filter((team) => team.id !== "m1") }), /unresolved home team/);
  assert.doesNotThrow(() => buildPublicSnapshot({ ...rows, fixtures: rows.fixtures.filter((fixture) => fixture.id !== "wf") }));
  assert.throws(() => buildPublicSnapshot({ ...rows, teams: rows.teams.filter((team) => team.competition_season_id !== "w"), fixtures: rows.fixtures.filter((fixture) => fixture.competition_season_id !== "w"), adjustments: [] }), /wednesday teams are missing/);
  assert.throws(() => buildPublicSnapshot({ ...rows, results: [{ fixture_id: "mf", status: "published", home_score: -1, away_score: 2, forfeit_side: null }] }), /Invalid published score/);
  const bad = structuredClone(buildPublicSnapshot(rows));
  bad.data.fixtures[1].homeTeam = "mon-a";
  assert.throws(() => validatePublicSnapshot(bad), /Invalid, unresolved/);
});

test("checked-in snapshot is the regular-season fallback; finals stay separate", async () => {
  validatePublicSnapshot(snapshotFile);
  assert.deepEqual(await competitionRepository.readCompetition(), {
    ...snapshotFile.data,
    teams: snapshotFile.data.teams.map((team) => ({ ...team, name: teamDisplayName(team.id, team.name) })),
  });
  assert.deepEqual(await competitionRepository.readFinals(), finalsFile);
  assert.ok(snapshotFile.data.fixtures.every((fixture) => ["scheduled", "completed"].includes(fixture.status)));
  assert.ok(!JSON.stringify(snapshotFile).includes("penaltyWinner"));
});

test("new published seasons can snapshot scheduled fixtures and records without legacy IDs", () => {
  const next = structuredClone(rows);
  next.teams[0].legacy_id = null;
  next.fixtures[0].legacy_id = null;
  next.fixtures[0].id = "next-fixture";
  next.results = next.results.filter((result) => result.fixture_id !== "mf");
  next.adjustments[0].legacy_id = null;
  const snapshot = buildPublicSnapshot(next);
  assert.equal(snapshot.data.teams[0].id, "m1");
  assert.equal(snapshot.data.fixtures[0].id, "next-fixture");
  assert.equal(snapshot.data.fixtures[0].homeTeam, "m1");
  assert.equal(snapshot.data.fixtures[0].status, "scheduled");
  assert.equal(snapshot.data.standingsAdjustments[0].id, "a1");
  assert.doesNotThrow(() => validatePublicSnapshot(snapshot));
});
