import assert from "node:assert/strict";
import test from "node:test";
import { seasonDisplayName, compareSeasonNames } from "../src/lib/season-names";
import { competitionViews } from "../src/lib/competition-views";
import { jsonCompetitionData } from "../src/lib/competition-repository";

test("year-first names recognise legacy labels without guessing unrelated labels", () => {
  assert.equal(seasonDisplayName("Season 2 2026"), "2026 - Season 2");
  assert.equal(seasonDisplayName("2026 Season 1"), "2026 - Season 1");
  assert.equal(seasonDisplayName("2026 - Season 2"), "2026 - Season 2");
  assert.equal(seasonDisplayName("Summer Cup"), "Summer Cup");
});

test("selectors order numeric years then numeric season numbers descending", () => {
  const names = ["2026 Season 2", "2026 Season 10", "2027 Season 1", "Season 1 2026", "2025 Season 99"];
  assert.deepEqual(names.sort(compareSeasonNames), ["2027 Season 1", "2026 Season 10", "2026 Season 2", "Season 1 2026", "2025 Season 99"]);
});

test("both fallback competitions and archives use year-first names with unchanged schedules", async () => {
  const views = await competitionViews(jsonCompetitionData);
  assert.equal(views.monday.seasonName, "2026 - Season 2");
  assert.equal(views.wednesday.seasonName, "2026 - Season 2");
  // Played fixtures move into results; naming must preserve the complete schedule.
  for (const night of ['monday', 'wednesday'] as const) {
    const view = views[night];
    const fixtures = [...view.upcoming, ...view.results].flatMap(round => round.fixtures);
    const expected = jsonCompetitionData.fixtures.filter(fixture => fixture.night === night && fixture.division === 'A');
    assert(expected.length > 0);
    assert.deepEqual(fixtures.map(fixture => fixture.id).sort(), expected.map(fixture => fixture.id).sort());
    assert.equal(new Set(fixtures.map(fixture => fixture.id)).size, expected.length);
  }
  assert.equal(views.history?.[0].name, "2026 - Season 1");
});
