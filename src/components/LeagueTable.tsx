import type { Standing, Team } from "@/lib/types";
import TeamKit from "./TeamKit";

export default function LeagueTable({ standings, teams = [], compact = false, label = "League standings" }: {
  standings: Standing[]; teams?: Team[]; compact?: boolean; label?: string;
}) {
  const rows = compact ? standings.slice(0, 5) : standings;
  const colours = new Map(teams.map((team) => [team.id, team.kitColour]));
  const columns = compact ? ["P", "GD", "PTS"] : ["P", "W", "D", "L", "GF", "GA", "GD", "PTS"];
  return <div className="table-scroll" tabIndex={0} role="region" aria-label={label}>
    <table className={`league-table ${compact ? "compact" : ""}`}>
      <caption className="sr-only">{label}</caption>
      <thead><tr><th scope="col">POS</th><th scope="col">TEAM</th>{columns.map((column) => <th className="number" scope="col" key={column}>{column}</th>)}</tr></thead>
      <tbody>{rows.map((row) => <tr key={row.teamId}>
        <td>{row.position}</td>
        <th scope="row"><span className="table-team"><TeamKit colour={colours.get(row.teamId)} />{row.teamName}</span></th>
        <td className="number">{row.played}</td>
        {!compact && <><td className="number">{row.won}</td><td className="number">{row.drawn}</td><td className="number">{row.lost}</td><td className="number">{row.goalsFor}</td><td className="number">{row.goalsAgainst}</td></>}
        <td className="number">{row.goalDifference > 0 ? "+" : ""}{row.goalDifference}</td><td className="number points">{row.points}</td>
      </tr>)}</tbody>
    </table>
  </div>;
}
