import Link from "next/link";
import NoGamesNotice from "./NoGamesNotice";
import FixtureList from "./FixtureList";
import { activeNoticeFor } from "@/lib/site-notices";
import { formatDate, nightLabel, nightPath } from "@/lib/utils";
import type { PublicCompetitionViews } from "@/lib/use-public-competition";

export default function HomeUpcomingFixtures({ competitions, today }: {
  competitions: PublicCompetitionViews["monday"][]; today: string;
}) {
  const noticeNights = competitions.filter(competition => activeNoticeFor(competition.night, today));
  const sharedNotice = noticeNights.length > 1 ? activeNoticeFor(noticeNights[0].night, today) : undefined;
  if (sharedNotice?.groupId && noticeNights.every(competition => activeNoticeFor(competition.night, today)?.groupId === sharedNotice.groupId)) {
    return <div className="home-upcoming-nights home-upcoming-notices"><NoGamesNotice notice={sharedNotice} nights={noticeNights.map(competition => competition.night)} /></div>;
  }
  // Keep both nights in the same Monday–Sunday week. An unfinished round
  // remains visible even after its playing date until its results are published.
  const firstDate = competitions.flatMap(competition => competition.upcoming.map(round => round.date)).sort()[0];
  const weekStart = firstDate ? new Date(`${firstDate}T00:00:00Z`) : undefined;
  if (weekStart) weekStart.setUTCDate(weekStart.getUTCDate() - (weekStart.getUTCDay() + 6) % 7);
  const weekEnd = weekStart ? new Date(weekStart) : undefined;
  if (weekEnd) weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
  const inWeek = (date: string) => !!weekStart && !!weekEnd
    && date >= weekStart.toISOString().slice(0, 10) && date <= weekEnd.toISOString().slice(0, 10);
  const visible = noticeNights.length ? noticeNights : competitions.filter(competition => competition.upcoming.some(round => inWeek(round.date)));
  if (!visible.length) return <p className="empty-state">No upcoming regular-season fixtures are scheduled.</p>;
  return <div className={`home-upcoming-nights${noticeNights.length ? " home-upcoming-notices" : visible.length === 1 ? " home-upcoming-single" : ""}`}>
    {visible.map(competition => {
      const round = competition.upcoming.find(round => inWeek(round.date));
      const notice = activeNoticeFor(competition.night, today);
      return <article key={competition.night}>
        <div className="home-upcoming-heading"><h3 className="type-card-title">{nightLabel(competition.night)}</h3><Link className="text-link" href={`${nightPath(competition.night)}#fixtures`}>Full schedule</Link></div>
        {competition.seasonName && <p className="home-upcoming-season">{competition.seasonName}</p>}
        {notice ? <NoGamesNotice notice={notice} /> : round ? <><div className="round-heading"><span>Round {round.round}</span><span>{formatDate(round.date)}</span></div><FixtureList fixtures={round.fixtures} /></> : <p className="empty-state">No upcoming regular-season fixtures are scheduled.</p>}
      </article>;
    })}
  </div>;
}
