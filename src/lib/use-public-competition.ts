"use client";

import { createElement, useEffect, useState } from "react";
import { competitionService } from "./competition-service";
import { competitionViews } from "./competition-views";
import { loadPublishedCompetition, preferPublished } from "./public-competition";

export type CompetitionView = Awaited<ReturnType<typeof competitionService.getNight>>;
export type NextRoundView = Awaited<ReturnType<typeof competitionService.getNextRound>>;

export interface PublicCompetitionViews {
  monday: CompetitionView;
  wednesday: CompetitionView;
  nextRound: NextRoundView;
  history?: Array<{id:string;name:string;monday:CompetitionView;wednesday:CompetitionView}>;
}

export function usePublicCompetition(initial: PublicCompetitionViews) {
  const [views, setViews] = useState(initial);
  const [source, setSource] = useState<"loading" | "supabase" | "snapshot">("loading");

  useEffect(() => {
    let cancelled = false;
    preferPublished(async () => {
      const data = await loadPublishedCompetition();
      return competitionViews(data);
    }, initial).then(({ value, source }) => {
      if (!cancelled) { setViews(value); setSource(source); }
    });
    return () => { cancelled = true; };
  }, [initial]);

  return { views, source };
}

export function SnapshotNotice({ source }: { source: "loading" | "supabase" | "snapshot" }) {
  return source === "snapshot" ? createElement("p", { className: "snapshot-notice", role: "status" },
    "Showing the last published competition snapshot. Live updates are temporarily unavailable.") : null;
}
