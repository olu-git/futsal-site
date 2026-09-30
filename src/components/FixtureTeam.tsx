import TeamKit from "./TeamKit";

export default function FixtureTeam({ name, colour, side }: {
  name: string;
  colour?: string | null;
  side: "home" | "away";
}) {
  return <span className={`fixture-team-label fixture-team-label-${side}`}>
    {side === "home" && <TeamKit colour={colour ?? undefined} />}
    <span className="fixture-team-name">{name}</span>
    {side === "away" && <TeamKit colour={colour ?? undefined} />}
  </span>;
}
