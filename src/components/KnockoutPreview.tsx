"use client";

import { useState } from "react";
import { type FinalsSeasonData } from "@/lib/finals";
import type { CompetitionNight } from "@/lib/types";
import type { CompetitionView } from "@/lib/use-public-competition";
import { nightLabel } from "@/lib/utils";
import KnockoutBracket from "./KnockoutBracket";

export default function KnockoutPreview({ finals, competitions }: {
  finals: FinalsSeasonData;
  competitions: Record<CompetitionNight, CompetitionView>;
}) {
  const [night, setNight] = useState<CompetitionNight>("monday");
  return <section className="fis-section fis-container home-finals-wrap" id="knockout-stages">
    <h2 className="section-title">KNOCKOUT STAGES</h2>
    <div className="home-finals">
      <div className="home-finals-nav" role="group" aria-label="Competition night">
        {(["monday", "wednesday"] as const).map((choice) =>
          <button key={choice} type="button" aria-pressed={night === choice} onClick={() => setNight(choice)}>{nightLabel(choice)}</button>)}
      </div>
      <KnockoutBracket night={night} data={finals.finals[night]} kitColours={competitions[night].kitColours} preview />
    </div>
  </section>;
}
