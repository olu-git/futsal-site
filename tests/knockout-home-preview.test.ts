import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import seasonData from "../src/data/season-2026-s1.json";
import { finalsMatches, resolveFinalsSlot, winnerSide, type FinalsSeasonData } from "../src/lib/finals";
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
  assert.deepEqual(result, { scoreA: 5, scoreB: 5, penaltyWinner: "A", penaltyScoreA: 3, penaltyScoreB: 2 });
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

test("home bracket remains active through both finals nights", () => {
  assert.equal(hasCurrentFinals(season, "2026-09-30"), true);
  assert.ok(finalsMatches.monday.some((match) => match.round === "Grading"));
  assert.ok(finalsMatches.wednesday.some((match) => match.round === "Grading"));
  assert.equal(hasCurrentFinals(season, "2026-10-08"), false);
});

test("home bracket shows grading and the decisive rounds without the full Round of 16 stack", () => {
  for (const night of ["monday", "wednesday"] as const) {
    const html = renderToStaticMarkup(createElement(KnockoutBracket, {
      night, data: season.finals[night], kitColours: {}, preview: true,
    }));
    assert.match(html, /Grading Games/);
    assert.match(html, /Quarter Finals/);
    assert.match(html, /Semi Finals/);
    assert.match(html, /Grand Final/);
    assert.doesNotMatch(html, /Round of 16<\/h3>/);
    assert.match(html, /h-\[600px\]/);
  }
});

test("Monday G2 identifies Salvos as the forfeiting side on full and preview brackets", () => {
  for (const preview of [false, true]) {
    const html = renderToStaticMarkup(createElement(KnockoutBracket, {
      night: "monday", data: season.finals.monday, kitColours: {}, preview,
    }));
    assert.match(html, /Salvos forfeited/);
  }
});
