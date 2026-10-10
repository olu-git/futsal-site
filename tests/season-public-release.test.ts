import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { loadPublicPages, mapPublishedSeasons, type PublishedCompetitionRows } from "../src/lib/public-competition";
import { buildPublicSnapshot } from "../src/lib/public-snapshot";
import { competitionViews } from "../src/lib/competition-views";

const rows:PublishedCompetitionRows={editions:[],teams:[],fixtures:[],results:[],adjustments:[]};

test("published archive pagination exceeds the row cap and rejects partial or changing reads",async()=>{
 const source=Array.from({length:1203},(_,id)=>({id}));const calls:number[]=[];
 const result=await loadPublicPages(async(from,to)=>{calls.push(from);return {data:source.slice(from,to+1),count:source.length,error:null};});
 assert.deepEqual(result.data,source);assert.deepEqual(calls,[0,500,1000]);
 await assert.rejects(()=>loadPublicPages(async()=>({data:source.slice(0,499),count:1203,error:null})),/truncated/);
 await assert.rejects(()=>loadPublicPages(async(from,to)=>({data:source.slice(from,to+1),count:from?1204:1203,error:null})),/changed during pagination/);
});
for(const [id,lifecycle,name] of [["old","archived","2026 Season 1"],["new","active","Season 2 2026"],["private","planned","Private season"]])for(const weekday of [1,3]){
 const edition=`${id}-${weekday}`;
 rows.editions.push({id:edition,season_id:id,lifecycle,publication_state:id==="private"?"draft":"published",competitions:{weekday,division:"A"},seasons:{name,ends_on:id==="old"?"2026-10-07":"2027-05-26"}});
 for(const side of ["a","b"])rows.teams.push({id:`${edition}-${side}`,competition_season_id:edition,legacy_id:`${weekday===1?"mon":"wed"}-${side}`,name:side,status:"active",standings_eligible:true,kit_colour:null});
 rows.fixtures.push({id:edition,competition_season_id:edition,legacy_id:null,round_number:1,match_date:weekday===1?"2026-10-12":"2026-10-14",kickoff_time:"19:00:00",court:1,home_team_id:`${edition}-a`,away_team_id:`${edition}-b`,stage:"regular_season",publication_state:id==="private"?"draft":"published",public_note:null});
 if(id==="old")rows.results.push({fixture_id:edition,status:"published",home_score:3,away_score:1,forfeit_side:null});
}

test("current season and archived results remain isolated in live and fallback views",async()=>{
 const live=await competitionViews(mapPublishedSeasons(rows));
 const fallback=await competitionViews(buildPublicSnapshot(rows).data);
 for(const views of [live,fallback]){
  assert.equal(views.monday.seasonName,"Season 2 2026");
  assert.equal(views.monday.results.length,0);
  assert.ok(views.monday.divisions[0].standings.every(s=>s.played===0&&s.points===0&&s.goalsFor===0));
  assert.deepEqual(views.monday.upcoming[0].fixtures[0].homeForm,["?","?","?","?","?"]);
  assert.equal(views.history.length,1);assert.equal(views.history[0].name,"2026 Season 1");
  assert.equal(views.history[0].monday.results[0].fixtures[0].homeScore,3);
  assert.equal(views.history[0].monday.results[0].fixtures[0].homeForm,undefined);
 }
 assert.equal(live.monday.upcoming[0].fixtures[0].date,fallback.monday.upcoming[0].fixtures[0].date);
});

test("Home shows both nights before standings, video and archived knockout; night pages have history without a bracket",()=>{
 const home=readFileSync("src/components/HomeContent.tsx","utf8"),night=readFileSync("src/components/CompetitionContent.tsx","utf8"),preview=readFileSync("src/components/KnockoutPreview.tsx","utf8");
 assert.ok(home.indexOf('id="next-fixtures"')<home.indexOf('id="standings"'));
 assert.ok(home.indexOf('id="standings"')<home.indexOf('<HomeTvFeature'));
 assert.ok(home.indexOf('<HomeTvFeature')<home.indexOf('<KnockoutPreview'));
 assert.match(home,/\[monday,wednesday\]\.map/);assert.match(night,/previous season/);
 assert.doesNotMatch(night,/KnockoutBracket/);assert.doesNotMatch(preview,/View full knockout stage/);
});
