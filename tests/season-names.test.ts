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
  assert.equal(views.monday.upcoming.flatMap(r=>r.fixtures).length, 182);
  assert.equal(views.wednesday.upcoming.flatMap(r=>r.fixtures).length, 240);
  assert.equal(views.history?.[0].name, "2026 Season 1");
});
