import assert from "node:assert/strict";
import seasonData from "../src/data/season-2026-s1.json";
import teamsData from "../src/data/teams.json";
import wednesdayFixturesData from "../src/data/wednesday-fixtures.json";
import {
  finalsDates,
  finalsMatches,
  isScheduledFinalsMatch,
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
    const match = finalsMatches[night].find((item) => item.id === matchId);
    assert(match && isScheduledFinalsMatch(match), `${night} result ${matchId} should reference a scheduled match`);
    assert(Number.isFinite(result.scoreA) && Number.isFinite(result.scoreB));
    if (result.forfeitSide !== undefined) {
      assert(["A", "B"].includes(result.forfeitSide), `${night} ${matchId} has an invalid forfeit side`);
      assert.equal(winnerSide(result), result.forfeitSide === "A" ? "B" : "A", `${night} ${matchId} forfeit winner should be the other team`);
      assert.equal(result.penaltyWinner, undefined, `${night} ${matchId} forfeit cannot use penalties`);
    }
    if (result.penaltyWinner) {
      assert.equal(result.scoreA, result.scoreB, `${night} ${matchId} penalties require a tied score`);
      assert(Number.isFinite(result.penaltyScoreA) && Number.isFinite(result.penaltyScoreB));
      const approvedTiedShootout = night === "monday" && matchId === "qf-3"
        && result.scoreA === 5 && result.scoreB === 5
        && result.penaltyScoreA === 2 && result.penaltyScoreB === 2
        && result.penaltyWinner === "A";
      assert(result.penaltyScoreA !== result.penaltyScoreB || approvedTiedShootout,
        `${night} ${matchId} tied penalties require the approved Hunger FC advancement`);
    }
  }

  const slots = finalsMatches[night].filter(isScheduledFinalsMatch).map(
    (match) => `${match.week}|${match.time}|${match.court}`
  );
  assert.equal(new Set(slots).size, slots.length, `${night} time/court slots should be unique`);

  const firstRound = finalsMatches[night]
    .filter(isScheduledFinalsMatch)
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

  for (const match of finalsMatches[night].filter(isScheduledFinalsMatch)) {
    const resolvedTeams = [
      resolveFinalsSlot(match.a, night, data)?.name,
      resolveFinalsSlot(match.b, night, data)?.name,
    ].filter((team): team is string => Boolean(team));

    if (night === "monday") {
      if (resolvedTeams.some((team) => team === "Hunger FC" || team === "Ghazni United")) {
        // Approved SF2-only exception: Hunger FC vs Moza Mama, 5 October at 19:30 on Court 2.
        const approvedHungerSemiFinal = match.id === "sf-2"
          && match.round === "SF"
          && finalsDates.monday[match.week] === "2026-10-05"
          && match.time === "19:30"
          && match.court === 2
          && resolvedTeams[0] === "Hunger FC"
          && resolvedTeams[1] === "Moza Mama";
        assert(
          approvedHungerSemiFinal || ["20:20", "21:00"].includes(match.time),
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

const wednesdayPlayed = [
  ["qf-4", "19:00", 1, "Goldlink Up", "Wildcats", 5, 4],
  ["grading-1", "19:00", 2, "Kuq E Zi", "MTS FC", 10, 4],
  ["qf-1", "19:40", 1, "AFG", "Moza Mama", 8, 4],
  ["qf-2", "19:40", 2, "Pops", "Hazara United", 8, 4],
  ["qf-3", "20:20", 1, "Ghazni United", "Misfits", 10, 7],
  ["grading-2", "20:20", 2, "Rinnai", "Toss", 4, 8],
] as const;
for (const [id, time, court, home, away, homeScore, awayScore] of wednesdayPlayed) {
  const match = finalsMatches.wednesday.find((item) => item.id === id);
  assert(match && isScheduledFinalsMatch(match), `Wednesday ${id} must be scheduled`);
  assert.equal(match.time, time);
  assert.equal(match.court, court);
  assert.equal(resolveFinalsSlot(match.a, "wednesday", wednesdayFinals)?.name, home);
  assert.equal(resolveFinalsSlot(match.b, "wednesday", wednesdayFinals)?.name, away);
  assert.deepEqual(wednesdayFinals.results[id], { scoreA: homeScore, scoreB: awayScore });
}
for (const id of ["grading-3", "grading-4"]) {
  const match = finalsMatches.wednesday.find((item) => item.id === id);
  assert(match && !isScheduledFinalsMatch(match), `Wednesday ${id} must be abandoned`);
  assert.equal(wednesdayFinals.results[id], undefined, `Abandoned ${id} cannot have a result`);
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

const mondayData = season.finals.monday;
const gradingMatchOne = mondayMatches.find((match) => match.id === "grading-1");
const gradingMatchThree = mondayMatches.find((match) => match.id === "grading-3");
const gradingMatchFour = mondayMatches.find((match) => match.id === "grading-4");
const mondayQuarterFinalTwo = mondayMatches.find((match) => match.id === "qf-2");
const mondayQuarterFinalThree = mondayMatches.find((match) => match.id === "qf-3");
const mondaySemiFinalTwo = mondayMatches.find((match) => match.id === "sf-2");
assert(gradingMatchOne && gradingMatchThree && gradingMatchFour);
assert(mondayQuarterFinalTwo && mondayQuarterFinalThree && mondaySemiFinalTwo);
assert.equal(resolveFinalsSlot(gradingMatchOne.a, "monday", mondayData)?.name, "Bunyip");
assert.equal(resolveFinalsSlot(gradingMatchOne.b, "monday", mondayData)?.name, "Declan's Delinquents");
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
assert.equal(finalsDates.monday[mondaySemiFinalTwo.week], "2026-10-05");
assert.equal(mondaySemiFinalTwo.time, "19:30");
assert.equal(mondaySemiFinalTwo.court, 2);
assert.equal(resolveFinalsSlot(mondaySemiFinalTwo.a, "monday", mondayData)?.name, "Hunger FC");
assert.equal(resolveFinalsSlot(mondaySemiFinalTwo.b, "monday", mondayData)?.name, "Moza Mama");

console.log("Finals data, calendar, and resolver checks passed.");
