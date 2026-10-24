import { revisedPlayingDates, revisedKickoffIssues, type RevisedFixture } from './validate-roster-revision';
import { sharedPlayerClash } from './new-season-planning';

export interface MondayExpansion {
  edition: string;
  teams: { id: string; name: string; legacy_id: string; kit_colour?: string | null; status?: string; standings_eligible?: boolean }[];
  fixed: RevisedFixture[];
  future: RevisedFixture[];
  dates: string[];
}
export interface MondayExpansionConfig {
  competitionSeasonId: string;
  newTeam: { id: string; name: string; readableId: string; kitColour: string };
  reinstateTeam: { id: string; name: string; readableId: string };
  inheritance: { fromTeamId: string; toTeamId: string; fixtureIds: string[] }[];
}

/** Independently recheck the confirmed Monday expansion, without trusting the solver. */
export function validateMondayExpansion(plan: MondayExpansion, originalPlayed: RevisedFixture[], config: MondayExpansionConfig, originalRoundThree: RevisedFixture[]) {
  const fail = (message: string): never => { throw new Error(message); };
  const names = new Map(plan.teams.map(t => [t.id, t.name]));
  const incoming = plan.teams.find(t => t.id === config.newTeam.id);
  const buckle = plan.teams.find(t => t.id === config.reinstateTeam.id);
  if (plan.edition !== config.competitionSeasonId || plan.teams.length !== 16 || names.size !== 16 || new Set(plan.teams.map(t => t.name.toLowerCase())).size !== 16) fail('Expected 16 distinct Monday teams in the confirmed edition');
  if (!incoming || incoming.name !== 'Jaghori FC' || incoming.name !== config.newTeam.name || incoming.legacy_id !== config.newTeam.readableId || incoming.kit_colour !== config.newTeam.kitColour || !/^#[0-9a-f]{6}$/i.test(config.newTeam.kitColour)) fail('Incorrect Jaghori identity or kit');
  if (!buckle || buckle.name !== 'Buckle City' || buckle.name !== config.reinstateTeam.name || buckle.legacy_id !== config.reinstateTeam.readableId) fail('Incorrect Buckle reinstatement');
  if (plan.teams.some(t => t.status !== undefined && t.status !== 'active' || t.standings_eligible === false)) fail('Inactive or ineligible roster membership');
  if (config.inheritance.length !== 2 || new Set(config.inheritance.map(t => t.fromTeamId)).size !== 2 || new Set(config.inheritance.map(t => t.toTeamId)).size !== 2 || !config.inheritance.some(t => t.toTeamId === incoming!.id) || !config.inheritance.some(t => t.toTeamId === buckle!.id)) fail('Expected two distinct approved inheritance transfers');
  const inheritedIds = new Set<string>();
  for (const transfer of config.inheritance) {
    if (names.has(transfer.fromTeamId) || !names.has(transfer.toTeamId) || transfer.fixtureIds.length !== 2 || new Set(transfer.fixtureIds).size !== 2) fail('Invalid inheritance identity or result count');
    const source = originalPlayed.filter(f => [f.home_team_id, f.away_team_id].includes(transfer.fromTeamId));
    if (source.length !== 2 || source.some(f => !transfer.fixtureIds.includes(f.id))) fail('Inheritance must match both original played fixtures');
    for (const id of transfer.fixtureIds) { if (inheritedIds.has(id)) fail('Duplicate inherited fixture'); inheritedIds.add(id); }
  }
  const dates = revisedPlayingDates('monday');
  if (JSON.stringify(plan.dates) !== JSON.stringify(dates)) fail('Calendar changed');
  if (originalPlayed.length !== 16 || plan.fixed.length !== 16 || plan.future.length !== 224) fail('Wrong fixture totals');
  const fields = ['id', 'competition_season_id', 'round_number', 'match_date', 'kickoff_time', 'court', 'home_team_id', 'away_team_id'] as const;
  for (const original of originalPlayed) {
    const current = plan.fixed.find(f => f.id === original.id);
    if (!current) fail('Missing played fixture');
    for (const field of fields) {
      const transfer = config.inheritance.find(t => t.fixtureIds.includes(original.id) && t.fromTeamId === original[field]);
      const expected = (field === 'home_team_id' || field === 'away_team_id') && transfer ? transfer.toTeamId : original[field];
      if (current![field] !== expected) fail('Played fixture changed beyond approved inheritance');
    }
  }
  if (originalRoundThree.length !== 7) fail('Expected seven preserved Round 3 fixtures');
  for (const original of originalRoundThree) {
    const current = plan.future.find(f => f.id === original.id);
    if (!current || fields.some(field => current[field] !== original[field])) fail('Existing Round 3 fixture changed');
  }
  const all = [...plan.fixed, ...plan.future], ids = new Set<string>(), slots = new Set<string>();
  const pairs = new Map<string, RevisedFixture[]>();
  const soft: { round: number; teams: string[]; time: string; issues: string[] }[] = [];
  for (const f of all) {
    if (ids.has(f.id)) fail('Duplicate fixture identity'); ids.add(f.id);
    if (!Number.isInteger(f.round_number) || f.round_number < 1 || f.round_number > 30 || f.competition_season_id !== plan.edition || f.match_date !== dates[f.round_number - 1]) fail('Wrong edition, round or date');
    if (![1, 2].includes(f.court) || !['19:00:00', '19:40:00', '20:20:00', '21:00:00'].includes(f.kickoff_time)) fail('Invalid court or kickoff');
    const slot = `${f.match_date}|${f.kickoff_time}|${f.court}`;
    if (slots.has(slot)) fail('Court collision'); slots.add(slot);
    if (!names.has(f.home_team_id) || !names.has(f.away_team_id) || f.home_team_id === f.away_team_id) fail('Invalid fixture team');
    const key = [f.home_team_id, f.away_team_id].sort().join('|');
    pairs.set(key, [...(pairs.get(key) ?? []), f]);
  }
  const added = plan.future.filter(f => f.round_number === 3 && [f.home_team_id, f.away_team_id].includes(incoming!.id) && [f.home_team_id, f.away_team_id].includes(buckle!.id));
  if (added.length !== 1 || added[0].match_date !== '2026-10-26' || added[0].kickoff_time !== '21:00:00' || added[0].court !== 2) fail('Missing confirmed Jaghori-Buckle 21:00 Court 2 fixture');
  for (const f of plan.future) {
    if (f.round_number < 3) fail('Invalid future round');
    const ns = [names.get(f.home_team_id)!, names.get(f.away_team_id)!], time = f.kickoff_time.slice(0, 5);
    const issues = revisedKickoffIssues('monday', ns, time);
    if (issues.hard.length) fail('Hard kickoff conflict');
    if (issues.soft.length) soft.push({ round: f.round_number, teams: ns, time, issues: issues.soft });
  }
  for (let round = 1; round <= 30; round++) {
    const matches = all.filter(f => f.round_number === round);
    if (matches.length !== 8 || new Set(matches.flatMap(f => [f.home_team_id, f.away_team_id])).size !== 16) fail('Round must give each team one match');
    if (round < 3) continue;
    for (let i = 0; i < matches.length; i++) for (const other of matches.slice(i + 1)) {
      if (sharedPlayerClash([names.get(matches[i].home_team_id)!, names.get(matches[i].away_team_id)!], [names.get(other.home_team_id)!, names.get(other.away_team_id)!], matches[i].kickoff_time === other.kickoff_time)) fail('Goldlink/Buckle simultaneous kickoff');
    }
  }
  if (pairs.size !== 120) fail('Missing opponent pair');
  for (const games of pairs.values()) {
    games.sort((a, b) => a.round_number - b.round_number);
    if (games.length !== 2 || games[0].home_team_id === games[1].home_team_id) fail('Pair must meet twice with opposite home allocation');
    const approvedRoundThree = games[1].round_number === 3 && ["AFG|King ADL", "Blue Dragons|Imole United"].includes([names.get(games[0].home_team_id)!, names.get(games[0].away_team_id)!].sort().join('|'));
    if (games[1].round_number >= 3 && games[1].round_number - games[0].round_number < 4 && !approvedRoundThree) fail('Future rematch too close');
  }
  const totals = plan.teams.map(t => {
    const games = all.filter(f => [f.home_team_id, f.away_team_id].includes(t.id)).sort((a, b) => a.round_number - b.round_number);
    let last: boolean | undefined, run = 0, maximum = 0;
    for (const f of games) { const home = f.home_team_id === t.id; run = home === last ? run + 1 : 1; last = home; maximum = Math.max(maximum, run); }
    const home = games.filter(f => f.home_team_id === t.id).length;
    if (games.length !== 30 || home !== 15 || maximum > 3) fail('Team total, home/away balance or streak failed');
    return { name: t.name, matches: games.length, home, away: 30 - home, maximumStreak: maximum };
  });
  return { fixtures: all.length, futureFixtures: plan.future.length, inheritedFixtures: inheritedIds.size, endDate: dates.at(-1), totals, soft };
}
