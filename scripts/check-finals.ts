import assert from "node:assert/strict";
import seasonData from "../src/data/season-2026-s1.json";
import {
  finalsDates,
  finalsMatches,
  resolveFinalsSlot,
  winnerSide,
  type FinalsNightData,
  type FinalsSeasonData,
} from "../src/lib/finals";
import type { CompetitionNight } from "../src/lib/types";

const season = seasonData as FinalsSeasonData;
const nights: CompetitionNight[] = ["monday", "wednesday"];

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

  for (const match of finalsMatches[night]) {
    const resolvedTeams = [
      resolveFinalsSlot(match.a, night, data)?.name,
      resolveFinalsSlot(match.b, night, data)?.name,
    ].filter((team): team is string => Boolean(team));

    if (night === "monday") {
      if (resolvedTeams.some((team) => team === "Hunger FC" || team === "Ghazni United")) {
        assert(
          ["20:20", "21:00"].includes(match.time),
          `${resolvedTeams.join(" vs ")} cannot play at ${match.time}`
        );
      }
      if (resolvedTeams.includes("Blue Dragons")) {
        assert.notEqual(match.time, "19:00", "Blue Dragons cannot play at 19:00");
      }
    } else {
      if (resolvedTeams.includes("Rinnai")) {
        assert.notEqual(match.time, "19:00", "Rinnai cannot play at 19:00");
      }
      if (resolvedTeams.includes("Kuq E Zi")) {
        assert.notEqual(match.time, "21:00", "Kuq E Zi cannot play at 21:00");
      }
      if (resolvedTeams.includes("Umoja Stars")) {
        assert.equal(match.time, "21:00", "Umoja Stars must play at 21:00");
      }
    }
  }
}

assert.equal(winnerSide(undefined), null);
assert.equal(winnerSide({ scoreA: 2, scoreB: 2 }), null);
assert.equal(winnerSide({ scoreA: 2, scoreB: 2, penaltyWinner: "B" }), "B");
assert.equal(winnerSide({ scoreA: 5, scoreB: 2 }), "A");

const resolverData: FinalsNightData = {
  seeds: Array.from({ length: 16 }, (_, index) => `Team ${index + 1}`),
  results: {
    "r16-m1": { scoreA: 5, scoreB: 2 },
    "r16-m2": { scoreA: 3, scoreB: 3, penaltyWinner: "B" },
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
assert.equal(resolveFinalsSlot(gradingOne.b, "monday", resolverData), null);
assert.equal(resolveFinalsSlot(semiFinalOne.b, "monday", resolverData), null);

const mondayData = season.finals.monday;
const gradingMatchOne = mondayMatches.find((match) => match.id === "grading-1");
const gradingMatchThree = mondayMatches.find((match) => match.id === "grading-3");
const gradingMatchFour = mondayMatches.find((match) => match.id === "grading-4");
const mondayQuarterFinalTwo = mondayMatches.find((match) => match.id === "qf-2");
const mondayQuarterFinalThree = mondayMatches.find((match) => match.id === "qf-3");
assert(gradingMatchOne && gradingMatchThree && gradingMatchFour);
assert(mondayQuarterFinalTwo && mondayQuarterFinalThree);
assert.equal(resolveFinalsSlot(gradingMatchOne.a, "monday", mondayData)?.name, "Bunyip");
assert.equal(resolveFinalsSlot(gradingMatchOne.b, "monday", mondayData)?.name, "Declan's Team");
assert.equal(gradingMatchOne.time, "19:00");
assert.equal(resolveFinalsSlot(gradingMatchThree.a, "monday", mondayData)?.name, "Blue Dragons");
assert.equal(resolveFinalsSlot(gradingMatchThree.b, "monday", mondayData)?.name, "Misfits");
assert.equal(gradingMatchThree.time, "19:40");
assert.equal(resolveFinalsSlot(gradingMatchFour.a, "monday", mondayData)?.name, "Top Up FC");
assert.equal(resolveFinalsSlot(gradingMatchFour.b, "monday", mondayData)?.name, "Toss");
assert.equal(gradingMatchFour.time, "21:00");
assert.equal(resolveFinalsSlot(mondayQuarterFinalTwo.a, "monday", mondayData)?.name, "AFG");
assert.equal(resolveFinalsSlot(mondayQuarterFinalTwo.b, "monday", mondayData)?.name, "Goldlink Up");
assert.equal(mondayQuarterFinalTwo.time, "20:20");
assert.equal(mondayQuarterFinalTwo.court, 1);
assert.equal(resolveFinalsSlot(mondayQuarterFinalThree.a, "monday", mondayData)?.name, "Hunger FC");
assert.equal(resolveFinalsSlot(mondayQuarterFinalThree.b, "monday", mondayData)?.name, "Ghazni United");
assert.equal(mondayQuarterFinalThree.time, "20:20");
assert.equal(mondayQuarterFinalThree.court, 2);

console.log("Finals data, calendar, and resolver checks passed.");
