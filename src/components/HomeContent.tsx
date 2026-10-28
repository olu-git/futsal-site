"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { melbourneToday, subscribeToMelbourneDate } from "@/lib/site-notices";
import HomeHero from "./HomeHero";
import LeagueTable from "./LeagueTable";
import HomeUpcomingFixtures from "./HomeUpcomingFixtures";
import { usePublicCompetition, SnapshotNotice, type PublicCompetitionViews } from "@/lib/use-public-competition";
import { nightLabel, nightPath } from "@/lib/utils";
import type { FinalsSeasonData } from "@/lib/finals";
import KnockoutPreview from "./KnockoutPreview";
import HomeTvFeature from "./HomeTvFeature";

const serverDate = () => "";

export default function HomeContent({ initial, finals }: { initial: PublicCompetitionViews; finals: FinalsSeasonData }) {
  const today = useSyncExternalStore(subscribeToMelbourneDate, melbourneToday, serverDate);
  const { views, source } = usePublicCompetition(initial);
  const { monday, wednesday } = views;
  return <div className="home-public">
    <HomeHero seasonName={monday.seasonName ?? wednesday.seasonName} />
    <SnapshotNotice source={source} />
    <section className="fis-section fis-container" id="next-fixtures">
      <h2 className="section-title">Upcoming Fixtures</h2>
      {today && <HomeUpcomingFixtures competitions={[monday, wednesday]} today={today} />}
    </section>
    <section className="fis-section fis-container" id="standings">
      <p className="eyebrow">Current standings</p><h2 className="section-title">League Tables</h2>
      {!monday.divisions.length && !wednesday.divisions.length && <p className="empty-state">No standings are available yet.</p>}
      <div className="standings-previews">{[monday, wednesday].flatMap((competition) => competition.divisions.map(({ division, standings, teams }) => <article key={`${competition.night}-${division}`}>
        <Link className="league-head" href={`${nightPath(competition.night)}#standings`}>
          <h3>{nightLabel(competition.night)}{competition.divisions.length > 1 && ` / Division ${division}`}</h3><span>View Table</span>
        </Link>
        <LeagueTable standings={standings} teams={teams} formByTeam={competition.formByTeam} compact label={`${nightLabel(competition.night)} Division ${division} top five`} />
      </article>))}</div>
    </section>
    <HomeTvFeature />
    <KnockoutPreview finals={finals} competitions={{ monday, wednesday }} />
  </div>;
}
