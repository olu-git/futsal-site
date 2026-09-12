import type { CompetitionNight } from "./types";

export type FinalsSide = "A" | "B";
export type FinalsRound = "R16" | "QF" | "SF" | "GF" | "Friendly";

export interface FinalsResult {
  scoreA: number;
  scoreB: number;
  penaltyWinner?: FinalsSide;
}

export interface FinalsNightData {
  seeds: string[];
  results: Record<string, FinalsResult>;
}

export interface FinalsSeasonData {
  finals: Record<CompetitionNight, FinalsNightData>;
}

export type FinalsSlot =
  | { type: "seed"; value: number }
  | { type: "winner" | "loser"; matchId: string };

export interface FinalsMatch {
  id: string;
  round: FinalsRound;
  label: string;
  week: number;
  time: string;
  court: number;
  a: FinalsSlot;
  b: FinalsSlot;
}

export interface ResolvedFinalsTeam {
  name: string;
  seed: number;
}

const seed = (value: number): FinalsSlot => ({ type: "seed", value });
const winner = (matchId: string): FinalsSlot => ({ type: "winner", matchId });
const loser = (matchId: string): FinalsSlot => ({ type: "loser", matchId });

const eliminationTemplate: FinalsMatch[] = [
  { id: "qf-1", round: "QF", label: "QF1", week: 1, time: "19:40", court: 1, a: winner("r16-m1"), b: winner("r16-m2") },
  { id: "qf-2", round: "QF", label: "QF2", week: 1, time: "19:40", court: 2, a: winner("r16-m3"), b: winner("r16-m4") },
  { id: "qf-3", round: "QF", label: "QF3", week: 1, time: "20:20", court: 1, a: winner("r16-m5"), b: winner("r16-m6") },
  { id: "qf-4", round: "QF", label: "QF4", week: 1, time: "20:20", court: 2, a: winner("r16-m7"), b: winner("r16-m8") },
  { id: "fr-1", round: "Friendly", label: "Friendly", week: 1, time: "19:00", court: 1, a: loser("r16-m1"), b: loser("r16-m2") },
  { id: "fr-2", round: "Friendly", label: "Friendly", week: 1, time: "19:00", court: 2, a: loser("r16-m3"), b: loser("r16-m4") },
  { id: "fr-3", round: "Friendly", label: "Friendly", week: 1, time: "21:00", court: 1, a: loser("r16-m5"), b: loser("r16-m6") },
  { id: "fr-4", round: "Friendly", label: "Friendly", week: 1, time: "21:00", court: 2, a: loser("r16-m7"), b: loser("r16-m8") },
  { id: "sf-1", round: "SF", label: "SF1", week: 2, time: "19:40", court: 1, a: winner("qf-1"), b: winner("qf-2") },
  { id: "sf-2", round: "SF", label: "SF2", week: 2, time: "19:40", court: 2, a: winner("qf-3"), b: winner("qf-4") },
  { id: "gf", round: "GF", label: "Grand Final", week: 2, time: "20:30", court: 1, a: winner("sf-1"), b: winner("sf-2") },
];

const mondayRoundOf16: FinalsMatch[] = [
  { id: "r16-m1", round: "R16", label: "M1", week: 0, time: "19:00", court: 1, a: seed(1), b: seed(16) },
  { id: "r16-m2", round: "R16", label: "M2", week: 0, time: "19:00", court: 2, a: seed(8), b: seed(9) },
  { id: "r16-m3", round: "R16", label: "M3", week: 0, time: "19:40", court: 1, a: seed(4), b: seed(13) },
  { id: "r16-m7", round: "R16", label: "M7", week: 0, time: "19:40", court: 2, a: seed(3), b: seed(14) },
  { id: "r16-m4", round: "R16", label: "M4", week: 0, time: "20:20", court: 1, a: seed(5), b: seed(12) },
  { id: "r16-m5", round: "R16", label: "M5", week: 0, time: "20:20", court: 2, a: seed(2), b: seed(15) },
  { id: "r16-m6", round: "R16", label: "M6", week: 0, time: "21:00", court: 1, a: seed(7), b: seed(10) },
  { id: "r16-m8", round: "R16", label: "M8", week: 0, time: "21:00", court: 2, a: seed(6), b: seed(11) },
];

const wednesdayRoundOf16: FinalsMatch[] = [
  { id: "r16-m1", round: "R16", label: "M1", week: 0, time: "19:00", court: 1, a: seed(1), b: seed(16) },
  { id: "r16-m2", round: "R16", label: "M2", week: 0, time: "19:00", court: 2, a: seed(8), b: seed(9) },
  { id: "r16-m3", round: "R16", label: "M3", week: 0, time: "19:40", court: 1, a: seed(4), b: seed(13) },
  { id: "r16-m4", round: "R16", label: "M4", week: 0, time: "19:40", court: 2, a: seed(5), b: seed(12) },
  { id: "r16-m5", round: "R16", label: "M5", week: 0, time: "20:20", court: 1, a: seed(2), b: seed(15) },
  { id: "r16-m6", round: "R16", label: "M6", week: 0, time: "20:20", court: 2, a: seed(7), b: seed(10) },
  { id: "r16-m7", round: "R16", label: "M7", week: 0, time: "21:00", court: 1, a: seed(3), b: seed(14) },
  { id: "r16-m8", round: "R16", label: "M8", week: 0, time: "21:00", court: 2, a: seed(6), b: seed(11) },
];

export const finalsDates: Record<CompetitionNight, string[]> = {
  monday: ["2026-09-21", "2026-09-28", "2026-10-05"],
  wednesday: ["2026-09-23", "2026-09-30", "2026-10-07"],
};

export const finalsMatches: Record<CompetitionNight, FinalsMatch[]> = {
  monday: [...mondayRoundOf16, ...eliminationTemplate],
  wednesday: [...wednesdayRoundOf16, ...eliminationTemplate],
};

export function winnerSide(result?: FinalsResult): FinalsSide | null {
  if (!result || !Number.isFinite(result.scoreA) || !Number.isFinite(result.scoreB)) {
    return null;
  }
  if (result.scoreA !== result.scoreB) {
    return result.scoreA > result.scoreB ? "A" : "B";
  }
  return result.penaltyWinner ?? null;
}

export function resolveFinalsSlot(
  slot: FinalsSlot,
  night: CompetitionNight,
  data: FinalsNightData
): ResolvedFinalsTeam | null {
  if (slot.type === "seed") {
    const name = data.seeds[slot.value - 1];
    return name ? { name, seed: slot.value } : null;
  }

  const feeder = finalsMatches[night].find((match) => match.id === slot.matchId);
  if (!feeder) return null;

  const winningSide = winnerSide(data.results[feeder.id]);
  if (!winningSide) return null;

  const takeA = slot.type === "winner" ? winningSide === "A" : winningSide !== "A";
  return resolveFinalsSlot(takeA ? feeder.a : feeder.b, night, data);
}
