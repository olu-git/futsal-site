import { Fixture, Standing, CompetitionNight } from "./types";
import { fixtures, standingsAdjustments, teams } from "./data";

/**
 * Calculate league standings from completed fixture results.
 *
 * Points: Win = 3, Draw = 1, Loss = 0
 * Sorting: Points DESC → Goal Difference DESC → Goals For DESC → Team Name ASC
 */
export function calculateStandings(night: CompetitionNight, division: "A" | "B" = "A"): Standing[] {
  const nightTeams = teams.filter((t) => t.night === night && t.division === division);
  const completedFixtures = fixtures.filter(
    (f) => f.night === night && f.division === division && f.status === "completed"
  );
  const nightAdjustments = standingsAdjustments.filter(
    (a) => a.night === night && a.division === division
  );

  const standingsMap = new Map<string, Standing>();

  // Initialize all teams with zero stats
  for (const team of nightTeams) {
    standingsMap.set(team.id, {
      teamId: team.id,
      teamName: team.name,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
      position: 0,
    });
  }

  // Process each completed fixture
  for (const fixture of completedFixtures) {
    const home = standingsMap.get(fixture.homeTeam);
    const away = standingsMap.get(fixture.awayTeam);

    if (!home || !away || fixture.homeScore === undefined || fixture.awayScore === undefined) {
      continue;
    }

    const homeScore = fixture.homeScore;
    const awayScore = fixture.awayScore;

    // Update played
    home.played++;
    away.played++;

    // Update goals
    home.goalsFor += homeScore;
    home.goalsAgainst += awayScore;
    away.goalsFor += awayScore;
    away.goalsAgainst += homeScore;

    // Determine result and update W/D/L and points
    if (homeScore > awayScore) {
      home.won++;
      home.points += 3;
      away.lost++;
    } else if (homeScore < awayScore) {
      away.won++;
      away.points += 3;
      home.lost++;
    } else {
      home.drawn++;
      away.drawn++;
      home.points += 1;
      away.points += 1;
    }
  }

  for (const adjustment of nightAdjustments) {
    const standing = standingsMap.get(adjustment.teamId);

    if (!standing) continue;

    standing.played += adjustment.played;
    standing.won += adjustment.won;
    standing.drawn += adjustment.drawn;
    standing.lost += adjustment.lost;
    standing.goalsFor += adjustment.goalsFor;
    standing.goalsAgainst += adjustment.goalsAgainst;
    standing.points += adjustment.points;
  }

  // Calculate goal difference
  const standings = Array.from(standingsMap.values()).map((s) => ({
    ...s,
    goalDifference: s.goalsFor - s.goalsAgainst,
  }));

  // Sort: Points DESC → GD DESC → GF DESC → Name ASC
  standings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return a.teamName.localeCompare(b.teamName);
  });

  // Assign positions
  return standings.map((s, i) => ({ ...s, position: i + 1 }));
}
