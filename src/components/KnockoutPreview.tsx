"use client";

import { useState } from "react";
import Link from "next/link";
import { finalsDates, finalsMatches, type FinalsSeasonData } from "@/lib/finals";
import type { CompetitionNight } from "@/lib/types";
import type { CompetitionView } from "@/lib/use-public-competition";
import { nightLabel, nightPath } from "@/lib/utils";
import KnockoutBracket from "./KnockoutBracket";

function localDate() {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Australia/Melbourne", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

export function hasCurrentFinals(finals: FinalsSeasonData, today = localDate()) {
  return (["monday", "wednesday"] as const).some((night) =>
    finalsDates[night].at(-1)! >= today && finalsMatches[night].some((match) => !finals.finals[night].results[match.id]));
}

export default function KnockoutPreview({ finals, competitions }: {
  finals: FinalsSeasonData;
  competitions: Record<CompetitionNight, CompetitionView>;
}) {
  const [night, setNight] = useState<CompetitionNight>("monday");
  return <section className="fis-section home-finals" id="next-fixtures">
    <div className="fis-container">
      <p className="eyebrow">Finals</p><h2 className="section-title">Knockout matches</h2>
      <div className="home-finals-nav" role="group" aria-label="Competition night">
        {(["monday", "wednesday"] as const).map((choice) =>
          <button key={choice} type="button" aria-pressed={night === choice} onClick={() => setNight(choice)}>{nightLabel(choice)}</button>)}
        <Link href={`${nightPath(night)}#finals`}>Full {nightLabel(night)} bracket</Link>
      </div>
      <KnockoutBracket night={night} data={finals.finals[night]} kitColours={competitions[night].kitColours} preview />
    </div>
  </section>;
}
