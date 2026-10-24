import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { buildImportArtifacts } from "../scripts/lib/current-season-import";
import { canonicalTeamReadableId, originalTeamImportId, readableTeamIdChanges, kuqEZiIdentity } from "../src/lib/team-readable-id";
import { buildPublicSnapshot } from "../src/lib/public-snapshot";
import type { PublishedCompetitionRows } from "../src/lib/public-competition";
import { kickoffIssues, playingDateStatus, sharedPlayerClash } from "../scripts/lib/new-season-planning";
import { calculateStandings } from "../src/lib/standings";

test("readable-ID changes preserve each imported database UUID and do not alias distinct teams", () => {
  const model = buildImportArtifacts().model;
  for (const change of readableTeamIdChanges) {
    const team = Object.values(model.nights).flatMap((night) => night.teams).find((team) => team.id === change.newId);
    assert.equal(team?.uuid, change.uuid);
    assert.equal(originalTeamImportId(change.newId), change.oldId);
    assert.equal(canonicalTeamReadableId(change.oldId, change.uuid), change.newId);
    assert.equal(canonicalTeamReadableId(change.oldId, "different-membership"), change.oldId);
  }
  assert.equal(model.nights.wednesday.teams.find((team) => team.id === kuqEZiIdentity.newId)?.uuid, kuqEZiIdentity.uuid);
  assert.equal(canonicalTeamReadableId("wed-xaywan"), "wed-xaywan"); // No name/old-ID alias.
  assert.equal(canonicalTeamReadableId("wed-xaywan", kuqEZiIdentity.uuid), "wed-kuq-e-zi");
  for (const id of ["mon-xaywan", "wed-ibiza", "wed-buckle-city", "mon-buckle-city"]) assert.equal(canonicalTeamReadableId(id), id);
  const seeds = [...calculateStandings("monday").filter((team) => !["mon-declans-delinquents", "mon-bunyip"].includes(team.teamId)).slice(0, 14).map((team) => team.teamName), "Declan's Delinquents", "Bunyip"];
  assert.equal(seeds.length, 16);
  assert.equal(new Set(seeds).size, 16);
  assert(readFileSync("scripts/freeze-finals-seeds.ts", "utf8").includes('team.teamId !== "mon-declans-delinquents"'));
});

test("snapshots remap confirmed memberships and child references before and after the database ID update", () => {
  const m = readableTeamIdChanges[0], w = { ...kuqEZiIdentity, oldId: originalTeamImportId(kuqEZiIdentity.newId) };
  const rows: PublishedCompetitionRows = {
    editions: [
      { id: "m", lifecycle: "active", publication_state: "published", competitions: { weekday: 1, division: "A" }, seasons: { ends_on: "2026-10-07" } },
      { id: "w", lifecycle: "active", publication_state: "published", competitions: { weekday: 3, division: "A" }, seasons: { ends_on: "2026-10-07" } },
    ],
    teams: [
      { id: m.uuid, legacy_id: m.oldId, name: "King ADL", competition_season_id: "m", status: "active", standings_eligible: true, kit_colour: "#27AE60" },
      { id: "opponent", legacy_id: "mon-afg", name: "AFG", competition_season_id: "m", status: "active", standings_eligible: true, kit_colour: "#FFFFFF" },
      { id: w.uuid, legacy_id: w.oldId, name: "Kuq E Zi", competition_season_id: "w", status: "active", standings_eligible: true, kit_colour: null },
    ],
    fixtures: [{ id: "fixture", legacy_id: null, competition_season_id: "m", round_number: 1, match_date: "2026-03-23", kickoff_time: "19:00:00", court: 1, home_team_id: m.uuid, away_team_id: "opponent", stage: "regular_season", publication_state: "published", public_note: null }],
    results: [{ fixture_id: "fixture", status: "published", home_score: 2, away_score: 1, forfeit_side: null }],
    adjustments: [{ id: "adjustment", legacy_id: null, competition_season_id: "m", team_id: m.uuid, played_delta: 1, wins_delta: 0, draws_delta: 1, losses_delta: 0, goals_for_delta: 0, goals_against_delta: 0, points_delta: 1, reason: "Historical adjustment", publication_state: "published" }],
  };
  const before = buildPublicSnapshot(rows);
  const after = buildPublicSnapshot({ ...rows, teams: rows.teams.map((team) => ({ ...team, legacy_id: team.legacy_id ? canonicalTeamReadableId(team.legacy_id, team.id) : null })) });
  assert.deepEqual(before, after);
  assert.equal(before.data.fixtures[0].homeTeam, m.newId);
  assert.equal(before.data.standingsAdjustments[0].teamId, m.newId);
  assert.equal(before.data.fixtures[0].homeScore, 2);
  assert.equal(before.data.teams.find((team) => team.id === m.newId)?.kitColour, "#27AE60");
});

test("calendar preserves boundary playing nights and the provisional Monday", () => {
  assert.equal(playingDateStatus("wednesday", "2026-10-28"), "blocked");
  assert.equal(playingDateStatus("monday", "2026-11-02"), "provisional");
  assert.equal(playingDateStatus("wednesday", "2026-12-23"), "available");
  for (const [night, date] of [["monday", "2026-12-28"], ["wednesday", "2026-12-30"], ["monday", "2027-01-04"], ["wednesday", "2027-01-06"]] as const) assert.equal(playingDateStatus(night, date), "blocked");
  assert.equal(playingDateStatus("monday", "2027-01-11"), "available");
  assert.equal(playingDateStatus("wednesday", "2027-01-13"), "available");
  assert.equal(playingDateStatus("wednesday", "2027-01-11"), "blocked");
});

test("general availability survives without applying it retroactively to finals history", () => {
  assert.equal(kickoffIssues("wednesday", ["Kuq E Zi", "Umoja Stars"], "21:00").hard.length, 0);
  assert.equal(kickoffIssues("wednesday", ["Kuq E Zi", "AFG"], "21:00").hard.length, 1);
  assert.equal(kickoffIssues("wednesday", ["Umoja Stars", "AFG"], "20:20").hard.length, 1);
  assert.equal(kickoffIssues("monday", ["Hunger FC", "Ghazni United"], "19:30").hard.length, 0);
  assert.equal(kickoffIssues("monday", ["Blue Dragons", "AFG"], "19:00").hard.length, 1);
  assert.equal(kickoffIssues("wednesday", ["Rinnai", "AFG"], "19:00").hard.length, 1);
  assert.equal(kickoffIssues("wednesday", ["Ibiza", "Ghazni United"], "21:00").soft.length, 1);
  assert.equal(sharedPlayerClash(["Goldlink Up", "AFG"], ["Bunyip", "Misfits"], true), false);
  assert.equal(sharedPlayerClash(["Goldlink Up", "AFG"], ["Buckle City", "Misfits"], true), true);
  assert.equal(sharedPlayerClash(["Goldlink Up", "Buckle City"], ["Ibiza", "Misfits"], true), false);
  const checker = readFileSync("scripts/check-finals.ts", "utf8");
  assert(!checker.includes("approvedHungerSemiFinal") && !checker.includes("Umoja Stars must play at 21:00"));
});

test("organiser soft preferences and unrestricted availability do not erase the retained hard rules", () => {
  for (const night of ["monday", "wednesday"] as const) {
    for (const time of ["19:00", "21:00"]) {
      const issues = kickoffIssues(night, ["Ghazni United"], time);
      assert.equal(issues.hard.length, 0);
      assert.equal(issues.soft.length, 1);
    }
    assert.deepEqual(kickoffIssues(night, ["Ghazni United"], "19:40"), { hard: [], soft: [] });
  }
  assert.equal(kickoffIssues("monday", ["Salvos"], "21:00").hard.length, 0);
  assert.equal(kickoffIssues("monday", ["Salvos"], "21:00").soft.length, 1);
  assert.equal(kickoffIssues("monday", ["Blue Dragons"], "19:00").hard.length, 1);
  assert.equal(kickoffIssues("monday", ["Blue Dragons"], "19:40").hard.length, 0);
  assert.equal(kickoffIssues("monday", ["Gay Guys"], "19:40").hard.length, 0);
  assert.equal(kickoffIssues("monday", ["Gay Guys"], "20:20").hard.length, 0);
  for (const team of ["Bunyip", "Kroos Kontrol"]) {
    assert.equal(kickoffIssues("monday", [team], "21:00").hard.length, 0);
    assert.equal(kickoffIssues("monday", [team], "21:00").soft.length, 1);
  }
  assert.equal(kickoffIssues("monday", ["King ADL"], "19:00").soft.length, 1);
  assert.deepEqual(kickoffIssues("wednesday", ["Ibiza"], "19:00"), { hard: [], soft: [] });
});
