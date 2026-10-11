function parts(name: string) {
  const canonical = name.trim().match(/^(\d{4}) Season (\d+)$/i);
  const legacy = name.trim().match(/^Season (\d+) (\d{4})$/i);
  return canonical ? { year: Number(canonical[1]), season: Number(canonical[2]) }
    : legacy ? { year: Number(legacy[2]), season: Number(legacy[1]) } : undefined;
}

export function seasonDisplayName(name: string) {
  const parsed = parts(name);
  return parsed ? `${parsed.year} Season ${parsed.season}` : name;
}

// Order display options independently of active-edition/default-selection logic.
export function compareSeasonNames(a: string, b: string) {
  const first = parts(a), second = parts(b);
  if (first && second) return second.year - first.year || second.season - first.season;
  if (first || second) return first ? -1 : 1;
  return a.localeCompare(b, "en", { numeric: true });
}
