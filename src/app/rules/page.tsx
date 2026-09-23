import { ChevronDown, Clock, CreditCard, Disc, Gavel, Hourglass, Play, Shield, Square, Trophy, TriangleAlert, UserPlus, UserX, Users } from "lucide-react";
import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import PageHero from "@/components/PageHero";
import { site } from "@/lib/site-content";

export const metadata = { title: "Rules", description: "Futsal Indoor Soccer competition rules." };
type Rule = { title: string; body: string; icon?: LucideIcon; image?: string };
type RuleGroup = { heading: string; rules: Rule[] };

const groups: { title: string; intro: string; groups: RuleGroup[] }[] = [
  { title: "General Futsal Rules", intro: "Key rules inspired by the official FIFA Futsal Laws of the Game.", groups: [
    { heading: "Players & Equipment", rules: [
      { image: "/logos/FIS-ball-rule.svg", title: "The Ball", body: "A low-bounce size 4 futsal ball is used. Standard outdoor footballs are not used." },
      { icon: Users, title: "The Team", body: "Five players per side, including the goalkeeper. A minimum of three players is required to start a match." },
      { icon: UserPlus, title: "Substitutions", body: "Rolling substitutions are unlimited and may be made during play without a stoppage. Teams must notify the referee of any goalkeeper substitutions." },
    ] },
    { heading: "Match Rules", rules: [
      { icon: Clock, title: "Match Duration", body: "Matches have two 18-minute halves and a one-minute break. Match time is stopped only in exceptional circumstances at the referee’s discretion. Deliberate time-wasting may be carded, and the referee may stop the clock during the final minute depending on its severity." },
      { icon: Play, title: "Kick-off", body: "At kick-off, the ball must move back into the kicking team’s own half. All opposing players have five seconds to return behind the yellow line in their half. If they are not behind the line when the referee completes the countdown, the team taking the kick-off receives an indirect free kick." },
      { icon: Disc, title: "Kick-ins", body: "There are no throw-ins. The ball must be on the sideline and kicked in within four seconds. Failing to restart in time awards possession to the opposition." },
    ] },
    { heading: "Goalkeeper & Fouls", rules: [
      { icon: Shield, title: "Goalkeeper", body: "From a goal clearance, the goalkeeper cannot hold the ball for more than four seconds. Releasing it late awards the opposition an indirect free kick from the top of the penalty area." },
      { icon: TriangleAlert, title: "Accumulated Fouls", body: "Team fouls accumulate throughout the match and do not reset at half-time. From the fifth team foul onward, each additional foul results in a direct penalty kick with no wall." },
      { icon: Square, title: "Cards", body: "A yellow card is a caution. A red card is a dismissal. The dismissed player may be replaced after two minutes of playing time or after the opposition scores, whichever occurs first." },
    ] },
  ] },
  { title: "League Rules", intro: "Rules that apply to all Endeavour Hills Futsal competitions.", groups: [
    { heading: "Before the Match", rules: [
      { icon: CreditCard, title: "Payment Before Kick-off", body: "All match payments must be made before the game begins." },
      { icon: Hourglass, title: "Late Penalty", body: "Teams must be ready at their scheduled kick-off time. A team concedes one goal for every two minutes it is late." },
      { icon: TriangleAlert, title: "Absence & Forfeit", body: "Teams must notify FIS administrators at least 24 hours before kick-off if they cannot attend. Failure to provide notice results in an automatic forfeit, and the team must either pay its weekly match fee or forfeit its bond." },
      { icon: UserX, title: "Forfeits", body: "Forfeits are recorded as 5-0 losses. A team that does not arrive before half-time forfeits. A team also forfeits if it uses a player from another team when it already has five players available." },
      { icon: Trophy, title: "Opponent No-show", body: "If your scheduled opponent does not attend, your team wins 5-0. You may still play and pay the full match fee, or choose not to play." },
      { icon: Shield, title: "Team Bond", body: "Teams cannot play unless FIS holds an active bond for them. Venue and staff costs still apply when a team does not attend, and a forfeited bond must be replaced before the team can play again." },
    ] },
    { heading: "During the Match", rules: [
      { icon: UserX, title: "No Tackle From Behind", body: "Players cannot challenge for the ball from behind, even when the ball is won cleanly. This is called as a foul." },
      { icon: UserPlus, title: "Fill-in Players", body: "During regular-season matches, fill-ins from another team are allowed only when a team is short. The team concedes one goal for each fill-in, may field a maximum of five players and cannot use substitutes. Fill-ins must not be used to significantly strengthen a team." },
    ] },
    { heading: "Discipline", rules: [
      { icon: Gavel, title: "Suspensions", body: "A player shown a red card is dismissed for the remainder of the match. The team may replace them after two minutes or when the opposition scores. Carry-over suspensions vary according to the severity of the offence." },
    ] },
  ] },
  { title: "Knockout & Finals Rules", intro: "Additional rules for knockout-stage matches.", groups: [
    { heading: "Eligibility & Attendance", rules: [
      { icon: UserPlus, title: "Player Eligibility", body: "Players must have played at least five regular-season games for that team. Fill-ins from other teams cannot be used. A team without enough eligible players must contact FIS privately; this may result in a forfeit. Final eligibility decisions are made by the referee and FIS administrators." },
      { icon: UserX, title: "Knockout No-shows", body: "The regular no-show, forfeit and bond rules also apply during knockout matches." },
      { icon: Gavel, title: "Referee Authority", body: "The referee has final say on match decisions and discretion over timekeeping, including whether the clock is stopped in exceptional circumstances." },
    ] },
    { heading: "Deciding Drawn Matches", rules: [
      { icon: Clock, title: "Golden Goal Extra Time", body: "A knockout match drawn at full-time moves to three minutes of Golden Goal extra time. The referee determines which team kicks off, and the first goal ends the match." },
      { icon: Disc, title: "Penalty Shootouts", body: "If the match remains tied, each team takes three penalties alternately. Only players on the court when the shootout begins may take penalties. If scores remain tied, sudden death continues with one penalty per team until one scores and the other misses. No eligible player may take a second penalty until every other eligible teammate has taken one." },
    ] },
  ] },
];

export default function RulesPage() {
  return <><PageHero title="Rules & Regulations" image={site.actionPhoto}><p>Official futsal principles with FIS competition rules.</p></PageHero>
    {groups.map((section) => <section className="rules-section fis-section fis-container" key={section.title}><h2 className="section-title">{section.title}</h2><p className="body-copy">{section.intro}</p><div className="rules-groups">{section.groups.map((group) => <div className="rule-group" key={group.heading}><h3>{group.heading}</h3><div className="rules-grid">{group.rules.map(({ icon: Icon, image, title, body }) => <details className="rule-card" key={title} open><summary>{image ? <Image src={image} alt="" width={20} height={20} aria-hidden="true" /> : Icon && <Icon aria-hidden="true" />}<span>{title}</span><ChevronDown className="rule-chevron" aria-hidden="true" /></summary><p>{body}</p></details>)}</div></div>)}</div></section>)}
  </>;
}
