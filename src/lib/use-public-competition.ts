"use client";

import { createElement, useEffect, useState } from "react";
import { competitionRepository } from "./competition-repository";
import { createCompetitionService, competitionService } from "./competition-service";
import { loadPublishedCompetition, preferPublished } from "./public-competition";

export type CompetitionView = Awaited<ReturnType<typeof competitionService.getNight>>;
export type NextRoundView = Awaited<ReturnType<typeof competitionService.getNextRound>>;

export interface PublicCompetitionViews {
  monday: CompetitionView;
  wednesday: CompetitionView;
  nextRound: NextRoundView;
}

export function usePublicCompetition(initial: PublicCompetitionViews) {
  const [views, setViews] = useState(initial);
  const [source, setSource] = useState<"loading" | "supabase" | "snapshot">("loading");

  useEffect(() => {
    let cancelled = false;
    preferPublished(async () => {
      const data = await loadPublishedCompetition();
      const service = createCompetitionService({ readCompetition: async () => data, readFinals: competitionRepository.readFinals });
      const [monday, wednesday, nextRound] = await Promise.all([
        service.getNight("monday"), service.getNight("wednesday"), service.getNextRound(),
      ]);
      return { monday, wednesday, nextRound };
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
