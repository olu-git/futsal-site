import test from 'node:test';
import assert from 'node:assert/strict';
import revision from '../docs/drafts/roster-revision-2026-10-15.json';
import { revisedKickoffIssues, validateRosterRevision, type RevisedNight } from '../scripts/lib/validate-roster-revision';
const monday = revision.monday as RevisedNight, wednesday = revision.wednesday as RevisedNight;
test('revised 16-team seasons retain two meetings per pair, 15/15 homes and maximum-three streaks', () => {
  for (const plan of [monday, wednesday]) {
    const result = validateRosterRevision(plan); assert.equal(result.fixtures, 240); assert.equal(result.maximumStreak, 3);
  }
  assert.equal(validateRosterRevision(monday).endDate, '2027-05-31');
  assert.equal(validateRosterRevision(wednesday).endDate, '2027-05-26');
});
test('Bunyip early-only rule is hard and superseded Xaywan exclusions are absent', () => {
  for (const time of ['20:20', '21:00']) assert.match(revisedKickoffIssues('monday', ['Bunyip'], time).hard.join(), /Bunyip/);
  for (const time of ['19:00', '19:40']) assert.equal(revisedKickoffIssues('monday', ['Bunyip'], time).hard.length, 0);
  for (const opponent of ['Bunyip', "Declan's Delinquents"]) {
    const ids = monday.teams.filter((t) => ['Xaywan', opponent].includes(t.name)).map((t) => t.id);
    assert.equal(monday.fixtures.filter((f) => ids.includes(f.home_team_id) && ids.includes(f.away_team_id)).length, 2);
  }
});
test('Pops late preference stays soft while Kuq/Umoja retain their specific hard-rule exception', () => {
  assert.deepEqual(revisedKickoffIssues('wednesday', ['Pops'], '21:00'), { hard: [], soft: ['Pops: prefer not to play at 21:00'] });
  assert.deepEqual(revisedKickoffIssues('wednesday', ['Pops'], '20:20'), { hard: [], soft: [] });
  assert.equal(revisedKickoffIssues('wednesday', ['Kuq E Zi', 'Umoja Stars'], '21:00').hard.length, 0);
  assert.equal(revisedKickoffIssues('wednesday', ['Kuq E Zi', 'Pops'], '21:00').hard.length, 1);
  assert.equal(revisedKickoffIssues('wednesday', ['Umoja Stars', 'Pops'], '20:20').hard.length, 1);
});
test('revision rejects collisions, wrong team counts, late Bunyip and broken opponent distribution', () => {
  const collision = structuredClone(monday); collision.fixtures[1] = { ...collision.fixtures[0] }; assert.throws(() => validateRosterRevision(collision), /collision|Duplicate/);
  const missing = structuredClone(monday); missing.teams.pop(); assert.throws(() => validateRosterRevision(missing), /16 distinct/);
  const late = structuredClone(monday), bunyip = late.teams.find((t) => t.name === 'Bunyip')!; late.fixtures.find((f) => f.home_team_id === bunyip.id || f.away_team_id === bunyip.id)!.kickoff_time = '20:20:00'; assert.throws(() => validateRosterRevision(late), /Bunyip/);
  const dates = structuredClone(monday); dates.fixtures[0].match_date = '2026-12-28'; assert.throws(() => validateRosterRevision(dates), /date/);
  const pair = structuredClone(wednesday); pair.fixtures[0].away_team_id = pair.fixtures[1].away_team_id; assert.throws(() => validateRosterRevision(pair), /match per team|meetings|opponent/);
});
