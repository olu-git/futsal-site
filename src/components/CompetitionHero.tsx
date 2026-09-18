import Image from "next/image";
import { Clock3, MapPin, Users } from "lucide-react";

interface CompetitionHeroProps {
  nightName: string;
  teamCount: number;
  imageSrc?: string;
}

export default function CompetitionHero({
  nightName,
  teamCount,
  imageSrc = "/hero-bg.png",
}: CompetitionHeroProps) {
  return (
    <section className="relative isolate min-h-[28rem] overflow-hidden border-b-4 border-[var(--fis-red)] text-white sm:min-h-[32rem]">
      <Image
        src={imageSrc}
        alt="Futsal match at Endeavour Hills Leisure Centre"
        fill
        priority
        sizes="100vw"
        className="-z-20 object-cover object-center"
      />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(0,24,70,0.94)_0%,rgba(0,35,105,0.76)_55%,rgba(0,24,70,0.58)_100%)]" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(0,0,0,0.1)_0%,rgba(0,20,61,0.35)_100%)]" />

      <div className="fis-container flex min-h-[28rem] items-center py-16 sm:min-h-[32rem] sm:py-20">
        <div className="max-w-5xl">
          <p className="fis-kicker text-white/70">Endeavour Hills Competition</p>
          <h1 className="mt-5 text-[clamp(3rem,9vw,7.5rem)] font-black uppercase leading-[0.88] tracking-[-0.055em] text-white">
            {nightName}
          </h1>

          <div className="mt-9 grid max-w-4xl grid-cols-1 gap-3 sm:grid-cols-3">
            <CompetitionStat
              icon={Users}
              label="Teams"
              value={`${teamCount}`}
            />
            <CompetitionStat
              icon={Clock3}
              label="First kick-off"
              value="From 7 PM"
            />
            <CompetitionStat
              icon={MapPin}
              label="Location"
              value="Endeavour Hills Leisure Centre"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function CompetitionStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-h-24 items-center gap-4 border-2 border-white/35 bg-[var(--fis-blue)]/85 px-4 py-4 backdrop-blur-sm">
      <Icon className="h-5 w-5 shrink-0 text-[var(--fis-red)]" aria-hidden="true" />
      <div className="min-w-0">
        <p className="fis-kicker text-[0.53rem] text-white/55">{label}</p>
        <p className="mt-1 text-sm font-bold uppercase leading-5 text-white">{value}</p>
      </div>
    </div>
  );
}
