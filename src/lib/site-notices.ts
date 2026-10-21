import noticesData from "../data/site-notices.json";
import type { CompetitionNight } from "./types";

export interface SiteNotice {
  id: string;
  night: CompetitionNight;
  date: string;
  showFrom: string;
  title: string;
  message: string;
  resumeText: string;
  linkLabel: string;
}

const siteNotices = noticesData as SiteNotice[];

export function melbourneToday(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Australia/Melbourne",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function activeNoticeFor(night: CompetitionNight, today: string, notices: readonly SiteNotice[] = siteNotices): SiteNotice | undefined {
  return notices.find((notice) => notice.night === night && notice.showFrom <= today && today <= notice.date);
}
