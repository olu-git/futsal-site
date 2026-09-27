import assert from "node:assert/strict";
import test from "node:test";
import { createCompetitionService } from "../src/lib/competition-service";
import { mapPublishedCompetition, preferPublished, selectPublicEditions,
  type PublicEditionRow, type PublicFixtureRow, type PublicTeamRow } from "../src/lib/public-competition";

const editions: PublicEditionRow[] = [
  { id: "mon", lifecycle: "active", publication_state: "published", competitions: { weekday: 1, division: "A" }, seasons: { ends_on: "2026-10-05" } },
  { id: "wed", lifecycle: "active", publication_state: "published", competitions: { weekday: 3, division: "A" }, seasons: { ends_on: "2026-10-07" } },
  { id: "old", lifecycle: "archived", publication_state: "published", competitions: { weekday: 1, division: "A" }, seasons: { ends_on: "2025-10-05" } },
  { id: "draft", lifecycle: "planned", publication_state: "draft", competitions: { weekday: 3, division: "A" }, seasons: { ends_on: "2027-10-07" } },
];
const teams: PublicTeamRow[] = [
  { id: "m1", competition_season_id: "mon", legacy_id: "mon-a", name: "Monday A", status: "active", standings_eligible: true, kit_colour: "#ffffff" },
  { id: "m2", competition_season_id: "mon", legacy_id: "mon-b", name: "Monday B", status: "active", standings_eligible: true, kit_colour: "#000000" },
  { id: "w1", competition_season_id: "wed", legacy_id: "wed-dwell", name: "Dwell FC", status: "inactive", standings_eligible: true, kit_colour: "#cc0000" },
  { id: "w2", competition_season_id: "wed", legacy_id: "wed-b", name: "Wednesday B", status: "active", standings_eligible: true, kit_colour: "#000000" },
];
function fixture(id: string, edition: string, home: string, away: string, stage = "regular_season", state = "published"): PublicFixtureRow {
  return { id, competition_season_id: edition, legacy_id: id, round_number: 1, match_date: "2026-06-01",
    kickoff_time: "19:00:00", court: 1, home_team_id: home, away_team_id: away,
    stage, publication_state: state, public_note: null };
}

test("selects the latest published edition per night and division", () => {
  assert.deepEqual(selectPublicEditions(editions).map((row) => row.id), ["wed", "mon"]);
});

test("maps only published regular-season records and keeps nights separate", async () => {
  const data = mapPublishedCompetition(selectPublicEditions(editions), teams, [
    fixture("mf", "mon", "m1", "m2"), fixture("wf", "wed", "w1", "w2"),
    fixture("draft-fixture", "mon", "m1", "m2", "regular_season", "draft"),
    fixture("final", "wed", "w1", "w2", "knockout"),
  ], [
    { fixture_id: "mf", status: "published", home_score: 5, away_score: 0, forfeit_side: "away" },
    { fixture_id: "wf", status: "published", home_score: 2, away_score: 2, forfeit_side: null },
    { fixture_id: "draft-fixture", status: "draft", home_score: 8, away_score: 0, forfeit_side: null },
  ], [
    { id: "a1", competition_season_id: "mon", team_id: "m1", legacy_id: "a1", played_delta: 0,
      wins_delta: 0, draws_delta: 0, losses_delta: 0, goals_for_delta: 0, goals_against_delta: 0,
      points_delta: 1, reason: "Admin adjustment", publication_state: "published" },
    { id: "a2", competition_season_id: "mon", team_id: "m1", legacy_id: "a2", played_delta: 0,
      wins_delta: 0, draws_delta: 0, losses_delta: 0, goals_for_delta: 0, goals_against_delta: 0,
      points_delta: 50, reason: "Unpublished adjustment", publication_state: "draft" },
  ]);
  assert.deepEqual(data.fixtures.map((row) => row.id), ["mf", "wf"]);
  const service = createCompetitionService({ readCompetition: async () => data, readFinals: async () => ({ finals: {} }) as never });
  const monday = await service.getNight("monday");
  const wednesday = await service.getNight("wednesday");
  assert.deepEqual(monday.results[0].fixtures.map((row) => row.id), ["mf"]);
  assert.match(monday.results[0].fixtures[0].note ?? "", /Forfeit/);
  assert.equal(monday.divisions[0].standings.find((row) => row.teamName === "Monday A")?.points, 4);
  assert.deepEqual(wednesday.results[0].fixtures.map((row) => row.id), ["wf"]);
  assert.equal(wednesday.teams.length, 1);
  assert.equal(wednesday.divisions[0].standings.length, 2);
  assert.equal(wednesday.divisions[0].standings.find((row) => row.teamName === "Dwell FC")?.points, 1);
});

test("rejects unresolved fixture teams instead of displaying blank names", () => {
  assert.throws(() => mapPublishedCompetition(selectPublicEditions(editions), teams,
    [fixture("broken", "wed", "missing", "w2")], [], []), /unresolved home team/);
});

test("uses published data when available and the snapshot when unavailable", async () => {
  assert.deepEqual(await preferPublished(async () => "live", "snapshot"), { value: "live", source: "supabase" });
  assert.deepEqual(await preferPublished(async () => { throw new Error("offline"); }, "snapshot"),
    { value: "snapshot", source: "snapshot" });
  assert.deepEqual(await preferPublished(() => new Promise<string>(() => {}), "snapshot", 1),
    { value: "snapshot", source: "snapshot" });
});
