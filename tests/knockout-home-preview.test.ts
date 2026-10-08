import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import seasonData from "../src/data/season-2026-s1.json";
import { finalsMatches, isScheduledFinalsMatch, resolveFinalsSlot, winnerSide, type FinalsSeasonData } from "../src/lib/finals";
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

test("Monday 5 October results resolve Goldlink Up as champion", () => {
  const data = season.finals.monday;
  const semiOne = finalsMatches.monday.find((match) => match.id === "sf-1");
  const semiTwo = finalsMatches.monday.find((match) => match.id === "sf-2");
  const final = finalsMatches.monday.find((match) => match.id === "gf");
  assert.ok(semiOne && semiTwo && final);
  assert.deepEqual(data.results["sf-1"], { scoreA: 5, scoreB: 8 });
  assert.deepEqual(data.results["sf-2"], { scoreA: 7, scoreB: 6 });
  assert.deepEqual(data.results.gf, { scoreA: 6, scoreB: 5 });
  assert.equal(resolveFinalsSlot(final.a, "monday", data)?.name, "Goldlink Up");
  assert.equal(resolveFinalsSlot(final.b, "monday", data)?.name, "Hunger FC");
  assert.equal(winnerSide(data.results.gf), "A");

  for (const preview of [false, true]) {
    const html = renderToStaticMarkup(createElement(KnockoutBracket, { night: "monday", data, kitColours: {}, preview }));
    assert.match(html, /2026 Season 1 Champions/);
    assert.match(html, /finals-champion-name">Goldlink Up/);
    assert.match(html, /pixel-confetti/);
    assert.match(html, /fill="#e6a921"/);
    assert.match(html, /aria-label="Play confetti"/);
    assert.match(html, /data-playing="false"/);
  }
  const withoutFinal = { ...data, results: { ...data.results } };
  delete withoutFinal.results.gf;
  const pendingHtml = renderToStaticMarkup(createElement(KnockoutBracket, { night: "monday", data: withoutFinal, kitColours: {} }));
  assert.doesNotMatch(pendingHtml, /finals-champion/);
  const wednesdayWithoutFinal = { ...season.finals.wednesday, results: { ...season.finals.wednesday.results } };
  delete wednesdayWithoutFinal.results.gf;
  const wednesdayHtml = renderToStaticMarkup(createElement(KnockoutBracket, { night: "wednesday", data: wednesdayWithoutFinal, kitColours: {} }));
  assert.doesNotMatch(wednesdayHtml, /finals-champion/);
});

test("Wednesday 7 October results resolve Goldlink Up as champion with the shared trophy", () => {
  const data = season.finals.wednesday;
  const final = finalsMatches.wednesday.find((match) => match.id === "gf");
  assert.ok(final);
  assert.deepEqual(data.results["sf-1"], { scoreA: 5, scoreB: 3 });
  assert.deepEqual(data.results["sf-2"], { scoreA: 5, scoreB: 6 });
  assert.deepEqual(data.results.gf, { scoreA: 4, scoreB: 8 });
  assert.equal(resolveFinalsSlot(final.a, "wednesday", data)?.name, "AFG");
  assert.equal(resolveFinalsSlot(final.b, "wednesday", data)?.name, "Goldlink Up");
  assert.equal(winnerSide(data.results.gf), "B");

  for (const preview of [false, true]) {
    const html = renderToStaticMarkup(createElement(KnockoutBracket, { night: "wednesday", data, kitColours: {}, preview }));
    assert.match(html, /finals-champion-name">Goldlink Up/);
    assert.match(html, /pixel-confetti/);
    assert.match(html, /fill="#e6a921"/);
  }
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

test("completed finals remain available in the Home preview", () => {
  for (const night of ["monday", "wednesday"] as const) {
    const html = renderToStaticMarkup(createElement(KnockoutBracket, { night, data: season.finals[night], kitColours: {}, preview: true }));
    assert.match(html, /2026 Season 1 Champions/);
  }
});

test("public brackets show only knockout rounds while grading history stays in data", () => {
  for (const night of ["monday", "wednesday"] as const) {
    for (const preview of [false, true]) {
      const html = renderToStaticMarkup(createElement(KnockoutBracket, {
        night, data: season.finals[night], kitColours: {}, preview,
      }));
      assert.doesNotMatch(html, /Grading Games|bracket-grading|>G[1-4]<|Abandoned/i);
      if (preview) assert.doesNotMatch(html, /Quarter Finals/);
      else assert.match(html, /Quarter Finals/);
      assert.match(html, /Semi Finals/);
      assert.match(html, /Grand Final/);
      if (night === "monday" && !preview) {
        assert.match(html, /Hunger FC advances; penalties tied 2-2/);
      }
      if (preview) {
        assert.doesNotMatch(html, /Round of 16<\/h3>/);
        assert.match(html, /home-knockout-stack/);
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
