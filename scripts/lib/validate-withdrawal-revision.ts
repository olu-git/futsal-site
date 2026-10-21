import { revisedPlayingDates, revisedKickoffIssues, type RevisedFixture } from './validate-roster-revision';

export interface WithdrawalPlan {
  night: 'monday' | 'wednesday'; edition: string;
  teams: { id: string; name: string }[];
  fixed: RevisedFixture[]; future: RevisedFixture[]; cancelled: RevisedFixture[];
  counts: { home: string; away: string; total: number }[];
  startDate: string; endDate: string;
}

/** Recheck the review artefact independently of the temporary scheduling solver. */
export function validateWithdrawalRevision(plan: WithdrawalPlan) {
  const fail = (message: string): never => { throw new Error(message); };
  const ids = new Set(plan.teams.map(t => t.id));
  const names = new Map(plan.teams.map(t => [t.id, t.name]));
  const pair = (a: string, b: string) => [a,b].sort().join('|');
  const dates = revisedPlayingDates(plan.night).slice(0,26);
  if (ids.size !== 14 || plan.teams.length !== 14 || plan.fixed.length !== 16 || plan.future.length !== 168 || plan.cancelled.length !== 56) fail('Wrong roster or fixture count');
  if (plan.startDate !== dates[0] || plan.endDate !== dates.at(-1)) fail('Wrong calendar limits');
  const slots = new Set<string>(), fixtureIds = new Set<string>(), meetings = new Map<string, RevisedFixture[]>();
  for (const f of [...plan.fixed,...plan.future]) {
    if (fixtureIds.has(f.id)) fail('Duplicate fixture identity'); fixtureIds.add(f.id);
    const slot = `${f.match_date}|${f.kickoff_time}|${f.court}`;
    if (slots.has(slot)) fail('Court/time collision'); slots.add(slot);
    if (f.competition_season_id !== plan.edition || f.match_date !== dates[f.round_number-1]) fail('Wrong edition or round date');
    if (f.home_team_id === f.away_team_id) fail('Self pairing');
    if (ids.has(f.home_team_id) && ids.has(f.away_team_id)) {
      const key = pair(names.get(f.home_team_id)!,names.get(f.away_team_id)!);
      meetings.set(key,[...(meetings.get(key)??[]),f]);
    }
  }
  for (const f of plan.future) {
    if (!ids.has(f.home_team_id) || !ids.has(f.away_team_id) || f.round_number < 3 || f.round_number > 26) fail('Withdrawn team or invalid future round');
    if (![1,2].includes(f.court) || !['19:00:00','19:40:00','20:20:00','21:00:00'].includes(f.kickoff_time)) fail('Invalid court or kickoff');
    if (revisedKickoffIssues(plan.night,[names.get(f.home_team_id)!,names.get(f.away_team_id)!],f.kickoff_time.slice(0,5)).hard.length) fail('Hard availability conflict');
  }
  for (let r=1;r<=26;r++) {
    const fixtures = [...plan.fixed,...plan.future].filter(f=>f.round_number===r);
    const participants = fixtures.flatMap(f=>[f.home_team_id,f.away_team_id]).filter(id=>ids.has(id));
    if (participants.length !== 14 || new Set(participants).size !== 14 || (r>=3 && fixtures.length!==7)) fail('Round does not give each remaining team one match');
  }
  if (plan.counts.length!==91 || meetings.size!==91) fail('Missing opponent pair');
  for (const target of plan.counts) {
    const games=(meetings.get(pair(target.home,target.away))??[]).sort((a,b)=>a.round_number-b.round_number);
    if (target.total<1 || target.total>3 || games.length!==target.total) fail('Wrong opponent total');
    for (let i=1;i<games.length;i++) {
      const previous=games[i-1],current=games[i];
      const requested = plan.night==='monday' && current.round_number===3 && [pair('King ADL','AFG'),pair('Imole United','Blue Dragons')].includes(pair(target.home,target.away));
      if (current.round_number>=3 && current.round_number-previous.round_number<4 && !requested) fail('Unapproved close rematch');
    }
  }
  const totals=plan.teams.map(t=>{
    const games=[...plan.fixed,...plan.future].filter(f=>[f.home_team_id,f.away_team_id].includes(t.id)).sort((a,b)=>a.round_number-b.round_number);
    let run=0,maximum=0,last:boolean|undefined;
    for (const f of games) { const home=f.home_team_id===t.id;run=home===last?run+1:1;last=home;maximum=Math.max(maximum,run); }
    const home=games.filter(f=>f.home_team_id===t.id).length;
    if (games.length!==26 || maximum>3 || Math.abs(home-13)>1 || (plan.night==='wednesday' && home!==13)) fail('Wrong team total or home/away balance');
    return {name:t.name,matches:games.length,home,away:26-home,maximumStreak:maximum};
  });
  if (plan.night==='monday' && totals.filter(t=>t.home!==13).length!==1) fail('Unnecessary home/away imbalance');
  const futureIds=new Set(plan.future.map(f=>f.id));
  if (new Set(plan.cancelled.map(f=>f.id)).size!==56 || plan.cancelled.some(f=>futureIds.has(f.id)||f.round_number<3)) fail('Cancellation includes retained or played fixture');
  return {totals,endDate:plan.endDate,retainedFixtures:184,futureFixtures:168};
}
