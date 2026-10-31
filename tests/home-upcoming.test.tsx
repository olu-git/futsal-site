import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import HomeUpcomingFixtures from "../src/components/HomeUpcomingFixtures";
import { melbourneToday } from "../src/lib/site-notices";
import type { CompetitionView } from "../src/lib/use-public-competition";

function competition(night: "monday" | "wednesday", date: string): CompetitionView {
  return {
    night, teams: [], kitColours: {}, formByTeam: {}, seasonName: "2026 - Season 2", divisions: [], results: [],
    upcoming: [
      { night, round: 3, date: "2026-10-26", fixtures: [] },
      { night, round: 4, date, fixtures: [] },
    ],
  };
}
const competitions = [competition("monday", "2026-11-02"), competition("wednesday", "2026-11-04")];

test("Home shows only the centred Wednesday closure until Melbourne Thursday midnight", () => {
  const before = renderToStaticMarkup(<HomeUpcomingFixtures competitions={competitions} today={melbourneToday(new Date("2026-10-28T12:59:59Z"))} />);
  assert.match(before, /home-upcoming-notices/);
  assert.match(before, /NO GAMES - WED 28 OCT/);
  assert.match(before, /Wednesday Night/);
  assert.doesNotMatch(before, /Monday Night|Round 3|Round 4/);
  assert.equal((before.match(/<article/g) ?? []).length, 1);
  const after = renderToStaticMarkup(<HomeUpcomingFixtures competitions={competitions} today={melbourneToday(new Date("2026-10-28T13:00:00Z"))} />);
  assert.doesNotMatch(after, /NO GAMES|home-upcoming-notices|Round 3/);
  assert.match(after, /Monday Night/);
  assert.match(after, /Wednesday Night/);
  assert.match(after, /2 Nov 2026/);
  assert.match(after, /4 Nov 2026/);
  assert.equal((after.match(/<article/g) ?? []).length, 2);
});

test("Home combines the November venue closures into one notice until Melbourne Monday midnight", () => {
  const postponed = [competition("monday", "2026-11-09"), competition("wednesday", "2026-11-11")];
  for (const today of ["2026-10-31", "2026-11-02", "2026-11-04", melbourneToday(new Date("2026-11-08T12:59:59Z"))]) {
    const html = renderToStaticMarkup(<HomeUpcomingFixtures competitions={postponed} today={today} />);
    assert.equal((html.match(/role="status"/g) ?? []).length, 1);
    assert.match(html, /NO GAMES - MON 2 &amp; WED 4 NOV/);
    assert.match(html, /Leisure Centre has cancelled/);
    assert.match(html, /MONDAY 9 NOVEMBER and WEDNESDAY 11 NOVEMBER/);
    assert.match(html, /monday-night#fixtures/);
    assert.match(html, /wednesday-night#fixtures/);
    assert.doesNotMatch(html, /Round 4|round-heading|home-upcoming-heading/);
  }
  const after = renderToStaticMarkup(<HomeUpcomingFixtures competitions={postponed} today={melbourneToday(new Date("2026-11-08T13:00:00Z"))} />);
  assert.doesNotMatch(after, /NO GAMES/);
  assert.match(after, /9 Nov 2026/);
  assert.match(after, /11 Nov 2026/);
});
