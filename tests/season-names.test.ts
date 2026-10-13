import assert from "node:assert/strict";
import test from "node:test";
import { seasonDisplayName, compareSeasonNames } from "../src/lib/season-names";
import { competitionViews } from "../src/lib/competition-views";
import { jsonCompetitionData } from "../src/lib/competition-repository";

test("year-first names recognise legacy labels without guessing unrelated labels", () => {
  assert.equal(seasonDisplayName("Season 2 2026"), "2026 Season 2");
  assert.equal(seasonDisplayName("2026 Season 1"), "2026 Season 1");
  assert.equal(seasonDisplayName("Summer Cup"), "Summer Cup");
});

test("selectors order numeric years then numeric season numbers descending", () => {
  const names = ["2026 Season 2", "2026 Season 10", "2027 Season 1", "Season 1 2026", "2025 Season 99"];
  assert.deepEqual(names.sort(compareSeasonNames), ["2027 Season 1", "2026 Season 10", "2026 Season 2", "Season 1 2026", "2025 Season 99"]);
});

test("both fallback competitions and archives use year-first names with unchanged schedules", async () => {
  const views = await competitionViews(jsonCompetitionData);
  assert.equal(views.monday.seasonName, "2026 Season 2");
  assert.equal(views.wednesday.seasonName, "2026 Season 2");
  // Played fixtures move into results; naming must preserve the complete schedule.
  for (const [night, count] of [[views.monday, 182], [views.wednesday, 240]] as const) {
    const fixtures = [...night.upcoming, ...night.results].flatMap(round => round.fixtures);
    assert.equal(fixtures.length, count);
    assert.equal(new Set(fixtures.map(fixture => fixture.id)).size, count);
  }
  assert.equal(views.history?.[0].name, "2026 Season 1");
});
