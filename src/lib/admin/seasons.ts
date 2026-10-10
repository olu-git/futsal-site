export type SeasonLifecycle="draft"|"validated"|"activated"|"abandoned";
export type DraftCompetition={id:string;sourceCompetitionSeasonId:string|null;categoryId:string;categoryName:string;locationId:string;locationName:string;weekday:number;division:string;name:string;retained:boolean;venueConfirmed?:boolean};
export type DraftPreference={kickoff_time:string;classification:"required"|"preferred"|"avoid"};
export type DraftTeam={id:string;draftCompetitionId:string;sourceTeamId:string|null;readableId?:string;availabilityConfirmed?:boolean;selected:boolean;name:string;status:string;standingsEligible:boolean;kitColour:string|null;copyPrivateProfile:boolean;fixtureNote:string;preferences:DraftPreference[];sourceFixtureNote:string;sourcePreferences:DraftPreference[]};
export type SeasonFixturePlan={id:string;competitionId:string;status:"draft"|"pending_review"|"published"|"cancelled";version:number;fixtureCount:number;reviewedAt:string|null;warningsAcknowledgedAt:string|null;messages:Array<{severity:string;message:string}>};
export type SeasonDraft={id:string;sourceSeasonId:string|null;name:string;startsOn:string;endsOn:string;status:SeasonLifecycle;version:number;stagedSeasonId?:string|null;validatedFixtureVersions?:Record<string,number>|null;fixturePlans?:SeasonFixturePlan[];competitions:DraftCompetition[];teams:DraftTeam[]};
export type SeasonSummary={id:string;name:string;startsOn:string;endsOn:string;lifecycle:"active"|"archived";competitions:Array<{name:string;weekday:number;division:string;teamCount:number}>};
export type SeasonsWorkspace={active:SeasonSummary[];archived:SeasonSummary[];drafts:SeasonDraft[];categories:Array<{id:string;name:string}>;locations:Array<{id:string;name:string}>};
export type SeasonCreateInput={name:string;startsOn:string;endsOn:string};
export type SeasonCreateField=keyof SeasonCreateInput;
export function validateSeasonCreateFields(input:SeasonCreateInput){const errors:Partial<Record<SeasonCreateField,string>>={};if(!input.name.trim())errors.name="Season name is required.";if(!input.startsOn)errors.startsOn="Start date is required.";if(!input.endsOn)errors.endsOn="End date is required.";else if(input.startsOn&&input.endsOn<=input.startsOn)errors.endsOn="End date must be after the start date.";return errors}
export function validateSeasonDates(name:string,start:string,end:string){const errors:string[]=[];if(!name.trim())errors.push("Season name is required.");if(!start)errors.push("Start date is required.");if(!end)errors.push("End date is required.");if(start&&end&&end<=start)errors.push("End date must follow the start date.");return errors}
export function validatePreferences(preferences:DraftPreference[]){const errors:string[]=[],times=new Set<string>();for(const preference of preferences){if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(preference.kickoff_time))errors.push(`Invalid kick-off time: ${preference.kickoff_time||"blank"}.`);if(!["required","preferred","avoid"].includes(preference.classification))errors.push(`Unsupported preference strength: ${preference.classification}.`);if(times.has(preference.kickoff_time))errors.push(`Duplicate or conflicting preference at ${preference.kickoff_time}.`);times.add(preference.kickoff_time)}return errors}
export function validateDraft(draft:SeasonDraft){const errors=validateSeasonDates(draft.name,draft.startsOn,draft.endsOn),competitions=draft.competitions.filter(c=>c.retained);if(!competitions.length)errors.push("Keep at least one competition.");const keys=new Set<string>();for(const c of competitions){const key=`${c.categoryId}:${c.locationId}:${c.weekday}:${c.division.trim().toLowerCase()}`;if(keys.has(key))errors.push(`Duplicate competition structure: ${c.name}.`);keys.add(key)}for(const c of competitions){const names=new Set<string>();for(const t of draft.teams.filter(t=>t.selected&&t.draftCompetitionId===c.id)){const name=t.name.trim().toLowerCase();if(!name)errors.push(`Team name is required in ${c.name}.`);if(t.kitColour&&!/^#[0-9A-Fa-f]{6}$/.test(t.kitColour))errors.push(`${t.name}: invalid kit colour.`);if(!t.sourceTeamId&&!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(t.id))errors.push(`${t.name}: invalid reserved membership UUID.`);if(names.has(name))errors.push(`Duplicate team name in ${c.name}: ${t.name}.`);names.add(name);if(t.copyPrivateProfile)errors.push(...validatePreferences(t.preferences).map(error=>`${t.name}: ${error}`))}}return errors}
export const draftCounts=(draft:SeasonDraft)=>({competitions:draft.competitions.filter(c=>c.retained).length,teams:draft.teams.filter(t=>t.selected).length,preferences:draft.teams.filter(t=>t.selected&&t.copyPrivateProfile).reduce((n,t)=>n+t.preferences.length,0),notes:draft.teams.filter(t=>t.selected&&t.copyPrivateProfile&&t.fixtureNote.trim()).length});

export function seasonDraftDirty(draft:SeasonDraft,saved:SeasonDraft){return JSON.stringify(draft)!==JSON.stringify(saved)}
// Organiser-confirmed ongoing Monday/Wednesday booking; calendar exceptions still apply.
export function standingVenueBooking(c:DraftCompetition){return c.locationId==="ce7becb1-0bbc-5cb4-8aa9-d708aaeaebce"&&[1,3].includes(c.weekday)}
export function seasonStageErrors(draft:SeasonDraft){
 const errors=validateDraft(draft);
 for(const c of draft.competitions.filter(c=>c.retained)){
  if(!c.venueConfirmed&&!standingVenueBooking(c))errors.push(`${c.name}: venue calendar has not been confirmed.`);
  const teams=draft.teams.filter(t=>t.selected&&t.draftCompetitionId===c.id);
  if(![1,3].includes(c.weekday)||teams.length<2||teams.length>16||teams.length%2!==0)errors.push(`${c.name}: staging needs Monday/Wednesday and an even roster of 2-16 active teams.`);
  for(const t of teams){
   if(!t.availabilityConfirmed)errors.push(`${t.name}: availability is unverified.`);
   if(!new RegExp(`^${c.weekday===1?"mon":c.weekday===3?"wed":"unsupported"}-[a-z0-9-]+$`).test(t.readableId??""))errors.push(`${t.name}: readable ID must match the night.`);
   if(t.status!=="active")errors.push(`${t.name}: selected entrants must be active.`);
  }
 }
 return errors;
}
export function newDraftTeam(competitionId:string,id:string):DraftTeam{return {id,draftCompetitionId:competitionId,sourceTeamId:null,readableId:"",availabilityConfirmed:false,selected:true,name:"",status:"active",standingsEligible:true,kitColour:null,copyPrivateProfile:true,fixtureNote:"",preferences:[],sourceFixtureNote:"",sourcePreferences:[]}}

export function reviewTeamEdit(previous:DraftTeam,next:DraftTeam):DraftTeam{
 const changed=previous.id!==next.id||previous.sourceTeamId!==next.sourceTeamId||previous.readableId!==next.readableId||previous.status!==next.status||previous.name!==next.name||previous.draftCompetitionId!==next.draftCompetitionId||previous.copyPrivateProfile!==next.copyPrivateProfile||previous.fixtureNote!==next.fixtureNote||JSON.stringify(previous.preferences)!==JSON.stringify(next.preferences);
 return changed?{...next,availabilityConfirmed:false}:next;
}

// These summaries describe persisted review/validation evidence, never upload progress.
export function seasonFixtureStatus(draft:SeasonDraft,competitionId:string){
 const history=(draft.fixturePlans??[]).filter(p=>p.competitionId===competitionId);
 const plans=history.filter(p=>p.status!=="cancelled"),plan=plans.length===1?plans[0]:undefined;
 const blocking=plan?.messages.some(m=>m.severity==="blocking")??false;
 const warnings=plan?.messages.some(m=>m.severity==="warning")??false;
 const reviewed=!!plan&&plan.status==="pending_review"&&!!plan.reviewedAt&&(!warnings||!!plan.warningsAcknowledgedAt);
 const validated=!!plan&&draft.status==="validated"&&draft.validatedFixtureVersions?.[plan.id]===plan.version;
 const ready=!!draft.stagedSeasonId&&plans.length===1&&!!plan?.fixtureCount&&reviewed&&validated&&!blocking;
 return {plan,fixtureCount:plans.reduce((n,p)=>n+p.fixtureCount,0),hasHistory:history.length>0,canImport:plans.length===0,ready,
  importStatus:plans.length>1?"Multiple plans — resolve before activation":plan?"Imported":history.length?"Previous plan cancelled":"Not imported",
  reviewStatus:!plan?"Not reviewed":plan.status==="published"?"Published":reviewed?"Reviewed":warnings&&plan.status==="pending_review"&&!plan.warningsAcknowledgedAt?"Acknowledge warnings in Fixtures":"Awaiting review",
  validationStatus:plans.length>1?"Resolve multiple plans in Fixtures":blocking?"Blocking issues — review fixtures":plan?.status==="published"?"Published":ready?"Validated for activation":!plan?"Import required":!plan.fixtureCount?"No fixtures in this plan":!reviewed?"Review required":"Validate the season again"};
}

export function seasonActivationBlockers(draft:SeasonDraft,dirty=false){
 if(draft.status==="activated")return ["This season is already public."];
 if(draft.status==="abandoned")return ["This draft was abandoned and cannot be activated."];
 const blockers=seasonStageErrors(draft);
 if(dirty)blockers.push("Save unsaved changes before validation or activation.");
 if(!draft.stagedSeasonId)blockers.push("Stage teams and competitions before importing schedules.");
 if(draft.status!=="validated")blockers.push("Validate the persisted season before activation.");
 if(draft.stagedSeasonId)for(const c of draft.competitions.filter(c=>c.retained)){
  const state=seasonFixtureStatus(draft,c.id);
  if(!state.ready)blockers.push(`${c.name}: ${state.validationStatus}.`);
 }
 const plans=(draft.fixturePlans??[]).filter(p=>p.status!=="cancelled"&&draft.competitions.some(c=>c.retained&&c.id===p.competitionId));
 if(draft.status==="validated"&&draft.stagedSeasonId&&Object.keys(draft.validatedFixtureVersions??{}).length!==plans.length)blockers.push("Fixture review changed. Validate the season again.");
 return [...new Set(blockers)];
}
