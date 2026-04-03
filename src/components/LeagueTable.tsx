"use client";

import { Standing } from "@/lib/types";
import { motion } from "framer-motion";

interface LeagueTableProps {
  standings: Standing[];
  compact?: boolean;
}

const headerCols = [
  { key: "pos", label: "POS", width: "w-[50px]", align: "text-left" },
  { key: "team", label: "TEAM", width: "flex-1", align: "text-left" },
  { key: "p", label: "P", width: "w-10", align: "text-center" },
  { key: "w", label: "W", width: "w-10", align: "text-center" },
  { key: "d", label: "D", width: "w-10", align: "text-center" },
  { key: "l", label: "L", width: "w-10", align: "text-center" },
  { key: "gf", label: "GF", width: "w-11", align: "text-center" },
  { key: "ga", label: "GA", width: "w-11", align: "text-center" },
  { key: "gd", label: "GD", width: "w-11", align: "text-center" },
  { key: "pts", label: "PTS", width: "w-[50px]", align: "text-center" },
];

export default function LeagueTable({ standings, compact = false }: LeagueTableProps) {
  const displayStandings = compact ? standings.slice(0, 5) : standings;
  const visibleCols = compact
    ? headerCols.filter((c) => !["gf", "ga"].includes(c.key))
    : headerCols;

  return (
    <div className="overflow-x-auto rounded-lg border border-white/10 bg-[#141414]">
      {/* Header */}
      <div className="flex items-center bg-red-600 px-5 py-3">
        {visibleCols.map((col) => (
          <span
            key={col.key}
            className={`${col.width} ${col.align} font-[family-name:var(--font-mono)] text-xs font-bold text-white uppercase tracking-wider`}
          >
            {col.label}
          </span>
        ))}
      </div>

      {/* Rows */}
      {displayStandings.map((row, i) => (
        <motion.div
          key={row.teamId}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.03 }}
          className={`flex items-center px-5 py-3.5 hover:bg-white/[0.03] transition-colors ${
            i < displayStandings.length - 1 ? "border-b border-white/[0.05]" : ""
          }`}
        >
          {/* Position */}
          <span
            className={`w-[50px] font-[family-name:var(--font-mono)] text-sm font-bold ${
              row.position === 1 ? "text-red-500" : "text-white/50"
            }`}
          >
            {row.position}
          </span>

          {/* Team */}
          <span className="flex-1 font-[family-name:var(--font-sans)] text-sm font-semibold text-white">
            {row.teamName}
          </span>

          {/* Stats */}
          <span className="w-10 text-center font-[family-name:var(--font-mono)] text-sm text-white/80">
            {row.played}
          </span>
          <span className="w-10 text-center font-[family-name:var(--font-mono)] text-sm text-white/80">
            {row.won}
          </span>
          <span className="w-10 text-center font-[family-name:var(--font-mono)] text-sm text-white/80">
            {row.drawn}
          </span>
          <span className="w-10 text-center font-[family-name:var(--font-mono)] text-sm text-white/80">
            {row.lost}
          </span>

          {!compact && (
            <>
              <span className="w-11 text-center font-[family-name:var(--font-mono)] text-sm text-white/80">
                {row.goalsFor}
              </span>
              <span className="w-11 text-center font-[family-name:var(--font-mono)] text-sm text-white/80">
                {row.goalsAgainst}
              </span>
            </>
          )}

          {/* GD */}
          <span
            className={`w-11 text-center font-[family-name:var(--font-mono)] text-sm ${
              row.goalDifference > 0
                ? "text-green-400"
                : row.goalDifference < 0
                ? "text-red-400"
                : "text-white/50"
            }`}
          >
            {row.goalDifference > 0 ? "+" : ""}
            {row.goalDifference}
          </span>

          {/* PTS */}
          <span className="w-[50px] text-center font-[family-name:var(--font-mono)] text-sm font-bold text-white">
            {row.points}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
