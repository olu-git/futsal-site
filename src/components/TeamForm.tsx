import type { FormResult } from "@/lib/team-form";

export default function TeamForm({ name, form, table = false }: { name: string; form: FormResult[]; table?: boolean }) {
  return <span className={`team-form${table ? " table-form" : ""}`} role="list" aria-label={`${name} recent form, oldest to newest`}>
    {form.map((result, index) => <span key={index} role="listitem" className={`form-badge form-${result === "?" ? "unknown" : result.toLowerCase()}`}
      aria-label={`Match ${index + 1} of 5: ${{ W: "Win", D: "Draw", L: "Loss", "?": "No completed match" }[result]}`}>{result}</span>)}
  </span>;
}
