"use client";

import type { CompetitionNight } from "@/lib/types";
import { useState, useSyncExternalStore } from "react";
import { usePublicCompetition, SnapshotNotice, type PublicCompetitionViews } from "@/lib/use-public-competition";
import { formatDate, nightLabel } from "@/lib/utils";
import NoGamesNotice from "./NoGamesNotice";
import { activeNoticeFor, melbourneToday } from "@/lib/site-notices";
import CompetitionHero from "./CompetitionHero";
import LeagueTable from "./LeagueTable";
import RoundAccordion from "./RoundAccordion";
import FixtureList from "./FixtureList";
import KnockoutBracket from "./KnockoutBracket";
import { seasonDisplayName, compareSeasonNames } from "@/lib/season-names";
import { historicalFinals, historicalKitColours } from "@/lib/historical-finals";

const subscribeToDate = () => () => {};

export default function CompetitionContent({ night, initial }: {
  night: CompetitionNight; initial: PublicCompetitionViews;
}) {
  const today = useSyncExternalStore(subscribeToDate, melbourneToday, melbourneToday);
  const { views, source } = usePublicCompetition(initial);
  const [seasonId, setSeasonId] = useState("current");
  const selectedArchive = views.history?.find(s => s.id === seasonId);
  const notice = !selectedArchive ? activeNoticeFor(night, today) : undefined;
  const competition = selectedArchive?.[night] ?? views[night];
  const seasonOptions = [{ id: "current", name: views[night].seasonName ?? "Current Season" }, ...(views.history ?? [])].sort((a,b) => compareSeasonNames(a.name,b.name));
  const knockout = selectedArchive ? historicalFinals(selectedArchive.id, night) : undefined;
  return <div className="competition-public">
    <CompetitionHero night={night} nightName={nightLabel(night)} teamCount={competition.teams.length} />
    <SnapshotNotice source={source} />
    <section className="fis-container competition-season-selection" aria-label="Season selection">
      <div className="season-selection-bar">
        <label htmlFor={`season-${night}`}>Season</label>
        <select id={`season-${night}`} value={seasonId} onChange={e => setSeasonId(e.target.value)}>
          {seasonOptions.map(s => <option value={s.id} key={s.id}>{seasonDisplayName(s.name)}</option>)}
        </select>
        <span className="season-selection-status" role="status">{selectedArchive ? "Previous Season" : "Current Season"}</span>
      </div>
    </section>
    {knockout && <div className="fis-container archived-finals-panel">
      <KnockoutBracket night={night} data={knockout} kitColours={historicalKitColours(competition.kitColours)} />
    </div>}
    {notice && <div className="fis-container competition-notice"><NoGamesNotice notice={notice} /></div>}
    {competition.upcoming[0] && <section className="fis-section fis-container" id="upcoming-fixtures">
      <h2 className="section-title">Upcoming Fixtures</h2>
      <div className="round-heading"><span>Round {competition.upcoming[0].round}</span><span>{formatDate(competition.upcoming[0].date)}</span></div>
      <FixtureList fixtures={competition.upcoming[0].fixtures} />
    </section>}
    <section className="fis-section fis-container" id="standings">
      <h2 className="section-title">Standings</h2>
      {!competition.divisions.length && <p className="empty-state">No standings are available yet.</p>}
      {competition.divisions.map(({ division, standings, teams }) => <div className="division-table" key={division}>
        {competition.divisions.length > 1 && <h3 className="division-label">Division {division}</h3>}
        <LeagueTable standings={standings} teams={teams} formByTeam={competition.formByTeam} label={`${nightLabel(night)} Division ${division} standings`} />
      </div>)}
    </section>
    <section className="fis-section fis-container" id="results">
      <h2 className="section-title">Results</h2>
      <div className="rounds">{competition.results.length ? competition.results.map((round, index) => <RoundAccordion key={`${round.round}-${round.date}`} round={round.round} date={formatDate(round.date)} count={round.fixtures.length} defaultOpen={index === 0}>
        <FixtureList fixtures={round.fixtures} />
      </RoundAccordion>) : <p className="empty-state">No results have been recorded yet.</p>}</div>
    </section>
    {competition.upcoming.length > 0 && <section className="fis-section fis-container" id="fixtures">
      <h2 className="section-title">Complete Schedule</h2>
      <div className="rounds">{competition.upcoming.map((round, index) => <RoundAccordion key={`${round.round}-${round.date}`} round={round.round} date={formatDate(round.date)} count={round.fixtures.length} defaultOpen={index === 0}>
        <FixtureList fixtures={round.fixtures} />
      </RoundAccordion>)}</div>
    </section>}
  </div>;
}
