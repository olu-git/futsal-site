import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import FixtureSchedules from "../src/app/admin/seasons/FixtureSchedules";
import { parseSeasonFixturePlan } from "../src/lib/admin/seasons-data";
import { seasonActivationBlockers, seasonFixtureStatus, type SeasonDraft, type SeasonFixturePlan } from "../src/lib/admin/seasons";

const competitions=[1,3].map(day=>({id:`edition-${day}`,name:day===1?"Monday Night":"Wednesday Night",weekday:day,sourceCompetitionSeasonId:null,categoryId:"cat",categoryName:"Open",locationId:"ce7becb1-0bbc-5cb4-8aa9-d708aaeaebce",locationName:"Venue",division:"A",retained:true}));
const plan=(index:number):SeasonFixturePlan=>({id:`plan-${index}`,competitionId:competitions[index].id,status:"pending_review",version:4,fixtureCount:index===0?182:240,reviewedAt:"2026-10-11",warningsAcknowledgedAt:"2026-10-11",messages:[{severity:"warning",message:"New slot"}]});
const ready:SeasonDraft={id:"draft",sourceSeasonId:null,name:"Season 2 2026",startsOn:"2026-10-12",endsOn:"2027-05-26",status:"validated",version:7,stagedSeasonId:"staged",validatedFixtureVersions:{"plan-0":4,"plan-1":4},fixturePlans:[plan(0),plan(1)],competitions,teams:competitions.flatMap((c,i)=>[0,1].map(j=>({id:`10000000-0000-4000-8000-${String(i*2+j).padStart(12,"0")}`,draftCompetitionId:c.id,sourceTeamId:"source",readableId:`${i===0?"mon":"wed"}-team-${j}`,availabilityConfirmed:true,selected:true,name:`Team ${j}`,status:"active",standingsEligible:true,kitColour:null,copyPrivateProfile:true,fixtureNote:"",preferences:[],sourceFixtureNote:"",sourcePreferences:[]})))};

test("persisted summaries count imported items instead of trusting reported counts",()=>{
 const parsed=parseSeasonFixturePlan({id:"plan-0",competition_season_id:"edition-1",status:"pending_review",version:4,reviewed_at:"2026-10-11",warnings_acknowledged_at:null,validation_report:{fixture_count:999,messages:[{severity:"blocking",message:"Time conflict"}]},fixture_change_items:[{id:"one"},{id:"two"}]});
 assert.equal(parsed.fixtureCount,2);assert.equal(parsed.version,4);assert.equal(parsed.reviewedAt,"2026-10-11");assert.equal(parsed.warningsAcknowledgedAt,null);assert.equal(parsed.messages[0].severity,"blocking");
 assert.equal(parseSeasonFixturePlan({id:"empty",competition_season_id:"edition-1",status:"draft",version:1}).fixtureCount,0);
});

test("readiness requires exact persisted reviews and season validation bindings",()=>{
 assert.deepEqual(seasonActivationBlockers(ready),[]);
 assert.equal(seasonFixtureStatus(ready,competitions[0].id).fixtureCount,182);
 assert.equal(seasonFixtureStatus(ready,competitions[1].id).fixtureCount,240);
 for(const patch of [{version:5},{reviewedAt:null},{warningsAcknowledgedAt:null},{status:"draft" as const},{fixtureCount:0},{messages:[{severity:"blocking",message:"Time conflict"}]}]){
  const draft={...ready,fixturePlans:[{...plan(0),...patch},plan(1)]};
  assert.equal(seasonFixtureStatus(draft,competitions[0].id).ready,false);
  assert.ok(seasonActivationBlockers(draft).length);
 }
 assert.ok(seasonActivationBlockers(ready,true).some(x=>/unsaved/.test(x)));
 assert.ok(seasonActivationBlockers({...ready,status:"draft"}).length);
 assert.match(seasonActivationBlockers({...ready,status:"activated"})[0],/already public/);
 assert.match(seasonActivationBlockers({...ready,status:"abandoned"})[0],/abandoned/);
});

test("empty, partial, cancelled and duplicate plans cannot enable activation",()=>{
 for(const plans of [[],[plan(0)],[{...plan(0),status:"cancelled" as const},plan(1)],[plan(0),{...plan(0),id:"other"},plan(1)]])assert.ok(seasonActivationBlockers({...ready,fixturePlans:plans}).length);
 const cancelled=seasonFixtureStatus({...ready,fixturePlans:[{...plan(0),status:"cancelled"}]},competitions[0].id);
 assert.equal(cancelled.fixtureCount,0);assert.equal(cancelled.canImport,true);assert.equal(cancelled.hasHistory,true);
});

test("cards hide initial instructions after import and keep replacement secondary",()=>{
 const render=(draft:SeasonDraft)=>renderToStaticMarkup(<FixtureSchedules draft={draft} pending={false} dirty={false} onImport={()=>{}} onRefresh={()=>{}}/>);
 const html=render(ready);assert.match(html,/182/);assert.match(html,/240/);assert.match(html,/Ready/);assert.match(html,/<details/);assert.doesNotMatch(html,/Choose the complete schedule/);
 assert.match(html,/Cancel the existing plan/);assert.match(html,/disabled=""/);
 const empty=render({...ready,fixturePlans:[]});assert.match(empty,/Not imported/);assert.match(empty,/Choose the complete schedule/);assert.doesNotMatch(empty,/>Ready</);
 const partial=render({...ready,fixturePlans:[plan(0)]});assert.equal((partial.match(/>Ready</g)??[]).length,1);
});
