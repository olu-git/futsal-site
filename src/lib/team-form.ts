import type { Fixture } from "./types";

export type FormResult = "W" | "D" | "L" | "?";

/** Input is the shared published dataset: one selected edition per night/division.
 * Team IDs are edition-scoped; never join history by team name or legacy source data.
 */
export function calculateTeamForm(teamId: string, fixture: Fixture, history: Fixture[]): FormResult[] {
  const played = history.filter(match => match.status === "completed" &&
    match.night === fixture.night && match.division === fixture.division &&
    match.homeTeam && match.awayTeam && match.homeTeam !== match.awayTeam &&
    (match.homeTeam === teamId || match.awayTeam === teamId) &&
    Number.isInteger(match.homeScore) && Number.isInteger(match.awayScore) &&
    match.homeScore! >= 0 && match.awayScore! >= 0)
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time) || a.court - b.court || a.id.localeCompare(b.id))
    .slice(-5);
  const outcomes: FormResult[] = played.map(match => {
    const home = match.homeTeam === teamId;
    const scored = home ? match.homeScore! : match.awayScore!;
    const conceded = home ? match.awayScore! : match.homeScore!;
    return scored > conceded ? "W" : scored < conceded ? "L" : "D";
  });
  return [...Array<FormResult>(5 - outcomes.length).fill("?"), ...outcomes];
}
