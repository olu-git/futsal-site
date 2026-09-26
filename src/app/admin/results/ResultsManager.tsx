"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { CheckCircle2, RotateCcw, ShieldAlert, X } from "lucide-react";
import TeamKit from "@/components/TeamKit";
import type { AdminFixture, AdminResultVersion } from "@/lib/admin/results-data";
import { compareAdminFixtures } from "@/lib/admin/results-data";
import type { ResultInput, ResultIntent, Side } from "@/lib/admin/results-rules";
import { mutateResult } from "./actions";
import { shouldCloseResultPanel, transitionResultPanel } from "@/lib/admin/mobile-interactions";

type StatusFilter = "all" | "none" | "draft" | "pending_review" | "published";
type FormState = ResultInput & { isCorrection: boolean };

function published(fixture: AdminFixture) { return fixture.results.find((result) => result.status === "published"); }
function editable(fixture: AdminFixture) {
  return fixture.results.find((result) => result.status === "draft" || result.status === "pending_review") as AdminResultVersion | undefined;
}
function displayStatus(fixture: AdminFixture): StatusFilter {
  const value = editable(fixture)?.status;
  return value === "draft" || value === "pending_review" ? value : published(fixture) ? "published" : "none";
}
function titleStatus(status: StatusFilter) {
  return status === "none" ? "No Result" : status === "pending_review" ? "Pending Review" : status[0].toUpperCase() + status.slice(1);
}
function initialForm(fixture: AdminFixture, correction = false): FormState {
  const source = correction ? published(fixture) : editable(fixture);
  return { fixtureId: fixture.id, resultId: correction ? null : source?.id ?? null,
    supersedesResultId: correction ? source?.id ?? null : source?.supersedesResultId ?? null,
    correctionReason: correction ? "" : source?.correctionReason ?? "", homeScore: source?.homeScore ?? null,
    awayScore: source?.awayScore ?? null, forfeitSide: source?.forfeitSide ?? null,
    forfeitExceptionReason: source?.forfeitExceptionReason ?? "", penaltyHomeScore: source?.penaltyHomeScore ?? null,
    penaltyAwayScore: source?.penaltyAwayScore ?? null, penaltyWinner: source?.penaltyWinner ?? null, isCorrection: correction };
}

export default function ResultsManager({ fixtures, onChanged }: { fixtures: AdminFixture[]; onChanged(): Promise<void> }) {
  const [night, setNight] = useState<"monday" | "wednesday">("monday");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [round, setRound] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const [isPhone, setIsPhone] = useState(false);
  const panelRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const selectedButtonRef = useRef<HTMLButtonElement | null>(null);
  const nightFixtures = fixtures.filter((fixture) => fixture.night === night);
  const rounds = [...new Set(nightFixtures.map((fixture) => fixture.round))].sort((a, b) => b - a);
  const visible = nightFixtures.filter((fixture) => (status === "all" || displayStatus(fixture) === status) && (round === "all" || fixture.round === Number(round))).sort(compareAdminFixtures);
  const grouped = Map.groupBy(visible, (fixture) => fixture.round);
  const selected = fixtures.find((fixture) => fixture.id === selectedId) ?? null;
  const season = nightFixtures[0]?.seasonName ?? "Current season";

  useEffect(() => {
    const query = window.matchMedia("(max-width: 620px)");
    const update = () => setIsPhone(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const closeDirectly = useCallback(() => {
    const next = transitionResultPanel({ selectedId, published: Boolean(selected && published(selected)) }, { type: "close" });
    setSelectedId(next.selectedId);
    setForm(null);
  }, [selected, selectedId]);

  const requestClose = useCallback(() => {
    if (window.history.state?.fisResultSheet) window.history.back();
    else closeDirectly();
  }, [closeDirectly]);

  useEffect(() => {
    if (!isPhone || !selectedId) return;
    const scrollY = window.scrollY;
    const body = document.body;
    const previous = selectedButtonRef.current;
    const original = { position: body.style.position, top: body.style.top, width: body.style.width, overflow: body.style.overflow };
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    body.style.overflow = "hidden";
    const background = [...document.querySelectorAll<HTMLElement>(".site-header, .site-footer, .admin-mobile-bar, .admin-sidebar, .admin-results-heading, .admin-finals-notice, .admin-results-list")];
    background.forEach((element) => { element.inert = true; });
    closeButtonRef.current?.focus();

    function onPopState() { closeDirectly(); }
    function onKeyDown(event: KeyboardEvent) {
      if (shouldCloseResultPanel(event.key)) { event.preventDefault(); requestClose(); return; }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = [...panelRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href]')];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }

    window.addEventListener("popstate", onPopState);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("popstate", onPopState);
      document.removeEventListener("keydown", onKeyDown);
      background.forEach((element) => { element.inert = false; });
      body.style.position = original.position;
      body.style.top = original.top;
      body.style.width = original.width;
      body.style.overflow = original.overflow;
      window.scrollTo(0, scrollY);
      previous?.focus({ preventScroll: true });
    };
  }, [closeDirectly, isPhone, requestClose, selectedId]);

  function choose(fixture: AdminFixture, button: HTMLButtonElement) {
    selectedButtonRef.current = button;
    if (isPhone && !selectedId) window.history.pushState({ ...window.history.state, fisResultSheet: true }, "", window.location.href);
    const next = transitionResultPanel({ selectedId, published: Boolean(selected && published(selected)) }, { type: "select", fixtureId: fixture.id, published: Boolean(published(fixture)) });
    setSelectedId(next.selectedId); setForm(initialForm(fixture)); setMessage(null);
  }
  function changeNight(value: "monday" | "wednesday") {
    setNight(value); setRound("all"); setSelectedId(null); setForm(null); setMessage(null);
  }
  function setForfeit(side: Side | null) {
    if (!form) return;
    setForm({ ...form, forfeitSide: side, homeScore: side === "home" ? 0 : side === "away" ? 5 : form.homeScore,
      awayScore: side === "home" ? 5 : side === "away" ? 0 : form.awayScore, forfeitExceptionReason: "" });
  }
  function submit(intent: ResultIntent) {
    if (!form) return;
    if (intent === "publish" && !window.confirm("Publish this result now? It will immediately become the public result.")) return;
    setMessage(null);
    startTransition(async () => {
      const input: ResultInput = form;
      const response = await mutateResult(input, intent);
      setMessage({ type: response.ok ? "success" : "error", text: response.message });
      if (response.ok) {
        if (intent === "publish") requestClose();
        else setForm((current) => current ? { ...current, resultId: response.id } : current);
        await onChanged();
      }
    });
  }

  return (
    <>
      <div className="admin-results-heading">
        <div><p className="eyebrow">Results</p><h2>Result management</h2><p>{season}</p></div>
        <Link className="admin-back-link" href="/admin">Return to dashboard</Link>
      </div>
      <div className="admin-finals-notice"><ShieldAlert aria-hidden="true" />Current finals remain managed through the existing JSON workflow.</div>
      {message && <p className={`admin-action-message ${message.type}`} role="status">{message.type === "success" && <CheckCircle2 />}{message.text}</p>}
      <div className="admin-results-layout">
        <div className="admin-results-list">
          <div className="admin-night-tabs" aria-label="Competition night">
            {(["monday", "wednesday"] as const).map((value) => <button aria-pressed={night === value} key={value} onClick={() => changeNight(value)}>{value} night</button>)}
          </div>
          <div className="admin-result-filters">
            <label>Status<select value={status} onChange={(event) => setStatus(event.target.value as StatusFilter)}>
              <option value="all">All statuses</option><option value="none">No Result</option><option value="draft">Draft</option>
              <option value="pending_review">Pending Review</option><option value="published">Published</option>
            </select></label>
            <label>Round<select value={round} onChange={(event) => setRound(event.target.value)}><option value="all">All rounds</option>{rounds.map((value) => <option value={value} key={value}>Round {value}</option>)}</select></label>
          </div>
          {[...grouped.entries()].sort(([a], [b]) => b - a).map(([roundNumber, items]) => (
            <section className="admin-result-round" key={roundNumber}>
              <h3>Round {roundNumber}</h3>
              {items.map((fixture) => {
                const current = published(fixture); const workflow = editable(fixture); const fixtureStatus = displayStatus(fixture);
                return <button className="admin-result-row" aria-pressed={selectedId === fixture.id} key={fixture.id} onClick={(event) => choose(fixture, event.currentTarget)}>
                  <span className="admin-result-date">{new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "short" }).format(new Date(`${fixture.date}T00:00:00`))}<small>{fixture.time.slice(0, 5)} · Court {fixture.court}</small></span>
                  <span className="admin-result-teams"><span><TeamKit colour={fixture.home.kitColour ?? "#003b9b"} />{fixture.home.name}</span><span><TeamKit colour={fixture.away.kitColour ?? "#003b9b"} />{fixture.away.name}</span></span>
                  <span className="admin-result-score">{current?.homeScore ?? workflow?.homeScore ?? "-"}<br />{current?.awayScore ?? workflow?.awayScore ?? "-"}</span>
                  <span className={`admin-status admin-status-${fixtureStatus}`}>{titleStatus(fixtureStatus)}</span>
                  {(current?.forfeitSide || workflow?.forfeitSide) && <span className="admin-result-flag">Forfeit</span>}
                  {fixture.results.some((result) => result.status === "superseded" || result.supersedesResultId) && <span className="admin-result-flag">Corrected</span>}
                </button>;
              })}
            </section>
          ))}
          {!visible.length && <p className="admin-empty">No fixtures match these filters.</p>}
        </div>
        {selected && form ? <aside className={`admin-score-panel${isPhone ? " admin-score-sheet" : ""}`} aria-label="Result management" aria-labelledby="result-panel-title" aria-modal={isPhone || undefined} role={isPhone ? "dialog" : undefined} ref={panelRef}>
          <button className="admin-panel-close" ref={closeButtonRef} onClick={requestClose} aria-label="Close result management"><X /></button>
          <p className="eyebrow">Round {selected.round} · {selected.date}</p>
          <h3 id="result-panel-title">{selected.home.name} <span>v</span> {selected.away.name}</h3>
          <p>{selected.time.slice(0, 5)} · Court {selected.court}</p>
          {published(selected) && !form.isCorrection && !editable(selected) ? <PublishedSummary fixture={selected} onCorrect={() => setForm(initialForm(selected, true))} /> : <>
            {form.isCorrection && <div className="admin-correction-banner"><RotateCcw />Correction draft</div>}
            <div className="admin-score-fields">
              <ScoreField label={selected.home.name} value={form.homeScore} onChange={(homeScore) => setForm({ ...form, homeScore })} />
              <span>–</span>
              <ScoreField label={selected.away.name} value={form.awayScore} onChange={(awayScore) => setForm({ ...form, awayScore })} />
            </div>
            <fieldset className="admin-forfeit"><legend>Forfeit</legend>
              <label><input type="radio" checked={!form.forfeitSide} onChange={() => setForfeit(null)} />No forfeit</label>
              <label><input type="radio" checked={form.forfeitSide === "home"} onChange={() => setForfeit("home")} />{selected.home.name}</label>
              <label><input type="radio" checked={form.forfeitSide === "away"} onChange={() => setForfeit("away")} />{selected.away.name}</label>
            </fieldset>
            {form.forfeitSide && !((form.forfeitSide === "home" && form.homeScore === 0 && form.awayScore === 5) || (form.forfeitSide === "away" && form.homeScore === 5 && form.awayScore === 0)) &&
              <TextField label="Forfeit score exception reason" value={form.forfeitExceptionReason ?? ""} onChange={(forfeitExceptionReason) => setForm({ ...form, forfeitExceptionReason })} />}
            {form.isCorrection && <TextField label="Correction reason" value={form.correctionReason ?? ""} onChange={(correctionReason) => setForm({ ...form, correctionReason })} />}
            {selected.stage === "knockout" && <div className="admin-penalties"><h4>Penalty shootout</h4></div>}
            <div className="admin-result-actions"><button disabled={pending} onClick={() => submit("draft")}>Save Draft</button><button disabled={pending} onClick={() => submit("pending_review")}>Ready for Review</button><button className="primary" disabled={pending} onClick={() => submit("publish")}>Publish Now</button></div>
          </>}
          <RevisionHistory results={selected.results} />
        </aside> : !isPhone && <aside className="admin-score-panel admin-score-panel-empty"><p>Select a fixture to view or manage its result.</p></aside>}
      </div>
    </>
  );
}

function ScoreField({ label, value, onChange }: { label: string; value: number | null | undefined; onChange(value: number | null): void }) {
  return <label><span>{label}</span><input type="number" min="0" step="1" inputMode="numeric" value={value ?? ""} onChange={(event) => onChange(event.target.value === "" ? null : Number(event.target.value))} /></label>;
}
function TextField({ label, value, onChange }: { label: string; value: string; onChange(value: string): void }) {
  return <label className="admin-text-field"><span>{label}</span><textarea value={value} onChange={(event) => onChange(event.target.value)} /></label>;
}
function PublishedSummary({ fixture, onCorrect }: { fixture: AdminFixture; onCorrect(): void }) {
  const result = published(fixture)!;
  return <div className="admin-published-summary"><p>Published score</p><strong>{result.homeScore} – {result.awayScore}</strong>{result.forfeitSide && <span>Forfeit: {result.forfeitSide} team</span>}<button onClick={onCorrect}>Create Correction</button></div>;
}
function RevisionHistory({ results }: { results: AdminResultVersion[] }) {
  return <section className="admin-revision-history"><h4>Revision history</h4>{results.length ? results.map((result) => <article key={result.id}><span>Revision {result.revision}</span><strong>{result.status.replace("_", " ")}</strong><span>{result.homeScore ?? "-"} – {result.awayScore ?? "-"}</span>{result.correctionReason && <p>{result.correctionReason}</p>}</article>) : <p>No revisions yet.</p>}</section>;
}
