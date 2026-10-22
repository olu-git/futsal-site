import TeamKit from "./TeamKit";
import TeamForm from "./TeamForm";
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
      <TeamForm name={name} form={form} />
    </span> : <span className="fixture-team-name">{name}</span>}
    {side === "away" && <TeamKit colour={colour ?? undefined} />}
  </span>;
}
