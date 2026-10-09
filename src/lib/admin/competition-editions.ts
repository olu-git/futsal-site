type Row = Record<string, unknown>;
const relation = (value: unknown): Row => (Array.isArray(value) ? value[0] : value) as Row;

// Keep every division, preferring the active edition just as the public loader does.
export function selectAdminEditions(rows: Row[]): Row[] {
  const selected = new Map<string, Row>();
  const sorted = [...rows].filter(row => [1, 3].includes(Number(relation(row.competitions).weekday)))
    .sort((a, b) => Number(b.lifecycle === "active") - Number(a.lifecycle === "active") ||
      String(relation(b.seasons).ends_on).localeCompare(String(relation(a.seasons).ends_on)));
  for (const row of sorted) {
    const competition = relation(row.competitions);
    const key = `${competition.weekday}:${competition.division}`;
    if (!selected.has(key)) selected.set(key, row);
  }
  return [...selected.values()];
}

// Fixture staging keeps every planned edition alongside the selected public editions.
export function selectFixtureAdminEditions(rows:Row[]):Row[]{
 return [...selectAdminEditions(rows.filter(r=>r.publication_state==="published")),...rows.filter(r=>r.lifecycle==="planned" && [1,3].includes(Number(relation(r.competitions).weekday)))];
}
