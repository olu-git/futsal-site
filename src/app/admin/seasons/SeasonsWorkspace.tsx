"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition, type FormEvent } from "react";
import TeamKit from "@/components/TeamKit";
import {
  abandonSeasonDraft,
  activateSeasonDraft,
  createSeasonDraft,
  saveSeasonDraft,
  validateSeasonDraft,
  stageSeasonDraft,
  importSeasonSchedule,
} from "@/lib/admin/seasons-actions";
import {
  draftCounts,
  seasonDraftDirty,
  seasonStageErrors,
  standingVenueBooking,
  newDraftTeam,
  reviewTeamEdit,
  validateDraft,
  validatePreferences,
  validateSeasonCreateFields,
  validateSeasonDates,
  type DraftTeam,
  type SeasonDraft,
  type SeasonsWorkspace,
} from "@/lib/admin/seasons";

import { loadSeasonDraft } from "@/lib/admin/seasons-data";
import Link from "next/link";

const steps = ["Season details", "Competition structure", "Teams", "Preferences & notes", "Review & activate"];

function nextPreferenceTime(team: DraftTeam) {
  for (const time of ["19:00", "19:40", "20:20", "21:00"]) {
    if (!team.preferences.some((preference) => preference.kickoff_time === time)) return time;
  }
  return "";
}

function PrivateProfileEditor({ team, onChange }: { team: DraftTeam; onChange(team: DraftTeam): void }) {
  const errors = team.copyPrivateProfile ? validatePreferences(team.preferences) : [];
  const updatePreference = (index: number, patch: Partial<DraftTeam["preferences"][number]>) => {
    onChange({ ...team, preferences: team.preferences.map((preference, itemIndex) => itemIndex === index ? { ...preference, ...patch } : preference) });
  };

  return <article className="admin-season-profile-card">
    <header>
      <TeamKit colour={team.kitColour ?? undefined} />
      <div><strong>{team.name}</strong><small>Private scheduling profile</small></div>
      <label className="admin-season-copy-toggle"><input type="checkbox" checked={team.copyPrivateProfile} onChange={(event) => onChange({ ...team, copyPrivateProfile: event.target.checked })} /> Copy preferences and notes</label>
    </header>
    <label><input type="checkbox" checked={team.availabilityConfirmed ?? false} onChange={e => onChange({ ...team, availabilityConfirmed: e.target.checked })} /> Availability and private notes verified with this team</label>
    <p className="admin-private-note">Only administrators can see these scheduling preferences and notes.</p>
    {team.copyPrivateProfile ? <>
      <fieldset className="admin-preference-list">
        <legend>Kick-off preferences</legend>
        {team.preferences.length === 0 && <p className="admin-season-empty">No kick-off preferences recorded.</p>}
        {team.preferences.map((preference, index) => <div className="admin-preference-row" key={`${index}:${preference.kickoff_time}`}>
          <label>Time<input type="time" value={preference.kickoff_time} onChange={(event) => updatePreference(index, { kickoff_time: event.target.value })} /></label>
          <label>Strength<select value={preference.classification} onChange={(event) => updatePreference(index, { classification: event.target.value as DraftTeam["preferences"][number]["classification"] })}><option value="required">Required</option><option value="preferred">Preferred</option><option value="avoid">Avoid</option></select></label>
          <button type="button" onClick={() => onChange({ ...team, preferences: team.preferences.filter((_, itemIndex) => itemIndex !== index) })}>Remove</button>
        </div>)}
      </fieldset>
      {errors.map((error) => <p className="admin-field-error" role="alert" key={error}>{error}</p>)}
      <div className="admin-profile-actions">
        <button type="button" onClick={() => onChange({ ...team, preferences: [...team.preferences, { kickoff_time: nextPreferenceTime(team), classification: "preferred" }] })}>Add preference</button>
        <button type="button" disabled={team.preferences.length === 0} onClick={() => onChange({ ...team, preferences: [] })}>Clear preferences</button>
      </div>
      <label>Private fixture note<textarea value={team.fixtureNote} placeholder="No private note recorded." onChange={(event) => onChange({ ...team, fixtureNote: event.target.value })} /></label>
      <div className="admin-profile-actions">
        <button type="button" disabled={!team.fixtureNote} onClick={() => onChange({ ...team, fixtureNote: "" })}>Clear note</button>
        <button type="button" onClick={() => onChange({ ...team, fixtureNote: team.sourceFixtureNote, preferences: structuredClone(team.sourcePreferences) })}>Reset to source</button>
      </div>
    </> : <p className="admin-season-empty">No preferences or private note will be copied for this team.</p>}
  </article>;
}

export default function SeasonsWorkspace({ workspace, reload }: { workspace: SeasonsWorkspace; reload(): Promise<void> }) {
  const [draft, setDraft] = useState<SeasonDraft | null>(null);
  const [savedDraft, setSavedDraft] = useState<SeasonDraft | null>(null);
  const editorEpoch = useRef(0);
  const [step, setStep] = useState(0);
  const [notice, setNotice] = useState("");
  const [pending, startTransition] = useTransition();
  const [creating, setCreating] = useState(false);
  const [createAttempted, setCreateAttempted] = useState(false);
  const [createRequestError, setCreateRequestError] = useState("");
  const [newSeason, setNewSeason] = useState({ name: "", startsOn: "", endsOn: "" });
  const createNameRef = useRef<HTMLInputElement | null>(null);
  const createStartRef = useRef<HTMLInputElement | null>(null);
  const createEndRef = useRef<HTMLInputElement | null>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const historyPushedRef = useRef(false);
  const draftId = draft?.id;
  const errors = useMemo(() => draft ? validateDraft(draft) : [], [draft]);
  const createFieldErrors = useMemo(() => validateSeasonCreateFields(newSeason), [newSeason]);
  const createErrors = Object.values(createFieldErrors);

  const dirty = !!(draft && savedDraft && seasonDraftDirty(draft, savedDraft));
  function editDraft(value: SeasonDraft) { setDraft({ ...value, status: "draft" }); }

  async function handleCreateSeason(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (creating) return;
    setCreateAttempted(true);
    setCreateRequestError("");
    const firstInvalid = (["name", "startsOn", "endsOn"] as const).find((field) => createFieldErrors[field]);
    if (firstInvalid) {
      ({ name: createNameRef, startsOn: createStartRef, endsOn: createEndRef })[firstInvalid].current?.focus();
      return;
    }
    setCreating(true);
    try {
      await createSeasonDraft({ ...newSeason, sourceSeasonId: workspace.active[0]?.id });
      setNotice("Draft created.");
      setNewSeason({ name: "", startsOn: "", endsOn: "" });
      setCreateAttempted(false);
      await reload();
    } catch (error) {
      setCreateRequestError(error instanceof Error ? error.message : "The season could not be created. No changes were applied.");
    } finally {
      setCreating(false);
    }
  }

  const closeDraft = useCallback((fromHistory = false) => {
    if (dirty && !confirm("Discard unsaved season changes?")) {
      if (fromHistory) history.pushState({ fisSeasonDraft: draftId }, "");
      return;
    }
    editorEpoch.current++;
    setDraft(null);
    setSavedDraft(null);
    setNotice("");
    if (!fromHistory && historyPushedRef.current) history.back();
    historyPushedRef.current = false;
    requestAnimationFrame(() => openerRef.current?.focus());
  }, [dirty, draftId]);

  function openDraft(value: SeasonDraft, opener: HTMLElement) {
    openerRef.current = opener;
    editorEpoch.current++;
    setDraft(structuredClone(value));
    setSavedDraft(structuredClone(value));
    setStep(0);
    setNotice("");
    if (!historyPushedRef.current) {
      history.pushState({ fisSeasonDraft: value.id }, "");
      historyPushedRef.current = true;
    }
  }

  useEffect(() => { if (draftId) closeRef.current?.focus(); }, [draftId]);

  useEffect(() => {
    if (!draftId) return;
    const mobile = matchMedia("(max-width: 767px)").matches;
    if (mobile) document.body.classList.add("admin-season-dialog-open");
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDraft();
      if (event.key === "Tab" && mobile) {
        const panel = document.querySelector<HTMLElement>(".admin-season-wizard");
        const focusable = panel?.querySelectorAll<HTMLElement>('button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])');
        if (!focusable?.length) return;
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    const onPopState = () => closeDraft(true);
    const onBeforeUnload = (event: BeforeUnloadEvent) => { if (dirty) { event.preventDefault(); event.returnValue = ""; } };
    const onNavigate = (event: MouseEvent) => {
      const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
      if (dirty && link && link.target !== "_blank" && link.href !== location.href && !confirm("Discard unsaved season changes?")) { event.preventDefault(); event.stopPropagation(); }
    };
    document.addEventListener("click", onNavigate, true);
    addEventListener("beforeunload", onBeforeUnload);
    addEventListener("keydown", onKeyDown);
    addEventListener("popstate", onPopState);
    return () => {
      document.body.classList.remove("admin-season-dialog-open");
      removeEventListener("keydown", onKeyDown);
      removeEventListener("popstate", onPopState);
      removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onNavigate, true);
    };
  }, [draftId, dirty, closeDraft]);

  function run(task: () => Promise<unknown>, success: string, refreshDraft = true) {
    const epoch = editorEpoch.current, id = draft?.id;
    startTransition(async () => {
      try {
        await task();
        const persisted = refreshDraft && id ? await loadSeasonDraft(id) : null;
        if (epoch === editorEpoch.current) {
          if (persisted) { setDraft(persisted); setSavedDraft(structuredClone(persisted)); }
          setNotice(success);
        }
        await reload();
      } catch (error) {
        if (epoch === editorEpoch.current) setNotice(error instanceof Error ? error.message : "The action failed. Reload and review before retrying.");
      }
    });
  }

  if (!draft) return <>
    <header className="admin-results-heading"><div><p className="eyebrow">Seasons</p><h2>Season management</h2><p>Prepare the next competition without changing the live season.</p></div></header>
    {notice && <p className="admin-action-message" role="status">{notice}</p>}
    <section className="admin-season-summary"><h3>Current active season</h3>{workspace.active.length ? workspace.active.map((season) => <article key={season.id}><div><strong>{season.name}</strong><span>{season.startsOn} to {season.endsOn}</span></div><small>{season.competitions.reduce((total, competition) => total + competition.teamCount, 0)} teams · {season.competitions.length} competitions</small><ul>{season.competitions.map((competition) => <li key={`${competition.name}:${competition.weekday}:${competition.division}`}>{competition.name} · Division {competition.division} · {competition.teamCount} teams</li>)}</ul></article>) : <p className="admin-season-empty">No active season.</p>}</section>
    <section className="admin-season-create"><h3>Create new season</h3><form noValidate onSubmit={handleCreateSeason} aria-busy={creating}><label htmlFor="new-season-name">Name<input ref={createNameRef} id="new-season-name" value={newSeason.name} aria-invalid={createAttempted && Boolean(createFieldErrors.name)} aria-describedby={createAttempted && createFieldErrors.name ? "new-season-name-error" : undefined} onChange={(event) => setNewSeason({ ...newSeason, name: event.target.value })} />{createAttempted && createFieldErrors.name && <span id="new-season-name-error" className="admin-field-error">{createFieldErrors.name}</span>}</label><label htmlFor="new-season-start">Start date<input ref={createStartRef} id="new-season-start" type="date" value={newSeason.startsOn} aria-invalid={createAttempted && Boolean(createFieldErrors.startsOn)} aria-describedby={createAttempted && createFieldErrors.startsOn ? "new-season-start-error" : undefined} onChange={(event) => setNewSeason({ ...newSeason, startsOn: event.target.value })} />{createAttempted && createFieldErrors.startsOn && <span id="new-season-start-error" className="admin-field-error">{createFieldErrors.startsOn}</span>}</label><label htmlFor="new-season-end">End date<input ref={createEndRef} id="new-season-end" type="date" value={newSeason.endsOn} aria-invalid={createAttempted && Boolean(createFieldErrors.endsOn)} aria-describedby={createAttempted && createFieldErrors.endsOn ? "new-season-end-error" : undefined} onChange={(event) => setNewSeason({ ...newSeason, endsOn: event.target.value })} />{createAttempted && createFieldErrors.endsOn && <span id="new-season-end-error" className="admin-field-error">{createFieldErrors.endsOn}</span>}</label><button type="submit" disabled={creating} aria-busy={creating}>{creating ? "Creating…" : "Create new season"}</button></form>{createAttempted && createErrors.length > 0 && <p className="admin-season-create-errors" role="alert" aria-live="assertive">Please correct the highlighted fields.</p>}{createRequestError && <p className="admin-action-message error" role="alert">{createRequestError}</p>}</section>
    <section className="admin-season-list"><h3>Draft seasons</h3>{workspace.drafts.filter((item) => item.status !== "abandoned" && item.status !== "activated").map((item) => <button key={item.id} onClick={(event) => openDraft(item, event.currentTarget)}><strong>{item.name}</strong><span className={`admin-lifecycle-badge is-${item.status}`}>{item.status} · version {item.version}</span></button>)}{workspace.drafts.filter((item) => item.status !== "abandoned" && item.status !== "activated").length === 0 && <p className="admin-season-empty">No draft seasons.</p>}</section>
    <section className="admin-season-list"><h3>Archived seasons</h3>{workspace.archived.length ? workspace.archived.map((season) => <article key={season.id}><strong>{season.name}</strong><span>{season.startsOn} to {season.endsOn}</span></article>) : <p className="admin-season-empty">No archived seasons.</p>}</section>
  </>;

  const counts = draftCounts(draft);
  const updateTeam = (team: DraftTeam) => editDraft({ ...draft, teams: draft.teams.map((item) => item.id === team.id ? reviewTeamEdit(item, team) : item) });
  return <section className="admin-season-wizard" role="dialog" aria-modal="true" aria-labelledby="season-draft-title">
    <header><div><p className="eyebrow">Season draft</p><h2 id="season-draft-title">{draft.name}</h2><span className={`admin-lifecycle-badge is-${draft.status}`}>{draft.status} · version {draft.version}</span></div><button ref={closeRef} className="admin-season-close" aria-label="Close season draft" onClick={() => closeDraft()}>Close</button></header>
    <nav aria-label="Season draft steps">{steps.map((label, index) => <button key={label} aria-current={step === index ? "step" : undefined} onClick={() => setStep(index)}><span>{index + 1}</span>{label}</button>)}</nav>
    {notice && <p className="admin-action-message" role="status">{notice}</p>}
    {dirty && <p className="admin-action-message" role="status">Unsaved changes. Save before validation or staging.</p>}
    <div className="admin-season-step" tabIndex={-1}>
    <fieldset className="admin-season-structure" disabled={pending || !!draft.stagedSeasonId}>
      {step === 0 && <div className="admin-season-panel"><label>Season name<input value={draft.name} onChange={(event) => editDraft({ ...draft, name: event.target.value })} /></label><label>Start date<input type="date" value={draft.startsOn} onChange={(event) => editDraft({ ...draft, startsOn: event.target.value })} /></label><label>End date<input type="date" value={draft.endsOn} onChange={(event) => editDraft({ ...draft, endsOn: event.target.value })} /></label>{validateSeasonDates(draft.name, draft.startsOn, draft.endsOn).map((error) => <p className="admin-field-error" role="alert" key={error}>{error}</p>)}</div>}
      {step === 1 && <><div className="admin-season-step-heading"><div><h3>Competition structure</h3><p>Retain and edit copied competitions, or add another competition.</p></div><button type="button" onClick={() => { const id = crypto.randomUUID(); editDraft({ ...draft, competitions: [...draft.competitions, { id, sourceCompetitionSeasonId: null, categoryId: workspace.categories[0]?.id ?? "", categoryName: workspace.categories[0]?.name ?? "", locationId: workspace.locations[0]?.id ?? "", locationName: workspace.locations[0]?.name ?? "", weekday: 1, division: "A", name: "New competition", retained: true }] }); }}>Add competition</button></div><div className="admin-season-cards">{draft.competitions.map((competition) => <article className={!competition.retained ? "is-removed" : ""} key={competition.id}><label className="admin-season-retain"><input type="checkbox" checked={competition.retained} onChange={(event) => editDraft({ ...draft, competitions: draft.competitions.map((item) => item.id === competition.id ? { ...item, retained: event.target.checked } : item) })} /> Retain competition</label><label>Competition name<input value={competition.name} onChange={(event) => editDraft({ ...draft, competitions: draft.competitions.map((item) => item.id === competition.id ? { ...item, name: event.target.value } : item) })} /></label><div><label>Location<select value={competition.locationId} onChange={(event) => editDraft({ ...draft, competitions: draft.competitions.map((item) => item.id === competition.id ? { ...item, locationId: event.target.value, locationName: workspace.locations.find(l => l.id === event.target.value)?.name ?? "", venueConfirmed: false } : item) })}>{workspace.locations.map((location) => <option key={location.id} value={location.id}>{location.name}</option>)}</select></label><label>Category<select value={competition.categoryId} onChange={(event) => editDraft({ ...draft, competitions: draft.competitions.map((item) => item.id === competition.id ? { ...item, categoryId: event.target.value } : item) })}>{workspace.categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label><label>Night<select value={competition.weekday} onChange={(event) => editDraft({ ...draft, competitions: draft.competitions.map((item) => item.id === competition.id ? { ...item, weekday: Number(event.target.value), venueConfirmed: false } : item) })}>{[[1,"Monday"],[2,"Tuesday"],[3,"Wednesday"],[4,"Thursday"],[5,"Friday"],[6,"Saturday"],[7,"Sunday"]].map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label>Division<input value={competition.division} onChange={(event) => editDraft({ ...draft, competitions: draft.competitions.map((item) => item.id === competition.id ? { ...item, division: event.target.value } : item) })} /></label></div>{standingVenueBooking(competition) ? <p>Standing Monday/Wednesday venue booking confirmed by organiser. Calendar exceptions still apply; 2 November is provisional for team participation.</p> : <label><input type="checkbox" checked={competition.venueConfirmed ?? false} onChange={e => editDraft({ ...draft, competitions: draft.competitions.map(c => c.id === competition.id ? { ...c, venueConfirmed: e.target.checked } : c) })} /> Venue booking confirmed for this competition</label>}<small>{draft.teams.filter((team) => team.selected && team.draftCompetitionId === competition.id).length} selected teams</small></article>)}</div>{errors.filter((error) => /competition|at least one/i.test(error)).map((error) => <p className="admin-field-error" role="alert" key={error}>{error}</p>)}</>}
      {step === 2 && <div className="admin-season-teams"><div className="admin-season-step-heading"><div><h3>Teams</h3><p>{counts.teams} teams selected</p></div><div className="admin-bulk-actions"><button onClick={() => editDraft({ ...draft, teams: draft.teams.map((team) => ({ ...team, selected: true })) })}>Select all</button><button onClick={() => editDraft({ ...draft, teams: draft.teams.map((team) => ({ ...team, selected: false })) })}>Deselect all</button></div></div>{draft.competitions.filter((competition) => competition.retained).map((competition) => <section key={competition.id}><h3>{competition.name}</h3><button type="button" onClick={() => editDraft({ ...draft, teams: [...draft.teams, newDraftTeam(competition.id, crypto.randomUUID())] })}>Add new team</button>{draft.teams.filter((team) => team.draftCompetitionId === competition.id).map((team) => <div className="admin-season-team-row" key={team.id}><label><input aria-label={`Select ${team.name}`} type="checkbox" checked={team.selected} onChange={(event) => updateTeam({ ...team, selected: event.target.checked })} /><TeamKit colour={team.kitColour ?? undefined} /><span>{team.name || "New team"}</span></label><label>Name<input value={team.name} onChange={e => updateTeam({ ...team, name: e.target.value })} /></label><label>Readable ID<input value={team.readableId ?? ""} onChange={e => updateTeam({ ...team, readableId: e.target.value })} /></label><label>Kit colour<input placeholder="#083A97" value={team.kitColour ?? ""} onChange={e => updateTeam({ ...team, kitColour: e.target.value || null })} /></label><label><input type="checkbox" checked={team.standingsEligible} onChange={e => updateTeam({ ...team, standingsEligible: e.target.checked })} /> Counts in standings</label>{!team.sourceTeamId && <label>Reserved membership UUID<input defaultValue={team.id} onBlur={e => editDraft({ ...draft, teams: draft.teams.map(t => t.id === team.id ? reviewTeamEdit(t, { ...t, id: e.target.value }) : t) })} /></label>}<label>Destination<select value={team.draftCompetitionId} onChange={(event) => updateTeam({ ...team, draftCompetitionId: event.target.value })}>{draft.competitions.filter((item) => item.retained).map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label></div>)}</section>)}{errors.filter((error) => /duplicate team/i.test(error)).map((error) => <p className="admin-field-error" role="alert" key={error}>{error}</p>)}</div>}
      {step === 3 && <><div className="admin-season-step-heading"><div><h3>Preferences and private notes</h3><p>Review private scheduling details before rollover.</p></div></div><div className="admin-season-profiles">{draft.teams.filter((team) => team.selected).map((team) => <PrivateProfileEditor key={team.id} team={team} onChange={updateTeam} />)}{draft.teams.every((team) => !team.selected) && <p className="admin-season-empty">Select returning teams before reviewing private profiles.</p>}</div></>}
      </fieldset>
      {step === 4 && <div className="admin-season-review"><h3>Activation review</h3><dl><div><dt>Season</dt><dd>{draft.name}</dd></div><div><dt>Dates</dt><dd>{draft.startsOn} to {draft.endsOn}</dd></div><div><dt>Competitions</dt><dd>{counts.competitions}</dd></div><div><dt>Teams</dt><dd>{counts.teams}</dd></div><div><dt>Preferences</dt><dd>{counts.preferences}</dd></div><div><dt>Private notes</dt><dd>{counts.notes}</dd></div></dl><div className="admin-season-warning"><strong>Activation archives the current editions.</strong><p>Historical teams, fixtures, results and standing adjustments remain unchanged. Fixtures, results and adjustments are never copied. Activation publishes the staged, reviewed new fixtures atomically.</p></div>{errors.map((error) => <p className="admin-field-error" role="alert" key={error}>{error}</p>)}{!draft.stagedSeasonId ? <><p>Stage unpublished teams before importing and reviewing fixtures. The reviewed team structure will be frozen.</p>{seasonStageErrors(draft).map(error => <p className="admin-field-error" key={error}>{error}</p>)}<button disabled={pending || dirty || draft.status !== "validated" || seasonStageErrors(draft).length > 0} onClick={() => run(() => stageSeasonDraft(draft.id, draft.version), "Season staged privately. Import each schedule, then review its fixture change set.")}>Stage teams and competitions</button></> : <><p>Staged privately. Import a complete local schedule for each competition; replacing a plan requires cancelling its existing change set first.</p>{draft.competitions.filter(c => c.retained).map(c => <label key={c.id}>{c.name}: import complete schedule<input type="file" accept="application/json,.json" disabled={pending || draft.status === "activated" || draft.status === "abandoned"} onChange={e => { const file=e.target.files?.[0]; if(file) run(async () => { const schedule=JSON.parse(await file.text()); await importSeasonSchedule(draft.id,draft.version,c.id,schedule); }, "Schedule imported privately. Review and acknowledge its fixture change set in Fixtures."); e.target.value=""; }} /></label>)}<Link href="/admin/fixtures/">Review staged fixture plans</Link></>}
      <button className="admin-season-activate" disabled={pending || errors.length > 0 || (dirty || !draft.stagedSeasonId || draft.status !== "validated")} onClick={() => { if (confirm("Activate this season and archive the current active competition editions?")) run(() => activateSeasonDraft(draft.id, draft.version), "Season activated."); }}>Activate season</button>{draft.status !== "validated" && <p className="admin-season-help">Validate this draft before activation.</p>}</div>}
    </div>
    <footer><div className="admin-season-step-actions"><button disabled={step === 0} onClick={() => setStep((value) => Math.max(0, value - 1))}>Previous</button><button disabled={step === steps.length - 1} onClick={() => setStep((value) => Math.min(steps.length - 1, value + 1))}>Next</button></div><div className="admin-season-save-actions"><button disabled={pending || !!draft.stagedSeasonId} onClick={() => run(() => saveSeasonDraft(draft), "Draft saved. Validation has been reset.")}>Save draft</button><button disabled={pending || dirty || errors.length > 0 || draft.status === "activated" || draft.status === "abandoned"} onClick={() => run(() => validateSeasonDraft(draft.id, draft.version), draft.stagedSeasonId ? "Persisted season and reviewed fixtures validated." : "Persisted team structure validated. Confirm team availability before staging; the standing venue booking is recorded.")}>Validate draft</button><button disabled={pending || !!draft.stagedSeasonId} onClick={() => { if (confirm("Abandon this unactivated draft?")) run(() => abandonSeasonDraft(draft.id, draft.version), "Draft abandoned."); }}>Abandon draft</button></div></footer>
  </section>;
}
