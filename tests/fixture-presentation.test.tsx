import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import FixtureTeam from "../src/components/FixtureTeam";
import FixtureList from "../src/components/FixtureList";
import KnockoutBracket from "../src/components/KnockoutBracket";
import type { DisplayFixture } from "../src/lib/competition-service";
import type { FinalsNightData } from "../src/lib/finals";

function fixture(status: "scheduled" | "completed", note?: string): DisplayFixture {
  return {
    id: "fixture-1", night: "monday", division: "A", round: 2, date: "2026-06-01", time: "19:40", court: 2,
    homeTeam: "home", awayTeam: "away", home: { id: "home", name: "Ghazni United", night: "monday", division: "A", kitColour: "#FFFFFF" },
    away: { id: "away", name: "Extra Long Away Team Name", night: "monday", division: "A", kitColour: "#111111" },
    status, ...(status === "completed" ? { homeScore: 5, awayScore: 0 } : {}), ...(note ? { note } : {}),
  };
}

test("fixture team supports its established home and away alignment", () => {
  const home = renderToStaticMarkup(<FixtureTeam side="home" name="Ghazni United" colour="#FFFFFF" />);
  const away = renderToStaticMarkup(<FixtureTeam side="away" name="Extra Long Away Team Name" colour="#111111" />);
  assert.ok(home.indexOf("team-kit") < home.indexOf("Ghazni United"));
  assert.ok(away.indexOf("Extra Long Away Team Name") < away.indexOf("team-kit"));
  assert.match(home, /aria-hidden="true"/);
  assert.match(home, /team-kit-light/);
  assert.match(away, /fixture-team-name/);
});

test("invalid kit colour falls back without injecting a CSS colour", () => {
  const markup = renderToStaticMarkup(<FixtureTeam side="home" name="Fallback FC" colour="not-a-colour" />);
  assert.match(markup, /team-kit/);
  assert.doesNotMatch(markup, /--kit:/);
});

test("unplayed fixtures show upcoming without a fabricated score", () => {
  const markup = renderToStaticMarkup(<FixtureList fixtures={[fixture("scheduled")]} />);
  assert.match(markup, /Scheduled fixture/);
  assert.match(markup, /Upcoming/);
  assert.doesNotMatch(markup, /5 - 0/);
});

test("completed result and explicit forfeit note remain scannable", () => {
  const markup = renderToStaticMarkup(<FixtureList fixtures={[fixture("completed", "Home team forfeited")]} />);
  assert.match(markup, /Final score 5 to 0/);
  assert.match(markup, /Forfeit/);
  assert.match(markup, /Home team forfeited/);
});

test("knockout feeder placeholders and result data stay visible", () => {
  const data: FinalsNightData = { seeds: Array.from({ length: 16 }, (_, i) => `Team ${i + 1}`), results: { "r16-m1": { scoreA: 5, scoreB: 2 } } };
  const markup = renderToStaticMarkup(<KnockoutBracket night="monday" data={data} kitColours={{ "Team 1": "#FFFFFF" }} />);
  assert.match(markup, /Winner M2/);
  assert.match(markup, /Team 1/);
  assert.match(markup, /Final score|5 goals/);
  assert.match(markup, /team-kit-light/);
  assert.match(markup, /team-kit[^>]*>[\s\S]*?Team 1/);
});
