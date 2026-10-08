import assert from "node:assert/strict";
import test from "node:test";
import { calculateTeamForm } from "../src/lib/team-form";
import { createCompetitionService } from "../src/lib/competition-service";
import { mapPublishedCompetition, selectPublicEditions, type PublishedCompetitionRows } from "../src/lib/public-competition";
import { buildPublicSnapshot } from "../src/lib/public-snapshot";
import type { Fixture } from "../src/lib/types";

const upcoming: Fixture = { id: "next", night: "monday", division: "A", round: 8, date: "2026-08-01", time: "19:00", court: 1, homeTeam: "team", awayTeam: "opponent", status: "scheduled" };
function match(index: number, homeScore: number, awayScore: number, overrides: Partial<Fixture> = {}): Fixture {
  return { ...upcoming, id: `played-${index}`, date: `2026-07-${String(index).padStart(2, "0")}`, status: "completed", homeScore, awayScore, ...overrides };
}

test("form takes the last five played results in chronological order from either side", () => {
  const history = [match(1, 0, 1), match(2, 5, 0), match(3, 2, 2), match(4, 0, 3),
    match(5, 0, 4, { homeTeam: "opponent", awayTeam: "team" }), match(6, 1, 1)];
  assert.deepEqual(calculateTeamForm("team", upcoming, history.reverse()), ["W", "D", "L", "W", "D"]);
});

test("short and empty history is padded first so the latest match stays on the right", () => {
  assert.deepEqual(calculateTeamForm("team", upcoming, [match(1, 3, 1), match(2, 2, 2), match(3, 0, 2)]), ["?", "?", "W", "D", "L"]);
  assert.deepEqual(calculateTeamForm("team", upcoming, []), ["?", "?", "?", "?", "?"]);
});

test("form excludes other nights/divisions/identities, unplayed games, byes and invalid scores", () => {
  const history = [match(1, 1, 0, { night: "wednesday" }), match(2, 1, 0, { division: "B" }),
    match(3, 1, 0, { homeTeam: "previous-season-team" }), match(4, 1, 0, { status: "scheduled" }),
    match(5, 1, 0, { status: "cancelled" as Fixture["status"] }), match(6, 1, 0, { status: "abandoned" as Fixture["status"] }),
    match(7, 1, 0, { awayTeam: "" }), match(8, 1, 0, { awayTeam: "team" }),
    match(9, 1, 0, { awayScore: undefined }), match(10, -1, 0)];
  assert.deepEqual(calculateTeamForm("team", upcoming, history), ["?", "?", "?", "?", "?"]);
});

function publishedRows(): PublishedCompetitionRows {
  const editions: PublishedCompetitionRows["editions"] = [
    { id: "new", lifecycle: "active", publication_state: "published", competitions: { weekday: 1, division: "A" }, seasons: { ends_on: "2027-01-01" } },
    { id: "old", lifecycle: "archived", publication_state: "published", competitions: { weekday: 1, division: "A" }, seasons: { ends_on: "2026-01-01" } },
    { id: "division-b", lifecycle: "active", publication_state: "published", competitions: { weekday: 1, division: "B" }, seasons: { ends_on: "2027-01-01" } },
    { id: "wed", lifecycle: "active", publication_state: "published", competitions: { weekday: 3, division: "A" }, seasons: { ends_on: "2027-01-01" } },
  ];
  const teams = editions.flatMap(edition => ["one", "two"].map((side, index) => ({ id: `${edition.id}-${side}`, competition_season_id: edition.id,
    legacy_id: `${edition.id}-legacy-${side}`, name: index ? "Opponent" : "Same Club Name", status: "active", standings_eligible: true, kit_colour: null })));
  const fixtures = editions.map(edition => ({ id: `${edition.id}-game`, competition_season_id: edition.id, legacy_id: null, round_number: 1,
    match_date: "2026-07-01", kickoff_time: "19:00:00", court: edition.id === "division-b" ? 2 : 1,
    home_team_id: `${edition.id}-one`, away_team_id: `${edition.id}-two`, stage: "regular_season", publication_state: "published", public_note: null }));
  fixtures.push({ ...fixtures[0], id: "next", round_number: 2, match_date: "2026-08-01" });
  const results = fixtures.filter(fixture => fixture.id !== "next").map(fixture => ({ fixture_id: fixture.id, status: "published", home_score: 5, away_score: 0, forfeit_side: "away" }));
  return { editions, teams, fixtures, results, adjustments: [] };
}
const serviceFor = (data: ReturnType<typeof mapPublishedCompetition>) => createCompetitionService({ readCompetition: async () => data, readFinals: async () => ({ finals: {} }) as never });

test("live mapping and serialized fallback produce equivalent upcoming form and official forfeit outcomes", async () => {
  const rows = publishedRows();
  rows.fixtures.push(...["draft", "cancelled", "knockout", "grading", "pending", "abandoned", "superseded"].map((id, index) => ({
    ...rows.fixtures[0], id, match_date: `2026-07-${String(index + 2).padStart(2, "0")}`,
    stage: ["knockout", "grading"].includes(id) ? id : "regular_season",
    // Fixture cancellation withdraws publication in the official fixture RPC.
    publication_state: ["draft", "cancelled"].includes(id) ? "draft" : "published",
  })));
  rows.results.push(...["draft", "cancelled", "knockout", "grading", "pending", "abandoned", "superseded"].map(id => ({
    fixture_id: id, status: id === "pending" ? "pending_review" : ["abandoned", "superseded"].includes(id) ? id : "published",
    home_score: 0, away_score: 5, forfeit_side: null,
  })));
  const live = serviceFor(mapPublishedCompetition(selectPublicEditions(rows.editions), rows.teams, rows.fixtures, rows.results, rows.adjustments));
  const fallback = serviceFor(JSON.parse(JSON.stringify(buildPublicSnapshot(rows))).data);
  for (const service of [live, fallback]) {
    const view = await service.getNight("monday");
    const next = view.upcoming.flatMap(round => round.fixtures).find(fixture => fixture.id === "next")!;
    assert.deepEqual(next.homeForm, ["?", "?", "?", "?", "W"]);
    assert.deepEqual(next.awayForm, ["?", "?", "?", "?", "L"]);
    assert.deepEqual((await service.getNextRound())?.fixtures[0].homeForm, next.homeForm);
    assert.ok(view.results.flatMap(round => round.fixtures).every(fixture => !fixture.homeForm && !fixture.awayForm));
  }
});

test("new edition with the same club names starts with five unknowns and ignores old-season results", async () => {
  const rows = publishedRows();
  rows.results = rows.results.filter(result => result.fixture_id !== "new-game");
  // Even historical legacy IDs matching the new clubs cannot leak across editions.
  for (const team of rows.teams.filter(team => team.competition_season_id === "old")) {
    team.legacy_id = team.legacy_id!.replace("old-", "new-");
  }
  for (const data of [mapPublishedCompetition(selectPublicEditions(rows.editions), rows.teams, rows.fixtures, rows.results, []), buildPublicSnapshot(rows).data]) {
    const next = (await serviceFor(data).getNight("monday")).upcoming.flatMap(round => round.fixtures).find(fixture => fixture.id === "next")!;
    assert.deepEqual(next.homeForm, ["?", "?", "?", "?", "?"]);
  }
});
