import assert from 'node:assert/strict';
import test from 'node:test';
import revision from '../docs/drafts/roster-withdrawals-2026-10-22.json';
import { validateWithdrawalRevision, type WithdrawalPlan } from '../scripts/lib/validate-withdrawal-revision';

test('withdrawal revision retains played games and gives all 28 remaining teams 26 matches',()=>{
  for (const plan of [revision.monday,revision.wednesday]) {
    const report=validateWithdrawalRevision(plan as WithdrawalPlan);
    assert.equal(report.totals.length,14);
    assert(report.totals.every(t=>t.matches===26 && t.maximumStreak<=3));
  }
  assert.equal(revision.monday.endDate,'2027-05-03');
  assert.equal(revision.wednesday.endDate,'2027-04-28');
});

test('approved Bunyip reductions and redistributed third meetings are explicit',()=>{
  const counts=revision.monday.counts.filter(p=>[p.home,p.away].includes('Bunyip'));
  const count=(name:string)=>counts.find(p=>[p.home,p.away].includes(name))!.total;
  assert.equal(count('AFG'),1);assert.equal(count('Kroos Kontrol'),1);assert.equal(count('Nasaji FC'),2);assert.equal(count('Xaywan'),3);
  assert.equal(revision.monday.counts.filter(p=>p.total===3).length,2);
});

test('independent revision validation rejects hard kickoff, pairing and cancellation regressions',()=>{
  const plan=structuredClone(revision.monday) as WithdrawalPlan;
  const game=plan.future.find(f=>[f.home_team_id,f.away_team_id].includes(plan.teams.find(t=>t.name==='Bunyip')!.id))!;
  game.kickoff_time='21:00:00';game.court=9;
  assert.throws(()=>validateWithdrawalRevision(plan),/court|availability/);
  const wrong=structuredClone(revision.wednesday) as WithdrawalPlan;
  wrong.counts[0].total=3;assert.throws(()=>validateWithdrawalRevision(wrong),/opponent/);
  const cancelled=structuredClone(revision.monday) as WithdrawalPlan;
  cancelled.cancelled[0]=cancelled.fixed[0];assert.throws(()=>validateWithdrawalRevision(cancelled),/Cancellation/);
});
