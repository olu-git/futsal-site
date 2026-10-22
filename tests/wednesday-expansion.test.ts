import assert from 'node:assert/strict';
import test from 'node:test';
import plan from '../docs/drafts/wednesday-expansion-schedule-2026-10-22.json';
import previous from '../docs/drafts/roster-withdrawals-2026-10-22.json';
import { validateWednesdayExpansion, type WednesdayExpansion } from '../scripts/lib/validate-wednesday-expansion';

const etihad = '90f4484f-9735-4ba3-a9e9-f165381cf00b';
const validate = (value: WednesdayExpansion) => validateWednesdayExpansion(value, previous.wednesday.fixed, etihad);

test('reviewed Wednesday expansion gives 16 teams 30 games, balanced home/away and a valid calendar', () => {
  const report = validate(plan);
  assert.equal(report.fixtures, 240);
  assert.equal(report.futureFixtures, 224);
  assert.equal(report.endDate, '2027-05-26');
  assert.ok(report.totals.every(t => t.matches === 30 && t.home === 15 && t.away === 15 && t.maximumStreak <= 3));
});

test('Dream Team is early-only except for the two approved 21:00 Umoja meetings', () => {
  const dream = plan.teams.find(t => t.legacy_id === 'wed-dream-team')!.id;
  const umoja = plan.teams.find(t => t.legacy_id === 'wed-umoja-stars')!.id;
  const games = plan.future.filter(f => [f.home_team_id, f.away_team_id].includes(dream));
  const exceptions = games.filter(f => [f.home_team_id, f.away_team_id].includes(umoja));
  assert.equal(exceptions.length, 2);
  assert.ok(exceptions.every(f => f.kickoff_time === '21:00:00'));
  assert.ok(games.filter(f => !exceptions.includes(f)).every(f => ['19:00:00', '19:40:00'].includes(f.kickoff_time)));
  const wrong = structuredClone(plan);
  const game = wrong.future.find(f => [f.home_team_id, f.away_team_id].includes(dream) && ![f.home_team_id, f.away_team_id].includes(umoja))!;
  const late = wrong.future.find(f => f.round_number === game.round_number && f.kickoff_time === '20:20:00')!;
  [game.kickoff_time, late.kickoff_time] = [late.kickoff_time, game.kickoff_time];
  [game.court, late.court] = [late.court, game.court];
  assert.throws(() => validate(wrong), /kickoff conflict/);
});

test('played Rinnai-Xaywan meetings use up their two-game allowance', () => {
  const ids = plan.teams.filter(t => ['Rinnai', 'Xaywan'].includes(t.name)).map(t => t.id);
  const pair = (f: { home_team_id: string; away_team_id: string }) => ids.includes(f.home_team_id) && ids.includes(f.away_team_id);
  assert.equal(plan.fixed.filter(pair).length, 2);
  assert.equal(plan.future.filter(pair).length, 0);
});

test('validator rejects played-score assignment drift, a third meeting and forbidden dates', () => {
  const played = structuredClone(plan); played.fixed[0].court = 2;
  assert.throws(() => validate(played), /Played fixture changed/);
  const repeat = structuredClone(plan);
  repeat.future[0].home_team_id = repeat.fixed[0].home_team_id;
  repeat.future[0].away_team_id = repeat.fixed[0].away_team_id;
  assert.throws(() => validate(repeat));
  const closed = structuredClone(plan); closed.future[0].match_date = '2026-10-28';
  assert.throws(() => validate(closed), /date/);
});
