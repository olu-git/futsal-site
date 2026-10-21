"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import NoGamesNotice from "./NoGamesNotice";
import { activeNoticeFor, melbourneToday } from "@/lib/site-notices";
import HomeHero from "./HomeHero";
import LeagueTable from "./LeagueTable";
import FixtureList from "./FixtureList";
import { usePublicCompetition, SnapshotNotice, type PublicCompetitionViews } from "@/lib/use-public-competition";
import { formatDate, nightLabel, nightPath } from "@/lib/utils";
import type { FinalsSeasonData } from "@/lib/finals";
import KnockoutPreview from "./KnockoutPreview";
import HomeTvFeature from "./HomeTvFeature";

const subscribeToDate = () => () => {};

export default function HomeContent({ initial, finals }: { initial: PublicCompetitionViews; finals: FinalsSeasonData }) {
  const today = useSyncExternalStore(subscribeToDate, melbourneToday, melbourneToday);
  const { views, source } = usePublicCompetition(initial);
  const { monday, wednesday } = views;
  return <div className="home-public">
    <HomeHero seasonName={monday.seasonName ?? wednesday.seasonName} />
    <SnapshotNotice source={source} />
    <section className="fis-section fis-container" id="next-fixtures">
      <h2 className="section-title">Upcoming Fixtures</h2>
      <div className="home-upcoming-nights">{[monday,wednesday].map(competition => {
        const round = competition.upcoming[0];
        const notice = activeNoticeFor(competition.night, today);
        return <article key={competition.night}>
          <div className="home-upcoming-heading"><h3 className="type-card-title">{nightLabel(competition.night)}</h3><Link className="text-link" href={`${nightPath(competition.night)}#fixtures`}>Full schedule</Link></div>
          {competition.seasonName && <p className="home-upcoming-season">{competition.seasonName}</p>}
          {notice ? <NoGamesNotice notice={notice} /> : round ? <><div className="round-heading"><span>Round {round.round}</span><span>{formatDate(round.date)}</span></div><FixtureList fixtures={round.fixtures} /></> : <p className="empty-state">No upcoming regular-season fixtures are scheduled.</p>}
        </article>;
      })}</div>
    </section>
    <section className="fis-section fis-container" id="standings">
      <p className="eyebrow">Current standings</p><h2 className="section-title">League Tables</h2>
      {!monday.divisions.length && !wednesday.divisions.length && <p className="empty-state">No standings are available yet.</p>}
      <div className="standings-previews">{[monday, wednesday].flatMap((competition) => competition.divisions.map(({ division, standings, teams }) => <article key={`${competition.night}-${division}`}>
        <Link className="league-head" href={`${nightPath(competition.night)}#standings`}>
          <h3>{nightLabel(competition.night)}{competition.divisions.length > 1 && ` / Division ${division}`}</h3><span>View Table</span>
        </Link>
        <LeagueTable standings={standings} teams={teams} compact label={`${nightLabel(competition.night)} Division ${division} top five`} />
      </article>))}</div>
    </section>
    <HomeTvFeature />
    <KnockoutPreview finals={finals} competitions={{ monday, wednesday }} />
  </div>;
}
