import assert from "node:assert/strict";
import test from "node:test";
import { FIXTURE_RESULTS_SELECT, mapAdminFixtures, type AdminEditionRow, type AdminFixtureRow, type AdminTeamRow } from "../src/lib/admin/results-data";

const editions: AdminEditionRow[] = [
  { id: "monday-season", competitions: { weekday: 1 }, seasons: { name: "2026 Season" } },
  { id: "wednesday-season", competitions: { weekday: 3 }, seasons: { name: "2026 Season" } },
];
const teams: AdminTeamRow[] = [
  { id: "shared-home", competition_season_id: "monday-season", name: "Monday Home", kit_colour: "#ffffff" },
  { id: "shared-away", competition_season_id: "monday-season", name: "Monday Away", kit_colour: "#000000" },
  { id: "shared-home", competition_season_id: "wednesday-season", name: "Wednesday Home", kit_colour: "#ff0000" },
  { id: "shared-away", competition_season_id: "wednesday-season", name: "Wednesday Away", kit_colour: "#0000ff" },
];
function fixture(id: string, competitionSeasonId: string): AdminFixtureRow {
  return { id, competition_season_id: competitionSeasonId, home_team_id: "shared-home", away_team_id: "shared-away",
    round_number: 4, match_date: "2026-05-01", kickoff_time: "19:00:00", court: 1, stage: "regular_season", result_versions: [] };
}

test("fixture query does not embed the ambiguous teams relationship", () => {
  assert.doesNotMatch(FIXTURE_RESULTS_SELECT, /teams\s*[!(]/i);
  assert.match(FIXTURE_RESULTS_SELECT, /home_team_id/);
  assert.match(FIXTURE_RESULTS_SELECT, /away_team_id/);
});
test("home and away team IDs map to the correct fixture sides", () => {
  const [mapped] = mapAdminFixtures([fixture("m1", "monday-season")], teams, editions);
  assert.equal(mapped.home.name, "Monday Home");
  assert.equal(mapped.away.name, "Monday Away");
});
test("missing team references produce a useful data error", () => {
  const row = { ...fixture("broken-fixture", "monday-season"), home_team_id: "missing-team" };
  assert.throws(() => mapAdminFixtures([row], teams, editions), /Fixture broken-fixture has missing home team missing-team/);
});
test("Monday and Wednesday mappings remain separated by competition season", () => {
  const mapped = mapAdminFixtures([fixture("m1", "monday-season"), fixture("w1", "wednesday-season")], teams, editions);
  assert.deepEqual(mapped.map((item) => [item.night, item.home.name, item.away.name]), [
    ["monday", "Monday Home", "Monday Away"],
    ["wednesday", "Wednesday Home", "Wednesday Away"],
  ]);
});
test("fixtures sort by time ascending and then court ascending within each round", () => {
  const rows = [
    { ...fixture("late", "monday-season"), kickoff_time: "20:20:00", court: 1 },
    { ...fixture("court-two", "monday-season"), kickoff_time: "19:40:00", court: 2 },
    { ...fixture("court-one", "monday-season"), kickoff_time: "19:40:00", court: 1 },
  ];
  assert.deepEqual(mapAdminFixtures(rows, teams, editions).map((item) => item.id), ["court-one", "court-two", "late"]);
});
