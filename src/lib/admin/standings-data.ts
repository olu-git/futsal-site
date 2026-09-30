import {createClient} from "@/lib/supabase/browser";
import type{AdminStanding,StandingAdjustment}from "./standings";
type Row=Record<string,unknown>;
export type StandingEdition={id:string;night:"monday"|"wednesday";division:string;label:string;season:string};
export type StandingsWorkspace={editions:StandingEdition[];standings:AdminStanding[];adjustments:StandingAdjustment[]};
const one=<T>(v:T|T[])=>Array.isArray(v)?v[0]:v;
export async function loadStandingsWorkspace():Promise<StandingsWorkspace>{const s=createClient();const[e,t,st,a]=await Promise.all([
 s.from("competition_seasons").select("id,competitions(name,weekday,division),seasons(name)").eq("publication_state","published"),
 s.from("teams").select("id,competition_season_id,name,kit_colour"),s.from("standings").select("*"),
 s.from("standing_adjustments").select("*").order("created_at",{ascending:false})]);
 for(const r of[e,t,st,a])if(r.error)throw new Error(`Unable to load standings management: ${r.error.message}`);
 const editions=(e.data??[]).map((r:Row)=>{const c=one(r.competitions as Row|Row[]),season=one(r.seasons as Row|Row[]);return{id:String(r.id),night:Number(c.weekday)===1?"monday":"wednesday",division:String(c.division),label:String(c.name),season:String(season.name)}as StandingEdition});
 const teams=new Map((t.data??[]).map((r:Row)=>[String(r.id),r]));
 const standings=(st.data??[]).map((r:Row)=>{const team=teams.get(String(r.team_id));if(!team)throw new Error(`Standing ${String(r.team_id)} has no team profile.`);return{competitionSeasonId:String(r.competition_season_id),teamId:String(r.team_id),teamName:String(r.team_name),kitColour:team.kit_colour as string|null,position:Number(r.position),played:Number(r.played),wins:Number(r.wins),draws:Number(r.draws),losses:Number(r.losses),goalsFor:Number(r.goals_for),goalsAgainst:Number(r.goals_against),goalDifference:Number(r.goal_difference),points:Number(r.points)}as AdminStanding});
 const adjustments=(a.data??[]).map((r:Row)=>({id:String(r.id),competitionSeasonId:String(r.competition_season_id),teamId:String(r.team_id),reason:String(r.reason),state:r.publication_state as StandingAdjustment["state"],kind:(r.adjustment_kind??"standard")as StandingAdjustment["kind"],supersedesId:r.supersedes_adjustment_id?String(r.supersedes_adjustment_id):null,version:Number(r.version??1),createdAt:String(r.created_at),delta:{played:Number(r.played_delta),wins:Number(r.wins_delta),draws:Number(r.draws_delta),losses:Number(r.losses_delta),goalsFor:Number(r.goals_for_delta),goalsAgainst:Number(r.goals_against_delta),points:Number(r.points_delta)}}));return{editions,standings,adjustments}}
