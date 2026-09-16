import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { finalsDates, finalsMatches, type FinalsSeasonData } from "../src/lib/finals";
import { fixtures } from "../src/lib/data";
import { calculateStandings } from "../src/lib/standings";
import type { CompetitionNight } from "../src/lib/types";

const seasonPath = resolve(process.cwd(), "src/data/season-2026-s1.json");
const target = process.argv[2];

if (!target || !["monday", "wednesday", "all"].includes(target)) {
  throw new Error("Usage: npm run finals:freeze -- monday|wednesday|all");
}

const nights: CompetitionNight[] =
  target === "all" ? ["monday", "wednesday"] : [target as CompetitionNight];
const season = JSON.parse(readFileSync(seasonPath, "utf8")) as FinalsSeasonData;

for (const night of nights) {
  const pendingLeagueFixtures = fixtures.filter(
    (fixture) => fixture.night === night && fixture.status === "scheduled"
  );
  if (pendingLeagueFixtures.length > 0) {
    throw new Error(
      `${night} still has ${pendingLeagueFixtures.length} scheduled league fixture(s). Enter the final regular-season results before freezing seeds.`
    );
  }

  const standings = calculateStandings(night);
  const seeds =
    night === "monday"
      ? [
          ...standings
            .filter(
              (team) =>
                team.teamId !== "mon-xaywan" &&
                team.teamId !== "mon-bunyip"
            )
            .slice(0, 14)
            .map((team) => team.teamName),
          "Xaywan",
          "Bunyip",
        ]
      : standings.slice(0, 16).map((team) => team.teamName);

  validateSeeds(night, seeds);
  validateCalendar(night);
  validateFirstRoundTimes(night, seeds);
  season.finals[night].seeds = seeds;

  console.log(`\n${night.toUpperCase()} FINALS SEEDS`);
  seeds.forEach((team, index) => console.log(`${index + 1}. ${team}`));
}

writeFileSync(seasonPath, `${JSON.stringify(season, null, 2)}\n`, "utf8");
console.log(`\nUpdated ${seasonPath}. Existing finals results were preserved.`);

function validateSeeds(night: CompetitionNight, seeds: string[]) {
  if (seeds.length !== 16) {
    throw new Error(`${night} must have exactly 16 finals seeds; received ${seeds.length}.`);
  }
  if (new Set(seeds).size !== seeds.length) {
    throw new Error(`${night} finals seeds must be unique.`);
  }
  if (seeds.some((team) => !team.trim())) {
    throw new Error(`${night} finals seeds cannot contain blank team names.`);
  }
}

function validateCalendar(night: CompetitionNight) {
  const expectedDay = night === "monday" ? 1 : 3;
  for (const date of finalsDates[night]) {
    if (new Date(`${date}T00:00:00Z`).getUTCDay() !== expectedDay) {
      throw new Error(`${date} is not a ${night}.`);
    }
  }

  const occupied = new Set<string>();
  for (const match of finalsMatches[night]) {
    const key = `${match.week}|${match.time}|${match.court}`;
    if (occupied.has(key)) {
      throw new Error(`${night} has a duplicate finals slot at ${key}.`);
    }
    occupied.add(key);
  }
}

function validateFirstRoundTimes(night: CompetitionNight, seeds: string[]) {
  const assignments = finalsMatches[night]
    .filter((match) => match.round === "R16")
    .map((match) => {
      if (match.a.type !== "seed" || match.b.type !== "seed") {
        throw new Error(`${match.id} must use two seed slots.`);
      }
      return {
        match,
        teams: [seeds[match.a.value - 1], seeds[match.b.value - 1]],
      };
    });

  const errors: string[] = [];
  for (const { match, teams } of assignments) {
    if (
      night === "monday" &&
      teams.some((team) => team === "Hunger FC" || team === "Ghazni United") &&
      !["20:20", "21:00"].includes(match.time)
    ) {
      errors.push(`${teams.join(" vs ")} cannot play at ${match.time}.`);
    }
    if (
      night === "monday" &&
      teams.includes("Blue Dragons") &&
      match.time === "19:00"
    ) {
      errors.push(`Blue Dragons cannot play at ${match.time}.`);
    }
    if (night === "wednesday" && teams.includes("Rinnai") && match.time === "19:00") {
      errors.push(`Rinnai cannot play at ${match.time}.`);
    }
    if (night === "wednesday" && teams.includes("Kuq E Zi") && match.time === "21:00") {
      errors.push(`Kuq E Zi cannot play at ${match.time}.`);
    }
    if (
      night === "wednesday" &&
      teams.includes("Umoja Stars") &&
      match.time !== "21:00"
    ) {
      errors.push(`Umoja Stars must play at 21:00, not ${match.time}.`);
    }
  }

  if (night === "monday") {
    const buckle = assignments.find(({ teams }) => teams.includes("Buckle City"));
    const goldlink = assignments.find(({ teams }) => teams.includes("Goldlink Up"));
    if (
      buckle &&
      goldlink &&
      buckle.match.id !== goldlink.match.id &&
      buckle.match.time === goldlink.match.time
    ) {
      errors.push("Buckle City and Goldlink Up cannot play at the same time.");
    }
  }

  if (errors.length > 0) {
    throw new Error(`Finals time constraints failed:\n- ${errors.join("\n- ")}`);
  }
}
