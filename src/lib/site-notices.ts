import noticesData from "../data/site-notices.json";
import type { CompetitionNight } from "./types";

export interface SiteNotice {
  id: string;
  night: CompetitionNight;
  date: string;
  showFrom: string;
  showUntil?: string;
  groupId?: string;
  title: string;
  message: string;
  resumeText: string;
  linkLabel: string;
}

const siteNotices = noticesData as SiteNotice[];

// Align updates to the minute, including Melbourne midnight; refresh sleeping tabs.
export function subscribeToMelbourneDate(onChange: () => void): () => void {
  let timer: ReturnType<typeof setTimeout>;
  const schedule = () => {
    timer = setTimeout(() => { onChange(); schedule(); }, 60_000 - Date.now() % 60_000);
  };
  schedule();
  window.addEventListener("focus", onChange);
  document.addEventListener("visibilitychange", onChange);
  return () => {
    clearTimeout(timer);
    window.removeEventListener("focus", onChange);
    document.removeEventListener("visibilitychange", onChange);
  };
}

export function melbourneToday(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Australia/Melbourne",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function activeNoticeFor(night: CompetitionNight, today: string, notices: readonly SiteNotice[] = siteNotices): SiteNotice | undefined {
  return notices.find((notice) => notice.night === night && notice.showFrom <= today && today <= (notice.showUntil ?? notice.date));
}
