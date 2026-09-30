import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import AdminResultMatchup from "../src/components/admin/AdminResultMatchup";
import ResultsManager from "../src/app/admin/results/ResultsManager";
import type { AdminFixture } from "../src/lib/admin/results-data";

const fixture: AdminFixture = {
  id: "fixture-1", competitionSeasonId: "season-1", night: "monday", seasonName: "2026 Season 1",
  round: 24, date: "2026-09-14", time: "19:00:00", court: 1, stage: "regular_season",
  home: { id: "home", name: "Bunyip", kitColour: "#000000" },
  away: { id: "away", name: "A Longer Away Team Name", kitColour: "#ffffff" },
  results: [{ id: "result-1", revision: 1, status: "published", homeScore: 6, awayScore: 10,
    forfeitSide: null, forfeitExceptionReason: null, penaltyHomeScore: null, penaltyAwayScore: null,
    penaltyWinner: null, supersedesResultId: null, correctionReason: null, createdAt: "2026-09-14T12:00:00Z", publishedAt: "2026-09-14T12:00:00Z" }],
};

test("admin matchup associates each shirt and score with its own team", () => {
  const markup = renderToStaticMarkup(<AdminResultMatchup fixture={fixture} homeScore={6} awayScore={10} prominent />);
  assert.match(markup, /Home[\s\S]*Bunyip[\s\S]*6 home goals/);
  assert.match(markup, /Away[\s\S]*A Longer Away Team Name[\s\S]*10 away goals/);
  assert.ok(markup.indexOf("team-kit") < markup.indexOf("Bunyip"));
  assert.ok(markup.lastIndexOf("team-kit") < markup.indexOf("A Longer Away Team Name"));
  assert.match(markup, /team-kit-light/);
});

test("missing scores remain explicitly unscored", () => {
  const markup = renderToStaticMarkup(<AdminResultMatchup fixture={fixture} />);
  assert.match(markup, /No home score/);
  assert.match(markup, /No away score/);
  assert.doesNotMatch(markup, /6 home goals|10 away goals/);
});

test("result list shows schedule, status and aligned matchup", () => {
  const markup = renderToStaticMarkup(<ResultsManager fixtures={[fixture]} onChanged={async () => {}} />);
  assert.match(markup, /14 Sept 2026/);
  assert.match(markup, /7:00pm.*Court 1/);
  assert.match(markup, /Published/);
  assert.match(markup, /6 home goals/);
  assert.match(markup, /10 away goals/);
});
