import TeamKit from "./TeamKit";
import type { FormResult } from "@/lib/team-form";

export default function FixtureTeam({ name, colour, side, form }: {
  name: string;
  colour?: string | null;
  side: "home" | "away";
  form?: FormResult[];
}) {
  return <span className={`fixture-team-label fixture-team-label-${side}`}>
    {side === "home" && <TeamKit colour={colour ?? undefined} />}
    {form ? <span className="fixture-team-copy">
      <span className="fixture-team-name">{name}</span>
      <span className="team-form" role="list" aria-label={`${name} recent form, oldest to newest`}>
        {form.map((result, index) => <span key={index} role="listitem" className={`form-badge form-${result === "?" ? "unknown" : result.toLowerCase()}`}
          aria-label={`Match ${index + 1} of 5: ${{ W: "Win", D: "Draw", L: "Loss", "?": "No completed match" }[result]}`}>{result}</span>)}
      </span>
    </span> : <span className="fixture-team-name">{name}</span>}
    {side === "away" && <TeamKit colour={colour ?? undefined} />}
  </span>;
}
