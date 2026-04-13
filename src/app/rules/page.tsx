"use client";

import { motion } from "framer-motion";
import {
  Users,
  Disc,
  ArrowLeftRight,
  Clock,
  Play,
  Footprints,
  Ban,
  Shield,
  TriangleAlert,
  Square,
  Hourglass,
  BellOff,
  CircleX,
  Banknote,
  UserX,
  UserPlus,
  Trophy,
  Gavel,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";

interface RuleCard {
  icon: LucideIcon;
  title: string;
  description: string;
  badge?: string;
}

interface RuleGroup {
  label: string;
  cards: RuleCard[];
}

const fifaGroups: RuleGroup[] = [
  {
    label: "Players & Equipment",
    cards: [
      {
        icon: Users,
        title: "The Team",
        description:
          "5 players per side including goalkeeper. Minimum 3 players required to start a match.",
      },
      {
        icon: Disc,
        title: "The Ball",
        description:
          "Size 4 futsal ball with low bounce. Standard outdoor footballs are not used.",
      },
      {
        icon: ArrowLeftRight,
        title: "Substitutions",
        description:
          "Rolling subs, unlimited, made on the fly during play. No stoppage required.",
      },
    ],
  },
  {
    label: "Match Rules",
    cards: [
      {
        icon: Clock,
        title: "Match Duration",
        description:
          "Two 18-minute halves with a 1-minute break. Running clock — no pauses except for exceptional circumstances.",
      },
      {
        icon: Play,
        title: "Kick-off",
        description:
          "At kick-off, the ball must move back into the kicking team's own half. The opposing team must remain behind their yellow line until the ball is played.",
      },
      {
        icon: Footprints,
        title: "Kick-ins",
        description:
          "No throw-ins. Ball is kicked in from the sideline within 4 seconds. Ball must be on the line. Failure to kick in time awards possession to the opposition.",
      },
      {
        icon: Ban,
        title: "No Offside",
        description: "There is no offside rule in futsal.",
      },
    ],
  },
  {
    label: "Goalkeeper & Fouls",
    cards: [
      {
        icon: Shield,
        title: "Goalkeeper",
        description:
          "Cannot hold the ball, from a goalkick, for more than 4 seconds. Releasing late awards the opposition an indirect free kick from the top of the penalty area.",
      },
      {
        icon: TriangleAlert,
        title: "Accumulated Fouls",
        description:
          "5+ team fouls per half result in a direct penalty kick with no wall.",
      },
      {
        icon: Square,
        title: "Cards",
        description:
          "Yellow = caution. Red = dismissal. Player may be replaced after 2 minutes of playing time or after the opposition scores — whichever comes first.",
      },
    ],
  },
];

const leagueGroups: RuleGroup[] = [
  {
    label: "Before the Match",
    cards: [
      {
        icon: Hourglass,
        title: "Late Penalty",
        description:
          "Teams are deducted 1 goal for every 2 minutes they are late, up to a maximum deficit of 5-0.",
      },
      {
        icon: BellOff,
        title: "Team Absence",
        description:
          "Teams must notify Futsal Admin staff at least 24 hours before kick-off. Failure to notify within this window results in an automatic forfeit and the team must pay their weekly match fee.",
      },
      {
        icon: CircleX,
        title: "Forfeits",
        description:
          "Forfeits are recorded as 5-0 losses. Teams that do not arrive before half-time automatically forfeit the game.",
      },
      {
        icon: Banknote,
        title: "Forfeit Bond",
        description:
          "If a forfeit occurs, the forfeiting team forfeits their bond for that week to cover the cost of not showing up. The team is unable to play again until the bond is paid.",
      },
    ],
  },
  {
    label: "During the Match",
    cards: [
      {
        icon: UserX,
        title: "No Tackle From Behind",
        description:
          "Players cannot challenge for the ball from behind — even if the ball is won cleanly. This will be called as a foul.",
        badge: "League Rule",
      },
      {
        icon: UserPlus,
        title: "Fill-in Players",
        description:
          "Teams short on players may use fill-ins from other teams to reach a maximum of 5 players. No substitutions are allowed when using fill-ins. The team concedes 1 goal for each fill-in player used.",
      },
    ],
  },
  {
    label: "Eligibility & Finals",
    cards: [
      {
        icon: Trophy,
        title: "Semi-Finals & Finals",
        description:
          "To play in the semi-finals and finals, players must have appeared in at least 5 games for their team across the regular season.",
      },
      {
        icon: Gavel,
        title: "Suspensions",
        description:
          "In-game red card: player is out for the remainder of the match; team may replace after 2 minutes or when opposition scores. Between matches: carry-over bans vary in length depending on the severity of the offence.",
      },
    ],
  },
];

function RuleCardComponent({
  card,
  index,
}: {
  card: RuleCard;
  index: number;
}) {
  const Icon = card.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="rounded-lg border border-white/10 bg-[#1A1A1A] p-5 flex flex-col gap-3"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="w-9 h-9 rounded-md bg-red-500/10 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-red-500" />
        </div>
        {card.badge && (
          <span className="text-[10px] font-[family-name:var(--font-geist-mono)] uppercase tracking-wider bg-blue-500/10 text-blue-400 rounded px-2 py-0.5 leading-tight mt-1">
            {card.badge}
          </span>
        )}
      </div>
      <div>
        <p className="text-sm font-semibold text-white mb-1">{card.title}</p>
        <p className="text-sm text-white/55 leading-relaxed font-[family-name:var(--font-sans)]">
          {card.description}
        </p>
      </div>
    </motion.div>
  );
}

function RuleGroupSection({
  group,
  baseIndex,
}: {
  group: RuleGroup;
  baseIndex: number;
}) {
  return (
    <div className="mb-10 last:mb-0">
      <p className="font-[family-name:var(--font-geist-mono)] text-xs tracking-widest text-white/35 uppercase mb-4">
        {group.label}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {group.cards.map((card, i) => (
          <RuleCardComponent key={card.title} card={card} index={baseIndex + i} />
        ))}
      </div>
    </div>
  );
}

export default function RulesPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden min-h-[360px] flex items-center justify-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/hero-bg.png')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0AEE] via-[#0A0A0A99] to-[#0A0A0ACC]" />

        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center"
          >
            <h1
              className="font-[family-name:var(--font-heading)] text-6xl sm:text-7xl lg:text-8xl uppercase tracking-wider text-white leading-none"
            >
              Rules &amp; Regulations
            </h1>
            <p className="mt-5 text-white/50 text-sm font-[family-name:var(--font-geist-mono)] max-w-md">
              Based on official FIFA Futsal rules, with some league-specific variations.
            </p>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-600" />
      </section>

      {/* FIFA Futsal Rules */}
      <section className="bg-[#0A0A0A] py-20 sm:py-[80px]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14">
            <SectionHeading
              title="FIFA Futsal Rules"
              subtitle="Key rules from the official FIFA Futsal Laws of the Game"
            />
          </div>
          {fifaGroups.map((group, gi) => (
            <RuleGroupSection
              key={group.label}
              group={group}
              baseIndex={gi * 3}
            />
          ))}
        </div>
      </section>

      {/* League Rules */}
      <section className="bg-[#111111] py-20 sm:py-[80px]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14">
            <SectionHeading
              title="League Rules"
              subtitle="Specific rules that apply to all Endeavour Hills Futsal competitions"
            />
          </div>
          {leagueGroups.map((group, gi) => (
            <RuleGroupSection
              key={group.label}
              group={group}
              baseIndex={gi * 3}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
