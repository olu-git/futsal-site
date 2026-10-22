import { revisedPlayingDates, revisedKickoffIssues, type RevisedFixture } from './validate-roster-revision';
import { sharedPlayerClash } from './new-season-planning';

export interface WednesdayExpansion {
  edition: string;
  teams: { id: string; name: string; legacy_id: string }[];
  fixed: RevisedFixture[];
  future: RevisedFixture[];
  dates: string[];
}

/** Validate the conditional review artefact, independently of the scheduling solver. */
export function validateWednesdayExpansion(plan: WednesdayExpansion, originalPlayed: RevisedFixture[], etihadId: string) {
  const fail = (message: string): never => { throw new Error(message); };
  const names = new Map(plan.teams.map(t => [t.id, t.name]));
  const dream = plan.teams.find(t => t.legacy_id === 'wed-dream-team');
  if (!dream || plan.teams.length !== 16 || names.size !== 16 || new Set(names.values()).size !== 16) fail('Expected 16 distinct teams including Dream Team');
  if (!plan.teams.some(t => t.legacy_id === 'wed-buckle-city') || names.has(etihadId)) fail('Incorrect reinstatement or replacement');
  const dates = revisedPlayingDates('wednesday');
  if (JSON.stringify(plan.dates) !== JSON.stringify(dates)) fail('Calendar changed');
  if (plan.fixed.length !== 16 || originalPlayed.length !== 16 || plan.future.length !== 224) fail('Wrong fixture totals');
  for (const original of originalPlayed) {
    const current = plan.fixed.find(f => f.id === original.id);
    if (!current) fail('Missing played fixture');
    for (const field of ['id', 'competition_season_id', 'round_number', 'match_date', 'kickoff_time', 'court', 'home_team_id', 'away_team_id'] as const) {
      const expected = (field === 'home_team_id' || field === 'away_team_id') && original[field] === etihadId ? dream!.id : original[field];
      if (current![field] !== expected) fail('Played fixture changed beyond proposed inheritance');
    }
  }
  const all = [...plan.fixed, ...plan.future], ids = new Set<string>(), slots = new Set<string>();
  const pairs = new Map<string, RevisedFixture[]>();
  const soft: { round: number; teams: string[]; time: string; issues: string[] }[] = [];
  for (const f of all) {
    if (ids.has(f.id)) fail('Duplicate fixture identity'); ids.add(f.id);
    if (f.competition_season_id !== plan.edition || f.match_date !== dates[f.round_number - 1]) fail('Wrong edition or date');
    if (![1, 2].includes(f.court) || !['19:00:00', '19:40:00', '20:20:00', '21:00:00'].includes(f.kickoff_time)) fail('Invalid court or kickoff');
    const slot = `${f.match_date}|${f.kickoff_time}|${f.court}`;
    if (slots.has(slot)) fail('Court collision'); slots.add(slot);
    if (!names.has(f.home_team_id) || !names.has(f.away_team_id) || f.home_team_id === f.away_team_id) fail('Invalid fixture team');
    const key = [f.home_team_id, f.away_team_id].sort().join('|');
    pairs.set(key, [...(pairs.get(key) ?? []), f]);
  }
  for (const f of plan.future) {
    if (f.round_number < 3 || f.round_number > 30) fail('Invalid future round');
    const ns = [names.get(f.home_team_id)!, names.get(f.away_team_id)!], time = f.kickoff_time.slice(0, 5);
    const issues = revisedKickoffIssues('wednesday', ns, time);
    if (issues.hard.length) fail('Hard kickoff conflict');
    if (issues.soft.length) soft.push({ round: f.round_number, teams: ns, time, issues: issues.soft });
  }
  for (let r = 1; r <= 30; r++) {
    const matches = all.filter(f => f.round_number === r);
    if (matches.length !== 8 || new Set(matches.flatMap(f => [f.home_team_id, f.away_team_id])).size !== 16) fail('Round must give each team one match');
    if (r < 3) continue; // Historical games are fixed, including inherited records.
    for (let i = 0; i < matches.length; i++) for (const other of matches.slice(i + 1)) {
      if (sharedPlayerClash([names.get(matches[i].home_team_id)!, names.get(matches[i].away_team_id)!], [names.get(other.home_team_id)!, names.get(other.away_team_id)!], matches[i].kickoff_time === other.kickoff_time)) fail('Goldlink/Buckle simultaneous kickoff');
    }
  }
  if (pairs.size !== 120) fail('Missing opponent pair');
  for (const games of pairs.values()) {
    games.sort((a, b) => a.round_number - b.round_number);
    if (games.length !== 2 || games[0].home_team_id === games[1].home_team_id) fail('Pair must meet twice with opposite home allocation');
    if (games[1].round_number >= 3 && games[1].round_number - games[0].round_number < 4) fail('Future rematch too close');
  }
  const totals = plan.teams.map(t => {
    const games = all.filter(f => [f.home_team_id, f.away_team_id].includes(t.id)).sort((a, b) => a.round_number - b.round_number);
    let last: boolean | undefined, run = 0, maximum = 0;
    for (const f of games) { const home = f.home_team_id === t.id; run = home === last ? run + 1 : 1; last = home; maximum = Math.max(maximum, run); }
    const home = games.filter(f => f.home_team_id === t.id).length;
    if (games.length !== 30 || home !== 15 || maximum > 3) fail('Team total, home/away balance or streak failed');
    return { name: t.name, matches: games.length, home, away: 30 - home, maximumStreak: maximum };
  });
  return { fixtures: all.length, futureFixtures: plan.future.length, endDate: dates.at(-1), totals, soft };
}
