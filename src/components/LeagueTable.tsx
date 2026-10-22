import type { Standing, Team } from "@/lib/types";
import TeamKit from "./TeamKit";
import TeamForm from "./TeamForm";
import type { FormResult } from "@/lib/team-form";

export default function LeagueTable({ standings, teams = [], formByTeam = {}, compact = false, label = "League standings" }: {
  standings: Standing[]; teams?: Team[]; formByTeam?: Record<string, FormResult[]>; compact?: boolean; label?: string;
}) {
  const rows = compact ? standings.slice(0, 5) : standings;
  const colours = new Map(teams.map((team) => [team.id, team.kitColour]));
  const columns = compact ? ["P", "GD", "PTS"] : ["P", "W", "D", "L", "GF", "GA", "GD", "PTS"];
  return <div className="table-scroll" tabIndex={0} role="region" aria-label={label}>
    <table className={`league-table ${compact ? "compact" : ""}`}>
      <caption className="sr-only">{label}</caption>
      <colgroup><col className="table-position-column" /><col className="table-name-column" />{columns.map(column => <col className="table-stat-column" key={column} />)}<col className="table-form-column" /></colgroup>
      <thead><tr><th scope="col">POS</th><th scope="col">TEAM</th>{columns.map((column) => <th className="number" scope="col" key={column}>{column}</th>)}<th scope="col">FORM</th></tr></thead>
      <tbody>{rows.map((row) => <tr key={row.teamId}>
        <td>{row.position}</td>
        <th scope="row"><span className="table-team"><TeamKit colour={colours.get(row.teamId)} /><span className="table-team-name">{row.teamName}</span></span></th>
        <td className="number">{row.played}</td>
        {!compact && <><td className="number">{row.won}</td><td className="number">{row.drawn}</td><td className="number">{row.lost}</td><td className="number">{row.goalsFor}</td><td className="number">{row.goalsAgainst}</td></>}
        <td className="number">{row.goalDifference > 0 ? "+" : ""}{row.goalDifference}</td><td className="number points">{row.points}</td>
        <td><TeamForm name={row.teamName} form={formByTeam[row.teamId] ?? ["?", "?", "?", "?", "?"]} table /></td>
      </tr>)}</tbody>
    </table>
  </div>;
}
