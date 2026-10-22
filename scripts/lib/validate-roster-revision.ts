import calendar from '../../docs/drafts/new-season-calendar.json';
import { kickoffIssues, sharedPlayerClash } from './new-season-planning';

export interface RevisedTeam { id: string; name: string; legacy_id: string; competition_season_id: string; status: string; standings_eligible: boolean }
export interface RevisedFixture { id: string; competition_season_id: string; round_number: number; match_date: string; kickoff_time: string; court: number; home_team_id: string; away_team_id: string }
export interface RevisedNight { night: 'monday' | 'wednesday'; edition: string; teams: RevisedTeam[]; fixtures: RevisedFixture[]; startDate: string; endDate: string }

export function revisedPlayingDates(night: 'monday' | 'wednesday'): string[] {
  const result: string[] = [], day = new Date(`${calendar.starts[night]}T00:00:00Z`);
  while (result.length < 30) {
    const value = day.toISOString().slice(0, 10);
    if (!calendar.blockedDates.some((blocked) => blocked.date === value) && !(value > calendar.lastPreBreakNight && value < calendar.firstPostBreakNight)) result.push(value);
    day.setUTCDate(day.getUTCDate() + 7);
  }
  return result;
}

/** October 15 rules are separate from the preserved original 14-team draft. */
export function revisedKickoffIssues(night: 'monday' | 'wednesday', names: string[], time: string) {
  const issues = kickoffIssues(night, names, time);
  if (night === 'monday' && names.includes('Bunyip') && !['19:00', '19:40'].includes(time)) issues.hard.push('Bunyip: 19:00 or 19:40 only');
  if (night === 'wednesday' && names.includes('Dream Team') && !['19:00', '19:40'].includes(time) && !(names.includes('Umoja Stars') && time === '21:00')) issues.hard.push('Dream Team: 19:00 or 19:40 except 21:00 against Umoja Stars');
  if (night === 'wednesday' && names.includes('Pops') && time === '21:00') issues.soft.push('Pops: prefer not to play at 21:00');
  return issues;
}

export function validateRosterRevision(plan: RevisedNight) {
  const errors: string[] = [], dates = revisedPlayingDates(plan.night), ids = new Set(plan.teams.map((t) => t.id));
  const names = new Map(plan.teams.map((t) => [t.id, t.name]));
  const slots = new Set<string>(), fixtureIds = new Set<string>(), pairings = new Map<string, RevisedFixture[]>();
  const totals = Object.fromEntries(plan.teams.map((t) => [t.id, { name: t.name, played: 0, home: 0, away: 0 }]));
  const soft: { round: number; date: string; teams: string[]; time: string; issue: string }[] = [];
  if (plan.teams.length !== 16 || ids.size !== 16 || new Set(plan.teams.map((t) => t.name.toLowerCase())).size !== 16) errors.push('Expected 16 distinct team identities.');
  if (plan.fixtures.length !== 240) errors.push('Expected 240 fixtures.');
  if (plan.startDate !== dates[0] || plan.endDate !== dates.at(-1)) errors.push('Wrong season dates.');
  for (const team of plan.teams) if (team.competition_season_id !== plan.edition || team.status !== 'active' || !team.standings_eligible) errors.push('Invalid active membership.');
  for (const f of plan.fixtures) {
    if (fixtureIds.has(f.id)) errors.push('Duplicate fixture identity.'); fixtureIds.add(f.id);
    if (!ids.has(f.home_team_id) || !ids.has(f.away_team_id) || f.home_team_id === f.away_team_id) { errors.push('Invalid fixture team.'); continue; }
    if (!Number.isInteger(f.round_number) || f.round_number < 1 || f.round_number > 30 || f.match_date !== dates[f.round_number - 1]) errors.push('Wrong round/date.');
    if (f.competition_season_id !== plan.edition || ![1, 2].includes(f.court) || !['19:00:00', '19:40:00', '20:20:00', '21:00:00'].includes(f.kickoff_time)) errors.push('Invalid edition/court/time.');
    const slot = `${f.match_date}|${f.kickoff_time}|${f.court}`;
    if (slots.has(slot)) errors.push('Court/time collision.'); slots.add(slot);
    const teamNames = [names.get(f.home_team_id)!, names.get(f.away_team_id)!];
    const issues = revisedKickoffIssues(plan.night, teamNames, f.kickoff_time.slice(0, 5)); errors.push(...issues.hard);
    for (const issue of issues.soft) soft.push({ round: f.round_number, date: f.match_date, teams: teamNames, time: f.kickoff_time, issue });
    const key = [f.home_team_id, f.away_team_id].sort().join('|'); pairings.set(key, [...(pairings.get(key) ?? []), f]);
    totals[f.home_team_id].played++; totals[f.home_team_id].home++; totals[f.away_team_id].played++; totals[f.away_team_id].away++;
  }
  for (let r = 1; r <= 30; r++) {
    const matches = plan.fixtures.filter((f) => f.round_number === r), players = matches.flatMap((f) => [f.home_team_id, f.away_team_id]);
    if (matches.length !== 8 || players.length !== 16 || new Set(players).size !== 16) errors.push(`Round ${r}: not one match per team.`);
    for (let i = 0; i < matches.length; i++) for (const other of matches.slice(i + 1)) if (sharedPlayerClash([names.get(matches[i].home_team_id)!, names.get(matches[i].away_team_id)!], [names.get(other.home_team_id)!, names.get(other.away_team_id)!], matches[i].kickoff_time === other.kickoff_time)) errors.push('Goldlink/Buckle simultaneous kickoff.');
  }
  if (pairings.size !== 120) errors.push('Missing opponent pair.');
  for (const matches of pairings.values()) {
    const sorted = [...matches].sort((a, b) => a.round_number - b.round_number);
    if (sorted.length !== 2 || sorted[0].home_team_id === sorted[1]?.home_team_id) errors.push('Expected two meetings with opposite home allocation.');
    if (sorted.length === 2 && (sorted[0].round_number > 15 || sorted[1].round_number <= 15 || sorted[1].round_number - sorted[0].round_number < 4)) errors.push('Repeat spacing/half-season distribution.');
  }
  let maximumStreak = 0;
  for (const team of plan.teams) {
    const total = totals[team.id]; if (total.played !== 30 || total.home !== 15 || total.away !== 15) errors.push('Unequal team totals.');
    const sides = plan.fixtures.filter((f) => f.home_team_id === team.id || f.away_team_id === team.id).sort((a,b) => a.round_number - b.round_number).map((f) => f.home_team_id === team.id);
    let run = 0, last: boolean | undefined;
    for (const side of sides) { run = side === last ? run + 1 : 1; last = side; maximumStreak = Math.max(maximumStreak, run); }
  }
  if (maximumStreak > 3) errors.push('Home/away streak exceeds three.');
  if (errors.length) throw new Error([...new Set(errors)].join('\n'));
  return { night: plan.night, teams: plan.teams.length, fixtures: plan.fixtures.length, rounds: 30, startDate: dates[0], endDate: dates.at(-1), maximumStreak, totals, soft };
}
