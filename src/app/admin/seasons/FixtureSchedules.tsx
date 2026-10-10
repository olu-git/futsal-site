"use client";

import Link from "next/link";
import { seasonFixtureStatus, type SeasonDraft } from "@/lib/admin/seasons";

export default function FixtureSchedules({ draft, pending, dirty, onImport, onRefresh }: {
  draft: SeasonDraft; pending: boolean; dirty: boolean;
  onImport(competitionId: string, file: File): void;
  onRefresh(): void;
}) {
  const terminal = draft.status === "activated" || draft.status === "abandoned";
  return <section className="admin-season-schedules" aria-labelledby="fixture-schedules-title">
    <header><h3 id="fixture-schedules-title">Fixture schedules</h3>
      <p>Prepare and review both schedules before making the season public.</p></header>
    <div className="admin-season-schedule-grid">
      {draft.competitions.filter(c => c.retained).map(c => {
        const state = seasonFixtureStatus(draft, c.id);
        const upload = <label className="admin-season-schedule-upload">
          {state.hasHistory ? "Import replacement schedule" : "Import complete schedule"}
          <input type="file" aria-label={`${c.name}: ${state.hasHistory ? "import replacement schedule" : "import complete schedule"}`}
            accept="application/json,.json" disabled={pending || dirty || terminal || !state.canImport}
            onChange={event => { const file = event.target.files?.[0]; if (file) onImport(c.id, file); event.target.value = ""; }} />
        </label>;
        return <article className="admin-season-schedule-card" key={c.id} aria-label={`${c.name} fixture schedule`}>
          <header><h4>{c.name}</h4>{state.ready && !dirty && <span className="admin-lifecycle-badge is-validated">Ready</span>}</header>
          <p className="admin-season-fixture-count"><strong>{state.fixtureCount}</strong> imported fixtures</p>
          <dl className="admin-season-schedule-status">
            <div><dt>Import</dt><dd>{state.importStatus}</dd></div>
            <div><dt>Review</dt><dd>{state.reviewStatus}</dd></div>
            <div><dt>Validation</dt><dd>{dirty ? "Save changes and validate again" : state.validationStatus}</dd></div>
          </dl>
          {!state.hasHistory && <><p>Choose the complete schedule JSON for this competition.</p>{upload}</>}
          <div className="admin-season-schedule-actions"><Link className="admin-season-review-link" href={`/admin/fixtures/?edition=${encodeURIComponent(c.id)}`}>Review fixtures<span className="visually-hidden"> for {c.name}</span></Link></div>
          {state.hasHistory && !terminal && <details className="admin-season-replacement">
            <summary>Replace schedule</summary>
            {!state.canImport ? <p>Cancel the existing plan in Fixtures before importing a replacement. Then refresh its status here. A replacement must be reviewed and the season validated again.</p> : <p>The previous plan is cancelled. Import the complete replacement, then review it and validate the season again.</p>}
            {upload}
            <button type="button" disabled={pending || dirty} onClick={onRefresh}>Refresh status</button>
          </details>}
        </article>;
      })}
    </div>
  </section>;
}
