import seasonOne from "@/data/season-2026-s1.json";
import type { CompetitionNight } from "./types";
import type { FinalsSeasonData } from "./finals";

// Published archive identity, not a display-name match. No other edition inherits these finals.
const finalsBySeason: Record<string, FinalsSeasonData> = {
  "08dce649-66b8-5d32-9c9e-d07a180cf591": seasonOne as FinalsSeasonData,
};

export function historicalFinals(seasonId: string, night: CompetitionNight) {
  return finalsBySeason[seasonId]?.finals[night];
}

export function previousSeasonLabel(name: string) {
  return `${name} — Previous Season`;
}

// Finals retain the recorded name; the same team UUID is now named King ADL.
export function historicalKitColours(colours: Record<string, string | undefined>) {
  return { ...colours, Toss: colours.Toss ?? colours["King ADL"] };
}
