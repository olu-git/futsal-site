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
  _teams: Team[]
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Index fixtures by night+date for slot-level checks
  const byNightDate = new Map<string, Fixture[]>();
  for (const f of fixtures) {
    const key = `${f.night}::${f.date}`;
    if (!byNightDate.has(key)) byNightDate.set(key, []);
    byNightDate.get(key)!.push(f);
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
  for (const nightDateFixtures of byNightDate.values()) {
    const byTime = new Map<string, Fixture[]>();
    for (const f of nightDateFixtures) {
      if (!byTime.has(f.time)) byTime.set(f.time, []);
      byTime.get(f.time)!.push(f);
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
