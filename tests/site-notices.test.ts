import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { activeNoticeFor, melbourneToday, type SiteNotice } from "../src/lib/site-notices";

test("Wednesday closure is shown inclusively from 22 through 28 October only", () => {
  assert.equal(activeNoticeFor("wednesday", "2026-10-21"), undefined);
  for (let day = 22; day <= 28; day++) {
    assert.equal(activeNoticeFor("wednesday", `2026-10-${day}`)?.id, "no-games-wed-2026-10-28");
    assert.equal(activeNoticeFor("monday", `2026-10-${day}`), undefined);
  }
  assert.equal(activeNoticeFor("wednesday", "2026-10-29"), undefined);
});

test("closure wording matches the organiser's approved copy exactly", () => {
  const notice = activeNoticeFor("wednesday", "2026-10-22")!;
  assert.equal(notice.title, "NO GAMES - WED 28 OCT");
  assert.equal(notice.message, "Due to court renovations, Endeavour Hills Leisure Centre will be closed on Wednesday 28th October 2026. We will not have any games during this night.");
  assert.equal(notice.resumeText, "The season will resume on WEDNESDAY 4 NOVEMBER");
  assert.equal(notice.linkLabel, "Click here to see all fixtures");
});

test("notice selection uses its supplied night and date window", () => {
  const notice = { ...activeNoticeFor("wednesday", "2026-10-22")!, night: "monday", showFrom: "2026-11-01", date: "2026-11-02" } satisfies SiteNotice;
  assert.equal(activeNoticeFor("monday", "2026-11-01", [notice]), notice);
  assert.equal(activeNoticeFor("wednesday", "2026-11-01", [notice]), undefined);
  assert.equal(activeNoticeFor("monday", "2026-11-03", [notice]), undefined);
});

test("Melbourne date respects daylight saving and the end-of-night boundary", () => {
  assert.equal(melbourneToday(new Date("2026-10-27T14:00:00Z")), "2026-10-28");
  assert.equal(melbourneToday(new Date("2026-10-28T12:59:59Z")), "2026-10-28");
  assert.equal(melbourneToday(new Date("2026-10-28T13:00:00Z")), "2026-10-29");
});
test("competition notice precedes upcoming fixtures and does not leak into archive selection", () => {
  const source = readFileSync("src/components/CompetitionContent.tsx", "utf8");
  assert.match(source, /!selectedArchive \? activeNoticeFor\(night, today\) : undefined/);
  assert.ok(source.indexOf('<NoGamesNotice notice={notice}') < source.indexOf('id="upcoming-fixtures"'));
  assert.match(source, /useSyncExternalStore\(subscribeToMelbourneDate, melbourneToday, serverDate\)/);
  assert.match(source, /<FixtureList fixtures=\{competition.upcoming\[0\].fixtures\}/);
});
