import Link from "next/link";
import type { SiteNotice } from "@/lib/site-notices";
import { nightPath } from "@/lib/utils";

export default function NoGamesNotice({ notice }: { notice: SiteNotice }) {
  return <section className="no-games-notice" role="status" aria-labelledby={notice.id}>
    <h4 id={notice.id}>{notice.title}</h4>
    <p>{notice.message}</p>
    <p><strong>{notice.resumeText}</strong></p>
    <Link href={`${nightPath(notice.night)}#fixtures`}>{notice.linkLabel}</Link>
  </section>;
}
