import { Fixture, Team } from "./types";

// ============================================================
// Victoria 2026 public holidays that fall on Mon or Wed
// ============================================================
const VIC_PUBLIC_HOLIDAYS = new Set([
  "2026-04-06", // Easter Monday
  "2026-06-08", // Queen's Birthday (Victoria)
]);

// ============================================================
// Types
// ============================================================
export type IssueType = "hard" | "soft";

export interface ValidationIssue {
  type: IssueType;
  rule: string;
  fixtureId: string;
  message: string;
}

// ============================================================
// Main validator
// ============================================================
export function validateFixtures(
  fixtures: Fixture[],
  teams: Team[]
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const wednesdayTeamIds = new Set(
    teams
      .filter((team) => team.night === "wednesday" && team.division === "A")
      .map((team) => team.id)
  );
  const mondayTeamIds = new Set(
    teams
      .filter((team) => team.night === "monday" && team.division === "A")
      .map((team) => team.id)
  );

  // Index fixtures by night+date for slot-level checks
  const byNightDate = new Map<string, Fixture[]>();
  const byNightRound = new Map<string, Fixture[]>();
  const mondayMaxRound = fixtures
    .filter((fixture) => fixture.night === "monday")
    .reduce((maxRound, fixture) => Math.max(maxRound, fixture.round), 0);
  const mondayHalfRound = Math.floor(mondayMaxRound / 2);
  for (const f of fixtures) {
    const key = `${f.night}::${f.date}`;
    if (!byNightDate.has(key)) byNightDate.set(key, []);
    byNightDate.get(key)!.push(f);

    const roundKey = `${f.night}::${f.round}`;
    if (!byNightRound.has(roundKey)) byNightRound.set(roundKey, []);
    byNightRound.get(roundKey)!.push(f);
  }

  // ── Per-fixture checks ──────────────────────────────────────
  for (const f of fixtures) {
    // 1. Rinnai never at 19:00
    if (
      f.time === "19:00" &&
      (f.homeTeam === "wed-rinnai" || f.awayTeam === "wed-rinnai")
    ) {
      issues.push({
        type: "hard",
        rule: "rinnai-no-19:00",
        fixtureId: f.id,
        message: `Rinnai is scheduled at 19:00 in fixture ${f.id} (${f.date})`,
      });
    }

    // 2. Blue Dragons never at 19:00
    if (
      f.time === "19:00" &&
      (f.homeTeam === "mon-blue-dragons" || f.awayTeam === "mon-blue-dragons")
    ) {
      issues.push({
        type: "hard",
        rule: "blue-dragons-no-19:00",
        fixtureId: f.id,
        message: `Blue Dragons is scheduled at 19:00 in fixture ${f.id} (${f.date})`,
      });
    }

    // 3. Samen ideally not at 19:00 (soft)
    if (
      f.time === "19:00" &&
      (f.homeTeam.endsWith("-samen") || f.awayTeam.endsWith("-samen"))
    ) {
      issues.push({
        type: "soft",
        rule: "samen-avoid-19:00",
        fixtureId: f.id,
        message: `Samen is at 19:00 in fixture ${f.id} (${f.date}) — try to move to a later slot`,
      });
    }

    // 4. No games on public holidays
    if (VIC_PUBLIC_HOLIDAYS.has(f.date)) {
      issues.push({
        type: "hard",
        rule: "no-public-holiday",
        fixtureId: f.id,
        message: `Fixture ${f.id} falls on a Victorian public holiday (${f.date})`,
      });
    }

    // 5. Monday fixtures must be on a Monday
    if (f.night === "monday") {
      const day = new Date(f.date + "T00:00:00").getDay();
      if (day !== 1) {
        issues.push({
          type: "hard",
          rule: "wrong-day-of-week",
          fixtureId: f.id,
          message: `Monday fixture ${f.id} is on ${f.date} which is not a Monday`,
        });
      }
    }

    // 6. Wednesday fixtures must be on a Wednesday
    if (f.night === "wednesday") {
      const day = new Date(f.date + "T00:00:00").getDay();
      if (day !== 3) {
        issues.push({
          type: "hard",
          rule: "wrong-day-of-week",
          fixtureId: f.id,
          message: `Wednesday fixture ${f.id} is on ${f.date} which is not a Wednesday`,
        });
      }
    }
  }

  // ── Per-slot checks (same night + same date + same time) ────
  for (const [roundKey, roundFixtures] of byNightRound) {
    const [night, roundValue] = roundKey.split("::");
    const round = Number(roundValue);

    if (night === "wednesday" && round >= 4) {
      if (roundFixtures.length !== 6) {
        issues.push({
          type: "hard",
          rule: "wednesday-expansion-round-size",
          fixtureId: roundFixtures[0]?.id ?? `wed-r${round}`,
          message: `Wednesday round ${round} should contain 6 fixtures after expansion, found ${roundFixtures.length}`,
        });
      }

      const teamsInRound = new Set<string>();
      for (const fixture of roundFixtures) {
        teamsInRound.add(fixture.homeTeam);
        teamsInRound.add(fixture.awayTeam);
      }

      if (teamsInRound.size !== wednesdayTeamIds.size) {
        issues.push({
          type: "hard",
          rule: "wednesday-expansion-team-coverage",
          fixtureId: roundFixtures[0]?.id ?? `wed-r${round}`,
          message: `Wednesday round ${round} should include all ${wednesdayTeamIds.size} active teams exactly once`,
        });
      }
    }

    if (night === "monday" && round >= 6) {
      if (roundFixtures.length !== 6) {
        issues.push({
          type: "hard",
          rule: "monday-expanded-round-size",
          fixtureId: roundFixtures[0]?.id ?? `mon-r${round}`,
          message: `Monday round ${round} should contain 6 fixtures after expansion, found ${roundFixtures.length}`,
        });
      }

      const teamsInRound = new Set<string>();
      for (const fixture of roundFixtures) {
        teamsInRound.add(fixture.homeTeam);
        teamsInRound.add(fixture.awayTeam);
      }
      if (teamsInRound.size !== mondayTeamIds.size) {
        issues.push({
          type: "hard",
          rule: "monday-expanded-team-coverage",
          fixtureId: roundFixtures[0]?.id ?? `mon-r${round}`,
          message: `Monday round ${round} should include all ${mondayTeamIds.size} active teams exactly once`,
        });
      }
    }
  }

  // 10. Wednesday pair frequency guard
  const wednesdayPairFixtures = new Map<string, Fixture[]>();
  const mondayPairFixtures = new Map<string, Fixture[]>();
  const wednesdayFirstHalfPairFixtures = new Map<string, Fixture[]>();
  const wednesdaySecondHalfPairFixtures = new Map<string, Fixture[]>();
  const mondayFirstHalfPairFixtures = new Map<string, Fixture[]>();
  const mondaySecondHalfPairFixtures = new Map<string, Fixture[]>();
  for (const fixture of fixtures) {
    if (fixture.night === "wednesday") {
      const [a, b] = [fixture.homeTeam, fixture.awayTeam].sort();
      const key = `${a}::${b}`;
      if (!wednesdayPairFixtures.has(key)) wednesdayPairFixtures.set(key, []);
      wednesdayPairFixtures.get(key)!.push(fixture);

      if (fixture.round <= 11) {
        if (!wednesdayFirstHalfPairFixtures.has(key)) {
          wednesdayFirstHalfPairFixtures.set(key, []);
        }
        wednesdayFirstHalfPairFixtures.get(key)!.push(fixture);
      } else {
        if (!wednesdaySecondHalfPairFixtures.has(key)) {
          wednesdaySecondHalfPairFixtures.set(key, []);
        }
        wednesdaySecondHalfPairFixtures.get(key)!.push(fixture);
      }
    }
    if (fixture.night === "monday") {
      const [a, b] = [fixture.homeTeam, fixture.awayTeam].sort();
      const key = `${a}::${b}`;
      if (!mondayPairFixtures.has(key)) mondayPairFixtures.set(key, []);
      mondayPairFixtures.get(key)!.push(fixture);

      if (fixture.round <= mondayHalfRound) {
        if (!mondayFirstHalfPairFixtures.has(key)) {
          mondayFirstHalfPairFixtures.set(key, []);
        }
        mondayFirstHalfPairFixtures.get(key)!.push(fixture);
      } else {
        if (!mondaySecondHalfPairFixtures.has(key)) {
          mondaySecondHalfPairFixtures.set(key, []);
        }
        mondaySecondHalfPairFixtures.get(key)!.push(fixture);
      }
    }
  }

  // 10a. Wednesday second half should be unique pairings (at most once per pair).
  for (const [pairKey, pairFixtures] of wednesdaySecondHalfPairFixtures) {
    if (pairFixtures.length > 1) {
      const [teamA, teamB] = pairKey.split("::");
      for (const fixture of pairFixtures) {
        issues.push({
          type: "hard",
          rule: "wednesday-second-half-repeat",
          fixtureId: fixture.id,
          message: `Pair ${teamA} vs ${teamB} repeats in second half rounds (${pairFixtures
            .map((f) => f.round)
            .sort((a, b) => a - b)
            .join(", ")})`,
        });
      }
    }
  }

  const wednesdayOverplayedPairs: Array<{
    pairKey: string;
    teamA: string;
    teamB: string;
    count: number;
    fixtures: Fixture[];
  }> = [];

  for (const [pairKey, pairFixtures] of wednesdayPairFixtures) {
    const count = pairFixtures.length;
    const [teamA, teamB] = pairKey.split("::");

    if (count > 2) {
      wednesdayOverplayedPairs.push({
        pairKey,
        teamA,
        teamB,
        count,
        fixtures: pairFixtures,
      });
    }
  }

  // Wednesday pair-frequency rule:
  // - Preferred: every pair appears at most 2 times.
  // - Tolerance: at most one pair may appear 3 times if schedule constraints force it.
  // - Never allow any pair above 3.
  const overThree = wednesdayOverplayedPairs.filter((pair) => pair.count > 3);
  for (const pair of overThree) {
    for (const fixture of pair.fixtures) {
      issues.push({
        type: "hard",
        rule: "wednesday-pair-overplayed",
        fixtureId: fixture.id,
        message: `Pair ${pair.teamA} vs ${pair.teamB} appears ${pair.count} times in Wednesday fixtures (max 3, with only one pair allowed at 3)`,
      });
    }
  }

  const exactlyThree = wednesdayOverplayedPairs.filter((pair) => pair.count === 3);
  if (exactlyThree.length > 1) {
    const repeatedFirstHalfPairs = [...wednesdayFirstHalfPairFixtures.entries()]
      .filter(([, pairFixtures]) => pairFixtures.length > 1)
      .map(([pairKey]) => pairKey);

    const exactlyThreePairs = exactlyThree.map((pair) => pair.pairKey);
    const feasibilityHint =
      repeatedFirstHalfPairs.length > 1
        ? `Likely unavoidable with current locked first-half repeats (${repeatedFirstHalfPairs.join(
            "; "
          )}) unless first-half fixtures are changed.`
        : "May require a schedule rebuild to reduce to one 3x pair.";

    for (const pair of exactlyThree) {
      for (const fixture of pair.fixtures) {
        issues.push({
          type: "soft",
          rule: "wednesday-too-many-overplayed-pairs",
          fixtureId: fixture.id,
          message: `More than one Wednesday pair appears 3 times (${exactlyThreePairs.join(
            "; "
          )}). ${feasibilityHint}`,
        });
      }
    }
  } else if (exactlyThree.length === 1) {
    const pair = exactlyThree[0];
    for (const fixture of pair.fixtures) {
      issues.push({
        type: "soft",
        rule: "wednesday-single-overplayed-pair",
        fixtureId: fixture.id,
        message: `Single allowed exception: ${pair.teamA} vs ${pair.teamB} appears 3 times`,
      });
    }
  }

  // 10b. Monday pair-frequency and half split checks (18-round model).
  const mondayOverThree: Array<{
    pairKey: string;
    teamA: string;
    teamB: string;
    count: number;
    fixtures: Fixture[];
  }> = [];
  const mondayExactlyThree: Array<{
    pairKey: string;
    teamA: string;
    teamB: string;
    count: number;
    fixtures: Fixture[];
  }> = [];

  for (const [pairKey, pairFixtures] of mondayPairFixtures) {
    const count = pairFixtures.length;
    const [teamA, teamB] = pairKey.split("::");

    if (count > 3) {
      mondayOverThree.push({
        pairKey,
        teamA,
        teamB,
        count,
        fixtures: pairFixtures,
      });
    } else if (count === 3) {
      mondayExactlyThree.push({
        pairKey,
        teamA,
        teamB,
        count,
        fixtures: pairFixtures,
      });
    }

    if (count === 1) {
      for (const fixture of pairFixtures) {
        issues.push({
          type: "soft",
          rule: "monday-single-meeting",
          fixtureId: fixture.id,
          message: `Monday pair ${teamA} vs ${teamB} currently meets once in the season`,
        });
      }
    }

    if (count === 2) {
      const homes = new Set(pairFixtures.map((fixture) => fixture.homeTeam));
      if (homes.size === 1) {
        for (const fixture of pairFixtures) {
          issues.push({
            type: "soft",
            rule: "monday-home-away-balance",
            fixtureId: fixture.id,
            message: `Monday pair ${teamA} vs ${teamB} is not split home/away`,
          });
        }
      }
    }

    const firstHalfCount = mondayFirstHalfPairFixtures.get(pairKey)?.length ?? 0;
    const secondHalfCount = mondaySecondHalfPairFixtures.get(pairKey)?.length ?? 0;
    if (!(firstHalfCount === 1 && secondHalfCount === 1) && count > 0) {
      for (const fixture of pairFixtures) {
        issues.push({
          type: "soft",
          rule: "monday-half-split",
          fixtureId: fixture.id,
          message: `Monday pair ${teamA} vs ${teamB} split is first-${mondayHalfRound}=${firstHalfCount}, last-${
            mondayMaxRound - mondayHalfRound
          }=${secondHalfCount}`,
        });
      }
    }
  }

  for (const pair of mondayOverThree) {
    for (const fixture of pair.fixtures) {
      issues.push({
        type: "hard",
        rule: "monday-pair-overplayed",
        fixtureId: fixture.id,
        message: `Monday pair ${pair.teamA} vs ${pair.teamB} appears ${pair.count} times (max 3 tolerated)` ,
      });
    }
  }

  if (mondayExactlyThree.length > 0) {
    const names = mondayExactlyThree
      .map((pair) => `${pair.teamA} vs ${pair.teamB}`)
      .join("; ");
    for (const pair of mondayExactlyThree) {
      for (const fixture of pair.fixtures) {
        issues.push({
          type: "soft",
          rule: "monday-triple-meeting",
          fixtureId: fixture.id,
          message: `Monday triple-meeting pair(s): ${names}. Keep only if unavoidable.`,
        });
      }
    }
  }

  for (const nightDateFixtures of byNightDate.values()) {
    const sampleFixture = nightDateFixtures[0];
    const byTime = new Map<string, Fixture[]>();
    for (const f of nightDateFixtures) {
      if (!byTime.has(f.time)) byTime.set(f.time, []);
      byTime.get(f.time)!.push(f);
    }

    if (sampleFixture?.night === "wednesday" && sampleFixture.round >= 4) {
      for (const time of ["19:00", "19:40", "20:20"]) {
        const count = byTime.get(time)?.length ?? 0;
        if (count !== 2) {
          issues.push({
            type: "hard",
            rule: "wednesday-slot-balance",
            fixtureId: sampleFixture.id,
            message: `Wednesday ${sampleFixture.date} should have exactly 2 games at ${time}, found ${count}`,
          });
        }
      }
    }
    if (sampleFixture?.night === "monday" && sampleFixture.round >= 6) {
      for (const time of ["19:00", "19:40", "20:20"]) {
        const count = byTime.get(time)?.length ?? 0;
        if (count !== 2) {
          issues.push({
            type: "hard",
            rule: "monday-slot-balance",
            fixtureId: sampleFixture.id,
            message: `Monday ${sampleFixture.date} should have exactly 2 games at ${time}, found ${count}`,
          });
        }
      }
    }

    for (const [time, slotFixtures] of byTime) {
      // 7. Court collision — two games on the same court at the same time
      const courtCount = new Map<number, number>();
      for (const f of slotFixtures) {
        courtCount.set(f.court, (courtCount.get(f.court) ?? 0) + 1);
      }
      for (const [court, count] of courtCount) {
        if (count > 1) {
          for (const f of slotFixtures.filter((x) => x.court === court)) {
            issues.push({
              type: "hard",
              rule: "court-collision",
              fixtureId: f.id,
              message: `Court ${court} has multiple games at ${f.date} ${time} — fixture ${f.id} collides`,
            });
          }
        }
      }

      // 8. Team double-booked — same team in two fixtures at once
      const teamToFixtures = new Map<string, Fixture[]>();
      for (const f of slotFixtures) {
        for (const teamId of [f.homeTeam, f.awayTeam]) {
          if (!teamToFixtures.has(teamId)) teamToFixtures.set(teamId, []);
          teamToFixtures.get(teamId)!.push(f);
        }
      }
      for (const [teamId, teamFixtures] of teamToFixtures) {
        if (teamFixtures.length > 1) {
          for (const f of teamFixtures) {
            issues.push({
              type: "hard",
              rule: "team-double-booked",
              fixtureId: f.id,
              message: `Team ${teamId} appears in multiple fixtures at ${f.date} ${time}`,
            });
          }
        }
      }

      // 9. Buckle City and Goldlink Up never simultaneous unless playing each other
      const buckleFx = slotFixtures.find(
        (f) =>
          f.homeTeam.endsWith("-buckle-city") ||
          f.awayTeam.endsWith("-buckle-city")
      );
      const goldlinkFx = slotFixtures.find(
        (f) =>
          f.homeTeam.endsWith("-goldlink-up") ||
          f.awayTeam.endsWith("-goldlink-up")
      );

      if (buckleFx && goldlinkFx && buckleFx.id !== goldlinkFx.id) {
        // They are in different fixtures — not playing each other
        issues.push({
          type: "hard",
          rule: "buckle-goldlink-simultaneous",
          fixtureId: buckleFx.id,
          message: `Buckle City (${buckleFx.id}) and Goldlink Up (${goldlinkFx.id}) are both playing at ${buckleFx.date} ${time} but not against each other`,
        });
        issues.push({
          type: "hard",
          rule: "buckle-goldlink-simultaneous",
          fixtureId: goldlinkFx.id,
          message: `Buckle City (${buckleFx.id}) and Goldlink Up (${goldlinkFx.id}) are both playing at ${goldlinkFx.date} ${time} but not against each other`,
        });
      }
    }
  }

  return issues;
}

// ============================================================
// Pretty-print helper — call this in dev to audit the schedule
// ============================================================
export function logValidationResults(
  fixtures: Fixture[],
  teams: Team[]
): void {
  const issues = validateFixtures(fixtures, teams);

  if (issues.length === 0) {
    console.log("✅ All fixture constraints passed — schedule is clean.");
    return;
  }

  const hard = issues.filter((i) => i.type === "hard");
  const soft = issues.filter((i) => i.type === "soft");

  if (hard.length > 0) {
    console.error(`\n❌ ${hard.length} hard constraint violation(s):\n`);
    for (const i of hard) {
      console.error(`  [${i.rule}] ${i.message}`);
    }
  }

  if (soft.length > 0) {
    console.warn(`\n⚠️  ${soft.length} soft constraint warning(s):\n`);
    for (const i of soft) {
      console.warn(`  [${i.rule}] ${i.message}`);
    }
  }
}
