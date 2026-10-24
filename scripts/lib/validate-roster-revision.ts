import calendar from '../../docs/drafts/new-season-calendar.json';
import { kickoffIssues } from './new-season-planning';

export interface RevisedFixture { id: string; competition_season_id: string; round_number: number; match_date: string; kickoff_time: string; court: number; home_team_id: string; away_team_id: string }

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
