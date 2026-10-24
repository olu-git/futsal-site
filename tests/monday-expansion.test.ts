import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import previous from '../docs/drafts/roster-withdrawals-2026-10-22.json';
import { validateMondayExpansion, type MondayExpansion, type MondayExpansionConfig } from '../scripts/lib/validate-monday-expansion';
import type { RevisedFixture } from '../scripts/lib/validate-roster-revision';

const plan = JSON.parse(readFileSync('docs/drafts/monday-expansion-schedule-2026-10-25.json', 'utf8')) as MondayExpansion;
const config = JSON.parse(readFileSync('docs/drafts/monday-expansion-2026-10-25.json', 'utf8')) as MondayExpansionConfig;
const originalRoundThree = previous.monday.future.filter(f => f.round_number === 3);
const validate = (value: MondayExpansion, settings = config) => validateMondayExpansion(value, previous.monday.fixed, settings, originalRoundThree);
const participants = (f: { home_team_id: string; away_team_id: string }) => [f.home_team_id, f.away_team_id];

test('Monday expansion gives 16 teams 30 games, two meetings per pair and balanced homes', () => {
  const report = validate(plan);
  assert.equal(report.fixtures, 240);
  assert.equal(report.futureFixtures, 224);
  assert.equal(report.inheritedFixtures, 4);
  assert.equal(report.endDate, '2027-05-31');
  assert.ok(report.totals.every(t => t.matches === 30 && t.home === 15 && t.away === 15 && t.maximumStreak <= 3));
});

test('only the confirmed Declan and Gay Guys played histories transfer; Imole stays untouched', () => {
  const declan = '1d74c3b0-90ba-4304-aa68-b9681ea4bb9a';
  const gayGuys = '2368a5c2-7a91-484a-b201-fde870c85690';
  const transfers = new Map(config.inheritance.map(t => [t.fromTeamId, t]));
  assert.equal(transfers.get(declan)?.toTeamId, config.newTeam.id);
  assert.equal(transfers.get(gayGuys)?.toTeamId, config.reinstateTeam.id);
  assert.equal(transfers.size, 2);
  for (const transfer of transfers.values()) {
    const before = previous.monday.fixed.filter(f => participants(f).includes(transfer.fromTeamId));
    const after = plan.fixed.filter(f => participants(f).includes(transfer.toTeamId));
    assert.equal(before.length, 2);
    assert.deepEqual(after.map(f => f.id).sort(), before.map(f => f.id).sort());
    for (const original of before) {
      const inherited = after.find(f => f.id === original.id)!;
      assert.equal(inherited.home_team_id, original.home_team_id === transfer.fromTeamId ? transfer.toTeamId : original.home_team_id);
      assert.equal(inherited.away_team_id, original.away_team_id === transfer.fromTeamId ? transfer.toTeamId : original.away_team_id);
    }
  }
  const imole = plan.teams.find(t => t.name === 'Imole United')!.id;
  const before = previous.monday.fixed.filter(f => participants(f).includes(imole));
  assert.equal(before.length, 2);
  for (const original of before) {
    const current = plan.fixed.find(f => f.id === original.id)!;
    assert.equal(current.home_team_id, original.home_team_id);
    assert.equal(current.away_team_id, original.away_team_id);
  }
  assert.equal(plan.teams.find(t => t.id === config.newTeam.id)?.kit_colour, config.newTeam.kitColour);
  assert.equal(new Set(plan.fixed.map(f => f.id)).size, 16);
});

test('all seven existing October 26 assignments stay fixed and Jaghori-Buckle uses 21:00 Court 2', () => {
  validate(plan);
  const round = plan.future.filter(f => f.round_number === 3);
  assert.equal(round.length, 8);
  const addition = round.find(f => participants(f).includes(config.newTeam.id))!;
  assert.ok(participants(addition).includes(config.reinstateTeam.id));
  assert.equal(addition.match_date, '2026-10-26');
  assert.equal(addition.kickoff_time, '21:00:00');
  assert.equal(addition.court, 2);
  const moved = structuredClone(plan);
  moved.future.find(f => f.id === originalRoundThree[0].id)!.court = 2;
  assert.throws(() => validate(moved), /Round 3 fixture changed/);
});

test('Monday validator rejects duplicate history, unapproved inheritance and played assignment drift', () => {
  const duplicated = structuredClone(plan); duplicated.fixed[1] = structuredClone(duplicated.fixed[0]);
  assert.throws(() => validate(duplicated), /played fixture|Duplicate fixture/i);
  const changed = structuredClone(plan); changed.fixed[0].court = changed.fixed[0].court === 1 ? 2 : 1;
  assert.throws(() => validate(changed), /Played fixture changed/);
  const wrong = structuredClone(config); wrong.inheritance[0].fixtureIds.pop();
  assert.throws(() => validate(plan, wrong), /inheritance|result count/i);
  const relabelled = structuredClone(plan);
  const inherited = relabelled.fixed.find(f => participants(f).includes(config.newTeam.id))!;
  if (inherited.home_team_id === config.newTeam.id) inherited.home_team_id = config.reinstateTeam.id;
  else inherited.away_team_id = config.reinstateTeam.id;
  assert.throws(() => validate(relabelled), /Played fixture changed/);
});

test('Monday validator rejects hard availability, Goldlink-Buckle overlap and a third meeting', () => {
  const swapSlot = (value: MondayExpansion, gameId: string, time: string) => {
    const game = value.future.find(f => f.id === gameId)!;
    const other = value.future.find(f => f.round_number === game.round_number && f.kickoff_time === time)!;
    [game.kickoff_time, other.kickoff_time] = [other.kickoff_time, game.kickoff_time];
    [game.court, other.court] = [other.court, game.court];
  };
  for (const [name, forbidden] of [['Bunyip', '21:00:00'], ['Blue Dragons', '19:00:00']]) {
    const wrong = structuredClone(plan), id = wrong.teams.find(t => t.name === name)!.id;
    const game = wrong.future.find(f => f.round_number > 3 && participants(f).includes(id))!;
    swapSlot(wrong, game.id, forbidden);
    assert.throws(() => validate(wrong), /Hard kickoff conflict/);
  }
  const overlap = structuredClone(plan), goldlink = overlap.teams.find(t => t.name === 'Goldlink Up')!.id;
  const buckleGame = overlap.future.find(f => f.round_number > 3 && participants(f).includes(config.reinstateTeam.id) && !participants(f).includes(goldlink))!;
  const goldlinkGame = overlap.future.find(f => f.round_number === buckleGame.round_number && participants(f).includes(goldlink))!;
  const slot = overlap.future.find(f => f.round_number === buckleGame.round_number && f.kickoff_time === goldlinkGame.kickoff_time && f.id !== goldlinkGame.id)!;
  [buckleGame.kickoff_time, slot.kickoff_time] = [slot.kickoff_time, buckleGame.kickoff_time];
  [buckleGame.court, slot.court] = [slot.court, buckleGame.court];
  assert.throws(() => validate(overlap), /kickoff conflict|Goldlink\/Buckle/);
  const repeat = structuredClone(plan), first = repeat.fixed[0];
  const future = repeat.future.find(f => f.round_number > 3 && !participants(f).some(id => participants(first).includes(id)))!;
  future.home_team_id = first.home_team_id; future.away_team_id = first.away_team_id;
  assert.throws(() => validate(repeat));
  const closed = structuredClone(plan); closed.future.find(f => f.round_number > 3)!.match_date = '2026-12-28';
  assert.throws(() => validate(closed), /date/);
});

test('Monday fixture import reconstructs the complete reviewed future schedule without editing played games', () => {
  interface Change {
    operation: 'create' | 'update'; fixtureId?: string; expectedFixtureVersion?: number;
    proposed: { roundNumber: number; date: string; kickoffTime: string; court: number; homeTeamId: string; awayTeamId: string; publicationState: string };
  }
  const fixtureImport = JSON.parse(readFileSync('docs/drafts/monday-expansion-import-2026-10-25.json', 'utf8')) as {
    competition: { night: string; competitionSeasonId: string }; changes: Change[];
  };
  assert.equal(fixtureImport.competition.night, 'monday');
  assert.equal(fixtureImport.competition.competitionSeasonId, plan.edition);
  const assignment = (f: RevisedFixture) => [f.round_number, f.match_date, f.kickoff_time, f.court, f.home_team_id, f.away_team_id].join('|');
  const reconstructed = new Map<string, RevisedFixture>(previous.monday.future.map(f => [f.id, f]));
  const touched = new Set<string>();
  let creates = 0, updates = 0;
  for (const change of fixtureImport.changes) {
    const p = change.proposed;
    assert.equal(p.publicationState, 'published');
    assert.ok(p.roundNumber >= 3);
    const f = { id: '', competition_season_id: plan.edition, round_number: p.roundNumber, match_date: p.date,
      kickoff_time: `${p.kickoffTime}:00`, court: p.court, home_team_id: p.homeTeamId, away_team_id: p.awayTeamId };
    if (change.operation === 'create') {
      // Review IDs borrowed from cancelled rows are planning placeholders. The import
      // must create fresh identities rather than update or resurrect those rows.
      assert.equal(change.fixtureId, undefined);
      assert.equal(change.expectedFixtureVersion, undefined);
      reconstructed.set(`fresh-publication-uuid-${creates++}`, f);
    } else {
      assert.equal(change.operation, 'update');
      const original = previous.monday.future.find(row => row.id === change.fixtureId);
      assert.ok(original, 'updates must target retained unplayed fixtures');
      assert.ok(!touched.has(original.id), 'a fixture cannot be updated twice');
      touched.add(original.id);
      // Exact current versions are checked against the fresh read-only baseline;
      // this durable artefact predates publication of the withdrawal revision.
      assert.ok(Number.isInteger(change.expectedFixtureVersion) && change.expectedFixtureVersion! > 0);
      assert.notEqual(assignment(original), assignment(f), 'unchanged rows need no update');
      reconstructed.set(original.id, f);
      updates++;
    }
  }
  assert.equal(creates, 56);
  assert.equal(updates, 50);
  assert.equal(previous.monday.future.length - updates, 118);
  assert.equal(reconstructed.size, 224);
  assert.deepEqual([...reconstructed.values()].map(assignment).sort(), plan.future.map(assignment).sort());
});
