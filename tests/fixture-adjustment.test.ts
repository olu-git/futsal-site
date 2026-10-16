import assert from 'node:assert/strict';
import test from 'node:test';
import proposal from '../docs/drafts/fixture-adjustment-2026-10-16.json';

test('fixture repair preserves pair counts, reciprocal home allocation and round participation', () => {
  const pairDelta = new Map<string, number>(), homeDelta = new Map<string, number>(), roundDelta = new Map<string, number>();
  const add = (map: Map<string,number>, key: string, value: number) => map.set(key,(map.get(key)??0)+value);
  for (const change of proposal.changes) {
    assert(change.round_number > 1, 'completed Round 1 must remain fixed');
    for (const [side, sign] of [[change.before,-1],[change.after,1]] as const) {
      add(pairDelta,[side.home_team_id,side.away_team_id].sort().join('|'),sign);
      add(homeDelta,side.home_team_id,sign);
      for(const id of [side.home_team_id,side.away_team_id]) add(roundDelta,`${change.competition_season_id}|${change.round_number}|${id}`,sign);
    }
  }
  for(const map of [pairDelta,homeDelta,roundDelta]) assert([...map.values()].every(value=>value===0));
  assert.equal(new Set(proposal.changes.map(change=>change.id)).size,proposal.changes.length);
});

test('requested upcoming pairings and Wednesday kickoff swap are explicit', () => {
  const round = proposal.changes.filter(change=>change.round_number===2);
  for(const [home,away,time,court] of [
    ['mon-bunyip','mon-salvos','19:00:00',1],
    ['mon-xaywan','mon-black-magic','19:00:00',2],
    ['wed-kuq-e-zi','wed-buckle-city','19:40:00',1],
    ['wed-king-adl','wed-pops','19:00:00',1],
  ] as const) assert(round.some(({after})=>after.homeTeam===home&&after.awayTeam===away&&after.kickoff_time===time&&after.court===court));
});
import original from '../docs/drafts/roster-revision-2026-10-15.json';
import mondayUpload from '../docs/drafts/monday-fixture-adjustment-2026-10-16.json';
import wednesdayUpload from '../docs/drafts/wednesday-fixture-adjustment-2026-10-16.json';
import { parseFixtureChangeUpload } from '../src/lib/admin/fixture-changes';
import { validateRosterRevision, type RevisedNight } from '../scripts/lib/validate-roster-revision';

test('complete repaired seasons satisfy calendar, kickoff, spacing and streak constraints', () => {
  for(const night of ['monday','wednesday'] as const) {
    const plan=structuredClone(original[night]) as RevisedNight;
    const completed=JSON.stringify(plan.fixtures.filter(f=>f.round_number===1));
    for(const change of proposal.changes.filter(c=>c.competition_season_id===plan.edition)) {
      const fixture=plan.fixtures.find(f=>f.id===change.id)!;
      assert(fixture);
      for(const key of ['home_team_id','away_team_id','kickoff_time','court'] as const) assert.equal(fixture[key],change.before[key]);
      Object.assign(fixture,{home_team_id:change.after.home_team_id,away_team_id:change.after.away_team_id,kickoff_time:change.after.kickoff_time,court:change.after.court});
    }
    const report=validateRosterRevision(plan);
    assert.equal(report.fixtures,240);assert.equal(report.maximumStreak,3);
    assert.equal(JSON.stringify(plan.fixtures.filter(f=>f.round_number===1)),completed);
  }
});

test('both proposals use the supported versioned admin upload format', () => {
  for(const upload of [mondayUpload,wednesdayUpload]) {
    const parsed=parseFixtureChangeUpload(upload);
    assert.equal(parsed.competition.season,'2026 - Season 2');
    const changes=proposal.changes.filter(c=>c.competition_season_id===parsed.competition.competitionSeasonId);
    assert.equal(parsed.changes.length,changes.length);
    for(const change of parsed.changes) {
      const expected=changes.find(c=>c.id===change.fixtureId)!;
      assert.equal(change.expectedFixtureVersion,expected.schedule_version);
      assert.equal(change.proposed?.homeTeamId,expected.after.home_team_id);
      assert.equal(change.proposed?.awayTeamId,expected.after.away_team_id);
      assert.equal(change.proposed?.kickoffTime,expected.after.kickoff_time.slice(0,5));
      assert.equal(change.proposed?.court,expected.after.court);
    }
  }
});
