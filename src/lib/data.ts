import { Team, Fixture, CompetitionNight } from "./types";

// ============================================================
// TEAMS
// ============================================================
// Edit team names here. Keep IDs consistent with fixtures.

export const teams: Team[] = [
  // Monday Night – Div A (8 teams)
  { id: "mon-afg", name: "AFG", night: "monday", division: "A" },
  { id: "mon-blue-dragons", name: "Blue Dragons", night: "monday", division: "A" },
  { id: "mon-buckle-city", name: "Buckle City", night: "monday", division: "A" },
  { id: "mon-goldlink-up", name: "Goldlink Up", night: "monday", division: "A" },
  { id: "mon-misfits", name: "Misfits", night: "monday", division: "A" },
  { id: "mon-persepolis", name: "Persepolis", night: "monday", division: "A" },
  { id: "mon-samen", name: "Samen", night: "monday", division: "A" },
  { id: "mon-wildcats", name: "Wildcats", night: "monday", division: "A" },

  // Wednesday Night – Div A (10 teams)
  { id: "wed-afg", name: "AFG", night: "wednesday", division: "A" },
  { id: "wed-buckle-city", name: "Buckle City", night: "wednesday", division: "A" },
  { id: "wed-goldlink-up", name: "Goldlink Up", night: "wednesday", division: "A" },
  { id: "wed-misfits", name: "Misfits", night: "wednesday", division: "A" },
  { id: "wed-persepolis", name: "Persepolis", night: "wednesday", division: "A" },
  { id: "wed-pops", name: "Pops", night: "wednesday", division: "A" },
  { id: "wed-rinnai", name: "Rinnai", night: "wednesday", division: "A" },
  { id: "wed-samen", name: "Samen", night: "wednesday", division: "A" },
  { id: "wed-unathletico", name: "Unathletico", night: "wednesday", division: "A" },
  { id: "wed-wildcats", name: "Wildcats", night: "wednesday", division: "A" },
];

// ============================================================
// FIXTURES
// ============================================================
// Edit scores here. Set status to "completed" and add homeScore/awayScore.
// Leave status as "scheduled" for upcoming fixtures.
//
// Monday: Court 1 has 3 games (7:00pm, 7:40pm, 8:20pm), Court 2 has 1 game (7:40pm)
// Constraint: Goldlink Up never plays at 7:40pm (when 2 games run simultaneously)
//
// Wednesday: Court 1 has 3 games (7:00pm, 7:40pm, 8:20pm), Court 2 has 2 games (7:40pm, 8:20pm)

export const fixtures: Fixture[] = [
  // ============================================================
  // MONDAY NIGHT – DIV A (14 rounds, 8 teams round-robin x2)
  // ============================================================

  // --- Round 1 – Monday 23/03/2026 ---
  { id: "mon-r1-1", night: "monday", division: "A", round: 1, date: "2026-03-23", time: "19:00", court: 1, homeTeam: "mon-wildcats", awayTeam: "mon-afg", homeScore: 9, awayScore: 7, status: "completed" },
  { id: "mon-r1-2", night: "monday", division: "A", round: 1, date: "2026-03-23", time: "19:40", court: 1, homeTeam: "mon-goldlink-up", awayTeam: "mon-blue-dragons", homeScore: 9, awayScore: 6, status: "completed" },
  { id: "mon-r1-3", night: "monday", division: "A", round: 1, date: "2026-03-23", time: "19:40", court: 2, homeTeam: "mon-persepolis", awayTeam: "mon-misfits", homeScore: 5, awayScore: 4, status: "completed" },
  { id: "mon-r1-4", night: "monday", division: "A", round: 1, date: "2026-03-23", time: "20:20", court: 1, homeTeam: "mon-buckle-city", awayTeam: "mon-samen", status: "scheduled" },

  // --- Round 2 – Monday 30/03/2026 ---
  { id: "mon-r2-1", night: "monday", division: "A", round: 2, date: "2026-03-29", time: "19:00", court: 1, homeTeam: "mon-afg", awayTeam: "mon-samen", status: "scheduled" },
  { id: "mon-r2-2", night: "monday", division: "A", round: 2, date: "2026-03-29", time: "19:40", court: 1, homeTeam: "mon-wildcats", awayTeam: "mon-persepolis", status: "scheduled" },
  { id: "mon-r2-3", night: "monday", division: "A", round: 2, date: "2026-03-29", time: "19:40", court: 2, homeTeam: "mon-blue-dragons", awayTeam: "mon-misfits", status: "scheduled" },
  { id: "mon-r2-4", night: "monday", division: "A", round: 2, date: "2026-03-29", time: "20:20", court: 1, homeTeam: "mon-buckle-city", awayTeam: "mon-goldlink-up", status: "scheduled" },

  // --- Round 3 – Monday 06/04/2026 ---
  { id: "mon-r3-1", night: "monday", division: "A", round: 3, date: "2026-04-05", time: "19:00", court: 1, homeTeam: "mon-wildcats", awayTeam: "mon-goldlink-up", status: "scheduled" },
  { id: "mon-r3-2", night: "monday", division: "A", round: 3, date: "2026-04-05", time: "19:40", court: 1, homeTeam: "mon-afg", awayTeam: "mon-persepolis", status: "scheduled" },
  { id: "mon-r3-3", night: "monday", division: "A", round: 3, date: "2026-04-05", time: "19:40", court: 2, homeTeam: "mon-samen", awayTeam: "mon-misfits", status: "scheduled" },
  { id: "mon-r3-4", night: "monday", division: "A", round: 3, date: "2026-04-05", time: "20:20", court: 1, homeTeam: "mon-blue-dragons", awayTeam: "mon-buckle-city", status: "scheduled" },

  // --- Round 4 – Monday 13/04/2026 ---
  { id: "mon-r4-1", night: "monday", division: "A", round: 4, date: "2026-04-12", time: "19:00", court: 1, homeTeam: "mon-afg", awayTeam: "mon-misfits", status: "scheduled" },
  { id: "mon-r4-2", night: "monday", division: "A", round: 4, date: "2026-04-12", time: "19:40", court: 1, homeTeam: "mon-samen", awayTeam: "mon-buckle-city", status: "scheduled" },
  { id: "mon-r4-3", night: "monday", division: "A", round: 4, date: "2026-04-12", time: "19:40", court: 2, homeTeam: "mon-wildcats", awayTeam: "mon-blue-dragons", status: "scheduled" },
  { id: "mon-r4-4", night: "monday", division: "A", round: 4, date: "2026-04-12", time: "20:20", court: 1, homeTeam: "mon-persepolis", awayTeam: "mon-goldlink-up", status: "scheduled" },

  // --- Round 5 – Monday 20/04/2026 ---
  { id: "mon-r5-1", night: "monday", division: "A", round: 5, date: "2026-04-19", time: "19:00", court: 1, homeTeam: "mon-afg", awayTeam: "mon-goldlink-up", status: "scheduled" },
  { id: "mon-r5-2", night: "monday", division: "A", round: 5, date: "2026-04-19", time: "19:40", court: 1, homeTeam: "mon-misfits", awayTeam: "mon-buckle-city", status: "scheduled" },
  { id: "mon-r5-3", night: "monday", division: "A", round: 5, date: "2026-04-19", time: "19:40", court: 2, homeTeam: "mon-persepolis", awayTeam: "mon-blue-dragons", status: "scheduled" },
  { id: "mon-r5-4", night: "monday", division: "A", round: 5, date: "2026-04-19", time: "20:20", court: 1, homeTeam: "mon-samen", awayTeam: "mon-wildcats", status: "scheduled" },

  // --- Round 6 – Monday 27/04/2026 ---
  { id: "mon-r6-1", night: "monday", division: "A", round: 6, date: "2026-04-26", time: "19:00", court: 1, homeTeam: "mon-afg", awayTeam: "mon-buckle-city", status: "scheduled" },
  { id: "mon-r6-2", night: "monday", division: "A", round: 6, date: "2026-04-26", time: "19:40", court: 1, homeTeam: "mon-misfits", awayTeam: "mon-wildcats", status: "scheduled" },
  { id: "mon-r6-3", night: "monday", division: "A", round: 6, date: "2026-04-26", time: "19:40", court: 2, homeTeam: "mon-persepolis", awayTeam: "mon-samen", status: "scheduled" },
  { id: "mon-r6-4", night: "monday", division: "A", round: 6, date: "2026-04-26", time: "20:20", court: 1, homeTeam: "mon-goldlink-up", awayTeam: "mon-blue-dragons", status: "scheduled" },

  // --- Round 7 – Monday 04/05/2026 ---
  { id: "mon-r7-1", night: "monday", division: "A", round: 7, date: "2026-05-03", time: "19:00", court: 1, homeTeam: "mon-goldlink-up", awayTeam: "mon-samen", status: "scheduled" },
  { id: "mon-r7-2", night: "monday", division: "A", round: 7, date: "2026-05-03", time: "19:40", court: 1, homeTeam: "mon-afg", awayTeam: "mon-blue-dragons", status: "scheduled" },
  { id: "mon-r7-3", night: "monday", division: "A", round: 7, date: "2026-05-03", time: "19:40", court: 2, homeTeam: "mon-buckle-city", awayTeam: "mon-wildcats", status: "scheduled" },
  { id: "mon-r7-4", night: "monday", division: "A", round: 7, date: "2026-05-03", time: "20:20", court: 1, homeTeam: "mon-misfits", awayTeam: "mon-persepolis", status: "scheduled" },

  // --- Round 8 – Monday 11/05/2026 ---
  { id: "mon-r8-1", night: "monday", division: "A", round: 8, date: "2026-05-10", time: "19:00", court: 1, homeTeam: "mon-wildcats", awayTeam: "mon-afg", status: "scheduled" },
  { id: "mon-r8-2", night: "monday", division: "A", round: 8, date: "2026-05-10", time: "19:40", court: 1, homeTeam: "mon-samen", awayTeam: "mon-blue-dragons", status: "scheduled" },
  { id: "mon-r8-3", night: "monday", division: "A", round: 8, date: "2026-05-10", time: "19:40", court: 2, homeTeam: "mon-persepolis", awayTeam: "mon-buckle-city", status: "scheduled" },
  { id: "mon-r8-4", night: "monday", division: "A", round: 8, date: "2026-05-10", time: "20:20", court: 1, homeTeam: "mon-misfits", awayTeam: "mon-goldlink-up", status: "scheduled" },

  // --- Round 9 – Monday 18/05/2026 ---
  { id: "mon-r9-1", night: "monday", division: "A", round: 9, date: "2026-05-17", time: "19:00", court: 1, homeTeam: "mon-goldlink-up", awayTeam: "mon-buckle-city", status: "scheduled" },
  { id: "mon-r9-2", night: "monday", division: "A", round: 9, date: "2026-05-17", time: "19:40", court: 1, homeTeam: "mon-samen", awayTeam: "mon-afg", status: "scheduled" },
  { id: "mon-r9-3", night: "monday", division: "A", round: 9, date: "2026-05-17", time: "19:40", court: 2, homeTeam: "mon-persepolis", awayTeam: "mon-wildcats", status: "scheduled" },
  { id: "mon-r9-4", night: "monday", division: "A", round: 9, date: "2026-05-17", time: "20:20", court: 1, homeTeam: "mon-misfits", awayTeam: "mon-blue-dragons", status: "scheduled" },

  // --- Round 10 – Monday 25/05/2026 ---
  { id: "mon-r10-1", night: "monday", division: "A", round: 10, date: "2026-05-24", time: "19:00", court: 1, homeTeam: "mon-persepolis", awayTeam: "mon-afg", status: "scheduled" },
  { id: "mon-r10-2", night: "monday", division: "A", round: 10, date: "2026-05-24", time: "19:40", court: 1, homeTeam: "mon-misfits", awayTeam: "mon-samen", status: "scheduled" },
  { id: "mon-r10-3", night: "monday", division: "A", round: 10, date: "2026-05-24", time: "19:40", court: 2, homeTeam: "mon-buckle-city", awayTeam: "mon-blue-dragons", status: "scheduled" },
  { id: "mon-r10-4", night: "monday", division: "A", round: 10, date: "2026-05-24", time: "20:20", court: 1, homeTeam: "mon-goldlink-up", awayTeam: "mon-wildcats", status: "scheduled" },

  // --- Round 11 – Monday 01/06/2026 ---
  { id: "mon-r11-1", night: "monday", division: "A", round: 11, date: "2026-05-31", time: "19:00", court: 1, homeTeam: "mon-goldlink-up", awayTeam: "mon-persepolis", status: "scheduled" },
  { id: "mon-r11-2", night: "monday", division: "A", round: 11, date: "2026-05-31", time: "19:40", court: 1, homeTeam: "mon-misfits", awayTeam: "mon-afg", status: "scheduled" },
  { id: "mon-r11-3", night: "monday", division: "A", round: 11, date: "2026-05-31", time: "19:40", court: 2, homeTeam: "mon-buckle-city", awayTeam: "mon-samen", status: "scheduled" },
  { id: "mon-r11-4", night: "monday", division: "A", round: 11, date: "2026-05-31", time: "20:20", court: 1, homeTeam: "mon-blue-dragons", awayTeam: "mon-wildcats", status: "scheduled" },

  // --- Round 12 – Monday 08/06/2026 ---
  { id: "mon-r12-1", night: "monday", division: "A", round: 12, date: "2026-06-07", time: "19:00", court: 1, homeTeam: "mon-buckle-city", awayTeam: "mon-misfits", status: "scheduled" },
  { id: "mon-r12-2", night: "monday", division: "A", round: 12, date: "2026-06-07", time: "19:40", court: 1, homeTeam: "mon-blue-dragons", awayTeam: "mon-persepolis", status: "scheduled" },
  { id: "mon-r12-3", night: "monday", division: "A", round: 12, date: "2026-06-07", time: "19:40", court: 2, homeTeam: "mon-wildcats", awayTeam: "mon-samen", status: "scheduled" },
  { id: "mon-r12-4", night: "monday", division: "A", round: 12, date: "2026-06-07", time: "20:20", court: 1, homeTeam: "mon-goldlink-up", awayTeam: "mon-afg", status: "scheduled" },

  // --- Round 13 – Monday 15/06/2026 ---
  { id: "mon-r13-1", night: "monday", division: "A", round: 13, date: "2026-06-14", time: "19:00", court: 1, homeTeam: "mon-blue-dragons", awayTeam: "mon-goldlink-up", status: "scheduled" },
  { id: "mon-r13-2", night: "monday", division: "A", round: 13, date: "2026-06-14", time: "19:40", court: 1, homeTeam: "mon-buckle-city", awayTeam: "mon-afg", status: "scheduled" },
  { id: "mon-r13-3", night: "monday", division: "A", round: 13, date: "2026-06-14", time: "19:40", court: 2, homeTeam: "mon-wildcats", awayTeam: "mon-misfits", status: "scheduled" },
  { id: "mon-r13-4", night: "monday", division: "A", round: 13, date: "2026-06-14", time: "20:20", court: 1, homeTeam: "mon-samen", awayTeam: "mon-persepolis", status: "scheduled" },

  // --- Round 14 – Monday 22/06/2026 ---
  { id: "mon-r14-1", night: "monday", division: "A", round: 14, date: "2026-06-21", time: "19:00", court: 1, homeTeam: "mon-blue-dragons", awayTeam: "mon-afg", status: "scheduled" },
  { id: "mon-r14-2", night: "monday", division: "A", round: 14, date: "2026-06-21", time: "19:40", court: 1, homeTeam: "mon-wildcats", awayTeam: "mon-buckle-city", status: "scheduled" },
  { id: "mon-r14-3", night: "monday", division: "A", round: 14, date: "2026-06-21", time: "19:40", court: 2, homeTeam: "mon-persepolis", awayTeam: "mon-misfits", status: "scheduled" },
  { id: "mon-r14-4", night: "monday", division: "A", round: 14, date: "2026-06-21", time: "20:20", court: 1, homeTeam: "mon-samen", awayTeam: "mon-goldlink-up", status: "scheduled" },


  // ============================================================
  // WEDNESDAY NIGHT – DIV A (18 rounds, 10 teams round-robin x2)
  // ============================================================

  // --- Round 1 – Wednesday 25/03/2026 ---
  { id: "wed-r1-1", night: "wednesday", division: "A", round: 1, date: "2026-03-25", time: "19:00", court: 1, homeTeam: "wed-misfits", awayTeam: "wed-afg", homeScore: 11, awayScore: 8, status: "completed" },
  { id: "wed-r1-2", night: "wednesday", division: "A", round: 1, date: "2026-03-25", time: "19:40", court: 1, homeTeam: "wed-goldlink-up", awayTeam: "wed-pops", homeScore: 11, awayScore: 9, status: "completed" },
  { id: "wed-r1-3", night: "wednesday", division: "A", round: 1, date: "2026-03-25", time: "19:40", court: 2, homeTeam: "wed-wildcats", awayTeam: "wed-rinnai", homeScore: 10, awayScore: 5, status: "completed" },
  { id: "wed-r1-4", night: "wednesday", division: "A", round: 1, date: "2026-03-25", time: "20:20", court: 1, homeTeam: "wed-persepolis", awayTeam: "wed-buckle-city", homeScore: 5, awayScore: 4, status: "completed" },
  { id: "wed-r1-5", night: "wednesday", division: "A", round: 1, date: "2026-03-25", time: "20:20", court: 2, homeTeam: "wed-samen", awayTeam: "wed-unathletico", homeScore: 9, awayScore: 3, status: "completed" },

  // --- Round 2 – Wednesday 01/04/2026 ---
  { id: "wed-r2-1", night: "wednesday", division: "A", round: 2, date: "2026-03-31", time: "19:00", court: 1, homeTeam: "wed-afg", awayTeam: "wed-unathletico", status: "scheduled" },
  { id: "wed-r2-2", night: "wednesday", division: "A", round: 2, date: "2026-03-31", time: "19:40", court: 1, homeTeam: "wed-wildcats", awayTeam: "wed-samen", status: "scheduled" },
  { id: "wed-r2-3", night: "wednesday", division: "A", round: 2, date: "2026-03-31", time: "19:40", court: 2, homeTeam: "wed-buckle-city", awayTeam: "wed-rinnai", status: "scheduled" },
  { id: "wed-r2-4", night: "wednesday", division: "A", round: 2, date: "2026-03-31", time: "20:20", court: 1, homeTeam: "wed-goldlink-up", awayTeam: "wed-pops", status: "scheduled" },
  { id: "wed-r2-5", night: "wednesday", division: "A", round: 2, date: "2026-03-31", time: "20:20", court: 2, homeTeam: "wed-misfits", awayTeam: "wed-persepolis", status: "scheduled" },

  // --- Round 3 – Wednesday 08/04/2026 ---
  { id: "wed-r3-1", night: "wednesday", division: "A", round: 3, date: "2026-04-07", time: "19:00", court: 1, homeTeam: "wed-afg", awayTeam: "wed-samen", status: "scheduled" },
  { id: "wed-r3-2", night: "wednesday", division: "A", round: 3, date: "2026-04-07", time: "19:40", court: 1, homeTeam: "wed-unathletico", awayTeam: "wed-rinnai", status: "scheduled" },
  { id: "wed-r3-3", night: "wednesday", division: "A", round: 3, date: "2026-04-07", time: "19:40", court: 2, homeTeam: "wed-wildcats", awayTeam: "wed-pops", status: "scheduled" },
  { id: "wed-r3-4", night: "wednesday", division: "A", round: 3, date: "2026-04-07", time: "20:20", court: 1, homeTeam: "wed-buckle-city", awayTeam: "wed-persepolis", status: "scheduled" },
  { id: "wed-r3-5", night: "wednesday", division: "A", round: 3, date: "2026-04-07", time: "20:20", court: 2, homeTeam: "wed-goldlink-up", awayTeam: "wed-misfits", status: "scheduled" },

  // --- Round 4 – Wednesday 15/04/2026 ---
  { id: "wed-r4-1", night: "wednesday", division: "A", round: 4, date: "2026-04-14", time: "19:00", court: 1, homeTeam: "wed-afg", awayTeam: "wed-rinnai", status: "scheduled" },
  { id: "wed-r4-2", night: "wednesday", division: "A", round: 4, date: "2026-04-14", time: "19:40", court: 1, homeTeam: "wed-samen", awayTeam: "wed-pops", status: "scheduled" },
  { id: "wed-r4-3", night: "wednesday", division: "A", round: 4, date: "2026-04-14", time: "19:40", court: 2, homeTeam: "wed-unathletico", awayTeam: "wed-persepolis", status: "scheduled" },
  { id: "wed-r4-4", night: "wednesday", division: "A", round: 4, date: "2026-04-14", time: "20:20", court: 1, homeTeam: "wed-wildcats", awayTeam: "wed-misfits", status: "scheduled" },
  { id: "wed-r4-5", night: "wednesday", division: "A", round: 4, date: "2026-04-14", time: "20:20", court: 2, homeTeam: "wed-buckle-city", awayTeam: "wed-goldlink-up", status: "scheduled" },

  // --- Round 5 – Wednesday 22/04/2026 ---
  { id: "wed-r5-1", night: "wednesday", division: "A", round: 5, date: "2026-04-21", time: "19:00", court: 1, homeTeam: "wed-afg", awayTeam: "wed-pops", status: "scheduled" },
  { id: "wed-r5-2", night: "wednesday", division: "A", round: 5, date: "2026-04-21", time: "19:40", court: 1, homeTeam: "wed-rinnai", awayTeam: "wed-persepolis", status: "scheduled" },
  { id: "wed-r5-3", night: "wednesday", division: "A", round: 5, date: "2026-04-21", time: "19:40", court: 2, homeTeam: "wed-samen", awayTeam: "wed-misfits", status: "scheduled" },
  { id: "wed-r5-4", night: "wednesday", division: "A", round: 5, date: "2026-04-21", time: "20:20", court: 1, homeTeam: "wed-unathletico", awayTeam: "wed-goldlink-up", status: "scheduled" },
  { id: "wed-r5-5", night: "wednesday", division: "A", round: 5, date: "2026-04-21", time: "20:20", court: 2, homeTeam: "wed-wildcats", awayTeam: "wed-buckle-city", status: "scheduled" },

  // --- Round 6 – Wednesday 29/04/2026 ---
  { id: "wed-r6-1", night: "wednesday", division: "A", round: 6, date: "2026-04-28", time: "19:00", court: 1, homeTeam: "wed-afg", awayTeam: "wed-persepolis", status: "scheduled" },
  { id: "wed-r6-2", night: "wednesday", division: "A", round: 6, date: "2026-04-28", time: "19:40", court: 1, homeTeam: "wed-pops", awayTeam: "wed-misfits", status: "scheduled" },
  { id: "wed-r6-3", night: "wednesday", division: "A", round: 6, date: "2026-04-28", time: "19:40", court: 2, homeTeam: "wed-rinnai", awayTeam: "wed-goldlink-up", status: "scheduled" },
  { id: "wed-r6-4", night: "wednesday", division: "A", round: 6, date: "2026-04-28", time: "20:20", court: 1, homeTeam: "wed-samen", awayTeam: "wed-buckle-city", status: "scheduled" },
  { id: "wed-r6-5", night: "wednesday", division: "A", round: 6, date: "2026-04-28", time: "20:20", court: 2, homeTeam: "wed-unathletico", awayTeam: "wed-wildcats", status: "scheduled" },

  // --- Round 7 – Wednesday 06/05/2026 ---
  { id: "wed-r7-1", night: "wednesday", division: "A", round: 7, date: "2026-05-05", time: "19:00", court: 1, homeTeam: "wed-afg", awayTeam: "wed-misfits", status: "scheduled" },
  { id: "wed-r7-2", night: "wednesday", division: "A", round: 7, date: "2026-05-05", time: "19:40", court: 1, homeTeam: "wed-persepolis", awayTeam: "wed-goldlink-up", status: "scheduled" },
  { id: "wed-r7-3", night: "wednesday", division: "A", round: 7, date: "2026-05-05", time: "19:40", court: 2, homeTeam: "wed-pops", awayTeam: "wed-buckle-city", status: "scheduled" },
  { id: "wed-r7-4", night: "wednesday", division: "A", round: 7, date: "2026-05-05", time: "20:20", court: 1, homeTeam: "wed-rinnai", awayTeam: "wed-wildcats", status: "scheduled" },
  { id: "wed-r7-5", night: "wednesday", division: "A", round: 7, date: "2026-05-05", time: "20:20", court: 2, homeTeam: "wed-samen", awayTeam: "wed-unathletico", status: "scheduled" },

  // --- Round 8 – Wednesday 13/05/2026 ---
  { id: "wed-r8-1", night: "wednesday", division: "A", round: 8, date: "2026-05-12", time: "19:00", court: 1, homeTeam: "wed-afg", awayTeam: "wed-goldlink-up", status: "scheduled" },
  { id: "wed-r8-2", night: "wednesday", division: "A", round: 8, date: "2026-05-12", time: "19:40", court: 1, homeTeam: "wed-misfits", awayTeam: "wed-buckle-city", status: "scheduled" },
  { id: "wed-r8-3", night: "wednesday", division: "A", round: 8, date: "2026-05-12", time: "19:40", court: 2, homeTeam: "wed-persepolis", awayTeam: "wed-wildcats", status: "scheduled" },
  { id: "wed-r8-4", night: "wednesday", division: "A", round: 8, date: "2026-05-12", time: "20:20", court: 1, homeTeam: "wed-pops", awayTeam: "wed-unathletico", status: "scheduled" },
  { id: "wed-r8-5", night: "wednesday", division: "A", round: 8, date: "2026-05-12", time: "20:20", court: 2, homeTeam: "wed-rinnai", awayTeam: "wed-samen", status: "scheduled" },

  // --- Round 9 – Wednesday 20/05/2026 ---
  { id: "wed-r9-1", night: "wednesday", division: "A", round: 9, date: "2026-05-19", time: "19:00", court: 1, homeTeam: "wed-afg", awayTeam: "wed-buckle-city", status: "scheduled" },
  { id: "wed-r9-2", night: "wednesday", division: "A", round: 9, date: "2026-05-19", time: "19:40", court: 1, homeTeam: "wed-goldlink-up", awayTeam: "wed-wildcats", status: "scheduled" },
  { id: "wed-r9-3", night: "wednesday", division: "A", round: 9, date: "2026-05-19", time: "19:40", court: 2, homeTeam: "wed-misfits", awayTeam: "wed-unathletico", status: "scheduled" },
  { id: "wed-r9-4", night: "wednesday", division: "A", round: 9, date: "2026-05-19", time: "20:20", court: 1, homeTeam: "wed-persepolis", awayTeam: "wed-samen", status: "scheduled" },
  { id: "wed-r9-5", night: "wednesday", division: "A", round: 9, date: "2026-05-19", time: "20:20", court: 2, homeTeam: "wed-pops", awayTeam: "wed-rinnai", status: "scheduled" },

  // --- Round 10 – Wednesday 27/05/2026 ---
  { id: "wed-r10-1", night: "wednesday", division: "A", round: 10, date: "2026-05-26", time: "19:00", court: 1, homeTeam: "wed-wildcats", awayTeam: "wed-afg", status: "scheduled" },
  { id: "wed-r10-2", night: "wednesday", division: "A", round: 10, date: "2026-05-26", time: "19:40", court: 1, homeTeam: "wed-unathletico", awayTeam: "wed-buckle-city", status: "scheduled" },
  { id: "wed-r10-3", night: "wednesday", division: "A", round: 10, date: "2026-05-26", time: "19:40", court: 2, homeTeam: "wed-samen", awayTeam: "wed-goldlink-up", status: "scheduled" },
  { id: "wed-r10-4", night: "wednesday", division: "A", round: 10, date: "2026-05-26", time: "20:20", court: 1, homeTeam: "wed-rinnai", awayTeam: "wed-misfits", status: "scheduled" },
  { id: "wed-r10-5", night: "wednesday", division: "A", round: 10, date: "2026-05-26", time: "20:20", court: 2, homeTeam: "wed-pops", awayTeam: "wed-persepolis", status: "scheduled" },

  // --- Round 11 – Wednesday 03/06/2026 ---
  { id: "wed-r11-1", night: "wednesday", division: "A", round: 11, date: "2026-06-02", time: "19:00", court: 1, homeTeam: "wed-unathletico", awayTeam: "wed-afg", status: "scheduled" },
  { id: "wed-r11-2", night: "wednesday", division: "A", round: 11, date: "2026-06-02", time: "19:40", court: 1, homeTeam: "wed-samen", awayTeam: "wed-wildcats", status: "scheduled" },
  { id: "wed-r11-3", night: "wednesday", division: "A", round: 11, date: "2026-06-02", time: "19:40", court: 2, homeTeam: "wed-rinnai", awayTeam: "wed-buckle-city", status: "scheduled" },
  { id: "wed-r11-4", night: "wednesday", division: "A", round: 11, date: "2026-06-02", time: "20:20", court: 1, homeTeam: "wed-pops", awayTeam: "wed-goldlink-up", status: "scheduled" },
  { id: "wed-r11-5", night: "wednesday", division: "A", round: 11, date: "2026-06-02", time: "20:20", court: 2, homeTeam: "wed-persepolis", awayTeam: "wed-misfits", status: "scheduled" },

  // --- Round 12 – Wednesday 10/06/2026 ---
  { id: "wed-r12-1", night: "wednesday", division: "A", round: 12, date: "2026-06-09", time: "19:00", court: 1, homeTeam: "wed-samen", awayTeam: "wed-afg", status: "scheduled" },
  { id: "wed-r12-2", night: "wednesday", division: "A", round: 12, date: "2026-06-09", time: "19:40", court: 1, homeTeam: "wed-rinnai", awayTeam: "wed-unathletico", status: "scheduled" },
  { id: "wed-r12-3", night: "wednesday", division: "A", round: 12, date: "2026-06-09", time: "19:40", court: 2, homeTeam: "wed-pops", awayTeam: "wed-wildcats", status: "scheduled" },
  { id: "wed-r12-4", night: "wednesday", division: "A", round: 12, date: "2026-06-09", time: "20:20", court: 1, homeTeam: "wed-persepolis", awayTeam: "wed-buckle-city", status: "scheduled" },
  { id: "wed-r12-5", night: "wednesday", division: "A", round: 12, date: "2026-06-09", time: "20:20", court: 2, homeTeam: "wed-misfits", awayTeam: "wed-goldlink-up", status: "scheduled" },

  // --- Round 13 – Wednesday 17/06/2026 ---
  { id: "wed-r13-1", night: "wednesday", division: "A", round: 13, date: "2026-06-16", time: "19:00", court: 1, homeTeam: "wed-rinnai", awayTeam: "wed-afg", status: "scheduled" },
  { id: "wed-r13-2", night: "wednesday", division: "A", round: 13, date: "2026-06-16", time: "19:40", court: 1, homeTeam: "wed-pops", awayTeam: "wed-samen", status: "scheduled" },
  { id: "wed-r13-3", night: "wednesday", division: "A", round: 13, date: "2026-06-16", time: "19:40", court: 2, homeTeam: "wed-persepolis", awayTeam: "wed-unathletico", status: "scheduled" },
  { id: "wed-r13-4", night: "wednesday", division: "A", round: 13, date: "2026-06-16", time: "20:20", court: 1, homeTeam: "wed-misfits", awayTeam: "wed-wildcats", status: "scheduled" },
  { id: "wed-r13-5", night: "wednesday", division: "A", round: 13, date: "2026-06-16", time: "20:20", court: 2, homeTeam: "wed-goldlink-up", awayTeam: "wed-buckle-city", status: "scheduled" },

  // --- Round 14 – Wednesday 24/06/2026 ---
  { id: "wed-r14-1", night: "wednesday", division: "A", round: 14, date: "2026-06-23", time: "19:00", court: 1, homeTeam: "wed-pops", awayTeam: "wed-afg", status: "scheduled" },
  { id: "wed-r14-2", night: "wednesday", division: "A", round: 14, date: "2026-06-23", time: "19:40", court: 1, homeTeam: "wed-persepolis", awayTeam: "wed-rinnai", status: "scheduled" },
  { id: "wed-r14-3", night: "wednesday", division: "A", round: 14, date: "2026-06-23", time: "19:40", court: 2, homeTeam: "wed-misfits", awayTeam: "wed-samen", status: "scheduled" },
  { id: "wed-r14-4", night: "wednesday", division: "A", round: 14, date: "2026-06-23", time: "20:20", court: 1, homeTeam: "wed-goldlink-up", awayTeam: "wed-unathletico", status: "scheduled" },
  { id: "wed-r14-5", night: "wednesday", division: "A", round: 14, date: "2026-06-23", time: "20:20", court: 2, homeTeam: "wed-buckle-city", awayTeam: "wed-wildcats", status: "scheduled" },

  // --- Round 15 – Wednesday 01/07/2026 ---
  { id: "wed-r15-1", night: "wednesday", division: "A", round: 15, date: "2026-06-30", time: "19:00", court: 1, homeTeam: "wed-persepolis", awayTeam: "wed-afg", status: "scheduled" },
  { id: "wed-r15-2", night: "wednesday", division: "A", round: 15, date: "2026-06-30", time: "19:40", court: 1, homeTeam: "wed-misfits", awayTeam: "wed-pops", status: "scheduled" },
  { id: "wed-r15-3", night: "wednesday", division: "A", round: 15, date: "2026-06-30", time: "19:40", court: 2, homeTeam: "wed-goldlink-up", awayTeam: "wed-rinnai", status: "scheduled" },
  { id: "wed-r15-4", night: "wednesday", division: "A", round: 15, date: "2026-06-30", time: "20:20", court: 1, homeTeam: "wed-buckle-city", awayTeam: "wed-samen", status: "scheduled" },
  { id: "wed-r15-5", night: "wednesday", division: "A", round: 15, date: "2026-06-30", time: "20:20", court: 2, homeTeam: "wed-wildcats", awayTeam: "wed-unathletico", status: "scheduled" },

  // --- Round 16 – Wednesday 08/07/2026 ---
  { id: "wed-r16-1", night: "wednesday", division: "A", round: 16, date: "2026-07-07", time: "19:00", court: 1, homeTeam: "wed-misfits", awayTeam: "wed-afg", status: "scheduled" },
  { id: "wed-r16-2", night: "wednesday", division: "A", round: 16, date: "2026-07-07", time: "19:40", court: 1, homeTeam: "wed-goldlink-up", awayTeam: "wed-persepolis", status: "scheduled" },
  { id: "wed-r16-3", night: "wednesday", division: "A", round: 16, date: "2026-07-07", time: "19:40", court: 2, homeTeam: "wed-buckle-city", awayTeam: "wed-pops", status: "scheduled" },
  { id: "wed-r16-4", night: "wednesday", division: "A", round: 16, date: "2026-07-07", time: "20:20", court: 1, homeTeam: "wed-wildcats", awayTeam: "wed-rinnai", status: "scheduled" },
  { id: "wed-r16-5", night: "wednesday", division: "A", round: 16, date: "2026-07-07", time: "20:20", court: 2, homeTeam: "wed-unathletico", awayTeam: "wed-samen", status: "scheduled" },

  // --- Round 17 – Wednesday 15/07/2026 ---
  { id: "wed-r17-1", night: "wednesday", division: "A", round: 17, date: "2026-07-14", time: "19:00", court: 1, homeTeam: "wed-goldlink-up", awayTeam: "wed-afg", status: "scheduled" },
  { id: "wed-r17-2", night: "wednesday", division: "A", round: 17, date: "2026-07-14", time: "19:40", court: 1, homeTeam: "wed-buckle-city", awayTeam: "wed-misfits", status: "scheduled" },
  { id: "wed-r17-3", night: "wednesday", division: "A", round: 17, date: "2026-07-14", time: "19:40", court: 2, homeTeam: "wed-wildcats", awayTeam: "wed-persepolis", status: "scheduled" },
  { id: "wed-r17-4", night: "wednesday", division: "A", round: 17, date: "2026-07-14", time: "20:20", court: 1, homeTeam: "wed-unathletico", awayTeam: "wed-pops", status: "scheduled" },
  { id: "wed-r17-5", night: "wednesday", division: "A", round: 17, date: "2026-07-14", time: "20:20", court: 2, homeTeam: "wed-samen", awayTeam: "wed-rinnai", status: "scheduled" },

  // --- Round 18 – Wednesday 22/07/2026 ---
  { id: "wed-r18-1", night: "wednesday", division: "A", round: 18, date: "2026-07-21", time: "19:00", court: 1, homeTeam: "wed-buckle-city", awayTeam: "wed-afg", status: "scheduled" },
  { id: "wed-r18-2", night: "wednesday", division: "A", round: 18, date: "2026-07-21", time: "19:40", court: 1, homeTeam: "wed-wildcats", awayTeam: "wed-goldlink-up", status: "scheduled" },
  { id: "wed-r18-3", night: "wednesday", division: "A", round: 18, date: "2026-07-21", time: "19:40", court: 2, homeTeam: "wed-unathletico", awayTeam: "wed-misfits", status: "scheduled" },
  { id: "wed-r18-4", night: "wednesday", division: "A", round: 18, date: "2026-07-21", time: "20:20", court: 1, homeTeam: "wed-samen", awayTeam: "wed-persepolis", status: "scheduled" },
  { id: "wed-r18-5", night: "wednesday", division: "A", round: 18, date: "2026-07-21", time: "20:20", court: 2, homeTeam: "wed-rinnai", awayTeam: "wed-pops", status: "scheduled" },

];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

export function getTeamsByNight(night: CompetitionNight) {
  return teams.filter((t) => t.night === night);
}

export function getFixturesByNight(night: CompetitionNight) {
  return fixtures.filter((f) => f.night === night);
}

export function getTeamName(teamId: string): string {
  return teams.find((t) => t.id === teamId)?.name ?? teamId;
}

export function getCompletedFixtures(night: CompetitionNight) {
  return fixtures
    .filter((f) => f.night === night && f.status === "completed")
    .sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time));
}

export function getUpcomingFixtures(night: CompetitionNight) {
  return fixtures
    .filter((f) => f.night === night && f.status === "scheduled")
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
}

export function getFixturesByRound(night: CompetitionNight, round: number) {
  return fixtures.filter((f) => f.night === night && f.round === round);
}

export function getAllRounds(night: CompetitionNight): number[] {
  const rounds = new Set(fixtures.filter((f) => f.night === night).map((f) => f.round));
  return Array.from(rounds).sort((a, b) => a - b);
}
