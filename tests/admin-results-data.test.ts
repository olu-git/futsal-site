import assert from "node:assert/strict";
import test from "node:test";
import { FIXTURE_RESULTS_SELECT, getAdminRegularSeasonFixtures, mapAdminFixtures, type AdminEditionRow, type AdminFixtureRow, type AdminTeamRow } from "../src/lib/admin/results-data";

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

test("Results loader shows the published schedule on both nights without requiring results or active teams", async (t) => {
  const activeEditions = editions.map(row => ({ ...row, id: String(row.id), lifecycle: "active", publication_state: "published" }));
  const previous = { ...activeEditions[0], id: "archived-monday", lifecycle: "archived" };
  const planned = { ...activeEditions[1], id: "private-wednesday", lifecycle: "planned", publication_state: "draft" };
  const version = (status: string, revision: number) => ({ id: `result-${revision}`, status, revision, home_score: 5, away_score: 0 });
  const rows: AdminFixtureRow[] = activeEditions.flatMap(edition => {
    const base = { ...fixture("", String(edition.id)), publication_state: "published", schedule_status: "scheduled" };
    return [
      { ...base, id: `${edition.id}-no-result` },
      { ...base, id: `${edition.id}-result-history`, result_versions: [version("superseded", 1), version("published", 2), version("draft", 3)] },
      { ...base, id: `${edition.id}-pending-result`, result_versions: [version("pending_review", 1)] },
      { ...base, id: `${edition.id}-unpublished`, publication_state: "draft" },
      { ...base, id: `${edition.id}-cancelled`, publication_state: "draft", schedule_status: "cancelled" },
      { ...base, id: `${edition.id}-cancelled-published`, schedule_status: "cancelled" },
      { ...base, id: `${edition.id}-knockout`, stage: "knockout" },
    ];
  });
  rows.push({ ...rows[0], id: "archive-game", competition_season_id: previous.id },
    { ...rows[0], id: "staged-game", competition_season_id: planned.id });
  // A withdrawn team's played history and a new entrant both remain resolvable.
  const roster = teams.map(team => ({ ...team, status: team.id === "shared-home" ? "withdrawn" : "active" }));
  const unchanged = JSON.stringify({ rows, roster });
  const oldUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const oldKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://fis-results-test.invalid";
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_test_only";
  t.after(() => {
    if (oldUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL; else process.env.NEXT_PUBLIC_SUPABASE_URL = oldUrl;
    if (oldKey === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY; else process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = oldKey;
  });
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request, init?: RequestInit) => {
    assert.equal(init?.method ?? "GET", "GET");
    const url = new URL(input instanceof Request ? input.url : String(input));
    const table = url.pathname.split("/").at(-1);
    let data: Record<string, unknown>[] = table === "competition_seasons" ? [...activeEditions, previous, planned]
      : table === "fixtures" ? rows : table === "teams" ? roster : assert.fail(`Unexpected table ${table}`);
    // Apply PostgREST predicates to independent fixture states, exercising the real SDK query.
    for (const [field, predicate] of url.searchParams) {
      if (predicate.startsWith("eq.")) data = data.filter(row => row[field] === predicate.slice(3));
      if (predicate.startsWith("in.(")) data = data.filter(row => predicate.slice(4, -1).split(",").includes(String(row[field])));
    }
    return new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" } });
  });
  const loaded = await getAdminRegularSeasonFixtures();
  assert.deepEqual(loaded.map(row => row.id).sort(), activeEditions.flatMap(edition =>
    ["no-result", "pending-result", "result-history"].map(suffix => `${edition.id}-${suffix}`)).sort());
  for (const night of ["monday", "wednesday"]) {
    assert.equal(loaded.filter(row => row.night === night).length, 3);
    assert.deepEqual(loaded.find(row => row.id === `${night}-season-no-result`)?.results, []);
    assert.deepEqual(loaded.find(row => row.id === `${night}-season-result-history`)?.results.map(row => row.status), ["draft", "published", "superseded"]);
    assert.equal(loaded.find(row => row.id === `${night}-season-pending-result`)?.results[0].status, "pending_review");
  }
  assert.equal(JSON.stringify({ rows, roster }), unchanged);
});
