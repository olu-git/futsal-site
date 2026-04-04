"use client";

import { Standing } from "@/lib/types";
import { motion } from "framer-motion";

interface LeagueTableProps {
  standings: Standing[];
  compact?: boolean;
}

export default function LeagueTable({ standings, compact = false }: LeagueTableProps) {
  const displayStandings = compact ? standings.slice(0, 5) : standings;

  return (
    <div className="overflow-x-auto rounded-lg border border-white/10 bg-[#141414]">
      <table className="w-full min-w-[480px] border-collapse">
        <thead>
          <tr className="bg-red-600">
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
            <motion.tr
              key={row.teamId}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`hover:bg-white/[0.03] transition-colors ${
                i < displayStandings.length - 1 ? "border-b border-white/[0.05]" : ""
              }`}
            >
              <td className="px-4 py-3.5">
                <span
                  className={`font-[family-name:var(--font-mono)] text-sm font-bold ${
                    row.position === 1 ? "text-red-500" : "text-white/50"
                  }`}
                >
                  {row.position}
                </span>
              </td>
              <td className="px-2 py-3.5">
                <span className="font-[family-name:var(--font-sans)] text-sm font-semibold text-white">
                  {row.teamName}
                </span>
              </td>
              <td className="px-2 py-3.5 text-center font-[family-name:var(--font-mono)] text-sm text-white/80">
                {row.played}
              </td>
              <td className="px-2 py-3.5 text-center font-[family-name:var(--font-mono)] text-sm text-white/80">
                {row.won}
              </td>
              <td className="px-2 py-3.5 text-center font-[family-name:var(--font-mono)] text-sm text-white/80">
                {row.drawn}
              </td>
              <td className="px-2 py-3.5 text-center font-[family-name:var(--font-mono)] text-sm text-white/80">
                {row.lost}
              </td>
              {!compact && (
                <>
                  <td className="px-2 py-3.5 text-center font-[family-name:var(--font-mono)] text-sm text-white/80">
                    {row.goalsFor}
                  </td>
                  <td className="px-2 py-3.5 text-center font-[family-name:var(--font-mono)] text-sm text-white/80">
                    {row.goalsAgainst}
                  </td>
                </>
              )}
              <td className="px-2 py-3.5 text-center font-[family-name:var(--font-mono)] text-sm">
                <span
                  className={
                    row.goalDifference > 0
                      ? "text-green-400"
                      : row.goalDifference < 0
                      ? "text-red-400"
                      : "text-white/50"
                  }
                >
                  {row.goalDifference > 0 ? "+" : ""}
                  {row.goalDifference}
                </span>
              </td>
              <td className="px-4 py-3.5 text-center font-[family-name:var(--font-mono)] text-sm font-bold text-white">
                {row.points}
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
