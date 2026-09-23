import type { DisplayFixture } from "@/lib/competition-service";
import { formatTime } from "@/lib/utils";
import TeamKit from "./TeamKit";

export default function FixtureList({ fixtures }: { fixtures: DisplayFixture[] }) {
  const divisions = [...new Set(fixtures.map((fixture) => fixture.division))].sort();
  return <div className="fixture-list">{divisions.map((division) => <div key={division}>
    {divisions.length > 1 && <h3 className="division-label">Division {division}</h3>}
    {fixtures.filter((fixture) => fixture.division === division).map((fixture) => <article className="fixture-row" key={fixture.id}>
      <div className="fixture-meta"><time dateTime={`${fixture.date}T${fixture.time}`}>{formatTime(fixture.time)}</time><span>Court {fixture.court}</span></div>
      <span className="fixture-team home"><TeamKit colour={fixture.home.kitColour} /><span>{fixture.home.name}</span></span>
      <span className="fixture-score">{fixture.status === "completed" ? `${fixture.homeScore} - ${fixture.awayScore}` : "VS"}</span>
      <span className="fixture-team away"><span>{fixture.away.name}</span><TeamKit colour={fixture.away.kitColour} /></span>
      <span className="fixture-night">{fixture.night === "monday" ? "MON" : "WED"}</span>
      {fixture.note && <p className="fixture-note">{fixture.note}</p>}
    </article>)}
  </div>)}</div>;
}
