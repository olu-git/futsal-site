import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import seasonData from "../src/data/season-2026-s1.json";
import { finalsMatches, isScheduledFinalsMatch, resolveFinalsSlot, winnerSide, type FinalsSeasonData } from "../src/lib/finals";
import { hasCurrentFinals } from "../src/components/KnockoutPreview";
import KnockoutBracket from "../src/components/KnockoutBracket";

const season = seasonData as FinalsSeasonData;

test("reported Monday pairings map to their existing A/B slots", () => {
  const pairings = [
    ["grading-1", "Bunyip", "Declan's Delinquents"],
    ["grading-3", "Blue Dragons", "Misfits"],
    ["grading-4", "Top Up FC", "Toss"],
    ["qf-1", "Wildcats", "Goal Diggers"],
    ["qf-2", "AFG", "Goldlink Up"],
    ["qf-3", "Hunger FC", "Ghazni United"],
    ["qf-4", "Hope", "Moza Mama"],
  ];
  for (const [id, a, b] of pairings) {
    const match = finalsMatches.monday.find((item) => item.id === id);
    assert.ok(match, `Missing ${id}`);
    assert.equal(resolveFinalsSlot(match.a, "monday", season.finals.monday)?.name, a);
    assert.equal(resolveFinalsSlot(match.b, "monday", season.finals.monday)?.name, b);
  }
  const gradingTwo = finalsMatches.monday.find((match) => match.id === "grading-2");
  assert.ok(gradingTwo);
  assert.equal(resolveFinalsSlot(gradingTwo.a, "monday", season.finals.monday)?.name, "Hazara United");
  assert.equal(resolveFinalsSlot(gradingTwo.b, "monday", season.finals.monday)?.name, "Salvos");
});

test("Monday results advance the correct semi-final teams", () => {
  const results = season.finals.monday.results;
  assert.deepEqual(results["grading-1"], { scoreA: 4, scoreB: 9 });
  assert.deepEqual(results["grading-2"], { scoreA: 5, scoreB: 0, forfeitSide: "B" });
  assert.equal(winnerSide(results["grading-2"]), "A");
  assert.deepEqual(results["grading-3"], { scoreA: 5, scoreB: 10 });
  assert.deepEqual(results["grading-4"], { scoreA: 4, scoreB: 7 });
  assert.deepEqual(results["qf-1"], { scoreA: 7, scoreB: 4 });
  assert.deepEqual(results["qf-2"], { scoreA: 4, scoreB: 5 });
  assert.deepEqual(results["qf-4"], { scoreA: 3, scoreB: 7 });
  const result = results["qf-3"];
  assert.deepEqual(result, { scoreA: 5, scoreB: 5, penaltyWinner: "A", penaltyScoreA: 2, penaltyScoreB: 2 });
  assert.equal(winnerSide(result), "A");
  const firstSemi = finalsMatches.monday.find((match) => match.id === "sf-1");
  const semi = finalsMatches.monday.find((match) => match.id === "sf-2");
  assert.ok(firstSemi && semi);
  assert.equal(resolveFinalsSlot(firstSemi.a, "monday", season.finals.monday)?.name, "Wildcats");
  assert.equal(resolveFinalsSlot(firstSemi.b, "monday", season.finals.monday)?.name, "Goldlink Up");
  assert.equal(resolveFinalsSlot(semi.a, "monday", season.finals.monday)?.name, "Hunger FC");
  assert.equal(resolveFinalsSlot(semi.b, "monday", season.finals.monday)?.name, "Moza Mama");
  assert.equal(result.scoreA, result.scoreB);
});

test("Wednesday 30 September quarter-finals advance the reported winners", () => {
  const data = season.finals.wednesday;
  const expected = [
    ["qf-1", "AFG", "Moza Mama", 8, 4],
    ["qf-2", "Pops", "Hazara United", 8, 4],
    ["qf-3", "Ghazni United", "Misfits", 10, 7],
    ["qf-4", "Goldlink Up", "Wildcats", 5, 4],
  ] as const;
  for (const [id, home, away, homeScore, awayScore] of expected) {
    const match = finalsMatches.wednesday.find((item) => item.id === id);
    assert.ok(match, `Missing ${id}`);
    assert.equal(resolveFinalsSlot(match.a, "wednesday", data)?.name, home);
    assert.equal(resolveFinalsSlot(match.b, "wednesday", data)?.name, away);
    assert.deepEqual(data.results[id], { scoreA: homeScore, scoreB: awayScore });
  }
  const semiOne = finalsMatches.wednesday.find((match) => match.id === "sf-1");
  const semiTwo = finalsMatches.wednesday.find((match) => match.id === "sf-2");
  assert.ok(semiOne && semiTwo);
  assert.equal(resolveFinalsSlot(semiOne.a, "wednesday", data)?.name, "AFG");
  assert.equal(resolveFinalsSlot(semiOne.b, "wednesday", data)?.name, "Pops");
  assert.equal(resolveFinalsSlot(semiTwo.a, "wednesday", data)?.name, "Ghazni United");
  assert.equal(resolveFinalsSlot(semiTwo.b, "wednesday", data)?.name, "Goldlink Up");
});

test("Wednesday grading history retains the played slots and abandoned records", () => {
  const data = season.finals.wednesday;
  for (const [id, time, court, home, away, homeScore, awayScore] of [
    ["grading-1", "19:00", 2, "Kuq E Zi", "MTS FC", 10, 4],
    ["grading-2", "20:20", 2, "Rinnai", "Toss", 4, 8],
  ] as const) {
    const match = finalsMatches.wednesday.find((item) => item.id === id);
    assert.ok(match && isScheduledFinalsMatch(match));
    assert.equal(match.time, time);
    assert.equal(match.court, court);
    assert.equal(resolveFinalsSlot(match.a, "wednesday", data)?.name, home);
    assert.equal(resolveFinalsSlot(match.b, "wednesday", data)?.name, away);
    assert.deepEqual(data.results[id], { scoreA: homeScore, scoreB: awayScore });
  }
  for (const id of ["grading-3", "grading-4"]) {
    const match = finalsMatches.wednesday.find((item) => item.id === id);
    assert.ok(match && !isScheduledFinalsMatch(match));
    assert.equal(data.results[id], undefined);
  }
  const playedSlots = finalsMatches.wednesday.filter((match) => match.week === 1 && isScheduledFinalsMatch(match));
  assert.equal(playedSlots.length, 6);
  assert.equal(new Set(playedSlots.map((match) => `${match.time}|${match.court}`)).size, 6);
});

test("home bracket remains active through both finals nights", () => {
  assert.equal(hasCurrentFinals(season, "2026-09-30"), true);
  assert.ok(finalsMatches.monday.some((match) => match.round === "Grading"));
  assert.ok(finalsMatches.wednesday.some((match) => match.round === "Grading"));
  assert.equal(hasCurrentFinals(season, "2026-10-08"), false);
});

test("public brackets show only knockout rounds while grading history stays in data", () => {
  for (const night of ["monday", "wednesday"] as const) {
    for (const preview of [false, true]) {
      const html = renderToStaticMarkup(createElement(KnockoutBracket, {
        night, data: season.finals[night], kitColours: {}, preview,
      }));
      assert.doesNotMatch(html, /Grading Games|bracket-grading|>G[1-4]<|Abandoned/i);
      assert.match(html, /Quarter Finals/);
      assert.match(html, /Semi Finals/);
      assert.match(html, /Grand Final/);
      if (night === "monday") {
        assert.match(html, /Hunger FC advances; penalties tied 2-2/);
      }
      if (preview) {
        assert.doesNotMatch(html, /Round of 16<\/h3>/);
        assert.match(html, /h-\[600px\]/);
      } else {
        assert.match(html, /Round of 16/);
      }
    }
  }
});

test("Monday Salvos forfeit remains recorded without a public grading card", () => {
  assert.deepEqual(season.finals.monday.results["grading-2"], { scoreA: 5, scoreB: 0, forfeitSide: "B" });
  assert.equal(winnerSide(season.finals.monday.results["grading-2"]), "A");
});
