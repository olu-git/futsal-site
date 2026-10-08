import type { DisplayFixture } from "@/lib/competition-service";
import { formatTime } from "@/lib/utils";
import FixtureTeam from "./FixtureTeam";

export default function FixtureList({ fixtures }: { fixtures: DisplayFixture[] }) {
  const divisions = [...new Set(fixtures.map((fixture) => fixture.division))].sort();
  return <div className="fixture-list">{divisions.map((division) => <div key={division}>
    {divisions.length > 1 && <h3 className="division-label">Division {division}</h3>}
    {fixtures.filter((fixture) => fixture.division === division).sort((a, b) => a.time.localeCompare(b.time) || a.court - b.court).map((fixture) => <article className="fixture-row" key={fixture.id}>
      <div className="fixture-meta"><time dateTime={`${fixture.date}T${fixture.time}`}>{formatTime(fixture.time)}</time><span>Court {fixture.court}</span></div>
      <span className="fixture-team home"><FixtureTeam side="home" name={fixture.home.name} colour={fixture.home.kitColour} form={fixture.status === "scheduled" ? fixture.homeForm ?? Array(5).fill("?") : undefined} /></span>
      <span className="fixture-outcome"><span className="fixture-score" aria-label={fixture.status === "completed" && fixture.homeScore !== undefined && fixture.awayScore !== undefined ? `Final score ${fixture.homeScore} to ${fixture.awayScore}` : "Scheduled fixture"}>{fixture.status === "completed" && fixture.homeScore !== undefined && fixture.awayScore !== undefined ? `${fixture.homeScore} - ${fixture.awayScore}` : "VS"}</span><span className="fixture-status">{fixture.status === "completed" ? "Final" : "Upcoming"}</span></span>
      <span className="fixture-team away"><FixtureTeam side="away" name={fixture.away.name} colour={fixture.away.kitColour} form={fixture.status === "scheduled" ? fixture.awayForm ?? Array(5).fill("?") : undefined} /></span>
      <span className="fixture-night">{fixture.night === "monday" ? "MON" : "WED"}</span>
      {fixture.note && <p className="fixture-note">{/forfeit/i.test(fixture.note) && <strong className="fixture-forfeit">Forfeit</strong>}{fixture.note}</p>}
    </article>)}
  </div>)}</div>;
}
