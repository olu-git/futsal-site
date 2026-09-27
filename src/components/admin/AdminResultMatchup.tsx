import TeamKit from "@/components/TeamKit";
import type { AdminFixture } from "@/lib/admin/results-data";

export default function AdminResultMatchup({ fixture, homeScore, awayScore, prominent = false, showScores = true }: {
  fixture: AdminFixture;
  homeScore?: number | null;
  awayScore?: number | null;
  prominent?: boolean;
  showScores?: boolean;
}) {
  return <span className={`admin-matchup${prominent ? " admin-matchup-prominent" : ""}${showScores ? "" : " admin-matchup-no-scores"}`}>
    <span className="admin-matchup-side">
      <span className="admin-matchup-label">Home</span>
      <span className="admin-matchup-team"><TeamKit colour={fixture.home.kitColour ?? undefined} /><span className="admin-matchup-name">{fixture.home.name}</span></span>
      {showScores && <strong className="admin-matchup-score" aria-label={homeScore == null ? "No home score" : `${homeScore} home goals`}>{homeScore ?? "-"}</strong>}
    </span>
    <span className="admin-matchup-side">
      <span className="admin-matchup-label">Away</span>
      <span className="admin-matchup-team"><TeamKit colour={fixture.away.kitColour ?? undefined} /><span className="admin-matchup-name">{fixture.away.name}</span></span>
      {showScores && <strong className="admin-matchup-score" aria-label={awayScore == null ? "No away score" : `${awayScore} away goals`}>{awayScore ?? "-"}</strong>}
    </span>
  </span>;
}
