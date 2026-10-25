import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { newDraftTeam, seasonStageErrors, type SeasonDraft } from "../../src/lib/admin/seasons";

const draft:SeasonDraft={id:'draft',sourceSeasonId:null,name:'Local season',startsOn:'2026-10-12',endsOn:'2027-05-26',status:'validated',version:3,competitions:[{id:'m',sourceCompetitionSeasonId:null,categoryId:'cat',categoryName:'Open',locationId:'loc',locationName:'Court',weekday:1,division:'A',name:'Monday',retained:true,venueConfirmed:true}],teams:['Xaywan','Nassaji FC'].map((name,i)=>({...newDraftTeam('m',`00000000-0000-4000-8000-00000000000${i+1}`),name,readableId:i===0?'mon-xaywan':'mon-nassaji-fc',availabilityConfirmed:true}))};

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
