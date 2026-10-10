import { kickoffIssues, mondayOpponentCount, mondayRoster, wednesdayRoster, regularSeasonDates, sharedPlayerClash, playingDateStatus } from "./new-season-planning";

export interface LocalDraftFixture { round: number; date: string | null; time: string; court: number; home: string; away: string; provisional?: boolean }
export interface LocalMondayDraft { night: string; publication: string; fixtures: LocalDraftFixture[]; startDate?: string; endDate?: string }
const ids = ["mon-afg", "mon-blue-dragons", "mon-goldlink-up", "mon-misfits", "mon-ghazni-united", "mon-wildcats", "mon-nassaji-fc", "mon-salvos", "mon-hunger-fc", "mon-king-adl", "mon-xaywan", "mon-hope", "mon-bunyip", "mon-declans-delinquents"];
const names = new Map(ids.map((id, index) => [id, mondayRoster[index]]));
const key = (a: string, b: string) => [a, b].sort().join("|");

function validateDraft(draft: LocalMondayDraft, night: "monday" | "wednesday") {
  const isMonday = night === "monday", rounds = isMonday ? 26 : 30, games = isMonday ? 7 : 8;
  const roster = isMonday ? mondayRoster : wednesdayRoster;
  const ids = isMonday ? [...names.keys()] : roster.map((name) => `wed-${name.toLowerCase().replaceAll(" ", "-")}`);
  const teamNames = new Map(ids.map((id, index) => [id, roster[index]]));
  const expectedDates = regularSeasonDates(night);
  const preferences: { round: number; pair: string; issue: string }[] = [];
  if (draft.night !== night || draft.publication !== "local-review-only") throw new Error("Expected a local-only competition draft.");
  const errors: string[] = [];
  const pairs = new Map<string, LocalDraftFixture[]>(), slots = new Set<string>();
  const totals = Object.fromEntries(ids.map((id) => [id, { played: 0, home: 0, away: 0 }]));
  const dates = new Map<number, string | null>();
  for (const fixture of draft.fixtures) {
    const home = teamNames.get(fixture.home), away = teamNames.get(fixture.away);
    if (!home || !away || home === away) { errors.push("Invalid team identity."); continue; }
    if (!Number.isInteger(fixture.round) || fixture.round < 1 || fixture.round > rounds || ![1, 2].includes(fixture.court)) errors.push("Invalid round or court.");
    if (!["19:00", "19:40", "20:20", "21:00"].includes(fixture.time)) errors.push("Invalid kickoff slot.");
    if (dates.has(fixture.round) && dates.get(fixture.round) !== fixture.date) errors.push("A round spans multiple playing dates.");
    dates.set(fixture.round, fixture.date);
    if (fixture.date !== null && playingDateStatus(night, fixture.date) === "blocked") errors.push("Blocked calendar date.");
    if (fixture.date !== expectedDates[fixture.round - 1]) errors.push("Wrong round playing date.");
    if (fixture.provisional !== (fixture.date === "2026-11-02")) errors.push("Wrong provisional flag.");
    const kickoff = kickoffIssues(night, [home, away], fixture.time);
    errors.push(...kickoff.hard);
    for (const issue of kickoff.soft) preferences.push({ round: fixture.round, pair: key(fixture.home, fixture.away), issue });
    const slot = `${fixture.round}|${fixture.time}|${fixture.court}`;
    if (slots.has(slot)) errors.push("Court/time collision.");
    slots.add(slot);
    totals[fixture.home].played++; totals[fixture.home].home++;
    totals[fixture.away].played++; totals[fixture.away].away++;
    const p = key(fixture.home, fixture.away);
    pairs.set(p, [...(pairs.get(p) ?? []), fixture]);
  }
  for (let round = 1; round <= rounds; round++) {
    const matches = draft.fixtures.filter((fixture) => fixture.round === round);
    const players = matches.flatMap((fixture) => [fixture.home, fixture.away]);
    if (matches.length !== games || players.length !== ids.length || new Set(players).size !== ids.length || ids.some((id) => !players.includes(id))) errors.push(`Round ${round}: not exactly one match per team.`);
    if (matches.filter((fixture) => fixture.time === "21:00").length !== (isMonday ? 1 : 2)) errors.push(`Round ${round}: unnecessary late slots.`);
    for (const [i, a] of matches.entries()) for (const b of matches.slice(i + 1)) {
      if (sharedPlayerClash([teamNames.get(a.home)!, teamNames.get(a.away)!], [teamNames.get(b.home)!, teamNames.get(b.away)!], a.time === b.time)) errors.push(`Round ${round}: shared-player kickoff collision.`);
    }
  }
  const gapsUnderFour: { pair: string; rounds: number[] }[] = [], sameHalfDoubles: string[] = [];
  for (const [index, a] of ids.entries()) for (const b of ids.slice(index + 1)) {
    const matches = (pairs.get(key(a, b)) ?? []).sort((x, y) => x.round - y.round);
    const expected = isMonday ? mondayOpponentCount(teamNames.get(a)!, teamNames.get(b)!) : 2;
    if (matches.length !== expected || matches.length > 3) errors.push(`Wrong opponent count: ${a}/${b}.`);
    for (let i = 1; i < matches.length; i++) {
      const gap = matches[i].round - matches[i - 1].round;
      if (gap <= 1) errors.push(`Back-to-back opponents: ${a}/${b}.`);
      if (gap < 4) gapsUnderFour.push({ pair: key(a, b), rounds: [matches[i - 1].round, matches[i].round] });
    }
    if (matches.length === 2 && (matches[0].round <= rounds / 2) === (matches[1].round <= rounds / 2)) sameHalfDoubles.push(key(a, b));
    if (matches.length === 2 && matches[0].home === matches[1].home) errors.push(`Home/away pair imbalance: ${a}/${b}.`);
  }
  for (const [id, total] of Object.entries(totals)) if (total.played !== rounds || total.home !== rounds / 2 || total.away !== rounds / 2) errors.push(`Unequal totals: ${id}.`);
  if (isMonday && !draft.fixtures.some((fixture) => fixture.round === 1 && key(fixture.home, fixture.away) === key("mon-wildcats", "mon-nassaji-fc"))) errors.push("Required Week 1 matchup missing.");
  if (draft.fixtures.length !== rounds * games) errors.push("Wrong total match count.");
  const datedRounds = [...dates.values()].filter((date): date is string => date !== null);
  if (new Set(datedRounds).size !== datedRounds.length) errors.push("Multiple rounds on one date.");
  if (datedRounds.length !== rounds) errors.push("Partially dated schedule is not valid.");
  if (draft.startDate !== expectedDates[0] || draft.endDate !== expectedDates.at(-1)) errors.push("Wrong calendar metadata.");
  if (gapsUnderFour.length || sameHalfDoubles.length) errors.push("Repeat spacing or half-season distribution failure.");
  if (errors.length) throw new Error([...new Set(errors)].join("\n"));
  const maximumHomeAwayRun = Math.max(...ids.map((id) => {
    const sides = draft.fixtures.filter((f) => f.home === id || f.away === id).sort((a,b) => a.round - b.round).map((f) => f.home === id);
    let run = 1, longest = 1;
    for (let i = 1; i < sides.length; i++) { run = sides[i] === sides[i-1] ? run + 1 : 1; longest = Math.max(longest, run); }
    return longest;
  }));
  if (maximumHomeAwayRun > 3) throw new Error("Home/away streak exceeds three.");
  const repeated = [...pairs.values()].flatMap((matches) => matches.slice(1).map((match, i) => match.round - matches[i].round));
  return { rounds, matches: rounds * games, startDate: expectedDates[0], endDate: expectedDates.at(-1), totals, hardConstraints: "passed", calendar: "confirmed dates, standing venue booking and known restrictions passed; private-profile reconciliation is recorded separately in the preparation report", minimumRepeatGap: Math.min(...repeated), maximumHomeAwayRun, preferences, gapsUnderFour, sameHalfDoubles };
}
export const validateMondayDraft = (draft: LocalMondayDraft) => validateDraft(draft, "monday");
export const validateWednesdayDraft = (draft: LocalMondayDraft) => validateDraft(draft, "wednesday");
