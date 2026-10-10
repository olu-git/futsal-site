import assert from 'node:assert/strict';
import test from 'node:test';
import {newDraftTeam,reviewTeamEdit,seasonDraftDirty,seasonStageErrors,type SeasonDraft} from '../src/lib/admin/seasons';
import {selectFixtureAdminEditions,selectAdminEditions} from '../src/lib/admin/competition-editions';
const draft:SeasonDraft={id:'draft',sourceSeasonId:null,name:'Local season',startsOn:'2026-10-12',endsOn:'2027-05-26',status:'validated',version:3,competitions:[{id:'m',sourceCompetitionSeasonId:null,categoryId:'cat',categoryName:'Open',locationId:'loc',locationName:'Court',weekday:1,division:'A',name:'Monday',retained:true,venueConfirmed:true}],teams:['Xaywan','Nassaji FC'].map((name,i)=>({...newDraftTeam('m',`00000000-0000-4000-8000-00000000000${i+1}`),name,readableId:i===0?'mon-xaywan':'mon-nassaji-fc',availabilityConfirmed:true}))};
test('new-team drafts use fresh membership reservations and do not inherit a source or private history',()=>{const t=newDraftTeam('m','00000000-0000-4000-8000-000000000003');assert.equal(t.sourceTeamId,null);assert.equal(t.availabilityConfirmed,false);assert.deepEqual(t.preferences,[]);assert.equal(t.standingsEligible,true);assert.equal(t.kitColour,null)});
test('unverified availability and venue dates block staging rather than implying unrestricted',()=>{assert.deepEqual(seasonStageErrors(draft),[]);const bad=structuredClone(draft);bad.teams[0].availabilityConfirmed=false;bad.competitions[0].venueConfirmed=false;assert(seasonStageErrors(bad).some(e=>e.includes('availability')));assert(seasonStageErrors(bad).some(e=>e.includes('venue')))});
test('new membership validation rejects wrong night, duplicate names and malformed reserved identities',()=>{const bad=structuredClone(draft);bad.teams[0].readableId='wed-xaywan';bad.teams[1].name=' Xaywan ';bad.teams[1].id='not-a-uuid';const errors=seasonStageErrors(bad);for(const text of ['night','Duplicate','UUID'])assert(errors.some(e=>e.includes(text)))});
test('unsaved metadata and preference edits invalidate the persisted review baseline',()=>{const saved=structuredClone(draft);assert.equal(seasonDraftDirty(draft,saved),false);const edited=structuredClone(draft);edited.name='Changed';assert.equal(seasonDraftDirty(edited,saved),true);const prefs=structuredClone(draft);prefs.teams[0].preferences.push({kickoff_time:'21:00',classification:'required'});assert.equal(seasonDraftDirty(prefs,saved),true);assert.equal(seasonDraftDirty(prefs,structuredClone(prefs)),false)});
test('staged editions coexist with active editions in Fixtures without changing other admin selection',()=>{const row=(id:string,lifecycle:string,publication_state:string)=>({id,lifecycle,publication_state,competitions:{weekday:1,division:'A'},seasons:{ends_on:lifecycle==='planned'?'2027-05-26':'2026-10-07'}});const rows=[row('active','active','published'),row('future','planned','draft'),row('archive','archived','published')];assert.deepEqual(selectFixtureAdminEditions(rows).map(r=>r.id),['active','future']);assert.deepEqual(selectAdminEditions(rows.filter(r=>r.publication_state==='published')).map(r=>r.id),['active'])});

import {fixtureChangesDirty,type FixtureChange} from '../src/lib/admin/fixture-changes';
test('changing a private profile revokes its confirmation; explicit re-confirmation is retained',()=>{const previous=draft.teams[0];assert.equal(reviewTeamEdit(previous,{...previous,fixtureNote:'New restriction'}).availabilityConfirmed,false);const unreviewed={...previous,availabilityConfirmed:false};assert.equal(reviewTeamEdit(unreviewed,{...unreviewed,availabilityConfirmed:true}).availabilityConfirmed,true)});
test('fixture review detects unsaved edits without depending on object property order',()=>{const saved:FixtureChange[]=[{operation:'cancel',fixtureId:'f',expectedFixtureVersion:1,reason:'Reviewed cancellation'}];assert.equal(fixtureChangesDirty([{reason:'Reviewed cancellation',expectedFixtureVersion:1,fixtureId:'f',operation:'cancel'}],saved),false);assert.equal(fixtureChangesDirty([{...saved[0],reason:'Different reason'}],saved),true);assert.equal(fixtureChangesDirty([],saved),true)});

test("standing booking covers both nights only at the confirmed venue, without confirming team availability",()=>{for(const weekday of [1,3]){const d=structuredClone(draft);d.competitions[0]={...d.competitions[0],weekday,locationId:"ce7becb1-0bbc-5cb4-8aa9-d708aaeaebce",venueConfirmed:false};d.teams=d.teams.map(t=>({...t,readableId:t.readableId!.replace(/^mon-/,weekday===1?"mon-":"wed-")}));assert.deepEqual(seasonStageErrors(d),[]);d.teams[0].availabilityConfirmed=false;assert(seasonStageErrors(d).some(e=>e.includes("availability")));d.competitions[0].locationId="another-venue";assert(seasonStageErrors(d).some(e=>e.includes("venue")));}});

import {readFileSync} from 'node:fs';
test('organiser-confirmed fresh entries satisfy their gates while returning profiles stay unconfirmed',()=>{
 const entries=JSON.parse(readFileSync('docs/drafts/new-season-team-memberships.json','utf8')).entries;
 assert.equal(entries.length,4);
 for(const night of ['monday','wednesday']){
  const d=structuredClone(draft);d.competitions[0].weekday=night==='monday'?1:3;
  d.teams=entries.filter((e:{night:string})=>e.night===night).map((e:{uuid:string;name:string;readableId:string;availabilityConfirmed:boolean;fixtureNote:string;preferences:typeof d.teams[number]['preferences'];availabilityConfirmation:{asOf:string;kickoffTimes:string[]}})=>{
   assert.equal(e.availabilityConfirmation.asOf,'2026-10-10');assert.deepEqual(e.availabilityConfirmation.kickoffTimes,['19:00','19:40','20:20','21:00']);
   return {...newDraftTeam('m',e.uuid),name:e.name,readableId:e.readableId,availabilityConfirmed:e.availabilityConfirmed,fixtureNote:e.fixtureNote,preferences:e.preferences};
  });
  assert.deepEqual(seasonStageErrors(d),[]);
  const returning={...newDraftTeam('m','00000000-0000-4000-8000-000000000090'),sourceTeamId:'returning-source',name:'AFG',readableId:night==='monday'?'mon-afg':'wed-afg'};
  d.teams.push(returning,{...returning,id:'00000000-0000-4000-8000-000000000091',name:'Misfits',readableId:night==='monday'?'mon-misfits':'wed-misfits'});
  const errors=seasonStageErrors(d);assert(errors.some(e=>e.includes('AFG: availability')));assert(errors.some(e=>e.includes('Misfits: availability')));assert(!errors.some(e=>e.includes('Xaywan: availability')||e.includes('Buckle City: availability')));
 }
});
test('later identity or availability edits revoke a current confirmation rather than carrying it forward',()=>{
 const t=draft.teams[0];for(const patch of [{id:'another-uuid'},{readableId:'mon-other'},{sourceTeamId:'another-history'},{preferences:[{kickoff_time:'21:00',classification:'required' as const}]}])assert.equal(reviewTeamEdit(t,{...t,...patch}).availabilityConfirmed,false);
});
