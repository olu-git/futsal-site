// Approved opponent totals and availability inputs; no database publication.
import calendar from "../../docs/drafts/new-season-calendar.json";
export const mondayRoster = ["AFG", "Blue Dragons", "Goldlink Up", "Misfits", "Ghazni United", "Wildcats", "Nassaji FC", "Salvos", "Hunger FC", "King ADL", "Xaywan", "Hope", "Bunyip", "Declan's Delinquents"] as const;
export const wednesdayRoster = ["AFG", "Goldlink Up", "Misfits", "Ghazni United", "Pops", "Rinnai", "Unathletico", "Wildcats", "Hazara United", "King ADL", "Ibiza", "Umoja Stars", "MTS FC", "Kuq E Zi", "Etihad FC", "Buckle City"] as const;

export function mondayOpponentCount(a: string, b: string): number {
  if (!mondayRoster.some((team) => team === a) || !mondayRoster.some((team) => team === b)) throw new Error("Unknown Monday entrant.");
  if (a === b) return 0;
  const pair = [a, b].sort().join("|");
  const key = (x: string, y: string) => [x, y].sort().join("|");
  if ([key("Xaywan", "Bunyip"), key("Xaywan", "Declan's Delinquents")].includes(pair)) return 0;
  if ([key("Bunyip", "Declan's Delinquents"), key("Bunyip", "Misfits"), key("Declan's Delinquents", "Misfits"),
    ...["AFG", "Blue Dragons", "Hope", "Salvos"].map((team) => key("Xaywan", team))].includes(pair)) return 3;
  if ([key("Misfits", "AFG"), key("Misfits", "Blue Dragons"), key("Hope", "Salvos")].includes(pair)) return 1;
  return 2;
}

export const requiredMondayWeekOnePair = ["Wildcats", "Nassaji FC"] as const;

export function playingDateStatus(night: "monday" | "wednesday", date: string): "available" | "provisional" | "blocked" {
  const parsed = new Date(`${date}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(parsed.valueOf()) || parsed.toISOString().slice(0, 10) !== date) throw new Error("Invalid playing date.");
  if (parsed.getUTCDay() !== (night === "monday" ? 1 : 3)) return "blocked";
  if (calendar.blockedDates.some((blocked) => blocked.date === date) || (date > calendar.lastPreBreakNight && date < calendar.firstPostBreakNight)) return "blocked";
  return calendar.provisionalDates.includes(date) ? "provisional" : "available";
}

export function regularSeasonDates(night: "monday" | "wednesday", cancelNovemberTwo = false): string[] {
  const dates: string[] = [], day = new Date(`${calendar.starts[night]}T00:00:00Z`);
  while (dates.length < calendar.rounds[night]) {
    const value = day.toISOString().slice(0, 10);
    if (playingDateStatus(night, value) !== "blocked" && !(cancelNovemberTwo && value === "2026-11-02")) dates.push(value);
    day.setUTCDate(day.getUTCDate() + 7);
  }
  return dates;
}

export function kickoffIssues(night: "monday" | "wednesday", teams: readonly string[], time: string) {
  const hard: string[] = [], soft: string[] = [];
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) throw new Error("Invalid kickoff time.");
  if (night === "monday") {
    for (const team of ["Hunger FC", "Ghazni United"]) if (teams.includes(team) && !["20:20", "21:00"].includes(time)) hard.push(`${team}: 20:20 or 21:00 only`);
    if (teams.includes("Blue Dragons") && time === "19:00") hard.push("Blue Dragons: no 19:00");
    if (teams.includes("Premiers FC") && time === "19:00") soft.push("Premiers FC: avoid 19:00");
  } else {
    if (teams.includes("Rinnai") && time === "19:00") hard.push("Rinnai: no 19:00");
    if (teams.includes("Umoja Stars") && time !== "21:00") hard.push("Umoja Stars: 21:00 throughout season");
    if (teams.includes("Kuq E Zi") && time === "21:00" && !teams.includes("Umoja Stars")) hard.push("Kuq E Zi: no 21:00 except against Umoja Stars");
    if (teams.includes("Ghazni United") && time === "21:00") soft.push("Ghazni United: avoid 21:00 unless necessary");
    if (teams.includes("Ibiza") && !["20:20", "21:00"].includes(time)) soft.push("Ibiza: prefer 20:20/21:00; 19:40 fallback; avoid 19:00");
  }
  if (teams.includes("Samen")) {
    if (time === "19:00") hard.push("Samen: no 19:00");
    if (time !== "20:20") soft.push("Samen: prefer 20:20; 19:40 only if necessary");
  }
  return { hard, soft };
}

export function sharedPlayerClash(a: readonly string[], b: readonly string[], sameKickoff: boolean): boolean {
  // No Bunyip, Hunger FC or Ibiza substitution for Buckle City.
  return sameKickoff && ((a.includes("Goldlink Up") && b.includes("Buckle City")) || (b.includes("Goldlink Up") && a.includes("Buckle City")));
}
