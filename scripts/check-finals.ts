import assert from "node:assert/strict";
import seasonData from "../src/data/season-2026-s1.json";
import teamsData from "../src/data/teams.json";
import wednesdayFixturesData from "../src/data/wednesday-fixtures.json";
import {
  finalsDates,
  finalsMatches,
  resolveFinalsSlot,
  winnerSide,
  type FinalsNightData,
  type FinalsSeasonData,
} from "../src/lib/finals";
import type { CompetitionNight, Fixture, Team } from "../src/lib/types";

const season = seasonData as FinalsSeasonData;
const nights: CompetitionNight[] = ["monday", "wednesday"];
const teams = teamsData as Team[];
const wednesdayFixtures = wednesdayFixturesData as Fixture[];

const dwell = teams.find((team) => team.id === "wed-dwell-fc");
assert(dwell, "Dwell FC should remain in the Wednesday regular-season team data");
assert.equal(dwell.name, "Dwell FC");
assert.equal(dwell.night, "wednesday");
assert(
  wednesdayFixtures.some(
    (fixture) =>
      fixture.homeTeam === "wed-dwell-fc" || fixture.awayTeam === "wed-dwell-fc"
  ),
  "Dwell FC should retain its Wednesday regular-season fixture history"
);
assert(
  !teams.some((team) => team.id === "wed-top-up-fc"),
  "Top Up FC is a knockout-only replacement and should not overwrite Wednesday regular-season teams"
);

for (const night of nights) {
  const data = season.finals[night];
  assert.equal(data.seeds.length, 16, `${night} should have 16 seeds`);
  assert.equal(new Set(data.seeds).size, 16, `${night} seeds should be unique`);

  const expectedDay = night === "monday" ? 1 : 3;
  for (const date of finalsDates[night]) {
    assert.equal(
      new Date(`${date}T00:00:00Z`).getUTCDay(),
      expectedDay,
      `${date} should fall on the correct weekday`
    );
  }

  const ids = finalsMatches[night].map((match) => match.id);
  assert.equal(new Set(ids).size, ids.length, `${night} match IDs should be unique`);

  for (const [matchId, result] of Object.entries(data.results)) {
    assert(ids.includes(matchId), `${night} result ${matchId} should reference a known match`);
    assert(Number.isFinite(result.scoreA) && Number.isFinite(result.scoreB));
    if (result.penaltyWinner) {
      assert.equal(result.scoreA, result.scoreB, `${night} ${matchId} penalties require a tied score`);
      assert(Number.isFinite(result.penaltyScoreA) && Number.isFinite(result.penaltyScoreB));
      assert.notEqual(result.penaltyScoreA, result.penaltyScoreB);
    }
  }

  const slots = finalsMatches[night].map(
    (match) => `${match.week}|${match.time}|${match.court}`
  );
  assert.equal(new Set(slots).size, slots.length, `${night} time/court slots should be unique`);

  const firstRound = finalsMatches[night]
    .filter((match) => match.round === "R16")
    .map((match) => {
      assert(match.a.type === "seed" && match.b.type === "seed");
      return {
        match,
        teams: [data.seeds[match.a.value - 1], data.seeds[match.b.value - 1]],
      };
    });

  if (night === "monday") {
    for (const { match, teams } of firstRound) {
      if (teams.some((team) => team === "Hunger FC" || team === "Ghazni United")) {
        assert(["20:20", "21:00"].includes(match.time));
      }
      if (teams.includes("Blue Dragons")) assert.notEqual(match.time, "19:00");
    }
    const buckle = firstRound.find(({ teams }) => teams.includes("Bunyip"));
    const goldlink = firstRound.find(({ teams }) => teams.includes("Goldlink Up"));
    assert(buckle && goldlink);
    assert.notEqual(buckle.match.time, goldlink.match.time);
  } else {
    const rinnai = firstRound.find(({ teams }) => teams.includes("Rinnai"));
    const umoja = firstRound.find(({ teams }) => teams.includes("Umoja Stars"));
    assert(rinnai && umoja);
    assert.notEqual(rinnai.match.time, "19:00");
    assert.equal(umoja.match.time, "21:00");
  }
}

const wednesdayFinals = season.finals.wednesday;
assert.equal(wednesdayFinals.seeds[11], "Top Up FC");
assert(!wednesdayFinals.seeds.includes("Dwell FC"));
const wednesdayQuarterFinalTwo = finalsMatches.wednesday.find(
  (match) => match.id === "qf-2"
);
assert(wednesdayQuarterFinalTwo);
assert.equal(finalsDates.wednesday[wednesdayQuarterFinalTwo.week], "2026-09-30");
assert.equal(wednesdayQuarterFinalTwo.time, "19:40");
assert.equal(wednesdayQuarterFinalTwo.court, 2);
assert.equal(
  resolveFinalsSlot(wednesdayQuarterFinalTwo.a, "wednesday", wednesdayFinals)?.name,
  "Pops"
);
assert.equal(
  resolveFinalsSlot(wednesdayQuarterFinalTwo.b, "wednesday", wednesdayFinals)?.name,
  "Hazara United"
);

assert.equal(winnerSide(undefined), null);
assert.equal(winnerSide({ scoreA: 2, scoreB: 2 }), null);
assert.equal(winnerSide({ scoreA: 2, scoreB: 2, penaltyWinner: "B" }), "B");
assert.equal(winnerSide({ scoreA: 5, scoreB: 2 }), "A");

const resolverData: FinalsNightData = {
  seeds: Array.from({ length: 16 }, (_, index) => `Team ${index + 1}`),
  results: {
    "r16-m1": { scoreA: 5, scoreB: 2 },
    "r16-m2": { scoreA: 3, scoreB: 3, penaltyWinner: "B" },
    "r16-m5": { scoreA: 4, scoreB: 1 },
    "qf-1": { scoreA: 1, scoreB: 2 },
  },
};

const mondayMatches = finalsMatches.monday;
const quarterFinalOne = mondayMatches.find((match) => match.id === "qf-1");
const semiFinalOne = mondayMatches.find((match) => match.id === "sf-1");
const gradingOne = mondayMatches.find((match) => match.id === "grading-1");
assert(quarterFinalOne && semiFinalOne && gradingOne);

assert.equal(resolveFinalsSlot(quarterFinalOne.a, "monday", resolverData)?.name, "Team 1");
assert.equal(resolveFinalsSlot(quarterFinalOne.b, "monday", resolverData)?.name, "Team 9");
assert.equal(resolveFinalsSlot(semiFinalOne.a, "monday", resolverData)?.name, "Team 9");
assert.equal(resolveFinalsSlot(gradingOne.a, "monday", resolverData)?.name, "Team 16");
assert.equal(resolveFinalsSlot(gradingOne.b, "monday", resolverData)?.name, "Team 15");
assert.equal(resolveFinalsSlot(semiFinalOne.b, "monday", resolverData), null);

console.log("Finals data, calendar, and resolver checks passed.");
