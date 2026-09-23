import { competitionService } from "@/lib/competition-service";
import type { CompetitionNight } from "@/lib/types";
import { formatDate, nightLabel } from "@/lib/utils";
import CompetitionHero from "./CompetitionHero";
import LeagueTable from "./LeagueTable";
import RoundAccordion from "./RoundAccordion";
import FixtureList from "./FixtureList";

export default async function CompetitionPage({ night }: { night: CompetitionNight }) {
  const competition = await competitionService.getNight(night);
  return <>
    <CompetitionHero nightName={nightLabel(night)} teamCount={competition.teams.length} />
    <section className="fis-section fis-container" id="standings">
      <h2 className="section-title">Standings</h2>
      {competition.divisions.map(({ division, standings, teams }) => <div className="division-table" key={division}>
        {competition.divisions.length > 1 && <h3 className="division-label">Division {division}</h3>}
        <LeagueTable standings={standings} teams={teams} label={`${nightLabel(night)} Division ${division} standings`} />
      </div>)}
    </section>
    <section className="fis-section fis-container" id="results">
      <h2 className="section-title">Results</h2>
      <div className="rounds">{competition.results.length ? competition.results.map((round, index) => <RoundAccordion key={`${round.round}-${round.date}`} round={round.round} date={formatDate(round.date)} count={round.fixtures.length} defaultOpen={index === 0}>
        <FixtureList fixtures={round.fixtures} />
      </RoundAccordion>) : <p className="empty-state">No results have been recorded yet.</p>}</div>
    </section>
    <section className="fis-section fis-container" id="fixtures">
      <h2 className="section-title">Fixtures</h2>
      <div className="rounds">{competition.upcoming.length ? competition.upcoming.map((round, index) => <RoundAccordion key={`${round.round}-${round.date}`} round={round.round} date={formatDate(round.date)} count={round.fixtures.length} defaultOpen={index === 0}>
        <FixtureList fixtures={round.fixtures} />
      </RoundAccordion>) : <p className="empty-state">No upcoming regular-season fixtures are scheduled.</p>}</div>
    </section>
  </>;
}
