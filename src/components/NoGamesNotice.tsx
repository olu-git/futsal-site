import Link from "next/link";
import type { SiteNotice } from "@/lib/site-notices";
import { nightPath } from "@/lib/utils";
import type { CompetitionNight } from "@/lib/types";

export default function NoGamesNotice({ notice, nights = [notice.night] }: { notice: SiteNotice; nights?: CompetitionNight[] }) {
  return <section className="no-games-notice" role="status" aria-labelledby={notice.id}>
    <h4 id={notice.id}>{notice.title}</h4>
    <p>{notice.message}</p>
    <p><strong>{notice.resumeText}</strong></p>
    <div className="no-games-notice-links">{nights.map(night => <Link key={night} href={`${nightPath(night)}#fixtures`}>{nights.length > 1 ? `${night === "monday" ? "Monday" : "Wednesday"} fixtures` : notice.linkLabel}</Link>)}</div>
  </section>;
}
