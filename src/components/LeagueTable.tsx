import { Standing } from "@/lib/types";

interface LeagueTableProps {
  standings: Standing[];
  compact?: boolean;
}

export default function LeagueTable({ standings, compact = false }: LeagueTableProps) {
  const displayStandings = compact ? standings.slice(0, 5) : standings;

  return (
    <div className="overflow-x-auto border-2 border-[var(--fis-blue)] bg-[var(--fis-cream-light)] shadow-[5px_5px_0_var(--fis-red)]">
      <table className="w-full min-w-[480px] border-collapse">
        <thead>
          <tr className="bg-[var(--fis-blue)]">
            <th className="px-4 py-3 text-left font-[family-name:var(--font-mono)] text-xs font-bold text-white uppercase tracking-wider w-10">
              POS
            </th>
            <th className="px-2 py-3 text-left font-[family-name:var(--font-mono)] text-xs font-bold text-white uppercase tracking-wider">
              TEAM
            </th>
            <th className="px-2 py-3 text-center font-[family-name:var(--font-mono)] text-xs font-bold text-white uppercase tracking-wider w-10">
              P
            </th>
            <th className="px-2 py-3 text-center font-[family-name:var(--font-mono)] text-xs font-bold text-white uppercase tracking-wider w-10">
              W
            </th>
            <th className="px-2 py-3 text-center font-[family-name:var(--font-mono)] text-xs font-bold text-white uppercase tracking-wider w-10">
              D
            </th>
            <th className="px-2 py-3 text-center font-[family-name:var(--font-mono)] text-xs font-bold text-white uppercase tracking-wider w-10">
              L
            </th>
            {!compact && (
              <>
                <th className="px-2 py-3 text-center font-[family-name:var(--font-mono)] text-xs font-bold text-white uppercase tracking-wider w-11">
                  GF
                </th>
                <th className="px-2 py-3 text-center font-[family-name:var(--font-mono)] text-xs font-bold text-white uppercase tracking-wider w-11">
                  GA
                </th>
              </>
            )}
            <th className="px-2 py-3 text-center font-[family-name:var(--font-mono)] text-xs font-bold text-white uppercase tracking-wider w-12">
              GD
            </th>
            <th className="px-4 py-3 text-center font-[family-name:var(--font-mono)] text-xs font-bold text-white uppercase tracking-wider w-12">
              PTS
            </th>
          </tr>
        </thead>
        <tbody>
          {displayStandings.map((row, i) => (
            <tr
              key={row.teamId}
              className={`transition-colors hover:bg-[var(--fis-blue)]/[0.06] ${
                i < displayStandings.length - 1 ? "border-b border-[var(--fis-blue)]/15" : ""
              }`}
            >
              <td className="px-4 py-3.5">
                <span
                  className={`font-[family-name:var(--font-mono)] text-sm font-bold ${
                    row.position === 1 ? "text-[var(--fis-red)]" : "text-[var(--fis-blue)]/55"
                  }`}
                >
                  {row.position}
                </span>
              </td>
              <td className="px-2 py-3.5">
                <span className="font-[family-name:var(--font-sans)] text-sm font-bold text-[var(--fis-blue)]">
                  {row.teamName}
                </span>
              </td>
              <td className="px-2 py-3.5 text-center font-[family-name:var(--font-sans)] text-xs font-semibold text-[var(--fis-blue)]/80">
                {row.played}
              </td>
              <td className="px-2 py-3.5 text-center font-[family-name:var(--font-sans)] text-xs font-semibold text-[var(--fis-blue)]/80">
                {row.won}
              </td>
              <td className="px-2 py-3.5 text-center font-[family-name:var(--font-sans)] text-xs font-semibold text-[var(--fis-blue)]/80">
                {row.drawn}
              </td>
              <td className="px-2 py-3.5 text-center font-[family-name:var(--font-sans)] text-xs font-semibold text-[var(--fis-blue)]/80">
                {row.lost}
              </td>
              {!compact && (
                <>
                  <td className="px-2 py-3.5 text-center font-[family-name:var(--font-sans)] text-xs font-semibold text-[var(--fis-blue)]/80">
                    {row.goalsFor}
                  </td>
                  <td className="px-2 py-3.5 text-center font-[family-name:var(--font-sans)] text-xs font-semibold text-[var(--fis-blue)]/80">
                    {row.goalsAgainst}
                  </td>
                </>
              )}
              <td className="px-2 py-3.5 text-center font-[family-name:var(--font-sans)] text-xs font-semibold">
                <span
                  className={
                    row.goalDifference > 0
                      ? "text-green-400"
                      : row.goalDifference < 0
                      ? "text-red-400"
                      : "text-[var(--fis-blue)]/50"
                  }
                >
                  {row.goalDifference > 0 ? "+" : ""}
                  {row.goalDifference}
                </span>
              </td>
              <td className="px-4 py-3.5 text-center font-[family-name:var(--font-sans)] text-xs font-black text-[var(--fis-blue)]">
                {row.points}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
