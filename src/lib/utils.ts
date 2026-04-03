import { CompetitionNight } from "./types";

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatTime(time: string): string {
  const [h, m] = time.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "pm" : "am";
  const displayHour = hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${m}${ampm}`;
}

export function nightLabel(night: CompetitionNight): string {
  return night === "monday" ? "Monday Night" : "Wednesday Night";
}

export function nightPath(night: CompetitionNight): string {
  return night === "monday" ? "/monday-night" : "/wednesday-night";
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
