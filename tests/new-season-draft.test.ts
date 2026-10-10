import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { validateMondayDraft, validateWednesdayDraft, type LocalMondayDraft } from "../scripts/lib/validate-new-season-draft";
import { canonicalTeamReadableId, kuqEZiIdentity } from "../src/lib/team-readable-id";
const draft = JSON.parse(readFileSync("docs/drafts/monday-rounds.json", "utf8")) as LocalMondayDraft;
test("approved Monday counts decompose into 26 feasible rounds with balanced homes and hard kickoff rules", () => {
  const result = validateMondayDraft(draft);
  assert.equal(result.matches, 182);
  assert.equal(result.maximumHomeAwayRun, 3);
  assert.equal(result.calendar, "confirmed dates, standing venue booking and known restrictions passed; private-profile reconciliation is recorded separately in the preparation report");
  assert.deepEqual(result.gapsUnderFour, []);
  assert.deepEqual(result.sameHalfDoubles, []);
  assert(Object.values(result.totals).every((total) => total.played === 26 && total.home === 13 && total.away === 13));
});
test("draft verification rejects double bookings, invalid counts, wrong kickoff and blackout dates", () => {
  const collision = structuredClone(draft); collision.fixtures[1] = { ...collision.fixtures[0] };
  assert.throws(() => validateMondayDraft(collision), /collision|exactly one|opponent count/);
  const early = structuredClone(draft); early.fixtures.find((match) => [match.home, match.away].includes("mon-hunger-fc"))!.time = "19:00";
  assert.throws(() => validateMondayDraft(early), /Hunger FC/);
  const blocked = structuredClone(draft); blocked.fixtures[0].date = "2026-12-28";
  assert.throws(() => validateMondayDraft(blocked), /Blocked calendar/);
});
test("new memberships have fresh distinct UUIDs, no history source, and confirmed normal Buckle eligibility", () => {
  const { entries } = JSON.parse(readFileSync("docs/drafts/new-season-team-memberships.json", "utf8"));
  assert.equal(new Set(entries.map((entry: { uuid: string }) => entry.uuid)).size, 4);
  for (const entry of entries) { assert.equal(entry.sourceTeamId, null); assert.match(entry.uuid, /^[0-9a-f-]{14}4[0-9a-f-]{21}$/); }
  assert.equal(entries.find((entry: { name: string }) => entry.name === "Buckle City").standingsEligible, true);
  assert.equal(entries.find((entry: { name: string }) => entry.name === "Xaywan").readableId, "mon-xaywan");
  assert(!entries.some((entry: { uuid: string }) => entry.uuid === kuqEZiIdentity.uuid));
  assert.equal(canonicalTeamReadableId("mon-xaywan"), "mon-xaywan");
  assert.equal(canonicalTeamReadableId("wed-xaywan"), "wed-xaywan"); // No string alias remains.
});

const wed = JSON.parse(readFileSync("docs/drafts/wednesday-rounds.json", "utf8")) as LocalMondayDraft;
test("Wednesday double round robin has balanced homes, separated repeats and all hard rules", () => {
  const result = validateWednesdayDraft(wed);
  assert.equal(result.matches, 240);
  assert.equal(result.minimumRepeatGap, 15);
  assert.equal(result.maximumHomeAwayRun, 3);
  assert.equal(result.startDate, "2026-10-14"); assert.equal(result.endDate, "2027-05-26");
  assert(Object.values(result.totals).every((total) => total.played === 30 && total.home === 15 && total.away === 15));
  assert.equal(result.preferences.length, 2); // Ghazni must face 21:00-only Umoja twice.
  assert(result.preferences.every((entry) => entry.pair.includes("wed-umoja-stars") && entry.issue.includes("Ghazni")));
});
test("Wednesday verifier rejects restricted late games, shared-player collision and incorrect dates", () => {
  const early = structuredClone(wed); early.fixtures.find((m) => [m.home,m.away].includes("wed-umoja-stars"))!.time = "20:20";
  assert.throws(() => validateWednesdayDraft(early), /Umoja Stars/);
  const late = structuredClone(wed); late.fixtures[0].time = "21:00";
  assert.throws(() => validateWednesdayDraft(late), /Kuq E Zi/);
  const shared = structuredClone(wed); shared.fixtures[2].time = shared.fixtures[1].time;
  assert.throws(() => validateWednesdayDraft(shared), /shared-player/);
  const date = structuredClone(wed); date.fixtures[0].date = "2026-10-28";
  assert.throws(() => validateWednesdayDraft(date), /Blocked calendar/);
});

import { regularSeasonDates, playingDateStatus } from "../scripts/lib/new-season-planning";
test("calendar derives separate final dates, holiday skips and cancellation impact", () => {
  const mon = regularSeasonDates("monday"), cancel = regularSeasonDates("monday", true), wedDates = regularSeasonDates("wednesday");
  assert.equal(mon.at(-1), "2027-05-03"); assert.equal(cancel.at(-1), "2027-05-10");
  assert.equal(wedDates.at(-1), "2027-05-26");
  assert.equal(mon[3], "2026-11-02"); assert.equal(cancel[3], "2026-11-09");
  assert.equal(mon[11], "2027-01-11"); assert.equal(wedDates[9], "2026-12-23");
  for (const date of ["2027-03-08", "2027-03-29"]) assert.equal(playingDateStatus("monday", date), "blocked");
  assert.equal(playingDateStatus("monday", "2027-04-26"), "available");
  for (const date of [...mon,...wedDates]) assert(!(date > "2026-12-23" && date < "2027-01-11"));
  const flag = structuredClone(draft); flag.fixtures.find((m) => m.date === "2026-11-02")!.provisional = false;
  assert.throws(() => validateMondayDraft(flag), /provisional/);
});

test("balanced totals alone cannot conceal excessive Monday home/away streaks", () => {
 const bad=structuredClone(draft), pairs=new Map<string,typeof bad.fixtures>();
 for(const f of bad.fixtures){const key=[f.home,f.away].sort().join("|");pairs.set(key,[...(pairs.get(key)??[]),f]);}
 for(const matches of pairs.values())if(matches.length===2){matches.sort((a,b)=>a.round-b.round);if(matches[0].home>matches[0].away)for(const f of matches)[f.home,f.away]=[f.away,f.home];}
 assert.throws(()=>validateMondayDraft(bad),/streak/);
});
