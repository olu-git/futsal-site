"use client";

import type { CompetitionNight } from "@/lib/types";
import { useState } from "react";
import { usePublicCompetition, SnapshotNotice, type PublicCompetitionViews } from "@/lib/use-public-competition";
import { formatDate, nightLabel } from "@/lib/utils";
import CompetitionHero from "./CompetitionHero";
import LeagueTable from "./LeagueTable";
import RoundAccordion from "./RoundAccordion";
import FixtureList from "./FixtureList";

export default function CompetitionContent({ night, initial }: {
  night: CompetitionNight; initial: PublicCompetitionViews;
}) {
  const { views, source } = usePublicCompetition(initial);
  const [seasonId,setSeasonId] = useState("current");
  const competition = views.history?.find(s=>s.id===seasonId)?.[night] ?? views[night];
  return <>
    <CompetitionHero nightName={nightLabel(night)} teamCount={competition.teams.length} />
    <SnapshotNotice source={source} />
    <section className="fis-container competition-season-selection" aria-label="Season selection">
      <label>Season<select value={seasonId} onChange={e=>setSeasonId(e.target.value)}><option value="current">{views[night].seasonName ?? "Current season"}</option>{views.history?.map(s=><option value={s.id} key={s.id}>{s.name} — previous season</option>)}</select></label>
      <p>{competition.seasonName ?? "Current season"}</p>
    </section>
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
        <LeagueTable standings={standings} teams={teams} label={`${nightLabel(night)} Division ${division} standings`} />
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
  </>;
}
